// src/lib/analytics.js — Marmorskivan analytics
const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const STORAGE_KEY = "ms_analytics_session";
const SESSION_TTL = 30 * 60 * 1000;

let sessionId = null;
let pageEntryTime = Date.now();
let currentPage = null;
let maxScrollDepth = 0;

// ── Browser fingerprint (lightweight, privacy-safe) ──
let _fp = null;
function getFingerprint() {
  if (_fp) return _fp;
  try {
    const nav = navigator;
    const screen = window.screen;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = [
      nav.language,
      `${screen.width}x${screen.height}`,
      screen.colorDepth,
      tz,
      nav.platform || "",
      nav.hardwareConcurrency || "",
      nav.deviceMemory || "",
      nav.cookieEnabled ? 1 : 0,
      typeof window.TouchEvent !== "undefined" ? 1 : 0,
    ];
    // Simple hash
    const str = parts.join("|");
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
    _fp = {
      hash: (h >>> 0).toString(16),
      lang: nav.language,
      screen: `${screen.width}x${screen.height}`,
      tz,
      mobile: /Mobi|Android/i.test(nav.userAgent),
      cores: nav.hardwareConcurrency,
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
