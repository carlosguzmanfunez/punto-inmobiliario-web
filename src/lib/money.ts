import type { Property } from "@/data/properties";
import { site } from "./site";

export type DisplayCurrency = "orig" | "HNL" | "USD";

const nf = (n: number) => new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(Math.round(n));

export function formatMoney(n: number, cur: "HNL" | "USD") {
  return cur === "USD" ? `US$${nf(n)}` : `L ${nf(n)}`;
}

export function convert(n: number, from: "HNL" | "USD", to: "HNL" | "USD", rate = site.usdRate) {
  if (from === to) return n;
  return from === "USD" ? n * rate : n / rate;
}

export function priceIn(p: Pick<Property, "price" | "currency">, to: "HNL" | "USD", rate = site.usdRate) {
  return convert(p.price, p.currency, to, rate);
}

// Precio en la moneda elegida por el visitante. "orig" muestra la moneda publicada.
export function displayPrice(p: Pick<Property, "price" | "currency" | "operation">, cur: DisplayCurrency, rate = site.usdRate) {
  const to = cur === "orig" ? p.currency : cur;
  const s = formatMoney(convert(p.price, p.currency, to, rate), to);
  return p.operation === "alquiler" ? `${s} /mes` : s;
}

// La otra moneda, como referencia ("≈ L 7,495,500").
export function altPrice(p: Pick<Property, "price" | "currency" | "operation">, cur: DisplayCurrency, rate = site.usdRate) {
  const shown = cur === "orig" ? p.currency : cur;
  const other = shown === "USD" ? "HNL" : "USD";
  return `≈ ${formatMoney(convert(p.price, p.currency, other, rate), other)}`;
}
