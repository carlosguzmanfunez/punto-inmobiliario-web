"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { allCities, departments, popularZones } from "@/data/geo";
import { typePlural, type PropertyType } from "@/data/properties";
import { SearchIcon } from "./Icons";

// Rangos de presupuesto en lempiras (los filtros internos siempre usan L).
export const budgets = {
  venta: [[0, 1500000], [1500000, 3000000], [3000000, 5000000], [5000000, 10000000], [10000000, 0]],
  alquiler: [[0, 10000], [10000, 20000], [20000, 35000], [35000, 60000], [60000, 0]],
} as const;

export function budgetLabel([min, max]: readonly [number, number]) {
  const f = (n: number) => n >= 1e6 ? `L ${(n / 1e6).toLocaleString("es-HN")} M` : `L ${(n / 1e3).toLocaleString("es-HN")} mil`;
  if (!min) return `Hasta ${f(max)}`;
  if (!max) return `Más de ${f(min)}`;
  return `${f(min)} a ${f(max)}`;
}

// Buscador principal: Todas / Comprar / Alquilar, y luego tipo, ubicación, habitaciones y presupuesto.
export default function HeroSearch() {
  const router = useRouter();
  const [op, setOp] = useState<"" | "venta" | "alquiler">("");
  const [tipo, setTipo] = useState("");
  const [where, setWhere] = useState("");
  const [hab, setHab] = useState("");
  const [budget, setBudget] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = new URLSearchParams();
    if (op) n.set("operacion", op);
    if (tipo) n.set("tipo", tipo);
    const w = where.trim();
    if (w) {
      const dep = departments.find((d) => d.toLowerCase() === w.toLowerCase());
      const city = allCities.find((c) => c.toLowerCase() === w.toLowerCase());
      if (dep) n.set("depto", dep); else if (city) n.set("ciudad", city); else n.set("q", w);
    }
    if (hab) n.set("hab", hab);
    if (budget) { const [a, b] = budget.split("-"); if (+a) n.set("pmin", a); if (+b) n.set("pmax", b); }
    router.push(`/propiedades${n.size ? `?${n}` : ""}`);
  };

  const ranges = budgets[op || "venta"];
  return (
    <form className="hero-search" onSubmit={submit} role="search">
      <div className="hero-tabs" role="radiogroup" aria-label="Qué buscas">
        {([["", "Todas"], ["venta", "Comprar"], ["alquiler", "Alquilar"]] as const).map(([v, l]) => (
          <label key={v} className="hero-tab">
            <input type="radio" name="operacion" value={v} checked={op === v} onChange={() => { setOp(v); setBudget(""); }} />
            <span>{l}</span>
          </label>
        ))}
      </div>
      <div className="hero-box">
        <label className="hero-box__field hero-box__field--wide">
          <span>Ubicación</span>
          <input type="search" list="hero-places" autoComplete="off" value={where} onChange={(e) => setWhere(e.target.value)}
            placeholder="Ciudad, departamento o colonia" />
          <datalist id="hero-places">
            {[...allCities, ...departments, ...popularZones].map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label className="hero-box__field">
          <span>Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {(Object.keys(typePlural) as PropertyType[]).map((t) => <option key={t} value={t}>{typePlural[t]}</option>)}
          </select>
        </label>
        <label className="hero-box__field">
          <span>Habitaciones</span>
          <select value={hab} onChange={(e) => setHab(e.target.value)}>
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </label>
        <label className="hero-box__field">
          <span>Presupuesto</span>
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Cualquiera</option>
            {ranges.map((r) => <option key={r.join("-")} value={r.join("-")}>{budgetLabel(r)}{op === "alquiler" ? " /mes" : ""}</option>)}
          </select>
        </label>
        <button type="submit" className="hero-submit"><SearchIcon size={20} /> <span>Buscar</span></button>
      </div>
    </form>
  );
}
