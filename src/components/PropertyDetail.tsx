"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, isLive, listingStatusLabel, propertyCode, typeLabel, type Property } from "@/data/properties";
import { departmentOf } from "@/data/geo";
import { vitrinaActive, type Seller } from "@/lib/backend";
import { formatDate } from "@/lib/labels";
import { formatMoney, priceIn } from "@/lib/money";
import { site, whatsappLink, whatsappTo } from "@/lib/site";
import ShareBox from "./ShareBox";
import { useAuth } from "./AuthProvider";
import FavoriteButton from "./FavoriteButton";
import InquiryForm from "./InquiryForm";
import Gallery from "./Gallery";
import MortgageCalc from "./MortgageCalc";
import Price from "./Price";
import PropertyCard from "./PropertyCard";
import { CompareButton } from "./Compare";
import { useProperties } from "./useProperties";
import { AreaIcon, BathIcon, BedIcon, CarIcon, CheckIcon, GlobeIcon, MapIcon, PinIcon, PrintIcon, WhatsAppIcon } from "./Icons";

export default function PropertyDetail({ slug }: { slug: string }) {
  const { backend, profile, settings } = useAuth();
  const { list } = useProperties();
  const [p, setP] = useState<Property | null | undefined>(undefined);
  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    let alive = true;
    setP(undefined); setSeller(null);
    backend.getProperty(slug).then((x) => {
      if (!alive) return;
      setP(x);
      if (x?.ownerId) backend.getSeller(x.ownerId).then((s) => alive && setSeller(s)).catch(() => {});
      if (x && isLive(x)) backend.recordView(x.id).catch(() => {});
    });
    return () => { alive = false; };
  }, [backend, slug]);

  useEffect(() => { if (p) document.title = `${p.title} | ${site.name}`; }, [p]);

  if (p === undefined) return <div className="container detail"><div className="card-skeleton" style={{ height: 380, aspectRatio: "auto" }} /></div>;
  if (p === null) {
    return (
      <section className="section container narrow center">
        <h1 className="h2">No encontramos esta propiedad</h1>
        <p className="muted">Puede que ya se haya vendido o alquilado. Te mostramos otras opciones parecidas.</p>
        <Link className="btn btn--primary" href="/propiedades">Ver otras propiedades</Link>
      </section>
    );
  }

  const code = propertyCode(p);
  const dep = p.department || departmentOf(p.city);
  const msg = `Hola, me interesa la propiedad ${code}: "${p.title}" (${formatPrice(p)}). ¿Sigue disponible?`;
  // En las publicaciones de vendedores, el comprador escribe directo al vendedor.
  const sellerWa = seller?.whatsapp && seller.whatsapp.replace(/\D/g, "").length >= 8;
  const waHref = sellerWa ? whatsappTo(seller!.whatsapp, `${msg} La vi en Punto Inmobiliario Hn.`) : whatsappLink(msg);
  const isOwner = !!profile && profile.id === p.ownerId;
  const live = isLive(p);
  const area = p.areaM2 || p.lotM2 || 0;
  const perM2 = p.operation === "venta" && area > 0 ? formatMoney(p.price / area, p.currency) : "";
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.neighborhood}, ${p.city}, Honduras`)}`;
  // Similares: misma operación primero, luego mismo tipo, misma ciudad y precio parecido.
  const score = (x: Property) => (x.operation === p.operation ? 8 : 0) + (x.type === p.type ? 4 : 0) + (x.city === p.city ? 2 : 0)
    + (x.currency === p.currency && Math.abs(x.price - p.price) <= p.price * 0.4 ? 1 : 0);
  const similar = (list ?? []).filter((x) => x.id !== p.id && x.operation === p.operation && (x.city === p.city || x.type === p.type || score(x) >= 9))
    .sort((a, b) => score(b) - score(a)).slice(0, 4);

  const details: [string, string][] = [
    ["Código", code],
    ["Tipo", typeLabel[p.type]],
    ["Operación", p.operation === "venta" ? "Venta" : "Alquiler"],
    ["Precio", `${formatMoney(p.price, p.currency)}${p.operation === "alquiler" ? " /mes" : ""}`],
    [p.currency === "USD" ? "Equivale a" : "En dólares", `${formatMoney(priceIn(p, p.currency === "USD" ? "HNL" : "USD", settings.usdRate), p.currency === "USD" ? "HNL" : "USD")} aprox.`],
    ...(p.bedrooms ? [["Habitaciones", String(p.bedrooms)] as [string, string]] : []),
    ...(p.bathrooms ? [["Baños", String(p.bathrooms)] as [string, string]] : []),
    ...(p.parking ? [["Parqueos", String(p.parking)] as [string, string]] : []),
    ...(p.areaM2 ? [["Construcción", `${p.areaM2.toLocaleString("es-HN")} m²`] as [string, string]] : []),
    ...(p.lotM2 ? [["Terreno", `${p.lotM2.toLocaleString("es-HN")} m² (${Math.round(p.lotM2 / 0.698896).toLocaleString("es-HN")} vrs²)`] as [string, string]] : []),
    ...(perM2 ? [["Precio por m²", perM2] as [string, string]] : []),
    ["Colonia o zona", p.neighborhood],
    ["Ciudad", p.city],
    ...(dep ? [["Departamento", dep] as [string, string]] : []),
    ...(p.createdAt ? [["Publicada", formatDate(p.createdAt)] as [string, string]] : []),
  ];

  return (
    <>
      <div className="container detail">
        {!live && (
          <div className="notice">
            {isOwner ? <>Vista previa: esta publicación está en estado <strong>{p.status === "publicada" ? "vencida" : listingStatusLabel[p.status ?? "borrador"].toLowerCase()}</strong> y los compradores todavía no la ven. <Link href="/panel?tab=propiedades">Publicarla desde mi panel</Link></>
              : "Esta propiedad no está visible en el sitio. Solo tú puedes verla."}
          </div>
        )}
        <nav className="crumbs" aria-label="Ruta">
          <Link href="/">Inicio</Link> / <Link href="/propiedades">Propiedades</Link>
          {dep && <> / <Link href={`/propiedades?depto=${encodeURIComponent(dep)}`}>{dep}</Link></>}
          {" "}/ <Link href={`/propiedades?ciudad=${encodeURIComponent(p.city)}${dep ? `&depto=${encodeURIComponent(dep)}` : ""}`}>{p.city}</Link>
        </nav>
        <div className="detail__head">
          <div>
            <div className="detail__tags">
              <span className={`badge badge--${p.operation} badge--solid`}>{p.operation === "venta" ? "En venta" : "En alquiler"}</span>
              {p.featured && <span className="badge badge--accent">Destacada</span>}
              <span className="badge badge--line">{code}</span>
            </div>
            <h1 className="detail__title">{p.title}</h1>
            <p className="detail__loc"><PinIcon size={16} /> {p.neighborhood}, {p.city}{dep ? `, ${dep}` : ""}</p>
          </div>
          <div className="detail__tools">
            <FavoriteButton id={p.id} className="btn btn--ghost btn--sm fav-inline" label />
            <CompareButton id={p.id} className="btn btn--ghost btn--sm" label />
            <button type="button" className="btn btn--ghost btn--sm hide-mobile" onClick={() => print()}><PrintIcon size={16} /> Imprimir</button>
            {profile?.role === "admin" && <Link className="btn btn--outline btn--sm" href={`/admin/propiedad?id=${p.id}`}>Editar</Link>}
            {isOwner && profile?.role !== "admin" && <Link className="btn btn--outline btn--sm" href={`/panel/propiedad?id=${p.id}`}>Editar</Link>}
          </div>
        </div>

        <Gallery images={p.images} title={p.title} />

        <div className="detail__layout">
          <div className="detail__main">
            <div className="detail__facts">
              <span className="fact"><strong>{typeLabel[p.type]}</strong> {p.operation === "venta" ? "en venta" : "en alquiler"}</span>
              {p.bedrooms > 0 && <span className="fact"><BedIcon /> {p.bedrooms} {p.bedrooms === 1 ? "habitación" : "habitaciones"}</span>}
              {p.bathrooms > 0 && <span className="fact"><BathIcon /> {p.bathrooms} {p.bathrooms === 1 ? "baño" : "baños"}</span>}
              {p.parking > 0 && <span className="fact"><CarIcon /> {p.parking} parqueos</span>}
              {p.areaM2 > 0 && <span className="fact"><AreaIcon /> {p.areaM2.toLocaleString("es-HN")} m²</span>}
              {p.lotM2 ? <span className="fact"><AreaIcon /> {p.lotM2.toLocaleString("es-HN")} m² de terreno</span> : null}
            </div>
            <hr />
            <h2 className="h3">Descripción</h2>
            <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>
            {p.features.length > 0 && <>
              <hr />
              <h2 className="h3">Lo que incluye</h2>
              <ul className="features">{p.features.map((f) => <li key={f}><CheckIcon size={16} /> {f}</li>)}</ul>
            </>}
            <hr />
            <h2 className="h3">Detalles</h2>
            <dl className="details-grid">
              {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <hr />
            <h2 className="h3">Ubicación</h2>
            <div className="location">
              <span className="location__icon"><MapIcon size={26} /></span>
              <div>
                <p><strong>{p.neighborhood}</strong>, {p.city}{dep ? `, ${dep}` : ""}, Honduras</p>
                <p className="muted small">Por seguridad, la dirección exacta se comparte al confirmar la visita.</p>
              </div>
              <a className="btn btn--outline btn--sm" href={mapsHref} target="_blank" rel="noopener noreferrer">Ver zona en Google Maps</a>
            </div>
            {p.operation === "venta" && <>
              <hr />
              <h2 className="h3" id="cuota">Calcula tu cuota</h2>
              <MortgageCalc price={p.price} currency={p.currency} compact />
              <p className="small"><Link className="link-arrow" href="/financiamiento">Ver opciones de financiamiento →</Link></p>
            </>}
            <div className="abroad-callout">
              <GlobeIcon size={24} />
              <div>
                <strong>¿Vives fuera de Honduras?</strong>
                <p className="muted small">Te hacemos el recorrido por videollamada y te acompañamos con la firma a distancia.</p>
              </div>
              <Link className="link-arrow" href="/extranjero">Cómo funciona →</Link>
            </div>
          </div>
          <aside className="book-card" id="contacto">
            <Price p={p} alt className="book-card__price" />
            <p className="muted small">{p.operation === "alquiler" ? "Renta mensual publicada. Consulta depósito y plazo mínimo." : "Precio publicado. Pregunta por opciones de financiamiento."}</p>
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
            <div className="or"><span>o agenda una visita</span></div>
            <InquiryForm propertyId={p.id} visit context={`Código ${code}`} defaultMessage={`Hola, me interesa "${p.title}". ¿Podemos agendar una visita?`} />
            {live && <ShareBox path={`/propiedades/${p.slug}`} title={p.title} message={`Mira esta propiedad en Punto Inmobiliario Hn: ${p.title} (${formatPrice(p)})`} />}
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section section--tint">
          <div className="container">
            <div className="section__head"><h2>Propiedades similares</h2><Link className="link-arrow" href={`/propiedades?tipo=${p.type}`}>Ver más →</Link></div>
            <div className="grid-cards">{similar.map((x) => <PropertyCard key={x.id} p={x} />)}</div>
          </div>
        </section>
      )}

      <div className="detail-mobilebar">
        <Price p={p} className="detail-mobilebar__price" />
        <a className="btn btn--wa" href={waHref} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> WhatsApp</a>
        <a className="btn btn--outline" href="#contacto">Visita</a>
      </div>
    </>
  );
}
