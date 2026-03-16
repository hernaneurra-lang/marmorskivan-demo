// Path: src/components/MaterialsSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/* ===== Helpers ===== */
const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Mappa CSV-kategori (svenska) -> i18n key
 * Fallback: "" (då visas originalsträngen)
 */
function categoryKey(raw = "") {
  const s = String(raw).trim();
  const map = {
    Kompositsten: "compositeStone",
    Granit: "granite",
    Keramik: "ceramic",
    Kalksten: "limestone",
    Marmor: "marble",
    Terrazzo: "terrazzo",
    Kvartsit: "quartzite",
    "Semi Precious": "semiPrecious",
    "Kvartsit (Translucent)": "quartziteTranslucent",
    Onyx: "onyx",
    Travertin: "travertine",
  };
  return map[s] || "";
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// ✅ FIX: normalisera bildväg från CSV (kolumn G) så att "Adamina.jpg" => "/materials/Adamina.jpg"
function normalizeImgPath(p) {
  let s = String(p ?? "").trim();
  if (!s) return "";

  // full URL / data-uri
  if (/^(https?:\/\/)/i.test(s) || /^data:/i.test(s)) return s;

  // normalisera backslashes
  s = s.replace(/\\/g, "/");

  // ta bort "./"
  if (s.startsWith("./")) s = s.slice(2);

  // "materials/Adamina.jpg" -> "/materials/Adamina.jpg"
  if (!s.startsWith("/") && s.toLowerCase().startsWith("materials/")) {
    s = "/" + s;
  }

  // bara filnamn -> lägg i /materials/
  const isBareFilename = (x) => {
    const t = String(x || "").trim();
    if (!t) return false;
    if (t.startsWith("/")) {
      const rest = t.slice(1);
      return rest.length > 0 && !rest.includes("/");
    }
    return !t.includes("/");
  };

  if (isBareFilename(s)) {
    s = s.replace(/^\/+/, "");
    return `/materials/${s}`;
  }

  // relativ path -> gör absolut
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/+/g, "/");
  if (s === "/materials") s = "/materials/";
  return s;
}

/* ===== Optional images-map loader ===== */
function useImagesMap() {
  const [map, setMap] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const base = import.meta.env.BASE_URL || "/";
        const res = await fetch(`${base}data/images-map.json`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (alive) setMap(json || {});
        } else {
          if (alive) setMap({});
        }
      } catch {
        setMap({});
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return map;
}

/* ===== Image with fallback chain ===== */
function ImageWithFallback({ candidates = [], alt = "", className = "" }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || "/products/placeholder.jpg";

  useEffect(() => {
    setIdx(0);
  }, [JSON.stringify(candidates)]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        if (idx < candidates.length - 1) {
          setIdx(idx + 1);
        } else if (!src.includes("placeholder.jpg")) {
          e.currentTarget.src = "/products/placeholder.jpg";
        }
      }}
    />
  );
}

/* ===== Bygg bildkandidater ===== */
function buildImageCandidates(m, imagesMap) {
  const list = [];

  // Ta bort parenteser med "mm", men behåll resten av namnet
  const rawName = String(m.name || "").trim();
  const n = rawName.replace(/\(\s*\d+\s*mm\)/gi, "").trim();

  // 0) explicit från CSV (om kolumn image finns)
  if (m.image) list.push(normalizeImgPath(m.image));

  // 1) images-map.json lookups
  const nSlug = slug(n);
  const t = String(m.thickness_mm || "").replace(/[^0-9]/g, "");
  const mapKeys = [`${nSlug}-${t}`, `${nSlug}_${t}`, nSlug, n, n.replace(/\s+/g, "_")];
  if (imagesMap) {
    for (const k of mapKeys) {
      if (imagesMap[k]) list.push(normalizeImgPath(imagesMap[k]));
    }
  }

  // 2) /materials/ mönster
  const baseNames = unique([
    n,
    n.replace(/\s+/g, "_"),
    n.replace(/\s+/g, "-"),
    nSlug,
    `${n}_20mm`,
    `${n}_30mm`,
    `${n}_12mm`,
    `${n.replace(/\s+/g, "_")}_20mm`,
    `${n.replace(/\s+/g, "_")}_30mm`,
    `${n.replace(/\s+/g, "_")}_12mm`,
    `${n.replace(/\s+/g, "-")}-20`,
    `${n.replace(/\s+/g, "-")}-30`,
    `${n.replace(/\s+/g, "-")}-12`,
    `${nSlug}-20`,
    `${nSlug}-30`,
    `${nSlug}-12`,
  ]);

  const exts = ["jpg"];
  for (const base of baseNames) {
    for (const ext of exts) {
      list.push(`/materials/${base}.${ext}`);
      list.push(`/materials/${base.toLowerCase()}.${ext}`);
    }
  }

  // 3) fallback /products/
  for (const base of [nSlug, n.replace(/\s+/g, "_"), n]) {
    for (const ext of exts) list.push(`/products/${base}.${ext}`);
  }

  return unique(list.filter(Boolean));
}

/* ===== CSV parser ===== */
function parseCSV(text) {
  const sep = text.indexOf(";") > -1 ? ";" : ",";
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  const head = lines.shift().split(sep).map((s) => s.trim());
  return lines.map((ln) => {
    const cols = ln.split(sep).map((s) => s.trim());
    const row = {};
    head.forEach((h, i) => (row[h] = cols[i] ?? ""));
    row.price = row.price ? Number(row.price) : "";
    row.edgePrice = row.edgePrice ? Number(row.edgePrice) : "";
    row.thickness_mm = row.thickness_mm ? Number(row.thickness_mm) : "";
    // ✅ viktigast: normalisera image från kolumn G
    if ("image" in row) row.image = normalizeImgPath(row.image);
    return row;
  });
}

/* ===== Hover popover ===== */
function useAnchorRect() {
  const [rect, setRect] = useState(null);
  const setFromEl = (el) => {
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top + window.scrollY,
      bottom: r.bottom + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
      height: r.height,
    });
  };
  return [rect, setFromEl];
}

function HoverImagePopover({ anchorRect, onClose, children }) {
  if (!anchorRect) return null;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const left = Math.max(8, Math.min(anchorRect.left + anchorRect.width / 2, vw - 8));
  const top = anchorRect.bottom + 8;
  return (
    <div
      className="fixed z-[1000]"
      style={{ top, left, transform: "translateX(-50%)" }}
      onMouseLeave={onClose}
    >
      <div
        className="mx-auto h-3 w-3 rotate-45 border border-gray-200 bg-white mb-[-6px]"
        style={{
          boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)",
        }}
      />
      <div className="rounded-2xl border bg-white shadow-2xl overflow-hidden">{children}</div>
    </div>
  );
}

/* =============================================================================
   Component
============================================================================= */
export default function MaterialsSection({
  mode = "locked",
  selectedId,
  selectedName,
  selectedImage,
  selectedPricePerM2,
  onRequestBrowse,
  onPick,
}) {
  const { t, i18n } = useTranslation();

  // currency följer språk men alltid SEK
  const currency = (n) =>
    (isNaN(n) ? 0 : n).toLocaleString(i18n.language || "sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    });

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const imagesMap = useImagesMap();

  // Hover-preview för vald sten
  const thumbRef = useRef(null);
  const [anchorRect, setFromEl] = useAnchorRect();
  const [showPreview, setShowPreview] = useState(false);
  const hideTimer = useRef(null);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowPreview(false), 120);
  };
  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  // Kandidater för vald bild
  const selectedCandidates = useMemo(() => {
    if (!selectedName) return [];
    const row = { name: selectedName, image: selectedImage || "" };
    return buildImageCandidates(row, imagesMap);
  }, [selectedName, selectedImage, imagesMap]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const base = import.meta.env.BASE_URL || "/";
        const res = await fetch(`${base}data/materials.csv`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = parseCSV(text);
        if (!alive) return;
        setRows(parsed);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const tt = q.trim().toLowerCase();
    if (!tt) return [];
    return rows.filter((r) => (r.name || "").toLowerCase().includes(tt));
  }, [rows, q]);

  const showPriceDisclaimer = !selectedPricePerM2 || Number(selectedPricePerM2) === 0;

  const selectedPriceText = selectedPricePerM2
    ? `${currency(selectedPricePerM2)} / m²`
    : t("materialsSection.priceOnRequest", { defaultValue: "Price on request" });

  return (
    <section className="rounded-2xl border p-5 bg-white">
      <h2 className="text-lg font-semibold mb-3">
        {t("materialsSection.title", { defaultValue: "Selected material" })}
      </h2>

      {/* Vald sten + hover-förstoring */}
      <div className="rounded-xl border bg-gray-50 p-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            ref={thumbRef}
            className="w-16 h-16 rounded-lg overflow-hidden border bg-white shrink-0"
            onMouseEnter={() => {
              cancelHide();
              setFromEl(thumbRef.current);
              setShowPreview(true);
            }}
            onMouseLeave={scheduleHide}
            onClick={() => {
              setFromEl(thumbRef.current);
              setShowPreview((v) => !v);
            }}
            title={selectedName ? t("materialsSection.enlargeTitle", { defaultValue: "Enlarge" }) : ""}
          >
            {selectedName ? (
              <ImageWithFallback candidates={selectedCandidates} alt={selectedName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* popover */}
          {showPreview && selectedName && (
            <HoverImagePopover anchorRect={anchorRect} onClose={() => setShowPreview(false)}>
              <img
                src={selectedCandidates[0] || "/products/placeholder.jpg"}
                alt={selectedName}
                className="block max-w-[560px] max-h-[480px] object-contain bg-gray-50"
                onError={(e) => {
                  if (!e.currentTarget.src.includes("placeholder.jpg")) {
                    e.currentTarget.src = "/products/placeholder.jpg";
                  }
                }}
              />
            </HoverImagePopover>
          )}

          <div className="flex-1">
            <div className="font-medium">{selectedName || "—"}</div>
            <div className="text-sm text-gray-600">{selectedPriceText}</div>
          </div>
        </div>

        {showPriceDisclaimer && selectedName && (
          <p className="mt-2 text-xs text-amber-700">
            {t("materialsSection.priceDisclaimer", {
              defaultValue:
                "The price for this material is not included in the calculation. You will receive the correct price in the quote.",
            })}
          </p>
        )}
      </div>

      {/* Snabbsök & direktbyte */}
      <div className="space-y-2">
        <label className="text-sm text-gray-700">
          {t("materialsSection.changeLabel", { defaultValue: "Change material" })}
        </label>

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("materialsSection.searchPlaceholder", {
            defaultValue: "Start typing (e.g. calacatta)…",
          })}
          className="w-full rounded-xl border px-3 py-2"
        />

        {err && (
          <div className="text-xs text-red-600">
            {t("materialsSection.csvErrorPrefix", { defaultValue: "Could not read materials.csv:" })} {err}
          </div>
        )}
      </div>

      {/* Förslag när man skriver */}
      {q.trim() && (
        <div className="mt-2 rounded-xl border bg-white max-h-64 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-600">
              {t("materialsSection.loading", { defaultValue: "Loading…" })}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-600">
              {t("materialsSection.noHits", { defaultValue: "No results." })}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.slice(0, 12).map((m) => {
                const cands = buildImageCandidates(m, imagesMap);

                const k = categoryKey(m.category || "");
                const categoryLabel = k
                  ? t(`materials.categories.${k}`, { defaultValue: m.category || "—" })
                  : m.category || "—";

                return (
                  <li
                    key={`${m.id || m.name}-${m.thickness_mm || ""}`}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPick?.(m);
                      setQ("");
                    }}
                    title={t("materialsSection.pickTitle", { defaultValue: "Select this material" })}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden border bg-gray-100 shrink-0">
                      <ImageWithFallback candidates={cands} alt={m.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-gray-600">
                        {categoryLabel}
                        {m.thickness_mm ? ` · ${m.thickness_mm} mm` : ""}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      {m.price ? `${currency(m.price)} / m²` : "—"}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Länk till hela materialsidan */}
      <button
        type="button"
        className="mt-3 w-full px-3 py-2 rounded-xl border hover:bg-gray-50"
        onClick={onRequestBrowse}
        title={t("materialsSection.browseTitle", { defaultValue: "Open materials page" })}
      >
        {t("materialsSection.browseAll", { defaultValue: "Browse all materials" })}
      </button>
    </section>
  );
}

/* ===== Extra export ===== */
export { ImageWithFallback, buildImageCandidates, useImagesMap };
