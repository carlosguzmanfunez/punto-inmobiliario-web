import Link from "next/link";
import { guides } from "@/data/guides";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

export default function GuideArticle({ slug }: { slug: string }) {
  const g = guides.find((x) => x.slug === slug);
  if (!g) {
    return (
      <section className="section container narrow center">
        <h1 className="h2">No encontramos esta guía</h1>
        <Link className="btn btn--primary" href="/guias">Ver todas las guías</Link>
      </section>
    );
  }
  const others = guides.filter((x) => x.slug !== g.slug).slice(0, 3);
  return (
    <>
      <article className="section container narrow prose guide">
        <nav className="crumbs"><Link href="/">Inicio</Link> / <Link href="/guias">Guías</Link></nav>
        <span className="eyebrow">{g.category} · {g.minutes} min de lectura</span>
        <h1 className="h2">{g.title}</h1>
        <p className="guide__lead">{g.summary}</p>
        <img className="guide__img" src={g.image} alt="" />
        {g.body.map((b, i) => (
          <div key={i}>
            {b.h && <h2 className="h3">{b.h}</h2>}
            {b.p && <p>{b.p}</p>}
            {b.list && <ul className="checklist">{b.list.map((x) => <li key={x}>{x}</li>)}</ul>}
          </div>
        ))}
        <div className="cta-band cta-band--light">
          <div><h2 className="h3">¿Tienes preguntas sobre tu caso?</h2><p>Un asesor te responde por WhatsApp sin compromiso.</p></div>
          <a className="btn btn--wa" target="_blank" rel="noopener noreferrer" href={whatsappLink(`Hola, leí la guía "${g.title}" y tengo una consulta.`)}><WhatsAppIcon size={18} /> Escribir</a>
        </div>
        <p className="muted small">Esta guía es informativa y no sustituye la asesoría de un abogado o notario.</p>
      </article>
      <section className="section section--tint">
        <div className="container">
          <h2>Otras guías</h2>
          <div className="guide-grid">
            {others.map((o) => (
              <Link key={o.slug} href={`/guias/${o.slug}`} className="guide-card">
                <img src={o.image} alt="" loading="lazy" />
                <div><span className="eyebrow">{o.category}</span><h3>{o.title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
