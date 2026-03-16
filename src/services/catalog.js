// src/services/catalog.js
export const CATALOG_PATHS = {
  sink:   "data/catalog/sinks.json",
  faucet: "data/catalog/faucets.json",
  hob:    "data/catalog/hobs.json",
};

// Byt vid deploy för att tvinga om-laddning (cache-bust)
const VERSION = import.meta.env.VITE_CATALOG_VERSION || "1";

function baseUrl() {
  return (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
}

export async function loadCatalog(kind) {
  const path = CATALOG_PATHS[kind];
  const url = `${baseUrl()}${path}?v=${encodeURIComponent(VERSION)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const arr = await res.json();

  const toItem = (p) => ({
    id: p.slug,
    name: p.title,
    specs: p.specs || {},
    image: p.image
      ? `${baseUrl()}products/${p.image}`
      : `${baseUrl()}products/${p.slug}.jpg`,
  });

  const seen = new Set();
  const out = [];
  for (const p of arr) {
    if (!p?.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(toItem(p));
  }
  return out;
}

export async function loadAllCatalogs() {
  const [sinks, faucets, hobs] = await Promise.all([
    loadCatalog("sink"),
    loadCatalog("faucet"),
    loadCatalog("hob"),
  ]);
  return { sinks, faucets, hobs };
}
