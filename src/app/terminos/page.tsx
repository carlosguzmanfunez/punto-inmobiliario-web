import { site } from "@/lib/site";

export const metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <section className="section container narrow prose">
      <h1 className="h2">Términos y condiciones</h1>
      <p className="muted">Última actualización: noviembre de 2026.</p>
      <h2 className="h3">Uso del sitio</h2>
      <p>{site.name} es una plataforma para publicar y encontrar propiedades en Honduras. Al usarla aceptas estos términos.</p>
      <h2 className="h3">Publicaciones</h2>
      <ul className="checklist">
        <li>El vendedor es responsable de que la información, el precio y las fotos sean ciertos y de tener derecho a ofrecer la propiedad.</li>
        <li>Podemos revisar, pausar o rechazar publicaciones que incumplan estas reglas o parezcan engañosas.</li>
        <li>Los planes pagados se activan al confirmar el pago y duran el número de días indicado. No se reembolsan una vez activados, salvo error nuestro.</li>
      </ul>
      <h2 className="h3">Transacciones</h2>
      <p>La compraventa o el alquiler se acuerdan entre comprador y vendedor. Recomendamos verificar documentos con un notario y hacer pagos solo por medios bancarios documentados.</p>
      <h2 className="h3">Contacto</h2>
      <p>Para cualquier duda escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </section>
  );
}
