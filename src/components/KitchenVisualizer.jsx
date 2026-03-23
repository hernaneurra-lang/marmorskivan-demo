// src/components/KitchenVisualizer.jsx
import { useState, useEffect } from "react";
import { Sparkles, X, Download, RefreshCw, ChevronRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

export default function KitchenVisualizer({ materialName, shape }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [open, setOpen] = useState(false);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  async function generate() {
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai-render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialName, shape }),
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) throw new Error(data.error || "Okänt fel");
      setImageUrl(data.imageUrl);
      setState("done");
      setOpen(true);
    } catch (e) {
      setErrorMsg(e.message || "Något gick fel");
      setState("error");
      setOpen(true);
    }
  }

  const cleanName = (materialName || "").replace(/_/g, " ");

  return (
    <>
      {/* ── Trigger button ── */}
      <div className="rounded-2xl border bg-gradient-to-br from-stone-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">Visualisera i ditt kök</p>
            <p className="text-xs text-gray-500 mt-0.5">AI genererar en fotorealistisk köksrendering med valt material</p>
          </div>
        </div>

        {cleanName && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-stone-100 rounded-xl">
            <span className="text-xs text-gray-500">Material:</span>
            <span className="text-xs font-semibold text-gray-800 truncate">{cleanName}</span>
          </div>
        )}

        <button
          onClick={generate}
          disabled={state === "loading" || !materialName}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                     text-white text-sm font-semibold shadow-md
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Skapar rendering… (~15 sek)
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generera köksbild
              <ChevronRight size={14} className="ml-auto opacity-60" />
            </>
          )}
        </button>

        {state === "done" && imageUrl && (
          <button
            onClick={() => setOpen(true)}
            className="w-full mt-2 text-xs text-emerald-700 hover:text-emerald-800 font-medium text-center py-1"
          >
            Visa senaste rendering →
          </button>
        )}
      </div>

      {/* ── Full-screen modal ── */}
      {open && (
        <div className="fixed inset-0 z-[1200] flex flex-col bg-black">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-white text-sm font-semibold truncate max-w-[200px] sm:max-w-none">
                {cleanName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {state === "done" && imageUrl && (
                <>
                  <a
                    href={imageUrl}
                    download="koksrendering.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
                  >
                    <Download size={13} />
                    Ladda ner
                  </a>
                  <button
                    onClick={() => { setOpen(false); generate(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition"
                  >
                    <RefreshCw size={13} />
                    Ny bild
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {state === "loading" && (
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-300">DALL·E 3 HD — skapar fotorealistisk köksmiljö…</p>
              </div>
            )}

            {state === "done" && imageUrl && (
              <img
                src={imageUrl}
                alt={`Köksrendering — ${cleanName}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: "calc(100vh - 100px)" }}
              />
            )}

            {state === "error" && (
              <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                <p className="text-white font-semibold">Något gick fel</p>
                <p className="text-gray-400 text-sm">{errorMsg}</p>
                <button
                  onClick={() => { setOpen(false); generate(); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
                >
                  Försök igen
                </button>
              </div>
            )}
          </div>

          {/* Bottom label */}
          {state === "done" && (
            <div className="px-4 py-3 bg-black/60 text-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                AI-genererad visualisering — representerar materialet {cleanName} i en kökskontext
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
