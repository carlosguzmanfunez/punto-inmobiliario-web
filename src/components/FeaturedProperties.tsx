"use client";
import PropertyCard from "./PropertyCard";
import { useProperties } from "./useProperties";
import { usePrefs } from "./PrefsProvider";

export default function FeaturedProperties() {
  const { list } = useProperties();
  if (!list) return <div className="grid-cards">{Array.from({ length: 4 }, (_, i) => <div key={i} className="card-skeleton" />)}</div>;
  const featured = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)].slice(0, 8);
  return <div className="grid-cards scroll-row">{featured.map((p) => <PropertyCard key={p.id} p={p} />)}</div>;
}

// "Vistos recientemente": solo aparece si el visitante ya abrió alguna propiedad.
export function RecentlyViewed() {
  const { list } = useProperties();
  const { recent } = usePrefs();
  const items = list ? recent.map((id) => list.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 4) : [];
  if (items.length === 0) return null;
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="section__head"><div><h2>Vistos recientemente</h2><p className="muted">Retoma donde te quedaste.</p></div></div>
        <div className="grid-cards scroll-row">{items.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </div>
    </section>
  );
}
