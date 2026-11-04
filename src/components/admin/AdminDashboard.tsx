"use client";
import Link from "next/link";
import { downloadCsv, today } from "@/lib/csv";
import ReceiptButton from "../ReceiptButton";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice, isLive, listingStatusLabel, operationLabel, typeLabel, type Property } from "@/data/properties";
import { roleLabel, vitrinaActive, type Inquiry, type InquiryStatus, type Payment, type Role, type Seller, type UserRow } from "@/lib/backend";
import { daysLeft, formatDate, paymentStatusLabel, statusLabel } from "@/lib/labels";
import { formatLempiras, whatsappTo, type PlanKind } from "@/lib/site";
import { useAuth, usePlans } from "../AuthProvider";
import { EditIcon, EyeIcon, PlusIcon, TrashIcon, WhatsAppIcon } from "../Icons";
import AdminShell, { type AdminTab } from "./AdminShell";

export default function AdminDashboard() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as AdminTab) || "resumen";
  const { backend, profile } = useAuth();
  const [props, setProps] = useState<Property[] | null>(null);
  const [inq, setInq] = useState<Inquiry[] | null>(null);
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, i, u, pay, sel] = await Promise.all([
        backend.listProperties({ includeUnpublished: true }), backend.listInquiries(), backend.listUsers(), backend.listPayments(), backend.listSellers(),
      ]);
      setProps(p); setInq(i); setUsers(u); setPayments(pay); setSellers(sel);
    } catch (e) { setError((e as Error).message); }
  }, [backend]);

  useEffect(() => { if (profile?.role === "admin") load(); }, [profile, load]);

  const newCount = inq?.filter((i) => i.status === "nueva").length ?? 0;
  const payCount = payments.filter((x) => x.status === "pendiente").length;

  return (
    <AdminShell active={tab} badges={{ consultas: newCount, pagos: payCount }}>
      {error && <p className="form__error">{error}</p>}
      {!props || !inq || !users ? <p className="muted">Cargando datos…</p> : (
        <>
          {tab === "resumen" && <Summary props={props} inq={inq} users={users} payments={payments} sellers={sellers} />}
          {tab === "propiedades" && <PropertiesTab props={props} inq={inq} sellers={sellers} onChange={load} />}
          {tab === "pagos" && <PaymentsTab payments={payments} onChange={load} />}
          {tab === "vendedores" && <SellersTab sellers={sellers} props={props} />}
          {tab === "consultas" && <InquiriesTab inq={inq} onChange={load} />}
          {tab === "usuarios" && <UsersTab users={users} meId={profile?.id ?? ""} onChange={load} />}
          {tab === "ajustes" && <SettingsTab />}
        </>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const body = <><span className="stat__label">{label}</span><span className="stat__value">{value}</span>{hint && <span className="stat__hint">{hint}</span>}</>;
  return href ? <Link href={href} className="stat">{body}</Link> : <div className="stat">{body}</div>;
}

function Summary({ props, inq, users, payments, sellers }: { props: Property[]; inq: Inquiry[]; users: UserRow[]; payments: Payment[]; sellers: Seller[] }) {
  const plans = usePlans();
  const published = props.filter((p) => isLive(p));
  const month = new Date(Date.now() - 30 * 864e5); // ingresos de los últimos 30 días
  const income = payments.filter((x) => x.status === "pagado" && x.confirmedAt && new Date(x.confirmedAt) >= month).reduce((s, x) => s + x.amount, 0);
  const toConfirm = payments.filter((x) => x.status === "pendiente").length;
  const views = props.reduce((s, p) => s + (p.views ?? 0), 0);
  const nuevas = inq.filter((i) => i.status === "nueva").length;
  const since = Date.now() - 30 * 864e5;
  const newUsers = users.filter((u) => new Date(u.createdAt).getTime() > since).length;

  // Consultas por día en las últimas 2 semanas.
  const days = useMemo(() => Array.from({ length: 14 }, (_, k) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - k));
    const next = d.getTime() + 864e5;
    return { d, n: inq.filter((i) => { const t = new Date(i.createdAt).getTime(); return t >= d.getTime() && t < next; }).length };
  }), [inq]);
  const maxDay = Math.max(1, ...days.map((x) => x.n));

  // Renovaciones: publicaciones y vitrinas que vencen en los próximos 7 días.
  const soon = Date.now() + 7 * 864e5;
  const expiring = [
    ...props.filter((p) => p.ownerId && isLive(p) && p.paidUntil && new Date(p.paidUntil).getTime() < soon)
      .map((p) => ({ id: p.id, what: p.title, until: p.paidUntil!, seller: sellers.find((x) => x.id === p.ownerId) })),
    ...sellers.filter((x) => vitrinaActive(x) && new Date(x.vitrinaUntil!).getTime() < soon).map((x) => ({ id: "v" + x.id, what: "Vitrina", until: x.vitrinaUntil!, seller: x })),
  ].sort((a, b) => a.until.localeCompare(b.until));
  const byPlan = (Object.keys(plans) as PlanKind[]).map((k) => ({ k, n: payments.filter((x) => x.kind === k && x.status === "pagado" && x.confirmedAt && new Date(x.confirmedAt) >= month).reduce((s2, x) => s2 + x.amount, 0) }));
  const maxPlan = Math.max(1, ...byPlan.map((x) => x.n));

  const top = [...published].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const maxViews = Math.max(1, ...top.map((p) => p.views ?? 0));
  const byCity = Object.entries(published.reduce<Record<string, number>>((m, p) => ({ ...m, [p.city]: (m[p.city] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="admin__title"><h1 className="h2">Resumen</h1><Link className="btn btn--primary" href="/admin/propiedad"><PlusIcon size={18} /> Nueva propiedad</Link></div>
      <div className="stats">
        <Stat label="Propiedades publicadas" value={published.length} hint={`${props.length - published.length} ocultas`} href="/admin?tab=propiedades" />
        <Stat label="Consultas nuevas" value={nuevas} hint={`${inq.length} en total`} href="/admin?tab=consultas" />
        <Stat label="Visitas a propiedades" value={views.toLocaleString("es-HN")} hint="desde que se publicaron" />
        <Stat label="Usuarios registrados" value={users.length} hint={`${newUsers} en los últimos 30 días`} href="/admin?tab=usuarios" />
        <Stat label="Ingresos (30 días)" value={formatLempiras(income)} hint={`${toConfirm} pagos por confirmar`} href="/admin?tab=pagos" />
      </div>
      <div className="panels">
        <div className="panel">
          <h2 className="h3">Consultas de los últimos 14 días</h2>
          <div className="bars" role="img" aria-label="Consultas por día">
            {days.map(({ d, n }) => (
              <div key={d.toISOString()} className="bars__col" title={`${formatDate(d.toISOString())}: ${n}`}>
                <span className="bars__n">{n || ""}</span>
                <span className="bars__bar" style={{ height: `${(n / maxDay) * 100}%` }} />
                <span className="bars__d">{d.getDate()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2 className="h3">Más vistas</h2>
          <ul className="hbars">
            {top.map((p) => (
              <li key={p.id}>
                <Link href={`/propiedades/${p.slug}`} className="hbars__label">{p.title}</Link>
                <span className="hbars__track"><span style={{ width: `${((p.views ?? 0) / maxViews) * 100}%` }} /></span>
                <span className="hbars__n">{p.views ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2 className="h3">Publicadas por ciudad</h2>
          <ul className="hbars">
            {byCity.map(([c, n]) => (
              <li key={c}><span className="hbars__label">{c}</span><span className="hbars__track"><span style={{ width: `${(n / published.length) * 100}%` }} /></span><span className="hbars__n">{n}</span></li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2 className="h3">Por renovar esta semana</h2>
          {expiring.length === 0 ? <p className="muted small">Ningún plan vence en los próximos 7 días.</p> : (
            <ul className="mini-list">
              {expiring.map((e) => (
                <li key={e.id} className="renew">
                  <div><strong>{e.seller?.name ?? "Vendedor"}</strong><br /><span className="muted small">{e.what} · vence en {daysLeft(e.until)} {daysLeft(e.until) === 1 ? "día" : "días"}</span></div>
                  {e.seller?.whatsapp && <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappTo(e.seller.whatsapp, `Hola ${e.seller.name}, le escribe Punto Inmobiliario Hn. Su plan de "${e.what}" vence en ${daysLeft(e.until)} ${daysLeft(e.until) === 1 ? "día" : "días"}. ¿Desea renovarlo para seguir visible?`)}><WhatsAppIcon size={14} /> Avisar</a>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel">
          <h2 className="h3">Ingresos por plan (30 días)</h2>
          <ul className="hbars">
            {byPlan.map(({ k, n }) => (
              <li key={k}><span className="hbars__label">{{ publicacion: "Publicación", destacada: "Destacada", vitrina: "Vitrina" }[k]}</span><span className="hbars__track"><span style={{ width: `${(n / maxPlan) * 100}%` }} /></span><span className="hbars__n hbars__n--wide">{formatLempiras(n)}</span></li>
            ))}
          </ul>
          <Link href="/admin?tab=ajustes" className="link-arrow small">Cambiar precios →</Link>
        </div>
        <div className="panel">
          <h2 className="h3">Últimas consultas</h2>
          <ul className="mini-list">
            {inq.slice(0, 4).map((i) => (
              <li key={i.id}><strong>{i.name}</strong> <span className={`status status--${i.status}`}>{statusLabel[i.status]}</span><br /><span className="muted small">{i.propertyTitle ?? "Consulta general"} · {formatDate(i.createdAt)}</span></li>
            ))}
          </ul>
          <Link href="/admin?tab=consultas" className="link-arrow small">Ver todas →</Link>
        </div>
      </div>
    </>
  );
}

function PropertiesTab({ props, inq, sellers, onChange }: { props: Property[]; inq: Inquiry[]; sellers: Seller[]; onChange: () => void }) {
  const { backend } = useAuth();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [st, setSt] = useState("");
  const groups: [string, string, (p: Property) => boolean][] = [
    ["", "Todas", () => true],
    ["live", "Publicadas", (p) => isLive(p)],
    ["pendiente", "Por aprobar", (p) => p.status === "pendiente"],
    ["vencida", "Vencidas", (p) => !!p.ownerId && p.status === "publicada" && !isLive(p)],
    ["oculta", "Ocultas o borrador", (p) => !isLive(p) && p.status !== "pendiente" && !(p.ownerId && p.status === "publicada")],
    ["destacada", "Destacadas", (p) => !!p.featured],
  ];
  const match = groups.find((g) => g[0] === st)![2];
  const shown = props.filter((p) => match(p) && `${p.title} ${p.city} ${p.neighborhood}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin__title">
        <h1 className="h2">Propiedades <span className="muted">({props.length})</span></h1>
        <Link className="btn btn--primary" href="/admin/propiedad"><PlusIcon size={18} /> Nueva propiedad</Link>
      </div>
      <div className="seg">
        {groups.map(([k, label, f]) => <button key={k} className={st === k ? "is-active" : ""} onClick={() => setSt(k)}>{label} <span className="count">{props.filter(f).length}</span></button>)}
      </div>
      <input className="admin__search" type="search" placeholder="Buscar por título, ciudad o colonia" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Propiedad</th><th>Publica</th><th>Precio</th><th>Estado</th><th className="num">Visitas</th><th className="num">Consultas</th><th aria-label="Acciones" /></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="t-prop">
                    <img src={p.images[0] ?? "/img/casa-1.svg"} alt="" />
                    <div><Link href={`/admin/propiedad?id=${p.id}`} className="t-prop__title">{p.title}</Link><span className="muted small">{typeLabel[p.type]} · {p.neighborhood}, {p.city}</span></div>
                  </div>
                </td>
                <td className="small">{p.ownerId ? sellers.find((x) => x.id === p.ownerId)?.name ?? "Vendedor" : "Punto Inmobiliario"}<br /><span className="muted">{operationLabel[p.operation]}</span></td>
                <td className="nowrap">{formatPrice(p)}</td>
                <td>
                  {p.ownerId && p.status !== "publicada" && p.status !== "pausada" ? (
                    <span className={`pill pill--static ${p.status === "pendiente" ? "pill--accent" : ""}`}>{listingStatusLabel[p.status ?? "borrador"]}</span>
                  ) : (
                    <button className={`pill ${isLive(p) ? "pill--on" : ""}`} title="Cambiar visibilidad"
                      onClick={async () => { await backend.saveProperty({ ...p, status: p.status === "publicada" ? "pausada" : "publicada" }); onChange(); }}>
                      {isLive(p) ? "Publicada" : p.status === "publicada" ? "Vencida" : "Oculta"}
                    </button>
                  )}
                  {p.ownerId && isLive(p) && <span className="muted small"> {daysLeft(p.paidUntil)} días</span>}
                  <button className={`pill ${p.featured ? "pill--accent pill--btn" : "pill--ghost"}`} title={p.featured ? "Quitar de destacadas" : "Destacar en la portada"}
                    onClick={async () => { await backend.saveProperty({ ...p, featured: !p.featured }); onChange(); }}>{p.featured ? "★ Destacada" : "☆ Destacar"}</button>
                </td>
                <td className="num">{p.views ?? 0}</td>
                <td className="num">{inq.filter((i) => i.propertyId === p.id).length}</td>
                <td className="actions">
                  <Link className="icon-btn" href={`/propiedades/${p.slug}`} title="Ver en el sitio"><EyeIcon size={18} /></Link>
                  <Link className="icon-btn" href={`/admin/propiedad?id=${p.id}`} title="Editar"><EditIcon size={18} /></Link>
                  {confirmId === p.id ? (
                    <span className="confirm">¿Eliminar?
                      <button className="btn btn--danger btn--sm" onClick={async () => { await backend.deleteProperty(p.id); setConfirmId(null); onChange(); }}>Sí</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => setConfirmId(null)}>No</button>
                    </span>
                  ) : <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => setConfirmId(p.id)}><TrashIcon size={18} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function InquiriesTab({ inq, onChange }: { inq: Inquiry[]; onChange: () => void }) {
  const { backend } = useAuth();
  const [filter, setFilter] = useState<InquiryStatus | "">("");
  const [kind, setKind] = useState("");
  const kinds: [string, string, (i: Inquiry) => boolean][] = [
    ["", "Todos los tipos", () => true],
    ["visita", "Visitas agendadas", (i) => /Visita (presencial|videollamada)/.test(i.message)],
    ["publicar", "Quieren publicar", (i) => /^Quiero (vender|alquilar) una propiedad/.test(i.message)],
    ["propiedad", "Sobre una propiedad", (i) => !!i.propertyId],
    ["general", "Generales", (i) => !i.propertyId && !/^Quiero (vender|alquilar)/.test(i.message)],
  ];
  const kindMatch = kinds.find((k) => k[0] === kind)![2];
  const shown = inq.filter((i) => (!filter || i.status === filter) && kindMatch(i));
  const phoneDigits = (s: string) => s.replace(/\D/g, "");

  return (
    <>
      <div className="admin__title"><h1 className="h2">Consultas</h1>
        <select className="kind-select" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Tipo de consulta">
          {kinds.map(([k, l, f]) => <option key={k} value={k}>{l} ({inq.filter(f).length})</option>)}
        </select>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadCsv(`consultas-${today()}.csv`, ["Fecha", "Nombre", "Correo", "WhatsApp", "Propiedad", "Mensaje", "Estado"], shown.map((i) => [i.createdAt.slice(0, 10), i.name, i.email, i.phone, i.propertyTitle ?? "", i.message, statusLabel[i.status]]))}>Descargar Excel</button>
      </div>
      <div className="seg">
        {(["", "nueva", "en_proceso", "cerrada"] as const).map((s) => (
          <button key={s} className={filter === s ? "is-active" : ""} onClick={() => setFilter(s)}>
            {s ? statusLabel[s] : "Todas"} <span className="count">{s ? inq.filter((i) => i.status === s).length : inq.length}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? <div className="empty"><p>No hay consultas en esta vista.</p></div> : (
        <ul className="inquiry-list">
          {shown.map((i) => (
            <li key={i.id} className="inquiry">
              <div className="inquiry__top">
                <div>
                  <strong>{i.name}</strong> <span className="muted small">· {formatDate(i.createdAt, true)}</span><br />
                  {i.propertySlug ? <Link className="small link-arrow" href={`/propiedades/${i.propertySlug}`}>{i.propertyTitle}</Link> : <span className="small muted">Consulta general</span>}
                </div>
                <select className={`status-select status--${i.status}`} value={i.status} aria-label="Estado"
                  onChange={async (e) => { await backend.setInquiryStatus(i.id, e.target.value as InquiryStatus); onChange(); }}>
                  {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <p>{i.message}</p>
              <div className="inquiry__contact">
                {i.phone && phoneDigits(i.phone).length >= 8 && (
                  <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer"
                    href={`https://wa.me/${phoneDigits(i.phone)}?text=${encodeURIComponent(`Hola ${i.name.split(" ")[0]}, le escribe Punto Inmobiliario Hn sobre su consulta${i.propertyTitle ? ` por "${i.propertyTitle}"` : ""}.`)}`}>
                    <WhatsAppIcon size={16} /> {i.phone}
                  </a>
                )}
                {i.email && <a className="btn btn--outline btn--sm" href={`mailto:${i.email}`}>{i.email}</a>}
                <button className="link-btn link-btn--danger" onClick={async () => { await backend.deleteInquiry(i.id); onChange(); }}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function UsersTab({ users, meId, onChange }: { users: UserRow[]; meId: string; onChange: () => void }) {
  const { backend } = useAuth();
  const [err, setErr] = useState("");
  return (
    <>
      <div className="admin__title"><h1 className="h2">Usuarios <span className="muted">({users.length})</span></h1>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadCsv(`usuarios-${today()}.csv`, ["Nombre", "Correo", "Teléfono", "Rol", "Registro", "Favoritos", "Consultas", "Publicaciones"], users.map((u) => [u.fullName, u.email, u.phone, roleLabel[u.role], u.createdAt.slice(0, 10), u.favorites, u.inquiries, u.properties]))}>Descargar Excel</button>
      </div>
      {err && <p className="form__error">{err}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Nombre</th><th>Contacto</th><th>Registro</th><th className="num">Favoritos</th><th className="num">Consultas</th><th className="num">Publicaciones</th><th>Rol</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.fullName || "Sin nombre"}</strong>{u.id === meId && <span className="muted small"> (tú)</span>}</td>
                <td><span className="small">{u.email}</span><br /><span className="muted small">{u.phone}</span></td>
                <td className="nowrap">{formatDate(u.createdAt)}</td>
                <td className="num">{u.favorites}</td>
                <td className="num">{u.inquiries}</td>
                <td className="num">{u.properties}</td>
                <td>
                  <select value={u.role} disabled={u.id === meId} aria-label="Rol"
                    onChange={async (e) => { setErr(""); try { await backend.setUserRole(u.id, e.target.value as Role); onChange(); } catch (x) { setErr((x as Error).message); } }}>
                    {(Object.keys(roleLabel) as Role[]).map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">Los compradores guardan favoritos y envían consultas. Los vendedores publican sus propiedades pagando un plan. Los administradores ven este panel.</p>
    </>
  );
}

function PaymentsTab({ payments, onChange }: { payments: Payment[]; onChange: () => void }) {
  const plans = usePlans();
  const { backend } = useAuth();
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"pendiente" | "">("pendiente");
  const shown = filter ? payments.filter((x) => x.status === filter) : payments;
  const act = async (fn: () => Promise<void>) => { setErr(""); try { await fn(); onChange(); } catch (e) { setErr((e as Error).message); } };
  return (
    <>
      <div className="admin__title"><h1 className="h2">Pagos</h1>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadCsv(`pagos-${today()}.csv`, ["Fecha", "Vendedor", "Plan", "Propiedad", "Monto (L)", "Referencia", "Estado", "Confirmado"], payments.map((x) => [x.createdAt.slice(0, 10), x.sellerName ?? "", plans[x.kind].name, x.kind === "vitrina" ? "Vitrina" : x.propertyTitle ?? "", x.amount, x.reference, paymentStatusLabel[x.status], x.confirmedAt?.slice(0, 10) ?? ""]))}>Descargar Excel</button>
      </div>
      <div className="seg">
        <button className={filter === "pendiente" ? "is-active" : ""} onClick={() => setFilter("pendiente")}>Por confirmar <span className="count">{payments.filter((x) => x.status === "pendiente").length}</span></button>
        <button className={filter === "" ? "is-active" : ""} onClick={() => setFilter("")}>Todos <span className="count">{payments.length}</span></button>
      </div>
      {err && <p className="form__error">{err}</p>}
      {shown.length === 0 ? <div className="empty"><p>No hay pagos por confirmar.</p></div> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Vendedor</th><th>Plan</th><th className="num">Monto</th><th>Referencia</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {shown.map((x) => (
                <tr key={x.id}>
                  <td className="nowrap">{formatDate(x.createdAt)}</td>
                  <td><strong>{x.sellerName ?? "Vendedor"}</strong><br /><span className="muted small">{x.kind === "vitrina" ? "Vitrina" : x.propertyTitle ?? "Propiedad eliminada"}</span></td>
                  <td>{plans[x.kind].name}</td>
                  <td className="num nowrap">{formatLempiras(x.amount)}</td>
                  <td className="small">{x.reference}{x.receipt ? <><br /><ReceiptButton receipt={x.receipt} /></> : x.status === "pendiente" && <><br /><span className="muted">Sin comprobante</span></>}</td>
                  <td><span className={`pay-status pay-status--${x.status}`}>{paymentStatusLabel[x.status]}</span></td>
                  <td className="actions">
                    {x.status === "pendiente" && <>
                      <button className="btn btn--primary btn--sm" onClick={() => act(() => backend.confirmPayment(x.id))}>Confirmar</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => act(() => backend.rejectPayment(x.id))}>Rechazar</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted small">Confirma un pago cuando lo veas en tu cuenta bancaria. Al confirmarlo, la publicación o la vitrina se activa por {plans.publicacion.days} días.</p>
    </>
  );
}

function SellersTab({ sellers, props }: { sellers: Seller[]; props: Property[] }) {
  return (
    <>
      <div className="admin__title"><h1 className="h2">Vendedores <span className="muted">({sellers.length})</span></h1></div>
      {sellers.length === 0 ? <div className="empty"><p>Todavía no hay vendedores registrados.</p></div> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Vendedor</th><th>WhatsApp</th><th className="num">Activas</th><th className="num">Total</th><th>Vitrina</th></tr></thead>
            <tbody>
              {sellers.map((s) => {
                const mine = props.filter((p) => p.ownerId === s.id);
                return (
                  <tr key={s.id}>
                    <td><Link href={`/vendedores/${s.slug}`} className="t-prop__title">{s.name}</Link><br /><span className="muted small">{s.city || "Sin ciudad"} · desde {formatDate(s.createdAt)}</span></td>
                    <td className="small nowrap">{s.whatsapp || "—"}</td>
                    <td className="num">{mine.filter((p) => isLive(p)).length}</td>
                    <td className="num">{mine.length}</td>
                    <td>{vitrinaActive(s) ? <span className="pill pill--static pill--on">{daysLeft(s.vitrinaUntil)} días</span> : <span className="pill pill--static">Inactiva</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function SettingsTab() {
  const { backend, settings, reloadSettings } = useAuth();
  const plans = usePlans();
  const [f, setF] = useState(settings);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { setF(settings); }, [settings]);
  return (
    <>
      <div className="admin__title"><h1 className="h2">Precios y ajustes</h1></div>
      <form className="settings" onSubmit={async (e) => {
        e.preventDefault(); setErr(""); setMsg("");
        try { await backend.saveSettings(f); await reloadSettings(); setMsg("Ajustes guardados. Los nuevos precios ya se ven en el sitio."); }
        catch (x) { setErr((x as Error).message); }
      }}>
        <fieldset className="panel">
          <legend className="h3">Precios de los planes (lempiras)</legend>
          <p className="muted small">Cada plan dura {plans.publicacion.days} días. Los cambios aplican a los pagos nuevos; los ya registrados conservan su monto.</p>
          <div className="grid-3 form">
            {(Object.keys(plans) as PlanKind[]).map((k) => (
              <label key={k}>{plans[k].name}
                <input type="number" min={1} step={1} required value={f.prices[k] || ""} onChange={(e) => setF({ ...f, prices: { ...f.prices, [k]: Number(e.target.value) } })} />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="panel">
          <legend className="h3">Tipo de cambio</legend>
          <label className="form">Lempiras por dólar
            <input type="number" min={1} step={0.01} required value={f.usdRate || ""} onChange={(e) => setF({ ...f, usdRate: Number(e.target.value) })} />
          </label>
          <p className="muted small">Se usa para mostrar los precios en las dos monedas, para el filtro de precio y para la comparación.</p>
        </fieldset>
        <fieldset className="panel">
          <legend className="h3">Datos para recibir pagos</legend>
          <label className="form">Cuenta bancaria que ven los vendedores al pagar
            <textarea rows={3} value={f.bankInfo} onChange={(e) => setF({ ...f, bankInfo: e.target.value })} placeholder="Banco, tipo de cuenta, número y nombre del titular" />
          </label>
          <p className="muted small">Si lo dejas vacío, el vendedor verá un botón para pedir los datos por WhatsApp.</p>
        </fieldset>
        {err && <p className="form__error">{err}</p>}
        {msg && <p className="notice notice--ok">{msg}</p>}
        <div><button className="btn btn--primary">Guardar ajustes</button></div>
      </form>
    </>
  );
}
