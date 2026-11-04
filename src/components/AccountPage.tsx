"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Inquiry } from "@/lib/backend";
import { formatDate, statusLabel } from "@/lib/labels";
import { useAuth } from "./AuthProvider";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";
import { HeartIcon, InboxIcon, LogoutIcon, UserIcon } from "./Icons";

type Tab = "favoritos" | "consultas" | "perfil";

export default function AccountPage() {
  const { backend, profile, loading, favorites, refresh } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get("tab") as Tab) || "favoritos");
  const { list } = useProperties();
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [f, setF] = useState({ fullName: "", phone: "" });
  const [saved, setSaved] = useState("");

  useEffect(() => { if (!loading && !profile) router.replace("/ingresar?next=/cuenta"); }, [loading, profile, router]);
  useEffect(() => { if (profile) { setF({ fullName: profile.fullName, phone: profile.phone }); backend.listMyInquiries().then(setInquiries); } }, [profile, backend]);

  if (!profile) return <section className="section container"><p className="muted">Cargando tu cuenta…</p></section>;
  const favs = (list ?? []).filter((p) => favorites.has(p.id));

  return (
    <section className="section container account">
      <div className="account__head">
        <div className="avatar" aria-hidden>{(profile.fullName || profile.email).slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="h2">Hola, {profile.fullName.split(" ")[0] || "bienvenido"}</h1>
          <p className="muted">{profile.email}{profile.role === "admin" && <> · <Link className="link-arrow" href="/admin">Ir al panel de administración →</Link></>}</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={async () => { router.replace("/"); await backend.signOut(); await refresh(); }}><LogoutIcon size={16} /> Cerrar sesión</button>
      </div>

      <div className="tabs tabs--line" role="tablist">
        <button role="tab" aria-selected={tab === "favoritos"} className={tab === "favoritos" ? "is-active" : ""} onClick={() => setTab("favoritos")}><HeartIcon size={16} /> Favoritos <span className="count">{favorites.size}</span></button>
        <button role="tab" aria-selected={tab === "consultas"} className={tab === "consultas" ? "is-active" : ""} onClick={() => setTab("consultas")}><InboxIcon size={16} /> Mis consultas <span className="count">{inquiries?.length ?? 0}</span></button>
        <button role="tab" aria-selected={tab === "perfil"} className={tab === "perfil" ? "is-active" : ""} onClick={() => setTab("perfil")}><UserIcon size={16} /> Mis datos</button>
      </div>

      {tab === "favoritos" && (favs.length ? (
        <div className="grid-cards">{favs.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="empty"><p>Todavía no has guardado propiedades. Toca el corazón ♡ en cualquier propiedad para guardarla aquí.</p><Link className="btn btn--primary" href="/propiedades">Explorar propiedades</Link></div>
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
