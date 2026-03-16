import { Zap, Star, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

export default function RenderingDialog({ open, onClose, onSelectMode }) {
  if (!open) return null;
  const modes = [
    { key:"draft",   icon:Zap,      label:"Förhandsvisa", desc:"Snabb rendering i lägre upplösning. Perfekt för snabb överblick.", eta:"5–15 sek",   cls:"bg-green-50 text-green-700 hover:bg-green-100" },
    { key:"standard",icon:Star,     label:"Standard",     desc:"Balans mellan kvalitet och hastighet. Rekommenderad för offert och jämförelse.", eta:"30–60 sek", cls:"bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { key:"high",    icon:Sparkles, label:"Hög kvalitet", desc:"Fotorealistisk rendering i hög upplösning.", eta:"2–5 min", cls:"bg-yellow-50 text-yellow-700 hover:bg-yellow-100" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Välj rendering</h2>
          <button className="text-gray-500" onClick={onClose}>Stäng</button>
        </div>
        <div className="space-y-4">
          {modes.map(({key,icon:Icon,label,desc,eta,cls})=>(
            <div key={key} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Icon size={18}/> {label}
                  </div>
                  <p className="text-gray-600">{desc}</p>
                  <div className="text-sm text-gray-500 mt-1">⏱ {eta}</div>
                </div>
                <button className={`px-4 py-2 rounded-xl ${cls}`} onClick={()=> onSelectMode?.(key)}>
                  Välj
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
