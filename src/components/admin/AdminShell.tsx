"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { CalcIcon, CardIcon, ChartIcon, HomeIcon, InboxIcon, LogoutIcon, StoreIcon, UsersIcon } from "../Icons";

export type AdminTab = "resumen" | "propiedades" | "pagos" | "vendedores" | "consultas" | "usuarios" | "ajustes";
export type SellerTab = "resumen" | "propiedades" | "consultas" | "vitrina" | "planes";

type Item = { tab: string; label: string; icon: React.ReactNode };

const adminItems: Item[] = [
  { tab: "resumen", label: "Resumen", icon: <ChartIcon size={18} /> },
  { tab: "propiedades", label: "Propiedades", icon: <HomeIcon size={18} /> },
  { tab: "pagos", label: "Pagos", icon: <CardIcon size={18} /> },
  { tab: "vendedores", label: "Vendedores", icon: <StoreIcon size={18} /> },
  { tab: "consultas", label: "Consultas", icon: <InboxIcon size={18} /> },
  { tab: "usuarios", label: "Usuarios", icon: <UsersIcon size={18} /> },
  { tab: "ajustes", label: "Precios y ajustes", icon: <CalcIcon size={18} /> },
];

const sellerItems: Item[] = [
  { tab: "resumen", label: "Resumen", icon: <ChartIcon size={18} /> },
  { tab: "propiedades", label: "Mis propiedades", icon: <HomeIcon size={18} /> },
  { tab: "consultas", label: "Consultas", icon: <InboxIcon size={18} /> },
  { tab: "vitrina", label: "Mi vitrina", icon: <StoreIcon size={18} /> },
  { tab: "planes", label: "Planes y pagos", icon: <CardIcon size={18} /> },
];

// Marco común del panel: menú lateral y control de acceso. El administrador usa /admin
// y el vendedor /panel; cada uno ve solo sus secciones.
export default function AdminShell({ active, mode = "admin", badges = {}, children }: {
  active: string; mode?: "admin" | "seller"; badges?: Record<string, number>; children: React.ReactNode;
}) {
  const { profile, loading, backend, refresh } = useAuth();
  const router = useRouter();
  const base = mode === "admin" ? "/admin" : "/panel";

  useEffect(() => { if (!loading && !profile) router.replace(`/ingresar?next=${base}`); }, [loading, profile, router, base]);

  if (loading || !profile) return <section className="section container"><p className="muted">Cargando…</p></section>;
  const allowed = mode === "admin" ? profile.role === "admin" : profile.role === "seller" || profile.role === "admin";
  if (!allowed) {
    return mode === "admin" ? (
      <section className="section container narrow center">
        <h1 className="h2">Acceso solo para administradores</h1>
        <p className="muted">Tu cuenta no tiene permiso para este panel.</p>
        <Link className="btn btn--primary" href={profile.role === "seller" ? "/panel" : "/cuenta"}>Ir a mi cuenta</Link>
      </section>
    ) : (
      <section className="section container narrow center">
        <h1 className="h2">Este panel es para vendedores</h1>
        <p className="muted">Activa tu cuenta de vendedor desde tu cuenta para publicar tus propiedades.</p>
        <Link className="btn btn--primary" href="/cuenta?tab=vender">Quiero vender</Link>
      </section>
    );
  }

  const items = mode === "admin" ? adminItems : sellerItems;
  return (
    <div className="admin">
      <aside className="admin__nav">
        <p className="admin__brand">{mode === "admin" ? "Panel administrativo" : "Panel del vendedor"}</p>
        <nav>
          {items.map((i) => (
            <Link key={i.tab} href={i.tab === "resumen" ? base : `${base}?tab=${i.tab}`} className={active === i.tab ? "is-active" : ""}>
              {i.icon}<span>{i.label}</span>
              {badges[i.tab] ? <span className="count count--alert">{badges[i.tab]}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="admin__me">
          <span className="small">{profile.fullName || profile.email}</span>
          {mode === "seller" && profile.role === "admin" && <Link className="link-btn" href="/admin">Ir al panel administrativo</Link>}
          <button className="link-btn" onClick={async () => { router.replace("/"); await backend.signOut(); await refresh(); }}><LogoutIcon size={15} /> Salir</button>
        </div>
      </aside>
      <div className="admin__main">
        {backend.mode === "demo" && <div className="notice">Modo de prueba: los cambios se guardan solo en este navegador. Al conectar la base de datos quedarán guardados para todos.</div>}
        {children}
      </div>
    </div>
  );
}
