"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Seller } from "@/lib/backend";
import { formatLempiras, plans, whatsappTo } from "@/lib/site";
import { useAuth } from "./AuthProvider";
import { useProperties } from "./useProperties";
import PropertyCard from "./PropertyCard";
import { BuildingIcon, CheckIcon, WhatsAppIcon } from "./Icons";

// Directorio público de vendedores con vitrina vigente y sus propiedades.
export default function ProjectsPage() {
  const { backend } = useAuth();
  const { list } = useProperties();
  const [sellers, setSellers] = useState<Seller[] | null>(null);
  useEffect(() => { backend.listVitrinas().then(setSellers).catch(() => setSellers([])); }, [backend]);
  const preventa = (list ?? []).filter((p) => p.features.some((f) => /preventa|proyecto|entrega/i.test(f)));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow"><BuildingIcon size={16} /> Proyectos</span>
          <h1>Proyectos y desarrolladores</h1>
          <p>Constructoras, desarrolladores y vendedores con su propia vitrina en Punto Inmobiliario. Conoce sus proyectos y escríbeles directo.</p>
        </div>
      </section>
      <section className="section container">
        {!sellers ? <div className="card-skeleton" style={{ height: 220, aspectRatio: "auto" }} /> : sellers.length === 0 ? (
          <div className="empty"><p>Pronto verás aquí a las constructoras de Honduras.</p></div>
        ) : (
          <div className="seller-list">
            {sellers.map((s) => {
              const mine = (list ?? []).filter((p) => p.ownerId === s.id);
              return (
                <article key={s.id} className="seller-row">
                  <div className="seller-row__head">
                    <div className="seller-chip__logo seller-chip__logo--lg">{s.logo ? <img src={s.logo} alt="" /> : s.name.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <h2 className="h3"><Link href={`/vendedores/${s.slug}`}>{s.name}</Link></h2>
                      <p className="muted small">{s.city || "Honduras"} · {mine.length} {mine.length === 1 ? "propiedad" : "propiedades"} publicadas</p>
                      {s.bio && <p className="muted">{s.bio}</p>}
                    </div>
                    <div className="seller-row__actions">
                      <Link className="btn btn--primary btn--sm" href={`/vendedores/${s.slug}`}>Ver vitrina</Link>
                      {s.whatsapp && <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappTo(s.whatsapp, `Hola ${s.name}, vi sus proyectos en Punto Inmobiliario Hn y quisiera información.`)}><WhatsAppIcon size={16} /> WhatsApp</a>}
                    </div>
                  </div>
                  {mine.length > 0 && <div className="grid-cards grid-cards--row">{mine.slice(0, 4).map((p) => <PropertyCard key={p.id} p={p} />)}</div>}
                </article>
              );
            })}
          </div>
        )}
      </section>
      {preventa.length > 0 && (
        <section className="section section--tint">
          <div className="container">
            <h2>Preventa y proyectos en construcción</h2>
            <div className="grid-cards">{preventa.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}
      <section className="section container">
        <div className="cta-band cta-band--light">
          <div>
            <h2>Abre la vitrina de tu constructora</h2>
            <ul className="inline-checks">
              {["Página con tu logo y descripción", "Todos tus proyectos en un solo link", "Consultas directo a tu WhatsApp"].map((t) => <li key={t}><CheckIcon size={16} /> {t}</li>)}
            </ul>
            <p>Desde {formatLempiras(plans.vitrina.price)} cada {plans.vitrina.days} días.</p>
          </div>
          <Link className="btn btn--primary btn--lg" href="/ingresar?modo=registro&tipo=vendedor">Crear mi vitrina</Link>
        </div>
      </section>
    </>
  );
}
