// Imagen de la cabecera de las páginas informativas, con una tarjeta flotante que resume
// el beneficio principal. Si la foto no carga, ImageFallback la cambia por una ilustración.
export default function PageHeroMedia({ src, icon, title, text }: { src: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <figure className="page-hero__media">
      <img src={src} alt="" />
      <figcaption className="page-hero__card">
        <span className="page-hero__card-icon">{icon}</span>
        <span><strong>{title}</strong><small>{text}</small></span>
      </figcaption>
    </figure>
  );
}
