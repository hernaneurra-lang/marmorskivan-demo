// Path: src/components/OpeningsSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/** ---- Maxantal (hårdgräns) ---- */
const ABS_MAX = { sink: 3, faucet: 3, hob: 2 };

/** ---- Mount-bilder (ligger i /public/mountings) ---- */
const MOUNT_IMG = {
  hob: {
    over: "/mountings/hob-over.jpg",
    flush: "/mountings/hob-flush.jpg",
  },
  sink: {
    over: "/mountings/sink-over.jpg",
    flush: "/mountings/sink-flush.jpg",
    under: "/mountings/sink-under.jpg",
    recess: "/mountings/sink-recess.jpg",
  },
};

const PLACEHOLDER_IMG = "/products/placeholder.jpg";

/** ---- Catalog paths (public/) & helper fetch ---- */
const CATALOG_PATHS = {
  sinks: "data/catalog/sinks.json",
  faucets: "data/catalog/faucets.json",
  hobs: "data/catalog/hobs.json",
};

/** ---- Bildplatser per dataset ---- */
const IMG_BASE_BY_DATASET = {
  sinks: "products/sinks/",
  faucets: "products/faucets/",
  hobs: "products/hobs/",
};

// Cache-bust vid behov (lägg VITE_CATALOG_VERSION i .env)
const VERSION = import.meta.env.VITE_CATALOG_VERSION || "1";
const baseURL = () => (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

async function fetchCatalog(datasetKey) {
  const path = CATALOG_PATHS[datasetKey];
  const res = await fetch(`${baseURL()}${path}?v=${encodeURIComponent(VERSION)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];

  const raw = await res.json();
  const imgBase = IMG_BASE_BY_DATASET[datasetKey] || "product/";

  const map = (p) => {
    const img = p.image
      ? `${baseURL()}${imgBase}${p.image}`
      : p.slug
      ? `${baseURL()}${imgBase}${p.slug}.jpg`
      : undefined;

    return {
      name: p.title || p.name || "",
      brand: p.brand || "",
      model: p.model || "",
      image: img,
      specs: p.specs || {},
      slug: p.slug || "",
      category: p.category || "",
      intro_text: p.intro_text || "",
      price: typeof p.price === "number" ? p.price : undefined,
      pris: typeof p.pris === "number" ? p.pris : undefined,
    };
  };

  return Array.isArray(raw) ? raw.map(map) : [];
}

const DATA_LOADERS = {
  sinks: () => fetchCatalog("sinks"),
  faucets: () => fetchCatalog("faucets"),
  hobs: () => fetchCatalog("hobs"),
};

/** ===== Utils ===== */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function labelForMount(type, key, t) {
  if (type === "sink") {
    return key === "over"
      ? t("openings.mount.sink.over", { defaultValue: "Övermonterad" })
      : key === "flush"
      ? t("openings.mount.sink.flush", { defaultValue: "Planlimmad" })
      : key === "under"
      ? t("openings.mount.sink.under", { defaultValue: "Underlimmad" })
      : t("openings.mount.sink.recess", { defaultValue: "Underfräst" });
  }
  return key === "over"
    ? t("openings.mount.hob.over", { defaultValue: "Övermonterad" })
    : t("openings.mount.hob.flush", { defaultValue: "Planlimmad" });
}

export default function OpeningsSection({ value, onChange }) {
  const { t } = useTranslation();

  /** ---- Flikar ---- */
  const TABs = [
    { key: "sink", label: t("openings.tabs.sink", { defaultValue: "Diskho" }) },
    { key: "faucet", label: t("openings.tabs.faucet", { defaultValue: "Blandare" }) },
    { key: "hob", label: t("openings.tabs.hob", { defaultValue: "Spishäll" }) },
  ];

  /** ---- Mount-beskrivningar ---- */
  const MOUNT_DESCRIPTIONS = {
    sink: {
      over: t("openings.mountDesc.sink.over", {
        defaultValue:
          "Övermonterad: Diskhon ligger ovanpå skivan, med synlig kantlist. Enkelt byte och montage.",
      }),
      flush: t("openings.mountDesc.sink.flush", {
        defaultValue:
          "Planlimmad: Diskhon ligger i plan med skivans ovansida. Kräver spårfräsning/planlimning.",
      }),
      under: t("openings.mountDesc.sink.under", {
        defaultValue:
          "Underlimmad: Diskhon limmas underifrån. Synlig stenkant runt öppningen – elegant och praktiskt.",
      }),
      recess: t("openings.mountDesc.sink.recess", {
        defaultValue:
          "Underfräst: Undersidan fräses ur för en tunnare visuell kant vid hon. Ger ett exklusivt intryck.",
      }),
    },
    hob: {
      over: t("openings.mountDesc.hob.over", {
        defaultValue:
          "Övermonterad: Spishällen vilar ovanpå skivan. Standardlösning med enkel montering.",
      }),
      flush: t("openings.mountDesc.hob.flush", {
        defaultValue:
          "Planlimmad: Spishällen ligger i plan med skivan. Kräver fräsning/planlimning för perfekt passning.",
      }),
    },
  };

  const [tab, setTab] = useState("sink");

  // Standardmodell
  const v = value || {
    globalCounts: { sink: 0, faucet: 0, hob: 0 },
    sink: { mode: "catalog", items: [], mount: "over" },
    faucet: { mode: "catalog", items: [] },
    hob: { mode: "catalog", items: [], mount: "over" },
  };

  const setPart = (key, patch) => onChange?.({ ...v, [key]: { ...v[key], ...patch } });

  const setGlobal = (key, n) =>
    onChange?.({
      ...v,
      globalCounts: { ...v.globalCounts, [key]: clamp(n, 0, ABS_MAX[key]) },
    });

  // Katalog-overlay state
  const [catalogOpen, setCatalogOpen] = useState(null);

  // Mount-zoom
  const [mountModal, setMountModal] = useState(null); // { type, key }

  const allowMax = {
    sink: clamp(v.globalCounts?.sink ?? 0, 0, ABS_MAX.sink),
    faucet: clamp(v.globalCounts?.faucet ?? 0, 0, ABS_MAX.faucet),
    hob: clamp(v.globalCounts?.hob ?? 0, 0, ABS_MAX.hob),
  };

  // Håll val i synk om man sänker antal i rullistan
  useEffect(() => {
    const maxS = allowMax.sink;
    if ((v.sink.items?.length || 0) > maxS) setPart("sink", { items: (v.sink.items || []).slice(0, maxS) });

    const maxF = allowMax.faucet;
    if ((v.faucet.items?.length || 0) > maxF) setPart("faucet", { items: (v.faucet.items || []).slice(0, maxF) });

    const maxH = allowMax.hob;
    if ((v.hob.items?.length || 0) > maxH) setPart("hob", { items: (v.hob.items || []).slice(0, maxH) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowMax.sink, allowMax.faucet, allowMax.hob]);

  return (
    <section className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {t("openings.title", { defaultValue: "Öppningar & tillval" })}
        </h2>

        <div className="flex gap-2">
          {TABs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                tab === tb.key ? "bg-emerald-50 border-emerald-300" : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => setTab(tb.key)}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Globala antal (rullistorna) */}
      <div className="rounded-xl border p-3 bg-gray-50 mb-5 grid sm:grid-cols-3 gap-3">
        <CountPicker
          label={t("openings.count.sinks", { defaultValue: "Diskhoar" })}
          max={ABS_MAX.sink}
          value={allowMax.sink}
          onChange={(n) => setGlobal("sink", n)}
        />
        <CountPicker
          label={t("openings.count.faucets", { defaultValue: "Blandare" })}
          max={ABS_MAX.faucet}
          value={allowMax.faucet}
          onChange={(n) => setGlobal("faucet", n)}
        />
        <CountPicker
          label={t("openings.count.hobs", { defaultValue: "Spishällar" })}
          max={ABS_MAX.hob}
          value={allowMax.hob}
          onChange={(n) => setGlobal("hob", n)}
        />
      </div>

      {tab === "sink" && (
        <CategoryCard
          title={t("openings.sink.title", { defaultValue: "Diskho" })}
          category="sink"
          mode={v.sink.mode || "catalog"}
          onModeChange={(mode) => setPart("sink", { mode, ...(mode !== "catalog" ? { items: [] } : {}) })}
          showMount
          mount={v.sink.mount || "over"}
          onMountChange={(mount) => setPart("sink", { mount })}
          onMountPreview={(key) => setMountModal({ type: "sink", key })}
          items={v.sink.items || []}
          allowMax={allowMax.sink}
          onOpenCatalogNew={() =>
            setCatalogOpen({
              datasetKey: "sinks",
              allowedMax: allowMax.sink,
              replace: { enabled: allowMax.sink === 1 },
            })
          }
          onOpenCatalogReplace={(index) =>
            setCatalogOpen({
              datasetKey: "sinks",
              allowedMax: allowMax.sink,
              replace: { enabled: true, index },
            })
          }
          onClearItems={() => setPart("sink", { items: [] })}
          onRemoveAt={(i) => setPart("sink", { items: (v.sink.items || []).filter((_, idx) => idx !== i) })}
        />
      )}

      {tab === "faucet" && (
        <CategoryCard
          title={t("openings.faucet.title", { defaultValue: "Blandare" })}
          category="faucet"
          mode={v.faucet.mode || "catalog"}
          onModeChange={(mode) => setPart("faucet", { mode, ...(mode !== "catalog" ? { items: [] } : {}) })}
          showMount={false}
          items={v.faucet.items || []}
          allowMax={allowMax.faucet}
          onOpenCatalogNew={() =>
            setCatalogOpen({
              datasetKey: "faucets",
              allowedMax: allowMax.faucet,
              replace: { enabled: allowMax.faucet === 1 },
            })
          }
          onOpenCatalogReplace={(index) =>
            setCatalogOpen({
              datasetKey: "faucets",
              allowedMax: allowMax.faucet,
              replace: { enabled: true, index },
            })
          }
          onClearItems={() => setPart("faucet", { items: [] })}
          onRemoveAt={(i) => setPart("faucet", { items: (v.faucet.items || []).filter((_, idx) => idx !== i) })}
        />
      )}

      {tab === "hob" && (
        <CategoryCard
          title={t("openings.hob.title", { defaultValue: "Spishäll" })}
          category="hob"
          mode={v.hob.mode || "catalog"}
          onModeChange={(mode) => setPart("hob", { mode, ...(mode !== "catalog" ? { items: [] } : {}) })}
          showMount
          mount={v.hob.mount || "over"}
          onMountChange={(mount) => setPart("hob", { mount })}
          onMountPreview={(key) => setMountModal({ type: "hob", key })}
          items={v.hob.items || []}
          allowMax={allowMax.hob}
          onOpenCatalogNew={() =>
            setCatalogOpen({
              datasetKey: "hobs",
              allowedMax: allowMax.hob,
              replace: { enabled: allowMax.hob === 1 },
            })
          }
          onOpenCatalogReplace={(index) =>
            setCatalogOpen({
              datasetKey: "hobs",
              allowedMax: allowMax.hob,
              replace: { enabled: true, index },
            })
          }
          onClearItems={() => setPart("hob", { items: [] })}
          onRemoveAt={(i) => setPart("hob", { items: (v.hob.items || []).filter((_, idx) => idx !== i) })}
        />
      )}

      {/* Katalog-overlay */}
      {catalogOpen && (
        <CatalogOverlay
          datasetKey={catalogOpen.datasetKey}
          allowedMax={catalogOpen.allowedMax}
          replace={catalogOpen.replace}
          currentItems={
            catalogOpen.datasetKey === "sinks"
              ? v.sink.items
              : catalogOpen.datasetKey === "faucets"
              ? v.faucet.items
              : v.hob.items
          }
          onClose={() => setCatalogOpen(null)}
          onCommit={(items) => {
            if (catalogOpen.datasetKey === "sinks") setPart("sink", { items });
            else if (catalogOpen.datasetKey === "faucets") setPart("faucet", { items });
            else setPart("hob", { items });
            setCatalogOpen(null);
          }}
        />
      )}

      {/* Mount-zoom */}
      {mountModal && (
        <MountZoomModal
          img={MOUNT_IMG[mountModal.type]?.[mountModal.key]}
          title={`${
            mountModal.type === "sink"
              ? t("openings.sink.title", { defaultValue: "Diskho" })
              : t("openings.hob.title", { defaultValue: "Spishäll" })
          } – ${labelForMount(mountModal.type, mountModal.key, t)}`}
          text={MOUNT_DESCRIPTIONS[mountModal.type]?.[mountModal.key]}
          onClose={() => setMountModal(null)}
        />
      )}
    </section>
  );
}

/* ================== UI komponenter ================== */

function CountPicker({ label, max, value, onChange }) {
  return (
    <label className="text-sm">
      <span className="text-gray-600">{label}</span>
      <select
        className="mt-1 w-full rounded-lg border px-3 py-2"
        value={value}
        onChange={(e) => onChange(clamp(+e.target.value || 0, 0, max))}
      >
        {Array.from({ length: max + 1 }, (_, i) => i).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

function CategoryCard({
  title,
  category,
  mode,
  onModeChange,
  showMount,
  mount,
  onMountChange,
  onMountPreview,
  items,
  allowMax,
  onOpenCatalogNew,
  onOpenCatalogReplace,
  onClearItems,
  onRemoveAt,
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border p-5 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <div className="flex gap-2">
          <ModeBtn active={mode === "catalog"} onClick={() => onModeChange("catalog")}>
            {t("openings.mode.catalog", { defaultValue: "Välj från vår katalog" })}
          </ModeBtn>
          <ModeBtn active={mode === "own"} onClick={() => onModeChange("own")}>
            {t("openings.mode.own", { defaultValue: "Jag köper själv" })}
          </ModeBtn>
          <ModeBtn active={mode === "none"} onClick={() => onModeChange("none")}>
            {t("openings.mode.none", { defaultValue: "Jag ska ej ha" })}
          </ModeBtn>
        </div>
      </div>

      {showMount && (
        <MountPicker type={category} value={mount} onChange={onMountChange} onPreview={onMountPreview} />
      )}

      {mode === "catalog" && (
        <div className="space-y-3">
          {items?.length ? (
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-sm font-medium mb-2">
                {t("openings.selectedCount", {
                  defaultValue: "Valda ({{count}}/{{max}}):",
                  count: items.length,
                  max: allowMax,
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                {items.map((it, idx) => (
                  <div key={idx} className="relative flex items-center gap-2 border rounded-lg p-2 bg-white">
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 bg-white rounded-full border text-red-600 w-6 h-6 leading-6 text-center"
                      title={t("openings.actions.remove", { defaultValue: "Ta bort" })}
                      onClick={() => onRemoveAt(idx)}
                    >
                      ✕
                    </button>
                    <img
                      src={it.image || PLACEHOLDER_IMG}
                      alt={it.name}
                      className="w-14 h-14 object-cover rounded-md border"
                      onError={(e) => {
                        if (!e.currentTarget.src.includes("placeholder.jpg")) e.currentTarget.src = PLACEHOLDER_IMG;
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium">{it.name}</div>
                      {it.model && <div className="text-xs text-gray-600">{it.model}</div>}
                      <button
                        type="button"
                        className="mt-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => onOpenCatalogReplace(idx)}
                      >
                        {t("openings.actions.replace", { defaultValue: "Byt ut" })}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
                  onClick={onOpenCatalogNew}
                  disabled={items.length >= allowMax}
                >
                  {t("openings.actions.addMore", { defaultValue: "Lägg till fler" })}
                </button>
                <button type="button" className="px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={onClearItems}>
                  {t("openings.actions.clear", { defaultValue: "Rensa" })}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-sm text-gray-600">
                {t("openings.noneSelectedYet", { defaultValue: "Inget valt ännu." })}
              </div>
              <button type="button" className="mt-2 px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={onOpenCatalogNew}>
                {t("openings.mode.catalog", { defaultValue: "Välj från vår katalog" })}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "own" && (
        <div className="rounded-xl border p-3 bg-gray-50 text-sm text-gray-600">
          {t("openings.ownHint", {
            defaultValue: "Antal styrs från rullisterna ovan. Inga produkter behöver väljas här.",
          })}
        </div>
      )}

      {mode === "none" && (
        <div className="rounded-xl border p-3 bg-gray-50 text-sm">
          {t("openings.noneHint", { defaultValue: "Ej aktuellt." })}
        </div>
      )}
    </div>
  );
}

/** ✅ FIX: stopPropagation istället för preventDefault */
function ModeBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded-lg border text-sm ${
        active ? "bg-emerald-50 border-emerald-300" : "bg-white hover:bg-gray-50"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function MountPicker({ type, value, onChange, onPreview }) {
  const { t } = useTranslation();

  const options =
    type === "sink"
      ? [
          { key: "over", label: t("openings.mount.sink.over", { defaultValue: "Övermonterad" }) },
          { key: "flush", label: t("openings.mount.sink.flush", { defaultValue: "Planlimmad" }) },
          { key: "under", label: t("openings.mount.sink.under", { defaultValue: "Underlimmad" }) },
          { key: "recess", label: t("openings.mount.sink.recess", { defaultValue: "Underfräst" }) },
        ]
      : [
          { key: "over", label: t("openings.mount.hob.over", { defaultValue: "Övermonterad" }) },
          { key: "flush", label: t("openings.mount.hob.flush", { defaultValue: "Planlimmad" }) },
        ];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{t("openings.mountTitle", { defaultValue: "Montering" })}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((opt) => {
          const img = MOUNT_IMG[type]?.[opt.key];
          const checked = value === opt.key;

          return (
            <label
              key={opt.key}
              className={`flex flex-col items-center border rounded-lg p-2 cursor-pointer hover:bg-gray-50 ${
                checked ? "ring-2 ring-emerald-300" : ""
              }`}
              title={t("openings.mountPreviewHint", { defaultValue: "Klicka för större bild" })}
            >
              <input
                type="radio"
                name={`${type}-mount`}
                className="mb-1"
                checked={checked}
                onChange={() => onChange?.(opt.key)}
              />
              {img && (
                <img
                  src={img}
                  alt={opt.label}
                  className="h-20 object-contain"
                  onClick={() => onPreview?.(opt.key)}
                  onError={(e) => (e.currentTarget.style.opacity = "0.4")}
                />
              )}
              <span className="text-xs mt-1">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** ---------- Katalog-overlay ---------- */
function CatalogOverlay({ datasetKey, allowedMax, replace = { enabled: false }, currentItems = [], onClose, onCommit }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(currentItems);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loader =
          datasetKey === "sinks" ? DATA_LOADERS.sinks : datasetKey === "faucets" ? DATA_LOADERS.faucets : DATA_LOADERS.hobs;
        const data = await loader();
        if (!alive) return;
        const rowsIn = Array.isArray(data) ? data : Array.isArray(data?.default) ? data.default : [];
        setRows(rowsIn);
      } catch (e) {
        console.error("Kunde inte läsa dataset:", datasetKey, e);
        setRows([]);
      }
    })();
    return () => (alive = false);
  }, [datasetKey]);

  const filtered = useMemo(() => {
    const tt = q.trim().toLowerCase();
    if (!tt) return rows;
    return rows.filter((r) => {
      const hay = [r.name || "", r.brand || "", r.model || "", r.slug || "", r.intro_text || "", JSON.stringify(r.specs || {})]
        .join(" ")
        .toLowerCase();
      return hay.includes(tt);
    });
  }, [rows, q]);

  const confirmAdd = (item, indexToReplace = null) => {
    const name = item?.name || item?.title || t("openings.catalog.product", { defaultValue: "produkt" });

    if (
      !window.confirm(
        t("openings.catalog.confirmAdd", {
          defaultValue: "Vill du lägga till “{{name}}” och spara dina val?",
          name,
        })
      )
    ) {
      return;
    }

    let next = [];

    if (indexToReplace != null) {
      next = [...selected];
      next[indexToReplace] = item;
    } else {
      if (selected.length >= allowedMax) {
        alert(
          allowedMax === 0
            ? t("openings.catalog.zeroAllowed", { defaultValue: "Antalet i rullistan är 0. Öka antalet om du vill lägga till." })
            : t("openings.catalog.maxReached", {
                defaultValue: "Du har redan valt max {{max}} st. Öka antalet i rullistan om du vill lägga till fler.",
                max: allowedMax,
              })
        );
        return;
      }
      next = [...selected, item];
    }

    setSelected(next);
    onCommit?.(next);
  };

  const removeIdx = (idx) => setSelected((s) => s.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">{t("openings.catalog.title", { defaultValue: "Välj från vår katalog" })}</h3>
          <button type="button" className="text-red-600 hover:text-red-700 text-xl" onClick={onClose} title={t("materialsPage.close", { defaultValue: "Stäng" })}>
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("openings.catalog.searchPlaceholder", { defaultValue: "Sök i namn, märke, modell, specs…" })}
            className="w-full md:w-80 rounded-xl border px-3 py-2"
          />
          <div className="text-sm text-gray-600">
            {t("openings.catalog.selected", { defaultValue: "Valda:" })} <strong>{selected.length}</strong> / {allowedMax}
          </div>
          <div className="ml-auto flex gap-2">
            <button type="button" className="px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={() => setSelected([])}>
              {t("openings.actions.clearSelection", { defaultValue: "Rensa val" })}
            </button>
            <button type="button" className="px-3 py-1.5 rounded-xl border bg-emerald-50 border-emerald-300" onClick={() => onCommit?.(selected)}>
              {t("openings.actions.saveSelection", { defaultValue: "Spara val" })}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <CatalogCard
              key={i}
              item={r}
              onSelect={() => confirmAdd(r, replace?.enabled && Number.isInteger(replace.index) ? replace.index : null)}
              replaceMode={!!replace?.enabled}
            />
          ))}
        </div>

        {selected.length > 0 && (
          <div className="mt-5 rounded-xl border p-3 bg-gray-50">
            <div className="text-sm font-medium mb-2">{t("openings.catalog.chosen", { defaultValue: "Valda:" })}</div>
            <div className="flex flex-wrap gap-2">
              {selected.map((it, idx) => (
                <div key={idx} className="relative flex items-center gap-2 rounded-lg border bg-white p-2">
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 bg-white rounded-full border text-red-600 w-6 h-6 leading-6 text-center"
                    title={t("openings.actions.remove", { defaultValue: "Ta bort" })}
                    onClick={() => removeIdx(idx)}
                  >
                    ✕
                  </button>
                  <img
                    src={it.image || PLACEHOLDER_IMG}
                    alt={it.name}
                    className="w-12 h-12 object-cover rounded-md border"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes("placeholder.jpg")) e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                  />
                  <div className="text-sm">{it.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogCard({ item, onSelect, replaceMode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const specsEntries = Object.entries(item?.specs || {});
  const preview = specsEntries.slice(0, 3);
  const hasMore = specsEntries.length > preview.length;

  const price =
    item?.specs?.["Pris från"] ||
    item?.specs?.["Price from"] ||
    item?.specs?.["Pris"] ||
    item?.specs?.["Price"];

  return (
    <article className="rounded-xl border bg-white overflow-hidden flex flex-col" data-slug={item.slug || undefined}>
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={item.image || PLACEHOLDER_IMG}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (!e.currentTarget.src.includes("placeholder.jpg")) e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="text-xs text-gray-500">{item.brand || item.category || ""}</div>
        <div className="font-medium">{item.name}</div>
        {item.model && <div className="text-sm text-gray-600">{item.model}</div>}

        {price && (
          <div className="mt-1 text-sm font-semibold">
            {t("openings.catalog.priceFrom", { defaultValue: "Pris från:" })}{" "}
            <span className="font-bold">{String(price)}</span>
          </div>
        )}

        {preview.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {preview.map(([k, v]) => (
              <li key={k} className="flex gap-1">
                <span className="text-gray-500">{k}:</span>
                <span className="font-medium">{String(v)}</span>
              </li>
            ))}
            {hasMore && !open && (
              <li className="text-xs text-gray-500">
                {t("openings.catalog.moreSpecs", { defaultValue: "…fler specifikationer" })}
              </li>
            )}
          </ul>
        )}

        {open && (
          <div className="mt-3 rounded-lg border p-3 bg-gray-50 text-sm">
            {specsEntries.length > 0 ? (
              <>
                <div className="font-medium mb-1">{t("openings.catalog.allSpecs", { defaultValue: "Alla specifikationer" })}</div>
                <ul className="space-y-1">
                  {specsEntries.map(([k, v]) => (
                    <li key={k} className="flex gap-1">
                      <span className="text-gray-500">{k}:</span>
                      <span className="font-medium">{String(v)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-gray-600">{t("openings.catalog.noSpecs", { defaultValue: "Specifikationer saknas." })}</div>
            )}
            {item.category ? (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">{t("openings.catalog.category", { defaultValue: "Kategori:" })}</span>{" "}
                {item.category}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
            onClick={onSelect}
            title={
              replaceMode
                ? t("openings.actions.replace", { defaultValue: "Byt ut" })
                : t("openings.actions.add", { defaultValue: "Lägg till" })
            }
          >
            {replaceMode
              ? t("openings.actions.replaceWithThis", { defaultValue: "Byt ut med denna" })
              : t("openings.actions.add", { defaultValue: "Lägg till" })}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
            onClick={() => setOpen((o) => !o)}
          >
            {open
              ? t("openings.actions.lessInfo", { defaultValue: "Mindre info" })
              : t("openings.actions.moreInfo", { defaultValue: "Mer info" })}
          </button>
        </div>
      </div>
    </article>
  );
}

function MountZoomModal({ img, title, text, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-full max-w-3xl relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute right-3 top-3 text-red-600 hover:text-red-700 text-xl"
          onClick={onClose}
          title={t("materialsPage.close", { defaultValue: "Stäng" })}
        >
          ✕
        </button>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2 rounded-lg border overflow-hidden">
            <img src={img || PLACEHOLDER_IMG} alt={title} className="w-full h-full object-contain bg-gray-50" />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-700">
              {text || t("openings.mountInfoMissing", { defaultValue: "Monteringsinformation saknas." })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
