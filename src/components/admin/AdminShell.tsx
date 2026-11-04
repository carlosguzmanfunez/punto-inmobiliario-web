"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { ChartIcon, HomeIcon, InboxIcon, LogoutIcon, UsersIcon } from "../Icons";

export type AdminTab = "resumen" | "propiedades" | "consultas" | "usuarios";

const items: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
  { tab: "resumen", label: "Resumen", icon: <ChartIcon size={18} /> },
  { tab: "propiedades", label: "Propiedades", icon: <HomeIcon size={18} /> },
  { tab: "consultas", label: "Consultas", icon: <InboxIcon size={18} /> },
  { tab: "usuarios", label: "Usuarios", icon: <UsersIcon size={18} /> },
];

export default function AdminShell({ active, badge, children }: { active: AdminTab; badge?: number; children: React.ReactNode }) {
  const { profile, loading, backend, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !profile) router.replace("/ingresar?next=/admin"); }, [loading, profile, router]);

  if (loading || !profile) return <section className="section container"><p className="muted">Cargando…</p></section>;
  if (profile.role !== "admin") {
    return (
      <section className="section container narrow center">
        <h1 className="h2">Acceso solo para administradores</h1>
        <p className="muted">Tu cuenta no tiene permiso para el panel. Si trabajas en Punto Inmobiliario, pide a un administrador que te dé acceso.</p>
        <Link className="btn btn--primary" href="/cuenta">Ir a mi cuenta</Link>
      </section>
    );
  }

  return (
    <div className="admin">
      <aside className="admin__nav">
        <p className="admin__brand">Panel administrativo</p>
        <nav>
          {items.map((i) => (
            <Link key={i.tab} href={i.tab === "resumen" ? "/admin" : `/admin?tab=${i.tab}`} className={active === i.tab ? "is-active" : ""}>
              {i.icon}<span>{i.label}</span>
              {i.tab === "consultas" && badge ? <span className="count count--alert">{badge}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="admin__me">
          <span className="small">{profile.fullName || profile.email}</span>
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
