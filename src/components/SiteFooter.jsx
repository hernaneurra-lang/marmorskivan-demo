// Path: src/components/SiteFooter.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaTiktok,
} from "react-icons/fa";
import Modal from "./Modal";

import { GarantiContent } from "../pages/Garanti";
import { UnderhallContent } from "../pages/Underhall";
import { VillkorContent } from "../pages/Villkor";
import { IntegritetContent } from "../pages/Integritet";
import SustainabilityPage from "../pages/Sustainability";

/* =========================
   SOCIAL CONFIG (ON / OFF)
   ========================= */
const SOCIALS = {
  instagram: {
    enabled: true,
    url: "https://www.instagram.com/marmorskivan.se/",
    icon: FaInstagram,
    label: "Instagram",
  },
  facebook: {
    enabled: false,
    url: "https://www.facebook.com/",
    icon: FaFacebookF,
    label: "Facebook",
  },
  pinterest: {
    enabled: false,
    url: "https://www.pinterest.com/",
    icon: FaPinterestP,
    label: "Pinterest",
  },
  tiktok: {
    enabled: false,
    url: "https://www.tiktok.com/",
    icon: FaTiktok,
    label: "TikTok",
  },
};

export default function SiteFooter() {
  const { t } = useTranslation();
  const [footerModal, setFooterModal] = useState(null);

  return (
    <>
      <footer
        className="relative border-t bg-cover bg-center"
        style={{ backgroundImage: "url(/hero/hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur" />

        <div className="relative max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* LEFT */}
          <div className="text-sm text-gray-600 text-center md:text-left">
            {t("common.copyright")}
          </div>

          {/* CENTER – SOCIAL ICONS */}
          <div className="flex justify-center gap-4">
            {Object.values(SOCIALS)
              .filter((s) => s.enabled)
              .map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-gray-700 hover:text-black transition"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
          </div>

          {/* RIGHT – FOOTER LINKS */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
            <FooterLink
              label={t("landing.footer.garanti")}
              onClick={() => setFooterModal("garanti")}
            />
            <FooterLink
              label={t("landing.footer.underhall")}
              onClick={() => setFooterModal("underhall")}
            />
            <FooterLink
              label={t("landing.footer.villkor")}
              onClick={() => setFooterModal("villkor")}
            />
            <FooterLink
              label={t("landing.footer.integritet")}
              onClick={() => setFooterModal("integritet")}
            />
            <FooterLink
              label={t("landing.footer.hallbarhet")}
              onClick={() => setFooterModal("hallbarhet")}
            />
          </nav>
        </div>
      </footer>

      {/* MODALS */}
      {footerModal === "garanti" && (
        <Modal title={t("modal.garanti")} onClose={() => setFooterModal(null)}>
          <GarantiContent />
        </Modal>
      )}

      {footerModal === "underhall" && (
        <Modal title={t("modal.underhall")} onClose={() => setFooterModal(null)}>
          <UnderhallContent />
        </Modal>
      )}

      {footerModal === "villkor" && (
        <Modal title={t("modal.villkor")} onClose={() => setFooterModal(null)}>
          <VillkorContent />
        </Modal>
      )}

      {footerModal === "integritet" && (
        <Modal title={t("modal.integritet")} onClose={() => setFooterModal(null)}>
          <IntegritetContent />
        </Modal>
      )}

      {footerModal === "hallbarhet" && (
        <Modal title={t("modal.hallbarhet")} onClose={() => setFooterModal(null)}>
          <SustainabilityPage />
        </Modal>
      )}
    </>
  );
}

function FooterLink({ label, onClick }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="text-gray-700 hover:underline"
    >
      {label}
    </a>
  );
}
