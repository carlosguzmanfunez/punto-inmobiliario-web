"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs, COMPARE_MAX } from "./PrefsProvider";
import { useProperties } from "./useProperties";
import { CloseIcon, CompareIcon } from "./Icons";

export function CompareButton({ id, className = "", label = false }: { id: string; className?: string; label?: boolean }) {
  const { compare, toggleCompare } = usePrefs();
  const [msg, setMsg] = useState("");
  const on = compare.includes(id);
  return (
    <button
      type="button"
      className={`compare-btn${on ? " is-on" : ""} ${className}`}
      aria-pressed={on}
      title={on ? "Quitar de comparar" : "Agregar a comparar"}
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        const r = toggleCompare(id);
        if (r === "full") { setMsg(`Puedes comparar hasta ${COMPARE_MAX}`); setTimeout(() => setMsg(""), 2200); }
      }}
    >
      <CompareIcon size={16} />{label ? (on ? " En comparación" : " Comparar") : <span className="sr-only">Comparar</span>}
      {msg && <span className="compare-btn__msg" role="status">{msg}</span>}
    </button>
  );
}

// Barra flotante con las propiedades elegidas para comparar.
export function CompareBar() {
  const { compare, toggleCompare, clearCompare } = usePrefs();
  const { list } = useProperties();
  if (!compare.length) return null;
  const items = compare.map((id) => list?.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="compare-bar" role="region" aria-label="Propiedades para comparar">
      <div className="compare-bar__items">
        {items.map((p) => p && (
          <span key={p.id} className="compare-bar__item">
            <img src={p.images[0] ?? "/img/casa-1.svg"} alt="" />
            <span className="compare-bar__name">{p.neighborhood}</span>
            <button type="button" aria-label={`Quitar ${p.title}`} onClick={() => toggleCompare(p.id)}><CloseIcon size={14} /></button>
          </span>
        ))}
        <span className="muted small compare-bar__hint">{compare.length}/{COMPARE_MAX}</span>
      </div>
      <div className="compare-bar__actions">
        <button type="button" className="link-btn" onClick={clearCompare}>Limpiar</button>
        <Link href="/comparar" className="btn btn--primary btn--sm">Comparar {compare.length > 1 ? `(${compare.length})` : ""}</Link>
      </div>
    </div>
  );
}
