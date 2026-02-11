'use client';
import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

// TypeScript interface for props
interface ClothingUploadProps {
  onSave?: (data: any) => void;
}

export default function ClothingUpload({ onSave }: ClothingUploadProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Photo too large! Use a screenshot.");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = () => {
    // Safety check to ensure onSave is a function before calling
    if (result && !result.error && typeof onSave === 'function') {
      onSave(result);
      setIsSaved(true);
      setResult(null);
    } else {
      console.warn("Save failed: onSave is not provided or result is invalid.");
    }
  };

  return (
    <div className="space-y-4">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${loading ? 'bg-slate-50 border-blue-300' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {loading ? <Loader2 className="animate-spin text-blue-500 w-8 h-8" /> : <Upload className="text-slate-400 w-8 h-8" />}
          <p className="mt-2 text-sm text-slate-500">{loading ? "Vara is thinking..." : "Snap a photo or upload screenshot"}</p>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
      </label>

      {result && !result.error && (
        <div className="p-4 rounded-xl border bg-blue-50 border-blue-100 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase">Analysis Complete</p>
              <h3 className="font-bold text-slate-800 capitalize">{result.colorFamily} {result.category}</h3>
            </div>
            <button onClick={handleSaveClick} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      )}

      {isSaved && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">Saved to Closet!</p>
        </div>
      )}
    </div>
  );
}