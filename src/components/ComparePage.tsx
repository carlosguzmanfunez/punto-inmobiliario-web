"use client";
import Link from "next/link";
import { propertyCode, typeLabel, type Property } from "@/data/properties";
import { departmentOf } from "@/data/geo";
import { formatMoney, priceIn } from "@/lib/money";
import { whatsappLink } from "@/lib/site";
import { usePrefs } from "./PrefsProvider";
import { useProperties } from "./useProperties";
import Price from "./Price";
import { CloseIcon, WhatsAppIcon } from "./Icons";

const rows: [string, (p: Property) => string][] = [
  ["Código", (p) => propertyCode(p)],
  ["Tipo", (p) => typeLabel[p.type]],
  ["Operación", (p) => (p.operation === "venta" ? "Venta" : "Alquiler")],
  ["Ubicación", (p) => `${p.neighborhood}, ${p.city}`],
  ["Departamento", (p) => p.department || departmentOf(p.city) || "—"],
  ["Habitaciones", (p) => (p.bedrooms ? String(p.bedrooms) : "—")],
  ["Baños", (p) => (p.bathrooms ? String(p.bathrooms) : "—")],
  ["Parqueos", (p) => (p.parking ? String(p.parking) : "—")],
  ["Construcción", (p) => (p.areaM2 ? `${p.areaM2.toLocaleString("es-HN")} m²` : "—")],
  ["Terreno", (p) => (p.lotM2 ? `${p.lotM2.toLocaleString("es-HN")} m²` : "—")],
  ["Precio por m²", (p) => { const a = p.areaM2 || p.lotM2 || 0; return p.operation === "venta" && a ? formatMoney(priceIn(p, "HNL") / a, "HNL") : "—"; }],
];

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare } = usePrefs();
  const { list } = useProperties();
  const items = compare.map((id) => list?.find((p) => p.id === id)).filter((p): p is Property => !!p);
  const allFeatures = Array.from(new Set(items.flatMap((p) => p.features)));

  return (
    <section className="section container">
      <div className="section__head">
        <div><h1 className="h2">Comparar propiedades</h1><p className="muted">Hasta 3 propiedades lado a lado. Agrégalas con el botón de comparar en cada tarjeta.</p></div>
        {items.length > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={clearCompare}>Limpiar comparación</button>}
      </div>
      {!list ? <div className="card-skeleton" style={{ height: 300, aspectRatio: "auto" }} /> : items.length === 0 ? (
        <div className="empty"><p>Todavía no has elegido propiedades para comparar.</p><Link className="btn btn--primary" href="/propiedades">Explorar propiedades</Link></div>
      ) : (
        <div className="table-wrap">
          <table className="table compare-table">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Característica</span></th>
                {items.map((p) => (
                  <th key={p.id} scope="col">
                    <div className="compare-head">
                      <button type="button" className="icon-btn" aria-label={`Quitar ${p.title}`} onClick={() => toggleCompare(p.id)}><CloseIcon size={16} /></button>
                      <Link href={`/propiedades/${p.slug}`}><img src={p.images[0] ?? "/img/casa-1.svg"} alt="" /></Link>
                      <Link href={`/propiedades/${p.slug}`} className="t-prop__title">{p.title}</Link>
                      <Price p={p} alt className="compare-head__price" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, f]) => (
                <tr key={label}><th scope="row">{label}</th>{items.map((p) => <td key={p.id}>{f(p)}</td>)}</tr>
              ))}
              {allFeatures.map((feat) => (
                <tr key={feat}><th scope="row">{feat}</th>{items.map((p) => <td key={p.id}>{p.features.includes(feat) ? "✓" : "—"}</td>)}</tr>
              ))}
              <tr>
                <th scope="row">Contacto</th>
                {items.map((p) => (
                  <td key={p.id}>
                    <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappLink(`Hola, me interesa la propiedad ${propertyCode(p)}: "${p.title}".`)}><WhatsAppIcon size={16} /> Consultar</a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
