import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import FeaturedProperties from "@/components/FeaturedProperties";
import { whatsappLink } from "@/lib/site";
import { BankIcon, GlobeIcon, KeyIcon, ShieldIcon, VideoIcon, WhatsAppIcon } from "@/components/Icons";

const quickCities = [
  { label: "Tegucigalpa", href: "/propiedades?ciudad=Tegucigalpa" },
  { label: "San Pedro Sula", href: "/propiedades?ciudad=San+Pedro+Sula" },
  { label: "Roatán", href: "/propiedades?ciudad=Roat%C3%A1n" },
  { label: "La Ceiba", href: "/propiedades?ciudad=La+Ceiba" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="container hero__content">
          <h1>Encuentra tu lugar en Honduras</h1>
          <p className="hero__sub">Casas, apartamentos y terrenos verificados, con asesoría personal de principio a fin.</p>
          <HeroSearch />
          <div className="hero__chips">
            <span>Populares:</span>
            {quickCities.map((c) => <Link key={c.label} href={c.href} className="chip chip--glass">{c.label}</Link>)}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2>Propiedades destacadas</h2>
            <p className="muted">Seleccionadas por nuestro equipo esta semana.</p>
          </div>
          <Link href="/propiedades" className="link-arrow">Ver todas →</Link>
        </div>
        <FeaturedProperties />
      </section>

      <section className="section section--tint">
        <div className="container">
          <h2 className="center">¿Cómo te ayudamos?</h2>
          <div className="services">
            <Link href="/extranjero" className="service">
              <span className="service__icon"><GlobeIcon size={26} /></span>
              <h3>Clientes en el extranjero</h3>
              <p>Compra en Honduras desde Estados Unidos, España o donde estés. Recorridos por videollamada y trámites a distancia.</p>
              <span className="link-arrow">Conocer más →</span>
            </Link>
            <Link href="/financiamiento" className="service">
              <span className="service__icon"><BankIcon size={26} /></span>
              <h3>Financiamiento</h3>
              <p>Te orientamos con bancos y cooperativas para que encuentres la cuota que se ajusta a tu presupuesto.</p>
              <span className="link-arrow">Calcular mi cuota →</span>
            </Link>
            <Link href="/vender" className="service">
              <span className="service__icon"><KeyIcon size={26} /></span>
              <h3>Vende o alquila tu propiedad</h3>
              <p>Publica tu casa, apartamento o terreno con fotos profesionales y llega a compradores serios.</p>
              <span className="link-arrow">Publicar ahora →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section container trust">
        <div className="trust__item"><ShieldIcon size={28} /><div><h3>Propiedades verificadas</h3><p className="muted">Revisamos documentos y visitamos cada propiedad antes de publicarla.</p></div></div>
        <div className="trust__item"><VideoIcon size={28} /><div><h3>Visitas virtuales</h3><p className="muted">Recorre la propiedad en vivo por videollamada, estés donde estés.</p></div></div>
        <div className="trust__item"><WhatsAppIcon size={28} /><div><h3>Respuesta rápida</h3><p className="muted">Atención directa por WhatsApp con un asesor, sin intermediarios.</p></div></div>
      </section>

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>¿Tienes dudas? Hablemos por WhatsApp</h2>
            <p>Cuéntanos qué buscas y te enviamos opciones en minutos.</p>
          </div>
          <a className="btn btn--wa btn--lg" href={whatsappLink("Hola, estoy buscando una propiedad y me gustaría asesoría.")} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> Escribir por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
