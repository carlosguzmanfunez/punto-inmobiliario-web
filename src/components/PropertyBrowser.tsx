"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { cities, typeLabel, type PropertyType } from "@/data/properties";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";

const categories: { label: string; tipo?: PropertyType; ciudad?: string; icon: string }[] = [
  { label: "Todas", icon: "🏘️" },
  { label: "Casas", tipo: "casa", icon: "🏡" },
  { label: "Apartamentos", tipo: "apartamento", icon: "🏢" },
  { label: "Terrenos", tipo: "terreno", icon: "🌳" },
  { label: "Locales", tipo: "local", icon: "🏬" },
  { label: "Playa", ciudad: "Roatán", icon: "🏝️" },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function PropertyBrowser() {
  const sp = useSearchParams();
  const router = useRouter();
  const { list } = useProperties();

  // El buscador de la portada manda operacion=terreno para la pestaña Terrenos.
  const rawOp = sp.get("operacion") ?? "";
  const operacion = rawOp === "terreno" ? "" : rawOp;
  const tipo = rawOp === "terreno" ? "terreno" : sp.get("tipo") ?? "";
  const ciudad = sp.get("ciudad") ?? "";
  const q = sp.get("q") ?? "";
  const hab = Number(sp.get("hab") ?? 0);

  const results = useMemo(() => (list ?? []).filter((p) =>
    (!operacion || p.operation === operacion) &&
    (!tipo || p.type === tipo) &&
    (!ciudad || p.city === ciudad) &&
    (!hab || p.bedrooms >= hab) &&
    (!q || norm(`${p.title} ${p.city} ${p.neighborhood}`).includes(norm(q)))
  ), [list, operacion, tipo, ciudad, q, hab]);

  const setParam = (k: string, v: string) => {
    const n = new URLSearchParams(sp.toString());
    if (k === "tipo" && rawOp === "terreno") n.delete("operacion");
    if (v) n.set(k, v); else n.delete(k);
    router.replace(`/propiedades${n.size ? `?${n}` : ""}`, { scroll: false });
  };

  const catHref = (c: (typeof categories)[number]) => {
    const n = new URLSearchParams();
    if (operacion) n.set("operacion", operacion);
    if (c.tipo) n.set("tipo", c.tipo);
    if (c.ciudad) n.set("ciudad", c.ciudad);
    return `/propiedades${n.size ? `?${n}` : ""}`;
  };
  const catActive = (c: (typeof categories)[number]) => (c.tipo ?? "") === tipo && (c.ciudad ? c.ciudad === ciudad : !c.tipo ? !ciudad : true);

  return (
    <>
      <div className="category-bar">
        <div className="container category-bar__inner">
          {categories.map((c) => (
            <Link key={c.label} href={catHref(c)} className={`category${catActive(c) ? " is-active" : ""}`}>
              <span className="category__icon" aria-hidden>{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <section className="section container">
        <div className="filters">
          <select aria-label="Operación" value={operacion} onChange={(e) => setParam("operacion", e.target.value)}>
            <option value="">Comprar o alquilar</option>
            <option value="venta">En venta</option>
            <option value="alquiler">En alquiler</option>
          </select>
          <select aria-label="Tipo" value={tipo} onChange={(e) => setParam("tipo", e.target.value)}>
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select aria-label="Ciudad" value={ciudad} onChange={(e) => setParam("ciudad", e.target.value)}>
            <option value="">Todas las ciudades</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Habitaciones" value={hab || ""} onChange={(e) => setParam("hab", e.target.value)}>
            <option value="">Habitaciones</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ hab.</option>)}
          </select>
          <input type="search" placeholder="Colonia o palabra clave" defaultValue={q}
            onKeyDown={(e) => { if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value); }}
            onBlur={(e) => e.target.value !== q && setParam("q", e.target.value)} aria-label="Buscar" />
        </div>
        <div className="section__head">
          <div>
            <h1 className="h2">Propiedades en Honduras</h1>
            <p className="muted">{list ? `${results.length} ${results.length === 1 ? "propiedad disponible" : "propiedades disponibles"}` : "Cargando…"}</p>
          </div>
        </div>
        {list && results.length === 0 ? (
          <div className="empty">
            <p>No encontramos propiedades con esos filtros.</p>
            <Link className="btn btn--outline" href="/propiedades">Ver todas</Link>
          </div>
        ) : (
          <div className="grid-cards">
            {list ? results.map((p) => <PropertyCard key={p.id} p={p} />) : Array.from({ length: 4 }, (_, i) => <div key={i} className="card-skeleton" />)}
          </div>
        )}
      </section>
    </>
  );
}
