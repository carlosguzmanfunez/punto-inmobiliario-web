import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo${light ? " logo--light" : ""}`} aria-label="Punto Inmobiliario Hn, inicio">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <path d="M20 2C12.3 2 6 8.1 6 15.7 6 26 20 38 20 38s14-12 14-22.3C34 8.1 27.7 2 20 2Z" fill="var(--brand)" />
        <path d="M13 17.5 20 11l7 6.5V25h-4.5v-4.5h-5V25H13Z" fill="#fff" />
        <circle cx="29" cy="7" r="4.5" fill="var(--accent)" stroke="#fff" strokeWidth="2" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">Punto Inmobiliario</span>
        <span className="logo__hn">HN</span>
      </span>
    </Link>
  );
}
