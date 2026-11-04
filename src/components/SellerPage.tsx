"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type Property } from "@/data/properties";
import { vitrinaActive, type Seller } from "@/lib/backend";
import { whatsappTo } from "@/lib/site";
import { useAuth } from "./AuthProvider";
import { PinIcon, WhatsAppIcon } from "./Icons";
import PropertyCard from "./PropertyCard";
import ShareBox from "./ShareBox";

type Filter = "todas" | "venta" | "alquiler" | "terreno";
const filters: { key: Filter; label: string; match: (p: Property) => boolean }[] = [
  { key: "todas", label: "Todas", match: () => true },
  { key: "venta", label: "En venta", match: (p) => p.operation === "venta" && p.type !== "terreno" },
  { key: "alquiler", label: "En alquiler", match: (p) => p.operation === "alquiler" },
  { key: "terreno", label: "Terrenos", match: (p) => p.type === "terreno" },
];

// Vitrina del vendedor: su página dentro de Punto Inmobiliario con todas sus propiedades.
export default function SellerPage({ slug }: { slug: string }) {
  const { backend, profile } = useAuth();
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);
  const [list, setList] = useState<Property[]>([]);
  const [filter, setFilter] = useState<Filter>("todas");

  useEffect(() => {
    let alive = true;
    backend.getSellerBySlug(slug).then(async (s) => {
      if (!alive) return;
      setSeller(s);
      if (s) { const l = await backend.listProperties({ ownerId: s.id }); if (alive) setList(l); }
    });
    return () => { alive = false; };
  }, [backend, slug]);

  if (seller === undefined) return <div className="container section"><div className="card-skeleton" style={{ height: 260 }} /></div>;
  const isOwner = !!profile && (profile.id === seller?.id || profile.role === "admin");
  if (!seller || (!vitrinaActive(seller) && !isOwner)) {
    return (
      <section className="section container narrow center">
        <h1 className="h2">Esta vitrina no está disponible</h1>
        <p className="muted">Puede que el vendedor la haya desactivado. Mira todas las propiedades disponibles.</p>
        <Link className="btn btn--primary" href="/propiedades">Ver propiedades</Link>
      </section>
    );
  }

  const live = isOwner ? list.filter((p) => p.status === "publicada") : list;
  const shown = live.filter(filters.find((f) => f.key === filter)!.match);
  const counts = Object.fromEntries(filters.map((f) => [f.key, live.filter(f.match).length]));

  return (
    <>
      {!vitrinaActive(seller) && <div className="container"><div className="notice" style={{ marginTop: 16 }}>Vista previa: tu vitrina está inactiva y los compradores no la ven. <Link href="/panel?tab=vitrina">Activarla</Link></div></div>}
      <section className="vitrina-hero">
        <div className="container vitrina-hero__inner">
          <div className="vitrina-hero__logo">{seller.logo ? <img src={seller.logo} alt={`Logo de ${seller.name}`} /> : seller.name.slice(0, 1).toUpperCase()}</div>
          <div className="vitrina-hero__text">
            <span className="eyebrow">Vitrina verificada</span>
            <h1>{seller.name}</h1>
            {seller.city && <p className="detail__loc"><PinIcon size={16} /> {seller.city}</p>}
            {seller.bio && <p className="vitrina-hero__bio">{seller.bio}</p>}
            <div className="vitrina-hero__actions">
              {seller.whatsapp && <a className="btn btn--wa" href={whatsappTo(seller.whatsapp, `Hola ${seller.name}, vi su vitrina en Punto Inmobiliario Hn y quiero más información.`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> Escribir por WhatsApp</a>}
              <span className="muted small">{live.length} {live.length === 1 ? "propiedad disponible" : "propiedades disponibles"}</span>
            </div>
          </div>
          <div className="vitrina-hero__share"><ShareBox path={`/vendedores/${seller.slug}`} title={seller.name} message={`Conoce los proyectos de ${seller.name}`} /></div>
        </div>
      </section>
      <section className="section container">
        <div className="seg">
          {filters.filter((f) => f.key === "todas" || counts[f.key] > 0).map((f) => (
            <button key={f.key} className={filter === f.key ? "is-active" : ""} onClick={() => setFilter(f.key)}>{f.label} <span className="count">{counts[f.key]}</span></button>
          ))}
        </div>
        {shown.length ? <div className="grid-cards">{shown.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          : <div className="empty"><p>Este vendedor no tiene propiedades activas en este momento.</p></div>}
      </section>
    </>
  );
}
