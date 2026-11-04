import Link from "next/link";
import Logo from "./Logo";
import { site, whatsappLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-tag">{site.tagline}.</p>
          <p className="muted-light">{site.address}<br />{site.hours}</p>
        </div>
        <div>
          <h4>Propiedades</h4>
          <ul>
            <li><Link href="/propiedades?operacion=venta">Comprar</Link></li>
            <li><Link href="/propiedades?operacion=alquiler">Alquilar</Link></li>
            <li><Link href="/propiedades?tipo=terreno">Terrenos</Link></li>
            <li><Link href="/vender">Vender o publicar</Link></li>
          </ul>
        </div>
        <div>
          <h4>Servicios</h4>
          <ul>
            <li><Link href="/extranjero">Clientes en el extranjero</Link></li>
            <li><Link href="/financiamiento">Financiamiento</Link></li>
            <li><Link href="/quienes-somos">Quiénes somos</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4>Hablemos</h4>
          <ul>
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a></li>
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</span>
        <span>Hecho en Honduras 🇭🇳</span>
      </div>
    </footer>
  );
}
