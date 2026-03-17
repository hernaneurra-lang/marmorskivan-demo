// src/chat/ChatWidget.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

const STORAGE_KEY = "marmorskivan_chat_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

const BUSINESS_HOURS = {
  1: { open: "08:00", close: "17:00" },
  2: { open: "08:00", close: "17:00" },
  3: { open: "08:00", close: "17:00" },
  4: { open: "08:00", close: "17:00" },
  5: { open: "08:00", close: "16:00" },
  6: null,
  0: null,
};

function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isWithinBusinessHours() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));
  const day = now.getDay();
  const hours = BUSINESS_HOURS[day];
  if (!hours) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= parseHHMM(hours.open) && cur < parseHHMM(hours.close);
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim`;
  return new Date(ts).toLocaleDateString("sv-SE", { month: "short", day: "numeric" });
}

function safeLoad(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function safeSave(key, val) {
  try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// Stone avatar SVG for assistant messages
function StoneAvatar() {
  return (
    <div className="ms-chat-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="13" rx="8" ry="7" fill="currentColor" opacity="0.25" />
        <ellipse cx="12" cy="12" rx="7" ry="6" fill="currentColor" opacity="0.5" />
        <path d="M8 10 Q10 8 12 10 Q14 12 16 10" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M9 13 Q11 15 14 13" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
    </div>
  );
}

// Quick action buttons config
const QUICK_ACTIONS = [
  { key: "price", label: "💰 Priser" },
  { key: "materials", label: "🪨 Material" },
  { key: "measure", label: "📏 Mätning" },
  { key: "delivery", label: "🚚 Leverans" },
];

const QUICK_MESSAGES = {
  price: "Vad kostar en bänkskiva?",
  materials: "Vilket material är bäst för kök?",
  measure: "Hur fungerar mätningen?",
  delivery: "Hur lång är leveranstiden?",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => safeLoad(STORAGE_KEY + "_msgs", []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [unread, setUnread] = useState(0);
  const isOnline = isWithinBusinessHours();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionRef = useRef(safeLoad(STORAGE_KEY + "_session", null));

  // Persist messages
  useEffect(() => { safeSave(STORAGE_KEY + "_msgs", messages); }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Init session + welcome message
  useEffect(() => {
    const stored = sessionRef.current;
    const now = Date.now();
    if (!stored || now - stored.ts > SESSION_TIMEOUT_MS) {
      sessionRef.current = { id: uid(), ts: now };
      safeSave(STORAGE_KEY + "_session", sessionRef.current);
    }
  }, []);

  const addMsg = useCallback((role, content) => {
    const msg = { id: uid(), role, content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);
    if (role === "assistant" && !isOpen) setUnread((n) => n + 1);
    return msg;
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    addMsg("user", userText);
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history,
          sessionId: sessionRef.current?.id,
          page: window.location.pathname,
        }),
      });

      if (!res.ok) throw new Error("server error");
      const data = await res.json();
      addMsg("assistant", data.reply || "Tyvärr kunde jag inte svara just nu. Försök igen!");
    } catch {
      addMsg("assistant", "Tyvärr uppstod ett fel. Ring oss på 08-XXX XX XX eller skicka en offertförfrågan.");
    } finally {
      setLoading(false);
    }
  }, [loading, messages, addMsg]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    try {
      await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sessionId: sessionRef.current?.id }),
      });
    } catch {}
    setFormSent(true);
    addMsg("assistant", `Tack ${form.name}! Vi hör av oss på ${form.phone} så snart som möjligt. 🙏`);
    setShowForm(false);
  };

  const clearChat = () => {
    setMessages([]);
    setShowForm(false);
    setFormSent(false);
    sessionStorage.removeItem(STORAGE_KEY + "_msgs");
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`ms-chat-toggle${unread ? " blinking" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Stäng chatt" : "Öppna chatt"}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread > 0 && !isOpen && <span className="ms-unread">{unread}</span>}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="ms-chat-container" role="dialog" aria-label="Chatt">

          {/* Header */}
          <div className="ms-chat-header">
            <div className="ms-chat-header-top">
              <div className="ms-chat-header-info">
                <span className={`ms-status-dot${isOnline ? " online" : ""}`} />
                <div>
                  <div className="ms-chat-brand">marmorskivan.se</div>
                  <div className="ms-chat-subtitle">
                    {isOnline ? "Vi är online — svarar direkt" : "Skicka ett meddelande — vi svarar snart"}
                  </div>
                </div>
              </div>
              <div className="ms-chat-header-actions">
                <button className="ms-icon-btn" onClick={clearChat} title="Rensa chatt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
                <button className="ms-icon-btn" onClick={() => setIsOpen(false)} title="Stäng">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="ms-chat-messages">
            {messages.length === 0 && (
              <div className="ms-chat-welcome">
                <div className="ms-welcome-title">Hej! 👋</div>
                <div className="ms-welcome-text">
                  Välkommen till marmorskivan.se. Fråga oss om material, priser, mätning eller leverans.
                </div>
                <div className="ms-quick-actions">
                  {QUICK_ACTIONS.map((qa) => (
                    <button key={qa.key} className="ms-qa-btn" onClick={() => sendMessage(QUICK_MESSAGES[qa.key])}>
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`ms-message ${m.role}`}>
                {m.role === "assistant" && <StoneAvatar />}
                <div className="ms-message-wrapper">
                  <div className="ms-message-content">{m.content}</div>
                  <div className="ms-message-time">{formatTime(m.ts)}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ms-message assistant">
                <StoneAvatar />
                <div className="ms-message-wrapper">
                  <div className="ms-message-content ms-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Contact form */}
            {showForm && !formSent && (
              <form className="ms-contact-form" onSubmit={handleFormSubmit}>
                <div className="ms-form-title">Lämna dina kontaktuppgifter</div>
                <input className="ms-form-input" placeholder="Namn *" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                <input className="ms-form-input" placeholder="Telefon *" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                <input className="ms-form-input" placeholder="E-post" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <textarea className="ms-form-input" placeholder="Meddelande" value={form.message} rows={2}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                <div className="ms-form-actions">
                  <button type="submit" className="ms-form-primary">Skicka</button>
                  <button type="button" className="ms-form-secondary" onClick={() => setShowForm(false)}>Avbryt</button>
                </div>
              </form>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="ms-chat-footer">
            {!showForm && (
              <button className="ms-contact-btn" onClick={() => setShowForm(true)}>
                📞 Bli kontaktad
              </button>
            )}
            <div className="ms-chat-input-row">
              <textarea
                ref={inputRef}
                className="ms-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Skriv ett meddelande…"
                rows={1}
                disabled={loading}
              />
              <button
                className="ms-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                aria-label="Skicka"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
