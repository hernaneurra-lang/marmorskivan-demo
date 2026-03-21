// Path: src/router/Router.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SEO from "../components/SEO.jsx";

import Landing from "../components/Landing.jsx";
import App from "../App.jsx";
import ChatWidget from "../chat/ChatWidget.jsx";
import AdminPage from "../admin/AdminPage.jsx";

// Material (lazy)
const Marmor = lazy(() => import("../pages/material/Marmor.jsx"));
const Granit = lazy(() => import("../pages/material/Granit.jsx"));
const Komposit = lazy(() => import("../pages/material/Komposit.jsx"));
const Onyx = lazy(() => import("../pages/material/Onyx.jsx"));
const Kalksten = lazy(() => import("../pages/material/Kalksten.jsx"));
const Terrazzo = lazy(() => import("../pages/material/Terrazzo.jsx"));
const Kvartsit = lazy(() => import("../pages/material/Kvartsit.jsx"));
const Travertin = lazy(() => import("../pages/material/Travertin.jsx"));
const SemiPrecious = lazy(() => import("../pages/material/SemiPrecious.jsx"));
const AtervunnetGlas = lazy(() => import("../pages/material/AtervunnetGlas.jsx"));

// SEO (lazy)
const SeoBankskivaMarmor = lazy(() => import("../seo/SeoBankskivaMarmor.jsx"));
const SeoBankskivaGranit = lazy(() => import("../seo/SeoBankskivaGranit.jsx"));
const SeoBankskivaKomposit = lazy(() => import("../seo/SeoBankskivaKomposit.jsx"));
const SeoBankskivaKeramik = lazy(() => import("../seo/SeoBankskivaKeramik.jsx"));
const SeoBankskivaTravertin = lazy(() => import("../seo/SeoBankskivaTravertin.jsx"));
const SeoBankskivaSten = lazy(() => import("../seo/SeoBankskivaSten.jsx"));
const SeoBankskivaOnline = lazy(() => import("../seo/SeoBankskivaOnline.jsx"));

function LandingRouteWrapper() {
  const navigate = useNavigate();
  return <Landing onProceed={() => navigate("/app")} />;
}

function Loader() {
  return (
    <div className="min-h-[40vh] grid place-items-center text-sm text-gray-500">
      Laddar…
    </div>
  );
}

function SEOWrapper() {
  const { pathname } = useLocation();
  return <SEO path={pathname} />;
}

function ChatWidgetWrapper() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <ChatWidget />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <SEOWrapper />
      <ChatWidgetWrapper />
      <Routes>
        {/* Startsida */}
        <Route path="/" element={<LandingRouteWrapper />} />

        {/* Kalkylator */}
        <Route path="/app" element={<App />} />

        {/* SEO – Bänkskivor */}
        <Route path="/bankskiva-sten" element={<SeoBankskivaSten />} />
        <Route path="/bankskiva-online" element={<SeoBankskivaOnline />} />
        <Route path="/bankskiva-marmor" element={<SeoBankskivaMarmor />} />
        <Route path="/bankskiva-granit" element={<SeoBankskivaGranit />} />
        <Route path="/bankskiva-komposit" element={<SeoBankskivaKomposit />} />
        <Route path="/bankskiva-keramik" element={<SeoBankskivaKeramik />} />
        <Route path="/bankskiva-travertin" element={<SeoBankskivaTravertin />} />

        {/* Material */}
        <Route path="/material/marmor" element={<Marmor />} />
        <Route path="/material/granit" element={<Granit />} />
        <Route path="/material/komposit" element={<Komposit />} />
        <Route path="/material/onyx" element={<Onyx />} />
        <Route path="/material/kalksten" element={<Kalksten />} />
        <Route path="/material/terrazzo" element={<Terrazzo />} />
        <Route path="/material/kvartsit" element={<Kvartsit />} />
        <Route path="/material/travertin" element={<Travertin />} />
        <Route path="/material/semiprecious" element={<SemiPrecious />} />
        <Route path="/material/atervunnetglas" element={<AtervunnetGlas />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center">
              <h1 className="text-2xl font-bold">404 – Ingen sida hittad</h1>
              <p className="mt-4 text-gray-600">
                Testa{" "}
                <a href="/bankskiva-sten" className="text-emerald-600 underline">
                  /bankskiva-sten
                </a>
              </p>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
