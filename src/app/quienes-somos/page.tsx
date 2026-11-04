import { site } from "@/lib/site";
import PageHeroMedia from "@/components/PageHeroMedia";
import { photos } from "@/data/photos";
import { ShieldIcon } from "@/components/Icons";

export const metadata = { title: "Quiénes somos" };

export default function AboutPage() {
  return (
    <>
      <section className="page-hero page-hero--media">
        <div className="container page-hero__grid">
          <div className="page-hero__text">
            <span className="eyebrow">Quiénes somos</span>
            <h1>Somos tu punto de encuentro inmobiliario en Honduras</h1>
            <p>{site.name} nace para que comprar, vender o alquilar una propiedad sea claro, seguro y cercano.</p>
          </div>
          <PageHeroMedia src={photos.ciudad} icon={<ShieldIcon size={20} />} title="Propiedades verificadas" text="Revisamos cada publicación" />
        </div>
      </section>
      <section className="section container narrow prose">
        <h2>Nuestra misión</h2>
        <p>Conectar a familias e inversionistas con la propiedad correcta, con información verificada, precios transparentes y un acompañamiento humano en cada paso.</p>
        <h2>Nuestros valores</h2>
        <div className="services services--3">
          <div className="service"><h3>Transparencia</h3><p>Publicamos precios reales y documentos revisados.</p></div>
          <div className="service"><h3>Cercanía</h3><p>Hablas con una persona, no con un sistema automático.</p></div>
          <div className="service"><h3>Confianza</h3><p>Cuidamos tu dinero y tu tiempo como si fueran nuestros.</p></div>
        </div>
        <h2>Dónde estamos</h2>
        <p>Atendemos Tegucigalpa, San Pedro Sula y las principales ciudades del país, además de clientes hondureños en el extranjero.</p>
      </section>
    </>
  );
}
