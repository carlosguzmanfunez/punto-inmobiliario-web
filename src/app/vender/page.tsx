import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/Icons";

export const metadata = { title: "Vender o publicar tu propiedad" };

export default function SellPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Vender o alquilar</span>
          <h1>Publica tu propiedad y llega a compradores serios</h1>
          <p>Nos encargamos de las fotos, la publicación y de filtrar a los interesados para que solo recibas visitas reales.</p>
          <a className="btn btn--wa btn--lg" href={whatsappLink("Hola, quiero publicar mi propiedad con Punto Inmobiliario Hn.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={20} /> Quiero publicar</a>
        </div>
      </section>
      <section className="section container">
        <ol className="steps">
          <li><span className="steps__n">1</span><h3>Evaluamos tu propiedad</h3><p className="muted">Te damos un precio sugerido según el mercado de tu zona.</p></li>
          <li><span className="steps__n">2</span><h3>Fotos y descripción</h3><p className="muted">Preparamos una publicación atractiva y completa.</p></li>
          <li><span className="steps__n">3</span><h3>Difusión</h3><p className="muted">Tu propiedad aparece en el sitio, redes sociales y con clientes en el extranjero.</p></li>
          <li><span className="steps__n">4</span><h3>Cierre seguro</h3><p className="muted">Te acompañamos en la negociación y la firma.</p></li>
        </ol>
      </section>
    </>
  );
}
