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
    if (!origin) return cb(null, true); // curl / server-to-server
    const ok = ALLOWED_ORIGINS.some((o) => typeof o === "string" ? o === origin : o.test(origin));
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "OPTIONS"],
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

// ── Analytics ──
app.post("/api/analytics", async (req, res) => {
  try {
    const { event, session, page, ts, ...rest } = req.body || {};
    console.log(`[analytics] ${event} | ${page} | session=${session} | ts=${ts}`);
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
  try {
    const { rows } = await query(`
      SELECT
        s.id,
        s.page,
        s.ip,
        s.created_at,
        s.last_message_at,
        COUNT(m.id) AS message_count,
        (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id) AS has_contact
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      GROUP BY s.id
      ORDER BY s.last_message_at DESC
      LIMIT 100
    `);
    res.json({ sessions: rows });
  } catch (e) {
    console.error("[admin] sessions:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: get messages for a session ──
app.get("/api/admin/sessions/:id/messages", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ messages: [], contact: null });
  try {
    const { rows: messages } = await query(
      `SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    const { rows: contacts } = await query(
      `SELECT name, phone, email, message, created_at FROM contacts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.params.id]
    );
    res.json({ messages, contact: contacts[0] || null });
  } catch (e) {
    console.error("[admin] messages:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: send agent reply in a session ──
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

// ── Admin: analytics summary ──
app.get("/api/admin/analytics", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ summary: {} });
  try {
    const [pageViews, topPages, topEvents, dailyChats, popularQuestions] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'page_view'`),
      query(`
        SELECT page, COUNT(*) AS views
        FROM analytics_events WHERE event = 'page_view' AND page IS NOT NULL
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      query(`
        SELECT event, COUNT(*) AS count
        FROM analytics_events
        GROUP BY event ORDER BY count DESC LIMIT 15
      `),
      query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS sessions
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY day ORDER BY day DESC
      `),
      query(`
        SELECT content, COUNT(*) AS count
        FROM chat_messages WHERE role = 'user'
        GROUP BY content ORDER BY count DESC LIMIT 10
      `),
    ]);

    res.json({
      totalPageViews: pageViews.rows[0]?.total || 0,
      topPages: topPages.rows,
      topEvents: topEvents.rows,
      dailyChats: dailyChats.rows,
      popularQuestions: popularQuestions.rows,
    });
  } catch (e) {
    console.error("[admin] analytics:", e.message);
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
