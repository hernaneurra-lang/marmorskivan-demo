import { useEffect } from "react";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title?: string
 * - material?: { name?: string, image?: string }
 * - busy?: boolean
 * - error?: string
 * - children?: ReactNode (renderad bild)
 */
export default function RenderModal({ open, onClose, title, material, busy, error, children }) {
  // Robust scroll-lock: spara scrollY, lås body med position:fixed, återställ exakt
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Lås scroll
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    // Rensa när modalen stängs eller komponenten unmountas
    return () => {
      const y = -parseInt(body.style.top || "0", 10) || 0;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, y);
    };
  }, [open]);

  // ESC för att stänga
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      {/* Bakgrundsdimma */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose?.()} />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[min(92vw,1100px)] max-h-[90vh] overflow-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between gap-3 p-4 border-b bg-white/90 backdrop-blur z-10">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {title || "Förhandsvisning"}
            </h3>
            {material?.name && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <img
                  src={material.image || "/products/placeholder.jpg"}
                  alt={material.name}
                  className="w-7 h-7 rounded border object-cover"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes("placeholder.jpg")) {
                      e.currentTarget.src = "/products/placeholder.jpg";
                    }
                  }}
                />
                <span className="truncate">{material.name}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onClose?.()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
            aria-label="Stäng"
            title="Stäng"
          >
            {/* röd ✕ */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {busy && (
            <div className="py-24 text-center text-gray-600">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              Genererar rendering…
            </div>
          )}

          {error && !busy && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {String(error)}
            </div>
          )}

          {!busy && !children && (
            <div className="py-12 text-center text-gray-500">Ingen bild att visa.</div>
          )}

          {!busy && children}
        </div>
      </div>
    </div>
  );
}
