"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { ChartIcon, ChevronDown, HomeIcon, StoreIcon, UserIcon } from "./Icons";

// Las tres formas de usar el sitio. El administrador puede entrar a cualquiera desde aquí.
const views = [
  { href: "/admin", label: "Administrador", hint: "Métricas, pagos, inventario y clientes", icon: <ChartIcon size={18} /> },
  { href: "/panel", label: "Vendedor", hint: "Publicar, planes, vitrina y consultas", icon: <StoreIcon size={18} /> },
  { href: "/cuenta", label: "Comprador", hint: "Favoritos, búsquedas y consultas", icon: <HomeIcon size={18} /> },
];

export default function AccountButton() {
  const { profile, loading } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (loading || !profile) {
    return <Link className="btn btn--primary btn--sm" href="/ingresar"><UserIcon size={16} /> <span>Ingresar</span></Link>;
  }
  const first = profile.fullName.split(" ")[0] || "Mi cuenta";
  if (profile.role === "admin") {
    const current = views.find((v) => path?.startsWith(v.href));
    return (
      <div className="account-switch" ref={ref}>
        <button type="button" className="btn btn--primary btn--sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <UserIcon size={16} /> <span>{first}</span> <ChevronDown size={14} />
        </button>
        {open && (
          <div className="account-switch__menu" role="menu">
            <p className="account-switch__title">Entrar como</p>
            {views.map((v) => (
              <Link key={v.href} role="menuitem" href={v.href} className={current?.href === v.href ? "is-active" : ""}>
                <span className="account-switch__icon">{v.icon}</span>
                <span><strong>{v.label}</strong><small>{v.hint}</small></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="account-actions">
      {profile.role === "seller" && <Link className="btn btn--outline btn--sm" href="/panel">Mi panel</Link>}
      <Link className="btn btn--primary btn--sm" href="/cuenta"><UserIcon size={16} /> <span>{first}</span></Link>
    </div>
  );
}
