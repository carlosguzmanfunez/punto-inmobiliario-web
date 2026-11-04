"use client";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

// Cuota mensual con amortización francesa (la que usan los bancos en Honduras).
export function monthlyPayment(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12, n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Calculadora interactiva. Sirve en la ficha de cada propiedad y en /financiamiento.
export default function MortgageCalc({ price: initialPrice = 3000000, currency = "HNL", compact = false }: { price?: number; currency?: "HNL" | "USD"; compact?: boolean }) {
  const [cur, setCur] = useState<"HNL" | "USD">(currency);
  const [price, setPrice] = useState(Math.round(initialPrice));
  const [down, setDown] = useState(10);
  const [rate, setRate] = useState(cur === "USD" ? 8.5 : 11);
  const [years, setYears] = useState(20);
  useEffect(() => { setPrice(Math.round(initialPrice)); setCur(currency); }, [initialPrice, currency]);

  const loan = price * (1 - down / 100);
  const pay = monthlyPayment(loan, rate, years);
  const income = pay / 0.35;

  return (
    <div className={`calc${compact ? " calc--compact" : ""}`}>
      <div className="calc__fields">
        <label>Precio de la propiedad
          <div className="calc__money">
            <select aria-label="Moneda" value={cur} onChange={(e) => setCur(e.target.value as "HNL" | "USD")}><option value="HNL">L</option><option value="USD">US$</option></select>
            <input type="number" min={0} step={1000} value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
        </label>
        <label>Prima: {down} % <span className="muted small">({formatMoney(price * down / 100, cur)})</span>
          <input type="range" min={0} max={50} step={1} value={down} onChange={(e) => setDown(Number(e.target.value))} />
        </label>
        <label>Tasa de interés anual: {rate} %
          <input type="range" min={5} max={18} step={0.25} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <label>Plazo
          <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {[5, 10, 15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} años</option>)}
          </select>
        </label>
      </div>
      <div className="calc__result" aria-live="polite">
        <span className="muted small">Cuota mensual estimada</span>
        <strong>{formatMoney(pay, cur)}</strong>
        <span className="muted small">Préstamo de {formatMoney(loan, cur)} a {years} años. Ingreso familiar sugerido: {formatMoney(income, cur)} al mes.</span>
      </div>
      <p className="muted small calc__note">Cálculo de referencia. La tasa, la prima y el plazo finales los define cada banco o cooperativa según tu perfil.</p>
    </div>
  );
}
