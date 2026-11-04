"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, isLive, listingStatusLabel, typeLabel, type Property } from "@/data/properties";
import { vitrinaActive, type Seller } from "@/lib/backend";
import { whatsappLink, whatsappTo } from "@/lib/site";
import ShareBox from "./ShareBox";
import { useAuth } from "./AuthProvider";
import FavoriteButton from "./FavoriteButton";
import InquiryForm from "./InquiryForm";
import { AreaIcon, BathIcon, BedIcon, PinIcon, WhatsAppIcon } from "./Icons";

export default function PropertyDetail({ slug }: { slug: string }) {
  const { backend, profile } = useAuth();
  const [p, setP] = useState<Property | null | undefined>(undefined);
  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getProperty(slug).then((x) => {
      if (!alive) return;
      setP(x);
      if (x?.ownerId) backend.getSeller(x.ownerId).then((s) => alive && setSeller(s)).catch(() => {});
      if (x && isLive(x)) backend.recordView(x.id).catch(() => {});
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
  // En las publicaciones de vendedores, el comprador escribe directo al vendedor.
  const waHref = seller?.whatsapp && seller.whatsapp.replace(/\D/g, "").length >= 8 ? whatsappTo(seller.whatsapp, `${msg} La vi en Punto Inmobiliario Hn.`) : whatsappLink(msg);
  const isOwner = !!profile && profile.id === p.ownerId;
  const live = isLive(p);

  return (
    <div className="container detail">
      {!live && (
        <div className="notice">
          {isOwner ? <>Vista previa: esta publicación está en estado <strong>{p.status === "publicada" ? "vencida" : listingStatusLabel[p.status ?? "borrador"].toLowerCase()}</strong> y los compradores todavía no la ven. <Link href="/panel?tab=propiedades">Publicarla desde mi panel</Link></>
            : "Esta propiedad no está visible en el sitio. Solo tú puedes verla."}
        </div>
      )}
      <nav className="crumbs"><Link href="/propiedades">Propiedades</Link> / <Link href={`/propiedades?ciudad=${encodeURIComponent(p.city)}`}>{p.city}</Link></nav>
      <div className="detail__head">
        <div>
          <h1 className="detail__title">{p.title}</h1>
          <p className="detail__loc"><PinIcon size={16} /> {p.neighborhood}, {p.city}</p>
        </div>
        <div className="detail__tools">
          <FavoriteButton id={p.id} className="btn btn--ghost btn--sm fav-inline" label />
          {profile?.role === "admin" && <Link className="btn btn--outline btn--sm" href={`/admin/propiedad?id=${p.id}`}>Editar</Link>}
          {isOwner && profile?.role !== "admin" && <Link className="btn btn--outline btn--sm" href={`/panel/propiedad?id=${p.id}`}>Editar</Link>}
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
          {seller && (
            <div className="seller-chip">
              <div className="seller-chip__logo">{seller.logo ? <img src={seller.logo} alt="" /> : seller.name.slice(0, 1).toUpperCase()}</div>
              <div><span className="muted small">Publicado por</span><br />
                {vitrinaActive(seller) ? <Link href={`/vendedores/${seller.slug}`} className="seller-chip__name">{seller.name}</Link> : <strong>{seller.name}</strong>}
              </div>
            </div>
          )}
          <a className="btn btn--wa btn--block" href={waHref} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={20} /> Consultar por WhatsApp
          </a>
          <div className="or"><span>o déjanos tus datos</span></div>
          <InquiryForm propertyId={p.id} defaultMessage="Hola, me interesa esta propiedad. ¿Podemos agendar una visita?" />
          {live && <ShareBox path={`/propiedades/${p.slug}`} title={p.title} message={`Mira esta propiedad: ${p.title} (${formatPrice(p)})`} />}
        </aside>
      </div>
    </div>
  );
}
