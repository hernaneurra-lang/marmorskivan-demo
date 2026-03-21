// src/admin/AdminPage.jsx — Marmorskivan Admin Panel
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import "./admin.css";
import DashboardView from "./DashboardView.jsx";
import SessionsView from "./SessionsView.jsx";
import AnalyticsView from "./AnalyticsView.jsx";
import ContactsView from "./ContactsView.jsx";
import ReportsView from "./ReportsView.jsx";
import KnowledgeBaseView from "./KnowledgeBaseView.jsx";
import SettingsView from "./SettingsView.jsx";
import BookingView from "./BookingView.jsx";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const TOKEN_KEY = "ms_admin_token";
const THEME_KEY = "ms_admin_theme";

// ── Toast context ──
export const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || "info"}`} onClick={() => onRemove(t.id)} style={{ cursor: "pointer" }}>
          <span>{t.icon || "ℹ️"}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span style={{ color: "var(--muted)", fontSize: 16 }}>×</span>
        </div>
      ))}
    </div>
  );
}

function Login({ onLogin }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        sessionStorage.setItem(TOKEN_KEY, token);
        onLogin(token);
      } else {
        setError("Fel lösenord");
      }
    } catch {
      setError("Kunde inte ansluta till servern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-title">🪨 Marmorskivan</div>
        <div className="admin-login-sub">Admin — logga in</div>
        <form onSubmit={submit}>
          <input
            className="admin-input"
            type="password"
            placeholder="Lösenord"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
          />
          {error && <div className="admin-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? "Loggar in…" : "Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard",  icon: "🏠", label: "Dashboard" },
  { key: "sessions",   icon: "💬", label: "Chattar" },
  { key: "contacts",   icon: "📞", label: "Kontakter" },
  { key: "analytics",  icon: "📊", label: "Analytics" },
  { key: "reports",    icon: "📥", label: "Rapporter" },
  { key: "knowledge",  icon: "📚", label: "Kunskapsbas" },
  { key: "bookings",   icon: "📅", label: "Bokningar" },
  { key: "settings",   icon: "⚙️", label: "Inställningar" },
];

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [toasts, setToasts] = useState([]);

  // Apply theme to :root data attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const addToast = useCallback((message, type = "info", icon) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  if (!token) return <Login onLogin={setToken} />;

  const headers = { "x-admin-token": token };

  return (
    <ToastContext.Provider value={addToast}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            🪨 Marmorskivan
            <span>Admin</span>
          </div>
          <nav className="admin-nav">
            {NAV.map((n) => (
              <button
                key={n.key}
                className={`admin-nav-item${view === n.key ? " active" : ""}`}
                onClick={() => setView(n.key)}
              >
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="admin-logout" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Byt till ljust läge" : "Byt till mörkt läge"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setToken(""); }}>
              Logga ut
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {view === "dashboard"  && <DashboardView    headers={headers} apiBase={API_BASE} onNavigate={setView} />}
          {view === "sessions"   && <SessionsView     headers={headers} apiBase={API_BASE} />}
          {view === "contacts"   && <ContactsView     headers={headers} apiBase={API_BASE} />}
          {view === "analytics"  && <AnalyticsView    headers={headers} apiBase={API_BASE} />}
          {view === "reports"    && <ReportsView      headers={headers} apiBase={API_BASE} />}
          {view === "knowledge"  && <KnowledgeBaseView headers={headers} apiBase={API_BASE} />}
          {view === "bookings"   && <BookingView      headers={headers} apiBase={API_BASE} />}
          {view === "settings"   && <SettingsView     headers={headers} apiBase={API_BASE} />}
        </main>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
