// Path: src/components/Landing.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { heroTiles } from "../config/site";
import Modal from "./modal";
import MaterialLinks from "./MaterialLinks";
import SiteFooter from "./SiteFooter";

/* -------------------------------------------------------
   DYNAMISK VECKO-LOGIK (Fokus på Gattoni & Intra med i18n)
------------------------------------------------------- */
function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const WEEKLY_MESSAGES = {
  1: { sv: "Gott nytt år! Planera ditt drömkök för 2026 med oss.", en: "Happy New Year! Plan your dream kitchen for 2026 with us." },
  2: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni vid beställning v.2.", en: "Right now: Free exclusive Gattoni tap included with orders in week 2." },
  3: { sv: "Denna vecka: Kvalitetsdiskho från Intra ingår i din beställning.", en: "This week: High-quality Intra sink included in your order." },
  4: { sv: "Nyhet: Nu har vi fyllt på lagret med exklusiv kvartsit.", en: "News: We just restocked our exclusive quartzite." },
  5: { sv: "Februari-tips: Vi bjuder på ett lyxigt rengöringskit vid beställning.", en: "February tip: Free luxury cleaning kit included with your order." },
  6: { sv: "Just nu: Exklusiv blandare från Gattoni ingår vid köp av bänkskiva.", en: "Right now: Exclusive Gattoni tap included with any worktop purchase." },
  7: { sv: "Alla hjärtans hem – boka din stenskiva senast fredag.", en: "A home for your Valentine – book your stone surface by Friday." },
  8: { sv: "Denna vecka ingår en stilren diskho från Intra i din beställning.", en: "This week: A stylish Intra sink is included in your order." },
  9: { sv: "Våren närmar sig! Uppdatera köket med tidlös granit.", en: "Spring is coming! Refresh your kitchen with timeless granite." },
  10: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni hela v.10.", en: "Special offer: Free exclusive Gattoni tap all of week 10." },
  11: { sv: "Mars-kampanj: Vi bjuder på uttag för diskhon hela veckan.", en: "March campaign: Free sink cutout included all week." },
  12: { sv: "Veckans deal: Diskho från Intra ingår vid beställning av stenskiva.", en: "Deal of the week: Intra sink included with your stone worktop order." },
  13: { sv: "Påskerbjudande: Vi bjuder på hemleverans inom Storstockholm.", en: "Easter offer: Free home delivery within Greater Stockholm." },
  14: { sv: "Dags för utekök? Kolla in vår väderbeständiga keramik.", en: "Time for an outdoor kitchen? Check out our weather-resistant ceramics." },
  15: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni hela veckan.", en: "Right now: Free exclusive Gattoni tap included all week." },
  16: { sv: "Veckans trend: Terrazzo är tillbaka – se våra mönster här.", en: "Trend of the week: Terrazzo is back – explore our patterns here." },
  17: { sv: "Just nu ingår en högkvalitativ diskho från Intra i din beställning.", en: "Right now: A high-quality Intra sink is included in your order." },
  18: { sv: "Maj-special: Vi bjuder på professionell mätning vid köp.", en: "May special: Free professional measurement included with your purchase." },
  19: { sv: "Gör som proffsen – välj Silestone för ett underhållsfritt kök.", en: "Do like the pros – choose Silestone for a maintenance-free kitchen." },
  20: { sv: "Just nu: Exklusiv blandare från Gattoni ingår vid beställning v.20.", en: "Right now: Exclusive Gattoni tap included with orders in week 20." },
  21: { sv: "Mors dag-tips: Ge köket den kärlek det förtjänar.", en: "Mother's Day tip: Give your kitchen the love it deserves." },
  22: { sv: "Denna vecka: Diskho från Intra ingår när du beställer din bänkskiva.", en: "This week: Intra sink included when you order your worktop." },
  23: { sv: "Nationaldagsveckan: Vi bjuder på mätning vid bokning v.23.", en: "National Day week: Free measurement included with bookings in week 23." },
  24: { sv: "Sommarfest på gång? Imponera med en ny köksö i marmor.", en: "Planning a summer party? Impress with a new marble kitchen island." },
  25: { sv: "Glad midsommar! Vi tar emot offertförfrågningar dygnet runt.", en: "Happy Midsummer! We accept quote requests 24/7." },
  26: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni v.26.", en: "Right now: Free exclusive Gattoni tap included in week 26." },
  27: { sv: "Sommarprojektet: Enkel beställning online – pris direkt i mobilen.", en: "Summer project: Easy online ordering – get your price directly on your mobile." },
  28: { sv: "Denna vecka ingår en stilren diskho från Intra i din beställning.", en: "This week: A stylish Intra sink is included in your order." },
  29: { sv: "Svalka dig med sten: Natursten håller sig sval även under heta dagar.", en: "Cool down with stone: Natural stone stays cool even on hot days." },
  30: { sv: "Juli-special: Vi bjuder på mätning vid köp av valfri stenskiva.", en: "July special: Free measurement with any stone worktop purchase." },
  31: { sv: "Just nu: Exklusiv blandare från Gattoni ingår vid beställning.", en: "Right now: Exclusive Gattoni tap included with your order." },
  32: { sv: "Dags att planera höstens renovering? Starta kalkylatorn nu.", en: "Time to plan your autumn renovation? Start the calculator now." },
  33: { sv: "Denna vecka ingår en högkvalitativ diskho från Intra i din beställning.", en: "This week: A high-quality Intra sink is included in your order." },
  34: { sv: "Veckans fokus: Keramik – det mest tåliga materialet för barnfamiljen.", en: "Weekly focus: Ceramics – the most durable material for families." },
  35: { sv: "Augustimåne: Skapa stämning med mörk granit i köket.", en: "August moon: Create an atmosphere with dark granite in the kitchen." },
  36: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni hela v.36.", en: "Right now: Free exclusive Gattoni tap all of week 36." },
  37: { sv: "Just nu: Fri frakt inom Storstockholm hela vecka 37.", en: "Right now: Free shipping within Greater Stockholm all of week 37." },
  38: { sv: "Denna vecka: Kvalitetsdiskho från Intra ingår i din beställning.", en: "This week: High-quality Intra sink included in your order." },
  39: { sv: "Säkra din montering innan vintern – boka mätning idag.", en: "Secure your installation before winter – book measurement today." },
  40: { sv: "Oktober-kampanj: Vi bjuder på underlimning av din diskho.", en: "October campaign: Free undermounting for your sink included." },
  41: { sv: "Just nu: Exklusiv blandare från Gattoni ingår vid beställning v.41.", en: "Right now: Exclusive Gattoni tap included with orders in week 41." },
  42: { sv: "Veckans tips: Så sköter du om din marmorskiva på bästa sätt.", en: "Tip of the week: How to best care for your marble surface." },
  43: { sv: "Just nu ingår en stilren diskho från Intra i din beställning.", en: "Right now: A stylish Intra sink is included in your order." },
  44: { sv: "Allhelgonaveckan: Vi har fyllt på lagret med nya sändningar från Italien.", en: "All Saints' week: We've restocked with new shipments from Italy." },
  45: { sv: "Novemberljus: Ljusa upp köket med vit kvartskomposit.", en: "November light: Brighten your kitchen with white quartz composite." },
  46: { sv: "Just nu: Vi bjuder på en exklusiv blandare från Gattoni hela v.46.", en: "Right now: Free exclusive Gattoni tap all of week 46." },
  47: { sv: "Black Week: Vi bjuder på både mätning och rengöringskit vid köp.", en: "Black Week: Free measurement and cleaning kit with your purchase." },
  48: { sv: "Denna vecka ingår en diskho från Intra i din beställning.", en: "This week: An Intra sink is included in your order." },
  49: { sv: "Julen närmar sig: Sista chansen för leverans innan julafton.", en: "Christmas is coming: Last chance for delivery before Christmas Eve." },
  50: { sv: "Just nu: Exklusiv blandare från Gattoni ingår vid beställning.", en: "Right now: Exclusive Gattoni tap included with your order." },
  51: { sv: "God jul önskar vi på Marmorskivan – vi svarar på offerter hela helgen.", en: "Merry Christmas from Marmorskivan – we answer quotes all weekend." },
  52: { sv: "Nyårsraketen: Diskho från Intra ingår vid beställning innan årsskiftet!", en: "New Year Special: Intra sink included with orders before year-end!" }
};

/* -------------------------------------------------------
   STEG-FÖR-STEG-SEKTION
------------------------------------------------------- */
function ProcessSteps() {
  const { t } = useTranslation();

  const steps = [
    { title: t("landing.process.steps.0.title"), desc: t("landing.process.steps.0.desc"), emoji: "🪨" },
    { title: t("landing.process.steps.1.title"), desc: t("landing.process.steps.1.desc"), emoji: "📏" },
    { title: t("landing.process.steps.2.title"), desc: t("landing.process.steps.2.desc"), emoji: "📧" },
    { title: t("landing.process.steps.3.title"), desc: t("landing.process.steps.3.desc"), emoji: "📞" },
    { title: t("landing.process.steps.4.title"), desc: t("landing.process.steps.4.desc"), emoji: "📍" },
    { title: t("landing.process.steps.5.title"), desc: t("landing.process.steps.5.desc"), emoji: "✅" },
    { title: t("landing.process.steps.6.title"), desc: t("landing.process.steps.6.desc"), emoji: "📅" },
    { title: t("landing.process.steps.7.title"), desc: t("landing.process.steps.7.desc"), emoji: "🔨" },
    { title: t("landing.process.steps.8.title"), desc: t("landing.process.steps.8.desc"), emoji: "♻️" },
  ];

  return (
    <section id="process" className="relative z-10 bg-white/85 backdrop-blur border-t">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold mb-6">{t("landing.process.title")}</h2>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li key={i}>
              <StepCard index={i + 1} title={s.title} desc={s.desc} emoji={s.emoji} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ index, title, desc, emoji }) {
  return (
    <article className="group h-full rounded-2xl border bg-white p-4 flex gap-3 items-start hover:shadow-md transition">
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border flex items-center justify-center text-xl">
          {emoji}
        </div>
        <span className="absolute -top-2 -right-2 text-[11px] px-1.5 py-0.5 rounded bg-emerald-600 text-white">
          {index}
        </span>
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   LANDING
------------------------------------------------------- */
export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);

  const tiles = useMemo(() => heroTiles.slice(0, 4), []);
  const uiLang = (i18n.language || "sv").slice(0, 2);

  // Hämta dynamiskt meddelande baserat på vecka OCH språk
  const currentWeek = getWeekNumber();
  const weekData = WEEKLY_MESSAGES[currentWeek];
  const weeklyMessage = weekData 
    ? (weekData[uiLang] || weekData["sv"]) 
    : (uiLang === "sv" ? "Prisgaranti på alla våra stenskivor." : "Price match guarantee on all our stone surfaces.");

  const goToApp = (e) => {
    e.preventDefault();
    setTimeout(() => navigate("/app"), 0);
  };

  function setLang(lng) {
    const normalized = lng === "en" ? "en" : "sv";
    i18n.changeLanguage(normalized);
    try {
      localStorage.setItem("lang", normalized);
      document.documentElement.lang = normalized;
    } catch {
      // no-op
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url(/hero/hero.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
      }}
    >
      <style>
        {`
          @keyframes softPulse {
            0%, 100% { opacity: 1; transform: translateY(0); }
            50% { opacity: 0.8; transform: translateY(-2px); }
          }
          .animate-soft-pulse {
            animation: softPulse 4s ease-in-out infinite;
          }
        `}
      </style>

      <div className="absolute inset-0 bg-white/75 pointer-events-none z-0" />

      <header
        className="relative z-20 border-b bg-cover bg-center"
        style={{ backgroundImage: "url(/hero/hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-white/75 backdrop-blur" />
        <div className="relative max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gray-900 hover:text-emerald-700">
            {t("common.brand", { defaultValue: "marmorskivan.se" })}
          </a>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <button
              type="button"
              className={uiLang === "sv" ? "underline" : ""}
              onClick={() => setLang("sv")}
            >
              {t("lang.sv", { defaultValue: "SV" })}
            </button>
            <span aria-hidden="true">|</span>
            <button
              type="button"
              className={uiLang === "en" ? "underline" : ""}
              onClick={() => setLang("en")}
            >
              {t("lang.en", { defaultValue: "EN" })}
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 min-h-[50vh] flex items-center justify-center text-center px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-700">{t("landing.hero.desc")}</p>
          <button
            type="button"
            onClick={goToApp}
            className="mt-8 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow transition-all active:scale-95"
          >
            {t("common.ctaCalculate")}
          </button>

          {/* DYNAMISK TEXT UNDER KNAPPEN - Nu med i18n-stöd */}
          <div className="mt-6 animate-soft-pulse">
             <p className="text-emerald-800 font-medium text-sm md:text-base bg-emerald-50/60 py-1.5 px-5 rounded-full inline-block border border-emerald-100 shadow-sm">
               ✨ {weeklyMessage}
             </p>
          </div>
        </div>
      </section>

      <ProcessSteps />
      <MaterialLinks />

      <section id="trend" className="relative z-10 bg-white/85 backdrop-blur border-t">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-xl font-semibold mb-4">{t("landing.trend.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map((tItem, i) => {
              const titleKey = `landing.trend.tiles.${tItem.id}.title`;
              const subKey = `landing.trend.tiles.${tItem.id}.subtitle`;
              const title = t(titleKey, { defaultValue: "" }) || t(titleKey, { lng: "en", defaultValue: tItem.id });
              const subtitle = t(subKey, { defaultValue: "" }) || t(subKey, { lng: "en", defaultValue: "" });
              const badge = t("landing.trend.badge", { defaultValue: "" }) || t("landing.trend.badge", { lng: "en", defaultValue: "" });

              return (
                <TrendCard
                  key={tItem.id || i}
                  title={title}
                  subtitle={subtitle}
                  src={tItem.src}
                  badge={badge}
                  onClick={() =>
                    setLightbox({
                      id: tItem.id,
                      src: tItem.src,
                      title,
                      subtitle,
                      badge,
                    })
                  }
                />
              );
            })}
          </div>
        </div>
      </section>

      {lightbox && (
        <Modal title={lightbox.title} onClose={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.title} className="w-full h-auto" />
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-700">{t("landing.trend.orderHint")}</p>
            <button
              type="button"
              onClick={() => {
                const q = new URLSearchParams();
                q.set("variant", lightbox.title);
                q.set("img", lightbox.src);
                if (lightbox.badge) q.set("price", lightbox.badge);
                setLightbox(null);
                navigate(`/app?${q.toString()}`);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow"
            >
              {t("common.orderNow")}
            </button>
          </div>
        </Modal>
      )}

      <SiteFooter />
    </main>
  );
}

function TrendCard({ title, subtitle, src, badge, onClick }) {
  return (
    <article
      className="relative rounded-2xl overflow-hidden border bg-white cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-gray-100 relative">
        <img src={src} alt={title} className="w-full h-full object-cover" />
        {badge && (
          <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-emerald-600 text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
      </div>
    </article>
  );
}