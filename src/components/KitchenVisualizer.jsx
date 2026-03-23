// src/components/KitchenVisualizer.jsx
import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Download, RefreshCw, ChevronRight, Clock, Upload, ImagePlus, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const COOLDOWN_SECS = 60;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

export default function KitchenVisualizer({ materialName, materialImage, shape }) {
  const [state, setState] = useState("idle");
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [open, setOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [kitchenPhoto, setKitchenPhoto] = useState(null); // { dataUrl, name }
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cooldownRef = useRef(null);
  const elapsedRef = useRef(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(cooldownRef.current); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown > 0]);

  // Elapsed timer while loading
  useEffect(() => {
    if (state !== "loading") { clearInterval(elapsedRef.current); setElapsed(0); return; }
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, [state]);

  // Body scroll lock when modal open
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${y}px;left:0;right:0;width:100%`;
    return () => { document.body.style.cssText = ""; window.scrollTo(0, y); };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_PHOTO_BYTES) { alert("Bilden är för stor (max 10 MB)."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 1024px wide, compress to JPEG 0.82
        const MAX = 1024;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setKitchenPhoto({ dataUrl, name: file.name });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  async function generate() {
    if (state === "loading" || cooldown > 0) return;
    setState("loading");
    setErrorMsg(null);
    try {
      const body = {
        materialName,
        shape,
        materialImageUrl: materialImage || null,
        kitchenPhotoBase64: kitchenPhoto?.dataUrl || null,
      };
      const res = await fetch(`${API_BASE}/api/ai-render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.status === 429) {
        const secs = data.secsLeft || 0;
        if (secs > 0) setCooldown(secs);
        throw new Error(data.message || "För många förfrågningar.");
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

  function downloadImage() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "koksrendering.jpg";
    a.click();
  }

  const cleanName = (materialName || "").replace(/_/g, " ");
  const isLocked = state === "loading" || cooldown > 0 || !materialName;
  const mode = kitchenPhoto ? "edit" : "generate";

  return (
    <>
      {/* ── Card ── */}
      <div className="rounded-2xl border bg-gradient-to-br from-stone-50 to-white p-5 shadow-sm space-y-4">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">Visualisera i ditt kök</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === "edit"
                ? "AI applicerar materialet på ditt eget kök"
                : "AI genererar en köksrendering med valt material"}
            </p>
          </div>
        </div>

        {/* Material badge */}
        {cleanName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-xl">
            {materialImage && (
              <img src={materialImage} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
            )}
            <span className="text-xs text-gray-500">Material:</span>
            <span className="text-xs font-semibold text-gray-800 truncate">{cleanName}</span>
          </div>
        )}

        {/* Drop zone for kitchen photo */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Eget köksfoto <span className="font-normal text-gray-400 normal-case">(valfritt — för bäst resultat)</span>
          </p>

          {kitchenPhoto ? (
            <div className="relative rounded-xl overflow-hidden border border-emerald-200">
              <img src={kitchenPhoto.dataUrl} alt="Ditt kök" className="w-full h-28 object-cover" />
              <button
                onClick={() => setKitchenPhoto(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center text-white transition"
              >
                <Trash2 size={13} />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 px-3 py-1.5">
                <p className="text-white text-xs font-medium truncate">{kitchenPhoto.name}</p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors
                ${dragging ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:bg-stone-50"}`}
            >
              <ImagePlus size={20} className="text-gray-400" />
              <p className="text-xs text-gray-500 text-center">
                Dra och släpp ett foto av ditt kök<br />
                <span className="text-emerald-600 font-medium">eller klicka för att välja</span>
              </p>
              <p className="text-[10px] text-gray-400">JPG, PNG, WEBP · max 10 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={isLocked}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                     text-white text-sm font-semibold shadow-md
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? (
            <><RefreshCw size={15} className="animate-spin flex-shrink-0" />
              <span>Skapar rendering… {elapsed > 0 && `(${elapsed}s)`}</span></>
          ) : cooldown > 0 ? (
            <><Clock size={15} className="flex-shrink-0" />
              <span>Vänta {cooldown}s</span></>
          ) : mode === "edit" ? (
            <><Upload size={15} />Applicera material på mitt kök
              <ChevronRight size={14} className="ml-auto opacity-60" /></>
          ) : (
            <><Sparkles size={15} />Generera köksbild
              <ChevronRight size={14} className="ml-auto opacity-60" /></>
          )}
        </button>

        {/* Progress bars */}
        {state === "loading" && (
          <div>
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((elapsed / 25) * 100, 90)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              {mode === "edit" ? "gpt-image-1 — applicerar material på ditt kök…" : "DALL·E 3 HD — vanligtvis 15–25 sek"}
            </p>
          </div>
        )}
        {cooldown > 0 && state !== "loading" && (
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${(cooldown / COOLDOWN_SECS) * 100}%` }} />
          </div>
        )}

        {state === "done" && imageUrl && (
          <button onClick={() => setOpen(true)}
            className="w-full text-xs text-emerald-700 hover:text-emerald-800 font-medium text-center py-1">
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
              <span className="text-white text-sm font-semibold truncate max-w-[180px] sm:max-w-sm">{cleanName}</span>
            </div>
            <div className="flex items-center gap-2">
              {state === "done" && imageUrl && (
                <>
                  <button onClick={downloadImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition">
                    <Download size={13} />Ladda ner
                  </button>
                  <button onClick={() => { setOpen(false); generate(); }} disabled={cooldown > 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <RefreshCw size={13} />
                    {cooldown > 0 ? `Ny bild om ${cooldown}s` : "Ny bild"}
                  </button>
                </>
              )}
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {state === "loading" && (
              <div className="flex flex-col items-center gap-5 text-white max-w-xs text-center">
                <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-semibold mb-1">
                    {mode === "edit" ? "Applicerar materialet på ditt kök…" : "Genererar köksrendering…"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {mode === "edit" ? "gpt-image-1 identifierar bänkskivorna och applicerar materialet" : "DALL·E 3 HD — ca 15–25 sekunder"}
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 25) * 100, 90)}%` }} />
                </div>
                <p className="text-xs text-gray-500">{elapsed}s</p>
              </div>
            )}

            {state === "done" && imageUrl && (
              <img src={imageUrl} alt={`Köksrendering — ${cleanName}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: "calc(100vh - 100px)" }} />
            )}

            {state === "error" && (
              <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                <p className="text-white font-semibold">Något gick fel</p>
                <p className="text-gray-400 text-sm">{errorMsg}</p>
                {cooldown === 0 && (
                  <button onClick={() => { setOpen(false); generate(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
                    Försök igen
                  </button>
                )}
                {cooldown > 0 && <p className="text-gray-500 text-xs">Försök igen om {cooldown} sekunder</p>}
              </div>
            )}
          </div>

          {state === "done" && (
            <div className="px-4 py-3 bg-black/60 text-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                AI-genererad visualisering av {cleanName}
                {mode === "edit" ? " applicerat på ditt uppladdade köksfoto" : " — inte ett foto av faktisk produkt"}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
