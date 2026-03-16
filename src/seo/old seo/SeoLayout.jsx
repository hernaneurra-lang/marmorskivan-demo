import { Link } from "react-router-dom";

export default function SeoLayout({ title, subtitle, children }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/70 border-b backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-emerald-700">
            marmorskivan.se
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/bankskiva-marmor" className="px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50">
              Marmor
            </Link>
            <Link to="/bankskiva-sten" className="px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50">
              Sten
            </Link>
            <Link to="/bankskiva-online" className="px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50">
              Online
            </Link>
            <Link to="/app" className="ml-2 px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700">
              Beräkna pris
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b relative" style={{ backgroundImage: "url(/hero/hero.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm md:text-base text-gray-700">{subtitle}</p> : null}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-10">{children}</div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/app" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
            Beräkna pris i kalkylatorn
          </Link>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
            Till startsidan
          </Link>
        </div>
      </div>

      <footer className="border-t bg-white/70">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-600">© {year} marmorskivan.se</div>
      </footer>
    </div>
  );
}
