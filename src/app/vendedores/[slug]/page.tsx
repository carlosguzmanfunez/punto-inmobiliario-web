import SellerPage from "@/components/SellerPage";

// Se carga en el navegador, así cada vitrina nueva funciona sin volver a construir el sitio.
export function generateStaticParams() {
  return [{ slug: "desarrollos-morazan" }];
}

export const metadata = { title: "Vitrina de vendedor" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SellerPage slug={slug} />;
}
