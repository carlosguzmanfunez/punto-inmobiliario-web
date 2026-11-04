"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice, isLive, listingStatusLabel, typeLabel, type Property } from "@/data/properties";
import { vitrinaActive, type Inquiry, type InquiryStatus, type Payment, type Seller } from "@/lib/backend";
import { daysLeft, formatDate, paymentStatusLabel, statusLabel } from "@/lib/labels";
import { formatLempiras, plural, whatsappTo } from "@/lib/site";
import { useAuth, usePlans } from "../AuthProvider";
import AdminShell, { type SellerTab } from "../admin/AdminShell";
import ReceiptButton from "../ReceiptButton";
import { ColumnChart, Delta, type Col } from "../admin/Charts";
import { EditIcon, EyeIcon, ImageIcon, PlusIcon, TrashIcon, WhatsAppIcon } from "../Icons";
import ShareBox from "../ShareBox";
import PayPanel from "./PayPanel";

type Paying = { property?: Property; vitrina?: boolean } | null;

export default function SellerDashboard() {
  const sp = useSearchParams();
  const tab = (sp.get("tab") as SellerTab) || "resumen";
  const { backend, profile } = useAuth();
  const [props, setProps] = useState<Property[] | null>(null);
  const [inq, setInq] = useState<Inquiry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [paying, setPaying] = useState<Paying>(null);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");
  const payRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const [p, i, pay, s] = await Promise.all([
        backend.listProperties({ ownerId: profile.id }), backend.listReceivedInquiries(), backend.listMyPayments(), backend.getSeller(profile.id),
      ]);
      setProps(p); setInq(i); setPayments(pay); setSeller(s);
    } catch (e) { setError((e as Error).message); }
  }, [backend, profile]);

  useEffect(() => { if (profile && profile.role !== "user") load(); }, [profile, load]);
  useEffect(() => { if (paying) payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [paying]);

  const pay = (p: Paying) => { setFlash(""); setPaying(p); };
  const paid = async () => { setPaying(null); setFlash("Recibimos tu pago. Lo confirmaremos y activaremos tu plan en cuanto lo verifiquemos."); await load(); };
  const newCount = inq.filter((i) => i.status === "nueva").length;

  return (
    <AdminShell active={tab} mode="seller" badges={{ consultas: newCount }}>
      {error && <p className="form__error">{error}</p>}
      {flash && <div className="notice notice--ok">{flash}</div>}
      <div ref={payRef}>{paying && <PayPanel property={paying.property} vitrina={paying.vitrina} onDone={paid} onClose={() => setPaying(null)} />}</div>
      {!props ? <p className="muted">Cargando tu panel…</p> : (
        <>
          {tab === "resumen" && <Summary props={props} inq={inq} seller={seller} payments={payments} onPay={pay} />}
          {tab === "propiedades" && <Listings props={props} inq={inq} payments={payments} onPay={pay} onChange={load} />}
          {tab === "consultas" && <Inquiries inq={inq} onChange={load} />}
          {tab === "vitrina" && <Vitrina seller={seller} props={props} onSaved={(s) => { setSeller(s); setFlash("Tu vitrina se guardó."); }} onPay={pay} />}
          {tab === "planes" && <Plans payments={payments} />}
        </>
      )}
    </AdminShell>
  );
}

const pendingFor = (payments: Payment[], id: string) => payments.some((x) => x.propertyId === id && x.status === "pendiente");

function StatusPill({ p, pending }: { p: Property; pending: boolean }) {
  const live = isLive(p);
  const expired = p.status === "publicada" && !live;
  const label = expired ? "Vencida" : pending && p.status !== "publicada" ? "Pago por confirmar" : listingStatusLabel[p.status ?? "borrador"];
  const tone = live ? "pill--on" : expired || p.status === "rechazada" ? "pill--bad" : p.status === "pendiente" ? "pill--accent" : "";
  return <span className={`pill pill--static ${tone}`}>{label}</span>;
}

function Summary({ props, inq, seller, payments, onPay }: { props: Property[]; inq: Inquiry[]; seller: Seller | null; payments: Payment[]; onPay: (p: Paying) => void }) {
  const plans = usePlans();
  const DAY = 864e5;
  const live = props.filter((p) => isLive(p));
  const views = props.reduce((s, p) => s + (p.views ?? 0), 0);
  const expiring = live.filter((p) => daysLeft(p.paidUntil) <= 7);
  const drafts = props.filter((p) => (p.status === "borrador" || p.status === "rechazada") && !pendingFor(payments, p.id));
  const vit = vitrinaActive(seller);
  const within = (i: Inquiry, a: number, b: number) => { const t = Date.now() - new Date(i.createdAt).getTime(); return t >= a * DAY && t < b * DAY; };
  const last30 = inq.filter((i) => within(i, 0, 30)).length, prev30 = inq.filter((i) => within(i, 30, 60)).length;
  const weeks: Col[] = Array.from({ length: 12 }, (_, k) => {
    const a = (11 - k) * 7, d = new Date(Date.now() - a * DAY);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: inq.filter((i) => within(i, a, a + 7)).length, tip: `Semana al ${formatDate(d.toISOString())}` };
  });
  const perf = [...props].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).map((p) => ({ p, leads: inq.filter((i) => i.propertyId === p.id).length }));
  const best = perf.find((x) => isLive(x.p) && !x.p.featured);
  const fewPhotos = live.filter((p) => p.images.length < 3);
  return (
    <>
      <div className="dash-head">
        <div><p className="dash-head__eyebrow">Panel del vendedor</p><h1 className="h2">Hola, {seller?.name ?? "vendedor"}</h1>
          <p className="muted">{drafts.length || expiring.length ? `Tienes ${[drafts.length && plural(drafts.length, "publicación lista para activar", "publicaciones listas para activar"), expiring.length && plural(expiring.length, "plan por vencer", "planes por vencer")].filter(Boolean).join(" y ")}.` : "Todo al día. Comparte tus links para recibir más consultas."}</p></div>
        <div className="dash-head__actions">
          {seller && <Link className="btn btn--outline btn--sm" href={`/vendedores/${seller.slug}`}>Ver mi vitrina</Link>}
          <Link className="btn btn--primary btn--sm" href="/panel/propiedad"><PlusIcon size={16} /> Nueva propiedad</Link>
        </div>
      </div>
      <div className="kpis kpis--4">
        <Link href="/panel?tab=propiedades" className="kpi"><span className="kpi__label">Publicaciones activas</span><span className="kpi__value">{live.length}</span><span className="kpi__foot muted small">{props.length} en total</span></Link>
        <div className="kpi"><span className="kpi__label">Visitas</span><span className="kpi__value">{views.toLocaleString("es-HN")}</span><span className="kpi__foot muted small">{live.length ? Math.round(views / Math.max(1, live.length)) : 0} por publicación</span></div>
        <Link href="/panel?tab=consultas" className="kpi"><span className="kpi__label">Consultas (30 días)</span><span className="kpi__value">{last30}</span><span className="kpi__foot"><Delta cur={last30} prev={prev30} /><span className="muted small">{inq.filter((i) => i.status === "nueva").length} sin responder</span></span></Link>
        <Link href="/panel?tab=vitrina" className="kpi"><span className="kpi__label">Mi vitrina</span><span className="kpi__value">{vit ? plural(daysLeft(seller?.vitrinaUntil), "día", "días") : "Inactiva"}</span><span className="kpi__foot muted small">{vit ? "restantes" : `desde ${formatLempiras(plans.vitrina.price)} al mes`}</span></Link>
      </div>
      {props.length === 0 ? (
        <div className="empty">
          <p>Aún no tienes propiedades. Crea la primera, agrega fotos y publícala para recibir tu link profesional.</p>
          <Link className="btn btn--primary" href="/panel/propiedad"><PlusIcon size={18} /> Crear mi primera publicación</Link>
        </div>
      ) : (
        <div className="dash-grid">
          <section className="panel dash-span-2">
            <div className="panel__head"><h2 className="h3">Consultas recibidas</h2><span className="muted small">por semana · últimas 12 semanas</span></div>
            <ColumnChart data={weeks} label="Consultas por semana" color="#1baf7a" height={180} />
          </section>
          <section className="panel">
            <div className="panel__head"><h2 className="h3">Por hacer</h2></div>
            {drafts.length === 0 && expiring.length === 0 ? <p className="muted small">Todo al día.</p> : (
              <ul className="todo">
                {drafts.map((p) => <li key={p.id}><span><strong>{p.title}</strong><br /><span className="muted small">{p.status === "rechazada" ? "Revisa los datos y vuelve a enviarla" : "Lista para publicar"}</span></span><button className="btn btn--primary btn--sm" onClick={() => onPay({ property: p })}>Publicar</button></li>)}
                {expiring.map((p) => <li key={p.id}><span><strong>{p.title}</strong><br /><span className="muted small">Vence en {plural(daysLeft(p.paidUntil), "día", "días")}</span></span><button className="btn btn--outline btn--sm" onClick={() => onPay({ property: p })}>Renovar</button></li>)}
              </ul>
            )}
          </section>
          <section className="panel dash-span-2">
            <div className="panel__head"><h2 className="h3">Desempeño de tus propiedades</h2><Link href="/panel?tab=propiedades" className="link-arrow small">Administrar →</Link></div>
            <div className="table-wrap table-wrap--flat">
              <table className="table table--compact">
                <thead><tr><th>Propiedad</th><th>Estado</th><th className="num">Visitas</th><th className="num">Consultas</th><th className="num">Conversión</th></tr></thead>
                <tbody>
                  {perf.map(({ p, leads }) => (
                    <tr key={p.id}>
                      <td><div className="t-prop"><img src={p.images[0] ?? "/img/casa-1.svg"} alt="" /><div><Link href={`/propiedades/${p.slug}`} className="t-prop__title">{p.title}</Link><span className="muted small">{formatPrice(p)}</span></div></div></td>
                      <td><StatusPill p={p} pending={pendingFor(payments, p.id)} />{isLive(p) && <span className="muted small"> {plural(daysLeft(p.paidUntil), "día", "días")}</span>}</td>
                      <td className="num">{(p.views ?? 0).toLocaleString("es-HN")}</td>
                      <td className="num">{leads}</td>
                      <td className="num">{p.views ? `${((leads / p.views) * 100).toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="panel tips">
            <div className="panel__head"><h2 className="h3">Consejos para vender más</h2></div>
            <ul className="tips__list">
              {best && <li><strong>Destaca “{best.p.title}”.</strong> Es tu publicación más vista; como destacada aparece en la portada y primero en las búsquedas. <button className="link-btn" onClick={() => onPay({ property: best.p })}>Destacar por {formatLempiras(plans.destacada.price)} →</button></li>}
              {fewPhotos.length > 0 && <li><strong>Agrega más fotos.</strong> {plural(fewPhotos.length, "publicación tiene", "publicaciones tienen")} menos de 3 fotos. Las que tienen 8 o más reciben más consultas.</li>}
              {!vit && <li><strong>Activa tu vitrina.</strong> Una página con tu logo y todas tus propiedades en un solo link. <Link className="link-btn" href="/panel?tab=vitrina">Ver vitrina →</Link></li>}
              <li><strong>Responde rápido.</strong> Contesta por WhatsApp en menos de una hora: es cuando el comprador está más interesado.</li>
            </ul>
          </section>
          <section className="panel dash-span-3">
            <div className="panel__head"><h2 className="h3">Tus links para compartir</h2></div>
            {live.length === 0 ? <p className="muted small">Cuando una publicación esté activa, aquí tendrás su link para enviarlo a tus compradores.</p> : (
              <ul className="share-list share-list--grid">
                {live.slice(0, 6).map((p) => <li key={p.id}><span className="small"><strong>{p.title}</strong></span><ShareBox compact path={`/propiedades/${p.slug}`} title={p.title} message={`Te comparto esta propiedad: ${p.title} (${formatPrice(p)})`} /></li>)}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Listings({ props, inq, payments, onPay, onChange }: { props: Property[]; inq: Inquiry[]; payments: Payment[]; onPay: (p: Paying) => void; onChange: () => void }) {
  const { backend } = useAuth();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const act = async (fn: () => Promise<unknown>) => { setErr(""); try { await fn(); onChange(); } catch (e) { setErr((e as Error).message); } };

  return (
    <>
      <div className="admin__title"><h1 className="h2">Mis propiedades <span className="muted">({props.length})</span></h1><Link className="btn btn--primary" href="/panel/propiedad"><PlusIcon size={18} /> Nueva propiedad</Link></div>
      {err && <p className="form__error">{err}</p>}
      {props.length === 0 ? <div className="empty"><p>Todavía no tienes propiedades.</p><Link className="btn btn--primary" href="/panel/propiedad">Crear publicación</Link></div> : (
        <ul className="listing-list">
          {props.map((p) => {
            const live = isLive(p); const pending = pendingFor(payments, p.id);
            return (
              <li key={p.id} className="listing">
                <img src={p.images[0] ?? "/img/casa-1.svg"} alt="" className="listing__img" />
                <div className="listing__body">
                  <div className="listing__top">
                    <Link href={`/panel/propiedad?id=${p.id}`} className="t-prop__title">{p.title}</Link>
                    <StatusPill p={p} pending={pending} />
                    {p.featured && live && <span className="pill pill--static pill--accent">Destacada</span>}
                  </div>
                  <p className="muted small">{typeLabel[p.type]} · {p.neighborhood}, {p.city} · {formatPrice(p)}</p>
                  <p className="small listing__meta">
                    <span>{p.views ?? 0} {(p.views ?? 0) === 1 ? "visita" : "visitas"}</span><span>{inq.filter((i) => i.propertyId === p.id).length} {inq.filter((i) => i.propertyId === p.id).length === 1 ? "consulta" : "consultas"}</span>
                    {live && <span>Vence el {formatDate(p.paidUntil!)} ({daysLeft(p.paidUntil)} {daysLeft(p.paidUntil) === 1 ? "día" : "días"})</span>}
                  </p>
                  {live && <ShareBox compact path={`/propiedades/${p.slug}`} title={p.title} message={`Te comparto esta propiedad: ${p.title} (${formatPrice(p)})`} />}
                  <div className="listing__actions">
                    {(p.status === "borrador" || p.status === "rechazada") && !pending && <button className="btn btn--primary btn--sm" onClick={() => onPay({ property: p })}>Publicar</button>}
                    {(live || (p.status === "publicada" && !live)) && <button className="btn btn--outline btn--sm" onClick={() => onPay({ property: p })}>Renovar</button>}
                    {p.status === "publicada" && live && <button className="btn btn--ghost btn--sm" onClick={() => act(() => backend.saveProperty({ ...p, status: "pausada" }))}>Pausar</button>}
                    {p.status === "pausada" && daysLeft(p.paidUntil) > 0 && <button className="btn btn--ghost btn--sm" onClick={() => act(() => backend.saveProperty({ ...p, status: "publicada" }))}>Reactivar</button>}
                    <Link className="icon-btn" href={`/propiedades/${p.slug}`} title="Ver"><EyeIcon size={18} /></Link>
                    <Link className="icon-btn" href={`/panel/propiedad?id=${p.id}`} title="Editar"><EditIcon size={18} /></Link>
                    {confirmId === p.id ? (
                      <span className="confirm">¿Eliminar?
                        <button className="btn btn--danger btn--sm" onClick={() => act(async () => { await backend.deleteProperty(p.id); setConfirmId(null); })}>Sí</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setConfirmId(null)}>No</button>
                      </span>
                    ) : <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => setConfirmId(p.id)}><TrashIcon size={18} /></button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Inquiries({ inq, onChange }: { inq: Inquiry[]; onChange: () => void }) {
  const { backend } = useAuth();
  return (
    <>
      <div className="admin__title"><h1 className="h2">Consultas recibidas</h1></div>
      {inq.length === 0 ? <div className="empty"><p>Aquí verás los mensajes de compradores interesados en tus propiedades.</p></div> : (
        <ul className="inquiry-list">
          {inq.map((i) => (
            <li key={i.id} className="inquiry">
              <div className="inquiry__top">
                <div><strong>{i.name}</strong> <span className="muted small">· {formatDate(i.createdAt, true)}</span><br />
                  {i.propertySlug && <Link className="small link-arrow" href={`/propiedades/${i.propertySlug}`}>{i.propertyTitle}</Link>}</div>
                <select className={`status-select status--${i.status}`} value={i.status} aria-label="Estado"
                  onChange={async (e) => { await backend.setInquiryStatus(i.id, e.target.value as InquiryStatus); onChange(); }}>
                  {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <p>{i.message}</p>
              <div className="inquiry__contact">
                {i.phone.replace(/\D/g, "").length >= 8 && <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappTo(i.phone, `Hola ${i.name.split(" ")[0]}, gracias por tu interés en "${i.propertyTitle ?? "nuestra propiedad"}".`)}><WhatsAppIcon size={16} /> {i.phone}</a>}
                {i.email && <span className="small muted">{i.email}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Vitrina({ seller, props, onSaved, onPay }: { seller: Seller | null; props: Property[]; onSaved: (s: Seller) => void; onPay: (p: Paying) => void }) {
  const plans = usePlans();
  const { backend, profile } = useAuth();
  const [f, setF] = useState({ name: seller?.name ?? profile?.fullName ?? "", slug: seller?.slug ?? "", city: seller?.city ?? "", whatsapp: seller?.whatsapp ?? profile?.phone ?? "", bio: seller?.bio ?? "", logo: seller?.logo ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const active = vitrinaActive(seller);
  const liveCount = props.filter((p) => isLive(p)).length;

  return (
    <>
      <div className="admin__title"><h1 className="h2">Mi vitrina</h1>{seller && <Link className="btn btn--ghost" href={`/vendedores/${seller.slug}`}><EyeIcon size={18} /> Ver mi vitrina</Link>}</div>
      <div className="panels panels--2">
        <form className="panel form" onSubmit={async (e) => {
          e.preventDefault(); setErr(""); setBusy(true);
          try { onSaved(await backend.saveMySeller(f)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
        }}>
          <h2 className="h3">Datos de tu negocio</h2>
          <div className="logo-field">
            <div className="logo-preview">{f.logo ? <img src={f.logo} alt="Logo" /> : <span>{(f.name || "?").slice(0, 1).toUpperCase()}</span>}</div>
            <label className="btn btn--outline btn--sm"><ImageIcon size={16} /> Subir logo
              <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, logo: await backend.uploadImage(file) }); } catch (x) { setErr((x as Error).message); } }} />
            </label>
          </div>
          <label>Nombre del negocio o vendedor<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej. Desarrollos Morazán" /></label>
          <label>Dirección de tu vitrina<span className="slug-input"><span>/vendedores/</span><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="desarrollos-morazan" /></span></label>
          <div className="grid-2">
            <label>Ciudad<input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></label>
            <label>WhatsApp para compradores<input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="+504 9999-9999" /></label>
          </div>
          <label>Descripción<textarea rows={5} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Cuéntales a los compradores quiénes son, qué proyectos tienen y por qué confiar en ustedes." /></label>
          {err && <p className="form__error">{err}</p>}
          <button className="btn btn--primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
          <p className="muted small">Tu nombre y WhatsApp aparecen en todas tus publicaciones.</p>
        </form>
        <div className="panel">
          <h2 className="h3">Estado</h2>
          {active ? (
            <>
              <p><span className="pill pill--static pill--on">Activa</span> hasta el {formatDate(seller!.vitrinaUntil!)} ({plural(daysLeft(seller!.vitrinaUntil), "día", "días")}).</p>
              <p className="muted small">Muestra {liveCount} {liveCount === 1 ? "publicación activa" : "publicaciones activas"}.</p>
              <ShareBox path={`/vendedores/${seller!.slug}`} title={seller!.name} message={`Conoce todos los proyectos de ${seller!.name}`} />
              <button className="btn btn--outline btn--sm" onClick={() => onPay({ vitrina: true })}>Renovar vitrina</button>
            </>
          ) : (
            <>
              <p>Tu vitrina está <strong>inactiva</strong>. Con ella tienes una página propia con tu logo, tu descripción y todas tus propiedades en un solo link.</p>
              <p className="plan-price">{formatLempiras(plans.vitrina.price)} <small>por {plans.vitrina.days} días</small></p>
              <button className="btn btn--primary" onClick={() => onPay({ vitrina: true })}>Activar mi vitrina</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Plans({ payments }: { payments: Payment[] }) {
  const plans = usePlans();
  return (
    <>
      <div className="admin__title"><h1 className="h2">Planes y pagos</h1></div>
      <div className="plans plans--compact">
        {Object.values(plans).map((p) => (
          <div key={p.kind} className="plan">
            <h3>{p.name}</h3>
            <p className="plan-price">{formatLempiras(p.price)} <small>por {p.days} días</small></p>
            <p className="muted small">{p.summary}</p>
          </div>
        ))}
      </div>
      <p className="muted small">Para pagar una publicación ve a <Link href="/panel?tab=propiedades" className="link-arrow">Mis propiedades</Link> y toca “Publicar” o “Renovar”. La vitrina se activa desde <Link href="/panel?tab=vitrina" className="link-arrow">Mi vitrina</Link>.</p>
      <h2 className="h3">Historial</h2>
      {payments.length === 0 ? <p className="muted">Todavía no has hecho pagos.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Plan</th><th>Para</th><th className="num">Monto</th><th>Referencia</th><th>Estado</th></tr></thead>
            <tbody>
              {payments.map((x) => (
                <tr key={x.id}>
                  <td className="nowrap">{formatDate(x.createdAt)}</td>
                  <td>{plans[x.kind].name}</td>
                  <td>{x.kind === "vitrina" ? "Mi vitrina" : x.propertyTitle ?? "Propiedad eliminada"}</td>
                  <td className="num nowrap">{formatLempiras(x.amount)}</td>
                  <td className="small">{x.reference}{x.receipt && <><br /><ReceiptButton receipt={x.receipt} /></>}</td>
                  <td><span className={`pay-status pay-status--${x.status}`}>{paymentStatusLabel[x.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
