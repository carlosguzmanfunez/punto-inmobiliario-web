"use client";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";

export default function FeaturedProperties() {
  const { list } = useProperties();
  if (!list) return <div className="grid-cards">{Array.from({ length: 4 }, (_, i) => <div key={i} className="card-skeleton" />)}</div>;
  const featured = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)].slice(0, 8);
  return <div className="grid-cards">{featured.map((p) => <PropertyCard key={p.id} p={p} />)}</div>;
}
