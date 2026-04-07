// src/admin/SettingsView.jsx — Full site settings: hero, colors, branding, pages, chat widget
import { useState, useEffect, useCallback, useRef } from "react";

const LOGO_SIZES = [
  { value: "small",  label: "Liten (100px)" },
  { value: "normal", label: "Normal (140px)" },
  { value: "large",  label: "Stor (200px)" },
];

const BOT_AVATARS   = ["🪨", "💎", "🏠", "🛠️", "✨", "🟢", "🤖", "👷"];
const AGENT_AVATARS = ["🧑‍💼", "👨‍💼", "👩‍💼", "🙋", "🙋‍♂️", "🙋‍♀️", "💁", "🤝"];

function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 48, height: 40, border: "none", borderRadius: 6, cursor: "pointer", padding: 2 }}
        />
        <input
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 120, marginBottom: 0 }}
          placeholder="#059669"
        />
        <div style={{ width: 40, height: 40, borderRadius: 8, background: value, border: "1px solid var(--border)" }} />
      </div>
    </div>
  );
}

function RangeField({ label, value, onChange, min = 0, max = 100, unit = "%" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label} — <span style={{ color: "var(--text)" }}>{value}{unit}</span></Label>
      <input
        type="range"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", accentColor: "var(--green)" }}
      />
    </div>
  );
}

function TextField({ label, value, onChange, multiline, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          className="reply-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginBottom: 0 }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function ToggleField({ label, checked, onChange, description }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: 44, height: 24, borderRadius: 12,
            background: checked ? "var(--green)" : "var(--border)",
            position: "relative", cursor: "pointer", flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 10,
            background: "white",
            position: "absolute", top: 2,
            left: checked ? 22 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          {description && <div style={{ fontSize: 11, color: "var(--muted)" }}>{description}</div>}
        </div>
      </label>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ImageUpload({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--green)" : "var(--border)"}`,
          borderRadius: 10,
          padding: "18px 14px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(5,150,105,0.06)" : "var(--surface2)",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Bild vald ✓</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Klicka eller dra för att byta</div>
              <button
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                style={{ marginTop: 4, fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                ✕ Ta bort bild
              </button>
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
            <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>Klicka eller dra & släpp en bild</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>JPG, PNG, GIF, WebP — sparas som base64</div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

function AgentsList({ settings, setSettings }) {
  const raw = settings.agents_list || "[]";
  let agents = [];
  try { agents = JSON.parse(raw); } catch {}

  const save = (list) =>
    setSettings((s) => ({ ...s, agents_list: JSON.stringify(list) }));

  const addAgent = () =>
    save([...agents, { id: Date.now().toString(), name: "", avatar_url: "", emoji: "👤" }]);

  const update = (id, patch) =>
    save(agents.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id) => save(agents.filter((a) => a.id !== id));

  return (
    <div>
      {agents.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
          Inga agenter tillagda ännu. Lägg till en agent nedan.
        </div>
      )}
      {agents.map((agent) => (
        <div key={agent.id} style={{
          border: "1px solid var(--border)", borderRadius: 10, padding: 14,
          marginBottom: 12, background: "var(--surface2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            {agent.avatar_url
              ? <img src={agent.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
              : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{agent.emoji || "👤"}</div>
            }
            <input
              className="admin-input"
              value={agent.name}
              onChange={(e) => update(agent.id, { name: e.target.value })}
              placeholder="Agentens namn (visas för kunden)"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button
              onClick={() => remove(agent.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: 16, padding: "0 4px", flexShrink: 0 }}
              title="Ta bort agent"
            >✕</button>
          </div>
          <ImageUpload
            label="Profilbild"
            value={agent.avatar_url || ""}
            onChange={(url) => update(agent.id, { avatar_url: url })}
          />
        </div>
      ))}
      <button
        onClick={addAgent}
        style={{
          width: "100%", padding: "10px 0", borderRadius: 8, border: "2px dashed var(--border)",
          background: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, fontWeight: 600,
        }}
      >
        + Lägg till agent
      </button>
      <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--surface)", borderRadius: 8, fontSize: 12, color: "var(--muted)", border: "1px solid var(--border)" }}>
        Välj agent när du tar över en chatt i Chattar-vyn. Kunden ser agentens namn och bild i realtid.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">{title}</div>
      {children}
    </div>
  );
}

export default function SettingsView({ headers, apiBase }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/admin/settings`, { headers });
    const data = await res.json();
    setSettings(data);
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));
  const setBool = (key) => (bool) => setSettings((s) => ({ ...s, [key]: bool ? "true" : "false" }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${apiBase}/api/admin/settings`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div style={{ padding: 24, color: "var(--muted)" }}>Laddar…</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1>⚙️ Sidinställningar</h1>
        <button
          className="btn-send"
          onClick={save}
          disabled={saving}
          style={{ minWidth: 140 }}
        >
          {saving ? "Sparar…" : saved ? "✓ Sparat!" : "Spara ändringar"}
        </button>
      </div>

      <div className="admin-content">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>

          {/* Chat widget */}
          <Section title="💬 Chattwidget">
            <ToggleField
              label="Chatten är online"
              checked={settings.chat_online !== "false"}
              onChange={setBool("chat_online")}
              description="Stäng av för att dölja chattwidgeten på siten"
            />
            <TextField
              label="Hälsningsmeddelande"
              value={settings.chat_greeting || ""}
              onChange={set("chat_greeting")}
              placeholder="Hej! Hur kan jag hjälpa dig med din bänkskiva?"
            />
            <TextField
              label="Bot-namn"
              value={settings.chat_bot_name || ""}
              onChange={set("chat_bot_name")}
              placeholder="Marmorskivan AI"
            />
            <div style={{ marginBottom: 16 }}>
              <Label>Bot-avatar (emoji)</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BOT_AVATARS.map((em) => (
                  <button
                    key={em}
                    onClick={() => set("chat_bot_avatar")(em)}
                    style={{
                      width: 40, height: 40, fontSize: 22, borderRadius: 8,
                      border: `2px solid ${settings.chat_bot_avatar === em ? "var(--green)" : "var(--border)"}`,
                      background: settings.chat_bot_avatar === em ? "rgba(5,150,105,0.1)" : "var(--surface2)",
                      cursor: "pointer",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <ImageUpload
              label="Bot-avatar bild (åsidosätter emoji)"
              value={settings.chat_bot_avatar_url || ""}
              onChange={set("chat_bot_avatar_url")}
            />
          </Section>

          {/* Agent profiles */}
          <Section title="🧑‍💼 Agenter (Human-support)">
            <AgentsList settings={settings} setSettings={setSettings} />
          </Section>

          {/* Hero content */}
          <Section title="🏠 Hero-sektion">
            <TextField label="Rubrik" value={settings.hero_title || ""} onChange={set("hero_title")} placeholder="Måttbeställ din bänkskiva online" />
            <TextField label="Undertext" value={settings.hero_subtitle || ""} onChange={set("hero_subtitle")} multiline placeholder="Välj material, ange mått…" />
            <TextField label="CTA-knapptext" value={settings.hero_cta || ""} onChange={set("hero_cta")} placeholder="Beräkna & begär offert" />
            <div style={{ marginBottom: 16 }}>
              <Label>Deal-banner</Label>
              <ToggleField
                label="Visa deal-banner"
                checked={settings.deal_visible === "true"}
                onChange={setBool("deal_visible")}
              />
              <input
                className="admin-input"
                value={settings.deal_text || ""}
                onChange={(e) => set("deal_text")(e.target.value)}
                style={{ marginBottom: 0 }}
                placeholder="Veckans deal: …"
              />
            </div>
          </Section>

          {/* Navbar & CTA */}
          <Section title="🔗 Navigation & SEO">
            <TextField label="Navbar CTA-text" value={settings.nav_cta_text || ""} onChange={set("nav_cta_text")} placeholder="Begär offert" />
            <TextField label="SEO-titel (prefix)" value={settings.seo_title || ""} onChange={set("seo_title")} placeholder="Marmorskivan" />
            <TextField label="Meta-beskrivning" value={settings.seo_description || ""} onChange={set("seo_description")} multiline placeholder="Måttbeställ bänkskivor av marmor, granit och kvartskomposit…" />
          </Section>

          {/* Contact info */}
          <Section title="📞 Kontaktuppgifter">
            <TextField label="Telefon" value={settings.contact_phone || ""} onChange={set("contact_phone")} placeholder="+46 8 123 45 67" />
            <TextField label="E-post" value={settings.contact_email || ""} onChange={set("contact_email")} placeholder="info@marmorskivan.se" />
            <TextField label="Adress" value={settings.contact_address || ""} onChange={set("contact_address")} placeholder="Storgatan 1, Stockholm" />
            <TextField label="Öppettider" value={settings.contact_hours || ""} onChange={set("contact_hours")} placeholder="Mån–Fre 8–17" />
          </Section>

          {/* Footer */}
          <Section title="🦶 Footer">
            <TextField label="Företagsnamn" value={settings.footer_company || ""} onChange={set("footer_company")} placeholder="marmorskivan.se" />
            <TextField label="Tagline" value={settings.footer_tagline || ""} onChange={set("footer_tagline")} placeholder="Sveriges smidigaste väg till din nya bänkskiva" />
            <TextField label="Org.nummer" value={settings.footer_orgnr || ""} onChange={set("footer_orgnr")} placeholder="556xxx-xxxx" />
          </Section>

          {/* Calculator */}
          <Section title="🧮 Kalkylator-sida">
            <TextField label="Sidtitel" value={settings.calc_title || ""} onChange={set("calc_title")} placeholder="Beräkna din bänkskiva" />
            <TextField label="Undertitel" value={settings.calc_subtitle || ""} onChange={set("calc_subtitle")} multiline placeholder="Ange dina mått och välj material…" />
            <TextField label="Offert-bekräftelse" value={settings.calc_confirm || ""} onChange={set("calc_confirm")} multiline placeholder="Tack! Vi återkommer inom 24 timmar." />
          </Section>

          {/* Features */}
          <Section title="🗂️ Funktioner">
            <ToggleField
              label="2D-ritningsmodul (/ritning)"
              checked={settings.sketch_enabled === "true"}
              onChange={setBool("sketch_enabled")}
              description="Visar knappen 'Visa 2D-ritning' i kalkylatorn — öppnar en utskrivbar teknisk skiss"
            />
          </Section>

          {/* Colors & Aesthetics */}
          <Section title="🎨 Färger & Estetik">
            <ColorPicker label="Accentfärg (knappar, länkar)" value={settings.accent_color || "#059669"} onChange={set("accent_color")} />
            <ColorPicker label="Rubrikfärg" value={settings.heading_color || "#111827"} onChange={set("heading_color")} />
            <ColorPicker label="Brödtextfärg" value={settings.body_color || "#374151"} onChange={set("body_color")} />
            <RangeField label="Hero-ljusstyrka" value={settings.hero_brightness || "100"} onChange={set("hero_brightness")} min={30} max={120} />
          </Section>

          {/* Logo */}
          <Section title="🪨 Logotyp & Varumärke">
            <div style={{ marginBottom: 20 }}>
              <Label>Logotyp-storlek</Label>
              <div style={{ display: "flex", gap: 8 }}>
                {LOGO_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => set("logo_size")(s.value)}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid",
                      borderColor: settings.logo_size === s.value ? "var(--green)" : "var(--border)",
                      background: settings.logo_size === s.value ? "rgba(5,150,105,0.1)" : "var(--surface2)",
                      color: settings.logo_size === s.value ? "var(--green)" : "var(--muted)",
                      cursor: "pointer", fontSize: 13,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div style={{ marginTop: 16, padding: 20, background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>FÖRHANDSGRANSKNING</div>
              <div style={{
                background: settings.accent_color, color: "white",
                borderRadius: 8, padding: "10px 20px", display: "inline-block",
                fontWeight: 600, fontSize: 14,
              }}>
                {settings.hero_cta || "Beräkna & begär offert"}
              </div>
              <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: settings.heading_color }}>
                {settings.hero_title || "Rubrik"}
              </div>
              <div style={{ fontSize: 13, color: settings.body_color, marginTop: 4 }}>
                {settings.hero_subtitle || "Undertext"}
              </div>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>
          ℹ️ Ändringar sparas direkt och syns omedelbart för alla besökare som laddar sidan — inget bygge eller uppladdning krävs.
        </div>
      </div>
    </>
  );
}
