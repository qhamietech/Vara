'use client';
import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ClothingUpload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety check for your 24-hour sprint
    if (file.size > 4 * 1024 * 1024) {
      alert("This photo is too large for the current local tunnel. Please use a screenshot instead!");
      return;
    }

    setLoading(true);
    setResult(null); // Clear previous result during new upload
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to connect to the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-slate-100 max-w-md mx-auto">
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          ) : (
            <Upload className="h-10 w-10 text-slate-400" />
          )}
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {loading ? "Vara is thinking..." : "Snap a photo or upload screenshot"}
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload} 
          disabled={loading}
        />
      </label>

      {result && (
        <div className={`mt-6 p-5 rounded-xl border ${result.error ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            {result.error ? (
              <AlertCircle className="text-red-500 h-5 w-5" />
            ) : (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
            <p className="font-bold text-slate-800">
              {result.error ? "Analysis Failed" : "Vara AI Tags"}
            </p>
          </div>

          {result.error ? (
            <p className="text-red-600 text-sm">{result.error}</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-700">{result.category}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block">Warmth Score</span>
                  <span className="font-semibold text-slate-700">{result.warmth}/10</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block">Color Family</span>
                  <span className="font-semibold text-slate-700">{result.colorFamily}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block">Occasion</span>
                  <span className="font-semibold text-slate-700">{result.occasion}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <span className="text-[10px] uppercase text-slate-400 block mb-1">AI Description</span>
                <p className="text-sm text-slate-600 italic">"{result.description}"</p>
              </div>
              
              <button 
                onClick={() => setResult(null)}
                className="w-full mt-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Upload another item
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}