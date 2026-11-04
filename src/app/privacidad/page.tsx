import { site } from "@/lib/site";

export const metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <section className="section container narrow prose">
      <h1 className="h2">Política de privacidad</h1>
      <p className="muted">Última actualización: noviembre de 2026.</p>
      <p>En {site.name} cuidamos los datos que nos compartes. Esta política explica qué datos recogemos, para qué los usamos y cómo puedes pedir que los cambiemos o borremos.</p>
      <h2 className="h3">Datos que recogemos</h2>
      <ul className="checklist">
        <li>Los datos de tu cuenta: nombre, correo y teléfono o WhatsApp.</li>
        <li>Las consultas que envías sobre una propiedad y las búsquedas o favoritos que guardas.</li>
        <li>Si eres vendedor: los datos de tus publicaciones, tu vitrina y las referencias de pago que registras.</li>
      </ul>
      <h2 className="h3">Para qué los usamos</h2>
      <p>Para responder tus consultas, conectar compradores con vendedores, activar planes pagados y mejorar el sitio. No vendemos tus datos a terceros.</p>
      <h2 className="h3">Con quién los compartimos</h2>
      <p>Cuando consultas por una propiedad publicada por un vendedor, ese vendedor recibe tu nombre, correo, teléfono y mensaje para poder atenderte.</p>
      <h2 className="h3">Tus derechos</h2>
      <p>Puedes actualizar tus datos desde tu cuenta o escribirnos a <a href={`mailto:${site.email}`}>{site.email}</a> para pedir una copia o la eliminación de tu información.</p>
    </section>
  );
}
