import type { MetadataRoute } from "next";
import { properties } from "@/data/properties";
import { guides } from "@/data/guides";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/propiedades", "/proyectos", "/vender", "/extranjero", "/financiamiento", "/quienes-somos", "/servicios", "/guias", "/contacto"];
  return [
    ...pages.map((p) => ({ url: site.url + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...properties.map((p) => ({ url: `${site.url}/propiedades/${p.slug}`, lastModified: p.createdAt, changeFrequency: "daily" as const, priority: 0.8 })),
    ...guides.map((g) => ({ url: `${site.url}/guias/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
