// Path: src/seo/SeoBankskivaOnline.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaOnline() {
  return (
    <StoneDetailPage
      title="Beställ bänkskiva online – mått, offert, mätning & montering | Marmorskivan.se"
      metaDescription="Beställ bänkskiva online. Välj material, ange mått och tillval, få offert, kostnadsfri mätning och montering med garanti. Så går det till – steg för steg."
      h1="Beställ bänkskiva online – så går det till (steg för steg)"
      heroImage="/images/materials/online/online-hero.jpg"
      heroMode="contain"
      backgroundImage="/images/materials/granit-hero.jpg"
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
                Öppna kalkylatorn, välj material och fyll i mått & tillval. Du får en kopia på din förfrågan via e-post.
              </div>

              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Starta beställning i kalkylatorn
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material först
                </a>
              </div>
            </div>
          `,
        },

        {
          heading: "Så går det till – steg för steg",
          content: `
            <div class="not-prose mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">🪨</div>
                <div class="text-xs text-gray-500 mt-1">1</div>
                <div class="font-semibold">Välj sten</div>
                <div class="text-sm text-gray-600 mt-1">Bläddra bland material och hitta din favorit.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">📏</div>
                <div class="text-xs text-gray-500 mt-1">2</div>
                <div class="font-semibold">Ange mått & tillval</div>
                <div class="text-sm text-gray-600 mt-1">Fyll i mått och lägg till urtag, kant och stänkskydd.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">📧</div>
                <div class="text-xs text-gray-500 mt-1">3</div>
                <div class="font-semibold">Skicka offertförfrågan</div>
                <div class="text-sm text-gray-600 mt-1">Du får en kopia på e-post och vi tar hand om resten.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">📞</div>
                <div class="text-xs text-gray-500 mt-1">4</div>
                <div class="font-semibold">Kontakt & planering</div>
                <div class="text-sm text-gray-600 mt-1">Vi återkopplar och planerar nästa steg (mätning, tider och upplägg).</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">📍</div>
                <div class="text-xs text-gray-500 mt-1">5</div>
                <div class="font-semibold">Kostnadsfri mätning</div>
                <div class="text-sm text-gray-600 mt-1">Vi kommer hem till dig och säkerställer perfekta mått innan tillverkning.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">✅</div>
                <div class="text-xs text-gray-500 mt-1">6</div>
                <div class="font-semibold">Fast pris – allt inkluderat</div>
                <div class="text-sm text-gray-600 mt-1">Du får en tydlig offert med fast totalpris för material, tillval och upplägg.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">🏭</div>
                <div class="text-xs text-gray-500 mt-1">7</div>
                <div class="font-semibold">Tillverkning & leverans</div>
                <div class="text-sm text-gray-600 mt-1">Bänkskivan tillverkas efter dina mått – vi bokar leverans och montering.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">🔨</div>
                <div class="text-xs text-gray-500 mt-1">8</div>
                <div class="font-semibold">Montering</div>
                <div class="text-sm text-gray-600 mt-1">Professionell montering på plats – du får ett snyggt och tryggt slutresultat.</div>
              </div>

              <div class="rounded-2xl border bg-white p-4">
                <div class="text-2xl">📄</div>
                <div class="text-xs text-gray-500 mt-1">9</div>
                <div class="font-semibold">Garanti & service</div>
                <div class="text-sm text-gray-600 mt-1">Efter montering får du garanti- och servicedokument för långsiktig skötsel.</div>
              </div>
            </div>

            <div class="not-prose mt-6 p-5 rounded-2xl border bg-emerald-50">
              <div class="font-semibold text-gray-900 text-lg">Redo att börja?</div>
              <p class="text-sm text-gray-700 mt-1">
                Starta i kalkylatorn – välj material, fyll i mått och få pris. Det tar bara några minuter.
              </p>
              <div class="mt-3 flex gap-3 flex-wrap">
                <a href="/app" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Starta nu
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material
                </a>
              </div>
            </div>
          `,
        },

        {
          heading: "Välj material innan du beställer",
          content: `
            <p>
              Om du är osäker på material kan du börja i våra guider och sedan välja i kalkylatorn:
            </p>
            <div class="not-prose grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
              <a href="/bankskiva-marmor" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="font-semibold text-sm">Marmor</div>
                <div class="text-xs text-gray-600 mt-1">Exklusiv känsla och ådring.</div>
              </a>
              <a href="/bankskiva-granit" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="font-semibold text-sm">Granit</div>
                <div class="text-xs text-gray-600 mt-1">Max tålighet.</div>
              </a>
              <a href="/bankskiva-komposit" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="font-semibold text-sm">Kvarts / komposit</div>
                <div class="text-xs text-gray-600 mt-1">Jämn design.</div>
              </a>
              <a href="/bankskiva-keramik" class="border rounded-2xl p-4 bg-white hover:shadow-md transition">
                <div class="font-semibold text-sm">Keramik</div>
                <div class="text-xs text-gray-600 mt-1">Lättskött yta.</div>
              </a>
            </div>
          `,
        },

        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Måste jag ha exakta mått direkt?</strong><br/>
              Nej. Du kan börja med ungefärliga mått i kalkylatorn och finjustera senare.
            </p>

            <p><strong>Hur snabbt blir jag kontaktad?</strong><br/>
              Efter att du skickat din förfrågan kontaktar vi dig för nästa steg och planering.
            </p>

            <p><strong>Ingår montering och garanti?</strong><br/>
              Montering planeras efter tillverkning och du får garanti- och servicedokument efter montering.
            </p>
          `,
        },
      ]}
    />
  );
}
