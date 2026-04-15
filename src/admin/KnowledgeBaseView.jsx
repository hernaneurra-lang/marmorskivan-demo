// src/admin/KnowledgeBaseView.jsx — AI knowledge base + canned responses management
import { useState, useEffect, useCallback } from "react";

function KBItem({ item, onToggle, onDelete }) {
  return (
    <div className={`kb-item${item.active ? "" : " kb-inactive"}`}>
      <div className="kb-item-header">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.question}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{item.answer}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "flex-start" }}>
          <button
            className={`toggle-btn${item.active ? " active" : ""}`}
            onClick={() => onToggle(item)}
            title={item.active ? "Inaktivera" : "Aktivera"}
          >
            {item.active ? "✓ Aktiv" : "Inaktiv"}
          </button>
          <button className="delete-btn" onClick={() => onDelete(item.id)} title="Ta bort">✕</button>
        </div>
      </div>
    </div>
  );
}

function CannedItem({ item, onDelete }) {
  return (
    <div className="canned-manage-item">
      <span className="canned-shortcut">/{item.shortcut}</span>
      <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{item.content}</span>
      <button className="delete-btn" onClick={() => onDelete(item.id)}>✕</button>
    </div>
  );
}

export default function KnowledgeBaseView({ headers, apiBase }) {
  const [kbItems, setKbItems] = useState([]);
  const [canned, setCanned] = useState([]);
  const [tab, setTab] = useState("kb");
  const [loading, setLoading] = useState(true);

  // KB form
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [addingKB, setAddingKB] = useState(false);

  // Canned form
  const [newShortcut, setNewShortcut] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addingCanned, setAddingCanned] = useState(false);

  // Quick actions
  const [quickActions, setQuickActions] = useState([]);
  const [savingQA, setSavingQA] = useState(false);

  const loadKB = useCallback(async () => {
    setLoading(true);
    try {
      const [kbRes, cannedRes, settingsRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/knowledge-base`, { headers }),
        fetch(`${apiBase}/api/admin/canned-responses`, { headers }),
        fetch(`${apiBase}/api/admin/settings`, { headers }),
      ]);
      const [kbData, cannedData, settings] = await Promise.all([kbRes.json(), cannedRes.json(), settingsRes.json()]);
      setKbItems(kbData.items || []);
      setCanned(cannedData.responses || []);
      try {
        const qa = JSON.parse(settings.quick_actions_list || "[]");
        setQuickActions(qa.length ? qa : [
          { label: "💰 Priser", message: "Vad kostar en bänkskiva?" },
          { label: "🪨 Material", message: "Vilket material är bäst för kök?" },
          { label: "📏 Mätning", message: "Hur fungerar mätningen?" },
          { label: "🚚 Leverans", message: "Hur lång är leveranstiden?" },
        ]);
      } catch { setQuickActions([]); }
    } finally {
      setLoading(false);
    }
  }, [apiBase, JSON.stringify(headers)]);

  const saveQuickActions = async () => {
    setSavingQA(true);
    try {
      const settings = {};
      settings.quick_actions_list = JSON.stringify(quickActions);
      await fetch(`${apiBase}/api/admin/settings`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } finally {
      setSavingQA(false);
    }
  };

  const addQA = () => setQuickActions((prev) => [...prev, { label: "", message: "" }]);
  const updateQA = (i, patch) => setQuickActions((prev) => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));
  const removeQA = (i) => setQuickActions((prev) => prev.filter((_, idx) => idx !== i));

  useEffect(() => { loadKB(); }, [loadKB]);

  const addKB = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    setAddingKB(true);
    try {
      await fetch(`${apiBase}/api/admin/knowledge-base`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ.trim(), answer: newA.trim() }),
      });
      setNewQ(""); setNewA("");
      await loadKB();
    } finally {
      setAddingKB(false);
    }
  };

  const toggleKB = async (item) => {
    await fetch(`${apiBase}/api/admin/knowledge-base/${item.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    await loadKB();
  };

  const deleteKB = async (id) => {
    if (!confirm("Ta bort detta Q&A?")) return;
    await fetch(`${apiBase}/api/admin/knowledge-base/${id}`, { method: "DELETE", headers });
    await loadKB();
  };

  const addCanned = async () => {
    if (!newShortcut.trim() || !newContent.trim()) return;
    setAddingCanned(true);
    try {
      await fetch(`${apiBase}/api/admin/canned-responses`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ shortcut: newShortcut.trim().replace(/^\//, ""), content: newContent.trim() }),
      });
      setNewShortcut(""); setNewContent("");
      await loadKB();
    } finally {
      setAddingCanned(false);
    }
  };

  const deleteCanned = async (id) => {
    await fetch(`${apiBase}/api/admin/canned-responses/${id}`, { method: "DELETE", headers });
    await loadKB();
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>📚 Kunskapsbas</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`period-btn${tab === "kb" ? " active" : ""}`} onClick={() => setTab("kb")}>
            📚 Q&A ({kbItems.length})
          </button>
          <button className={`period-btn${tab === "canned" ? " active" : ""}`} onClick={() => setTab("canned")}>
            ⚡ Snabbsvar ({canned.length})
          </button>
          <button className={`period-btn${tab === "quickactions" ? " active" : ""}`} onClick={() => setTab("quickactions")}>
            🔘 Snabbfrågor ({quickActions.length})
          </button>
          <button className="btn-refresh" onClick={loadKB}>↻</button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
        ) : tab === "quickactions" ? (
          <>
            <div style={{ marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>
              Snabbfrågorna visas som knappar i chattwidgeten. Kunden klickar på dem för att snabbt ställa en fråga.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {quickActions.map((qa, i) => (
                <div key={i} className="admin-card" style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, margin: 0 }}>
                  <div style={{ flex: "0 0 160px" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Knapptext (emoji + label)</div>
                    <input
                      className="admin-input"
                      value={qa.label}
                      onChange={(e) => updateQA(i, { label: e.target.value })}
                      placeholder="💰 Priser"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Meddelande som skickas</div>
                    <input
                      className="admin-input"
                      value={qa.message}
                      onChange={(e) => updateQA(i, { message: e.target.value })}
                      placeholder="Vad kostar en bänkskiva?"
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <button
                    onClick={() => removeQA(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 18, padding: "0 4px", flexShrink: 0, marginTop: 16 }}
                  >✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={addQA}
                style={{ padding: "8px 16px", borderRadius: 8, border: "2px dashed var(--border)", background: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, fontWeight: 600 }}
              >
                + Lägg till fråga
              </button>
              <button
                className="btn-send"
                onClick={saveQuickActions}
                disabled={savingQA}
              >
                {savingQA ? "Sparar…" : "💾 Spara snabbfrågor"}
              </button>
            </div>
            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--surface2)", borderRadius: 8, fontSize: 12, color: "var(--muted)", border: "1px solid var(--border)" }}>
              Förhandsgranskning: {quickActions.map((qa) => (
                <span key={qa.label} style={{ display: "inline-block", margin: "4px 4px 0 0", padding: "3px 10px", borderRadius: 12, border: "1px solid var(--green)", color: "var(--green)", fontSize: 12 }}>
                  {qa.label || "…"}
                </span>
              ))}
            </div>
          </>
        ) : tab === "kb" ? (
          <>
            <div style={{ marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>
              Aktiva Q&A-par används av AI-assistenten som faktabas. Inaktiva ignoreras av AI:n.
            </div>

            {/* Add new KB item */}
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-title">➕ Lägg till Q&A</div>
              <input
                className="admin-input"
                placeholder="Fråga (t.ex. Vad kostar granit?)"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
              />
              <textarea
                className="reply-input"
                placeholder="Svar…"
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
              <button
                className="btn-primary"
                onClick={addKB}
                disabled={addingKB || !newQ.trim() || !newA.trim()}
                style={{ marginTop: 8 }}
              >
                {addingKB ? "Lägger till…" : "Lägg till"}
              </button>
            </div>

            {/* KB list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {kbItems.map((item) => (
                <KBItem key={item.id} item={item} onToggle={toggleKB} onDelete={deleteKB} />
              ))}
              {kbItems.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Inga Q&A-par ännu</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>
              Snabbsvar används i chatt-konsolen. Klicka på ⚡ i svarsrutan för att infoga ett snabbsvar.
            </div>

            {/* Add canned response */}
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div className="admin-card-title">➕ Lägg till snabbsvar</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Shortcut</div>
                  <input
                    className="admin-input"
                    placeholder="hej"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value.replace(/[^a-z0-9_]/gi, ""))}
                    style={{ width: 100, marginBottom: 0 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Text</div>
                  <input
                    className="admin-input"
                    placeholder="Hej! Tack för att du hör av dig…"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={addCanned}
                  disabled={addingCanned || !newShortcut.trim() || !newContent.trim()}
                  style={{ marginTop: 20, flexShrink: 0 }}
                >
                  {addingCanned ? "…" : "Lägg till"}
                </button>
              </div>
            </div>

            {/* Canned list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {canned.map((item) => (
                <CannedItem key={item.id} item={item} onDelete={deleteCanned} />
              ))}
              {canned.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Inga snabbsvar ännu</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
