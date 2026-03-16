// Path: src/components/ShapeDiagram.jsx
import React from "react";

/**
 * ShapeDiagram (STATISK, informativ)
 * - Skalar ned så allt ryms i boxen, centrerar
 * - L/U kant-i-kant, räta hörn
 * - Måttlinjer utanför, etiketter mitt på linjen
 * - Köksö har Lk/Dk (statiskt – en ö i denna vy)
 */
export default function ShapeDiagram({ shape, className = "" }) {
  const key =
    shape === "Straight"        ? "straight" :
    shape === "Straight+Island" ? "straight_island" :
    shape === "L"               ? "l" :
    shape === "L+Island"        ? "l_island" :
    shape === "U"               ? "u" :
    shape === "U+Island"        ? "u_island" :
    "island";

  // Rityta
  const W = 720, H = 240;
  const PAD = 20;
  const DM  = 46;        // plats för måttlinjer runt figuren
  const SAFE = 0.94;

  // Normaliserade oskalade mått
  const D  = 60;
  const dL = 60, dR = 60;
  const L1 = 300, L2 = 260, L3 = 300;
  const Iw = 120, Il = 280;

  // Bygg delar i oskala
  const parts = [];
  let island = null;

  if (key === "straight" || key === "straight_island") {
    parts.push({ id: "T", x: 0, y: 0, w: 520, h: D });
    if (key === "straight_island") island = { x: 0, y: D + 36, w: Il, h: Iw };
  } else if (key === "l" || key === "l_island") {
    const A = { id: "A", x: 0,   y: 0,   w: 420, h: dL };
    const B = { id: "B", x: 0,   y: A.h, w: dR,  h: L2 };
    parts.push(A, B);
    if (key === "l_island") {
      island = { x: 210 - Il / 2, y: A.h + B.h + 36, w: Il, h: Iw };
    }
  } else if (key === "u" || key === "u_island") {
    const T = { id: "T", x: 0, y: 0, w: dL + L2 + dR, h: D };
    const L = { id: "L", x: 0,        y: T.h, w: dL, h: L1 };
    const R = { id: "R", x: T.w - dR, y: T.h, w: dR, h: L3 };
    parts.push(T, L, R);
    if (key === "u_island") {
      const under = Math.max(L.y + L.h, R.y + R.h);
      island = { x: T.x + (T.w - Il) / 2, y: under + 36, w: Il, h: Iw };
    }
  } else {
    island = { x: 0, y: 0, w: Il, h: Iw }; // Endast köksö
  }

  // Bounding i oskala
  const contentW = Math.max(...parts.map(p => p.x + p.w), island ? island.x + island.w : 0);
  const contentH = Math.max(...parts.map(p => p.y + p.h), island ? island.y + island.h : 0);

  // Skala/centrering (inklusive marginal för måttlinjer)
  const innerW = W - PAD * 2, innerH = H - PAD * 2;
  const scale = SAFE * Math.min(innerW / (contentW + DM * 2), innerH / (contentH + DM * 2));
  const ox = Math.round((W - (contentW * scale + DM * 2)) / 2) + DM;
  const oy = Math.round((H - (contentH * scale + DM * 2)) / 2) + DM;

  const sx = (v) => ox + v * scale;
  const sy = (v) => oy + v * scale;
  const sw = (v) => v * scale;
  const sh = (v) => v * scale;

  const Rect = ({ x, y, w, h }) => (
    <rect x={sx(x)} y={sy(y)} width={sw(w)} height={sh(h)} fill="#eee" stroke="#222"
      strokeWidth="1.5" shapeRendering="crispEdges" />
  );
  const DimH = ({ x1, x2, y, label }) => (
    <g stroke="#222" fill="#222">
      <line x1={sx(x1)} y1={sy(y)} x2={sx(x2)} y2={sy(y)} />
      <line x1={sx(x1)} y1={sy(y)} x2={sx(x1) + 7} y2={sy(y) - 7} />
      <line x1={sx(x1)} y1={sy(y)} x2={sx(x1) + 7} y2={sy(y) + 7} />
      <line x1={sx(x2)} y1={sy(y)} x2={sx(x2) - 7} y2={sy(y) - 7} />
      <line x1={sx(x2)} y1={sy(y)} x2={sx(x2) - 7} y2={sy(y) + 7} />
      <text x={(sx(x1) + sx(x2)) / 2} y={sy(y) - 9} textAnchor="middle" fontSize="13" fill="#111">{label}</text>
    </g>
  );
  const DimV = ({ x, y1, y2, label }) => (
    <g stroke="#222" fill="#222">
      <line x1={sx(x)} y1={sy(y1)} x2={sx(x)} y2={sy(y2)} />
      <line x1={sx(x)} y1={sy(y1)} x2={sx(x) - 7} y2={sy(y1) + 7} />
      <line x1={sx(x)} y1={sy(y1)} x2={sx(x) + 7} y2={sy(y1) + 7} />
      <line x1={sx(x)} y1={sy(y2)} x2={sx(x) - 7} y2={sy(y2) - 7} />
      <line x1={sx(x)} y1={sy(y2)} x2={sx(x) + 7} y2={sy(y2) - 7} />
      <text x={sx(x) - 8} y={(sy(y1) + sy(y2)) / 2} textAnchor="end" dominantBaseline="middle" fontSize="13" fill="#111">
        {label}
      </text>
    </g>
  );

  // Måttlinjer (bänk)
  const dims = [];
  if (key === "straight" || key === "straight_island") {
    const T = parts[0];
    dims.push(<DimH key="L1" x1={T.x} x2={T.x + T.w} y={T.y - (DM - 10)} label="L1" />);
    dims.push(<DimV key="D1" x={T.x + T.w + (DM - 10)} y1={T.y} y2={T.y + T.h} label="D1" />);
  } else if (key === "l" || key === "l_island") {
    const A = parts[0], B = parts[1];
    dims.push(<DimH key="L1" x1={A.x} x2={A.x + A.w} y={A.y - (DM - 10)} label="L1" />);
    dims.push(<DimV key="D1" x={A.x + A.w + (DM - 10)} y1={A.y} y2={A.y + A.h} label="D1" />);
    dims.push(<DimV key="L2" x={B.x - (DM - 10)} y1={B.y} y2={B.y + B.h} label="L2" />);
    dims.push(<DimH key="D2" x1={B.x} x2={B.x + B.w} y={B.y + B.h + (DM - 10)} label="D2" />);
  } else if (key === "u" || key === "u_island") {
    const T = parts[0], L = parts[1], R = parts[2];
    dims.push(<DimH key="L2" x1={T.x} x2={T.x + T.w} y={T.y - (DM - 10)} label="L2" />);
    dims.push(<DimV key="D2" x={T.x - (DM - 10)} y1={T.y} y2={T.y + T.h} label="D2" />);
    dims.push(<DimV key="L1" x={L.x - (DM - 10)} y1={L.y} y2={L.y + L.h} label="L1" />);
    dims.push(<DimV key="L3" x={R.x + R.w + (DM - 10)} y1={R.y} y2={R.y + R.h} label="L3" />);
    dims.push(<DimH key="D1" x1={L.x} x2={L.x + L.w} y={L.y + L.h + (DM - 10)} label="D1" />);
    dims.push(<DimH key="D3" x1={R.x} x2={R.x + R.w} y={R.y + R.h + (DM - 10)} label="D3" />);
  }

  // Köksö + Lk/Dk (statiskt bara en i denna vy)
  const islandDims = [];
  if (island) {
    islandDims.push(<Rect key="island" {...island} />);
    islandDims.push(<DimH key="Lk" x1={island.x} x2={island.x + island.w} y={island.y - (DM - 10)} label="Lk" />);
    islandDims.push(<DimV key="Dk" x={island.x + island.w + (DM - 10)} y1={island.y} y2={island.y + island.h} label="Dk" />);
  }

  return (
    <div className={`relative w-full h-56 rounded-xl border bg-white overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {parts.map((p, i) => <Rect key={i} {...p} />)}
        {islandDims}
        {dims}
      </svg>
    </div>
  );
}
