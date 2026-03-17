// src/admin/SessionsView.jsx — Chat console with search, filters, status, notes, canned responses
import { useState, useEffect, useCallback, useRef } from "react";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return "Nu";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim`;
  return `${Math.floor(diff / 86400)} d`;
}

const STATUS_LABELS = { open: "Öppen", resolved: "Avslutad" };
const STATUS_COLORS = { open: "var(--green)", resolved: "var(--muted)" };
const PRIORITY_LABELS = { normal: "Normal", high: "Hög", urgent: "Brådskande" };
const PRIORITY_COLORS = { normal: "var(--muted)", high: "#f59e0b", urgent: "#ef4444" };

function SessionList({ sessions, selectedId, onSelect }) {
  if (!sessions.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <div>Inga chattar hittades</div>
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
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {s.has_contact ? "Kontaktbegäran" : "Anonym"}
              </span>
              {s.has_contact && <span className="badge badge-green">Lead</span>}
              {s.status === "resolved" && <span className="badge badge-gray">Avslutad</span>}
              {s.priority === "high"   && <span className="badge badge-orange">Hög</span>}
              {s.priority === "urgent" && <span className="badge badge-red">Brådskande</span>}
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

function SessionDetail({ session, headers, apiBase, onUpdated, cannedResponses }) {
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const messagesEndRef = useRef(null);

  const load = useCallback(async () => {
    if (!session) return;
    const res = await fetch(`${apiBase}/api/admin/sessions/${session.id}/messages`, { headers });
    const json = await res.json();
    setData(json);
    setNote(json.session?.note || "");
  }, [session?.id, apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

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
      setShowCanned(false);
      await load();
      onUpdated?.();
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    await fetch(`${apiBase}/api/admin/sessions/${session.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdated?.();
    load();
  };

  const updatePriority = async (priority) => {
    await fetch(`${apiBase}/api/admin/sessions/${session.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    onUpdated?.();
    load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await fetch(`${apiBase}/api/admin/sessions/${session.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      onUpdated?.();
    } finally {
      setSavingNote(false);
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
  if (!data) return <div style={{ padding: 24, color: "var(--muted)" }}>Laddar…</div>;

  const sessionInfo = data.session || session;

  return (
    <div className="chat-detail-panel">
      {/* Header */}
      <div className="admin-topbar" style={{ padding: "10px 16px", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Session</div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{session.id}</div>
        </div>

        {/* Status selector */}
        <select
          className="admin-select"
          value={sessionInfo.status || "open"}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        {/* Priority selector */}
        <select
          className="admin-select"
          value={sessionInfo.priority || "normal"}
          onChange={(e) => updatePriority(e.target.value)}
          style={{ color: PRIORITY_COLORS[sessionInfo.priority || "normal"] }}
        >
          {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        {/* End session button */}
        {sessionInfo.status !== "resolved" ? (
          <button
            className="btn-refresh"
            onClick={() => updateStatus("resolved")}
            style={{ flexShrink: 0, fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
            title="Avsluta session"
          >
            ✓ Avsluta
          </button>
        ) : (
          <button
            className="btn-refresh"
            onClick={() => updateStatus("open")}
            style={{ flexShrink: 0, fontSize: 12, color: "var(--green)" }}
            title="Öppna igen"
          >
            ↩ Öppna
          </button>
        )}

        <div style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto", textAlign: "right", flexShrink: 0, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
          {session.page}
        </div>
      </div>

      {/* Contact info if present */}
      {data.contact && (
        <div className="contact-box" style={{ margin: "10px 16px 0" }}>
          <div className="contact-box-title">📞 Kontaktuppgifter</div>
          <div className="contact-box-row"><strong>Namn:</strong> {data.contact.name}</div>
          <div className="contact-box-row"><strong>Tel:</strong> <a href={`tel:${data.contact.phone}`} style={{ color: "var(--green)" }}>{data.contact.phone}</a></div>
          {data.contact.email && <div className="contact-box-row"><strong>E-post:</strong> <a href={`mailto:${data.contact.email}`} style={{ color: "var(--green)" }}>{data.contact.email}</a></div>}
          {data.contact.message && <div className="contact-box-row"><strong>Meddelande:</strong> {data.contact.message}</div>}
        </div>
      )}

      {/* Internal note */}
      <div style={{ margin: "10px 16px 0", display: "flex", gap: 8 }}>
        <input
          className="admin-input"
          style={{ flex: 1, marginBottom: 0, fontSize: 12 }}
          placeholder="📝 Intern anteckning (syns ej för kunden)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveNote()}
        />
        <button className="btn-refresh" onClick={saveNote} disabled={savingNote} style={{ flexShrink: 0, fontSize: 12 }}>
          {savingNote ? "…" : "Spara"}
        </button>
      </div>

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
        <div ref={messagesEndRef} />
      </div>

      {/* Canned responses panel */}
      {showCanned && cannedResponses?.length > 0 && (
        <div className="canned-panel">
          <div style={{ fontSize: 11, color: "var(--muted)", padding: "8px 12px 4px", fontWeight: 600, textTransform: "uppercase" }}>
            Snabbsvar
          </div>
          {cannedResponses.map((r) => (
            <button
              key={r.id}
              className="canned-item"
              onClick={() => { setReply(r.content); setShowCanned(false); }}
            >
              <span className="canned-shortcut">/{r.shortcut}</span>
              <span className="canned-preview">{r.content}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reply box */}
      <div className="reply-box">
        <button
          className="btn-refresh"
          onClick={() => setShowCanned((v) => !v)}
          style={{ flexShrink: 0, fontSize: 18, padding: "0 10px" }}
          title="Snabbsvar"
        >
          ⚡
        </button>
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cannedResponses, setCannedResponses] = useState([]);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${apiBase}/api/admin/sessions?${params}`, { headers });
      const json = await res.json();
      setSessions(json.sessions || []);
    } finally {
      setLoading(false);
    }
  }, [apiBase, filter, search, JSON.stringify(headers)]);

  const loadCanned = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/canned-responses`, { headers });
      const json = await res.json();
      setCannedResponses(json.responses || []);
    } catch {}
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCanned(); }, [loadCanned]);

  const FILTERS = [
    { value: "all",      label: "Alla" },
    { value: "open",     label: "Öppna" },
    { value: "leads",    label: "Leads" },
    { value: "resolved", label: "Avslutade" },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>💬 Chattar</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, maxWidth: 600 }}>
          {/* Search */}
          <input
            className="admin-input"
            style={{ flex: 1, marginBottom: 0, fontSize: 12 }}
            placeholder="Sök session, sida, anteckning…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Filters */}
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`period-btn${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
          <button className="btn-refresh" onClick={load}>↻</button>
        </div>
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
          onUpdated={load}
          cannedResponses={cannedResponses}
        />
      </div>
    </>
  );
}
