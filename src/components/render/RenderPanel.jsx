// Path: src/components/render/RenderPanel.jsx
import React from "react";
import Gallery from "./Gallery";

export default function RenderPanel({ onRender, busy, status, tips, history = [], onPickHistory }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">RenderPanel</div>
          <button
            type="button"
            onClick={onRender}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? "Renderar…" : "Rendera köksbild"}
          </button>
        </div>
        {status && <div className="text-sm text-gray-700">{status}</div>}
        {tips && <div className="text-xs text-gray-500 mt-1">{tips}</div>}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="font-medium mb-2">Galleri (senaste)</div>
        <Gallery items={history} onSelect={onPickHistory} />
      </div>
    </div>
  );
}
