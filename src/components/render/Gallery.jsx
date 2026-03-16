// Path: src/components/render/Gallery.jsx
import React from "react";

/**
 * Gallery
 * Enkel grid (2 kolumner på små skärmar, 3 på md+). Visar meta + klick för att välja.
 */
export default function Gallery({ items = [], onSelect }) {
  if (!items.length) {
    return <p className="text-sm text-gray-600">Inga renderingar ännu.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onSelect?.(it)}
          className="group rounded-xl border bg-white overflow-hidden text-left hover:shadow"
          title="Visa större"
        >
          <div className="aspect-video bg-gray-50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt={it.title || 'rendering'} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
          </div>
          <div className="p-2 text-xs text-gray-600 flex items-center justify-between">
            <span className="truncate">{it.title || "Rendering"}</span>
            {it.material && <span className="ml-2 text-gray-500 truncate">{it.material}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}
