import Link from "next/link";
import Logo from "./Logo";
import { site, whatsappLink } from "@/lib/site";
import { MailIcon, PinIcon, WhatsAppIcon } from "./Icons";

const places = [
  { label: "Francisco Morazán", href: "/propiedades?depto=Francisco+Moraz%C3%A1n" },
  { label: "Cortés", href: "/propiedades?depto=Cort%C3%A9s" },
  { label: "Islas de la Bahía", href: "/propiedades?depto=Islas+de+la+Bah%C3%ADa" },
  { label: "Atlántida", href: "/propiedades?depto=Atl%C3%A1ntida" },
  { label: "Comayagua", href: "/propiedades?depto=Comayagua" },
  { label: "Choluteca", href: "/propiedades?depto=Choluteca" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-tag">{site.tagline}.</p>
          <ul className="footer-contact">
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> {site.whatsappDisplay}</a></li>
            <li><a href={`mailto:${site.email}`}><MailIcon size={16} /> {site.email}</a></li>
            <li><span><PinIcon size={16} /> {site.address}</span></li>
          </ul>
          <p className="muted-light">{site.hours}</p>
        </div>
        <div>
          <h4>Propiedades</h4>
          <ul>
            <li><Link href="/propiedades?operacion=venta">Comprar</Link></li>
            <li><Link href="/propiedades?operacion=alquiler">Alquilar</Link></li>
            <li><Link href="/propiedades?tipo=terreno">Terrenos</Link></li>
            <li><Link href="/proyectos">Proyectos</Link></li>
            <li><Link href="/comparar">Comparar</Link></li>
          </ul>
        </div>
        <div>
          <h4>Descubre</h4>
          <ul>{places.map((p) => <li key={p.label}><Link href={p.href}>{p.label}</Link></li>)}</ul>
        </div>
        <div>
          <h4>Vendedores</h4>
          <ul>
            <li><Link href="/vender">Publicar mi propiedad</Link></li>
            <li><Link href="/vender#planes">Planes y precios</Link></li>
            <li><Link href="/vender#vitrina">Vitrina para constructoras</Link></li>
            <li><Link href="/servicios">Servicios</Link></li>
            <li><Link href="/ingresar">Ingresar a mi panel</Link></li>
          </ul>
        </div>
        <div>
          <h4>Punto Inmobiliario</h4>
          <ul>
            <li><Link href="/quienes-somos">Quiénes somos</Link></li>
            <li><Link href="/extranjero">Clientes en el extranjero</Link></li>
            <li><Link href="/financiamiento">Financiamiento</Link></li>
            <li><Link href="/guias">Guías y consejos</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</span>
        <span className="footer-legal"><Link href="/privacidad">Privacidad</Link> · <Link href="/terminos">Términos</Link> · Hecho en Honduras 🇭🇳</span>
      </div>
    </footer>
  );
}
