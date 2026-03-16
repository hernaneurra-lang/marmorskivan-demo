// Path: src/lib/render/store.js
const KEY = "ms_render_history";
const LIMIT = 12;

export function getRenders() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addRender(entry) {
  try {
    const arr = getRenders();
    const withId = { id: entry.id || String(Date.now()), ...entry };
    const next = [withId, ...arr].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRenders();
  }
}

export function clearRenders() {
  try { localStorage.removeItem(KEY); } catch {}
}
