// Path: src/components/EdgeTreatmentSection.jsx
import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

export default function EdgeTreatmentSection({
  edgeType,
  setEdgeType,
  benchEdgesMm,
  setBenchEdgesMm,
  islandEdgesMm = 0,
  backsplashEdgesMm = 0,
  baseEdgePricePerM = 0, // kvar för kompatibilitet men används ej
}) {
  const { t, i18n } = useTranslation();
  const uiLang = (i18n.language || "sv").slice(0, 2);

  const options = useMemo(
    () => [
      {
        key: "fasad",
        label: t("edges.options.fasad.label", { defaultValue: "Chamfer" }),
        info: t("edges.options.fasad.info", { defaultValue: "45° chamfered edge – crisp profile." }),
      },
      {
        key: "avrundad",
        label: t("edges.options.avrundad.label", { defaultValue: "Rounded" }),
        info: t("edges.options.avrundad.info", { defaultValue: "Light rounding – softer feel." }),
      },
      {
        key: "halvrund",
        label: t("edges.options.halvrund.label", { defaultValue: "Half bullnose" }),
        info: t("edges.options.halvrund.info", { defaultValue: "Half-round profile – more rounding." }),
      },
      {
        key: "rundad",
        label: t("edges.options.rundad.label", { defaultValue: "Full bullnose" }),
        info: t("edges.options.rundad.info", { defaultValue: "Full rounding – maximum softness." }),
      },
    ],
    [t]
  );

  // Bildkällor (lägg bilder i /public/edges/*)
  const EDGE_IMG = {
    fasad: "/edges/fasad.jpg",
    avrundad: "/edges/avrundad.jpg",
    halvrund: "/edges/halvrund.jpg",
    rundad: "/edges/rundad.jpg",
  };

  // Hover/preview-state
  const [previewKey, setPreviewKey] = useState(null); // "fasad" | "avrundad" | ...
  const [anchorRect, setAnchorRect] = useState(null); // DOMRect + scroll-offset
  const hideTimer = useRef(null);

  // Stäng med ESC
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setPreviewKey(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Smidig “hover stay”: vänta lite innan göm
  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPreviewKey(null), 120);
  };
  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const formatMm = (mm) => {
    const n = Math.round(Number(mm) || 0);
    const formatted = n.toLocaleString(uiLang === "en" ? "en-US" : "sv-SE");
    return `${formatted} mm`;
  };

  return (
    <section className="rounded-2xl border bg-white p-5 relative">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {t("edges.title", { defaultValue: "Edge treatment" })}
        </h2>
        <p className="text-xs text-gray-600 max-w-sm">
          {t("edges.hint", {
            defaultValue:
              "Visible edges that are not against a wall require edge finishing.",
          })}
        </p>
      </div>

      {/* Val av kanttyp – hover/klick-preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-4">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={(e) => {
              setEdgeType(opt.key);

              const rect = e.currentTarget.getBoundingClientRect();
              setAnchorRect({
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
              });

              // klick togglar (bra i mobil)
              setPreviewKey((k) => (k === opt.key ? null : opt.key));
            }}
            onMouseEnter={(e) => {
              cancelHide();
              const rect = e.currentTarget.getBoundingClientRect();
              setAnchorRect({
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
              });
              setPreviewKey(opt.key);
            }}
            onMouseLeave={scheduleHide}
            className={`rounded-xl border px-3 py-2 text-left ${
              edgeType === opt.key
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            title={opt.info}
          >
            <div className="font-medium">{opt.label}</div>
            <div
              className={`text-xs ${
                edgeType === opt.key ? "text-emerald-50/90" : "text-gray-600"
              }`}
            >
              {opt.info}
            </div>
          </button>
        ))}
      </div>

      {/* Förhandsvisning vid hover/klick */}
      {previewKey && (
        <PopoverPortal
          rect={anchorRect}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          onClose={() => setPreviewKey(null)}
        >
          <div className="rounded-2xl border bg-white shadow-2xl w-[min(92vw,560px)] max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="font-medium text-sm truncate pr-2">
                {options.find((o) => o.key === previewKey)?.label || ""}
              </div>
              <button
                className="text-red-600 hover:text-red-700 px-2 py-1 rounded-md border text-xs"
                onClick={() => setPreviewKey(null)}
                title={t("edges.preview.closeTitle", { defaultValue: "Close" })}
                type="button"
              >
                {t("edges.preview.close", { defaultValue: "Close" })} ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gray-50 p-2">
                <img
                  src={EDGE_IMG[previewKey] || "/products/placeholder.jpg"}
                  alt={options.find((o) => o.key === previewKey)?.label || previewKey}
                  className="w-full h-48 md:h-56 object-contain"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes("placeholder.jpg")) {
                      e.currentTarget.src = "/products/placeholder.jpg";
                    }
                  }}
                />
              </div>

              <div className="p-3 text-sm text-gray-700">
                {options.find((o) => o.key === previewKey)?.info ||
                  t("edges.preview.noDesc", { defaultValue: "No description." })}

                <div className="mt-3 text-xs text-gray-500">
                  {t("edges.preview.disclaimer", {
                    defaultValue:
                      "Preview is schematic. The exact profile is adapted to the selected stone.",
                  })}
                </div>
              </div>
            </div>
          </div>
        </PopoverPortal>
      )}

      {/* Längdsummering (utan prisvisning) */}
      <div className="grid md:grid-cols-3 gap-3">
        <NumberInput
          label={t("edges.inputs.visibleEdges", { defaultValue: "Total visible edges (mm)" })}
          value={benchEdgesMm}
          onChange={(v) => setBenchEdgesMm(Math.max(0, v))}
          placeholder={t("edges.inputs.visibleEdgesPlaceholder", { defaultValue: "e.g. 4800" })}
        />

        <div className="rounded-xl border bg-gray-50 px-3 py-2">
          <div className="text-sm text-gray-600">
            {t("edges.island.title", { defaultValue: "Island (auto)" })}
          </div>
          <div className="font-medium">{formatMm(islandEdgesMm)}</div>
          <div className="text-xs text-gray-500">
            {t("edges.island.hint", { defaultValue: "Calculated around the island." })}
          </div>
        </div>

        <div className="rounded-xl border bg-gray-50 px-3 py-2">
          <div className="text-sm text-gray-600">
            {t("edges.backsplash.title", { defaultValue: "Backsplash (edges)" })}
          </div>
          <div className="font-medium">{formatMm(backsplashEdgesMm)}</div>
          <div className="text-xs text-gray-500">
            {t("edges.backsplash.hint", { defaultValue: "Summed from backsplash rows." })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helpers ---------- */

function NumberInput({ label, value, onChange, placeholder }) {
  // Visar tomt när värdet är 0, tar bort ledande nollor, normaliserar vid blur
  const [local, setLocal] = useState(value ? String(value) : "");
  useEffect(() => setLocal(value ? String(value) : ""), [value]);

  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        inputMode="numeric"
        className="w-full rounded-xl border px-3 py-2"
        value={local}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          setLocal(raw);
          onChange?.(raw === "" ? 0 : Number(raw));
        }}
        onBlur={() => {
          const n = Number(local || 0);
          setLocal(n ? String(n) : "");
          onChange?.(n);
        }}
      />
    </label>
  );
}

/* ---------- Popover via portal, med smart position ---------- */

function PopoverPortal({ rect, children, onMouseEnter, onMouseLeave, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, place: "bottom" });

  useLayoutEffect(() => {
    const calc = () => {
      if (!rect) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollY = window.scrollY || 0;
      const scrollX = window.scrollX || 0;

      // prelim storlek om ref saknas än
      const width = ref.current?.offsetWidth || 560;
      const height = ref.current?.offsetHeight || 280;

      // dokument → viewport (för position: fixed)
      const anchorTopVp = rect.top - scrollY;
      const anchorBottomVp = rect.bottom - scrollY;
      const anchorCenterXVp = rect.left - scrollX + rect.width / 2;

      const spaceBelow = vh - anchorBottomVp;
      const spaceAbove = anchorTopVp;

      let place = "bottom";
      if (spaceBelow < height + 12 && spaceAbove > spaceBelow) place = "top";

      let top = place === "bottom" ? anchorBottomVp + 8 : anchorTopVp - height - 8;

      // clamp vertikalt
      top = Math.max(8, Math.min(top, vh - height - 8));

      // centrera horisontellt, clamp
      let left = anchorCenterXVp;
      const minLeft = 8 + width / 2;
      const maxLeft = vw - 8 - width / 2;
      left = Math.min(Math.max(left, minLeft), maxLeft);

      setPos({ top, left, place });
    };

    calc();
    const id = requestAnimationFrame(calc);
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, { passive: true });

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc);
    };
  }, [rect]);

  // klick utanför stänger
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  if (!rect) return null;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[1000]"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* liten pil */}
      <div
        aria-hidden
        className={`mx-auto h-3 w-3 rotate-45 border border-gray-200 bg-white ${
          pos.place === "bottom" ? "mb-[-6px]" : "mt-[-6px]"
        }`}
        style={{
          boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)",
        }}
      />
      {children}
    </div>,
    document.body
  );
}
