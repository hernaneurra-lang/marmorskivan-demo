// Path: src/components/MaterialsSection.jsx
import { useEffect, useMemo, useState } from "react";
import { parseCSV } from "../utils/parseCSV";

/* --- helpers --- */
const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function baseNameFromName(name = "") {
  const s = String(name || "").trim();
  if (!s) return "";
  return s
    .replace(/\(\s*\d+\s*mm\s*\)\s*$/i, "") // "X (20 mm)"
    .replace(/\s+\d+\s*mm\s*$/i, "") // "X 20 mm"
    .trim();
}

function pickBetterVariant(a, b) {
  // välj den med pris > 0, annars den med edgePrice > 0, annars behåll a (stabilt)
  const ap = toNumber(a?.price);
  const bp = toNumber(b?.price);
  if (ap > 0 && bp <= 0) return a;
  if (bp > 0 && ap <= 0) return b;

  const ae = toNumber(a?.edgePrice);
  const be = toNumber(b?.edgePrice);
  if (ae > 0 && be <= 0) return a;
  if (be > 0 && ae <= 0) return b;

  return a;
}

function formatKr(n) {
  const v = toNumber(n);
  return v.toLocaleString("sv-SE");
}

/* --- component --- */
export default function MaterialsSection({ onSelect, selectedId }) {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Alla");

  // info open per group
  const [openInfo, setOpenInfo] = useState({}); // { [baseKey]: boolean }
  // selected thickness per group
  const [selThickness, setSelThickness] = useState({}); // { [baseKey]: thicknessNumber }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // cache-bust så du aldrig ser gamla priser i dev
        const bust = `v=${Date.now()}`;
        const res = await fetch(`/data/materials.csv?${bust}`, { cache: "no-store" });
        const text = await res.text();
        const parsed = parseCSV(text);
        if (!alive) return;
        setAll(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("materials.csv load error:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // kategorier från rådata (alla rader)
  const categories = useMemo(() => {
    const set = new Set(all.map((m) => m.category).filter(Boolean));
    return ["Alla", ...Array.from(set)];
  }, [all]);

  // gruppa på basmaterial + dedupe per thickness
  const grouped = useMemo(() => {
    const map = new Map(); // baseKey -> group

    for (const row of all) {
      const name = row?.name || "";
      const baseName = baseNameFromName(name);
      if (!baseName) continue;

      const baseKey = slug(baseName);
      const thickness = toNumber(row?.thickness_mm);
      const thKey = thickness > 0 ? String(thickness) : "__unknown__";

      if (!map.has(baseKey)) {
        map.set(baseKey, {
          baseKey,
          baseName,
          category: row?.category || "",
          // bild: ta första som har image annars placeholder
          image: row?.image || "",
          variantsByThickness: new Map(),
        });
      }

      const g = map.get(baseKey);

      // håll kategori stabil (om tom -> fyll)
      if (!g.category && row?.category) g.category = row.category;

      // försök fylla bild om saknas
      if (!g.image && row?.image) g.image = row.image;

      const variant = {
        ...row,
        thickness_mm: thickness || row?.thickness_mm || "",
        price: row?.price,
        edgePrice: row?.edgePrice,
        pros: row?.pros,
        care: row?.care,
      };

      if (!g.variantsByThickness.has(thKey)) {
        g.variantsByThickness.set(thKey, variant);
      } else {
        const chosen = pickBetterVariant(g.variantsByThickness.get(thKey), variant);
        g.variantsByThickness.set(thKey, chosen);
      }
    }

    // till array + sort variants
    const out = [];
    for (const g of map.values()) {
      const variants = [...g.variantsByThickness.values()].sort((a, b) => {
        const A = toNumber(a?.thickness_mm) || 999999;
        const B = toNumber(b?.thickness_mm) || 999999;
        return A - B;
      });

      out.push({
        ...g,
        variants,
      });
    }

    // sortera alfabetiskt
    out.sort((a, b) => a.baseName.localeCompare(b.baseName, "sv"));
    return out;
  }, [all]);

  const filteredGroups = useMemo(() => {
    let arr = grouped;

    if (cat !== "Alla") arr = arr.filter((g) => g.category === cat);

    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (g) =>
          (g.baseName || "").toLowerCase().includes(s) ||
          (g.category || "").toLowerCase().includes(s)
      );
    }

    return arr;
  }, [grouped, cat, q]);

  function getSelectedVariant(group) {
    const baseKey = group.baseKey;
    const wanted = selThickness[baseKey];

    if (wanted) {
      const hit = group.variants.find((v) => toNumber(v.thickness_mm) === toNumber(wanted));
      if (hit) return hit;
    }

    // default: välj första med pris > 0 annars första
    const priced = group.variants.find((v) => toNumber(v.price) > 0);
    return priced || group.variants[0] || null;
  }

  const select = (variant) => {
    onSelect?.(variant);
  };

  return (
    <div className="rounded-2xl border p-5 bg-white/80">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">Material</h2>
        <div className="flex gap-2">
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="Sök material…"
            className="rounded-xl border px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-sm text-gray-500">Inga material hittades.</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredGroups.map((g) => {
          const v = getSelectedVariant(g);
          if (!v) return null;

          const active = selectedId === v.id;
          const baseKey = g.baseKey;

          const thicknessOptions = g.variants
            .map((x) => toNumber(x.thickness_mm))
            .filter((x) => x > 0);

          const showPrice = toNumber(v.price) > 0;
          const showEdge = toNumber(v.edgePrice) > 0;

          return (
            <div
              key={baseKey}
              className={`rounded-2xl border overflow-hidden bg-white ${
                active ? "ring-2 ring-emerald-400" : ""
              }`}
            >
              <div className="flex">
                <div className="w-36 h-28 bg-gray-100 shrink-0 overflow-hidden">
                  <img
                    src={g.image || v.image || "/products/placeholder.jpg"}
                    alt={g.baseName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/products/placeholder.jpg";
                    }}
                  />
                </div>

                <div className="p-3 flex-1">
                  <div className="font-medium">{g.baseName}</div>
                  <div className="text-xs text-gray-500">{g.category}</div>

                  {/* thickness dropdown per GROUP */}
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Tjocklek:</span>
                    <select
                      className="rounded-lg border px-2 py-1 bg-white"
                      value={toNumber(v.thickness_mm) || ""}
                      onChange={(e) => {
                        const nextTh = toNumber(e.target.value);
                        setSelThickness((prev) => ({ ...prev, [baseKey]: nextTh }));
                      }}
                    >
                      {thicknessOptions.length ? (
                        thicknessOptions.map((th) => (
                          <option key={th} value={th}>
                            {th} mm
                          </option>
                        ))
                      ) : (
                        <option value="">—</option>
                      )}
                    </select>
                  </div>

                  {/* price + edge */}
                  <div className="mt-1 text-sm">
                    {showPrice ? (
                      <>
                        <span className="font-semibold">{formatKr(v.price)} kr</span> / m²
                      </>
                    ) : (
                      <span className="text-gray-600">Pris lämnas vid förfrågan</span>
                    )}

                    <span className="text-gray-500">
                      {" "}
                      · Kant{" "}
                      {showEdge ? `${formatKr(v.edgePrice)} kr/m` : "pris på förfrågan"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className={`px-3 py-1.5 rounded-xl border text-sm ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => select(v)}
                      title="Välj detta material"
                    >
                      {active ? "Valt" : "Välj"}
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-xl border text-sm bg-white hover:bg-gray-50"
                      onClick={() =>
                        setOpenInfo((prev) => ({ ...prev, [baseKey]: !prev[baseKey] }))
                      }
                      title="Visa mer information"
                    >
                      Info
                    </button>
                  </div>
                </div>
              </div>

              {/* Info-block under kortet */}
              {openInfo[baseKey] && (
                <div className="border-t p-3 bg-gray-50">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Fördelar</div>
                    {Array.isArray(v.pros) && v.pros.length ? (
                      <ul className="list-disc pl-5 text-gray-700">
                        {v.pros.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    ) : v.pros ? (
                      <p className="text-gray-700">{String(v.pros)}</p>
                    ) : (
                      <p className="text-gray-500">—</p>
                    )}
                  </div>

                  <div className="text-sm mt-3">
                    <div className="font-medium mb-1">Underhåll</div>
                    {v.care ? (
                      <p className="text-gray-700">{String(v.care)}</p>
                    ) : (
                      <p className="text-gray-500">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Tips: Välj tjocklek per material. Klicka på <span className="font-medium">Välj</span> för att använda vald variant i kalkylen.
      </p>
    </div>
  );
}
