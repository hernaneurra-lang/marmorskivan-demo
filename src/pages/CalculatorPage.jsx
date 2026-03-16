// Path: src/pages/CalculatorPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MeasurementGuide from "../components/MeasurementGuide";
import MaterialsSection from "../components/MaterialsSection";
import BacksplashSection from "../components/BacksplashSection";
import EdgeTreatmentSection from "../components/EdgeTreatmentSection";
import OpeningsSection from "../components/OpeningsSection";
import ExtraSurfacesSection from "../components/ExtraSurfacesSection";
import SubmitBox from "../components/SubmitBox";
import { computeTotals } from "../lib/CostCalculation";
import { parseNumberLoose } from "../lib/materialUtils";

const mmToM = (mm) => (Number(mm) || 0) / 1000;
const SHAPES = ["Straight", "Straight+Island", "L", "L+Island", "U", "U+Island", "Island"];

/** -----------------------------
 *  PERSISTENS (localStorage)
 *  -----------------------------
 *  - Minimal & robust
 *  - Versionsnyckel för framtida ändringar
 */
const STORAGE_KEY = "marmorskivan_calc_state_v1";
const STORAGE_VERSION = 1;

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function loadPersistedState() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeParseJSON(raw);
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.__v !== STORAGE_VERSION) return null;

  return parsed.state || null;
}

function savePersistedState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ __v: STORAGE_VERSION, ts: Date.now(), state })
    );
  } catch {
    // ignore (quota / privacy mode)
  }
}

function resetPersisted() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Tolkar priser på tillbehör (diskhoar/blandare/hällar) från katalog-data.
 */
function extractCatalogPrice(item) {
  if (!item) return 0;
  if (typeof item.price === "number") return item.price;
  if (typeof item.pris === "number") return item.pris;

  const specs = item.specs || {};
  const raw =
    specs["Pris från"] ||
    specs["Pris"] ||
    specs["Price from"] ||
    specs["Price"] ||
    specs["price"] ||
    specs["pris"] ||
    item.price ||
    item.pris ||
    0;

  return parseNumberLoose(raw);
}

export default function CalculatorPage({
  variant,
  thicknessMm,
  onBackToMaterials,
  onPickMaterial,
  availableThicknesses = [20, 30],
  onThicknessChange,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "sv-SE";
const [showResetConfirm, setShowResetConfirm] = useState(false);

  /* --- Formatering --- */
  const currency = (n) =>
    (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString(locale, {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    });

  const number2 = (n) =>
    (Number(n) || 0).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // --- Load persisted once (on first render) ---
  const persisted = useMemo(() => loadPersistedState(), []);
  const didHydrateRef = useRef(false);

  /* --- State (med fallback till persisted) --- */
  const [shape, setShape] = useState(persisted?.shape || "Straight");

  const [straightSurfaces, setStraightSurfaces] = useState(
    Array.isArray(persisted?.straightSurfaces) && persisted.straightSurfaces.length
      ? persisted.straightSurfaces
      : [{ lengthMm: 2400, depthMm: 620 }]
  );

  const [legA, setLegA] = useState(
    persisted?.legA && typeof persisted.legA === "object"
      ? persisted.legA
      : { lengthMm: 2000, depthMm: 620 }
  );

  const [legB, setLegB] = useState(
    persisted?.legB && typeof persisted.legB === "object"
      ? persisted.legB
      : { lengthMm: 1600, depthMm: 620 }
  );

  const [uShape, setUShape] = useState(
    persisted?.uShape && typeof persisted.uShape === "object"
      ? persisted.uShape
      : {
          depthMm: 620,
          leftLegMm: 1800,
          centerSpanMm: 1800,
          rightLegMm: 1800,
        }
  );

  const [island, setIsland] = useState(
    persisted?.island && typeof persisted.island === "object"
      ? persisted.island
      : { lengthMm: 1800, depthMm: 900 }
  );

  const [extraSurfaces, setExtraSurfaces] = useState(
    Array.isArray(persisted?.extraSurfaces) ? persisted.extraSurfaces : []
  );

  const [backsplashes, setBacksplashes] = useState(
    Array.isArray(persisted?.backsplashes) ? persisted.backsplashes : []
  );

  const [edgeType, setEdgeType] = useState(persisted?.edgeType || "fasad");
  const [benchEdgesMm, setBenchEdgesMm] = useState(Number(persisted?.benchEdgesMm) || 0);

  const [openings, setOpenings] = useState(
    persisted?.openings && typeof persisted.openings === "object"
      ? persisted.openings
      : {
          globalCounts: { sink: 1, faucet: 1, hob: 1 },
          sink: { mode: "catalog", items: [], mount: "over" },
          faucet: { mode: "catalog", items: [] },
          hob: { mode: "catalog", items: [], mount: "over" },
        }
  );

  /* --- Labels / i18n --- */
  const shapeLabel = (s) => {
    const keys = {
      Straight: "calc.shapes.straight",
      "Straight+Island": "calc.shapes.straightIsland",
      L: "calc.shapes.l",
      "L+Island": "calc.shapes.lIsland",
      U: "calc.shapes.u",
      "U+Island": "calc.shapes.uIsland",
      Island: "calc.shapes.islandOnly",
    };

    const fallback = {
      Straight: "Rak",
      "Straight+Island": "Rak + Köksö",
      L: "L-form",
      "L+Island": "L-form + Köksö",
      U: "U-form",
      "U+Island": "U-form + Köksö",
      Island: "Endast köksö",
    };

    return t(keys[s], fallback[s] || s);
  };

  /* --- Persist (debounced) --- */
  const saveTimerRef = useRef(null);

  useEffect(() => {
    // Förhindra dubbel-save direkt vid första render, men tillåt efter mount.
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    const stateToPersist = {
      shape,
      straightSurfaces,
      legA,
      legB,
      uShape,
      island,
      extraSurfaces,
      backsplashes,
      edgeType,
      benchEdgesMm,
      openings,
    };

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePersistedState(stateToPersist);
    }, 250);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    shape,
    straightSurfaces,
    legA,
    legB,
    uShape,
    island,
    extraSurfaces,
    backsplashes,
    edgeType,
    benchEdgesMm,
    openings,
  ]);
function resetFormCompletely() {
  resetPersisted();

  setShape("Straight");
  setStraightSurfaces([{ lengthMm: 2400, depthMm: 620 }]);
  setLegA({ lengthMm: 2000, depthMm: 620 });
  setLegB({ lengthMm: 1600, depthMm: 620 });
  setUShape({
    depthMm: 620,
    leftLegMm: 1800,
    centerSpanMm: 1800,
    rightLegMm: 1800,
  });
  setIsland({ lengthMm: 1800, depthMm: 900 });
  setExtraSurfaces([]);
  setBacksplashes([]);
  setEdgeType("fasad");
  setBenchEdgesMm(0);
  setOpenings({
    globalCounts: { sink: 1, faucet: 1, hob: 1 },
    sink: { mode: "catalog", items: [], mount: "over" },
    faucet: { mode: "catalog", items: [] },
    hob: { mode: "catalog", items: [], mount: "over" },
  });

  setShowResetConfirm(false);
}

  /* --- Beräkningar --- */
  const islandEnabled = ["Straight+Island", "L+Island", "U+Island", "Island"].includes(shape);

  const backsplashArea = useMemo(
    () => backsplashes.reduce((sum, b) => sum + mmToM(b.length) * mmToM(b.height), 0),
    [backsplashes]
  );

  const accessoriesTotal = useMemo(() => {
    const sum = (items) => (items || []).reduce((acc, it) => acc + extractCatalogPrice(it), 0);
    return sum(openings?.sink?.items) + sum(openings?.faucet?.items) + sum(openings?.hob?.items);
  }, [openings]);

  const benchAreaM2 = useMemo(() => {
    let area = 0;

    if (shape.startsWith("Straight")) {
      straightSurfaces.forEach((s) => (area += mmToM(s.lengthMm) * mmToM(s.depthMm)));
    } else if (shape.startsWith("L")) {
      area += mmToM(legA.lengthMm) * mmToM(legA.depthMm);
      area += mmToM(legB.lengthMm) * mmToM(legB.depthMm);
    } else if (shape.startsWith("U")) {
      area +=
        mmToM(uShape.depthMm) * mmToM(uShape.centerSpanMm + 2 * uShape.depthMm) +
        mmToM(uShape.leftLegMm) * mmToM(uShape.depthMm) +
        mmToM(uShape.rightLegMm) * mmToM(uShape.depthMm);
    }

    extraSurfaces.forEach((s) => (area += mmToM(s.lengthMm) * mmToM(s.depthMm)));
    return area;
  }, [shape, straightSurfaces, legA, legB, uShape, extraSurfaces]);

  const islandAreaM2 = islandEnabled ? mmToM(island.lengthMm) * mmToM(island.depthMm) : 0;

  // Robust perimeter i mm
  const islandPerimeterMm = islandEnabled
    ? 2 * ((Number(island.lengthMm) || 0) + (Number(island.depthMm) || 0))
    : 0;

  const totalStoneM2 = benchAreaM2 + islandAreaM2 + backsplashArea;

  const totals = useMemo(
    () =>
      computeTotals({
        materialPricePerM2: variant?.price || 0,
        benchAreaM2,
        islandAreaM2,
        backsplashAreaM2: backsplashArea,
        benchEdgesMm,
        islandPerimeterMm,
        backsplashEdgesMm: 0,
        edgeType,
        accessoriesTotal,
        openings: {
          sinkCount: openings?.globalCounts?.sink ?? 0,
          sinkMount: openings?.sink?.mount || "over",
          hobCount: openings?.globalCounts?.hob ?? 0,
          hobMount: openings?.hob?.mount || "over",
          faucetCount: openings?.globalCounts?.faucet ?? 0,
        },
      }),
    [
      variant?.price,
      benchAreaM2,
      islandAreaM2,
      backsplashArea,
      benchEdgesMm,
      islandPerimeterMm,
      edgeType,
      openings,
      accessoriesTotal,
    ]
  );

  // Guards (för att undvika NaN/undefined i UI)
  const subtotal = totals?.summary?.subtotal ?? 0;
  const vat = totals?.summary?.vat ?? 0;
  const total = totals?.summary?.total ?? 0;
  const stoneBundle = Math.max(0, subtotal - (accessoriesTotal || 0));

  // Lista "valda tillval" (robust)
  const pickedItems = useMemo(() => {
    return [
      ...(openings?.sink?.items || []),
      ...(openings?.faucet?.items || []),
      ...(openings?.hob?.items || []),
    ];
  }, [openings]);

  // Fallback-rader om man inte valt specifika produkter men har counts
  const fallbackCutouts = useMemo(() => {
    const out = [];
    const sinkCount = openings?.globalCounts?.sink ?? 0;
    const faucetCount = openings?.globalCounts?.faucet ?? 0;
    const hobCount = openings?.globalCounts?.hob ?? 0;

    if ((openings?.sink?.items || []).length === 0 && sinkCount > 0) {
      out.push(`${sinkCount}x Urtag diskho (${openings?.sink?.mount || "over"})`);
    }
    if ((openings?.hob?.items || []).length === 0 && hobCount > 0) {
      out.push(`${hobCount}x Hällurtag (${openings?.hob?.mount || "over"})`);
    }
    if ((openings?.faucet?.items || []).length === 0 && faucetCount > 0) {
      out.push(`${faucetCount}x Blandarhål`);
    }

    return out;
  }, [openings]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* VÄNSTER: KONFIGURATION */}
      <section className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">{t("calc.kitchenShape.title", "Välj köksform")}</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {SHAPES.map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  shape === s
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {shapeLabel(s)}
              </button>
            ))}
          </div>
<button
  type="button"
  onClick={() => setShowResetConfirm(true)}
  className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-gray-300
             text-gray-600 hover:border-red-400 hover:text-red-600 transition"
>
  Rensa formulär
</button>

          {shape.startsWith("Straight") && (
            <StraightFields surfaces={straightSurfaces} setSurfaces={setStraightSurfaces} showAdd />
          )}

          {shape.startsWith("L") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumberInput
                label={t("calc.inputs.legA_length", "Ben A Längd")}
                value={legA.lengthMm}
                onChange={(v) => setLegA({ ...legA, lengthMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.legA_depth", "Ben A Djup")}
                value={legA.depthMm}
                onChange={(v) => setLegA({ ...legA, depthMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.legB_length", "Ben B Längd")}
                value={legB.lengthMm}
                onChange={(v) => setLegB({ ...legB, lengthMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.legB_depth", "Ben B Djup")}
                value={legB.depthMm}
                onChange={(v) => setLegB({ ...legB, depthMm: v })}
              />
            </div>
          )}

          {shape.startsWith("U") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NumberInput
                label={t("calc.inputs.u_depth", "Djup (mm)")}
                value={uShape.depthMm}
                onChange={(v) => setUShape({ ...uShape, depthMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.u_left", "Vänster (mm)")}
                value={uShape.leftLegMm}
                onChange={(v) => setUShape({ ...uShape, leftLegMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.u_center", "Mitten (mm)")}
                value={uShape.centerSpanMm}
                onChange={(v) => setUShape({ ...uShape, centerSpanMm: v })}
              />
              <NumberInput
                label={t("calc.inputs.u_right", "Höger (mm)")}
                value={uShape.rightLegMm}
                onChange={(v) => setUShape({ ...uShape, rightLegMm: v })}
              />
            </div>
          )}

          {islandEnabled && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold mb-4">{t("calc.island.title", "Köksö")}</h3>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <NumberInput
                  label={t("calc.inputs.island_length", "Längd (mm)")}
                  value={island.lengthMm}
                  onChange={(v) => setIsland({ ...island, lengthMm: v })}
                />
                <NumberInput
                  label={t("calc.inputs.island_depth", "Djup (mm)")}
                  value={island.depthMm}
                  onChange={(v) => setIsland({ ...island, depthMm: v })}
                />
              </div>
            </div>
          )}
        </div>

        <ExtraSurfacesSection items={extraSurfaces} setItems={setExtraSurfaces} />

        <MeasurementGuide
          shape={shape.toLowerCase().replace("+", "_")}
          dims={{
            ...legA,
            ...legB,
            ...uShape,
            L1: straightSurfaces?.[0]?.lengthMm,
            D: straightSurfaces?.[0]?.depthMm,
            islands: islandEnabled ? [{ I_L: island.lengthMm, I_W: island.depthMm }] : [],
            extraSurfaces,
          }}
          cutouts={{
            sink: openings?.globalCounts?.sink ?? 0,
            hob: openings?.globalCounts?.hob ?? 0,
            faucet: openings?.globalCounts?.faucet ?? 0,
          }}
        />

        <EdgeTreatmentSection
          edgeType={edgeType}
          setEdgeType={setEdgeType}
          benchEdgesMm={benchEdgesMm}
          setBenchEdgesMm={setBenchEdgesMm}
          islandEdgesMm={islandPerimeterMm}
          backsplashEdgesMm={0}
        />

        <BacksplashSection backsplashes={backsplashes} setBacksplashes={setBacksplashes} />
        <OpeningsSection value={openings} onChange={setOpenings} />
      </section>

      {/* HÖGER: MATERIAL (MaterialsSection) + PRISÖVERSIKT */}
      <aside className="space-y-6">
        <MaterialsSection
          mode="locked"
          selectedId={variant?.id}
          selectedName={variant?.name}
          selectedImage={variant?.image}
          selectedPricePerM2={variant?.price}
          onRequestBrowse={onBackToMaterials}
          onPick={onPickMaterial}
        />

        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {t("calc.thickness.title", "Tjocklek")}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {t("calc.thickness.subtitle", "Välj tjocklek för vald sten")}
              </div>
            </div>

            <select
              className="text-xs border rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={thicknessMm}
              onChange={(e) => onThicknessChange?.(e.target.value)}
            >
              {availableThicknesses.map((th) => (
                <option key={th} value={th}>
                  {th} mm
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border p-6 bg-white shadow-md space-y-6">
          <h2 className="text-lg font-bold border-b pb-3">
            {t("calc.priceOverview.title", "Prisöversikt")}
          </h2>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-[11px] border-b pb-6">
            <div className="space-y-4">
              <div>
                <p className="font-bold uppercase text-gray-400 mb-1 tracking-widest">
                  {t("calc.priceOverview.blocks.stone", "Sten & Yta")}
                </p>
                <p className="text-gray-900 font-semibold">
                  {String(variant?.name || "").replace(/_/g, " ")}
                </p>
                <p className="text-gray-500">
                  {thicknessMm}mm • {number2(totalStoneM2)} m²
                </p>
              </div>

              <div>
                <p className="font-bold uppercase text-gray-400 mb-1 tracking-widest">
                  {t("calc.priceOverview.blocks.execution", "Utförande")}
                </p>
                <p className="text-gray-900">{shapeLabel(shape)}</p>
                <p className="text-gray-500 capitalize">
                  {edgeType} {t("calc.priceOverview.polishing", "polering")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-bold uppercase text-emerald-600 mb-1 tracking-widest">
                  {t("calc.priceOverview.blocks.selectedExtras", "Valda Tillval")}
                </p>

                <ul className="text-gray-900 font-medium space-y-1">
                  {pickedItems.map((it, i) => (
                    <li key={i} className="flex gap-1">
                      <span className="text-emerald-500">✓</span>
                      <span className="truncate">
                        {it?.name || it?.title || t("calc.misc.item", "Produkt")}
                      </span>
                    </li>
                  ))}

                  {pickedItems.length === 0 && fallbackCutouts.length > 0 && (
                    <>
                      {fallbackCutouts.map((line, i) => (
                        <li key={`fb-${i}`} className="flex gap-1">
                          <span className="text-emerald-500">✓</span>
                          <span className="truncate">{line}</span>
                        </li>
                      ))}
                    </>
                  )}

                  {pickedItems.length === 0 && fallbackCutouts.length === 0 && (
                    <li className="text-gray-500">
                      {t("calc.priceOverview.noExtras", "Inga tillval valda")}
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="font-bold uppercase text-gray-400 mb-1 tracking-widest">
                  {t("calc.priceOverview.blocks.processing", "Bearbetning")}
                </p>
                <p className="text-gray-700">
                  {(openings?.globalCounts?.hob ?? 0) > 0
                    ? `${t("calc.openings.hob", "Hällurtag")} (${openings?.hob?.mount || "over"})`
                    : ""}
                </p>
                <p className="text-gray-700">
                  {(openings?.globalCounts?.faucet ?? 0) > 0
                    ? `${openings.globalCounts.faucet}x ${t("calc.openings.faucet", "Blandarhål")}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {t("calc.priceOverview.lines.extras", "Produkter & Tillval")}
              </span>
              <span className="font-bold">{currency(accessoriesTotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {t("calc.priceOverview.lines.stoneBundle", "Sten inkl. entreprenad*")}
              </span>
              <span className="font-bold">{currency(stoneBundle)}</span>
            </div>

            <div className="flex justify-between items-center pt-5 mt-4 border-t-2 border-emerald-500 bg-emerald-50/30 -mx-6 px-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-800 uppercase leading-none">
                  {t("calc.priceOverview.estimatedTotal", "Estimerat totalpris")}
                </span>
                <span className="text-[9px] text-emerald-600 italic mt-1">
                  {t("calc.priceOverview.includesService", "*Inkl. mätning & montage")}
                </span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-emerald-900 leading-none">
                  {currency(total)}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {t("calc.priceOverview.inclVat", "Inkl. moms")} ({currency(vat)})
                </div>
              </div>
            </div>
          </div>

          <SubmitBox
            variant={variant ? { ...variant, thicknessMm } : null}
            openings={openings}
            totals={{
              ...(totals?.summary || {}),
              benchAreaM2,
              islandAreaM2,
              backsplashArea,
              totalStoneM2,
              accessoriesTotal,
            }}
            context={{
              shape,
              bench: straightSurfaces,
              legA,
              legB,
              uShape,
              island: islandEnabled ? island : null,
              edges: { edgeType, benchEdgesMm, islandEdgesMm: islandPerimeterMm },
            }}
          />
        </div>
      </aside>
   {showResetConfirm && (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
      <h3 className="text-lg font-bold mb-2">
        Börja om kalkylatorn?
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Alla mått, val och inställningar du har gjort kommer att raderas.
        Detta går inte att ångra.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowResetConfirm(false)}
          className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
        >
          Avbryt
        </button>

        <button
          onClick={resetFormCompletely}
          className="px-4 py-2 rounded-lg text-sm font-semibold
                     bg-red-600 text-white hover:bg-red-700"
        >
          Ja, börja om
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}

/* --- HJÄLPARE --- */
function NumberInput({ label, value, onChange }) {
  return (
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex flex-col">
      {label}
      <input
        type="number"
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 font-semibold focus:border-emerald-500 outline-none transition-all"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function StraightFields({ surfaces, setSurfaces, showAdd }) {
  return (
    <div className="space-y-4">
      {surfaces.map((s, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-4 max-w-md relative group">
          <NumberInput
            label="Längd (mm)"
            value={s.lengthMm}
            onChange={(v) => {
              const u = [...surfaces];
              u[idx].lengthMm = v;
              setSurfaces(u);
            }}
          />
          <NumberInput
            label="Djup (mm)"
            value={s.depthMm}
            onChange={(v) => {
              const u = [...surfaces];
              u[idx].depthMm = v;
              setSurfaces(u);
            }}
          />
          {surfaces.length > 1 && (
            <button
              onClick={() => setSurfaces(surfaces.filter((_, i) => i !== idx))}
              className="absolute -right-8 top-7 text-gray-300 hover:text-red-500 text-xl"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {showAdd && surfaces.length < 4 && (
        <button
          onClick={() => setSurfaces([...surfaces, { lengthMm: 1000, depthMm: 620 }])}
          className="text-emerald-600 text-xs font-bold hover:underline transition-all"
          type="button"
        >
          + Lägg till del
        </button>
      )}
    </div>
  );
}
