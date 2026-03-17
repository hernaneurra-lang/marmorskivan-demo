// api-dev/server.mjs — Marmorskivan API server (Railway-ready)
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import { fileURLToPath } from "url";
import path from "path";
import { query, migrate } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "marmorskivan-admin";
const HAS_DB = Boolean(process.env.DATABASE_URL);

// ── CORS — allow marmorskivan.se + localhost dev ──
const ALLOWED_ORIGINS = [
  "https://marmorskivan.se",
  "https://www.marmorskivan.se",
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

const app = express();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = ALLOWED_ORIGINS.some((o) => typeof o === "string" ? o === origin : o.test(origin));
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "16kb" }));

// ── Simple in-memory rate limiter (per IP, per minute) ──
const rateLimits = new Map();
function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${ip}`;
    const entry = rateLimits.get(key) || { count: 0, reset: now + 60_000 };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
    entry.count++;
    rateLimits.set(key, entry);
    if (entry.count > maxPerMin) return res.status(429).json({ error: "too_many_requests" });
    next();
  };
}

// ── Admin auth middleware ──
function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });
  next();
}

// ── Period helper ──
function periodInterval(period) {
  switch (period) {
    case "24h": return "24 hours";
    case "7d":  return "7 days";
    case "90d": return "90 days";
    default:    return "30 days";
  }
}

let openai = null;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

const SYSTEM_PROMPT = `Du är en hjälpsam kundtjänstassistent för marmorskivan.se — en svensk e-handel för steniga bänkskivor (marmor, granit, kvartskomposit, kalksten, travertin, terrazzo, onyx m.m.).

Svara alltid på svenska. Var kort och konkret — max 3-4 meningar per svar om inget annat krävs.

Du kan hjälpa kunder med:
- Material: egenskaper, underhåll, lämplighet för kök/badrum
- Priser: bänkskivor kostar vanligtvis 1 500–6 000 kr/m² beroende på material
- Mätning: vi erbjuder professionell mätning på plats i Storstockholm
- Leverans: 2–6 veckors ledtid beroende på material och montering
- Offert: hänvisa till vår kalkylator på /app eller att de lämnar kontaktuppgifter

Om du inte vet svaret, hänvisa kunden till att ringa eller lämna sina kontaktuppgifter.`;

// ── DB helpers ──
async function ensureSession(sessionId, page, ip) {
  if (!HAS_DB || !sessionId) return;
  try {
    await query(
      `INSERT INTO chat_sessions (id, page, ip) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET last_message_at = NOW()`,
      [sessionId, page || null, ip || null]
    );
  } catch (e) {
    console.error("[db] ensureSession:", e.message);
  }
}

async function saveMessage(sessionId, role, content) {
  if (!HAS_DB || !sessionId) return;
  try {
    await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)`,
      [sessionId, role, content]
    );
  } catch (e) {
    console.error("[db] saveMessage:", e.message);
  }
}

// ── Health check (Railway uses this) ──
app.get("/health", (_req, res) => res.json({ ok: true, db: HAS_DB }));

// ── Chat ──
app.post("/api/chat", rateLimit(20), async (req, res) => {
  const { message, history = [], sessionId, page } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: "message required" });
  if (message.length > 1000) return res.status(400).json({ error: "message too long" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  await ensureSession(sessionId, page, ip);
  await saveMessage(sessionId, "user", message);

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-8).map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) })),
        { role: "user", content: message },
      ],
    });
    const reply = completion.choices[0]?.message?.content?.trim() || "Tyvärr kan jag inte svara just nu.";
    await saveMessage(sessionId, "assistant", reply);
    res.json({ reply });
  } catch (e) {
    console.error("OpenAI error:", e?.message);
    res.status(500).json({ error: "ai_error" });
  }
});

// ── Contact form ──
app.post("/api/contact", rateLimit(5), async (req, res) => {
  const { name, phone, email, message, sessionId } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "name and phone required" });

  console.log(`[contact] ${name} | ${phone} | ${email || "-"} | ${message || "-"}`);

  if (HAS_DB) {
    try {
      await query(
        `INSERT INTO contacts (session_id, name, phone, email, message) VALUES ($1, $2, $3, $4, $5)`,
        [sessionId || null, name, phone, email || null, message || null]
      );
    } catch (e) {
      console.error("[db] contact:", e.message);
    }
  }

  res.json({ ok: true });
});

// ── Public: site settings ──
app.get("/api/settings", async (_req, res) => {
  if (!HAS_DB) return res.json({});
  try {
    const { rows } = await query(`SELECT key, value FROM site_settings`);
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(settings);
  } catch (e) {
    res.json({});
  }
});

// ── Analytics ──
app.post("/api/analytics", async (req, res) => {
  try {
    const { event, session, page, ts, ...rest } = req.body || {};
    if (HAS_DB && event) {
      await query(
        `INSERT INTO analytics_events (event, session_id, page, data) VALUES ($1, $2, $3, $4)`,
        [event, session || null, page || null, JSON.stringify({ ts, ...rest })]
      );
    }
  } catch {}
  res.json({ ok: true });
});

// ══════════════════════════════════════════
//  ADMIN API
// ══════════════════════════════════════════

// ── Admin: verify token ──
app.post("/api/admin/login", (req, res) => {
  const { token } = req.body || {};
  if (token === ADMIN_TOKEN) return res.json({ ok: true });
  res.status(401).json({ error: "unauthorized" });
});

// ── Admin: list chat sessions ──
app.get("/api/admin/sessions", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ sessions: [] });
  const { filter, search } = req.query;
  try {
    let where = "1=1";
    const params = [];
    if (filter === "leads") { where += ` AND EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id)`; }
    if (filter === "open")  { where += ` AND s.status = 'open'`; }
    if (filter === "resolved") { where += ` AND s.status = 'resolved'`; }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (s.id ILIKE $${params.length} OR s.page ILIKE $${params.length} OR s.note ILIKE $${params.length})`;
    }
    const { rows } = await query(`
      SELECT
        s.id,
        s.page,
        s.ip,
        s.status,
        s.priority,
        s.note,
        s.created_at,
        s.last_message_at,
        COUNT(m.id) AS message_count,
        (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id) AS has_contact
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      WHERE ${where}
      GROUP BY s.id
      ORDER BY s.last_message_at DESC
      LIMIT 200
    `, params);
    res.json({ sessions: rows });
  } catch (e) {
    console.error("[admin] sessions:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: get messages for a session ──
app.get("/api/admin/sessions/:id/messages", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ messages: [], contact: null, session: null });
  try {
    const { rows: messages } = await query(
      `SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    const { rows: contacts } = await query(
      `SELECT name, phone, email, message, created_at FROM contacts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.params.id]
    );
    const { rows: sessions } = await query(
      `SELECT id, page, ip, status, priority, note, created_at FROM chat_sessions WHERE id = $1`,
      [req.params.id]
    );
    res.json({ messages, contact: contacts[0] || null, session: sessions[0] || null });
  } catch (e) {
    console.error("[admin] messages:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: send agent reply ──
app.post("/api/admin/sessions/:id/reply", adminAuth, async (req, res) => {
  const { content } = req.body || {};
  if (!content?.trim()) return res.status(400).json({ error: "content required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'agent', $2)`,
      [req.params.id, content.trim()]
    );
    await query(`UPDATE chat_sessions SET last_message_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("[admin] reply:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: update session status/priority/note ──
app.patch("/api/admin/sessions/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { status, priority, note } = req.body || {};
  const sets = [];
  const params = [];
  if (status   !== undefined) { params.push(status);   sets.push(`status = $${params.length}`); }
  if (priority !== undefined) { params.push(priority); sets.push(`priority = $${params.length}`); }
  if (note     !== undefined) { params.push(note);     sets.push(`note = $${params.length}`); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  try {
    await query(`UPDATE chat_sessions SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: contacts list ──
app.get("/api/admin/contacts", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ contacts: [] });
  try {
    const { rows } = await query(
      `SELECT id, session_id, name, phone, email, message, created_at FROM contacts ORDER BY created_at DESC LIMIT 200`
    );
    res.json({ contacts: rows });
  } catch (e) {
    console.error("[admin] contacts:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: realtime (active sessions last 5 min) ──
app.get("/api/admin/realtime", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ active: 0, recent_events: 0 });
  try {
    const [sessions, events] = await Promise.all([
      query(`SELECT COUNT(*) AS cnt FROM chat_sessions WHERE last_message_at > NOW() - INTERVAL '5 minutes'`),
      query(`SELECT COUNT(*) AS cnt FROM analytics_events WHERE created_at > NOW() - INTERVAL '5 minutes'`),
    ]);
    res.json({
      active_chats: Number(sessions.rows[0]?.cnt || 0),
      recent_events: Number(events.rows[0]?.cnt || 0),
    });
  } catch (e) {
    res.json({ active_chats: 0, recent_events: 0 });
  }
});

// ── Admin: analytics (with period + funnel) ──
app.get("/api/admin/analytics", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({});
  const interval = periodInterval(req.query.period);
  try {
    const [
      pageViews, uniqueSessions, chatSessions, contacts,
      calculatorOpens, offerSubmits,
      topPages, topEvents, dailyChats, popularQuestions,
    ] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(DISTINCT session_id) AS total FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}' AND session_id IS NOT NULL`),
      query(`SELECT COUNT(*) AS total FROM chat_sessions WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM contacts WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('calculator_open', 'app_open') AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('offer_submit', 'offer_request') AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`
        SELECT page, COUNT(*) AS views
        FROM analytics_events WHERE event = 'page_view' AND page IS NOT NULL AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      query(`
        SELECT event, COUNT(*) AS count
        FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY event ORDER BY count DESC LIMIT 15
      `),
      query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS sessions
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY day ORDER BY day DESC
      `),
      query(`
        SELECT content, COUNT(*) AS count
        FROM chat_messages WHERE role = 'user' AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY content ORDER BY count DESC LIMIT 10
      `),
    ]);

    const pv   = Number(pageViews.rows[0]?.total || 0);
    const calc = Number(calculatorOpens.rows[0]?.total || 0);
    const offer = Number(offerSubmits.rows[0]?.total || 0);
    const cont  = Number(contacts.rows[0]?.total || 0);
    const chats = Number(chatSessions.rows[0]?.total || 0);

    res.json({
      totalPageViews:    pv,
      uniqueSessions:    Number(uniqueSessions.rows[0]?.total || 0),
      chatSessions:      chats,
      totalContacts:     cont,
      calculatorOpens:   calc,
      offerSubmits:      offer,
      funnel: [
        { label: "Sidvisningar",          value: pv,    pct: 100 },
        { label: "Kalkylator öppnad",      value: calc,  pct: pv  ? Math.round(calc  / pv  * 100) : 0 },
        { label: "Offert begärd",          value: offer, pct: calc ? Math.round(offer / calc * 100) : 0 },
        { label: "Kontaktuppgifter lämnade", value: cont, pct: offer ? Math.round(cont / offer * 100) : 0 },
      ],
      topPages:          topPages.rows,
      topEvents:         topEvents.rows,
      dailyChats:        dailyChats.rows,
      popularQuestions:  popularQuestions.rows,
    });
  } catch (e) {
    console.error("[admin] analytics:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: get settings ──
app.get("/api/admin/settings", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({});
  try {
    const { rows } = await query(`SELECT key, value, updated_at FROM site_settings ORDER BY key`);
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: update settings ──
app.post("/api/admin/settings", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const updates = req.body || {};
  try {
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: canned responses ──
app.get("/api/admin/canned-responses", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ responses: [] });
  try {
    const { rows } = await query(`SELECT id, shortcut, content, created_at FROM canned_responses ORDER BY shortcut`);
    res.json({ responses: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/canned-responses", adminAuth, async (req, res) => {
  const { shortcut, content } = req.body || {};
  if (!shortcut?.trim() || !content?.trim()) return res.status(400).json({ error: "shortcut and content required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    const { rows } = await query(
      `INSERT INTO canned_responses (shortcut, content) VALUES ($1, $2) RETURNING id`,
      [shortcut.trim(), content.trim()]
    );
    res.json({ ok: true, id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/canned-responses/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(`DELETE FROM canned_responses WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: knowledge base ──
app.get("/api/admin/knowledge-base", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ items: [] });
  try {
    const { rows } = await query(`SELECT id, question, answer, active, created_at FROM knowledge_base ORDER BY created_at DESC`);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/knowledge-base", adminAuth, async (req, res) => {
  const { question, answer } = req.body || {};
  if (!question?.trim() || !answer?.trim()) return res.status(400).json({ error: "question and answer required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    const { rows } = await query(
      `INSERT INTO knowledge_base (question, answer) VALUES ($1, $2) RETURNING id`,
      [question.trim(), answer.trim()]
    );
    res.json({ ok: true, id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/admin/knowledge-base/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { question, answer, active } = req.body || {};
  const sets = [];
  const params = [];
  if (question !== undefined) { params.push(question); sets.push(`question = $${params.length}`); }
  if (answer   !== undefined) { params.push(answer);   sets.push(`answer = $${params.length}`); }
  if (active   !== undefined) { params.push(active);   sets.push(`active = $${params.length}`); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  try {
    await query(`UPDATE knowledge_base SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/knowledge-base/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(`DELETE FROM knowledge_base WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: CSV exports ──
app.get("/api/admin/export/:type", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.status(503).json({ error: "no_db" });
  const period = req.query.period || "30d";
  const interval = periodInterval(period);
  const type = req.params.type;

  try {
    let rows, headers, filename;

    if (type === "contacts") {
      ({ rows } = await query(`
        SELECT id, name, phone, email, message, session_id, created_at
        FROM contacts WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC
      `));
      headers = ["id", "name", "phone", "email", "message", "session_id", "created_at"];
      filename = `kontakter_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else if (type === "sessions") {
      ({ rows } = await query(`
        SELECT s.id, s.page, s.ip, s.status, s.priority,
               COUNT(m.id) AS messages,
               EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id) AS has_contact,
               s.created_at, s.last_message_at
        FROM chat_sessions s
        LEFT JOIN chat_messages m ON m.session_id = s.id
        WHERE s.created_at > NOW() - INTERVAL '${interval}'
        GROUP BY s.id ORDER BY s.created_at DESC
      `));
      headers = ["id", "page", "ip", "status", "priority", "messages", "has_contact", "created_at", "last_message_at"];
      filename = `chattar_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else if (type === "events") {
      ({ rows } = await query(`
        SELECT id, event, session_id, page, data, created_at
        FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 10000
      `));
      headers = ["id", "event", "session_id", "page", "data", "created_at"];
      filename = `events_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else {
      return res.status(400).json({ error: "unknown export type" });
    }

    const escape = (v) => {
      if (v == null) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  } catch (e) {
    console.error("[admin] export:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Start ──
async function start() {
  if (HAS_DB) {
    try { await migrate(); } catch (e) { console.error("[db] migrate failed:", e.message); }
  } else {
    console.warn("⚠️  No DATABASE_URL — running without persistence");
  }
  app.listen(PORT, () => console.log(`✅ API server on port ${PORT}`));
}

start();
