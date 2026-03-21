// src/chat/ChatWidget.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext.jsx";
import BookingModal from "../components/BookingModal.jsx";
import "./ChatWidget.css";

const STORAGE_KEY = "marmorskivan_chat_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const POLL_INTERVAL_MS   = 5_000;
const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

function AvatarEl({ url, emoji, className, style }) {
  const isImg = url && (url.startsWith("http") || url.startsWith("/") || url.startsWith("data:"));
  return (
    <div className={className || "ms-chat-avatar"} style={isImg ? { ...style, padding: 0, overflow: "hidden" } : style}>
      {isImg
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }} />
        : (emoji || url)
      }
    </div>
  );
}

function uid() { return `${Date.now()}_${Math.random().toString(16).slice(2)}`; }

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

// Business hours (Stockholm): Mån–Fre 08:00–17:00
function isWithinBusinessHours() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));
  const day = now.getDay(); // 0=Sun, 6=Sat
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;
  return day >= 1 && day <= 5 && mins >= 8 * 60 && mins < 17 * 60;
}

const QUICK_ACTIONS = [
  { key: "price",     label: "💰 Priser" },
  { key: "materials", label: "🪨 Material" },
  { key: "measure",   label: "📏 Mätning" },
  { key: "delivery",  label: "🚚 Leverans" },
];
const QUICK_MESSAGES = {
  price:     "Vad kostar en bänkskiva?",
  materials: "Vilket material är bäst för kök?",
  measure:   "Hur fungerar mätningen?",
  delivery:  "Hur lång är leveranstiden?",
};

export default function ChatWidget() {
  const settings = useSettings();
  if (settings.chat_online === "false") return null;
  return <ChatWidgetInner settings={settings} />;
}

function ChatWidgetInner({ settings }) {
  const botName       = settings.chat_bot_name      || "Marmorskivan AI";
  const botAvatar     = settings.chat_bot_avatar    || "🪨";
  const botAvatarUrl  = settings.chat_bot_avatar_url || "";
  const agentName     = settings.agent_name         || "Kundtjänst";
  const agentAvatar   = settings.agent_avatar       || "🧑‍💼";
  const agentAvatarUrl = settings.agent_avatar_url  || "";
  const greeting      = settings.chat_greeting      || "Hej! Hur kan jag hjälpa dig med din bänkskiva?";
  const accent        = settings.accent_color       || "#059669";
  const online        = isWithinBusinessHours();

  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState(() => safeLoad(STORAGE_KEY + "_msgs", []));
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [mode, setMode]         = useState("bot"); // 'bot' | 'agent'
  const [form, setForm]         = useState({ name: "", phone: "", email: "", message: "" });
  const [unread, setUnread]     = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const sessionRef     = useRef(safeLoad(STORAGE_KEY + "_session", null));
  const lastSeenRef    = useRef(safeLoad(STORAGE_KEY + "_lastSeen", null));
  const isOpenRef      = useRef(false);
  isOpenRef.current    = isOpen;

  useEffect(() => { safeSave(STORAGE_KEY + "_msgs", messages); }, [messages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);
  useEffect(() => {
    if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  useEffect(() => {
    const stored = sessionRef.current;
    const now = Date.now();
    if (!stored || now - stored.ts > SESSION_TIMEOUT_MS) {
      sessionRef.current = { id: uid(), ts: now };
      safeSave(STORAGE_KEY + "_session", sessionRef.current);
      lastSeenRef.current = null;
      safeSave(STORAGE_KEY + "_lastSeen", null);
    }
  }, []);

  // Poll for agent replies every 5s
  useEffect(() => {
    const sessionId = sessionRef.current?.id;
    if (!sessionId) return;
    const poll = async () => {
      try {
        const params = lastSeenRef.current ? `?after=${encodeURIComponent(lastSeenRef.current)}` : "";
        const res = await fetch(`${API_BASE}/api/chat/messages/${sessionId}${params}`);
        if (!res.ok) return;
        const { messages: dbMsgs } = await res.json();
        const agentMsgs = dbMsgs.filter((m) => m.role === "agent");
        if (!agentMsgs.length) return;
        if (dbMsgs.length) {
          lastSeenRef.current = dbMsgs[dbMsgs.length - 1].created_at;
          safeSave(STORAGE_KEY + "_lastSeen", lastSeenRef.current);
        }
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const newMsgs = agentMsgs
            .filter((m) => !ids.has(`agent_${m.id}`))
            .map((m) => ({ id: `agent_${m.id}`, role: "agent", content: m.content, ts: new Date(m.created_at).getTime() }));
          if (!newMsgs.length) return prev;
          if (!isOpenRef.current) setUnread((n) => n + newMsgs.length);
          return [...prev, ...newMsgs];
        });
      } catch {}
    };
    poll();
    const t = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  // Poll for handover (bot → agent mode)
  useEffect(() => {
    const sessionId = sessionRef.current?.id;
    if (!sessionId) return;
    let prevMode = "bot";
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/mode`);
        if (!res.ok) return;
        const { mode: m } = await res.json();
        if (m === "agent" && prevMode === "bot") {
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: "assistant", content: "Du är nu kopplad till en av våra rådgivare. 👋 Vi svarar dig direkt!", ts: Date.now() },
          ]);
        }
        prevMode = m;
        setMode(m);
      } catch {}
    };
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  // Send typing indicator (debounced, max 1 req/3s)
  const typingTimer = useRef(null);
  const sendTyping = useCallback(() => {
    if (typingTimer.current) return;
    const sessionId = sessionRef.current?.id;
    if (!sessionId) return;
    fetch(`${API_BASE}/api/chat/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
    typingTimer.current = setTimeout(() => { typingTimer.current = null; }, 3000);
  }, []);

  const addMsg = useCallback((role, content) => {
    const msg = { id: uid(), role, content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);
    if (role !== "user" && !isOpen) setUnread((n) => n + 1);
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    addMsg("user", userText);
    setLoading(true);
    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history, sessionId: sessionRef.current?.id, page: window.location.pathname }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.mode === "agent" || data.reply === null) {
        // Agent mode — vänta på mänskligt svar via polling
        setMode("agent");
        return;
      }
      const replyTs = new Date().toISOString();
      lastSeenRef.current = replyTs;
      safeSave(STORAGE_KEY + "_lastSeen", replyTs);
      addMsg("assistant", data.reply || "Tyvärr kunde jag inte svara just nu.");
    } catch {
      addMsg("assistant", "Tyvärr uppstod ett fel. Ring oss eller skicka en offertförfrågan.");
    } finally { setLoading(false); }
  }, [loading, messages, addMsg]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
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
    setMessages([]); setShowForm(false); setFormSent(false);
    lastSeenRef.current = null;
    sessionStorage.removeItem(STORAGE_KEY + "_msgs");
    safeSave(STORAGE_KEY + "_lastSeen", null);
  };

  return (
    <>
      <button
        className={`ms-chat-toggle${unread ? " blinking" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        style={{ background: accent }}
        aria-label={isOpen ? "Stäng chatt" : "Öppna chatt"}
      >
        {isOpen
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        }
        {unread > 0 && !isOpen && <span className="ms-unread">{unread}</span>}
      </button>

      {isOpen && (
        <div className="ms-chat-container" role="dialog" aria-label="Chatt">

          {/* Header with accent color */}
          <div className="ms-chat-header" style={{ background: accent }}>
            <div className="ms-chat-header-top">
              <div className="ms-chat-header-info">
                <AvatarEl url={botAvatarUrl} emoji={botAvatar} className="ms-header-avatar" />
                <div>
                  <div className="ms-chat-brand">{botName}</div>
                  <div className="ms-chat-subtitle">
                    <span className={`ms-status-dot ${online || mode === "agent" ? "online" : "offline"}`} />
                    {mode === "agent"
                      ? `${agentName} — Human support`
                      : online
                        ? "Online — svarar direkt"
                        : "Offline — svarar Mån–Fre 08–17"}
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

          <div className="ms-chat-messages">
            {messages.length === 0 && (
              <div className="ms-chat-welcome">
                <AvatarEl url={botAvatarUrl} emoji={botAvatar} className="ms-welcome-avatar" />
                <div className="ms-welcome-title">{greeting}</div>
                {!online && mode !== "agent" && (
                  <div className="ms-offline-notice">
                    🕐 Vi är just nu offline. Vi svarar på meddelanden vardagar 08–17. Du kan fortfarande skriva — vi återkommer!
                  </div>
                )}
                <div className="ms-quick-actions">
                  {QUICK_ACTIONS.map((qa) => (
                    <button
                      key={qa.key}
                      className="ms-qa-btn"
                      style={{ borderColor: accent, color: accent }}
                      onClick={() => sendMessage(QUICK_MESSAGES[qa.key])}
                    >
                      {qa.label}
                    </button>
                  ))}
                  <button
                    className="ms-qa-btn"
                    style={{ borderColor: accent, color: accent }}
                    onClick={() => setShowBooking(true)}
                  >
                    📅 Boka tid
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`ms-message ${m.role}`}>
                {m.role === "assistant" && (
                  <AvatarEl url={botAvatarUrl} emoji={botAvatar} style={{ background: accent + "22", color: accent }} />
                )}
                {m.role === "agent" && (
                  <AvatarEl url={agentAvatarUrl} emoji={agentAvatar} className="ms-chat-avatar ms-agent-avatar" />
                )}
                <div className="ms-message-wrapper">
                  {(m.role === "assistant" || m.role === "agent") && (
                    <div className="ms-message-sender">
                      {m.role === "agent" ? agentName : botName}
                    </div>
                  )}
                  <div
                    className="ms-message-content"
                    style={m.role === "user" ? { background: accent } : undefined}
                  >
                    {m.content}
                  </div>
                  <div className="ms-message-time">{formatTime(m.ts)}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ms-message assistant">
                <AvatarEl url={botAvatarUrl} emoji={botAvatar} style={{ background: accent + "22", color: accent }} />
                <div className="ms-message-wrapper">
                  <div className="ms-message-sender">{botName}</div>
                  <div className="ms-message-content ms-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

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
                  <button type="submit" className="ms-form-primary" style={{ background: accent }}>Skicka</button>
                  <button type="button" className="ms-form-secondary" onClick={() => setShowForm(false)}>Avbryt</button>
                </div>
              </form>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ms-chat-footer">
            {!showForm && (
              <button
                className="ms-contact-btn"
                style={{ color: accent, borderColor: accent + "44" }}
                onClick={() => setShowForm(true)}
              >
                📞 Bli kontaktad
              </button>
            )}
            <div className="ms-chat-input-row">
              <textarea
                ref={inputRef}
                className="ms-chat-input"
                value={input}
                onChange={(e) => { setInput(e.target.value); sendTyping(); }}
                onKeyDown={handleKey}
                placeholder={mode === "agent" ? "Skriv till vår rådgivare…" : "Skriv ett meddelande…"}
                rows={1}
                disabled={loading}
              />
              <button
                className="ms-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{ background: accent }}
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
      {showBooking && (
        <BookingModal
          onClose={() => setShowBooking(false)}
          sessionId={sessionRef.current?.id || null}
        />
      )}
    </>
  );
}
