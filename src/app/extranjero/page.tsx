import { whatsappLink } from "@/lib/site";
import { BankIcon, GlobeIcon, ShieldIcon, VideoIcon, WhatsAppIcon } from "@/components/Icons";

export const metadata = { title: "Clientes en el extranjero" };

const faqs = [
  { q: "¿Puedo comprar sin viajar a Honduras?", a: "Sí. Hacemos el recorrido por videollamada, revisamos los documentos contigo y la firma puede hacerse mediante un poder especial otorgado en el consulado hondureño más cercano." },
  { q: "¿Cómo envío el dinero de forma segura?", a: "Los pagos se hacen por transferencia bancaria directamente a la cuenta del vendedor o a una cuenta de custodia del notario, nunca en efectivo ni a cuentas personales de asesores." },
  { q: "¿Puedo obtener un préstamo si vivo afuera?", a: "Varios bancos hondureños tienen programas para hondureños en el exterior. Te ayudamos a preparar los requisitos y a comparar opciones." },
  { q: "¿Quién cuida la propiedad después de la compra?", a: "Podemos conectarte con servicios de administración para mantenimiento, pago de impuestos y alquiler de la propiedad mientras estás fuera." },
];

export default function AbroadPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow"><GlobeIcon size={16} /> Hondureños en el extranjero</span>
          <h1>Invierte en tu tierra, estés donde estés</h1>
          <p>Te acompañamos en cada paso para comprar casa, apartamento o terreno en Honduras desde Estados Unidos, España, Canadá o cualquier país.</p>
          <a className="btn btn--wa btn--lg" href={whatsappLink("Hola, vivo fuera de Honduras y quiero comprar una propiedad.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={20} /> Agendar videollamada</a>
        </div>
      </section>
      <section className="section container">
        <h2>Así funciona</h2>
        <ol className="steps">
          <li><span className="steps__n">1</span><h3>Cuéntanos qué buscas</h3><p className="muted">Ciudad, presupuesto y para qué la quieres: vivir, retirarte o invertir.</p></li>
          <li><span className="steps__n">2</span><h3>Recorrido virtual</h3><p className="muted">Visitamos las propiedades contigo en vivo por videollamada.</p></li>
          <li><span className="steps__n">3</span><h3>Revisión legal</h3><p className="muted">Verificamos escritura, gravámenes y pagos al día con un notario.</p></li>
          <li><span className="steps__n">4</span><h3>Firma a distancia</h3><p className="muted">Firmas mediante poder consular y recibes tu escritura registrada.</p></li>
        </ol>
      </section>
      <section id="inversion" className="section section--tint">
        <div className="container services">
          <div className="service"><span className="service__icon"><BankIcon size={26} /></span><h3>Remesas que construyen patrimonio</h3><p>Convierte tus envíos en una propiedad propia en lugar de pagar alquiler.</p></div>
          <div className="service"><span className="service__icon"><ShieldIcon size={26} /></span><h3>Pagos seguros</h3><p>Transferencias bancarias documentadas y cuentas de custodia con notario.</p></div>
          <div className="service"><span className="service__icon"><VideoIcon size={26} /></span><h3>Seguimiento constante</h3><p>Fotos y videos del avance de trámites o construcción cada semana.</p></div>
        </div>
      </section>
      <section id="preguntas" className="section container narrow">
        <h2>Preguntas frecuentes</h2>
        {faqs.map((f) => (
          <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </section>
    </>
  );
}
