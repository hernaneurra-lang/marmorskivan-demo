// src/admin/AdminPage.jsx — Marmorskivan Admin Panel
import { useState, useEffect } from "react";
import "./admin.css";
import SessionsView from "./SessionsView.jsx";
import AnalyticsView from "./AnalyticsView.jsx";
import ContactsView from "./ContactsView.jsx";
import SettingsView from "./SettingsView.jsx";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const TOKEN_KEY = "ms_admin_token";

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
  { key: "sessions",  icon: "💬", label: "Chattar" },
  { key: "contacts",  icon: "📞", label: "Kontakter" },
  { key: "analytics", icon: "📊", label: "Analytics" },
  { key: "settings",  icon: "⚙️", label: "Inställningar" },
];

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [view, setView] = useState("sessions");

  if (!token) return <Login onLogin={setToken} />;

  const headers = { "x-admin-token": token };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          🪨 Marmorskivan
          <span>Admin panel</span>
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
        <div className="admin-logout">
          <button onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setToken(""); }}>
            Logga ut
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {view === "sessions"  && <SessionsView  headers={headers} apiBase={API_BASE} />}
        {view === "contacts"  && <ContactsView  headers={headers} apiBase={API_BASE} />}
        {view === "analytics" && <AnalyticsView headers={headers} apiBase={API_BASE} />}
        {view === "settings"  && <SettingsView  headers={headers} apiBase={API_BASE} />}
      </main>
    </div>
  );
}
