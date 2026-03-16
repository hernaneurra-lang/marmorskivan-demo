import { social } from "../config/social";

export default function SocialBar() {
  if (!social?.enabled) return null;

  const items = [
    { key: "instagram", href: social.instagram, label: "Instagram", icon: InstagramIcon },
    { key: "tiktok", href: social.tiktok, label: "TikTok", icon: TiktokIcon },
  ].filter((i) => i.href);

  if (items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-6">
      <div className="rounded-2xl border bg-white p-4 flex items-center gap-4">
        <span className="text-sm text-gray-600">Följ oss:</span>
        <div className="flex items-center gap-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <a
                key={it.key}
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                title={it.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{it.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InstagramIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zM18.5 6a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}

function TiktokIcon({ className = "" }) {
  // Enkel, solid TikTok-ikon (inline SVG, ingen extern dependency)
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" aria-hidden="true">
      <path d="M30.2 6c1.3 4.5 4.5 7.5 8.9 8.4v6.1c-3.2-.1-6.1-1.1-8.9-3V31c0 7-5.7 12.6-12.6 12.6S5 38 5 31.1c0-6.9 5.6-12.6 12.6-12.6 1.1 0 2.2.2 3.2.5v6.4a7.2 7.2 0 00-3.2-.7 6.2 6.2 0 00-6.2 6.4c.1 3.4 2.9 6.1 6.3 6.1A6.3 6.3 0 0024 30.9V6h6.2z"/>
    </svg>
  );
}
