import { site, whatsappLink } from "@/lib/site";
import { MailIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";
import InquiryForm from "@/components/InquiryForm";
import PageHeroMedia from "@/components/PageHeroMedia";
import { photos } from "@/data/photos";

export const metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <>
      <section className="page-hero page-hero--media">
        <div className="container page-hero__grid">
          <div className="page-hero__text">
            <span className="eyebrow">Contacto</span>
            <h1>Estamos para ayudarte</h1>
            <p>Escríbenos por el canal que prefieras. Respondemos {site.hours.toLowerCase()}.</p>
          </div>
          <PageHeroMedia src={photos.oficinaAbierta} icon={<WhatsAppIcon size={20} />} title="Atención por WhatsApp" text="Te responde una persona, no un robot" />
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
      <section className="section section--tint">
        <div className="container contact-grid">
          <div>
            <h2>Escríbenos</h2>
            <p className="muted">Déjanos tu mensaje y te respondemos por WhatsApp o correo. Si buscas algo concreto, cuéntanos ciudad, presupuesto y tipo de propiedad.</p>
            <ul className="checklist">
              <li>Compra, venta y alquiler en toda Honduras</li>
              <li>Atención a hondureños en el extranjero</li>
              <li>Publicación para dueños, agentes y constructoras</li>
            </ul>
          </div>
          <div className="panel"><InquiryForm propertyId={null} defaultMessage="Hola, quisiera información sobre…" /></div>
        </div>
      </section>
    </>
  );
}
