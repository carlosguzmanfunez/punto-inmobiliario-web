import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import FeaturedProperties from "@/components/FeaturedProperties";
import { CityExplorer, ProjectsBlock, PublishLead, PublishSteps, TypeExplorer } from "@/components/HomeSections";
import { guides } from "@/data/guides";
import { whatsappLink } from "@/lib/site";
import { BankIcon, CameraIcon, GlobeIcon, KeyIcon, ShieldIcon, VideoIcon, WhatsAppIcon } from "@/components/Icons";

const quickLinks = [
  { label: "Casas en Tegucigalpa", href: "/propiedades?tipo=casa&ciudad=Tegucigalpa&depto=Francisco+Moraz%C3%A1n" },
  { label: "Apartamentos en alquiler", href: "/propiedades?operacion=alquiler&tipo=apartamento" },
  { label: "San Pedro Sula", href: "/propiedades?ciudad=San+Pedro+Sula&depto=Cort%C3%A9s" },
  { label: "Frente al mar", href: "/propiedades?am=Frente+al+mar" },
  { label: "Terrenos", href: "/propiedades?tipo=terreno" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="container hero__content">
          <span className="hero__eyebrow">🇭🇳 Bienes raíces en toda Honduras</span>
          <h1>Encuentra tu lugar en Honduras</h1>
          <p className="hero__sub">Casas, apartamentos, terrenos y locales verificados, con asesoría personal por WhatsApp de principio a fin.</p>
          <HeroSearch />
          <div className="hero__chips">
            <span>Populares:</span>
            {quickLinks.map((c) => <Link key={c.label} href={c.href} className="chip chip--glass">{c.label}</Link>)}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2>Propiedades destacadas</h2>
            <p className="muted">Seleccionadas por nuestro equipo y por vendedores con plan destacado.</p>
          </div>
          <Link href="/propiedades" className="link-arrow">Ver todas →</Link>
        </div>
        <FeaturedProperties />
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <div><h2>Explora por tipo de propiedad</h2><p className="muted">Para vivir, invertir o abrir tu negocio.</p></div>
          </div>
          <TypeExplorer />
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div><h2>Proyectos y desarrolladores</h2><p className="muted">Constructoras y vendedores con su propia vitrina en Punto Inmobiliario.</p></div>
          <Link href="/proyectos" className="link-arrow">Ver todos →</Link>
        </div>
        <ProjectsBlock />
      </section>

      <section className="section container">
        <div className="section__head">
          <div><h2>Explora por ciudad</h2><p className="muted">De la capital a las islas.</p></div>
          <Link href="/propiedades" className="link-arrow">Todas las ciudades →</Link>
        </div>
        <CityExplorer />
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
              <p>Calcula tu cuota y te orientamos con bancos y cooperativas para encontrar la que se ajusta a tu presupuesto.</p>
              <span className="link-arrow">Calcular mi cuota →</span>
            </Link>
            <Link href="/servicios" className="service">
              <span className="service__icon"><CameraIcon size={26} /></span>
              <h3>Fotos, video y avalúos</h3>
              <p>Fotografía profesional, video con dron, recorridos virtuales, avalúos y acompañamiento legal para tu propiedad.</p>
              <span className="link-arrow">Ver servicios →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section container publish" id="publicar">
        <div>
          <span className="eyebrow"><KeyIcon size={16} /> Para dueños, agentes y constructoras</span>
          <h2>Publica tu propiedad con nosotros</h2>
          <p className="muted">Llega a compradores en Honduras y en el extranjero con una publicación profesional y un link listo para compartir.</p>
          <PublishSteps />
          <div className="demo-box__row">
            <Link href="/ingresar?modo=registro&tipo=vendedor" className="btn btn--primary">Publicar yo mismo</Link>
            <Link href="/vender#planes" className="btn btn--outline">Ver planes y precios</Link>
          </div>
        </div>
        <PublishLead />
      </section>

      <section className="section container trust">
        <div className="trust__item"><ShieldIcon size={28} /><div><h3>Propiedades verificadas</h3><p className="muted">Revisamos documentos y datos de cada publicación antes de aprobarla.</p></div></div>
        <div className="trust__item"><VideoIcon size={28} /><div><h3>Visitas virtuales</h3><p className="muted">Recorre la propiedad en vivo por videollamada, estés donde estés.</p></div></div>
        <div className="trust__item"><WhatsAppIcon size={28} /><div><h3>Respuesta rápida</h3><p className="muted">Atención directa por WhatsApp con un asesor o con el vendedor.</p></div></div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <div><h2>Guías y consejos</h2><p className="muted">Lo que necesitas saber para comprar, vender o invertir en Honduras.</p></div>
            <Link href="/guias" className="link-arrow">Ver todas →</Link>
          </div>
          <div className="guide-grid scroll-row">
            {guides.slice(0, 3).map((g) => (
              <Link key={g.slug} href={`/guias/${g.slug}`} className="guide-card">
                <img src={g.image} alt="" loading="lazy" />
                <div><span className="eyebrow">{g.category} · {g.minutes} min</span><h3>{g.title}</h3><p className="muted small">{g.summary}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>¿Tienes dudas? Hablemos por WhatsApp</h2>
            <p>Cuéntanos qué buscas y te enviamos opciones que se ajusten a tu presupuesto.</p>
          </div>
          <a className="btn btn--wa btn--lg" href={whatsappLink("Hola, estoy buscando una propiedad y me gustaría asesoría.")} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={22} /> Escribir por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
