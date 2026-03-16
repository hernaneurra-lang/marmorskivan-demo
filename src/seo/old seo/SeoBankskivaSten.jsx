// Path: src/seo/SeoBankskivaSten.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaSten() {
  return (
    <StoneDetailPage
      title="Bänkskiva i sten – jämför marmor, granit, kvarts, keramik & fler | Marmorskivan.se"
      metaDescription="Bänkskiva i sten för kök och badrum. Jämför marmor, granit, kvarts/komposit, keramik och fler alternativ – skillnader, pris och tips. Räkna pris direkt i kalkylatorn."
      h1="Bänkskiva i sten – jämför material och hitta rätt val"
      heroImage="/images/materials/stone-hero.jpg"
      backgroundImage="/images/materials/stone-bg.jpg"
      textSize="lg"
      breadcrumbMiddleLabel="Guider"
      breadcrumbMiddleTo="/"
      sections={[
        {
          heading: "Snabbt nästa steg",
          content: `
            <div class="not-prose mt-2 p-5 rounded-2xl border bg-emerald-50">
              <div class="font-semibold text-gray-900 text-lg">Snabbt nästa steg</div>
              <div class="text-sm text-gray-700 mt-1">
                Öppna kalkylatorn, välj material och få pris direkt. Du kan börja med ungefärliga mått och justera senare.
              </div>

              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Öppna kalkylatorn
                </a>
                <a href="/bankskiva-online" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Så beställer du online
                </a>
              </div>

              <div class="mt-4 grid sm:grid-cols-4 gap-3">
                <a href="/app?cat=Marmor" class="rounded-xl border bg-white p-3 hover:shadow-sm transition">
                  <div class="text-xs text-gray-500">Känsla & ådring</div>
                  <div class="font-semibold text-sm">Marmor</div>
                  <div class="text-xs text-gray-600 mt-1">Välj i appen →</div>
                </a>
                <a href="/app?cat=Granit" class="rounded-xl border bg-white p-3 hover:shadow-sm transition">
                  <div class="text-xs text-gray-500">Max tålighet</div>
                  <div class="font-semibold text-sm">Granit</div>
                  <div class="text-xs text-gray-600 mt-1">Välj i appen →</div>
                </a>
                <a href="/app?cat=Kompositsten" class="rounded-xl border bg-white p-3 hover:shadow-sm transition">
                  <div class="text-xs text-gray-500">Jämn design</div>
                  <div class="font-semibold text-sm">Kvarts / komposit</div>
                  <div class="text-xs text-gray-600 mt-1">Välj i appen →</div>
                </a>
                <a href="/app?cat=Keramik" class="rounded-xl border bg-white p-3 hover:shadow-sm transition">
                  <div class="text-xs text-gray-500">Lättskött</div>
                  <div class="font-semibold text-sm">Keramik</div>
                  <div class="text-xs text-gray-600 mt-1">Välj i appen →</div>
                </a>
              </div>
            </div>
          `,
        },

        {
          heading: "Vad menas med bänkskiva i sten?",
          content: `
            <p>
              <strong>Bänkskiva i sten</strong> används ofta som samlingsnamn för flera material:
              <strong> natursten</strong> (t.ex. marmor, granit, kalksten, kvartsit, travertin)
              och <strong>förädlade stenmaterial</strong> (t.ex. kvarts/komposit och keramik).
              De kan se lika exklusiva ut – men skiljer sig i <strong>tålighet</strong>, <strong>underhåll</strong> och <strong>pris</strong>.
            </p>
            <p>
              Målet är enkelt: hitta rätt material för <strong>din vardag</strong>, <strong>din stil</strong> och <strong>ditt kök</strong>.
            </p>
          `,
        },

        {
          heading: "Jämför material – natursten och alternativ",
          content: `
            <div class="not-prose grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <a href="/bankskiva-marmor" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="text-sm font-semibold">Marmor</div>
                <div class="text-xs text-gray-600 mt-1">Exklusiv ådring. Levande uttryck.</div>
                <div class="mt-3 text-sm font-semibold text-emerald-700">Läs mer →</div>
              </a>

              <a href="/bankskiva-granit" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="text-sm font-semibold">Granit</div>
                <div class="text-xs text-gray-600 mt-1">Mycket tåligt. Populärt vardagsval.</div>
                <div class="mt-3 text-sm font-semibold text-emerald-700">Läs mer →</div>
              </a>

              <a href="/bankskiva-komposit" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="text-sm font-semibold">Kvarts / komposit</div>
                <div class="text-xs text-gray-600 mt-1">Jämn design och stort urval.</div>
                <div class="mt-3 text-sm font-semibold text-emerald-700">Läs mer →</div>
              </a>

              <a href="/bankskiva-keramik" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="text-sm font-semibold">Keramik</div>
                <div class="text-xs text-gray-600 mt-1">Modern, tålig och lättskött yta.</div>
                <div class="mt-3 text-sm font-semibold text-emerald-700">Läs mer →</div>
              </a>
            </div>

            <div class="not-prose mt-6 p-5 rounded-2xl border bg-white">
              <div class="font-semibold text-gray-900">Alternativ till “klassisk natursten”</div>
              <p class="text-sm text-gray-700 mt-2">
                I många projekt väljer man även material som <strong>keramik</strong>, <strong>kvarts/komposit</strong> och ibland <strong>glas</strong>
                för ett mer specifikt uttryck eller enklare vardag.
              </p>
              <div class="mt-3 flex gap-3 flex-wrap">
                <a href="/app?cat=Keramik" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">Se keramik i appen</a>
                <a href="/app?cat=Kompositsten" class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold">Se komposit i appen</a>
              </div>
            </div>
          `,
        },

        {
          heading: "Snabbguide: vilket material passar dig?",
          content: `
            <div class="not-prose mt-2 grid md:grid-cols-2 gap-4">
              <div class="rounded-2xl border bg-white p-5">
                <div class="font-semibold text-gray-900">Jag vill ha maximal premiumkänsla</div>
                <p class="text-sm text-gray-700 mt-2">
                  Välj ofta <strong>marmor</strong> om du vill ha naturlig ådring och “architectural look”.
                </p>
                <div class="mt-3 flex gap-2 flex-wrap">
                  <a href="/bankskiva-marmor" class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold">Läs om marmor</a>
                  <a href="/app?cat=Marmor" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">Välj marmor →</a>
                </div>
              </div>

              <div class="rounded-2xl border bg-white p-5">
                <div class="font-semibold text-gray-900">Jag vill ha det mest lättskötta</div>
                <p class="text-sm text-gray-700 mt-2">
                  Välj ofta <strong>keramik</strong> eller <strong>kvarts/komposit</strong> för en enkel vardag och tydligt uttryck.
                </p>
                <div class="mt-3 flex gap-2 flex-wrap">
                  <a href="/app?cat=Keramik" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">Välj keramik →</a>
                  <a href="/app?cat=Kompositsten" class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold">Välj komposit →</a>
                </div>
              </div>
            </div>
          `,
        },

        {
          heading: "Pris på bänkskivor – vad påverkar?",
          content: `
            <p>
              Priset styrs framför allt av <strong>storlek och form</strong> (t.ex. L-form), <strong>tjocklek</strong>,
              <strong>kantprofil</strong>, <strong>urtag</strong> (diskho/häll/blandare) och eventuellt <strong>stänkskydd</strong>.
              För ett exakt pris är det bäst att räkna på dina mått.
            </p>
            <div class="not-prose mt-4 p-4 rounded-2xl border bg-emerald-50">
              <div class="text-sm text-gray-700">Räkna pris direkt – välj materialtyp i kalkylatorn.</div>
              <a href="/app" class="inline-flex mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                Beräkna pris
              </a>
            </div>
          `,
        },

        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Är “stenbänkskiva” alltid natursten?</strong><br/>
              Nej. Marmor och granit är natursten, medan kvarts/komposit och keramik är förädlade material med andra egenskaper.
            </p>

            <p><strong>Vilket material är bäst i kök?</strong><br/>
              Det beror på behov: marmor för uttryck, granit för tålighet, kvarts/komposit för jämn design och keramik för lättskött yta.
            </p>

            <p><strong>Kan jag få pris direkt?</strong><br/>
              Ja, i kalkylatorn kan du välja material, ange mått och få pris direkt.
            </p>
          `,
        },
      ]}
    />
  );
}
