'use client';
import ClothingUpload from '@/components/ClothingUpload';
import { Shirt, ThermometerSun, Palette } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Area */}
      <header className="p-6 bg-white border-b border-slate-200 shadow-sm">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">VARA</h1>
        <p className="text-slate-500 text-sm mt-1 italic">Your style, logic-powered.</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shirt className="text-blue-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">New Addition</h2>
          </div>
          <ClothingUpload />
        </section>

        {/* The VARA Logic Quick-Guide */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <ThermometerSun className="text-orange-500 w-5 h-5" />
            <h3 className="font-bold text-sm">1–5 Warmth</h3>
            <p className="text-xs text-slate-400 leading-tight">AI will tag items by weight for weather logic.</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
            <Palette className="text-purple-500 w-5 h-5" />
            <h3 className="font-bold text-sm">Color Families</h3>
            <p className="text-xs text-slate-400 leading-tight">Neutral, Cool, or Warm tags for matching.</p>
          </div>
        </section>

        {/* Future Avatar Placeholder */}
        <section className="mt-8">
           <div className="h-64 bg-slate-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">Avatar Preview (Ready Player Me)</p>
           </div>
        </section>
      </main>
    </div>
  );
}