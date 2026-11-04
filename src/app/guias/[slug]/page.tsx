import { guides } from "@/data/guides";
import GuideArticle from "@/components/GuideArticle";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  return { title: g?.title ?? "Guía", description: g?.summary };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GuideArticle slug={slug} />;
}
