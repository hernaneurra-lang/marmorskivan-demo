export default function Logo({ className = "h-8" }) {
  return (
    <img
      src="/brand/logo-m.svg"
      alt="Marmorskivan.se"
      className={className}
      onError={(e) => {
        // Fallback: skriv text om loggan saknas
        e.currentTarget.outerHTML = `<div style="font-weight:600;font-size:18px">marmorskivan.se</div>`;
      }}
    />
  );
}
