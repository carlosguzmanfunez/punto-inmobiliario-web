import Link from "next/link";
import { formatLempiras, plans, whatsappLink } from "@/lib/site";
import { CheckIcon, LinkIcon, StoreIcon, WhatsAppIcon } from "@/components/Icons";

export const metadata = { title: "Vende o alquila tu propiedad" };

const signup = "/ingresar?modo=registro&tipo=vendedor";

const faqs = [
  { q: "¿Cuánto cuesta crear mi cuenta de vendedor?", a: "Nada. Crear tu cuenta, subir fotos y preparar tus propiedades es gratis. Solo pagas cuando decides publicarlas." },
  { q: "¿Cómo pago?", a: "Por transferencia o depósito bancario. Escribes la referencia en tu panel y activamos tu publicación en cuanto confirmamos el pago." },
  { q: "¿Qué es el link profesional?", a: "Es la página de tu propiedad en Punto Inmobiliario, con galería, características, precio y botón de WhatsApp. Lo copias desde tu panel y lo envías a tus compradores." },
  { q: "¿Qué pasa cuando vencen los 30 días?", a: "La publicación deja de mostrarse, pero no se borra. La renuevas desde tu panel y vuelve a estar activa con el mismo link." },
];

export default function SellPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Para vendedores, corredores y desarrolladores</span>
          <h1>Publica tu propiedad con un link profesional</h1>
          <p>Sube tus fotos, arma una publicación que genera confianza y envíala a tus compradores por WhatsApp. Nosotros te traemos más interesados.</p>
          <div className="hero-ctas">
            <Link className="btn btn--primary btn--lg" href={signup}>Crear cuenta de vendedor</Link>
            <a className="btn btn--outline btn--lg" href={whatsappLink("Hola, quiero publicar mi propiedad con Punto Inmobiliario Hn.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={20} /> Hablar con un asesor</a>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Así funciona</h2>
        <ol className="steps">
          <li><span className="steps__n">1</span><h3>Crea tu cuenta gratis</h3><p className="muted">Regístrate como vendedor en un minuto.</p></li>
          <li><span className="steps__n">2</span><h3>Sube tu propiedad</h3><p className="muted">Fotos, precio, características y descripción desde tu panel.</p></li>
          <li><span className="steps__n">3</span><h3>Elige tu plan y paga</h3><p className="muted">Transferencia o depósito. Activamos tu publicación al confirmar.</p></li>
          <li><span className="steps__n">4</span><h3>Comparte tu link</h3><p className="muted">Envíalo a tus compradores y recibe consultas en tu WhatsApp y tu panel.</p></li>
        </ol>
      </section>

      <section id="planes" className="section section--tint">
        <div className="container">
          <h2 className="center">Planes</h2>
          <p className="muted center">Precios en lempiras por {plans.publicacion.days} días. Sin contratos ni comisiones por venta.</p>
          <div className="plans">
            {Object.values(plans).map((p) => (
              <div key={p.kind} id={p.kind === "vitrina" ? "vitrina" : undefined} className={`plan${p.kind === "destacada" ? " plan--featured" : ""}`}>
                {p.kind === "destacada" && <span className="plan__tag">Más visto</span>}
                <span className="plan__icon">{p.kind === "vitrina" ? <StoreIcon size={24} /> : <LinkIcon size={24} />}</span>
                <h3>{p.name}</h3>
                <p className="plan-price">{formatLempiras(p.price)} <small>{p.kind === "vitrina" ? "al mes" : "por propiedad"}</small></p>
                <p className="muted">{p.summary}</p>
                <ul className="plan__perks">{p.perks.map((x) => <li key={x}><CheckIcon size={16} /> {x}</li>)}</ul>
                <Link className={`btn btn--block ${p.kind === "destacada" ? "btn--primary" : "btn--outline"}`} href={signup}>Empezar</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container narrow">
        <h2>Preguntas frecuentes</h2>
        {faqs.map((f) => <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </section>
    </>
  );
}
