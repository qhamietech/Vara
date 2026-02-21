import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Shirt, ShoppingBag, Footprints, Watch, Glasses, GraduationCap, CloudSun, Plus, X,
  ChevronLeft, Triangle, CheckCircle, Sparkles,
  User, Settings, RotateCcw, MapPin, Zap, ZapOff, Sun, CloudRain
} from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const baseAvatars = [
  { id: 'standard', name: 'Classic Fit', path: '/My Avatar.jpg' },
  { id: 'pear', name: 'Pear Shape', path: '/My Avatar 2.jpg' },
  { id: 'slim', name: 'Curvy Shape', path: '/My Avatar 3.jpg' },
];

export default function App() {
  // UI State
  const [activeAvatar, setActiveAvatar] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showVaraAI, setShowVaraAI] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoadshedding, setIsLoadshedding] = useState(false);

  // Logic & AI State
  const [userGarment, setUserGarment] = useState(null);
  const [uploadTarget, setUploadTarget] = useState("Tops");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [processedImage, setProcessedImage] = useState(null);
  const [shoeImage, setShoeImage] = useState(null);
  const [closetData, setClosetData] = useState({
    "Tops": [], "Bottoms": [], "Dresses": [],
    "Shoes": [], "Bags": [], "Accessories": [],
    "Jewelry": [], "Hats": [], "Outerwear": []
  });
  const [weather, setWeather] = useState({ temp: 24, condition: 'Sunny', windSpeed: 15 });
  const [destination, setDestination] = useState("");
  const [suggestionText, setSuggestionText] = useState("");

  // Avatar position/scale
  const [scale, setScale] = useState(64);
  const [posX, setPosX] = useState(33);
  const [posY, setPosY] = useState(3);

  const categories = Object.keys(closetData);

  // Fetch weather on mount
  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        setWeather({
          temp: data.current_weather.temperature,
          condition: data.current_weather.weathercode < 3 ? 'Sunny' : 'Cloudy',
          windSpeed: data.current_weather.windspeed
        });
      } catch (err) { console.error("Weather error", err); }
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => console.log("Location denied")
    );
  }, []);

  // Auto-dismiss notifications after 2 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 2000);
    return () => clearTimeout(timer);
  }, [notification]);

  // AI HELPERS

  const fileToPart = async (fileOrUrl) => {
    let blob;
    let mimeType = "image/jpeg";
    if (typeof fileOrUrl === "string") {
      const response = await fetch(fileOrUrl);
      blob = await response.blob();
    } else {
      blob = fileOrUrl;
      mimeType = fileOrUrl.type;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ inlineData: { data: reader.result.split(',')[1], mimeType } });
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // remove.bg API for pixel-perfect background removal (handles white outfits)
  const removeBackgroundWithAPI = async (imageSrc) => {
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('image_file', blob, 'avatar.png');
      formData.append('size', 'auto');
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': import.meta.env.VITE_REMOVEBG_API_KEY },
        body: formData,
      });
      if (!response.ok) throw new Error('remove.bg failed: ' + response.status);
      const resultBlob = await response.blob();
      return URL.createObjectURL(resultBlob);
    } catch (e) {
      console.error('remove.bg error, falling back to canvas method:', e);
      return fallbackRemoveWhite(imageSrc);
    }
  };

  // Fallback: 8-directional edge flood-fill for when remove.bg is unavailable
  const fallbackRemoveWhite = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
        const bgMask = new Uint8Array(w * h);
        const visited = new Uint8Array(w * h);
        const queue = [];
        const isNearWhite = (pIdx) => data[pIdx] > 215 && data[pIdx + 1] > 215 && data[pIdx + 2] > 215;
        const tryEnqueue = (x, y) => {
          if (x < 0 || y < 0 || x >= w || y >= h) return;
          const idx = y * w + x;
          if (visited[idx]) return;
          visited[idx] = 1;
          if (isNearWhite(idx * 4)) { bgMask[idx] = 1; queue.push(idx); }
        };
        for (let x = 0; x < w; x++) { tryEnqueue(x, 0); tryEnqueue(x, h - 1); }
        for (let y = 0; y < h; y++) { tryEnqueue(0, y); tryEnqueue(w - 1, y); }
        while (queue.length > 0) {
          const idx = queue.pop();
          const x = idx % w, y = Math.floor(idx / w);
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
              if (dx !== 0 || dy !== 0) tryEnqueue(x + dx, y + dy);
        }
        for (let i = 0; i < w * h; i++) {
          if (bgMask[i]) data[i * 4 + 3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageSrc;
    });
  };

  // Single-garment try-on (fallback path)
  const runVirtualTryOn = async (garmentToUse, baseImage) => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.4 }
      });
      const avatarPart = await fileToPart(baseImage);
      const garmentPart = await fileToPart(garmentToUse);
      const prompt = `TASK: Virtual Try-On clothing overlay only.
STRICT IDENTITY RULES - these override everything else:
- The person in Image 1 is the ONLY person allowed in the output. Do NOT generate a new or different person.
- Preserve EXACTLY: their face, skin tone, hair color, hair style, hair length, body shape, height, and all physical features.
- Do NOT alter, beautify, reshape, or reimagine the person in any way whatsoever.
- Simply place the clothing from Image 2 onto the exact person from Image 1 as if digitally dressing them.
- Output ONLY the person on a completely plain solid white background. No room, furniture, or scenery.`;
      const result = await model.generateContent([prompt, avatarPart, garmentPart]);
      const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (imagePart) {
        const rawImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        return await removeBackgroundWithAPI(rawImage);
      }
    } catch (e) { console.error(e); }
    return null;
  };

  // VARA AI STYLIST

  const askVaraSuggestion = async () => {
    const allItems = Object.values(closetData).flat();
    if (allItems.length === 0) return setNotification({ msg: "Closet is empty!" });

    setIsProcessing(true);
    setStatusMessage("VARA IS ANALYZING...");
    setShowVaraAI(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

      // Build structured inventory with category labels
      const inventory = [];
      Object.entries(closetData).forEach(([cat, items]) => {
        items.forEach(item => inventory.push({ cat, url: item.url }));
      });

      const imageParts = await Promise.all(inventory.slice(0, 15).map(i => fileToPart(i.url)));
      const inventoryList = inventory.slice(0, 15).map((item, idx) => `INDEX:${idx} [${item.cat}]`).join(', ');

      const prompt = `You are VARA, an expert AI stylist.

CLOSET INVENTORY (each item labeled with its category):
${inventoryList}

OUTFIT RULES - follow strictly:
1. NEVER combine a Dress with Tops or Bottoms - a dress is a complete outfit on its own.
2. NEVER combine two Bottoms or two Tops together.
3. Valid outfit = Dress only OR Top + Bottom - both optionally with Shoes, Bags, Accessories, Jewelry, Hats, Outerwear.
4. Only pick items that exist in the inventory above.
5. Weather: ${weather.temp}C. Destination: "${destination || 'casual outing'}".

Write a short 2-sentence style note, then list ONLY the selected indices like: SELECTED: INDEX:0, INDEX:3, INDEX:7`;

      setStatusMessage("VARA IS STYLING...");
      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();
      setSuggestionText((text.split("SELECTED:")[0] || text.split("INDEX:")[0]).trim());

      const matches = [...text.matchAll(/INDEX:(\d+)/g)];
      if (matches.length > 0) {
        // Shoes are displayed as a separate cutout beside the avatar, not worn
        // This prevents the AI from changing the avatar's legs/feet/identity
        const wearable = ['Tops', 'Bottoms', 'Dresses', 'Outerwear'];
        const wearableItems = matches
          .map(m => inventory[parseInt(m[1])]).filter(Boolean)
          .filter(item => wearable.includes(item.cat));

        // Extract selected shoe separately for cutout display
        const selectedShoe = matches
          .map(m => inventory[parseInt(m[1])]).filter(Boolean)
          .find(item => item.cat === 'Shoes');
        if (selectedShoe) {
          setStatusMessage("PROCESSING SHOES...");
          const cleanShoe = await removeBackgroundWithAPI(selectedShoe.url);
          if (cleanShoe) setShoeImage(cleanShoe);
        } else {
          setShoeImage(null);
        }

        if (wearableItems.length > 0) {
          // SPEED: Single AI call with all garments at once
          setStatusMessage("GENERATING LOOK...");
          const tryOnModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
            generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.4 }
          });
          const avatarPart = await fileToPart(activeAvatar.path);
          const garmentParts = await Promise.all(wearableItems.map(item => fileToPart(item.url)));
          const garmentDescriptions = wearableItems.map((item, i) => `Image ${i + 2}: ${item.cat}`).join(', ');

          const combinedPrompt = `TASK: Virtual Try-On clothing overlay only.
STRICT IDENTITY RULES - these override everything else:
- The person in Image 1 is the ONLY person allowed in the output. Do NOT generate a new or different person.
- Preserve EXACTLY: their face, skin tone, hair color, hair style, hair length, body shape, height, and ALL physical features without exception.
- Do NOT alter, beautify, reshape, or reimagine the person in any way. Their appearance must be identical to Image 1 except for the clothing.
- Simply place the following clothing items onto the exact person from Image 1 as if digitally dressing them: ${garmentDescriptions}.
- Style them as one cohesive outfit.
- Output ONLY the person on a completely plain solid white background. No room, furniture, scenery, or props of any kind.`;

          const resultImg = await tryOnModel.generateContent([combinedPrompt, avatarPart, ...garmentParts]);
          const imagePart = resultImg.response.candidates[0].content.parts.find(p => p.inlineData);
          if (imagePart) {
            setStatusMessage("FINISHING...");
            const rawImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            const cleanImage = await removeBackgroundWithAPI(rawImage);
            if (cleanImage) setProcessedImage(cleanImage);
          }
        }
      }
      setNotification({ msg: "Look Generated!" });
    } catch (error) {
      console.error(error);
      setNotification({ msg: "Stylist error" });
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // UI HANDLERS

  const addToShelf = () => {
    if (!userGarment) return;
    const url = URL.createObjectURL(userGarment);
    setClosetData(prev => ({
      ...prev,
      [uploadTarget]: [...prev[uploadTarget], { id: Date.now(), url }]
    }));
    setUserGarment(null);
    setShowUploadPanel(false);
    setNotification({ msg: `Added to ${uploadTarget}` });
  };

  const resetSettings = () => {
    setScale(64);
    setPosX(33);
    setPosY(3);
    setProcessedImage(null);
    setShoeImage(null);
    setSuggestionText("");
  };

  const iconMap = {
    "Dresses": (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '6px', height: '4px', border: '1.5px solid currentColor', borderBottom: 'none', borderRadius: '2px 2px 0 0' }} />
        <Triangle size={12} style={{ marginTop: '-2px' }} />
      </div>
    ),
    "Tops": <Shirt size={14} />,
    "Bottoms": (
      <div style={{ display: 'flex', gap: '1px' }}>
        <div style={{ width: '5px', height: '12px', border: '1.5px solid currentColor', borderRadius: '1px' }} />
        <div style={{ width: '5px', height: '12px', border: '1.5px solid currentColor', borderRadius: '1px' }} />
      </div>
    ),
    "Shoes": <Footprints size={14} />,
    "Bags": <ShoppingBag size={14} />,
    "Accessories": <Glasses size={14} />,
    "Jewelry": <Watch size={14} />,
    "Hats": <GraduationCap size={14} />,
    "Outerwear": <CloudSun size={14} />
  };

  // RENDER

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#111', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '430px', height: '90%',
        maxHeight: '932px', backgroundImage: 'url("/room-bg.png")',
        backgroundSize: '100% 100%', overflow: 'hidden', borderRadius: '40px',
        border: isLoadshedding ? '2px solid #FFA500' : 'none',
        transition: '0.5s'
      }}>

        {isLoadshedding && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 2, mixBlendMode: 'multiply' }} />
        )}

        {/* Avatar Selection Screen */}
        {!activeAvatar && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', color: '#B19CD9', margin: '0 0 10px 0' }}>VARA</h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '40px' }}>Select your profile to begin.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {baseAvatars.map(av => (
                <div key={av.id} onClick={() => setActiveAvatar(av)} style={{ cursor: 'pointer' }}>
                  <div style={{ width: '100px', height: '150px', borderRadius: '15px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                    <img src={av.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{av.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main App */}
        {activeAvatar && (
          <>
            {/* Top Left Controls */}
            <div style={{ position: 'absolute', top: '30px', left: '25px', zIndex: 30, display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setActiveAvatar(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                <User size={18} />
              </button>
              <button onClick={() => setShowVaraAI(true)} style={{ background: '#B19CD9', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> ASK VARA
              </button>
              {processedImage && (
                <button onClick={resetSettings} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }} title="Reset outfit">
                  <RotateCcw size={18} />
                </button>
              )}
            </div>

            {/* Top Right: Weather + Loadshedding */}
            <div style={{ position: 'absolute', top: '30px', right: '25px', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                {weather.condition === 'Sunny' ? <Sun size={14} /> : <CloudRain size={14} />}
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{weather.temp}°C</span>
              </div>
              <button onClick={() => setIsLoadshedding(!isLoadshedding)} style={{ background: isLoadshedding ? '#FFA500' : 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isLoadshedding ? <ZapOff size={12} /> : <Zap size={12} />}
              </button>
            </div>

            {/* Shoe Cutout — displayed on the rug beside the avatar */}
            {shoeImage && (
              <div style={{
                position: 'absolute', bottom: '2%', left: '18%',
                width: '18%', zIndex: 6, pointerEvents: 'none',
                filter: isLoadshedding ? 'brightness(0.7)' : 'none',
                transition: '0.8s'
              }}>
                <img src={shoeImage} style={{ width: '100%', height: 'auto', objectFit: 'contain', transform: 'rotate(-20deg)' }} />
              </div>
            )}

            {/* Avatar Display */}
            <div style={{ position: 'absolute', bottom: `${posY}%`, left: `${posX}%`, transform: 'translateX(-50%)', width: '100%', height: `${scale}%`, zIndex: 5, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', transition: '0.8s' }}>
              <img
                src={processedImage || activeAvatar.path}
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: isLoadshedding ? 'brightness(0.7)' : 'none',
                  mixBlendMode: 'normal'
                }}
              />
              {isProcessing && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.3)', pointerEvents: 'auto' }}>
                  <Sparkles size={48} color="#B19CD9" className="animate-pulse" />
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#B19CD9', marginTop: '8px' }}>{statusMessage}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* VARA Suggestion Card */}
        {suggestionText && (
          <div style={{ position: 'absolute', bottom: '130px', left: '20px', right: '20px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '15px', zIndex: 30, border: '1.5px solid #B19CD9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: "#B19CD9" }}>VARA'S LOOK</span>
              <X size={14} onClick={() => setSuggestionText("")} style={{ cursor: 'pointer' }} />
            </div>
            <p style={{ fontSize: '10px', color: '#444', margin: 0 }}>{suggestionText}</p>
          </div>
        )}

        {/* Closet Shelf Grid */}
        <div style={{ position: 'absolute', top: '30.3%', right: '8.2%', width: '33%', height: '33%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '4px', zIndex: 10 }}>
          {categories.map((cat) => (
            <div key={cat} onClick={() => setSelectedCategory(cat)} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', borderRadius: '6px', border: '0.5px solid rgba(255,255,255,0.2)' }}>
              {closetData[cat].length > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#B19CD9', color: 'white', fontSize: '7px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
                  {closetData[cat].length}
                </div>
              )}
              <div style={{ color: closetData[cat].length > 0 ? '#B19CD9' : '#fff' }}>{iconMap[cat]}</div>
              <span style={{ fontSize: '6px', fontWeight: '900', color: '#63479B' }}>{cat.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button onClick={() => setShowUploadPanel(true)} style={{ position: 'absolute', bottom: '30px', right: '30px', width: '50px', height: '50px', background: '#B19CD9', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={24} />
        </button>

        {/* VARA AI Modal */}
        {showVaraAI && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', width: '100%', borderRadius: '30px', padding: '30px', position: 'relative' }}>
              <X size={20} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} onClick={() => setShowVaraAI(false)} />
              <h3 style={{ margin: '0 0 10px 0' }}>Where are we going?</h3>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <MapPin size={16} color="#B19CD9" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Office, Dinner..."
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '15px', border: '1.5px solid #eee', boxSizing: 'border-box' }}
                />
              </div>
              <button onClick={askVaraSuggestion} style={{ width: '100%', background: '#B19CD9', color: 'white', border: 'none', borderRadius: '15px', padding: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                GENERATE OUTFIT
              </button>
            </div>
          </div>
        )}

        {/* Upload Panel Modal */}
        {showUploadPanel && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', width: '100%', borderRadius: '30px', padding: '24px', position: 'relative' }}>
              <X size={20} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} onClick={() => setShowUploadPanel(false)} />
              <h3 style={{ margin: '0 0 16px 0' }}>New Item</h3>
              <select value={uploadTarget} onChange={(e) => setUploadTarget(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '10px', border: '1.5px solid #eee' }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setUserGarment(e.target.files[0])} style={{ width: '100%' }} />
              <button onClick={addToShelf} style={{ width: '100%', background: '#B19CD9', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
                SAVE TO CLOSET
              </button>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '10px 18px', borderRadius: '25px', zIndex: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #B19CD9', whiteSpace: 'nowrap' }}>
            <CheckCircle size={16} color="#B19CD9" />
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{notification.msg}</span>
          </div>
        )}

        {/* Category Viewer Modal */}
        {selectedCategory && (
          <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 400, padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={() => setSelectedCategory(null)}>
                <ChevronLeft size={20} />
                <h2 style={{ margin: 0 }}>{selectedCategory}</h2>
              </div>
              <X size={20} onClick={() => setSelectedCategory(null)} style={{ cursor: 'pointer' }} />
            </div>
            {closetData[selectedCategory].length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>No items yet. Add some!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {closetData[selectedCategory].map(item => (
                  <div key={item.id} style={{ height: '100px', background: '#f9f9f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={item.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
