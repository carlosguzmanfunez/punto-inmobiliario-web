"use client";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type { Inquiry, UserRow } from "@/lib/backend";
import { formatDate, statusLabel } from "@/lib/labels";
import { downloadCsv, today } from "@/lib/csv";
import { plural, whatsappTo } from "@/lib/site";
import { MailIcon, WhatsAppIcon } from "../Icons";
import { ShowMore, usePager } from "./ShowMore";

const DAY = 864e5;
export const countryOf = (phone: string) => {
  const p = phone.replace(/\s/g, "");
  if (!p || p.startsWith("+504") || !p.startsWith("+")) return "Honduras";
  if (p.startsWith("+1")) return "EE. UU. o Canadá";
  if (p.startsWith("+34")) return "España";
  if (p.startsWith("+52")) return "México";
  return "Otro país";
};

type Client = {
  key: string; name: string; email: string; phone: string; country: string; registered: boolean;
  inquiries: Inquiry[]; last: string; first: string; status: Inquiry["status"]; visit: boolean;
};

// Clientes: cada persona que ha escrito, con todas sus consultas juntas. Sirve como una
// agenda comercial: a quién responder, quién vive fuera y qué propiedades le interesan.
export default function ClientsTab({ inq, users }: { inq: Inquiry[]; users: UserRow[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const clients = useMemo(() => {
    const map = new Map<string, Client>();
    for (const i of [...inq].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      const key = (i.email || i.phone.replace(/\D/g, "")).toLowerCase();
      const c = map.get(key);
      if (c) { c.inquiries.push(i); c.last = i.createdAt; c.status = i.status; c.name = i.name || c.name; c.visit ||= /visita/i.test(i.message); }
      else map.set(key, {
        key, name: i.name, email: i.email, phone: i.phone, country: countryOf(i.phone),
        registered: !!i.userId || users.some((u) => u.email.toLowerCase() === i.email.toLowerCase()),
        inquiries: [i], last: i.createdAt, first: i.createdAt, status: i.status, visit: /visita/i.test(i.message),
      });
    }
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }, [inq, users]);

  const filters: [string, string, (c: Client) => boolean][] = [
    ["", "Todos", () => true],
    ["nuevos", "Por responder", (c) => c.status === "nueva"],
    ["extranjero", "En el extranjero", (c) => c.country !== "Honduras"],
    ["visita", "Pidieron visita", (c) => c.visit],
    ["registrados", "Con cuenta", (c) => c.registered],
  ];
  const match = filters.find((x) => x[0] === f)![2];
  const shown = clients.filter((c) => match(c) && `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  const page = usePager(shown, `${f}|${q}`);
  const month = Date.now() - 30 * DAY;
  const newMonth = clients.filter((c) => new Date(c.first).getTime() > month).length;
  const abroad = clients.filter((c) => c.country !== "Honduras").length;
  const repeat = clients.filter((c) => c.inquiries.length > 1).length;

  return (
    <>
      <div className="admin__title"><h1 className="h2">Clientes <span className="muted">({clients.length})</span></h1>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadCsv(`clientes-${today()}.csv`, ["Nombre", "Correo", "WhatsApp", "País", "Consultas", "Primera", "Última", "Estado", "Con cuenta", "Propiedades"], shown.map((c) => [c.name, c.email, c.phone, c.country, c.inquiries.length, c.first.slice(0, 10), c.last.slice(0, 10), statusLabel[c.status], c.registered ? "Sí" : "No", Array.from(new Set(c.inquiries.map((i) => i.propertyTitle ?? "General"))).join(" | ")]))}>Descargar Excel</button>
      </div>
      <div className="kpis kpis--4">
        <div className="kpi"><span className="kpi__label">Clientes</span><span className="kpi__value">{clients.length}</span><span className="kpi__foot muted small">personas distintas que escribieron</span></div>
        <div className="kpi"><span className="kpi__label">Nuevos (30 días)</span><span className="kpi__value">{newMonth}</span><span className="kpi__foot muted small">primer contacto este mes</span></div>
        <div className="kpi"><span className="kpi__label">En el extranjero</span><span className="kpi__value">{clients.length ? Math.round((abroad / clients.length) * 100) : 0}%</span><span className="kpi__foot muted small">{plural(abroad, "cliente", "clientes")} fuera de Honduras</span></div>
        <div className="kpi"><span className="kpi__label">Recurrentes</span><span className="kpi__value">{repeat}</span><span className="kpi__foot muted small">con más de una consulta</span></div>
      </div>
      <div className="toolbar">
        <div className="seg">
          {filters.map(([k, l, fn]) => <button key={k} className={f === k ? "is-active" : ""} onClick={() => setF(k)}>{l} <span className="count">{clients.filter(fn).length}</span></button>)}
        </div>
        <input className="admin__search" type="search" placeholder="Buscar por nombre, correo o teléfono" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {shown.length === 0 ? <div className="empty"><p>No hay clientes con ese filtro.</p></div> : (
        <div className="table-wrap">
          <table className="table table--stack">
            <thead><tr><th>Cliente</th><th>País</th><th className="num">Consultas</th><th>Último contacto</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {page.rows.map((c) => (
                <Fragment key={c.key}>
                  <tr className="row-click" onClick={() => setOpen(open === c.key ? null : c.key)}>
                    <td><div className="t-person"><span className="avatar">{c.name.slice(0, 1)}</span><div><strong>{c.name}</strong>{c.registered && <span className="tag-soft">Con cuenta</span>}<br /><span className="muted small">{c.email}</span><br /><span className="muted small nowrap">{c.phone}</span></div></div></td>
                    <td className="small" data-label="País">{c.country !== "Honduras" ? <span className="tag-abroad">{c.country}</span> : "Honduras"}</td>
                    <td className="num" data-label="Consultas">{c.inquiries.length}</td>
                    <td className="nowrap small" data-label="Último contacto">{formatDate(c.last)}</td>
                    <td><span className={`status status--${c.status}`}>{statusLabel[c.status]}</span></td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      {c.phone && <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappTo(c.phone, `Hola ${c.name.split(" ")[0]}, le saluda Punto Inmobiliario Hn.`)}><WhatsAppIcon size={14} /> WhatsApp</a>}
                      {c.email && <a className="icon-btn" href={`mailto:${c.email}`} title={`Escribir a ${c.email}`}><MailIcon size={18} /></a>}
                    </td>
                  </tr>
                  {open === c.key && (
                    <tr className="row-detail"><td colSpan={6}>
                      <ul className="timeline">
                        {[...c.inquiries].reverse().map((i) => (
                          <li key={i.id}><span className="muted small">{formatDate(i.createdAt)}</span> · {i.propertySlug ? <Link href={`/propiedades/${i.propertySlug}`}>{i.propertyTitle}</Link> : "Consulta general"} <span className={`status status--${i.status}`}>{statusLabel[i.status]}</span><br />{i.message}</li>
                        ))}
                      </ul>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <ShowMore {...page} />
        </div>
      )}
      <p className="muted small">Toca un cliente para ver todas sus consultas. Los clientes se agrupan por correo o teléfono.</p>
    </>
  );
}
