// src/admin/SessionsView.jsx
import { useState, useEffect, useCallback } from "react";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return "Nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim`;
  return `${Math.floor(diff / 86400)} d`;
}

function SessionList({ sessions, selectedId, onSelect }) {
  if (!sessions.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <div>Inga chattar ännu</div>
      </div>
    );
  }
  return (
    <div className="session-list">
      {sessions.map((s) => (
        <div
          key={s.id}
          className={`session-item${selectedId === s.id ? " selected" : ""}`}
          onClick={() => onSelect(s)}
        >
          <div className="session-avatar">
            {s.has_contact ? "📞" : "💬"}
          </div>
          <div className="session-info">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {s.has_contact ? "Kontaktbegäran" : "Anonym"}
              </span>
              {s.has_contact && <span className="badge badge-green">Lead</span>}
              <span className="badge badge-gray">{s.message_count} msg</span>
            </div>
            <div className="session-preview">{s.last_message || "–"}</div>
            <div className="session-meta">{s.page || "–"}</div>
          </div>
          <div className="session-time">{timeAgo(s.last_message_at)}</div>
        </div>
      ))}
    </div>
  );
}

function SessionDetail({ session, headers, apiBase, onReplyDone }) {
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const res = await fetch(`${apiBase}/api/admin/sessions/${session.id}/messages`, { headers });
    const json = await res.json();
    setData(json);
  }, [session, apiBase, headers]);

  useEffect(() => { load(); }, [load]);

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`${apiBase}/api/admin/sessions/${session.id}/reply`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });
      setReply("");
      await load();
      onReplyDone?.();
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">👈</div>
        <div>Välj en konversation</div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 24, color: "var(--muted)" }}>Laddar…</div>;
  }

  return (
    <div className="chat-detail-panel">
      {/* Header */}
      <div className="admin-topbar" style={{ padding: "12px 20px" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Session</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{session.id}</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{session.page}</div>
      </div>

      {/* Contact info if present */}
      {data.contact && (
        <div className="contact-box" style={{ margin: "12px 20px 0" }}>
          <div className="contact-box-title">📞 Kontaktuppgifter</div>
          <div className="contact-box-row"><strong>Namn:</strong> {data.contact.name}</div>
          <div className="contact-box-row"><strong>Tel:</strong> {data.contact.phone}</div>
          {data.contact.email && <div className="contact-box-row"><strong>E-post:</strong> {data.contact.email}</div>}
          {data.contact.message && <div className="contact-box-row"><strong>Meddelande:</strong> {data.contact.message}</div>}
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages-area">
        {data.messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div>
              <div className="msg-bubble">{m.content}</div>
              <div className="msg-time">
                {m.role === "agent" ? "🧑‍💼 Agent · " : m.role === "assistant" ? "🤖 AI · " : ""}
                {new Date(m.created_at).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {data.messages.length === 0 && (
          <div className="empty-state"><div>Inga meddelanden</div></div>
        )}
      </div>

      {/* Reply box */}
      <div className="reply-box">
        <textarea
          className="reply-input"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Skriv ett manuellt svar till kunden…"
          rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
        />
        <button className="btn-send" onClick={sendReply} disabled={!reply.trim() || sending}>
          {sending ? "…" : "Skicka"}
        </button>
      </div>
    </div>
  );
}

export default function SessionsView({ headers, apiBase }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/sessions`, { headers });
      const json = await res.json();
      setSessions(json.sessions || []);
    } finally {
      setLoading(false);
    }
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="admin-topbar">
        <h1>💬 Chattar</h1>
        <button className="btn-refresh" onClick={load}>Uppdatera</button>
      </div>
      <div className="chat-split" style={{ height: "calc(100vh - 57px)" }}>
        <div className="chat-list-panel">
          {loading ? (
            <div style={{ padding: 24, color: "var(--muted)" }}>Laddar…</div>
          ) : (
            <SessionList sessions={sessions} selectedId={selected?.id} onSelect={setSelected} />
          )}
        </div>
        <SessionDetail
          session={selected}
          headers={headers}
          apiBase={apiBase}
          onReplyDone={load}
        />
      </div>
    </>
  );
}
