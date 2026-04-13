// src/components/KitchenVisualizer.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, Download, RefreshCw, ChevronRight, Clock, Upload, ImagePlus, Maximize2 } from "lucide-react";
import { trackEvent } from "../lib/analytics";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const COOLDOWN_SECS = 60;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const FLOOD_TOLERANCE = 38;

// ── Flood fill ────────────────────────────────────────────────────────────────
function floodFill(pixelData, width, height, startX, startY, tolerance) {
  const result = new Uint8Array(width * height);
  const si = (startY * width + startX) * 4;
  const tR = pixelData[si], tG = pixelData[si + 1], tB = pixelData[si + 2];
  const visited = new Uint8Array(width * height);
  const queue = [startY * width + startX];
  let head = 0;
  visited[startY * width + startX] = 1;
  while (head < queue.length) {
    const pos = queue[head++];
    result[pos] = 1;
    const x = pos % width;
    const y = (pos - x) / width;
    const ns = [
      y > 0 ? pos - width : -1,
      y < height - 1 ? pos + width : -1,
      x > 0 ? pos - 1 : -1,
      x < width - 1 ? pos + 1 : -1,
    ];
    for (const n of ns) {
      if (n < 0 || visited[n]) continue;
      visited[n] = 1;
      const ni = n * 4;
      const dr = pixelData[ni] - tR, dg = pixelData[ni + 1] - tG, db = pixelData[ni + 2] - tB;
      if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) queue.push(n);
    }
  }
  return result;
}

// ── Expand selection outward by `radius` pixels (closes small gaps) ───────────
function dilate(sel, width, height, radius = 4) {
  let cur = sel;
  for (let pass = 0; pass < radius; pass++) {
    const next = new Uint8Array(cur);
    for (let pos = 0; pos < cur.length; pos++) {
      if (cur[pos]) continue;
      const x = pos % width, y = (pos - x) / width;
      if (
        (y > 0 && cur[pos - width]) ||
        (y < height - 1 && cur[pos + width]) ||
        (x > 0 && cur[pos - 1]) ||
        (x < width - 1 && cur[pos + 1])
      ) next[pos] = 1;
    }
    cur = next;
  }
  return cur;
}

// ── Fill enclosed holes: only fill small holes (≤ maxHoleFraction of image) ──
// Large enclosed regions are background objects, NOT gaps in the surface.
function fillHoles(sel, width, height, maxHoleFraction = 0.02) {
  const total = width * height;
  const maxHoleSize = Math.round(total * maxHoleFraction);

  // BFS from edges → marks anything reachable without crossing selected pixels as "outside"
  const outside = new Uint8Array(total);
  const queue = [];
  let head = 0;
  const enqueue = (pos) => {
    if (!outside[pos] && !sel[pos]) { outside[pos] = 1; queue.push(pos); }
  };
  for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (head < queue.length) {
    const pos = queue[head++];
    const x = pos % width, y = (pos - x) / width;
    if (y > 0) enqueue(pos - width);
    if (y < height - 1) enqueue(pos + width);
    if (x > 0) enqueue(pos - 1);
    if (x < width - 1) enqueue(pos + 1);
  }

  // Find connected components of interior (non-outside, non-selected) pixels.
  // Only fill components that are small enough to be genuine gaps in the surface.
  const visited = new Uint8Array(total);
  const result = new Uint8Array(sel);
  for (let start = 0; start < total; start++) {
    if (sel[start] || outside[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    let ci = 0;
    while (ci < component.length) {
      const pos = component[ci++];
      const x = pos % width, y = (pos - x) / width;
      const ns = [
        y > 0 ? pos - width : -1,
        y < height - 1 ? pos + width : -1,
        x > 0 ? pos - 1 : -1,
        x < width - 1 ? pos + 1 : -1,
      ];
      for (const n of ns) {
        if (n < 0 || sel[n] || outside[n] || visited[n]) continue;
        visited[n] = 1;
        component.push(n);
      }
    }
    if (component.length <= maxHoleSize) {
      for (const pos of component) result[pos] = 1;
    }
  }
  return result;
}

// ── Clean up a raw flood-fill: dilate + fill holes ────────────────────────────
function cleanSelection(raw, width, height, dilateRadius = 2) {
  return fillHoles(dilate(raw, width, height, dilateRadius), width, height);
}

// ── Draw image + selection overlay on a canvas ────────────────────────────────
function redrawCanvas(canvas, pixelData, w, h, sel) {
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(new Uint8ClampedArray(pixelData), w, h), 0, 0);
  if (!sel) return;
  const ov = document.createElement("canvas");
  ov.width = w; ov.height = h;
  const octx = ov.getContext("2d");
  const od = octx.createImageData(w, h);
  for (let i = 0; i < sel.length; i++) {
    if (sel[i]) {
      const idx = i * 4;
      od.data[idx] = 16; od.data[idx + 1] = 185; od.data[idx + 2] = 129;
      od.data[idx + 3] = 160;
    }
  }
  octx.putImageData(od, 0, 0);
  ctx.drawImage(ov, 0, 0);
}

// ── Composite AI result onto original photo: only selected pixels are replaced ──
// Strategy: scale AI output back to original dimensions first, then composite.
// This avoids coordinate mapping errors when AI output size ≠ input size.
async function compositeWithOriginal(aiImageUrl, originalPixelData, selection, origW, origH) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Scale AI image back to original resolution so pixel coords align 1:1
      const aiCanvas = document.createElement("canvas");
      aiCanvas.width = origW; aiCanvas.height = origH;
      aiCanvas.getContext("2d").drawImage(img, 0, 0, origW, origH);
      const aiData = aiCanvas.getContext("2d").getImageData(0, 0, origW, origH).data;

      // Composite: selected pixels from AI, rest from original
      const outCanvas = document.createElement("canvas");
      outCanvas.width = origW; outCanvas.height = origH;
      const outCtx = outCanvas.getContext("2d");
      const result = outCtx.createImageData(origW, origH);

      for (let i = 0; i < selection.length; i++) {
        const idx = i * 4;
        if (selection[i]) {
          result.data[idx]     = aiData[idx];
          result.data[idx + 1] = aiData[idx + 1];
          result.data[idx + 2] = aiData[idx + 2];
          result.data[idx + 3] = 255;
        } else {
          result.data[idx]     = originalPixelData[idx];
          result.data[idx + 1] = originalPixelData[idx + 1];
          result.data[idx + 2] = originalPixelData[idx + 2];
          result.data[idx + 3] = 255;
        }
      }

      outCtx.putImageData(result, 0, 0);
      resolve(outCanvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(aiImageUrl);
    img.src = aiImageUrl;
  });
}

// ── Build inpaint PNG: original pixels preserved, selected area = transparent ──
// gpt-image-1 sees an image with a "hole" → fills it with the stone material
function buildInpaintImage(pixelData, selection, width, height) {
  const mc = document.createElement("canvas");
  mc.width = width; mc.height = height;
  const ctx = mc.getContext("2d");
  const md = ctx.createImageData(width, height);
  for (let i = 0; i < selection.length; i++) {
    const idx = i * 4;
    if (selection[i]) {
      md.data[idx + 3] = 0; // transparent hole = "fill me with stone"
    } else {
      md.data[idx] = pixelData[idx];
      md.data[idx + 1] = pixelData[idx + 1];
      md.data[idx + 2] = pixelData[idx + 2];
      md.data[idx + 3] = 255; // keep original pixel
    }
  }
  ctx.putImageData(md, 0, 0);
  return mc.toDataURL("image/png"); // PNG preserves alpha channel
}

export default function KitchenVisualizer({ materialName, materialImage, shape, thicknessMm }) {
  const [genState, setGenState] = useState("idle");
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [kitchenPhoto, setKitchenPhoto] = useState(null);
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [toolMode, setToolMode] = useState("fill"); // "fill" | "erase"

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const cooldownRef = useRef(null);
  const elapsedRef = useRef(null);
  const modalCanvasRef = useRef(null);
  const imgDataRef = useRef(null);
  const isErasingRef = useRef(false);
  const workingSelRef = useRef(null);
  const BRUSH_RADIUS = 20;

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(cooldownRef.current); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown > 0]);

  // Elapsed timer
  useEffect(() => {
    if (genState !== "loading") { clearInterval(elapsedRef.current); setElapsed(0); return; }
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, [genState]);

  // Scroll lock for result modal
  useEffect(() => {
    if (!resultOpen) return;
    const y = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${y}px;left:0;right:0;width:100%`;
    return () => { document.body.style.cssText = ""; window.scrollTo(0, y); };
  }, [resultOpen]);

  // Scroll lock for selection modal
  useEffect(() => {
    if (!selectOpen) return;
    const y = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${y}px;left:0;right:0;width:100%`;
    return () => { document.body.style.cssText = ""; window.scrollTo(0, y); };
  }, [selectOpen]);

  // ESC to close
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") { setResultOpen(false); setSelectOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Load photo → extract pixel data
  useEffect(() => {
    setSelection(null);
    imgDataRef.current = null;
    setImgLoaded(false);
    if (!kitchenPhoto) return;
    const img = new Image();
    img.onload = () => {
      const tmp = document.createElement("canvas");
      tmp.width = img.width; tmp.height = img.height;
      const tctx = tmp.getContext("2d");
      tctx.drawImage(img, 0, 0);
      const imgData = tctx.getImageData(0, 0, img.width, img.height);
      imgDataRef.current = { data: imgData.data, w: img.width, h: img.height };
      setImgLoaded(true);
    };
    img.src = kitchenPhoto.dataUrl;
  }, [kitchenPhoto]);

  // Draw modal canvas when selection modal opens, image loads, or selection changes
  useEffect(() => {
    if (!selectOpen || !modalCanvasRef.current || !imgDataRef.current) return;
    const { data, w, h } = imgDataRef.current;
    const canvas = modalCanvasRef.current;
    canvas.width = w; canvas.height = h;
    redrawCanvas(canvas, data, w, h, selection);
  }, [selectOpen, selection, imgLoaded]);

  // Reset to fill mode when selection is cleared
  useEffect(() => { if (!selection) setToolMode("fill"); }, [selection]);

  // Helper: screen event → image-pixel coords
  function getCanvasCoords(e) {
    const canvas = modalCanvasRef.current;
    if (!canvas || !imgDataRef.current) return null;
    const rect = canvas.getBoundingClientRect();
    const { w, h } = imgDataRef.current;
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    return {
      x: Math.floor((cx - rect.left) * (w / rect.width)),
      y: Math.floor((cy - rect.top) * (h / rect.height)),
    };
  }

  // Erase selected pixels within BRUSH_RADIUS of (x, y)
  function eraseAt(x, y, sel) {
    const { w, h } = imgDataRef.current;
    const r = BRUSH_RADIUS;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const px = x + dx, py = y + dy;
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        sel[py * w + px] = 0;
      }
    }
  }

  // ── Unified pointer handlers (mouse + touch via Pointer Events API) ──────────

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId); // track pointer even outside canvas
    if (!imgDataRef.current) return;
    if (toolMode === "erase" && selection) {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      isErasingRef.current = true;
      workingSelRef.current = new Uint8Array(selection);
      eraseAt(coords.x, coords.y, workingSelRef.current);
      const { data, w, h } = imgDataRef.current;
      redrawCanvas(modalCanvasRef.current, data, w, h, workingSelRef.current);
    }
  }, [toolMode, selection]);

  const handlePointerMove = useCallback((e) => {
    if (!isErasingRef.current || !workingSelRef.current || !imgDataRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    eraseAt(coords.x, coords.y, workingSelRef.current);
    const { data, w, h } = imgDataRef.current;
    redrawCanvas(modalCanvasRef.current, data, w, h, workingSelRef.current);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (isErasingRef.current && workingSelRef.current) {
      // Commit erase
      isErasingRef.current = false;
      setSelection(new Uint8Array(workingSelRef.current));
      workingSelRef.current = null;
      return;
    }
    // Tap (no drag) in fill mode → flood fill
    if (toolMode === "fill" && imgDataRef.current) {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const { x, y } = coords;
      const { data, w, h } = imgDataRef.current;
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const raw = floodFill(data, w, h, x, y, FLOOD_TOLERANCE);
      const cleaned = cleanSelection(raw, w, h, 2);
      setSelection((prev) => {
        if (!prev) return cleaned;
        const merged = new Uint8Array(w * h);
        for (let i = 0; i < merged.length; i++) merged[i] = prev[i] | cleaned[i];
        return fillHoles(merged, w, h);
      });
    }
  }, [toolMode]);

  // File upload
  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_PHOTO_BYTES) { alert("Bilden är för stor (max 10 MB)."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        setKitchenPhoto({ dataUrl: c.toDataURL("image/jpeg", 0.82), name: file.name });
        // Auto-open selection modal after upload
        setTimeout(() => setSelectOpen(true), 300);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setKitchenPhoto(null);
    setSelection(null);
    imgDataRef.current = null;
  }

  // Generate
  async function generate() {
    if (genState === "loading" || cooldown > 0) return;
    setGenState("loading");
    setErrorMsg(null);
    try {
      // Snapshot selection + original pixels now, before any async state changes
      const selSnap = selection ? new Uint8Array(selection) : null;
      const origSnap = (selSnap && imgDataRef.current)
        ? { data: new Uint8ClampedArray(imgDataRef.current.data), w: imgDataRef.current.w, h: imgDataRef.current.h }
        : null;

      // If user painted a selection: send kitchen as PNG with transparent hole (inpainting)
      // If no selection but photo uploaded: send original photo, AI picks countertop itself
      // If no photo: generate new kitchen with DALL-E 3
      const kitchenBase64 = (selSnap && origSnap)
        ? buildInpaintImage(origSnap.data, selSnap, origSnap.w, origSnap.h)
        : kitchenPhoto?.dataUrl || null;

      const body = {
        materialName, shape,
        thicknessMm: thicknessMm || 20,
        materialImageUrl: materialImage || null,
        kitchenPhotoBase64: kitchenBase64,
        hasSelection: Boolean(selSnap),
        photoWidth: origSnap?.w || null,
        photoHeight: origSnap?.h || null,
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

      // Client-side compositing: paste AI pixels ONLY onto selected area of original photo.
      // This is the hard guarantee that nothing outside the selection changes.
      let finalUrl = data.imageUrl;
      if (selSnap && origSnap) {
        finalUrl = await compositeWithOriginal(data.imageUrl, origSnap.data, selSnap, origSnap.w, origSnap.h);
      }

      setImageUrl(finalUrl);
      setGenState("done");
      setCooldown(COOLDOWN_SECS);
      setResultOpen(true);
      const mode = kitchenPhoto ? (selection ? "mask" : "edit") : "generate";
      trackEvent("kitchen_render", { material: materialName, mode, shape, thicknessMm });
    } catch (e) {
      setErrorMsg(e.message || "Något gick fel");
      setGenState("error");
      setResultOpen(true);
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
  const isLocked = genState === "loading" || cooldown > 0 || !materialName;
  const mode = kitchenPhoto ? (selection ? "mask" : "edit") : "generate";
  const selPct = (selection && imgDataRef.current)
    ? Math.round((selection.reduce((a, b) => a + b, 0) / (imgDataRef.current.w * imgDataRef.current.h)) * 100)
    : 0;

  // Canvas display size — computed at render so React doesn't reset it between renders
  const canvasDisplaySize = (() => {
    if (!imgLoaded || !imgDataRef.current) return {};
    const { w, h } = imgDataRef.current;
    const scale = Math.min(window.innerWidth / w, (window.innerHeight - 64) / h);
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  })();

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
            <p className="font-semibold text-gray-900 text-sm leading-tight">Visualisera materialet</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === "mask"
                ? `✓ Yta markerad (${selPct}%) — AI byter bara den ytan`
                : mode === "edit"
                  ? "Ladda upp ett foto och markera ytan"
                  : "AI genererar en rendering med valt material"}
            </p>
          </div>
        </div>

        {/* Material badge */}
        {cleanName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-xl">
            {materialImage && <img src={materialImage} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />}
            <span className="text-xs text-gray-500">Material:</span>
            <span className="text-xs font-semibold text-gray-800 truncate">{cleanName}</span>
          </div>
        )}

        {/* Photo section */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Eget köksfoto <span className="font-normal text-gray-400 normal-case">(valfritt)</span>
          </p>
          <p className="text-[11px] text-gray-400 mb-2">
            Inget foto? Ingen fara — klicka direkt på <span className="font-medium text-gray-500">Generera köksbild</span> så skapar AI:n en rendering av ett slumpmässigt kök med ditt valda material.
          </p>

          {kitchenPhoto ? (
            <div className="space-y-2">
              {/* Thumbnail with click-to-edit */}
              <div
                className="relative rounded-xl overflow-hidden border border-emerald-200 cursor-pointer group"
                onClick={() => setSelectOpen(true)}
              >
                <img src={kitchenPhoto.dataUrl} alt="Ditt kök" className="w-full h-32 object-cover" />

                {/* Selection status overlay */}
                {selection ? (
                  <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-lg font-semibold backdrop-blur-sm">
                    ✓ {selPct}% markerat
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/95 text-gray-800 text-xs px-3 py-2 rounded-xl font-semibold shadow">
                      Klicka för att markera bänkytan
                    </div>
                  </div>
                )}

                {/* Expand icon on hover */}
                <div className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                  <Maximize2 size={13} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectOpen(true)} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition">
                  {selection ? "Redigera markering →" : "Markera bänkyta →"}
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => replaceInputRef.current?.click()} className="text-xs text-gray-400 hover:text-emerald-600 transition">
                    Byt foto
                  </button>
                  <button onClick={removePhoto} className="text-xs text-gray-400 hover:text-red-500 transition">
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
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

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])} />
          <input ref={replaceInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={isLocked}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                     text-white text-sm font-semibold shadow-md
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {genState === "loading" ? (
            <><RefreshCw size={15} className="animate-spin flex-shrink-0" />
              <span>Skapar rendering… {elapsed > 0 && `(${elapsed}s)`}</span></>
          ) : cooldown > 0 ? (
            <><Clock size={15} /><span>Vänta {cooldown}s</span></>
          ) : mode === "mask" ? (
            <><Upload size={15} />Applicera på markerad yta <ChevronRight size={14} className="ml-auto opacity-60" /></>
          ) : mode === "edit" ? (
            <><Upload size={15} />Applicera material på mitt kök <ChevronRight size={14} className="ml-auto opacity-60" /></>
          ) : (
            <><Sparkles size={15} />Generera köksbild <ChevronRight size={14} className="ml-auto opacity-60" /></>
          )}
        </button>

        {/* Progress */}
        {genState === "loading" && (
          <div>
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((elapsed / 28) * 100, 90)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              {mode !== "generate" ? "gpt-image-1 — applicerar material på markerad yta…" : "DALL·E 3 HD — vanligtvis 15–25 sek"}
            </p>
          </div>
        )}
        {cooldown > 0 && genState !== "loading" && (
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${(cooldown / COOLDOWN_SECS) * 100}%` }} />
          </div>
        )}
        {genState === "done" && imageUrl && (
          <button onClick={() => setResultOpen(true)}
            className="w-full text-xs text-emerald-700 hover:text-emerald-800 font-medium text-center py-1">
            Visa senaste rendering →
          </button>
        )}
      </div>

      {/* ── Selection — fullscreen editor ── */}
      {selectOpen && (
        <div className="fixed inset-0 z-[1200] flex flex-col bg-gray-950">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Tool toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setToolMode("fill")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    toolMode === "fill" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  ✏️ Fyll
                </button>
                <button
                  onClick={() => setToolMode("erase")}
                  disabled={!selection}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    toolMode === "erase" ? "bg-amber-500 text-white" : "text-gray-400 hover:text-white"
                  } disabled:opacity-30 disabled:cursor-default`}
                >
                  🧹 Sudda
                </button>
              </div>
              <p className="text-gray-400 text-xs hidden sm:block">
                {selection
                  ? `${selPct}% markerat`
                  : toolMode === "fill" ? "Klicka på ytan" : "Dra för att sudda"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelection(null)}
                disabled={!selection}
                className={`text-sm font-medium transition ${selection ? "text-amber-400 hover:text-amber-300" : "text-gray-700 cursor-default"}`}
              >
                Rensa
              </button>
              {selection && (
                <button
                  onClick={() => {
                    const { w, h } = imgDataRef.current;
                    setSelection(s => fillHoles(dilate(s, w, h, 8), w, h));
                  }}
                  className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition hidden sm:block"
                >
                  Fyll luckor
                </button>
              )}
              <button
                onClick={() => setSelectOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition"
              >
                {selection ? "Klar →" : "Hoppa över →"}
              </button>
              <button onClick={() => setSelectOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Canvas — fills all remaining screen space */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-black min-h-0">
            <canvas
              ref={modalCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="block"
              style={{ cursor: toolMode === "erase" ? "cell" : "crosshair", touchAction: "none", ...canvasDisplaySize }}
            />
          </div>
        </div>
      )}

      {/* ── Result modal ── */}
      {resultOpen && (
        <div className="fixed inset-0 z-[1300] flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-white text-sm font-semibold truncate max-w-[180px] sm:max-w-sm">{cleanName}</span>
            </div>
            <div className="flex items-center gap-2">
              {genState === "done" && imageUrl && (
                <>
                  <button onClick={downloadImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition">
                    <Download size={13} />Ladda ner
                  </button>
                  <button onClick={() => { setResultOpen(false); generate(); }} disabled={cooldown > 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <RefreshCw size={13} />
                    {cooldown > 0 ? `Ny bild om ${cooldown}s` : "Ny bild"}
                  </button>
                </>
              )}
              <button onClick={() => setResultOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {genState === "loading" && (
              <div className="flex flex-col items-center gap-5 text-white max-w-xs text-center">
                <div className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-semibold mb-1">
                    {mode === "mask" ? "Applicerar på markerad yta…" : mode === "edit" ? "Applicerar materialet på ditt kök…" : "Genererar köksrendering…"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {mode !== "generate" ? "gpt-image-1 — ca 20–35 sekunder" : "DALL·E 3 HD — ca 15–25 sekunder"}
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 28) * 100, 90)}%` }} />
                </div>
                <p className="text-xs text-gray-500">{elapsed}s</p>
              </div>
            )}
            {genState === "done" && imageUrl && (
              <img src={imageUrl} alt={`Köksrendering — ${cleanName}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: "calc(100vh - 100px)" }} />
            )}
            {genState === "error" && (
              <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                <p className="text-white font-semibold">Något gick fel</p>
                <p className="text-gray-400 text-sm">{errorMsg}</p>
                {cooldown === 0 && (
                  <button onClick={() => { setResultOpen(false); generate(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">
                    Försök igen
                  </button>
                )}
                {cooldown > 0 && <p className="text-gray-500 text-xs">Försök igen om {cooldown} sekunder</p>}
              </div>
            )}
          </div>

          {genState === "done" && (
            <div className="px-4 py-3 bg-black/60 text-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                AI-genererad visualisering av {cleanName}
                {mode === "mask" ? " — applicerat på markerad yta" : mode === "edit" ? " applicerat på ditt uppladdade köksfoto" : " — inte ett foto av faktisk produkt"}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
