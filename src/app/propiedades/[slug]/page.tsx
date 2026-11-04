import { properties } from "@/data/properties";
import PropertyDetail from "@/components/PropertyDetail";

// Las propiedades se cargan desde la base de datos en el navegador, así las nuevas
// que se publiquen en el panel aparecen al instante sin volver a construir el sitio.
export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = properties.find((x) => x.slug === slug);
  return { title: p?.title ?? "Propiedad" };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PropertyDetail slug={slug} />;
}
