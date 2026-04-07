# Marmorskivan — AI-driven bänkskivekalkylator & visualiseringsplattform

En produktionsklar demo som visar hur en modern naturstenshandlare kan sälja och konvertera digitalt. Byggd med Vite + React (frontend) och Express.js + PostgreSQL (backend).

## Funktioner

### Kalkylator
- Stöd för alla köksformer: Straight, L, U, Island och kombinationer
- Realtidsprisberäkning baserat på yta, form, kantbehandling och öppningar
- Materialkatalog med 1200+ stensorter inkl. bilder och priser
- Offertformulär med e-postbekräftelse och .ics-bokning

### AI-visualisering (KitchenVisualizer)
- Ladda upp eget köksfoto
- Markera bänkytan med flood fill-verktyg (klick) eller sudda med pensel
- gpt-image-1 inpainting: AI fyller exakt den markerade ytan med valt stenmaterial
- Client-side compositing: garanterar att inget utanför markeringen ändras
- Fallback: generera ny köksbild med DALL·E 3 om inget foto laddas upp

### Chattwidget
- AI-driven chatt med OpenAI (GPT-4o)
- Knowledge base keyword-match körs före OpenAI (snabbare + billigare)
- Handover till mänsklig agent — agenten tar över direkt i admin-panelen
- Kontaktformulär + bokningsmodal inbyggt i chatten
- Typing-indikator, geo-info, session-taggning

### Admin-panel (`/admin`)
- **Dashboard**: KPI-kort, konverteringstratt, dagliga chattar, toppfrågor
- **Chattar**: Live-sessioner, handover, snabbsvar, kunskapsbas-sökning, anteckningar
- **Analytics**: Sidvisningar, unika sessioner, geo (land + stad med flaggor), peak hour, AI-insikter
- **Kontakter**: Alla inlämnade kontaktförfrågningar
- **Rapporter**: CSV-export av analytics, chattar, kontakter
- **Kunskapsbas**: Hantera FAQ som AI:n använder som kontext
- **Inställningar**: Alla site-inställningar utan rebuild (accent, texter, avatar-URL:er m.m.)

### Analytics (full täckning)
Alla interaktioner loggas:
`page_view`, `cta_click`, `calculator_open`, `material_selected`, `kitchen_render`, `chat_open`, `chat_message`, `contact_form_open`, `contact_form_submit`, `booking_open`, `offert_open`, `offert_submit_*`

## Stack

| Del | Teknik |
|---|---|
| Frontend | Vite + React 18, Tailwind CSS, React Router |
| Backend | Express.js, PostgreSQL (Railway) |
| AI | OpenAI gpt-image-1 (inpaint), GPT-4o (chatt), DALL·E 3 |
| Deploy | FTP → Loopia (frontend) + Railway auto-deploy (backend) |
| Email | Nodemailer SMTP (.ics, bekräftelser, alerts) |

## Kör lokalt

```bash
npm install
npm run dev
```

Backend (separat terminal):
```bash
cd api-dev
npm install
node server.mjs
```

Sätt `VITE_CHAT_API_BASE=http://localhost:3001` i `.env`.

## Bygg & deploya

```bash
# Snabb kompilkontroll (~15s)
npm run build:justvite

# Full build inkl. prerender (~10 min)
npm run build
```

FTP via WinSCP: ta bort `assets/` på servern → Synchronize (Remote).

## Miljövariabler

### Frontend (`.env`)
```
VITE_CHAT_API_BASE=https://din-railway-url.up.railway.app
```

### Backend (Railway env vars)
```
DATABASE_URL        # sätts automatiskt av Railway PostgreSQL
OPENAI_API_KEY
ADMIN_TOKEN         # default: marmorskivan-admin
PORT                # sätts av Railway
SMTP_HOST
SMTP_PORT           # default: 587
SMTP_USER
SMTP_PASS
SMTP_SECURE         # "true" för port 465
COMPANY_EMAIL       # mottagare för alerts
```

## DB-schema

Tabeller: `chat_sessions`, `chat_messages`, `analytics_events`, `contacts`, `site_settings`, `canned_responses`, `knowledge_base`

Migrationer körs automatiskt vid serverstart.

## Hälsokontroll

```
GET /health → { ok: true, db: true/false }
```
