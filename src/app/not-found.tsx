import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section container narrow center">
      <h1 className="h2">No encontramos esta página</h1>
      <p className="muted">Puede que la propiedad ya no esté disponible.</p>
      <Link className="btn btn--primary" href="/propiedades">Ver propiedades</Link>
    </section>
  );
}
