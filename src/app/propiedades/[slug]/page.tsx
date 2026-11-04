import { properties, propertyCode, typeLabel, formatPrice } from "@/data/properties";
import { departmentOf } from "@/data/geo";
import { site } from "@/lib/site";
import PropertyDetail from "@/components/PropertyDetail";

// Las propiedades se cargan desde la base de datos en el navegador, así las nuevas
// que se publiquen en el panel aparecen al instante sin volver a construir el sitio.
export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = properties.find((x) => x.slug === slug);
  if (!p) return { title: "Propiedad" };
  // Esto es lo que se ve al pegar el link profesional en WhatsApp o Facebook.
  const description = `${typeLabel[p.type]} en ${p.operation === "venta" ? "venta" : "alquiler"} en ${p.neighborhood}, ${p.city}. ${formatPrice(p)}. ${p.description}`;
  return {
    title: p.title,
    description,
    alternates: { canonical: `/propiedades/${p.slug}` },
    openGraph: { title: `${p.title} · ${formatPrice(p)}`, description, url: `/propiedades/${p.slug}`, images: p.images.slice(0, 1), type: "website" },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = properties.find((x) => x.slug === slug);
  // Datos estructurados para que Google muestre precio y ubicación.
  const ld = p && {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: `${site.url}/propiedades/${p.slug}`,
    image: p.images.map((i) => (i.startsWith("http") ? i : site.url + i)),
    identifier: propertyCode(p),
    datePosted: p.createdAt,
    offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency, availability: "https://schema.org/InStock", businessFunction: p.operation === "venta" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut" },
    address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.department || departmentOf(p.city), streetAddress: p.neighborhood, addressCountry: "HN" },
  };
  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
      <PropertyDetail slug={slug} />
    </>
  );
}
