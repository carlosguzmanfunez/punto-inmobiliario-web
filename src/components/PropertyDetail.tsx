"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, typeLabel, type Property } from "@/data/properties";
import { whatsappLink } from "@/lib/site";
import { useAuth } from "./AuthProvider";
import FavoriteButton from "./FavoriteButton";
import InquiryForm from "./InquiryForm";
import { AreaIcon, BathIcon, BedIcon, PinIcon, WhatsAppIcon } from "./Icons";

export default function PropertyDetail({ slug }: { slug: string }) {
  const { backend, profile } = useAuth();
  const [p, setP] = useState<Property | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    backend.getProperty(slug).then((x) => {
      if (!alive) return;
      setP(x);
      if (x) backend.recordView(x.id).catch(() => {});
    });
    return () => { alive = false; };
  }, [backend, slug]);

  if (p === undefined) return <div className="container detail"><div className="card-skeleton" style={{ height: 380 }} /></div>;
  if (p === null) {
    return (
      <section className="section container narrow center">
        <h1 className="h2">No encontramos esta propiedad</h1>
        <p className="muted">Puede que ya se haya vendido o alquilado.</p>
        <Link className="btn btn--primary" href="/propiedades">Ver otras propiedades</Link>
      </section>
    );
  }

  const imgs = p.images.length ? p.images : ["/img/casa-1.svg"];
  const gallery = [...imgs, ...imgs, ...imgs].slice(0, Math.min(5, Math.max(imgs.length, 1)));
  const msg = `Hola, me interesa la propiedad "${p.title}" (${formatPrice(p)}). ¿Sigue disponible?`;

  return (
    <div className="container detail">
      {p.published === false && <div className="notice">Esta propiedad está oculta. Solo los administradores pueden verla.</div>}
      <nav className="crumbs"><Link href="/propiedades">Propiedades</Link> / <Link href={`/propiedades?ciudad=${encodeURIComponent(p.city)}`}>{p.city}</Link></nav>
      <div className="detail__head">
        <div>
          <h1 className="detail__title">{p.title}</h1>
          <p className="detail__loc"><PinIcon size={16} /> {p.neighborhood}, {p.city}</p>
        </div>
        <div className="detail__tools">
          <FavoriteButton id={p.id} className="btn btn--ghost btn--sm fav-inline" label />
          {profile?.role === "admin" && <Link className="btn btn--outline btn--sm" href={`/admin/propiedad?id=${p.id}`}>Editar</Link>}
        </div>
      </div>

      <div className={`gallery gallery--${gallery.length}`}>
        {gallery.map((src, i) => <img key={i} src={src} alt={`${p.title}, foto ${i + 1}`} />)}
      </div>

      <div className="detail__layout">
        <div>
          <div className="detail__facts">
            <span className="fact"><strong>{typeLabel[p.type]}</strong> {p.operation === "venta" ? "en venta" : "en alquiler"}</span>
            {p.bedrooms > 0 && <span className="fact"><BedIcon /> {p.bedrooms} habitaciones</span>}
            {p.bathrooms > 0 && <span className="fact"><BathIcon /> {p.bathrooms} baños</span>}
            {p.areaM2 > 0 && <span className="fact"><AreaIcon /> {p.areaM2} m² de construcción</span>}
            {p.lotM2 ? <span className="fact"><AreaIcon /> {p.lotM2.toLocaleString("es-HN")} m² de terreno</span> : null}
          </div>
          <hr />
          <h2 className="h3">Descripción</h2>
          <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
          {p.features.length > 0 && <>
            <hr />
            <h2 className="h3">Lo que ofrece esta propiedad</h2>
            <ul className="features">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
          </>}
        </div>
        <aside className="book-card">
          <p className="book-card__price">{formatPrice(p)}</p>
          <p className="muted small">Precio publicado. Consulta disponibilidad y opciones de financiamiento.</p>
          <a className="btn btn--wa btn--block" href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> Consultar por WhatsApp
          </a>
          <div className="or"><span>o déjanos tus datos</span></div>
          <InquiryForm propertyId={p.id} defaultMessage="Hola, me interesa esta propiedad. ¿Podemos agendar una visita?" />
        </aside>
      </div>
    </div>
  );
}
