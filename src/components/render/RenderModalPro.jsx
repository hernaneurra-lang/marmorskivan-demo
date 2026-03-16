// Path: src/components/render/RenderModalPro.jsx
import React, { useEffect, useState } from "react";
import Skeleton from "../ui/Skeleton";
import IconButton from "../ui/IconButton";

/**
 * RenderModalPro
 * Glasig modal med bild, skeleton, materialbadge och actions (ladda ner / länk / rendera igen).
 */
export default function RenderModalPro({ open, onClose, title = "AI‑rendering av kök", imageUrl, material, busy, error, onRetry }) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) setDownloading(false);
  }, [open]);

  if (!open) return null;

  async function handleDownload() {
    try {
      setDownloading(true);
      // Försök hämta och spara (om CORS tillåter), annars bara öppna i ny flik
      const resp = await fetch(imageUrl, { mode: "cors" });
      if (!resp.ok) throw new Error("Hämtning misslyckades");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rendering.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl border relative">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="text-base font-semibold">{title}</div>
            <IconButton onClick={onClose} title="Stäng" className="bg-white hover:bg-gray-50">
              ✕
            </IconButton>
          </div>

          {/* body */}
          <div className="p-5">
            <div className="relative w-full" style={{ minHeight: 320 }}>
              {busy && <Skeleton className="w-full h-[320px]" />}
              {!busy && imageUrl && (
                <img
                  src={imageUrl}
                  alt="AI‑renderad köksvy"
                  className="w-full h-auto rounded-lg border object-contain max-h-[70vh]"
                />
              )}
              {material?.name && (
                <div className="absolute bottom-4 left-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-1 text-xs shadow-sm">
                  {material.name}{material.price ? ` — ${material.price.toLocaleString("sv-SE")} kr/m²` : ""}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-600">
                {String(error)}
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t gap-2">
            <div className="flex items-center gap-2">
              <IconButton onClick={onRetry} disabled={busy} className="bg-white hover:bg-gray-50" title="Rendera igen">
                🔁 <span className="ml-2">Rendera igen</span>
              </IconButton>
              <IconButton onClick={() => navigator.clipboard?.writeText(imageUrl)} disabled={busy || !imageUrl} className="bg-white hover:bg-gray-50" title="Kopiera länk">
                🔗 <span className="ml-2">Kopiera länk</span>
              </IconButton>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy || !imageUrl || downloading}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {downloading ? "Sparar…" : "Ladda ner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
