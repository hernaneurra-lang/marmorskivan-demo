// src/components/KitchenVisualizer.jsx
import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Download, RefreshCw, ChevronRight, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const COOLDOWN_SECS = 60;

export default function KitchenVisualizer({ materialName, shape }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [open, setOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const [elapsed, setElapsed] = useState(0);   // seconds since render started
  const cooldownRef = useRef(null);
  const elapsedRef = useRef(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown > 0]);

  // Elapsed time while loading
  useEffect(() => {
    if (state !== "loading") { clearInterval(elapsedRef.current); setElapsed(0); return; }
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, [state]);

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
    if (state === "loading" || cooldown > 0) return;
    setState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai-render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialName, shape }),
      });
      const data = await res.json();
      if (res.status === 429) {
        // Cooldown or in-progress from server
        const secs = data.secsLeft || (data.error === "render_in_progress" ? 0 : COOLDOWN_SECS);
        if (secs > 0) setCooldown(secs);
        throw new Error(data.message || "För många förfrågningar, försök igen snart.");
      }
      if (!res.ok || !data.imageUrl) throw new Error(data.error || "Okänt fel");
      setImageUrl(data.imageUrl);
      setState("done");
      setCooldown(COOLDOWN_SECS);
      setOpen(true);
    } catch (e) {
      setErrorMsg(e.message || "Något gick fel");
      setState("error");
      setOpen(true);
    }
  }

  const cleanName = (materialName || "").replace(/_/g, " ");
  const isLocked = state === "loading" || cooldown > 0 || !materialName;

  return (
    <>
      {/* ── Trigger card ── */}
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
          disabled={isLocked}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                     text-white text-sm font-semibold shadow-md
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <>
              <RefreshCw size={15} className="animate-spin flex-shrink-0" />
              <span>Skapar rendering… {elapsed > 0 && `(${elapsed}s)`}</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <Clock size={15} className="flex-shrink-0" />
              <span>Vänta {cooldown}s innan nästa rendering</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Generera köksbild
              <ChevronRight size={14} className="ml-auto opacity-60" />
            </>
          )}
        </button>

        {/* Progress bar during loading */}
        {state === "loading" && (
          <div className="mt-3">
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((elapsed / 20) * 100, 90)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              DALL·E 3 HD — vanligtvis 15–20 sekunder
            </p>
          </div>
        )}

        {/* Cooldown bar */}
        {cooldown > 0 && state !== "loading" && (
          <div className="mt-3">
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${(cooldown / COOLDOWN_SECS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {state === "done" && imageUrl && cooldown === 0 && (
          <button
            onClick={() => setOpen(true)}
            className="w-full mt-2 text-xs text-emerald-700 hover:text-emerald-800 font-medium text-center py-1"
          >
            Visa senaste rendering →
          </button>
        )}
        {state === "done" && imageUrl && cooldown > 0 && (
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
                    disabled={cooldown > 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} />
                    {cooldown > 0 ? `Ny bild om ${cooldown}s` : "Ny bild"}
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

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {state === "loading" && (
              <div className="flex flex-col items-center gap-5 text-white max-w-xs text-center">
                <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-semibold mb-1">Genererar din köksbild…</p>
                  <p className="text-sm text-gray-400">DALL·E 3 HD arbetar — vanligtvis 15–20 sekunder</p>
                </div>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 20) * 100, 90)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{elapsed}s</p>
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
                {cooldown === 0 && (
                  <button
                    onClick={() => { setOpen(false); generate(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
                  >
                    Försök igen
                  </button>
                )}
                {cooldown > 0 && (
                  <p className="text-gray-500 text-xs">Försök igen om {cooldown} sekunder</p>
                )}
              </div>
            )}
          </div>

          {state === "done" && (
            <div className="px-4 py-3 bg-black/60 text-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                AI-genererad visualisering av {cleanName} — inte ett foto av faktisk produkt
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
