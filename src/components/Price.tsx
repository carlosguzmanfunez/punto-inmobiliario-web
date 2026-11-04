"use client";
import type { Property } from "@/data/properties";
import { altPrice, displayPrice } from "@/lib/money";
import { usePrefs } from "./PrefsProvider";
import { useAuth } from "./AuthProvider";

// Precio en la moneda que eligió el visitante (selector del encabezado).
export default function Price({ p, alt = false, className }: { p: Pick<Property, "price" | "currency" | "operation">; alt?: boolean; className?: string }) {
  const { currency } = usePrefs();
  const rate = useAuth().settings.usdRate;
  return (
    <span className={className}>
      {displayPrice(p, currency, rate)}
      {alt && <small className="price-alt">{altPrice(p, currency, rate)}</small>}
    </span>
  );
}

export function CurrencySwitch({ className, variant = "select" }: { className?: string; variant?: "select" | "toggle" }) {
  const { currency, setCurrency } = usePrefs();
  if (variant === "toggle") {
    // Toca L o US$ para ver todos los precios en esa moneda; vuelve a tocar para ver el precio original.
    return (
      <div className={`cur-toggle ${className ?? ""}`} role="group" aria-label="Ver precios en">
        {(["HNL", "USD"] as const).map((c) => (
          <button key={c} type="button" aria-pressed={currency === c} className={currency === c ? "is-active" : ""}
            title={currency === c ? "Ver precio original" : c === "HNL" ? "Ver precios en lempiras" : "Ver precios en dólares"}
            onClick={() => setCurrency(currency === c ? "orig" : c)}>{c === "HNL" ? "L" : "US$"}</button>
        ))}
      </div>
    );
  }
  return (
    <label className={`currency-switch ${className ?? ""}`}>
      <span className="sr-only">Moneda de los precios</span>
      <select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} aria-label="Moneda de los precios">
        <option value="orig">Precio original</option>
        <option value="HNL">Lempiras (L)</option>
        <option value="USD">Dólares (US$)</option>
      </select>
    </label>
  );
}
