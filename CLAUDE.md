# marmorskivan-demo — Claude Guide

## Stack
- **Frontend**: Vite + React SPA → FTP deploy till Loopia (statisk)
- **Backend**: Express.js + PostgreSQL → Railway (auto-deploy från GitHub `main`)
- **Build**: `npm run build` (Vite + prerender ~10 min) | `npm run build:noprerender` (~2 min) | `npm run build:justvite` (~15s, snabb kompilkontroll)

## Deploy
1. `npm run build:noprerender` → genererar `dist/`
2. FTP via **WinSCP**: ta bort `assets/` på servern, sedan Synchronize (Remote)
3. **OBS: Två index.html måste uppdateras** efter varje build:
   - `/app/index.html` ← ladda upp `dist/index.html` hit (tar prioritet framför root)
   - Finns även från gamla prerender-byggen som `dist/app/index.html` på servern
   - Enklast: ersätt `/app/index.html` på FTP manuellt med `dist/index.html` varje gång
4. PHP-filer (`api/`, `boka-tid/`, `PHPMailer/`, `includes/`, `storage/`, `vendor/`) ska **aldrig** raderas — de ligger på samma Loopia-server

## Railway — backend
- Backend körs på Railway, auto-deploy från `main` vid `git push`
- **Kräver** env var `DATABASE_URL` (PostgreSQL) — utan den sparas ingenting (`db: false`)
- Env vars: `ADMIN_TOKEN` (default: `marmorskivan-admin`), `OPENAI_API_KEY`, `PORT`
- Email env vars (optional): `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` (`"true"` for port 465), `COMPANY_EMAIL`
- Email features: booking confirmation + .ics to customer, notification to company, first-message chat alert
- Health check: `GET /health` → `{ ok: true, db: true/false }`

## Settings (ingen rebuild krävs)
Alla inställningar hämtas via `/api/settings` vid runtime. Ändringar i admin-panelen slår igenom direkt.

Nyckel-inställningar:
- `accent_color` — accentfärg (knappar, CTA)
- `nav_cta_text` — text på CTA-knapp i navbar
- `company`, `tagline`, `phone`, `email`, `address`, `hours` — visas i SiteFooter
- `chat_bot_avatar_url` — bild-URL för bot-avatar (åsidosätter emoji)
- `agent_avatar_url` — bild-URL för agentens profilbild
- `chat_online` — `"true"/"false"` styr om chattwidgeten visas

## Admin-panel (`/admin`) — 9 vyer
Dashboard, Chattar, Kontakter, Analytics, Produkter, Rapporter, Kunskapsbas, Bokningar, Inställningar.

### Chat-system (SessionsView)
- **Handover**: "🤝 Ta över" → `mode=agent` → AI slutar svara → agent chattar manuellt
- **Typing-indikator**: Rörliga prickar när kunden skriver (poll var 2s)
- **Tags**: 6 preset-taggar per session (Lead, Hög prio, Följ upp, Offert, Reklamation, Nöjd kund)
- **⚡ Snabbsvar**: Canned responses — klicka för att klistra in
- **📚 Kunskapsbas**: Sökbar FAQ-panel i reply-boxen
- **Geo-info**: Stad + land visas i session-headern
- **Anteckningar**: Interna notes per session (syns ej för kunden)
- **Status/prio**: Öppen/Avslutad + Normal/Hög/Brådskande

### Analytics (AnalyticsView)
- KPI-kort — **alla klickbara** → drill-down modal med upp till 200 rader rådata
- Konverteringstratt med 7 steg (se nedan)
- Geo: land + stad med flaggor
- All aktivitet per timme (Stockholm-tid), tid på sida per sida
- AI-insikter: besökarsegment, anomali, peak hour, chattengagemang

### Produkter & Konvertering (ProductsView)
- **SVG donut-ringar** per funnel-steg med % och antal
- Konverteringsnyckeltal: avhopp, kalkylator→material, pris sett→ej offert, offert→skickad (färgkodade rött/gult/grönt)
- Top 20 klickade material med drill-down
- Top diskhoar / kranar / hällar var för sig med drill-down
- Köksrenderingar med % av kalkylatorsessioner

### AI-chatt (server-logik)
1. **Knowledge base keyword-match** körs FÖRE OpenAI — om ≥2 nyckelord matchar returneras KB-svar direkt
2. **KB-kontext** injiceras alltid i OpenAI system prompt (max 30 aktiva poster)
3. **Agent mode-check**: Om `mode=agent` → AI svarar INTE

## Analytics-events (full täckning fr.o.m. 2026-04)

| Event | Trigger | Fil |
|---|---|---|
| `page_view` | Varje route-byte | Router.jsx |
| `page_exit` | Lämnar sida (tid + scroll) | analytics.js (auto) |
| `cta_click` | Landing-CTA | Landing.jsx |
| `calculator_open` | Kalkylatorn visas | App.jsx |
| `material_selected` | Material väljs (namn + pris) | App.jsx |
| `price_viewed` | Pris visas 3s utan att skickas (debounced) | CalculatorPage.jsx |
| `accessory_selected` | Diskho/kran/häll väljs från katalog | OpeningsSection.jsx |
| `kitchen_render` | AI-rendering körs (mode, material, shape) | KitchenVisualizer.jsx |
| `offert_open` | Offertformulär öppnas | SubmitBox.jsx |
| `offert_submit_success` | Offert skickad | SubmitBox.jsx |
| `chat_open` | Chattwidget öppnas | ChatWidget.jsx |
| `chat_message` | Meddelande skickat | ChatWidget.jsx |
| `contact_form_open` | Kontaktformulär öppnas | ChatWidget.jsx |
| `contact_form_submit` | Formulär skickat | ChatWidget.jsx |
| `booking_open` | Bokningsmodal öppnas | ChatWidget.jsx |

### Konverteringstratt (7 steg)
```
Sidvisningar → Kalkylator → Material valt → Pris sett → Offert öppnad → Offert skickad → Kontakt
```

### Drill-down API
`GET /api/admin/analytics/drilldown?kpi=<typ>&period=<period>`
KPI-typer: `pageviews`, `sessions`, `chats`, `calculator`, `offers`, `contacts`, `handover`, `renders`, `accessories_sink`, `accessories_faucet`, `accessories_hob`

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
- Mode-polling var 5s: när `mode=agent` → heading ändras, AI-svar stoppas
- Typing-events skickas vid input (`POST /api/chat/typing`, debounce 3s)

## KitchenVisualizer (`src/components/KitchenVisualizer.jsx`)
- Upload eget köksfoto → markera bänkyta med flood fill → AI inpainting med gpt-image-1
- **Fill-verktyg**: klicka på yta → BFS flood fill tolerans 38, dilate 2px + hole-fill
- **Erase-verktyg**: penselradering radius 20px via Pointer Events API
- **Compositing**: AI-bild skalas till originalets exakta dimensioner med `drawImage()` → pixels compositas per mask-koordinat (garanterar att inget utanför masken ändras)
- Canvas-storlek sätts i JSX `style`-prop (inte useEffect) — React nollställer annars CSS-värden

## Geo-analytics
- Lookup via `http://ip-api.com/json/{ip}` (gratis, ej HTTPS, server-side only)
- Cachas i minnet 1h per IP
- Lagras på varje `analytics_events`-rad: `country`, `city`
- Lagras på `chat_sessions`: `country`, `country_code`, `city`, `region`

## Materialdata — databas som källa (fr.o.m. 2026-04)

Frontend hämtar material från Railway-API:t i första hand, statisk CSV som fallback:
- `GET /api/materials` — publikt endpoint, returnerar alla produkter där `status != 'hidden'`
- `App.jsx` och `MaterialsSection.jsx` försöker API:t, faller tillbaka på `/data/materials.csv`
- **Lägg till / redigera material i admin → syns direkt på sidan utan ny build**
- Fältmappning: DB `edge_price` → frontend `edgePrice`, DB `base_name` → används av `computeBaseKey`

### StoreView — produktmodal (admin)
- `ProductField` är definierad **utanför** `ProductModal` — annars tappar fält fokus vid varje knapptryckning (React remount-bugg)
- Kategori-fält: `<select>` med presets + "Annan (skriv eget)…" som visar textfält
- Slug-fält: alltid synligt, auto-genereras som `{toSlug(name)}__{thickness_mm}`, redigerbart vid konflikt
- Slug måste vara unik i DB (`UNIQUE NOT NULL`) — felmeddelande visas på svenska vid kollision

## DB-schema (PostgreSQL via Railway)
Tabeller: `chat_sessions`, `chat_messages`, `analytics_events`, `contacts`, `site_settings`, `canned_responses`, `knowledge_base`, `products`, `catalog_accessories`

Migrationer körs automatiskt vid serverstart (`migrate()` i `db.mjs`).

## Viktigt
- **recharts är borttaget** — använd CSS bar charts (`.bar-chart`, `.bar-col`, `.bar-col-bar` i `admin.css`) eller SVG inline
- **ip-api.com** använder HTTP — ok server-side, aldrig klient-side
- **Canvas vs img**: `max-h-full` fungerar inte reliabelt på `<canvas>` — beräkna CSS-storlek explicit: `Math.min(innerWidth/w, (innerHeight-64)/h)`
- `VITE_CHAT_API_BASE` i `.env` pekar på Railway-URL för lokal utveckling
- **Vite `base: "/"`** måste vara satt — annars laddas assets med relativ sökväg och sidan blir vit vid direktnavigering (t.ex. `/app/` på refresh)
- **Komponenter definierade inuti andra komponenter** förstörs och återskapas vid varje render → React avmonterar dem → fokus försvinner. Definiera alltid hjälpkomponenter på toppnivå.
