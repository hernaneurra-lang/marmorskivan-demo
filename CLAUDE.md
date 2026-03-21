# marmorskivan-demo — Claude Guide

## Stack
- **Frontend**: Vite + React SPA → FTP deploy till Loopia (statisk)
- **Backend**: Express.js + PostgreSQL → Railway (auto-deploy från GitHub `main`)
- **Build**: `npm run build` (Vite + prerender ~10 min) | `npm run build:justvite` (bara Vite, ~15s, för snabb kompilkontroll)

## Deploy
1. `npm run build` → genererar `dist/`
2. FTP via **WinSCP**: ta bort `assets/` på servern först, sedan Synchronize (Remote) — laddar bara upp ändrade filer
3. PHP-filer (`api/`, `boka-tid/`, `PHPMailer/`, `includes/`, `storage/`, `vendor/`) ska **aldrig** raderas — de ligger på samma Loopia-server

## Railway — backend
- Backend körs på Railway, auto-deploy från `main`
- **Kräver** env var `DATABASE_URL` (PostgreSQL) — utan den sparas ingenting (`db: false`)
- Lägg till PostgreSQL-databas i Railway-projektet → `DATABASE_URL` sätts automatiskt
- Env vars: `ADMIN_TOKEN` (default: `marmorskivan-admin`), `OPENAI_API_KEY`, `PORT`
- Email env vars (optional): `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` (`"true"` for port 465), `COMPANY_EMAIL` (recipient for alerts)
- Email features: booking confirmation + .ics to customer, booking notification to company, first-message chat alert to company
- Health check: `GET /health` → `{ ok: true, db: true/false }`

## Settings (ingen rebuild krävs)
Alla inställningar hämtas via `/api/settings` vid runtime. Ändringar i admin-panelen slår igenom direkt utan ny build.

Nyckel-inställningar:
- `accent_color` — accentfärg (knappar, CTA)
- `nav_cta_text` — text på CTA-knapp i navbar
- `company`, `tagline`, `phone`, `email`, `address`, `hours` — visas i SiteFooter
- `chat_bot_avatar_url` — bild-URL för bot-avatar (åsidosätter emoji)
- `agent_avatar_url` — bild-URL för agentens profilbild (åsidosätter emoji)
- `chat_online` — `"true"/"false"` styr om chattwidgeten visas

## Admin-panel (`/admin`)
Sju vyer: Dashboard, Chattar, Kontakter, Analytics, Rapporter, Kunskapsbas, Inställningar.

### Chat-system (SessionsView)
- **Handover**: Knapp "🤝 Ta över" → sätter session till `mode=agent` → AI slutar svara → agent chattar direkt med kunden
- **Typing-indikator**: Rörliga prickar visas när kunden skriver (poll var 2s)
- **Tags**: 6 preset-taggar per session (Lead, Hög prio, Följ upp, Offert, Reklamation, Nöjd kund)
- **⚡ Snabbsvar**: Canned responses — klicka för att klistra in
- **📚 Kunskapsbas**: Sökbar FAQ-panel i reply-boxen — klicka för att klistra in svar
- **Geo-info**: Stad + land visas i session-headern (från IP-lookup)
- **Anteckningar**: Interna notes per session (syns ej för kunden)
- **Status/prio**: Öppen/Avslutad + Normal/Hög/Brådskande

### Analytics (AnalyticsView)
- KPI-kort: Sidvisningar, Unika sessioner, Chattsessioner, Kalkylator, Offerter, Kontakter, **Handover till agent**
- Konverteringstratt (funnel)
- Chattsessioner per dag (CSS bar chart)
- **Geo-analytics**: Besökare per land (med flaggor) + populäraste städer
- Händelsetyper + vanligaste frågor

### AI-chatt (server-logik)
1. **Knowledge base keyword-match** körs FÖRE OpenAI — om ≥2 nyckelord matchar returneras KB-svar direkt (snabbare + billigare)
2. **KB-kontext** injiceras alltid i OpenAI system prompt (max 30 aktiva poster)
3. **Agent mode-check**: Om session är `mode=agent` → AI svarar INTE — agenten svarar manuellt

## Knappdesign (kalkylator)
- **Aktiv**: `bg-emerald-600 border-emerald-600 text-white shadow-md`
- **Inaktiv**: `bg-white border-gray-300 text-gray-900 hover:border-emerald-400`
- Alltid explicit `text-gray-900` — inga knappar utan textfärg

## Admin-tema
- Dark/Light toggle (☀️/🌙) längst ner i sidomenyn — sparas i `localStorage`
- CSS-variabler: `[data-theme="dark"]` och `[data-theme="light"]` i `admin.css`
- Toast-notifikationer via `ToastContext` i `AdminPage.jsx` — `useToast()` i valfri vy

## ChatWidget (`src/chat/ChatWidget.jsx`)
- `AvatarEl`-komponent: renderar `<img>` om URL finns, annars emoji
- Mode-polling var 5s: när `mode=agent` → heading ändras, placeholder ändras, AI-svar stoppas
- Typing-events skickas vid input (`POST /api/chat/typing`, debounce 3s)
- Handover-meddelande visas automatiskt för kunden vid mode-byte

## Geo-analytics
- Lookup via `http://ip-api.com/json/{ip}` (gratis, ej HTTPS, ej street-level)
- Returnerar: land, landkod, stad, region, postnummer, lat/lon
- Cachas i minnet 1h per IP
- Lagras i `chat_sessions`: `country`, `country_code`, `city`, `region`
- Visas i AnalyticsView med landflaggor (flagcdn.com)

## DB-schema (PostgreSQL via Railway)
Tabeller: `chat_sessions`, `chat_messages`, `analytics_events`, `contacts`, `site_settings`, `canned_responses`, `knowledge_base`

Nya kolumner (2025-03):
- `chat_sessions`: `mode TEXT DEFAULT 'bot'`, `country`, `country_code`, `city`, `region`, `tags TEXT DEFAULT '[]'`
- `analytics_events`: `country`, `city`

Migrationer körs automatiskt vid serverstart (`migrate()` i `db.mjs`).

## Viktigt
- **recharts är borttaget** — inkompatibelt med Vite manual chunk splitting. Använd CSS bar charts (klasser: `.bar-chart`, `.bar-col`, `.bar-col-bar` i `admin.css`)
- **ip-api.com** använder HTTP (ej HTTPS) — ok för server-side anrop, ej för klienten
- **Street-level geo från IP är omöjligt** — ISP:er äger IP-block, inte adresser
- `VITE_CHAT_API_BASE` i `.env` pekar på Railway-URL för lokal utveckling
