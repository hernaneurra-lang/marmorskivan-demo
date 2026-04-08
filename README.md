# Marmorskivan — AI-driven bänkskivekalkylator & visualiseringsplattform

En produktionsklar demo som visar hur en modern naturstenshandlare kan sälja och konvertera digitalt. Byggd med Vite + React (frontend) och Express.js + PostgreSQL (backend).

## Funktioner

### Kalkylator
- Stöd för alla köksformer: Straight, L, U, Island och kombinationer
- Realtidsprisberäkning baserat på yta, form, kantbehandling och öppningar
- Tillvalskatalog: diskhoar, kranar och hällar med bilder och priser
- Offertformulär med e-postbekräftelse och .ics-bokning

### AI-visualisering (KitchenVisualizer)
- Ladda upp eget köksfoto
- Markera bänkytan med flood fill (klick) eller sudda med pensel
- gpt-image-1 inpainting: AI fyller exakt den markerade ytan med valt stenmaterial
- Client-side compositing: garanterar att inget utanför markeringen ändras
- Fallback: generera ny köksbild med DALL·E 3

### Chattwidget
- AI-driven chatt med OpenAI GPT-4o
- Knowledge base keyword-match körs före OpenAI (snabbare + billigare)
- Handover till mänsklig agent direkt i admin-panelen
- Kontaktformulär + bokningsmodal inbyggt i chatten

### Admin-panel (`/admin`) — 9 vyer

| Vy | Innehåll |
|---|---|
| Dashboard | KPI-kort, konverteringstratt, dagliga chattar |
| Chattar | Live-sessioner, handover, snabbsvar, anteckningar |
| Kontakter | Inlämnade kontaktförfrågningar |
| Analytics | Geo, peak hour, tid på sida, AI-insikter, klickbara KPI-kort med drill-down |
| **Produkter** | SVG donut-grafer, top material, top diskho/kran/häll, konvertering % |
| Rapporter | CSV-export |
| Kunskapsbas | FAQ som AI:n använder |
| Bokningar | Inkomna bokningar |
| Inställningar | Runtime-inställningar utan rebuild |

### Analytics — full täckning

Konverteringstratt med 7 steg:
```
Sidvisningar → Kalkylator → Material valt → Pris sett → Offert öppnad → Offert skickad → Kontakt
```

Trackade events: `page_view`, `page_exit`, `cta_click`, `calculator_open`, `material_selected`, `price_viewed`, `accessory_selected`, `kitchen_render`, `offert_open`, `offert_submit_success`, `chat_open`, `chat_message`, `contact_form_open`, `contact_form_submit`, `booking_open`

Drill-down: varje KPI-kort är klickbart → modal med rådata (tid, land, stad, enhet, produkt m.m.)

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

## Build-kommandon

```bash
npm run build:justvite      # Snabb kompilkontroll (~15s)
npm run build:noprerender   # Build utan prerender (~2 min)
npm run build               # Full build inkl. prerender + sitemap (~10 min)
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

Migrationer körs automatiskt vid serverstart (`migrate()` i `db.mjs`).

## Hälsokontroll

```
GET /health → { ok: true, db: true/false }
```
