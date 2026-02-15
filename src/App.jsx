import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [userGarment, setUserGarment] = useState(null); 
  const [garmentType, setGarmentType] = useState("Top"); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [closet, setCloset] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(null);

  const [suggestion, setSuggestion] = useState(null);
  const [weather, setWeather] = useState("Detecting weather...");
  const [destination, setDestination] = useState("the Office");

  // FIX: Avatar Selection State with names matching your "public" folder screenshot
  const [activeAvatar, setActiveAvatar] = useState(null); 
  const avatars = [
    { id: 'standard', name: 'Classic Fit', path: '/My Avatar.jpg' },
    { id: 'pear', name: 'Pear Shape', path: '/My Avatar 3.jpg' }, // Updated to match Screenshot (241)
    { id: 'slim', name: 'Slim Shape', path: '/My Avatar 2.jpg' },
  ];

  // 1. AUTO-WEATHER DETECTION
  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const temp = data.current_weather.temperature;
        setWeather(`Current Local Weather: ${temp}°C`);
      } catch (err) {
        setWeather("Weather unavailable (check connection)");
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setWeather("Location access denied")
    );
  }, []);

  const fileToPart = async (fileOrUrl) => {
    let data;
    let mimeType = "image/jpeg";
    if (typeof fileOrUrl === "string") {
      const response = await fetch(fileOrUrl);
      data = await response.arrayBuffer();
    } else {
      data = await fileOrUrl.arrayBuffer();
      mimeType = fileOrUrl.type;
    }
    return {
      inlineData: { data: btoa(String.fromCharCode(...new Uint8Array(data))), mimeType },
    };
  };

  const runVirtualTryOn = async (garmentToUse) => {
    if (!activeAvatar) return;
    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.7 } 
      });

      const avatarPart = await fileToPart(activeAvatar.path);
      const garmentPart = await fileToPart(garmentToUse);

      const prompt = "TASK: Virtual Try-On. Dress the person in the first image with the clothing from the second image. Keep the face and background exactly the same.";

      const result = await model.generateContent([prompt, avatarPart, garmentPart]);
      const response = await result.response;
      const candidate = response.candidates && response.candidates[0];
      
      if (candidate?.content?.parts) {
        const imagePart = candidate.content.parts.find(p => p.inlineData);
        if (imagePart) {
          setProcessedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("AI Try-On failed. Check your API key and network.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getAISuggestion = async () => {
    if (closet.length === 0) return alert("Your closet is empty! Upload clothes first.");
    
    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
      const imageParts = await Promise.all(closet.map(item => fileToPart(item.image)));

      const prompt = `
        You are the VARA AI Stylist. 
        Context: The weather is ${weather} and the user is going to ${destination}.
        Task: Analyze the provided images of clothes the user OWNS.
        
        1. Identify the BEST item for this context. 
        2. Describe the item professionally.
        3. Explain why this choice is perfect.
        4. Crucially: End your entire response with only the text "INDEX:[number]" where number is the index of the chosen image.
      `;

      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();
      setSuggestion(text.split("INDEX:")[0].trim());

      const match = text.match(/INDEX:(\d+)/);
      if (match) {
        const index = parseInt(match[1]);
        if (closet[index]) {
          await runVirtualTryOn(closet[index].image);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Stylist is offline.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToShelf = () => {
    if (!userGarment) return;
    setCloset([...closet, {
      id: Date.now(),
      image: userGarment,
      previewUrl: URL.createObjectURL(userGarment),
      type: garmentType
    }]);
    setUserGarment(null);
  };

  // --- POSITIVE SELECTION SCREEN ---
  if (!activeAvatar) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#2D3436' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Welcome to VARA</h1>
        <p style={{ color: '#636E72', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
          At VARA, we lead with positivity. Every body is a fashion body. 
          Select a profile to start your personalized styling journey.
        </p>
        
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
          {avatars.map(av => (
            <div 
              key={av.id} 
              onClick={() => setActiveAvatar(av)}
              style={{ cursor: 'pointer', padding: '20px', border: '2px solid #f1f2f6', borderRadius: '24px', background: '#fff', transition: '0.3s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#4ECDC4'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#f1f2f6'}
            >
              <img src={av.path} style={{ width: '150px', height: '220px', objectFit: 'cover', borderRadius: '15px' }} alt={av.name} />
              <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{av.name}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '40px', color: '#B2BEC3', fontStyle: 'italic' }}>
          More body shapes are being added soon as VARA grows!
        </p>
      </div>
    );
  }

  // --- MAIN APP INTERFACE ---
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: '#2D3436' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>VARA: AI Personal Stylist</h1>
        <button onClick={() => {setActiveAvatar(null); setProcessedImage(null);}} style={{ background: '#f1f2f6', border: 'none', borderRadius: '20px', padding: '8px 15px', cursor: 'pointer' }}>Switch Profile</button>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'flex-start' }}>
        
        {/* LEFT: AVATAR */}
        <div>
          <div style={{ position: 'relative', width: '280px', height: '420px', borderRadius: '24px', overflow: 'hidden', border: '6px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            {isGenerating && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4ECDC4' }}>
                VARA IS STITCHING...
              </div>
            )}
            <img src={processedImage || activeAvatar.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
          </div>
          
          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '15px' }}>
            <p>🌍 <strong>{weather}</strong></p>
            <p>📍 <strong>Going to:</strong> <input value={destination} onChange={e => setDestination(e.target.value)} style={{ border: 'none', background: 'none', borderBottom: '1px dashed #ccc', width: '120px' }} /></p>
            <button onClick={getAISuggestion} disabled={isGenerating} style={{ width: '100%', padding: '10px', backgroundColor: '#4ECDC4', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              GET AI SUGGESTION
            </button>
          </div>
        </div>

        {/* CENTER: CLOSET */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          {suggestion && (
            <div style={{ background: '#e8f8f7', padding: '20px', borderRadius: '15px', marginBottom: '20px', borderLeft: '5px solid #4ECDC4' }}>
              <strong>VARA's Tip:</strong> {suggestion}
            </div>
          )}
          <h3>My Virtual Shelf</h3>
          {['Top', 'Bottom', 'Dress'].map(category => (
            <div key={category} style={{ marginBottom: '20px' }}>
              <strong style={{ color: '#4ECDC4' }}>{category}s</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {closet.filter(i => i.type === category).map(item => (
                  <img key={item.id} src={item.previewUrl} onClick={() => setSelectedItem(item)} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: selectedItem?.id === item.id ? '2px solid #4ECDC4' : 'none' }} alt="Item" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: UPLOAD */}
        <div style={{ width: '250px' }}>
          <div style={{ background: '#2D3436', color: 'white', padding: '15px', borderRadius: '20px' }}>
            <h4>Add New Item</h4>
            <input type="file" accept="image/*" onChange={(e) => { if(e.target.files[0]) setUserGarment(e.target.files[0]) }} style={{ width: '100%' }} />
            <select value={garmentType} onChange={(e) => setGarmentType(e.target.value)} style={{ width: '100%', margin: '10px 0' }}>
              <option value="Top">Top</option>
              <option value="Bottom">Bottom</option>
              <option value="Dress">Dress</option>
            </select>
            <button onClick={addToShelf} disabled={!userGarment} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>Save to Closet</button>
          </div>
        </div>

      </div>
    </div>
  );
}