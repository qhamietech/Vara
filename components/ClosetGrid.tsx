'use client';
import { Trash2 } from 'lucide-react';

export default function ClosetGrid({ items, onDelete }: { items: any[], onDelete: (id: number) => void }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Digital Closet</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {item.category}
                </span>
                <button 
                  onClick={() => onDelete(index)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="mt-2 font-semibold text-slate-800">{item.colorFamily} {item.category}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mt-1 italic">"{item.description}"</p>
              
              <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Warmth: {item.warmth}/10</span>
                <span>{item.occasion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}