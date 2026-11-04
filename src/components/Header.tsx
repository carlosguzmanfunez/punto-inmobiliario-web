import Link from "next/link";
import Logo from "./Logo";
import { mainNav, site, whatsappLink } from "@/lib/site";
import { ChevronDown, CloseIcon, MenuIcon, WhatsAppIcon } from "./Icons";
import AccountButton from "./AccountButton";
import { CurrencySwitch } from "./Price";

// Encabezado inspirado en la composición de Redfin: logo a la izquierda, menú horizontal
// con submenús y acciones a la derecha. Funciona sin JavaScript (menú móvil con checkbox).
export default function Header() {
  return (
    <header className="site-header">
      <input type="checkbox" id="nav-toggle" className="nav-toggle" aria-hidden />
      <div className="header-inner container">
        <label htmlFor="nav-toggle" className="icon-btn nav-open" aria-label="Abrir menú">
          <MenuIcon size={24} />
        </label>
        <Logo />
        <nav className="main-nav" aria-label="Principal">
          <label htmlFor="nav-toggle" className="icon-btn nav-close" aria-label="Cerrar menú">
            <CloseIcon size={24} />
          </label>
          <ul>
            {mainNav.map((item) => (
              <li key={item.label} className={item.children ? "has-sub" : undefined}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                  {item.children && <ChevronDown size={14} className="chev" />}
                </Link>
                {item.children && (
                  <div className="submenu">
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <Link href={c.href}>
                            <span>{c.label}</span>
                            {c.description && <small>{c.description}</small>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="nav-mobile-cta">
            <CurrencySwitch className="currency-switch--block" />
            <a className="btn btn--wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={20} /> Escríbenos por WhatsApp
            </a>
            <Link className="btn btn--outline" href="/vender">Publicar mi propiedad</Link>
          </div>
        </nav>
        <div className="header-actions">
          <CurrencySwitch variant="toggle" />
          <Link className="btn btn--primary btn--sm header-publish" href="/vender">Publicar</Link>
          <a className="header-phone" aria-label="WhatsApp" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> <span>{site.whatsappDisplay}</span>
          </a>
          <AccountButton />
        </div>
      </div>
      <label htmlFor="nav-toggle" className="nav-backdrop" aria-hidden />
    </header>
  );
}
