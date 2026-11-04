"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Inquiry, SavedSearch } from "@/lib/backend";
import { formatDate, statusLabel } from "@/lib/labels";
import { useAuth, usePlans } from "./AuthProvider";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";
import { BellIcon, HeartIcon, InboxIcon, KeyIcon, LogoutIcon, TrashIcon, UserIcon } from "./Icons";
import { searchTitle } from "./PropertyBrowser";
import { formatLempiras } from "@/lib/site";

type Tab = "favoritos" | "busquedas" | "consultas" | "perfil" | "vender";

export default function AccountPage() {
  const plans = usePlans();
  const { backend, profile, loading, favorites, refresh } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get("tab") as Tab) || "favoritos");
  const { list } = useProperties();
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [f, setF] = useState({ fullName: "", phone: "" });
  const [saved, setSaved] = useState("");
  const [business, setBusiness] = useState("");
  const [sellErr, setSellErr] = useState("");
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);

  useEffect(() => { if (!loading && !profile) router.replace("/ingresar?next=/cuenta"); }, [loading, profile, router]);
  useEffect(() => { if (profile) { setF({ fullName: profile.fullName, phone: profile.phone }); backend.listMyInquiries().then(setInquiries); backend.listSavedSearches().then(setSearches).catch(() => setSearches([])); } }, [profile, backend]);

  if (!profile) return <section className="section container"><p className="muted">Cargando tu cuenta…</p></section>;
  const favs = (list ?? []).filter((p) => favorites.has(p.id));
  // Recomendaciones simples: puntúa cada propiedad por parecido con los favoritos.
  const forYou = (list ?? []).filter((p) => !favorites.has(p.id))
    .map((p) => ({ p, s: favs.reduce((acc, f) => acc + (f.type === p.type ? 3 : 0) + (f.city === p.city ? 2 : 0) + (f.operation === p.operation ? 1 : 0), 0) }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.p);

  return (
    <section className="section container account">
      <div className="account__head">
        <div className="avatar" aria-hidden>{(profile.fullName || profile.email).slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="h2">Hola, {profile.fullName.split(" ")[0] || "bienvenido"}</h1>
          <p className="muted">{profile.email}{profile.role === "admin" && <> · <Link className="link-arrow" href="/admin">Ir al panel de administración →</Link></>}{profile.role === "seller" && <> · <Link className="link-arrow" href="/panel">Ir a mi panel de vendedor →</Link></>}</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={async () => { router.replace("/"); await backend.signOut(); await refresh(); }}><LogoutIcon size={16} /> Cerrar sesión</button>
      </div>

      <div className="tabs tabs--line" role="tablist">
        <button role="tab" aria-selected={tab === "favoritos"} className={tab === "favoritos" ? "is-active" : ""} onClick={() => setTab("favoritos")}><HeartIcon size={16} /> Favoritos <span className="count">{favorites.size}</span></button>
        <button role="tab" aria-selected={tab === "busquedas"} className={tab === "busquedas" ? "is-active" : ""} onClick={() => setTab("busquedas")}><BellIcon size={16} /> Búsquedas <span className="count">{searches?.length ?? 0}</span></button>
        <button role="tab" aria-selected={tab === "consultas"} className={tab === "consultas" ? "is-active" : ""} onClick={() => setTab("consultas")}><InboxIcon size={16} /> Mis consultas <span className="count">{inquiries?.length ?? 0}</span></button>
        <button role="tab" aria-selected={tab === "perfil"} className={tab === "perfil" ? "is-active" : ""} onClick={() => setTab("perfil")}><UserIcon size={16} /> Mis datos</button>
        {profile.role === "user" && <button role="tab" aria-selected={tab === "vender"} className={tab === "vender" ? "is-active" : ""} onClick={() => setTab("vender")}><KeyIcon size={16} /> Quiero vender</button>}
      </div>

      {tab === "favoritos" && (favs.length ? (
        <>
          <div className="grid-cards">{favs.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          {forYou.length > 0 && (
            <div className="account__more">
              <div className="section__head"><div><h2 className="h3">Recomendadas para ti</h2><p className="muted small">Parecidas a las que guardaste: mismo tipo, ciudad u operación.</p></div><Link className="link-arrow small" href="/propiedades">Ver todas →</Link></div>
              <div className="grid-cards">{forYou.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
            </div>
          )}
        </>
      ) : (
        <div className="empty"><p>Todavía no has guardado propiedades. Toca el corazón ♡ en cualquier propiedad para guardarla aquí.</p><Link className="btn btn--primary" href="/propiedades">Explorar propiedades</Link></div>
      ))}

      {tab === "busquedas" && (searches?.length ? (
        <ul className="inquiry-list">
          {searches.map((s) => {
            const n = (list ?? []).length ? countMatches(list ?? [], s.query) : null;
            return (
              <li key={s.id} className="inquiry saved-search">
                <div>
                  <Link href={`/propiedades?${s.query}`} className="inquiry__prop">{s.name || searchTitle(new URLSearchParams(s.query))}</Link>
                  <p className="muted small">Guardada el {formatDate(s.createdAt)}{n !== null ? ` · ${n} ${n === 1 ? "propiedad disponible" : "propiedades disponibles"} hoy` : ""}</p>
                </div>
                <div className="saved-search__actions">
                  <Link className="btn btn--outline btn--sm" href={`/propiedades?${s.query}`}>Ver resultados</Link>
                  <button className="icon-btn icon-btn--danger" aria-label="Borrar búsqueda" onClick={async () => { await backend.deleteSavedSearch(s.id); setSearches((x) => (x ?? []).filter((y) => y.id !== s.id)); }}><TrashIcon size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty"><p>Guarda una búsqueda desde el listado de propiedades con el botón “Guardar búsqueda” y vuelve a ella cuando quieras.</p><Link className="btn btn--primary" href="/propiedades">Buscar propiedades</Link></div>
      ))}

      {tab === "consultas" && (inquiries?.length ? (
        <ul className="inquiry-list">
          {inquiries.map((i) => (
            <li key={i.id} className="inquiry">
              <div className="inquiry__top">
                {i.propertySlug ? <Link href={`/propiedades/${i.propertySlug}`} className="inquiry__prop">{i.propertyTitle}</Link> : <span className="inquiry__prop">Consulta general</span>}
                <span className={`status status--${i.status}`}>{statusLabel[i.status]}</span>
              </div>
              <p>{i.message}</p>
              <p className="muted small">Enviada el {formatDate(i.createdAt, true)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty"><p>Aún no has enviado consultas. En cada propiedad puedes dejarnos un mensaje y aquí verás su estado.</p></div>
      ))}

      {tab === "vender" && profile.role === "user" && (
        <form className="form form--narrow" onSubmit={async (e) => {
          e.preventDefault(); setSellErr("");
          try { await backend.becomeSeller(business); await refresh(); router.push("/panel"); } catch (x) { setSellErr((x as Error).message); }
        }}>
          <h2 className="h3">Publica tus propiedades en Punto Inmobiliario</h2>
          <p className="muted">Activa tu cuenta de vendedor gratis. Solo pagas cuando publicas: {formatLempiras(plans.publicacion.price)} por propiedad durante {plans.publicacion.days} días, con un link profesional para enviar a tus compradores.</p>
          <label>Nombre de tu negocio o tu nombre<input required value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={profile.fullName} /></label>
          {sellErr && <p className="form__error">{sellErr}</p>}
          <button className="btn btn--primary">Activar cuenta de vendedor</button>
          <Link href="/vender" className="link-arrow small">Ver planes y precios →</Link>
        </form>
      )}

      {tab === "perfil" && (
        <form className="form form--narrow" onSubmit={async (e) => { e.preventDefault(); await backend.updateProfile(f); await refresh(); setSaved("Datos guardados."); setTimeout(() => setSaved(""), 2500); }}>
          <label>Nombre completo<input required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></label>
          <label>Teléfono o WhatsApp<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <label>Correo<input value={profile.email} disabled /></label>
          <button className="btn btn--primary">Guardar cambios</button>
          {saved && <p className="notice notice--ok">{saved}</p>}
        </form>
      )}
    </section>
  );
}

// Cuántas propiedades cumplen hoy una búsqueda guardada (filtros principales).
function countMatches(list: import("@/data/properties").Property[], query: string) {
  const q = new URLSearchParams(query);
  return list.filter((p) =>
    (!q.get("operacion") || p.operation === q.get("operacion")) &&
    (!q.get("tipo") || p.type === q.get("tipo")) &&
    (!q.get("ciudad") || p.city === q.get("ciudad")) &&
    (!q.get("hab") || p.bedrooms >= Number(q.get("hab")))
  ).length;
}
