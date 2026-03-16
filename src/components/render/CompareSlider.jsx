// Path: src/components/render/CompareSlider.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * CompareSlider
 * Enkel före/efter-slider (skiss/render). Ingen extern lib.
 */
export default function CompareSlider({ beforeSrc, afterSrc, height = 360, beforeLabel = "Före", afterLabel = "Efter" }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(0.5);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!drag || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPos(Math.max(0, Math.min(1, x / rect.width)));
    };
    const onUp = () => setDrag(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [drag]);

  return (
    <div className="rounded-2xl border bg-white overflow-hidden" role="region" aria-label="Före/Efter-komparator">
      <div ref={containerRef} className="relative w-full" style={{ height }}>
        {/* before */}
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 w-full h-full object-contain bg-gray-50" />
        {/* after (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${Math.max(0, Math.min(1, pos)) * 100}%` }}
        >
          <img src={afterSrc} alt={afterLabel} className="absolute inset-0 w-full h-full object-contain bg-gray-50" />
        </div>

        {/* center bar */}
        <div
          className="absolute top-0 bottom-0"
          style={{ left: `${pos * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-[3px] h-full bg-gray-300" />
          <button
            type="button"
            onMouseDown={() => setDrag(true)}
            onTouchStart={() => setDrag(true)}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-600 text-white shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Dra för att jämföra"
            title="Dra för att jämföra"
          >
            ║
          </button>
        </div>

        {/* labels */}
        <div className="absolute left-3 top-3 text-xs bg-white/70 px-2 py-1 rounded-md border">{beforeLabel}</div>
        <div className="absolute right-3 top-3 text-xs bg-white/70 px-2 py-1 rounded-md border">{afterLabel}</div>
      </div>
    </div>
  );
}
