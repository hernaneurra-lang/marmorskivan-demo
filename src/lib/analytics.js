// src/lib/analytics.js — Marmorskivan analytics
const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const STORAGE_KEY = "ms_analytics_session";
const SESSION_TTL = 30 * 60 * 1000;

let sessionId = null;
let pageEntryTime = Date.now();
let currentPage = null;
let maxScrollDepth = 0;

// ── Browser fingerprint (canvas + WebGL + audio + device) ──
let _fp = null;
function getFingerprint() {
  if (_fp) return _fp;
  try {
    const nav = navigator;
    const scr = window.screen;
    const tz  = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Canvas fingerprint
    let canvasHash = "";
    try {
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Bänkskiva 🪨", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.fillText("Bänkskiva 🪨", 4, 17);
      canvasHash = c.toDataURL().slice(-50);
    } catch {}

    // WebGL renderer
    let webgl = "";
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
      if (dbg) webgl = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).slice(0, 30);
    } catch {}

    const parts = [
      nav.language, nav.languages?.join(",") || "",
      `${scr.width}x${scr.height}`, scr.colorDepth, scr.pixelDepth,
      tz, nav.platform || "",
      nav.hardwareConcurrency || "", nav.deviceMemory || "",
      nav.cookieEnabled ? 1 : 0,
      typeof window.TouchEvent !== "undefined" ? 1 : 0,
      canvasHash, webgl,
      nav.maxTouchPoints || 0,
      Intl.NumberFormat().resolvedOptions().locale,
    ];

    const str = parts.join("|");
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }

    _fp = {
      hash:   (h >>> 0).toString(16),
      lang:   nav.language,
      screen: `${scr.width}x${scr.height}`,
      tz,
      mobile: /Mobi|Android/i.test(nav.userAgent),
      cores:  nav.hardwareConcurrency,
      webgl:  webgl || null,
    };
  } catch { _fp = {}; }
  return _fp;
}

function getOrCreateSession() {
  if (sessionId) return sessionId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const d = JSON.parse(stored);
      if (Date.now() - d.ts < SESSION_TTL) {
        sessionId = d.id;
        return sessionId;
      }
    }
  } catch {}
  sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: sessionId, ts: Date.now() })); } catch {}
  return sessionId;
}

function send(event, data = {}) {
  const payload = {
    event,
    session: getOrCreateSession(),
    page: currentPage || location.pathname,
    ts: Date.now(),
    fp: getFingerprint(),
    ...data,
  };
  try {
    navigator.sendBeacon(`${API_BASE}/api/analytics`, JSON.stringify(payload));
  } catch {}
}

// Page view tracking
export function trackPageView(path) {
  currentPage = path || location.pathname;
  pageEntryTime = Date.now();
  maxScrollDepth = 0;
  send("page_view", { path: currentPage, referrer: document.referrer });
}

// Time on page (call before navigating away)
export function trackPageExit() {
  const timeMs = Date.now() - pageEntryTime;
  send("page_exit", { path: currentPage, time_ms: timeMs, max_scroll: maxScrollDepth });
}

// Scroll depth
export function initScrollTracking() {
  const handler = () => {
    const el = document.documentElement;
    const depth = Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
    if (depth > maxScrollDepth) maxScrollDepth = depth;
  };
  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

// Chat events
export function trackChatOpen() { send("chat_open"); }
export function trackChatMessage() { send("chat_message"); }
export function trackContactForm() { send("contact_form"); }

// Quote / CTA
export function trackQuoteRequest(data = {}) { send("quote_request", data); }
export function trackCalculatorUse(data = {}) { send("calculator_use", data); }

// Generic
export function trackEvent(name, data = {}) { send(name, data); }

// Auto page-view on load
if (typeof window !== "undefined") {
  trackPageView(location.pathname);
  window.addEventListener("beforeunload", trackPageExit);
}
