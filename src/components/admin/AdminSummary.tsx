"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { isLive, typeLabel, typePlural, type Property, type PropertyType } from "@/data/properties";
import { vitrinaActive, type Inquiry, type Payment, type Seller, type UserRow } from "@/lib/backend";
import { daysLeft, formatDate, statusLabel } from "@/lib/labels";
import { formatLempiras, plural, whatsappTo, type PlanKind } from "@/lib/site";
import { useAuth, usePlans } from "../AuthProvider";
import { PlusIcon, WhatsAppIcon } from "../Icons";
import { ColumnChart, Delta, Donut, Funnel, seriesColors, Sparkline, type Col } from "./Charts";

const DAY = 864e5;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const planShort: Record<PlanKind, string> = { publicacion: "Publicación", destacada: "Destacada", vitrina: "Vitrina" };
const periods = [7, 30, 90] as const;
type Period = (typeof periods)[number];
const isAbroad = (phone: string) => !!phone && !phone.replace(/\s/g, "").startsWith("+504") && phone.trim().startsWith("+");
const isVisit = (i: Inquiry) => /Visita (presencial|videollamada)|visita/i.test(i.message);
const trim = (x: number) => (Math.round(x * 10) / 10).toString();
const short = (n: number) => n >= 1e6 ? `L ${trim(n / 1e6)} M` : n >= 1e3 ? `L ${trim(n / 1e3)} mil` : `L ${Math.round(n)}`;

// Resumen del negocio: indicadores con comparación contra el periodo anterior, ingresos,
// consultas, inventario, embudo de ventas, propiedades con mejor desempeño y tareas del día.
export default function AdminSummary({ props, inq, users, payments, sellers, onChange }: {
  props: Property[]; inq: Inquiry[]; users: UserRow[]; payments: Payment[]; sellers: Seller[]; onChange: () => void;
}) {
  const plans = usePlans();
  const { backend, profile } = useAuth();
  const [period, setPeriod] = useState<Period>(30);
  const [busy, setBusy] = useState("");

  const m = useMemo(() => {
    const now = Date.now();
    const start = now - period * DAY, prevStart = now - 2 * period * DAY;
    const inRange = (iso: string | null | undefined, a: number, b: number) => { if (!iso) return false; const t = new Date(iso).getTime(); return t >= a && t < b; };
    const paid = payments.filter((x) => x.status === "pagado");
    const sum = (a: number, b: number) => paid.filter((x) => inRange(x.confirmedAt, a, b)).reduce((s, x) => s + x.amount, 0);
    const leads = (a: number, b: number) => inq.filter((i) => inRange(i.createdAt, a, b));
    const signups = (a: number, b: number) => users.filter((u) => u.role !== "admin" && inRange(u.createdAt, a, b)).length;
    const curLeads = leads(start, now), prevLeads = leads(prevStart, start);
    const answered = (l: Inquiry[]) => l.length ? Math.round((l.filter((i) => i.status !== "nueva").length / l.length) * 100) : 0;
    const abroad = (l: Inquiry[]) => l.length ? Math.round((l.filter((i) => isAbroad(i.phone)).length / l.length) * 100) : 0;

    // Series: por día en 7 y 30 días, por semana en 90.
    const step = period === 90 ? 7 : 1;
    const n = Math.ceil(period / step);
    const buckets = Array.from({ length: n }, (_, k) => {
      const b = now - (n - 1 - k) * step * DAY + DAY - (now % DAY); // fin del día
      const a = b - step * DAY;
      return { a, b };
    });
    const label = (t: number) => { const d = new Date(t - 1); return step === 7 ? `${d.getDate()}/${d.getMonth() + 1}` : String(d.getDate()); };
    const tipDate = (a: number, b: number) => step === 7 ? `Semana al ${formatDate(new Date(b - 1).toISOString())}` : formatDate(new Date(a).toISOString());
    const incomeSeries: Col[] = buckets.map(({ a, b }) => ({ label: label(b), value: sum(a, b), tip: tipDate(a, b) }));
    const leadSeries: Col[] = buckets.map(({ a, b }) => ({ label: label(b), value: leads(a, b).length, tip: tipDate(a, b) }));
    const signupSeries = buckets.map(({ a, b }) => signups(a, b));

    const live = props.filter((p) => isLive(p));
    const types = Object.keys(typeLabel) as PropertyType[];
    const byType = types.map((t, i) => ({ label: typePlural[t], value: live.filter((p) => p.type === t).length, color: seriesColors[i] }));
    const saleValue = live.filter((p) => p.operation === "venta").reduce((s, p) => s + (p.currency === "USD" ? p.price * 26.3 : p.price), 0);

    const leadsByProp = (id: string) => inq.filter((i) => i.propertyId === id).length;
    const top = [...live].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 6).map((p) => ({ p, views: p.views ?? 0, leads: leadsByProp(p.id) }));
    const cityLeads = Object.entries(curLeads.reduce<Record<string, number>>((acc, i) => { const c = props.find((p) => p.id === i.propertyId)?.city ?? "Consulta general"; acc[c] = (acc[c] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const byPlan = (Object.keys(plans) as PlanKind[]).map((k) => ({ k, n: paid.filter((x) => x.kind === k && inRange(x.confirmedAt, start, now)).reduce((s, x) => s + x.amount, 0) }));
    return {
      income: sum(start, now), prevIncome: sum(prevStart, start),
      leads: curLeads.length, prevLeads: prevLeads.length,
      signups: signups(start, now), prevSignups: signups(prevStart, start),
      answered: answered(curLeads), prevAnswered: answered(prevLeads),
      abroad: abroad(curLeads), prevAbroad: abroad(prevLeads),
      incomeSeries, leadSeries, signupSeries, live, byType, saleValue, top, cityLeads, byPlan,
      funnel: [
        { label: "Consultas recibidas", value: curLeads.length },
        { label: "Atendidas", value: curLeads.filter((i) => i.status !== "nueva").length },
        { label: "Cerradas", value: curLeads.filter((i) => i.status === "cerrada").length },
      ],
      visits: curLeads.filter(isVisit).length,
    };
  }, [period, payments, inq, users, props, plans]);

  const pending = payments.filter((x) => x.status === "pendiente");
  const toApprove = props.filter((p) => p.status === "pendiente").length;
  const soon = Date.now() + 7 * DAY;
  const expiring = [
    ...props.filter((p) => p.ownerId && isLive(p) && p.paidUntil && new Date(p.paidUntil).getTime() < soon)
      .map((p) => ({ id: p.id, what: p.title, until: p.paidUntil!, seller: sellers.find((x) => x.id === p.ownerId) })),
    ...sellers.filter((x) => vitrinaActive(x) && new Date(x.vitrinaUntil!).getTime() < soon).map((x) => ({ id: "v" + x.id, what: "Vitrina", until: x.vitrinaUntil!, seller: x })),
  ].sort((a, b) => a.until.localeCompare(b.until));
  const maxPlan = Math.max(1, ...m.byPlan.map((x) => x.n));
  const maxCity = Math.max(1, ...m.cityLeads.map((x) => x[1]));
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const confirm = async (id: string) => { setBusy(id); try { await backend.confirmPayment(id); onChange(); } finally { setBusy(""); } };

  return (
    <>
      <div className="dash-head">
        <div>
          <p className="dash-head__eyebrow">{cap(new Date().toLocaleDateString("es-HN", { weekday: "long", day: "numeric", month: "long" }))}</p>
          <h1 className="h2">{hello}, {profile?.fullName?.split(" ")[0] || "administrador"}</h1>
          <p className="muted">{pending.length || toApprove || expiring.length ? `Tienes ${[pending.length && plural(pending.length, "pago por confirmar", "pagos por confirmar"), toApprove && plural(toApprove, "propiedad por aprobar", "propiedades por aprobar"), expiring.length && plural(expiring.length, "plan por vencer", "planes por vencer")].filter(Boolean).join(", ")}.` : "Todo al día. No hay pendientes."}</p>
        </div>
        <div className="dash-head__actions">
          <div className="seg seg--compact" role="group" aria-label="Periodo">
            {periods.map((p) => <button key={p} className={period === p ? "is-active" : ""} onClick={() => setPeriod(p)}>{p} días</button>)}
          </div>
          <Link className="btn btn--primary btn--sm" href="/admin/propiedad"><PlusIcon size={16} /> Nueva propiedad</Link>
        </div>
      </div>

      <div className="kpis">
        <Kpi label="Ingresos" value={formatLempiras(m.income)} delta={<Delta cur={m.income} prev={m.prevIncome} />} spark={m.incomeSeries.map((x) => x.value)} href="/admin?tab=pagos" />
        <Kpi label="Consultas" value={m.leads} delta={<Delta cur={m.leads} prev={m.prevLeads} />} spark={m.leadSeries.map((x) => x.value)} href="/admin?tab=clientes" />
        <Kpi label="Nuevos registros" value={m.signups} delta={<Delta cur={m.signups} prev={m.prevSignups} />} spark={m.signupSeries} href="/admin?tab=usuarios" />
        <Kpi label="Propiedades activas" value={m.live.length} sub={`${toApprove} por aprobar · ${props.length} en inventario`} href="/admin?tab=propiedades" />
        <Kpi label="Consultas atendidas" value={`${m.answered}%`} delta={<Delta cur={m.answered} prev={m.prevAnswered} />} sub="respondidas o en proceso" href="/admin?tab=consultas" />
        <Kpi label="Desde el extranjero" value={`${m.abroad}%`} delta={<Delta cur={m.abroad} prev={m.prevAbroad} />} sub="de las consultas del periodo" href="/admin?tab=clientes" />
      </div>

      <div className="dash-grid">
        <section className="panel dash-span-2">
          <div className="panel__head"><h2 className="h3">Ingresos</h2><span className="muted small">{period === 90 ? "por semana" : "por día"} · pagos confirmados</span></div>
          <ColumnChart data={m.incomeSeries} format={short} label="Ingresos por periodo" />
        </section>
        <section className="panel">
          <div className="panel__head"><h2 className="h3">Ingresos por plan</h2><span className="muted small">{period} días</span></div>
          <ul className="hbars">
            {m.byPlan.map(({ k, n }) => (
              <li key={k}><span className="hbars__label">{planShort[k]}</span><span className="hbars__track"><span style={{ width: `${(n / maxPlan) * 100}%` }} /></span><span className="hbars__n hbars__n--wide">{formatLempiras(n)}</span></li>
            ))}
          </ul>
          <Link href="/admin?tab=ajustes" className="link-arrow small">Cambiar precios →</Link>
        </section>

        <section className="panel dash-span-2">
          <div className="panel__head"><h2 className="h3">Consultas</h2><span className="muted small">{period === 90 ? "por semana" : "por día"}</span></div>
          <ColumnChart data={m.leadSeries} label="Consultas por periodo" color="#1baf7a" />
        </section>
        <section className="panel">
          <div className="panel__head"><h2 className="h3">Embudo de ventas</h2><span className="muted small">{period} días</span></div>
          <Funnel steps={m.funnel} />
          <p className="muted small funnel__note">{plural(m.visits, "consulta pidió", "consultas pidieron")} agendar visita en este periodo.</p>
        </section>

        <section className="panel">
          <div className="panel__head"><h2 className="h3">Inventario activo</h2><Link href="/admin?tab=propiedades" className="link-arrow small">Ver →</Link></div>
          <Donut slices={m.byType} center={String(m.live.length)} sub="activas" />
          <p className="muted small">Valor en venta: <strong>{short(Math.round(m.saleValue))}</strong> (dólares a L 26.3)</p>
        </section>
        <section className="panel">
          <div className="panel__head"><h2 className="h3">Consultas por ciudad</h2><span className="muted small">{period} días</span></div>
          {m.cityLeads.length === 0 ? <p className="muted small">Sin consultas en este periodo.</p> : (
            <ul className="hbars">
              {m.cityLeads.map(([c, n]) => <li key={c}><span className="hbars__label">{c}</span><span className="hbars__track"><span style={{ width: `${(n / maxCity) * 100}%` }} /></span><span className="hbars__n">{n}</span></li>)}
            </ul>
          )}
        </section>
        <section className="panel">
          <div className="panel__head"><h2 className="h3">Pagos por confirmar</h2><Link href="/admin?tab=pagos" className="link-arrow small">Ver todos →</Link></div>
          {pending.length === 0 ? <p className="muted small">No hay pagos pendientes.</p> : (
            <ul className="mini-list">
              {pending.slice(0, 4).map((x) => (
                <li key={x.id} className="renew">
                  <div><strong>{x.sellerName ?? "Vendedor"}</strong> · {formatLempiras(x.amount)}<br /><span className="muted small">{plans[x.kind].name} · {x.reference}</span></div>
                  <button className="btn btn--primary btn--sm" disabled={busy === x.id} onClick={() => confirm(x.id)}>Confirmar</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dash-span-2">
          <div className="panel__head"><h2 className="h3">Propiedades con mejor desempeño</h2><span className="muted small">visitas desde que se publicaron</span></div>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact table--stack">
              <thead><tr><th>Propiedad</th><th className="num">Visitas</th><th className="num">Consultas</th><th className="num">Conversión</th></tr></thead>
              <tbody>
                {m.top.map(({ p, views, leads }) => (
                  <tr key={p.id}>
                    <td><div className="t-prop"><img src={p.images[0] ?? "/img/casa-1.svg"} alt="" /><div><Link href={`/propiedades/${p.slug}`} className="t-prop__title">{p.title}</Link><span className="muted small">{typeLabel[p.type]} · {p.city}</span></div></div></td>
                    <td className="num" data-label="Visitas">{views.toLocaleString("es-HN")}</td>
                    <td className="num" data-label="Consultas">{leads}</td>
                    <td className="num" data-label="Conversión">{views ? `${((leads / views) * 100).toFixed(1)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel__head"><h2 className="h3">Por renovar esta semana</h2></div>
          {expiring.length === 0 ? <p className="muted small">Ningún plan vence en los próximos 7 días.</p> : (
            <ul className="mini-list">
              {expiring.map((e) => (
                <li key={e.id} className="renew">
                  <div><strong>{e.seller?.name ?? "Vendedor"}</strong><br /><span className="muted small">{e.what} · vence en {plural(daysLeft(e.until), "día", "días")}</span></div>
                  {e.seller?.whatsapp && <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappTo(e.seller.whatsapp, `Hola ${e.seller.name}, le escribe Punto Inmobiliario Hn. Su plan de "${e.what}" vence en ${plural(daysLeft(e.until), "día", "días")}. ¿Desea renovarlo para seguir visible?`)}><WhatsAppIcon size={14} /> Avisar</a>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dash-span-3">
          <div className="panel__head"><h2 className="h3">Últimas consultas</h2><Link href="/admin?tab=consultas" className="link-arrow small">Ver todas →</Link></div>
          <ul className="activity">
            {inq.slice(0, 6).map((i) => (
              <li key={i.id}>
                <span className="avatar">{i.name.slice(0, 1)}</span>
                <div><strong>{i.name}</strong>{isAbroad(i.phone) && <span className="tag-abroad">Extranjero</span>} <span className="muted small">· {i.propertyTitle ?? "Consulta general"}</span><br /><span className="muted small">{i.message}</span></div>
                <span className={`status status--${i.status}`}>{statusLabel[i.status]}</span>
                <span className="muted small nowrap">{formatDate(i.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function Kpi({ label, value, delta, sub, spark, href }: { label: string; value: string | number; delta?: React.ReactNode; sub?: string; spark?: number[]; href: string }) {
  return (
    <Link href={href} className="kpi">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      <span className="kpi__foot">{delta}{delta && <span className="muted small">vs. periodo anterior</span>}{sub && <span className="muted small">{sub}</span>}</span>
      {spark && <Sparkline values={spark} />}
    </Link>
  );
}
