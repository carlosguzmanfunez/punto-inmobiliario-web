"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { amenities, propertyCode, typePlural, type Property, type PropertyType } from "@/data/properties";
import { citiesByDepartment, departmentOf, departments } from "@/data/geo";
import { priceIn } from "@/lib/money";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";
import { useAuth } from "./AuthProvider";
import { budgetLabel, budgets } from "./HeroSearch";
import { BellIcon, CheckIcon, CloseIcon, FilterIcon } from "./Icons";

const categories: { label: string; tipo?: PropertyType; am?: string; icon: string }[] = [
  { label: "Todas", icon: "🏘️" },
  { label: "Casas", tipo: "casa", icon: "🏡" },
  { label: "Apartamentos", tipo: "apartamento", icon: "🏢" },
  { label: "Terrenos", tipo: "terreno", icon: "🌳" },
  { label: "Locales", tipo: "local", icon: "🏬" },
  { label: "Oficinas", tipo: "oficina", icon: "💼" },
  { label: "Bodegas", tipo: "bodega", icon: "🏭" },
  { label: "Frente al mar", am: "Frente al mar", icon: "🏝️" },
  { label: "Amuebladas", am: "Amueblado", icon: "🛋️" },
];

const sorts = [
  ["", "Recomendadas"], ["recientes", "Más recientes"], ["precio-asc", "Precio: menor a mayor"],
  ["precio-desc", "Precio: mayor a menor"], ["area", "Más espacio"],
] as const;

const PER_PAGE = 12;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const depOf = (p: Property) => p.department || departmentOf(p.city);

export function searchTitle(sp: URLSearchParams) {
  const tipo = sp.get("tipo") as PropertyType | null;
  const op = sp.get("operacion");
  const where = sp.get("ciudad") || sp.get("depto");
  return `${tipo && typePlural[tipo] ? typePlural[tipo] : "Propiedades"}${op === "venta" ? " en venta" : op === "alquiler" ? " en alquiler" : ""} en ${where || "Honduras"}`;
}

export default function PropertyBrowser() {
  const sp = useSearchParams();
  const router = useRouter();
  const { list } = useProperties();
  const { backend, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // La pestaña "Terrenos" antigua mandaba operacion=terreno.
  const rawOp = sp.get("operacion") ?? "";
  const operacion = rawOp === "terreno" ? "" : rawOp;
  const tipo = rawOp === "terreno" ? "terreno" : sp.get("tipo") ?? "";
  const depto = sp.get("depto") ?? "";
  const ciudad = sp.get("ciudad") ?? "";
  const q = sp.get("q") ?? "";
  const hab = Number(sp.get("hab") ?? 0);
  const banos = Number(sp.get("banos") ?? 0);
  const pmin = Number(sp.get("pmin") ?? 0);
  const pmax = Number(sp.get("pmax") ?? 0);
  const am = (sp.get("am") ?? "").split(",").filter(Boolean);
  const orden = sp.get("orden") ?? "";
  const vista = sp.get("vista") === "lista" ? "list" : "grid";
  const page = Math.max(1, Number(sp.get("pag") ?? 1));

  const results = useMemo(() => {
    const r = (list ?? []).filter((p) => {
      const hnl = priceIn(p, "HNL");
      const feats = p.features.map(norm);
      return (!operacion || p.operation === operacion) &&
        (!tipo || p.type === tipo) &&
        (!depto || depOf(p) === depto) &&
        (!ciudad || p.city === ciudad) &&
        (!hab || p.bedrooms >= hab) &&
        (!banos || p.bathrooms >= banos) &&
        (!pmin || hnl >= pmin) && (!pmax || hnl <= pmax) &&
        am.every((a) => feats.includes(norm(a))) &&
        (!q || norm(`${p.title} ${p.city} ${p.neighborhood} ${depOf(p)} ${p.description} ${propertyCode(p)}`).includes(norm(q)));
    });
    const by: Record<string, (a: Property, b: Property) => number> = {
      recientes: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      "precio-asc": (a, b) => priceIn(a, "HNL") - priceIn(b, "HNL"),
      "precio-desc": (a, b) => priceIn(b, "HNL") - priceIn(a, "HNL"),
      area: (a, b) => (b.areaM2 || b.lotM2 || 0) - (a.areaM2 || a.lotM2 || 0),
    };
    return by[orden] ? [...r].sort(by[orden]) : r;
  }, [list, operacion, tipo, depto, ciudad, hab, banos, pmin, pmax, am.join(","), q, orden]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  useEffect(() => { document.body.classList.toggle("no-scroll", open); return () => document.body.classList.remove("no-scroll"); }, [open]);

  const update = (changes: Record<string, string>) => {
    const n = new URLSearchParams(sp.toString());
    if (rawOp === "terreno") { n.delete("operacion"); n.set("tipo", "terreno"); }
    for (const [k, v] of Object.entries(changes)) { if (v) n.set(k, v); else n.delete(k); }
    if (!("pag" in changes)) n.delete("pag");
    if ("depto" in changes && changes.depto && n.get("ciudad") && departmentOf(n.get("ciudad")!) !== changes.depto) n.delete("ciudad");
    router.replace(`/propiedades${n.size ? `?${n}` : ""}`, { scroll: false });
  };
  const toggleAmenity = (a: string) => update({ am: (am.includes(a) ? am.filter((x) => x !== a) : [...am, a]).join(",") });

  const catHref = (c: (typeof categories)[number]) => {
    const n = new URLSearchParams();
    if (operacion) n.set("operacion", operacion);
    if (c.tipo) n.set("tipo", c.tipo);
    if (c.am) n.set("am", c.am);
    return `/propiedades${n.size ? `?${n}` : ""}`;
  };
  const catActive = (c: (typeof categories)[number]) =>
    c.am ? am.length === 1 && am[0] === c.am && !tipo : c.tipo ? tipo === c.tipo : !tipo && !am.length;

  const cityOptions = depto ? citiesByDepartment[depto] ?? [] : Array.from(new Set((list ?? []).map((p) => p.city))).sort();
  const ranges = budgets[(operacion || "venta") as "venta" | "alquiler"];
  const priceValue = pmin || pmax ? `${pmin}-${pmax}` : "";

  const chips: { label: string; clear: Record<string, string> }[] = [];
  if (operacion) chips.push({ label: operacion === "venta" ? "En venta" : "En alquiler", clear: { operacion: "" } });
  if (tipo) chips.push({ label: typePlural[tipo as PropertyType] ?? tipo, clear: { tipo: "" } });
  if (depto) chips.push({ label: depto, clear: { depto: "", ciudad: "" } });
  if (ciudad) chips.push({ label: ciudad, clear: { ciudad: "" } });
  if (hab) chips.push({ label: `${hab}+ hab.`, clear: { hab: "" } });
  if (banos) chips.push({ label: `${banos}+ baños`, clear: { banos: "" } });
  if (pmin || pmax) chips.push({ label: budgetLabel([pmin, pmax]), clear: { pmin: "", pmax: "" } });
  am.forEach((a) => chips.push({ label: a, clear: { am: am.filter((x) => x !== a).join(",") } }));
  if (q) chips.push({ label: `“${q}”`, clear: { q: "" } });

  const query = (() => { const n = new URLSearchParams(sp.toString()); n.delete("pag"); n.delete("vista"); return n.toString(); })();
  const title = searchTitle(sp);
  const saveSearch = async () => {
    if (!profile) { router.push(`/ingresar?next=${encodeURIComponent(`/propiedades${query ? `?${query}` : ""}`)}`); return; }
    try { await backend.saveSearch({ name: title, query }); setSaveMsg("Búsqueda guardada en tu cuenta"); }
    catch (e) { setSaveMsg((e as Error).message); }
    setTimeout(() => setSaveMsg(""), 2600);
  };

  const filterFields = (
    <>
      <label className="f-field"><span>Operación</span>
        <select value={operacion} onChange={(e) => update({ operacion: e.target.value, pmin: "", pmax: "" })}>
          <option value="">Venta y alquiler</option><option value="venta">En venta</option><option value="alquiler">En alquiler</option>
        </select>
      </label>
      <label className="f-field"><span>Tipo</span>
        <select value={tipo} onChange={(e) => update({ tipo: e.target.value })}>
          <option value="">Todos los tipos</option>
          {(Object.keys(typePlural) as PropertyType[]).map((t) => <option key={t} value={t}>{typePlural[t]}</option>)}
        </select>
      </label>
      <label className="f-field"><span>Departamento</span>
        <select value={depto} onChange={(e) => update({ depto: e.target.value })}>
          <option value="">Toda Honduras</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <label className="f-field"><span>Ciudad</span>
        <select value={ciudad} onChange={(e) => update({ ciudad: e.target.value, ...(e.target.value && !depto ? { depto: departmentOf(e.target.value) } : {}) })}>
          <option value="">Todas las ciudades</option>
          {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="f-field"><span>Habitaciones</span>
        <select value={hab || ""} onChange={(e) => update({ hab: e.target.value })}>
          <option value="">Cualquiera</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </label>
      <label className="f-field"><span>Precio</span>
        <select value={priceValue} onChange={(e) => { const [a = "", b = ""] = e.target.value.split("-"); update({ pmin: +a ? a : "", pmax: +b ? b : "" }); }}>
          <option value="">Cualquier precio</option>
          {priceValue && !ranges.some((r) => r.join("-") === priceValue) && <option value={priceValue}>{budgetLabel([pmin, pmax])}</option>}
          {ranges.map((r) => <option key={r.join("-")} value={r.join("-")}>{budgetLabel(r)}{operacion === "alquiler" ? " /mes" : ""}</option>)}
        </select>
      </label>
    </>
  );

  const moreFields = (
    <div className="more-filters">
      <div className="more-filters__row">
        <label className="f-field"><span>Baños</span>
          <select value={banos || ""} onChange={(e) => update({ banos: e.target.value })}>
            <option value="">Cualquiera</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </label>
        <label className="f-field f-field--grow"><span>Palabra clave o código</span>
          <input type="search" placeholder="Colonia, residencial o código PI-…" defaultValue={q} key={q}
            onKeyDown={(e) => { if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value.trim() }); }}
            onBlur={(e) => e.target.value.trim() !== q && update({ q: e.target.value.trim() })} />
        </label>
      </div>
      <p className="f-label">Amenidades</p>
      <div className="amenity-chips">
        {amenities.map((a) => (
          <button key={a} type="button" className={`amenity-chip${am.includes(a) ? " is-on" : ""}`} aria-pressed={am.includes(a)} onClick={() => toggleAmenity(a)}>
            {am.includes(a) && <CheckIcon size={14} />}{a}
          </button>
        ))}
      </div>
    </div>
  );

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
      <section className="section section--tight container">
        <div className="filters-bar">
          <div className="filters-inline">{filterFields}</div>
          <button type="button" className={`btn btn--ghost btn--sm more-btn${more ? " is-open" : ""}`} onClick={() => setMore((m) => !m)} aria-expanded={more}>
            <FilterIcon size={16} /> Más filtros{am.length + (banos ? 1 : 0) + (q ? 1 : 0) ? ` (${am.length + (banos ? 1 : 0) + (q ? 1 : 0)})` : ""}
          </button>
          <button type="button" className="btn btn--outline btn--sm filters-mobile-btn" onClick={() => setOpen(true)}>
            <FilterIcon size={16} /> Filtros{chips.length ? ` (${chips.length})` : ""}
          </button>
        </div>
        {more && <div className="more-panel">{moreFields}</div>}

        {open && (
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Filtros">
            <div className="sheet__head">
              <button type="button" className="icon-btn" aria-label="Cerrar filtros" onClick={() => setOpen(false)}><CloseIcon size={20} /></button>
              <strong>Filtros</strong>
              <button type="button" className="link-btn" onClick={() => router.replace("/propiedades")}>Limpiar</button>
            </div>
            <div className="sheet__body">
              <div className="sheet__grid">{filterFields}</div>
              {moreFields}
            </div>
            <div className="sheet__foot">
              <button type="button" className="btn btn--primary btn--block" onClick={() => setOpen(false)}>
                Ver {results.length} {results.length === 1 ? "propiedad" : "propiedades"}
              </button>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((c) => (
              <button key={c.label} type="button" className="active-chip" onClick={() => update(c.clear)} aria-label={`Quitar filtro ${c.label}`}>
                {c.label} <CloseIcon size={13} />
              </button>
            ))}
            <Link href="/propiedades" className="link-btn">Limpiar todo</Link>
          </div>
        )}

        <div className="results-head">
          <div>
            <h1 className="h2">{title}</h1>
            <p className="muted">{list ? `${results.length} ${results.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}` : "Cargando…"}</p>
          </div>
          <div className="results-tools">
            <button type="button" className="btn btn--ghost btn--sm" onClick={saveSearch}><BellIcon size={16} /> Guardar búsqueda</button>
            <label className="sort"><span className="sr-only">Ordenar</span>
              <select value={orden} onChange={(e) => update({ orden: e.target.value })} aria-label="Ordenar">
                {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <div className="view-toggle" role="group" aria-label="Vista">
              <button type="button" className={vista === "grid" ? "is-active" : ""} aria-pressed={vista === "grid"} onClick={() => update({ vista: "", pag: String(current) })}>Cuadrícula</button>
              <button type="button" className={vista === "list" ? "is-active" : ""} aria-pressed={vista === "list"} onClick={() => update({ vista: "lista", pag: String(current) })}>Lista</button>
            </div>
          </div>
        </div>
        {saveMsg && <p className="notice notice--ok" role="status">{saveMsg}{saveMsg.startsWith("Búsqueda") && <> · <Link href="/cuenta?tab=busquedas">Ver mis búsquedas</Link></>}</p>}

        {list && results.length === 0 ? (
          <div className="empty">
            <p>No encontramos propiedades con esos filtros. Prueba quitando alguno o cuéntanos qué buscas y te avisamos cuando llegue.</p>
            <div className="demo-box__row">
              <Link className="btn btn--outline" href="/propiedades">Ver todas</Link>
              <button type="button" className="btn btn--primary" onClick={saveSearch}><BellIcon size={16} /> Avisarme</button>
            </div>
          </div>
        ) : (
          <div className={vista === "list" ? "list-cards" : "grid-cards"}>
            {list ? shown.map((p) => <PropertyCard key={p.id} p={p} layout={vista} />) : Array.from({ length: 8 }, (_, i) => <div key={i} className="card-skeleton" />)}
          </div>
        )}

        {pages > 1 && (
          <nav className="pager" aria-label="Páginas">
            <button type="button" disabled={current === 1} onClick={() => { update({ pag: String(current - 1) }); scrollTo(0, 0); }}>Anterior</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className={n === current ? "is-active" : ""} aria-current={n === current ? "page" : undefined} onClick={() => { update({ pag: String(n) }); scrollTo(0, 0); }}>{n}</button>
            ))}
            <button type="button" disabled={current === pages} onClick={() => { update({ pag: String(current + 1) }); scrollTo(0, 0); }}>Siguiente</button>
          </nav>
        )}
      </section>
    </>
  );
}
