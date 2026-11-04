"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice, operationLabel, typeLabel, type Property } from "@/data/properties";
import type { Inquiry, InquiryStatus, UserRow } from "@/lib/backend";
import { formatDate, statusLabel } from "@/lib/labels";
import { whatsappLink } from "@/lib/site";
import { useAuth } from "../AuthProvider";
import { EditIcon, EyeIcon, PlusIcon, TrashIcon, WhatsAppIcon } from "../Icons";
import AdminShell, { type AdminTab } from "./AdminShell";

export default function AdminDashboard() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as AdminTab) || "resumen";
  const { backend, profile } = useAuth();
  const [props, setProps] = useState<Property[] | null>(null);
  const [inq, setInq] = useState<Inquiry[] | null>(null);
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, i, u] = await Promise.all([backend.listProperties({ includeUnpublished: true }), backend.listInquiries(), backend.listUsers()]);
      setProps(p); setInq(i); setUsers(u);
    } catch (e) { setError((e as Error).message); }
  }, [backend]);

  useEffect(() => { if (profile?.role === "admin") load(); }, [profile, load]);

  const newCount = inq?.filter((i) => i.status === "nueva").length ?? 0;

  return (
    <AdminShell active={tab} badge={newCount}>
      {error && <p className="form__error">{error}</p>}
      {!props || !inq || !users ? <p className="muted">Cargando datos…</p> : (
        <>
          {tab === "resumen" && <Summary props={props} inq={inq} users={users} />}
          {tab === "propiedades" && <PropertiesTab props={props} inq={inq} onChange={load} />}
          {tab === "consultas" && <InquiriesTab inq={inq} onChange={load} />}
          {tab === "usuarios" && <UsersTab users={users} meId={profile?.id ?? ""} onChange={load} />}
        </>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const body = <><span className="stat__label">{label}</span><span className="stat__value">{value}</span>{hint && <span className="stat__hint">{hint}</span>}</>;
  return href ? <Link href={href} className="stat">{body}</Link> : <div className="stat">{body}</div>;
}

function Summary({ props, inq, users }: { props: Property[]; inq: Inquiry[]; users: UserRow[] }) {
  const published = props.filter((p) => p.published !== false);
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

function PropertiesTab({ props, inq, onChange }: { props: Property[]; inq: Inquiry[]; onChange: () => void }) {
  const { backend } = useAuth();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const shown = props.filter((p) => `${p.title} ${p.city} ${p.neighborhood}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin__title">
        <h1 className="h2">Propiedades <span className="muted">({props.length})</span></h1>
        <Link className="btn btn--primary" href="/admin/propiedad"><PlusIcon size={18} /> Nueva propiedad</Link>
      </div>
      <input className="admin__search" type="search" placeholder="Buscar por título, ciudad o colonia" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Propiedad</th><th>Operación</th><th>Precio</th><th>Estado</th><th className="num">Visitas</th><th className="num">Consultas</th><th aria-label="Acciones" /></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="t-prop">
                    <img src={p.images[0] ?? "/img/casa-1.svg"} alt="" />
                    <div><Link href={`/admin/propiedad?id=${p.id}`} className="t-prop__title">{p.title}</Link><span className="muted small">{typeLabel[p.type]} · {p.neighborhood}, {p.city}</span></div>
                  </div>
                </td>
                <td>{operationLabel[p.operation]}</td>
                <td className="nowrap">{formatPrice(p)}</td>
                <td>
                  <button className={`pill ${p.published !== false ? "pill--on" : ""}`} title="Cambiar visibilidad"
                    onClick={async () => { await backend.saveProperty({ ...p, published: p.published === false }); onChange(); }}>
                    {p.published !== false ? "Publicada" : "Oculta"}
                  </button>
                  {p.featured && <span className="pill pill--accent">Destacada</span>}
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
  const shown = filter ? inq.filter((i) => i.status === filter) : inq;
  const phoneDigits = (s: string) => s.replace(/\D/g, "");

  return (
    <>
      <div className="admin__title"><h1 className="h2">Consultas</h1></div>
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
      <div className="admin__title"><h1 className="h2">Usuarios <span className="muted">({users.length})</span></h1></div>
      {err && <p className="form__error">{err}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Nombre</th><th>Contacto</th><th>Registro</th><th className="num">Favoritos</th><th className="num">Consultas</th><th>Rol</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.fullName || "Sin nombre"}</strong>{u.id === meId && <span className="muted small"> (tú)</span>}</td>
                <td><span className="small">{u.email}</span><br /><span className="muted small">{u.phone}</span></td>
                <td className="nowrap">{formatDate(u.createdAt)}</td>
                <td className="num">{u.favorites}</td>
                <td className="num">{u.inquiries}</td>
                <td>
                  <select value={u.role} disabled={u.id === meId} aria-label="Rol"
                    onChange={async (e) => { setErr(""); try { await backend.setUserRole(u.id, e.target.value as "user" | "admin"); onChange(); } catch (x) { setErr((x as Error).message); } }}>
                    <option value="user">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">Los clientes pueden guardar favoritos y enviar consultas. Los administradores ven este panel y pueden publicar propiedades.</p>
    </>
  );
}
