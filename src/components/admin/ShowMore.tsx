"use client";
import { useEffect, useState } from "react";

// Muestra las tablas largas por partes para que el panel cargue rápido y se lea mejor.
// Vuelve al inicio cuando cambian los filtros (key).
export function usePager<T>(rows: T[], key: string, step = 20) {
  const [limit, setLimit] = useState(step);
  useEffect(() => { setLimit(step); }, [key, step]);
  return { rows: rows.slice(0, limit), more: () => setLimit((l) => l + step), shown: Math.min(limit, rows.length), total: rows.length, step };
}

export function ShowMore({ shown, total, more, step }: { shown: number; total: number; more: () => void; step: number }) {
  if (total <= step && shown >= total) return null;
  return (
    <div className="show-more">
      <span className="muted small">Mostrando {shown} de {total}</span>
      {shown < total && <button type="button" className="btn btn--outline btn--sm" onClick={more}>Ver {Math.min(step, total - shown)} más</button>}
    </div>
  );
}
