// Path: src/lib/ga.js

export function gaEvent(name, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  } catch {
    // aldrig låta analytics påverka flödet
  }
}
