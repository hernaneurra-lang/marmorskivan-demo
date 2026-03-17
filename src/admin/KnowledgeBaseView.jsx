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

  const loadKB = useCallback(async () => {
    setLoading(true);
    try {
      const [kbRes, cannedRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/knowledge-base`, { headers }),
        fetch(`${apiBase}/api/admin/canned-responses`, { headers }),
      ]);
      const [kbData, cannedData] = await Promise.all([kbRes.json(), cannedRes.json()]);
      setKbItems(kbData.items || []);
      setCanned(cannedData.responses || []);
    } finally {
      setLoading(false);
    }
  }, [apiBase, JSON.stringify(headers)]);

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
          <button className="btn-refresh" onClick={loadKB}>↻</button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
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
