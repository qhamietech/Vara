'use client';
import { useState, useEffect } from 'react';
import ClothingUpload from '@/components/ClothingUpload';
import { Shirt, ThermometerSun, Palette, Trash2, LayoutGrid, Sparkles, MapPin } from 'lucide-react';

export default function Home() {
  const [closet, setCloset] = useState<any[]>([]);
  const [temp, setTemp] = useState<number>(20); // Default temperature
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Persistence: Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vara_closet');
    if (saved) {
      try {
        setCloset(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse closet data", e);
      }
    }
  }, []);

  // NEW: Real-time Weather Integration
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        if (data.current_weather) {
          setTemp(Math.round(data.current_weather.temperature));
        }
      } catch (error) {
        console.error("Weather fetch failed", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Location access denied by user.");
        }
      );
    }
  }, []);

  // Recommendation Logic: Runs whenever closet or temperature changes
  useEffect(() => {
    if (closet.length === 0) {
      setSuggestion(null);
      return;
    }

    // Algorithm: Match temperature to warmth score
    const match = closet.find(item => {
      const warmth = Number(item.warmth);
      if (temp < 10) return warmth >= 7;
      if (temp >= 10 && temp <= 22) return warmth >= 4 && warmth <= 6;
      return warmth <= 3;
    });

    setSuggestion(match || closet[0]);
  }, [temp, closet]);

  const addToCloset = (newItem: any) => {
    const updatedCloset = [newItem, ...closet];
    setCloset(updatedCloset);
    localStorage.setItem('vara_closet', JSON.stringify(updatedCloset));
  };

  const deleteItem = (index: number) => {
    const updatedCloset = closet.filter((_, i) => i !== index);
    setCloset(updatedCloset);
    localStorage.setItem('vara_closet', JSON.stringify(updatedCloset));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-200 shadow-sm">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">VARA</h1>
        <p className="text-slate-500 text-sm mt-1 italic">Your style, logic-powered.</p>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
        
        {/* VARA Style Intelligence Bar */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-200" />
              <h2 className="text-lg font-bold">Vara Suggests</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/10">
              {loadingWeather ? (
                <span className="text-[10px] font-bold uppercase animate-pulse">Syncing...</span>
              ) : (
                <MapPin size={12} className="text-blue-200" />
              )}
              <input 
                type="number" 
                value={temp} 
                onChange={(e) => setTemp(Number(e.target.value))}
                className="bg-transparent w-8 text-center font-bold focus:outline-none"
              />
              <span className="text-sm font-medium">°C</span>
            </div>
          </div>

          {suggestion ? (
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
              <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest mb-1">Optimal Match</p>
              <h3 className="text-xl font-bold capitalize">{suggestion.colorFamily} {suggestion.category}</h3>
              <p className="text-sm text-blue-50 opacity-90 mt-1 line-clamp-2 italic">"{suggestion.description}"</p>
            </div>
          ) : (
            <p className="text-sm text-blue-100 italic">Add clothes to your closet to see AI recommendations.</p>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shirt className="text-blue-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">New Addition</h2>
          </div>
          <ClothingUpload onSave={addToCloset} />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <ThermometerSun className="text-orange-500 w-5 h-5" />
            <h3 className="font-bold text-sm">1–10 Warmth</h3>
            <p className="text-xs text-slate-400 leading-tight">AI tags items by weight for weather logic.</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <Palette className="text-purple-500 w-5 h-5" />
            <h3 className="font-bold text-sm">Color Families</h3>
            <p className="text-xs text-slate-400 leading-tight">Neutral, Cool, or Warm tags for matching.</p>
          </div>
        </section>

        {closet.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="text-blue-500 w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-800">Your Closet ({closet.length})</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {closet.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{item.category}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">Warmth: {item.warmth}</span>
                    </div>
                    <h4 className="font-bold text-slate-700 mt-1 capitalize">{item.colorFamily} {item.category}</h4>
                    <p className="text-xs text-slate-400 italic line-clamp-1">{item.description}</p>
                  </div>
                  <button onClick={() => deleteItem(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
           <div className="h-64 bg-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">Avatar Preview (Ready Player Me)</p>
           </div>
        </section>
      </main>
    </div>
  );
}