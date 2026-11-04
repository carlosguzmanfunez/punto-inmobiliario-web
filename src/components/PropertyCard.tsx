import Link from "next/link";
import { typeLabel, type Property } from "@/data/properties";
import { AreaIcon, BathIcon, BedIcon, CalendarIcon, CarIcon, CheckIcon } from "./Icons";
import FavoriteButton from "./FavoriteButton";
import Price from "./Price";
import { CompareButton } from "./Compare";

// Tarjeta estilo Airbnb: foto grande con esquinas redondeadas, carrusel deslizable
// (scroll-snap), etiquetas y datos clave debajo.
export default function PropertyCard({ p, layout = "grid" }: { p: Property; layout?: "grid" | "list" }) {
  const href = `/propiedades/${p.slug}`;
  const images = p.images.length ? p.images : ["/img/casa-1.svg"];
  const furnished = p.features.some((f) => f.toLowerCase() === "amueblado");
  const list = layout === "list";
  return (
    <article className={`card${layout === "list" ? " card--list" : ""}`}>
      <div className="card__media">
        <div className="card__slides" tabIndex={0} aria-label={`Fotos de ${p.title}`}>
          {images.map((src, i) => (
            <Link key={src + i} href={href} className="card__slide">
              <img src={src} alt={`${p.title}, foto ${i + 1}`} loading="lazy" />
            </Link>
          ))}
        </div>
        <div className="card__badges">
          <span className={`badge badge--${p.operation}`}>{p.operation === "venta" ? "Venta" : "Alquiler"}</span>
          {p.featured && <span className="badge badge--accent">Destacada</span>}
          {!p.featured && p.isNew && <span className="badge badge--new">Nuevo</span>}
          {furnished && <span className="badge">Amueblado</span>}
        </div>
        <FavoriteButton id={p.id} />
        <CompareButton id={p.id} className="card__compare" />
        {images.length > 1 && (
          <div className="card__dots" aria-hidden>
            {images.map((_, i) => <span key={i} />)}
          </div>
        )}
      </div>
      <Link href={href} className="card__body">
        <div className="card__row">
          <h3 className="card__place">{p.neighborhood}, {p.city}</h3>
          <span className="card__type">{typeLabel[p.type]}</span>
        </div>
        <p className="card__title">{p.title}</p>
        <p className="card__facts">
          {p.bedrooms > 0 && <span><BedIcon size={15} /> {p.bedrooms} hab.</span>}
          {p.bathrooms > 0 && <span><BathIcon size={15} /> {p.bathrooms} {p.bathrooms === 1 ? "baño" : "baños"}</span>}
          {p.parking > 0 && <span><CarIcon size={15} /> {p.parking}</span>}
          <span><AreaIcon size={15} /> {p.areaM2 > 0 ? `${p.areaM2.toLocaleString("es-HN")} m²` : `${p.lotM2?.toLocaleString("es-HN") ?? 0} m² de terreno`}</span>
        </p>
        {list && <p className="card__desc">{p.description}</p>}
        {list && p.features.length > 0 && (
          <ul className="card__features">{p.features.slice(0, 4).map((f) => <li key={f}><CheckIcon size={13} /> {f}</li>)}</ul>
        )}
        <Price p={p} className="card__price" />
      </Link>
      {list && (
        <div className="card__actions">
          <Link className="btn btn--primary btn--sm" href={href}>Ver detalles</Link>
          <Link className="btn btn--outline btn--sm" href={`${href}#contacto`}><CalendarIcon size={15} /> Agendar visita</Link>
        </div>
      )}
    </article>
  );
}
