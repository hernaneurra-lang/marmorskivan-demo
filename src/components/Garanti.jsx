export default function Garanti() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section
        className="relative border-b bg-cover bg-center"
        style={{ backgroundImage: "url(/hero/guarantee.jpg)" }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold">10 års garanti</h1>
          <p className="text-gray-700 mt-2">
            Trygghet när du väljer stenskiva från <strong>marmorskivan.se</strong>. Vi står bakom vårt arbete – från måttning till montering.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-3">Vad som ingår</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Monteringsgaranti i 10 år</strong>: Gäller det arbete vi utför på plats – montering, fog, infästningar och passning.</li>
            <li><strong>Funktion & passform</strong>: Skivan ska sitta stabilt, ligga i rätt nivå och följa beställda mått.</li>
            <li><strong>Uppföljning</strong>: Upptäcker du ett monteringsrelaterat fel, kontaktar du oss så åtgärdar vi.</li>
          </ul>
        </article>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-3">Material & naturliga variationer</h2>
          <p className="text-gray-700">
            Sten är ett natur- eller industrimaterial och kan ha variationer i mönster, nyans och struktur. Dessa är inte fel i materialet, utan en del av dess karaktär. Materialgarantier kan tillkomma från respektive leverantör och gäller utifrån deras villkor.
          </p>
        </article>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-3">Undantag</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Skador orsakade av yttre påverkan (stötar, värmeskock, kemikalier, felaktig rengöring).</li>
            <li>Förändringar som görs efter vår montering utan vår medverkan.</li>
            <li>Normalt slitage, missfärgningar från starka färgämnen eller kalkavlagringar.</li>
          </ul>
        </article>

        <article className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-3">Så nyttjar du garantin</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Maila oss på <a className="underline" href="mailto:info@marmorskivan.se">info@marmorskivan.se</a> med ordernummer, bilder och en kort beskrivning.</li>
            <li>Vi felsöker och återkommer med förslag på åtgärd.</li>
            <li>Vid monteringsfel åtgärdar vi kostnadsfritt.</li>
          </ol>
          <p className="text-sm text-gray-500 mt-3">Senast uppdaterad: 2025-01-01</p>
        </article>
      </section>
    </main>
  );
}
