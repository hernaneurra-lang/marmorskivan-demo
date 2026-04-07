// src/pages/SketchPage.jsx — 2D countertop technical drawing
import { Printer, ArrowLeft } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function parseConfig() {
  try {
    const raw = new URLSearchParams(window.location.search).get("data");
    return raw ? JSON.parse(atob(raw)) : null;
  } catch { return null; }
}

function buildRects(cfg) {
  const { shape = "Straight", straightSurfaces = [], legA = {}, legB = {}, uShape = {}, island = {} } = cfg;
  const hasIsland = /Island/.test(shape) && island?.lengthMm;
  const rects = [];

  if (!shape.startsWith("Island")) {
    if (shape.startsWith("Straight")) {
      let xOff = 0;
      for (const s of straightSurfaces) {
        rects.push({ x: xOff, y: 0, w: s.lengthMm, h: s.depthMm });
        xOff += s.lengthMm;
      }
    } else if (shape.startsWith("L")) {
      rects.push({ x: 0, y: 0, w: legA.lengthMm, h: legA.depthMm });
      rects.push({ x: legA.lengthMm - legB.depthMm, y: legA.depthMm, w: legB.depthMm, h: legB.lengthMm });
    } else if (shape.startsWith("U")) {
      const { leftLegMm = 0, centerSpanMm = 0, rightLegMm = 0, depthMm = 620 } = uShape;
      const tw = depthMm * 2 + centerSpanMm;
      rects.push({ x: 0, y: 0, w: tw, h: depthMm });
      rects.push({ x: 0, y: depthMm, w: depthMm, h: leftLegMm });
      rects.push({ x: tw - depthMm, y: depthMm, w: depthMm, h: rightLegMm });
    }
  }

  const islandRect = hasIsland ? { w: island.lengthMm, h: island.depthMm } : null;
  return { rects, hasIsland, islandRect };
}

const EDGE_LABELS = { fasad: "Fasad", halvrund: "Halvrund", rakt: "Rak", profil: "Profil" };

// ── SVG dimension annotation helpers ─────────────────────────────────────────

function HDim({ x1, x2, y, label, flip = false }) {
  const mid = (x1 + x2) / 2;
  const dir = flip ? -1 : 1;
  return (
    <g>
      <line x1={x1 + 5} y1={y} x2={x2 - 5} y2={y} stroke="#1d4ed8" strokeWidth="0.9"
        markerStart="url(#aS)" markerEnd="url(#aE)" />
      <line x1={x1} y1={y - 8 * dir} x2={x1} y2={y + 5 * dir} stroke="#1d4ed8" strokeWidth="0.7" />
      <line x1={x2} y1={y - 8 * dir} x2={x2} y2={y + 5 * dir} stroke="#1d4ed8" strokeWidth="0.7" />
      <rect x={mid - 28} y={y - 18} width={56} height={13} rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
      <text x={mid} y={y - 8} textAnchor="middle" fontSize="9.5" fill="#1d4ed8" fontFamily="monospace" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

function VDim({ x, y1, y2, label, right = false }) {
  const mid = (y1 + y2) / 2;
  const dir = right ? 1 : -1;
  const tx = right ? x + 6 : x - 6;
  return (
    <g>
      <line x1={x} y1={y1 + 5} x2={x} y2={y2 - 5} stroke="#1d4ed8" strokeWidth="0.9"
        markerStart="url(#aS)" markerEnd="url(#aE)" />
      <line x1={x - 5 * dir} y1={y1} x2={x + 5 * dir} y2={y1} stroke="#1d4ed8" strokeWidth="0.7" />
      <line x1={x - 5 * dir} y1={y2} x2={x + 5 * dir} y2={y2} stroke="#1d4ed8" strokeWidth="0.7" />
      <rect x={tx - (right ? 2 : 36)} y={mid - 7} width={36} height={13} rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
      <text x={tx + (right ? 16 : -16)} y={mid + 4} textAnchor="middle" fontSize="9.5" fill="#1d4ed8" fontFamily="monospace" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

// ── Plan view SVG ─────────────────────────────────────────────────────────────

const SVG_W = 760, SVG_H = 460;
const MARGIN_T = 50, MARGIN_B = 30, MARGIN_L = 60, MARGIN_R = 60;

function PlanSVG({ cfg, rects }) {
  const { shape = "Straight", legA = {}, legB = {}, uShape = {} } = cfg;

  let maxX = 0, maxY = 0;
  for (const r of rects) {
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  if (!maxX || !maxY) return null;

  const drawW = SVG_W - MARGIN_L - MARGIN_R;
  const drawH = SVG_H - MARGIN_T - MARGIN_B;
  const scale = Math.min(drawW / maxX, drawH / maxY);

  const scaledW = maxX * scale;
  const scaledH = maxY * scale;
  const dx = MARGIN_L + (drawW - scaledW) / 2;
  const dy = MARGIN_T + (drawH - scaledH) / 2;

  // Dimension annotations
  const dims = [];
  if (shape.startsWith("Straight")) {
    dims.push({ type: "h", x1: dx, x2: dx + maxX * scale, y: dy - 22, label: `${maxX} mm` });
    dims.push({ type: "v", x: dx + maxX * scale + 26, y1: dy, y2: dy + maxY * scale, label: `${maxY} mm`, right: true });
  } else if (shape.startsWith("L")) {
    dims.push({ type: "h", x1: dx, x2: dx + (legA.lengthMm || 0) * scale, y: dy - 22, label: `${legA.lengthMm} mm` });
    dims.push({ type: "v", x: dx + maxX * scale + 26, y1: dy, y2: dy + maxY * scale, label: `${maxY} mm`, right: true });
    if (legB.depthMm) {
      const bx1 = dx + ((legA.lengthMm || 0) - (legB.depthMm || 0)) * scale;
      const bx2 = dx + (legA.lengthMm || 0) * scale;
      dims.push({ type: "h", x1: bx1, x2: bx2, y: dy + maxY * scale + 22, label: `${legB.depthMm} mm`, flip: true });
    }
  } else if (shape.startsWith("U")) {
    const { depthMm = 620, leftLegMm = 0, centerSpanMm = 0 } = uShape;
    const tw = depthMm * 2 + centerSpanMm;
    dims.push({ type: "h", x1: dx, x2: dx + tw * scale, y: dy - 22, label: `${tw} mm` });
    dims.push({ type: "v", x: dx - 26, y1: dy, y2: dy + maxY * scale, label: `${maxY} mm` });
    if (centerSpanMm > 0) {
      dims.push({ type: "h", x1: dx + depthMm * scale, x2: dx + (depthMm + centerSpanMm) * scale, y: dy + depthMm * scale / 2, label: `${centerSpanMm} mm` });
    }
  }

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxHeight: 460 }}>
      <defs>
        <marker id="aS" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <polyline points="7,0 0,3.5 7,7" fill="none" stroke="#1d4ed8" strokeWidth="1.2" />
        </marker>
        <marker id="aE" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polyline points="0,0 7,3.5 0,7" fill="none" stroke="#1d4ed8" strokeWidth="1.2" />
        </marker>
      </defs>

      <rect width={SVG_W} height={SVG_H} fill="#f8fafc" />

      {/* Grid dots */}
      <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="0.8" fill="#e2e8f0" />
      </pattern>
      <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

      {/* Countertop shapes */}
      <g>
        {rects.map((r, i) => (
          <g key={i}>
            <rect
              x={dx + r.x * scale} y={dy + r.y * scale}
              width={r.w * scale} height={r.h * scale}
              fill="#d6d3d1" stroke="#78716c" strokeWidth="1.5"
            />
            {/* Stone texture hint */}
            <rect
              x={dx + r.x * scale + 2} y={dy + r.y * scale + 2}
              width={r.w * scale - 4} height={r.h * scale - 4}
              fill="none" stroke="#a8a29e" strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          </g>
        ))}
      </g>

      {/* Dimension annotations */}
      {dims.map((d, i) =>
        d.type === "h"
          ? <HDim key={i} x1={d.x1} x2={d.x2} y={d.y} label={d.label} flip={d.flip} />
          : <VDim key={i} x={d.x} y1={d.y1} y2={d.y2} label={d.label} right={d.right} />
      )}

      {/* Label */}
      <text x={SVG_W / 2} y={SVG_H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
        Planvy · Ej i skala · {shape}
      </text>
    </svg>
  );
}

// ── Side profile SVG ──────────────────────────────────────────────────────────

function ProfileSVG({ cfg }) {
  const thickMm = cfg.thicknessMm || 20;
  const depthMm = cfg.straightSurfaces?.[0]?.depthMm || cfg.legA?.depthMm || cfg.uShape?.depthMm || 620;
  const edgeLabel = EDGE_LABELS[cfg.edgeType] || cfg.edgeType || "Fasad";
  const PROFILE_H = 130;
  const barW = 220;
  const barX = 50;
  // Scale thickness to ~40-80px
  const thickPx = Math.max(28, Math.min(72, thickMm * 2.2));
  const barY = (PROFILE_H - thickPx) / 2 - 10;

  return (
    <svg viewBox={`0 0 320 ${PROFILE_H}`} width="100%">
      <defs>
        <marker id="bS" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <polyline points="7,0 0,3.5 7,7" fill="none" stroke="#1d4ed8" strokeWidth="1.2" />
        </marker>
        <marker id="bE" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polyline points="0,0 7,3.5 0,7" fill="none" stroke="#1d4ed8" strokeWidth="1.2" />
        </marker>
      </defs>
      <rect width="320" height={PROFILE_H} fill="#f8fafc" />

      {/* Countertop cross-section */}
      <rect x={barX} y={barY} width={barW} height={thickPx} fill="#d6d3d1" stroke="#78716c" strokeWidth="1.5" />
      <rect x={barX + 2} y={barY + 2} width={barW - 4} height={thickPx - 4} fill="none" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="3 3" />

      {/* Thickness dim (left side) */}
      <line x1="34" y1={barY + 5} x2="34" y2={barY + thickPx - 5} stroke="#1d4ed8" strokeWidth="0.9" markerStart="url(#bS)" markerEnd="url(#bE)" />
      <line x1="27" y1={barY} x2="42" y2={barY} stroke="#1d4ed8" strokeWidth="0.7" />
      <line x1="27" y1={barY + thickPx} x2="42" y2={barY + thickPx} stroke="#1d4ed8" strokeWidth="0.7" />
      <rect x="0" y={barY + thickPx / 2 - 7} width="30" height="13" rx="2" fill="#f8fafc" />
      <text x="15" y={barY + thickPx / 2 + 4} textAnchor="middle" fontSize="9" fill="#1d4ed8" fontFamily="monospace" fontWeight="700">
        {thickMm} mm
      </text>

      {/* Depth dim (bottom) */}
      <line x1={barX + 5} y1={barY + thickPx + 14} x2={barX + barW - 5} y2={barY + thickPx + 14} stroke="#1d4ed8" strokeWidth="0.9" markerStart="url(#bS)" markerEnd="url(#bE)" />
      <line x1={barX} y1={barY + thickPx + 7} x2={barX} y2={barY + thickPx + 20} stroke="#1d4ed8" strokeWidth="0.7" />
      <line x1={barX + barW} y1={barY + thickPx + 7} x2={barX + barW} y2={barY + thickPx + 20} stroke="#1d4ed8" strokeWidth="0.7" />

      {/* Edge treatment label */}
      <text x={barX + barW / 2} y={barY + thickPx + 26} textAnchor="middle" fontSize="8.5" fill="#64748b" fontFamily="sans-serif">
        {depthMm} mm djup · kant: {edgeLabel} polering
      </text>
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SketchPage() {
  const cfg = parseConfig();

  if (!cfg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-lg">Ingen ritningsdata hittades.</p>
          <a href="/app" className="text-emerald-600 underline text-sm">Tillbaka till kalkylatorn</a>
        </div>
      </div>
    );
  }

  const { rects } = buildRects(cfg);
  const material = (cfg.material || "").replace(/_/g, " ");
  const edgeLabel = EDGE_LABELS[cfg.edgeType] || cfg.edgeType || "Fasad";
  const date = new Date().toLocaleDateString("sv-SE");

  const specRows = [
    ["Material", material || "–"],
    ["Tjocklek", `${cfg.thicknessMm || 20} mm`],
    ["Form", cfg.shape || "–"],
    ["Kant", `${edgeLabel} polering`],
  ];

  if (cfg.shape?.startsWith("Straight") && cfg.straightSurfaces?.length) {
    cfg.straightSurfaces.forEach((s, i) => {
      specRows.push([`Bänkskiva ${i + 1}`, `${s.lengthMm} × ${s.depthMm} mm`]);
    });
  } else if (cfg.shape?.startsWith("L")) {
    specRows.push(["Ben A", `${cfg.legA?.lengthMm} × ${cfg.legA?.depthMm} mm`]);
    specRows.push(["Ben B", `${cfg.legB?.lengthMm} mm lång × ${cfg.legB?.depthMm} mm djup`]);
  } else if (cfg.shape?.startsWith("U")) {
    const u = cfg.uShape || {};
    specRows.push(["Djup", `${u.depthMm} mm`]);
    specRows.push(["Vänster ben", `${u.leftLegMm} mm`]);
    specRows.push(["Mitten", `${u.centerSpanMm} mm`]);
    specRows.push(["Höger ben", `${u.rightLegMm} mm`]);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Screen header */}
      <div className="print:hidden bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/app" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft size={15} /> Tillbaka
          </a>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Teknisk ritning</h1>
            <p className="text-xs text-gray-400">
              {material} · {cfg.thicknessMm} mm · {edgeLabel} kant
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition"
        >
          <Printer size={14} /> Skriv ut / Spara PDF
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:flex justify-between items-start px-8 pt-6 pb-4 border-b">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bänkskiveritning — {material}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cfg.thicknessMm} mm · {edgeLabel} kantbearbetning · {cfg.shape}
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p className="font-semibold text-gray-600">marmorskivan.se</p>
          <p>{date}</p>
          <p className="mt-1 italic">Skiss — ej konstruktionsritning</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 print:px-8 print:py-4 print:space-y-6">
        {/* Plan view */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Planvy — uppifrån</h2>
          <div className="border rounded-2xl overflow-hidden bg-gray-50 print:rounded-none print:border-gray-400">
            <PlanSVG cfg={cfg} rects={rects} />
          </div>
        </div>

        {/* Profile + Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Profil — frontvy</h2>
            <div className="border rounded-2xl overflow-hidden bg-gray-50 print:rounded-none print:border-gray-400">
              <ProfileSVG cfg={cfg} />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Specifikation</h2>
            <div className="border rounded-2xl overflow-hidden print:rounded-none print:border-gray-400">
              <table className="w-full text-sm">
                <tbody>
                  {specRows.map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0">
                      <td className="px-4 py-2.5 text-gray-400 font-medium w-2/5 bg-gray-50 text-xs uppercase tracking-wide print:bg-gray-100">
                        {k}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 font-semibold text-sm">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-300 text-center print:text-gray-400">
          Ritningen är schematisk och inte i skala. Måtten avser materialet utan fogavdrag,
          montagetoleranser eller eventuella urtag. Slutlig ritning upprättas vid mätbesök.
        </p>
      </div>
    </div>
  );
}
