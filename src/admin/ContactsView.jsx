// src/admin/ContactsView.jsx
import { useState, useEffect, useCallback } from "react";

export default function ContactsView({ headers, apiBase }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/contacts`, { headers });
      const json = await res.json();
      setContacts(json.contacts || []);
    } finally {
      setLoading(false);
    }
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="admin-topbar">
        <h1>📞 Kontakter</h1>
        <button className="btn-refresh" onClick={load}>Uppdatera</button>
      </div>
      <div className="admin-content">
        <div className="admin-card">
          {loading ? (
            <div style={{ color: "var(--muted)" }}>Laddar…</div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📞</div>
              <div>Inga kontaktbegäranden ännu</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Telefon</th>
                  <th>E-post</th>
                  <th>Meddelande</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <a href={`tel:${c.phone}`} style={{ color: "var(--green)" }}>{c.phone}</a>
                    </td>
                    <td>{c.email ? (
                      <a href={`mailto:${c.email}`} style={{ color: "var(--blue)" }}>{c.email}</a>
                    ) : <span style={{ color: "var(--muted)" }}>–</span>}</td>
                    <td style={{ maxWidth: 300, color: "var(--muted)" }}>{c.message || "–"}</td>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(c.created_at).toLocaleString("sv-SE", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
