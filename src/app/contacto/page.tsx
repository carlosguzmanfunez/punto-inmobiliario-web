import { site, whatsappLink } from "@/lib/site";
import { MailIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";

export const metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contacto</span>
          <h1>Estamos para ayudarte</h1>
          <p>Escríbenos por el canal que prefieras. Respondemos {site.hours.toLowerCase()}.</p>
        </div>
      </section>
      <section className="section container">
        <div className="services">
          <a className="service" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <span className="service__icon service__icon--wa"><WhatsAppIcon size={26} /></span>
            <h3>WhatsApp</h3><p>{site.whatsappDisplay}</p><span className="link-arrow">Abrir chat →</span>
          </a>
          <a className="service" href={`mailto:${site.email}`}>
            <span className="service__icon"><MailIcon size={26} /></span>
            <h3>Correo</h3><p>{site.email}</p><span className="link-arrow">Enviar correo →</span>
          </a>
          <div className="service">
            <span className="service__icon"><PinIcon size={26} /></span>
            <h3>Oficina</h3><p>{site.address}</p><p className="muted small">Visitas con cita previa.</p>
          </div>
        </div>
      </section>
    </>
  );
}
