// Path: src/components/render/PreviewCard.jsx
import React from "react";

/**
 * PreviewCard
 * Wrapper-kort med titel + actions runt din PreviewCanvas.
 */
export default function PreviewCard({ title = "Förhandsvisning (skiss)", children, onExport, onFullscreen }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{title}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onExport} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">
            Exportera skiss
          </button>
          <button type="button" onClick={onFullscreen} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">
            Se helskärm
          </button>
        </div>
      </div>
      <div className="rounded-xl border bg-gray-50 p-2">{children}</div>
    </div>
  );
}
