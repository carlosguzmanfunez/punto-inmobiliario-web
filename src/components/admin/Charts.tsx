"use client";
import { useState } from "react";

// Gráficas del panel hechas a mano (SVG/HTML), sin librerías. Paleta categórica validada
// para daltonismo; una sola serie usa el azul de la marca. Todas muestran el valor al pasar el mouse.
export const seriesColors = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6"];

export function Delta({ cur, prev, invert = false }: { cur: number; prev: number; invert?: boolean }) {
  if (!prev && !cur) return <span className="delta delta--flat">sin cambios</span>;
  if (!prev) return <span className="delta delta--up">▲ nuevo</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <span className="delta delta--flat">= igual</span>;
  const good = invert ? pct < 0 : pct > 0;
  return <span className={`delta ${good ? "delta--up" : "delta--down"}`}>{pct > 0 ? "▲" : "▼"} {Math.abs(pct)}%</span>;
}

export function Sparkline({ values, color = "var(--brand)" }: { values: number[]; color?: string }) {
  const w = 100, h = 28, max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity=".1" stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export type Col = { label: string; value: number; tip: string };

// Columnas verticales con eje y líneas guía. El valor exacto aparece al pasar el mouse o tocar.
export function ColumnChart({ data, format = (n: number) => String(n), color = "var(--brand)", height = 190, label }: {
  data: Col[]; format?: (n: number) => string; color?: string; height?: number; label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = [max, max / 2, 0];
  const every = Math.ceil(data.length / 8);
  return (
    <div className="colchart" style={{ height }} role="img" aria-label={label}>
      <div className="colchart__axis">{ticks.map((t) => <span key={t}>{format(t)}</span>)}</div>
      <div className="colchart__plot" onMouseLeave={() => setHover(null)}>
        <div className="colchart__grid"><span /><span /><span /></div>
        <div className="colchart__cols" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
          {data.map((d, i) => (
            <div key={i} className={`colchart__col${hover === i ? " is-hover" : ""}`} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <span className="colchart__bar" style={{ height: `${max ? (d.value / max) * 100 : 0}%`, background: color }} />
              <span className="colchart__x">{i % every === 0 || i === data.length - 1 ? d.label : ""}</span>
              {hover === i && <span className="tip" style={{ left: "50%" }}><strong>{format(d.value)}</strong>{d.tip}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type Slice = { label: string; value: number; color: string };

// Dona con leyenda a la derecha (nombre, cantidad y porcentaje): el color nunca va solo.
export function Donut({ slices, center, sub }: { slices: Slice[]; center: string; sub: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" className="donut__svg" role="img" aria-label={`${center} ${sub}`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--tint)" strokeWidth="18" />
        {slices.filter((s) => s.value > 0).map((s) => {
          const len = (s.value / total) * C;
          const gap = slices.filter((x) => x.value > 0).length > 1 ? 2 : 0;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth={hover !== null && slices[hover]?.label === s.label ? 22 : 18}
              strokeDasharray={`${Math.max(0, len - gap)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)"
              onMouseEnter={() => setHover(slices.indexOf(s))} onMouseLeave={() => setHover(null)}>
              <title>{`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}</title>
            </circle>
          );
          acc += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="donut__center">{hover !== null ? slices[hover].value : center}</text>
        <text x="70" y="86" textAnchor="middle" className="donut__sub">{hover !== null ? slices[hover].label : sub}</text>
      </svg>
      <ul className="legend">
        {slices.map((s, i) => (
          <li key={s.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={hover === i ? "is-hover" : ""}>
            <span className="legend__dot" style={{ background: s.color }} />
            <span className="legend__label">{s.label}</span>
            <span className="legend__n">{s.value}</span>
            <span className="legend__pct">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Embudo: cada paso muestra cuántos llegan y qué porcentaje del primero.
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = steps[0]?.value || 1;
  return (
    <ol className="funnel">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className="funnel__head"><span>{s.label}</span><strong>{s.value}</strong></div>
          <div className="funnel__track"><span style={{ width: `${(s.value / top) * 100}%`, opacity: 1 - i * 0.16 }} /></div>
          {i > 0 && <span className="funnel__pct">{Math.round((s.value / top) * 100)}% del total</span>}
        </li>
      ))}
    </ol>
  );
}

function niceMax(v: number) {
  if (v <= 4) return 4;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}
