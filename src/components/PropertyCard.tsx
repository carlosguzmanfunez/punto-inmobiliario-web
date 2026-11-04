import Link from "next/link";
import { formatPrice, typeLabel, type Property } from "@/data/properties";
import { AreaIcon, BathIcon, BedIcon } from "./Icons";
import FavoriteButton from "./FavoriteButton";

// Tarjeta estilo Airbnb: foto grande con esquinas redondeadas, carrusel deslizable
// (scroll-snap), etiquetas y datos clave debajo.
export default function PropertyCard({ p }: { p: Property }) {
  const href = `/propiedades/${p.slug}`;
  const images = p.images.length ? p.images : ["/img/casa-1.svg"];
  return (
    <article className="card">
      <div className="card__media">
        <div className="card__slides" tabIndex={0} aria-label={`Fotos de ${p.title}`}>
          {images.map((src, i) => (
            <Link key={src + i} href={href} className="card__slide">
              <img src={src} alt={`${p.title}, foto ${i + 1}`} loading="lazy" />
            </Link>
          ))}
        </div>
        <div className="card__badges">
          <span className="badge">{p.operation === "venta" ? "En venta" : "En alquiler"}</span>
          {p.isNew && <span className="badge badge--accent">Nuevo</span>}
        </div>
        <FavoriteButton id={p.id} />
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
          {p.bathrooms > 0 && <span><BathIcon size={15} /> {p.bathrooms} baños</span>}
          <span><AreaIcon size={15} /> {p.areaM2 > 0 ? `${p.areaM2} m²` : `${p.lotM2?.toLocaleString("es-HN")} m² de terreno`}</span>
        </p>
        <p className="card__price">{formatPrice(p)}</p>
      </Link>
    </article>
  );
}
