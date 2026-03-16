import { useMemo, forwardRef, useImperativeHandle, useRef } from "react";

/**
 * Props:
 * shape: "Straight" | "L" | "U" | "Straight+Island" | "L+Island" | "U+Island" | "Island"
 * bench: { lengthMm, depthMm }
 * legA, legB: { lengthMm, depthMm }
 * u: { depthMm, leftLegMm, centerSpanMm, rightLegMm }
 * island: { lengthMm, depthMm } | null
 * cutouts: { sink:{w,d,x,y}, hob:{w,d,x,y} }
 * faucetHole: { enabled, diameter, backOffsetMm? } // backOffset ignoreras nu – vi placerar mitt emellan vägg & diskho
 */
const PreviewCanvas = forwardRef(function PreviewCanvas({
  shape,
  bench,
  legA,
  legB,
  u,
  island,
  cutouts,
  faucetHole,
}, ref) {
  // SVG storlek
  const W = 720;
  const H = 420;

  // Marginaler/buffert för att säkerställa att pilar/etiketter ryms
  const M = 48;
  const PAD_MM = 80;

  const svgRef = useRef(null);

  function serializeSvgForExport(svgEl, { clean = false } = {}) {
    if (!clean) {
      return new XMLSerializer().serializeToString(svgEl);
    }
    const clone = svgEl.cloneNode(true);
    clone.querySelectorAll(".dimension, text.label").forEach((n) => n.remove());
    return new XMLSerializer().serializeToString(clone);
  }

  useImperativeHandle(ref, () => ({
    async exportPng({ scale = 2, clean = false } = {}) {
      if (typeof window === "undefined") throw new Error("Kan inte exportera på serversidan");
      const svgEl = svgRef.current;
      if (!svgEl) throw new Error("SVG saknas");
      const xml = serializeSvgForExport(svgEl, { clean });
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      const ctx = canvas.getContext("2d");
      await new Promise((res, rej) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          res();
        };
        img.onerror = rej;
        img.src = url;
      });
      return canvas.toDataURL("image/png");
    }
  }));

  // 1) Bygg geometri (mm) + måttlinjer (mm)
  const geom = useMemo(() => {
    const rects = []; // {x,y,w,h,label?}
    const dims  = []; // {type:'h'|'v', x1,y1,x2,y2,label}

    const addHDim = (x1, y, x2, label) => dims.push({ type: "h", x1, y1: y, x2, y2: y, label });
    const addVDim = (x, y1, y2, label) => dims.push({ type: "v", x1: x, y1, x2: x, y2, label });

    const hasIsland = shape?.includes("Island");
    const base = (shape || "Straight").replace("+Island", "");

    if (base === "Straight" || base === "Island") {
      const L = (base === "Island") ? (island?.lengthMm || 1800) : (bench?.lengthMm || 2400);
      const D = (base === "Island") ? (island?.depthMm || 900) : (bench?.depthMm || 620);
      rects.push({ x: 0, y: 0, w: L, h: D, label: base === "Island" ? "Köksö" : "Bänk" });

      // Mått: längd & djup
      addHDim(0, -20, L, `${L} mm`);
      addVDim(L + 20, 0, D, `${D} mm`);

      if (hasIsland && base !== "Island" && island) {
        const gap = Math.max(120, D * 0.2);
        rects.push({ x: L + gap, y: 0, w: island.lengthMm, h: island.depthMm, label: "Köksö" });
        addHDim(L + gap, -20, L + gap + island.lengthMm, `${island.lengthMm} mm`);
        addVDim(L + gap + island.lengthMm + 20, 0, island.depthMm, `${island.depthMm} mm`);
      }
    }

    if (base === "L") {
      const A = { L: legA?.lengthMm || 2000, D: legA?.depthMm || 620 };
      const B = { L: legB?.lengthMm || 1600, D: legB?.depthMm || 620 };
      rects.push({ x: 0, y: 0, w: A.L, h: A.D, label: "Ben A" });
      rects.push({ x: 0, y: 0, w: B.D, h: B.L, label: "Ben B" });

      addHDim(0, -20, A.L, `${A.L} mm`);
      addVDim(A.L + 20, 0, A.D, `${A.D} mm`);
      addVDim(-20, 0, B.L, `${B.L} mm`);
      addHDim(-20 - B.D, 0, -20, `${B.D} mm`);

      if (hasIsland && island) {
        const gap = Math.max(120, Math.max(A.D, B.D) * 0.4);
        rects.push({ x: A.L + gap, y: 0, w: island.lengthMm, h: island.depthMm, label: "Köksö" });
        addHDim(A.L + gap, -20, A.L + gap + island.lengthMm, `${island.lengthMm} mm`);
        addVDim(A.L + gap + island.lengthMm + 20, 0, island.depthMm, `${island.depthMm} mm`);
      }
    }

    if (base === "U") {
      const D = u?.depthMm || 620;
      const Lleft = u?.leftLegMm || 1800;
      const Lright = u?.rightLegMm || 1800;
      const C = u?.centerSpanMm || 1800;

      rects.push({ x: 0, y: 0, w: C + 2 * D, h: D, label: "Topplist" });
      rects.push({ x: 0, y: D, w: D, h: Lleft, label: "Vänster ben" });
      rects.push({ x: D + C, y: D, w: D, h: Lright, label: "Höger ben" });

      addHDim(0, -20, C + 2 * D, `${C + 2 * D} mm`);
      addVDim(C + 2 * D + 20, 0, D, `${D} mm`);
      addVDim(-20, D, D + Lleft, `${Lleft} mm`);
      addVDim(C + 2 * D + 20, D, D + Lright, `${Lright} mm`);
      addHDim(D, D + Lleft + 20, D + C, `${C} mm`);

      if (hasIsland && island) {
        const gap = Math.max(160, D * 0.6);
        rects.push({ x: C + 2 * D + gap, y: 0, w: island.lengthMm, h: island.depthMm, label: "Köksö" });
        addHDim(C + 2 * D + gap, -20, C + 2 * D + gap + island.lengthMm, `${island.lengthMm} mm`);
        addVDim(C + 2 * D + gap + island.lengthMm + 20, 0, island.depthMm, `${island.depthMm} mm`);
      }
    }

    // Bbox (mm) inkl. extra buffert
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rects.forEach(r => { minX = Math.min(minX, r.x); minY = Math.min(minY, r.y); maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.h); });
    dims.forEach(d => { minX = Math.min(minX, d.x1, d.x2); minY = Math.min(minY, d.y1, d.y2); maxX = Math.max(maxX, d.x1, d.x2); maxY = Math.max(maxY, d.y1, d.y2); });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 2000; maxY = 1000; }

    minX -= PAD_MM; minY -= PAD_MM; maxX += PAD_MM; maxY += PAD_MM;
    return { rects, dims, bbox: { minX, minY, maxX, maxY } };
  }, [shape, bench, legA, legB, u, island]);

  // 2) Skala (mm → px) och centrerad placering
  const layout = useMemo(() => {
    const { bbox } = geom;
    const innerW = W - 2 * M;
    const innerH = H - 2 * M;

    const spanX = bbox.maxX - bbox.minX;
    const spanY = bbox.maxY - bbox.minY;

    const scale = Math.min(spanX > 0 ? innerW / spanX : 1, spanY > 0 ? innerH / spanY : 1);

    const offsetX = M + (innerW - spanX * scale) / 2 - bbox.minX * scale;
    const offsetY = M + (innerH - spanY * scale) / 2 - bbox.minY * scale;

    const toPx = (mm) => mm * scale;
    const P = (x, y) => ({ x: offsetX + toPx(x), y: offsetY + toPx(y) });

    return { scale, offsetX, offsetY, toPx, P };
  }, [geom]);

  // 3) Förklaringstext (svenska)
  const explanation = useMemo(() => {
    const hasIsland = shape?.includes("Island");
    const base = (shape || "Straight").replace("+Island", "");
    const parts = [];
    if (base === "Straight") {
      parts.push(`Rak bänkskiva: Längd ${fmt(bench?.lengthMm)} · Djup ${fmt(bench?.depthMm)}`);
    }
    if (base === "Island") {
      parts.push(`Köksö: Längd ${fmt(island?.lengthMm)} · Djup ${fmt(island?.depthMm)}`);
    }
    if (base === "L") {
      parts.push(`L-form: Ben A ${fmt(legA?.lengthMm)} × ${fmt(legA?.depthMm)}, Ben B ${fmt(legB?.lengthMm)} × ${fmt(legB?.depthMm)}`);
    }
    if (base === "U") {
      parts.push(`U-form: Topplist djup ${fmt(u?.depthMm)}, Öppning/bredd ${fmt(u?.centerSpanMm)}, Vänster ben ${fmt(u?.leftLegMm)}, Höger ben ${fmt(u?.rightLegMm)}`);
    }
    if (hasIsland && base !== "Island" && island) {
      parts.push(`Köksö: ${fmt(island?.lengthMm)} × ${fmt(island?.depthMm)}`);
    }
    return parts.join(" • ");
  }, [shape, bench, legA, legB, u, island]);

  return (
    <div className="rounded-2xl border p-4 bg-white overflow-hidden">
      <svg ref={svgRef} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
          </marker>
          <clipPath id="frame">
            <rect x="0" y="0" width={W} height={H} rx="8" ry="8" />
          </clipPath>
        </defs>

        {/* Bakgrund (klippt) */}
        <g clipPath="url(#frame)">
          <rect x="0" y="0" width={W} height={H} fill="#ffffff" />
        </g>

        {/* Former (bänkdelar) */}
        {geom.rects.map((r, i) => {
          const p = layout.P(r.x, r.y);
          const w = layout.toPx(r.w), h = layout.toPx(r.h);
          return (
            <g key={i}>
              <rect x={p.x} y={p.y} width={w} height={h} fill="#f8fafc" stroke="#111827" strokeWidth="1.5" />
              {w > 80 && (
                <text className="label" x={p.x + w/2} y={p.y + h/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#374151">
                  {r.label || ''}
                </text>
              )}
            </g>
          );
        })}

        {/* Mått-pilar */}
        {geom.dims.map((d, i) => {
          const a = layout.P(d.x1, d.y1);
          const b = layout.P(d.x2, d.y2);
          return (
            <g key={`dim-${i}`} className="dimension">
              <line x1={a.x} y1={a.y} x2={a.x} y2={a.y} stroke="#6b7280" />
              <line x1={b.x} y1={b.y} x2={b.x} y2={b.y} stroke="#6b7280" />
              <line
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke="#6b7280"
                strokeWidth="1.5"
                markerStart="url(#arrow)"
                markerEnd="url(#arrow)"
              />
              <text
                x={(a.x + b.x)/2}
                y={(a.y + b.y)/2 - 6}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
                style={{ userSelect: "none" }}
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Utskärningar – diskho (blå) & häll (röd) */}
        {cutouts?.sink && drawCutoutRect(cutouts.sink, layout, "#0ea5e9")}
        {cutouts?.hob  && drawCutoutRect(cutouts.hob,  layout, "#ef4444")}

        {/* Blandarhål: utanför diskhon, MITT EMELLAN vägg (y=0) och diskhons överkant; centrerat över hon */}
        {faucetHole?.enabled && drawFaucet(layout, cutouts?.sink, faucetHole.diameter)}
      </svg>

      {explanation && <p className="mt-2 text-sm text-gray-700">{explanation}</p>}
      <p className="text-xs text-gray-500">
        Illustration med generiska utskärningsmått. Exakta positioner fastställs vid måttning.
      </p>
    </div>
  );
});

export default PreviewCanvas;

/* ---------------- Hjälpare ---------------- */

function fmt(v){ return isFinite(v) ? `${Number(v)} mm` : '—'; }

function drawCutoutRect(c, layout, color){
  if (!isFinite(c.x) || !isFinite(c.y)) return null;
  const p = layout.P(c.x, c.y);
  const w = layout.toPx(c.w), h = layout.toPx(c.d);
  return (
    <g>
      <rect x={p.x} y={p.y} width={w} height={h} fill="none" stroke={color} strokeDasharray="6 4" strokeWidth="2" />
    </g>
  );
}

/**
 * Blandarhål:
 * - X: alltid centrerat mot hon (sink.x + sink.w/2)
 * - Y: mitt emellan bakkant (”vägg”, y=0) och diskhons överkant (sink.y)
 * - Med säkerhetsmarginal så hålet varken nuddar väggen eller skär in i hon
 */
function drawFaucet(layout, sink, diameter = 35){
  let cx = 40, cy = 40; // fallback om ingen ho
  if (sink && isFinite(sink.x) && isFinite(sink.y) && isFinite(sink.w)) {
    const backEdgeY = 0;               // bänkskivans bakkant/”vägg”
    const sinkTopY  = Number(sink.y);  // diskhons överkant

    // Mitt emellan vägg och diskhons överkant
    let midY = (backEdgeY + sinkTopY) / 2;

    // Minsta fria marginal från båda håll: halva diametern + 8 mm slack
    const minClear = (Number(diameter) || 35) / 2 + 8;

    // Kläm inom tillåtet intervall så vi inte nuddar väggen eller går in i hon
    const low  = backEdgeY + minClear;
    const high = sinkTopY - minClear;
    if (low <= high) {
      cy = clamp(midY, low, high);
    } else {
      // Om det är extremt trångt: lägg hålet precis framför hon med 20 mm marginal
      cy = sinkTopY + 20;
    }

    // Alltid centrerat i X över hon
    cx = sink.x + sink.w / 2;
  }

  const p = layout.P(cx, cy);
  const r = Math.max(2, layout.toPx((Number(diameter) || 35) / 2));
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#f59e0b" strokeWidth="2" />
    </g>
  );
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

/* ===========================================================================
   PREVIEWCANVAS – DOKUMENTATION (svenska)
   ---------------------------------------------------------------------------
   Vad komponenten gör
   - Ritar en förenklad planvy av bänkskivan (Straight, L, U) samt ev. köksö.
   - Visar generiska utskärningar (diskho/häll) och kranhål.
   - Skalar allt mm→px för att passa inom 720×420 med marginal (M).
   - Exponerar exportPng({ scale }) via ref för AI image-to-image-rendering.

   Viktiga props
   - shape: "Straight" | "L" | "U" | kombinera med "+Island" för köksö (ex: "Straight+Island").
   - bench, legA, legB, u, island: mm-mått som bygger upp geometrin.
   - cutouts: { sink:{w,d,x,y}, hob:{w,d,x,y} } i millimeter (w=bredd, d=djup).
   - faucetHole: { enabled:boolean, diameter:number }.

   PNG-export
   - Använd i App.jsx:
       const previewRef = useRef(null);
       <PreviewCanvas ref={previewRef} ... />
       const dataUrl = await previewRef.current.exportPng({ scale: 2 });
   - Denna dataUrl kan skickas till /api/ai-render(.php) som init-bild.

   Varför viewBox + xmlns
   - Ger stabilare rasterisering när SVG serialiseras → PNG.

   Vanliga fel & lösningar
   - "Cannot read properties of undefined (includes)": Se till att shape har default (fixat här).
   - Bilden blir blank vid export: säkerställ att SVG har width/height + viewBox + xmlns (fixat här).
   - TypeScript klagar på JSX i .jsx: ställ in tsconfig: { "allowJs": true, "jsx": "react-jsx", "checkJs": false }.

   Loopia (drift)
   - Loopia (Apache/PHP) funkar fint med /public/api/*.php.
   - Frontend byggs med npm run build → ladda upp /dist/ till webbrot.
   - API-anrop i App.jsx (t.ex. api/ai-render.php) ska peka mot korrekt relativ sökväg.
   =========================================================================== */
