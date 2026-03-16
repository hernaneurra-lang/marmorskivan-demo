// Path: src/components/MeasurementGuide.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * MeasurementGuide – tydligare pilar
 * - Dubbelpilar (SVG markers) + förlängningslinjer från verklig kant.
 * - Kant-highlight på den kant som dimensionen avser (pedagogiskt för L/U).
 * - Måttlinjer utanför figuren, etiketter mitt på linjen.
 * - Köksö: Lk/Dk (+ index vid flera öar). Extra ytor numreras vidare.
 */
export default function MeasurementGuide({ shape, dims = {}, cutouts = {} }) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(false);

  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("measurementGuide.title", { defaultValue: "Measurement guide (mm)" })}
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            {t("measurementGuide.desc", {
              defaultValue:
                "Length/depth per part: L1/D1, L2/D2, L3/D3 … Island: Lk/Dk (Lk1/Dk1, …). Extra surfaces continue numbering (L4/D4, L5/D5, …). All dimensions are shown outside the figure.",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setZoom(true)}
          className="ml-3 px-3 py-1.5 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100"
        >
          {t("measurementGuide.enlarge", { defaultValue: "Enlarge" })}
        </button>
      </div>

      {/* Inline-ritning i fast, rymlig box */}
      <div className="relative w-full h-[420px] rounded-xl border bg-white overflow-hidden">
        <GuideSVG shape={shape} dims={dims} cutouts={cutouts} width={1000} height={420} fillParent />
      </div>

      {/* Modal – större än inline */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <div
            className="bg-white rounded-2xl border shadow-xl w-[min(95vw,1600px)] h-[min(90vh,900px)] p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">
                {t("measurementGuide.modalTitle", { defaultValue: "Measurement guide – enlarged" })}
              </h4>
              <button
                className="px-2 py-1 rounded-md border bg-gray-50 hover:bg-gray-100"
                onClick={() => setZoom(false)}
              >
                {t("measurementGuide.close", { defaultValue: "Close" })}
              </button>
            </div>
            <div className="relative flex-1">
              <GuideSVG shape={shape} dims={dims} cutouts={cutouts} width={1600} height={900} fillParent />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------- SVG -------------------- */

function GuideSVG({ shape, dims, cutouts, width, height, fillParent = false }) {
  const { t } = useTranslation();

  const v = useMemo(
    () => computeLayout(shape, dims, cutouts, width, height),
    [shape, dims, cutouts, width, height]
  );

  const Rect = (p, props = {}) => (
    <rect
      x={v.sx(p.x)}
      y={v.sy(p.y)}
      width={v.sw(p.w)}
      height={v.sh(p.h)}
      fill="#f6f6f6"
      stroke="#111"
      strokeWidth="1.5"
      shapeRendering="crispEdges"
      {...props}
    />
  );

  // Diskret highlight på kanten som dimensionen avser
  const HLH = ({ x1, x2, y }) => (
    <line
      x1={v.sx(x1)}
      y1={v.sy(y)}
      x2={v.sx(x2)}
      y2={v.sy(y)}
      stroke="#7c3aed"
      strokeWidth="3"
      opacity="0.45"
    />
  );
  const HLV = ({ x, y1, y2 }) => (
    <line
      x1={v.sx(x)}
      y1={v.sy(y1)}
      x2={v.sx(x)}
      y2={v.sy(y2)}
      stroke="#7c3aed"
      strokeWidth="3"
      opacity="0.45"
    />
  );

  // Förlängningslinjer (tunna, streckade) från kanten ut till måttlinjen
  const ExtV = ({ x, y1, y2 }) => (
    <line
      x1={v.sx(x)}
      y1={v.sy(y1)}
      x2={v.sx(x)}
      y2={v.sy(y2)}
      stroke="#999"
      strokeWidth="1"
      strokeDasharray="4 4"
    />
  );
  const ExtH = ({ x1, x2, y }) => (
    <line
      x1={v.sx(x1)}
      y1={v.sy(y)}
      x2={v.sx(x2)}
      y2={v.sy(y)}
      stroke="#999"
      strokeWidth="1"
      strokeDasharray="4 4"
    />
  );

  // Dubbelpilar med SVG markers
  const DimH = ({ x1, x2, y, label, yRef }) => (
    <g>
      {typeof yRef === "number" && (
        <>
          <ExtV x={x1} y1={Math.min(y, yRef)} y2={Math.max(y, yRef)} />
          <ExtV x={x2} y1={Math.min(y, yRef)} y2={Math.max(y, yRef)} />
        </>
      )}
      <line
        x1={v.sx(x1)}
        y1={v.sy(y)}
        x2={v.sx(x2)}
        y2={v.sy(y)}
        stroke="#111"
        strokeWidth="1.5"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      <text x={(v.sx(x1) + v.sx(x2)) / 2} y={v.sy(y) - 8} textAnchor="middle" fontSize="13" fill="#111">
        {label}
      </text>
    </g>
  );

  const DimV = ({ x, y1, y2, label, xRef }) => (
    <g>
      {typeof xRef === "number" && (
        <>
          <ExtH x1={Math.min(x, xRef)} x2={Math.max(x, xRef)} y={y1} />
          <ExtH x1={Math.min(x, xRef)} x2={Math.max(x, xRef)} y={y2} />
        </>
      )}
      <line
        x1={v.sx(x)}
        y1={v.sy(y1)}
        x2={v.sx(x)}
        y2={v.sy(y2)}
        stroke="#111"
        strokeWidth="1.5"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      <text
        x={v.sx(x) - 8}
        y={(v.sy(y1) + v.sy(y2)) / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize="13"
        fill="#111"
      >
        {label}
      </text>
    </g>
  );

  const legend = {
    bench: t("measurementGuide.legend.bench", { defaultValue: "Worktop surface" }),
    sink: t("measurementGuide.legend.sink", { defaultValue: "Sink cutout" }),
    hob: t("measurementGuide.legend.hob", { defaultValue: "Hob cutout" }),
    faucet: t("measurementGuide.legend.faucet", { defaultValue: "Tap hole" }),
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: fillParent ? "100%" : undefined, height: fillParent ? "100%" : undefined }}
      className={`bg-white ${fillParent ? "absolute inset-0" : "block"} border rounded-xl`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
        </marker>
      </defs>

      {/* Legend */}
      <g fontSize="13" fill="#111">
        <rect x={v.PAD} y={v.PAD - 18} width="12" height="12" fill="#f6f6f6" stroke="#111" />
        <text x={v.PAD + 18} y={v.PAD - 6}>
          {legend.bench}
        </text>

        <rect
          x={v.PAD + 170}
          y={v.PAD - 18}
          width="16"
          height="12"
          fill="none"
          stroke="#06b6d4"
          strokeDasharray="6 4"
        />
        <text x={v.PAD + 192} y={v.PAD - 6}>
          {legend.sink}
        </text>

        <rect
          x={v.PAD + 310}
          y={v.PAD - 18}
          width="16"
          height="12"
          fill="none"
          stroke="#ef4444"
          strokeDasharray="6 4"
        />
        <text x={v.PAD + 332} y={v.PAD - 6}>
          {legend.hob}
        </text>

        <circle cx={v.PAD + 420} cy={v.PAD - 12} r="4" fill="#f59e0b" />
        <text x={v.PAD + 432} y={v.PAD - 6}>
          {legend.faucet}
        </text>
      </g>

      {/* Bänkytor */}
      {v.parts.map((p, i) => (
        <Rect key={`p-${i}`} {...p} />
      ))}

      {/* Extra ytor */}
      {v.extras.map((p, i) => (
        <Rect key={`x-${i}`} {...p} />
      ))}

      {/* Öar */}
      {v.islands.map((isle, i) => (
        <Rect key={`is-${i}`} {...isle} />
      ))}

      {/* Kant-highlights */}
      {v.hl.map((h, i) =>
        h.dir === "H" ? (
          <HLH key={`hlh-${i}`} x1={h.x1} x2={h.x2} y={h.y} />
        ) : (
          <HLV key={`hlv-${i}`} x={h.x} y1={h.y1} y2={h.y2} />
        )
      )}

      {/* Måttlinjer */}
      {v.dim.map((d, i) =>
        d.dir === "H" ? (
          <DimH key={`dh-${i}`} x1={d.x1} x2={d.x2} y={d.y} yRef={d.yRef} label={d.t} />
        ) : (
          <DimV key={`dv-${i}`} x={d.x} y1={d.y1} y2={d.y2} xRef={d.xRef} label={d.t} />
        )
      )}

      {/* Hål */}
      {v.holes.map((h, i) =>
        h.type === "faucet" ? (
          <circle key={`fh-${i}`} cx={h.cx} cy={h.cy} r="4" fill="#f59e0b" />
        ) : (
          <rect
            key={`rh-${i}`}
            x={h.x}
            y={h.y}
            width={h.w}
            height={h.h}
            fill="none"
            stroke={h.type === "sink" ? "#06b6d4" : "#ef4444"}
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        )
      )}
    </svg>
  );
}

/* ----------------- geometri & skalning ----------------- */

function computeLayout(shape, dims, cutouts, W, H) {
  const PAD = 20;
  const DM = 46;
  const SAFE = 0.94;

  const s = (shape || "straight").toLowerCase();
  const base = s.replace("_island", "");
  const N = (v, d = 0) => (Number(v) || d);

  // oskalad bänkgeometri
  const D = N(dims.D, 620);
  const dA = N(dims.dA, D);
  const dB = N(dims.dB, D);
  const dL = N(dims.dL, D);
  const dC = N(dims.dC, D);
  const dR = N(dims.dR, D);

  const parts = [];

  if (base === "straight") {
    const L1 = N(dims.L1, 2400);
    parts.push({ x: 0, y: 0, w: L1, h: D });
  } else if (base === "island") {
    // inga bänkar – bara öar
  } else if (base === "l") {
    const L1 = N(dims.L1, 2000),
      L2 = N(dims.L2, 1600);
    const A = { x: 0, y: 0, w: L1, h: dA };
    const B = { x: 0, y: dA, w: dB, h: L2 };
    parts.push(A, B);
  } else {
    // "u"
    const L1 = N(dims.L1, 1800),
      L2 = N(dims.L2, 1800),
      L3 = N(dims.L3, 1800);
    const T = { x: 0, y: 0, w: dL + L2 + dR, h: dC };
    const L = { x: 0, y: dC, w: dL, h: L1 };
    const R = { x: T.w - dR, y: dC, w: dR, h: L3 };
    parts.push(T, L, R);
  }

  /* ---------- ÖAR ---------- */
  const islandsInput = Array.isArray(dims.islands) ? dims.islands : [];
  const hasSingle = N(dims.I_L) > 0 && N(dims.I_W) > 0;
  const islandsRaw =
    islandsInput.length > 0
      ? islandsInput
          .filter((it) => N(it?.I_L) > 0 && N(it?.I_W) > 0)
          .map((it) => ({ w: N(it.I_L), h: N(it.I_W) }))
      : hasSingle
      ? [{ w: N(dims.I_L), h: N(dims.I_W) }]
      : [];

  /* ---------- EXTRA YTOR ---------- */
  const extrasInput = Array.isArray(dims.extraSurfaces)
    ? dims.extraSurfaces
    : Array.isArray(dims.extras)
    ? dims.extras
    : Array.isArray(dims.benchRects)
    ? dims.benchRects
    : [];

  const extrasRaw = extrasInput
    .map((it) => ({
      w: N(it.L ?? it.length ?? it.lengthMm ?? it.w),
      h: N(it.D ?? it.depth ?? it.depthMm ?? it.h ?? D),
    }))
    .filter((r) => r.w > 0 && r.h > 0);

  const groupW = parts.length ? Math.max(...parts.map((p) => p.x + p.w)) : 0;
  const groupH = parts.length ? Math.max(...parts.map((p) => p.y + p.h)) : 0;

  // Lägg öar under bänk
  const IS_GAP = 180;
  const islands = islandsRaw.map((it, idx) => {
    const totalIsW = islandsRaw.reduce((s, a) => s + a.w, 0) + IS_GAP * Math.max(0, islandsRaw.length - 1);
    const leftStart = (Math.max(groupW, totalIsW) - totalIsW) / 2;
    const x = leftStart + islandsRaw.slice(0, idx).reduce((s, a) => s + a.w + IS_GAP, 0);
    const y = groupH + (parts.length ? 240 : 0);
    return { x, y, w: it.w, h: it.h };
  });

  const afterIslandsY = islands.length
    ? Math.max(...islands.map((i) => i.y + i.h)) + 120
    : groupH + (parts.length ? 120 : 0);

  const EX_GAP_Y = 120;
  const extras = extrasRaw.map((it, idx) => {
    const x = (Math.max(groupW, it.w) - it.w) / 2;
    const y = afterIslandsY + idx * (it.h + EX_GAP_Y);
    return { x, y, w: it.w, h: it.h };
  });

  const contentW = Math.max(
    parts.length ? Math.max(...parts.map((p) => p.x + p.w)) : 0,
    islands.length ? Math.max(...islands.map((i) => i.x + i.w)) : 0,
    extras.length ? Math.max(...extras.map((e) => e.x + e.w)) : 0
  );
  const contentH = Math.max(
    parts.length ? Math.max(...parts.map((p) => p.y + p.h)) : 0,
    islands.length ? Math.max(...islands.map((i) => i.y + i.h)) : 0,
    extras.length ? Math.max(...extras.map((e) => e.y + e.h)) : 0
  );

  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const scale = SAFE * Math.min(innerW / (contentW + DM * 2), innerH / (contentH + DM * 2));
  const ox = Math.round((W - (contentW * scale + DM * 2)) / 2) + DM;
  const oy = Math.round((H - (contentH * scale + DM * 2)) / 2) + DM;

  const sx = (v) => ox + v * scale;
  const sy = (v) => oy + v * scale;
  const sw = (v) => v * scale;
  const sh = (v) => v * scale;

  /* ---------- Hål (symboliskt) ---------- */
  const holes = [];
  const SINK = { w: sw(500), d: sh(400) };
  const HOB = { w: sw(560), d: sh(490) };
  const main = parts[0];

  if (main) {
    const sinkX = sx(main.x) + Math.max(20, sw(main.w) * 0.25 - SINK.w / 2);
    const hobX = sx(main.x) + Math.max(20, sw(main.w) * 0.7 - HOB.w / 2);
    const cy = sy(main.y) + sh(main.h) / 2;

    if ((cutouts?.sink || 0) > 0)
      holes.push({ type: "sink", x: sinkX, y: cy - SINK.d / 2, w: SINK.w, d: SINK.d, h: SINK.d });

    if ((cutouts?.hob || 0) > 0)
      holes.push({ type: "hob", x: hobX, y: cy - HOB.d / 2, w: HOB.w, d: HOB.d, h: HOB.d });

    if ((cutouts?.faucet || 0) > 0) {
      const backWallY = sy(main.y);
      const sinkTopY = cy - SINK.d / 2;
      holes.push({ type: "faucet", cx: sinkX + SINK.w / 2, cy: backWallY + (sinkTopY - backWallY) / 2 });
    }
  }

  /* ---------- Måttlinjer + highlights ---------- */
  const dim = [];
  const hl = [];

  if (base === "straight") {
    const p = parts[0];
    dim.push({ dir: "H", x1: p.x, x2: p.x + p.w, y: p.y - (DM - 10), yRef: p.y, t: "L1" });
    hl.push({ dir: "H", x1: p.x, x2: p.x + p.w, y: p.y });
    dim.push({ dir: "V", x: p.x + p.w + (DM - 10), y1: p.y, y2: p.y + p.h, xRef: p.x + p.w, t: "D1" });
    hl.push({ dir: "V", x: p.x + p.w, y1: p.y, y2: p.y + p.h });
  } else if (base === "l") {
    const A = parts[0],
      B = parts[1];
    dim.push({ dir: "H", x1: A.x, x2: A.x + A.w, y: A.y - (DM - 10), yRef: A.y, t: "L1" });
    hl.push({ dir: "H", x1: A.x, x2: A.x + A.w, y: A.y });
    dim.push({ dir: "V", x: A.x + A.w + (DM - 10), y1: A.y, y2: A.y + A.h, xRef: A.x + A.w, t: "D1" });
    hl.push({ dir: "V", x: A.x + A.w, y1: A.y, y2: A.y + A.h });
    dim.push({ dir: "V", x: B.x - (DM - 10), y1: B.y, y2: B.y + B.h, xRef: B.x, t: "L2" });
    hl.push({ dir: "V", x: B.x, y1: B.y, y2: B.y + B.h });
    dim.push({ dir: "H", x1: B.x, x2: B.x + B.w, y: B.y + B.h + (DM - 10), yRef: B.y + B.h, t: "D2" });
    hl.push({ dir: "H", x1: B.x, x2: B.x + B.w, y: B.y + B.h });
  } else if (base === "u") {
    const T = parts[0],
      L = parts[1],
      R = parts[2];
    dim.push({ dir: "H", x1: T.x, x2: T.x + T.w, y: T.y - (DM - 10), yRef: T.y, t: "L2" });
    hl.push({ dir: "H", x1: T.x, x2: T.x + T.w, y: T.y });
    dim.push({ dir: "V", x: T.x - (DM - 10), y1: T.y, y2: T.y + T.h, xRef: T.x, t: "D2" });
    hl.push({ dir: "V", x: T.x, y1: T.y, y2: T.y + T.h });
    dim.push({ dir: "V", x: L.x - (DM - 10), y1: L.y, y2: L.y + L.h, xRef: L.x, t: "L1" });
    hl.push({ dir: "V", x: L.x, y1: L.y, y2: L.y + L.h });
    dim.push({ dir: "V", x: R.x + R.w + (DM - 10), y1: R.y, y2: R.y + R.h, xRef: R.x + R.w, t: "L3" });
    hl.push({ dir: "V", x: R.x + R.w, y1: R.y, y2: R.y + R.h });
    dim.push({ dir: "H", x1: L.x, x2: L.x + L.w, y: L.y + L.h + (DM - 10), yRef: L.y + L.h, t: "D1" });
    hl.push({ dir: "H", x1: L.x, x2: L.x + L.w, y: L.y + L.h });
    dim.push({ dir: "H", x1: R.x, x2: R.x + R.w, y: R.y + R.h + (DM - 10), yRef: R.y + R.h, t: "D3" });
    hl.push({ dir: "H", x1: R.x, x2: R.x + R.w, y: R.y + R.h });
  }

  islands.forEach((isle, idx) => {
    const suffix = islands.length > 1 ? String(idx + 1) : "";
    dim.push({ dir: "H", x1: isle.x, x2: isle.x + isle.w, y: isle.y - (DM - 10), yRef: isle.y, t: `Lk${suffix}` });
    hl.push({ dir: "H", x1: isle.x, x2: isle.x + isle.w, y: isle.y });
    dim.push({
      dir: "V",
      x: isle.x + isle.w + (DM - 10),
      y1: isle.y,
      y2: isle.y + isle.h,
      xRef: isle.x + isle.w,
      t: `Dk${suffix}`,
    });
    hl.push({ dir: "V", x: isle.x + isle.w, y1: isle.y, y2: isle.y + isle.h });
  });

  const baseCount = base === "straight" ? 1 : base === "l" ? 2 : base === "u" ? 3 : 0;
  extras.forEach((ex, i) => {
    const n = baseCount + (i + 1);
    dim.push({ dir: "H", x1: ex.x, x2: ex.x + ex.w, y: ex.y - (DM - 10), yRef: ex.y, t: `L${n}` });
    hl.push({ dir: "H", x1: ex.x, x2: ex.x + ex.w, y: ex.y });
    dim.push({ dir: "V", x: ex.x + ex.w + (DM - 10), y1: ex.y, y2: ex.y + ex.h, xRef: ex.x + ex.w, t: `D${n}` });
    hl.push({ dir: "V", x: ex.x + ex.w, y1: ex.y, y2: ex.y + ex.h });
  });

  return {
    PAD,
    DM,
    sx,
    sy,
    sw,
    sh,
    parts,
    extras,
    islands,
    holes,
    dim,
    hl,
  };
}
