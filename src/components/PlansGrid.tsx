"use client";
import Link from "next/link";
import { formatLempiras } from "@/lib/site";
import { usePlans } from "./AuthProvider";
import { CheckIcon, LinkIcon, StoreIcon } from "./Icons";

// Tarjetas de planes con los precios vigentes que fija el administrador.
export default function PlansGrid({ signup }: { signup: string }) {
  const plans = usePlans();
  return (
    <div className="plans">
      {Object.values(plans).map((p) => (
        <div key={p.kind} id={p.kind === "vitrina" ? "vitrina" : undefined} className={`plan${p.kind === "destacada" ? " plan--featured" : ""}`}>
          {p.kind === "destacada" && <span className="plan__tag">Más visto</span>}
          <span className="plan__icon">{p.kind === "vitrina" ? <StoreIcon size={24} /> : <LinkIcon size={24} />}</span>
          <h3>{p.name}</h3>
          <p className="plan-price">{formatLempiras(p.price)} <small>{p.kind === "vitrina" ? "al mes" : "por propiedad"}</small></p>
          <p className="muted">{p.summary}</p>
          <ul className="plan__perks">{p.perks.map((x) => <li key={x}><CheckIcon size={16} /> {x}</li>)}</ul>
          <Link className={`btn btn--block ${p.kind === "destacada" ? "btn--primary" : "btn--outline"}`} href={signup}>Empezar</Link>
        </div>
      ))}
    </div>
  );
}
