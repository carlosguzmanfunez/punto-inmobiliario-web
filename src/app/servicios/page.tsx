import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { BankIcon, CameraIcon, FileIcon, KeyIcon, MapIcon, VideoIcon, WhatsAppIcon } from "@/components/Icons";

export const metadata = { title: "Servicios" };

const services = [
  { icon: <CameraIcon size={26} />, title: "Fotografía profesional", text: "Sesión de fotos con luz y ángulos que hacen que tu propiedad destaque. Las publicaciones con buenas fotos reciben muchas más consultas.", ask: "fotografía profesional" },
  { icon: <VideoIcon size={26} />, title: "Video y tomas con dron", text: "Video recorrido y vistas aéreas del terreno, la vista y los alrededores. Ideal para terrenos, casas de campo y proyectos.", ask: "video con dron" },
  { icon: <MapIcon size={26} />, title: "Recorrido virtual 360°", text: "Un recorrido interactivo para que compradores en el extranjero conozcan cada espacio sin viajar.", ask: "recorrido virtual 360" },
  { icon: <BankIcon size={26} />, title: "Avalúos", text: "Te conectamos con valuadores para conocer el precio justo de mercado o para presentar al banco.", ask: "avalúo" },
  { icon: <FileIcon size={26} />, title: "Trámites y acompañamiento legal", text: "Revisión de escrituras, solvencias, inscripción en el Instituto de la Propiedad y poderes consulares con notarios de confianza.", ask: "trámites legales" },
  { icon: <KeyIcon size={26} />, title: "Administración de alquileres", text: "Buscamos inquilinos, revisamos referencias, hacemos el contrato y damos seguimiento a pagos y mantenimiento.", ask: "administración de alquileres" },
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Servicios</span>
          <h1>Todo lo que tu propiedad necesita</h1>
          <p>Además de publicar, te ayudamos a presentar, valorar y cerrar con seguridad. Cotiza cada servicio por WhatsApp.</p>
        </div>
      </section>
      <section className="section container">
        <div className="services">
          {services.map((s) => (
            <div key={s.title} className="service">
              <span className="service__icon">{s.icon}</span>
              <h2 className="h3">{s.title}</h2>
              <p>{s.text}</p>
              <a className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer" href={whatsappLink(`Hola, quiero cotizar el servicio de ${s.ask}.`)}><WhatsAppIcon size={16} /> Cotizar</a>
            </div>
          ))}
        </div>
      </section>
      <section className="section container">
        <div className="cta-band">
          <div><h2>¿Listo para publicar?</h2><p>Crea tu cuenta de vendedor y agrega los servicios que necesites.</p></div>
          <Link className="btn btn--lg btn--light" href="/vender">Ver planes de publicación</Link>
        </div>
      </section>
    </>
  );
}
