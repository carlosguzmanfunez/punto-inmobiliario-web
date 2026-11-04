import Link from "next/link";
import { guides } from "@/data/guides";
import { BookIcon } from "@/components/Icons";

export const metadata = { title: "Guías y consejos" };

export default function GuidesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow"><BookIcon size={16} /> Guías</span>
          <h1>Guías y consejos inmobiliarios</h1>
          <p>Todo lo que necesitas saber para comprar, vender, alquilar o invertir en Honduras, explicado en palabras sencillas.</p>
        </div>
      </section>
      <section className="section container">
        <div className="guide-grid">
          {guides.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="guide-card">
              <img src={g.image} alt="" loading="lazy" />
              <div><span className="eyebrow">{g.category} · {g.minutes} min</span><h2 className="h3">{g.title}</h2><p className="muted small">{g.summary}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
