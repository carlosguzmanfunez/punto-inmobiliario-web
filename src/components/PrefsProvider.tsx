"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { DisplayCurrency } from "@/lib/money";

// Preferencias del visitante que no necesitan cuenta: moneda y lista para comparar.
type Prefs = {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  compare: string[];
  toggleCompare: (id: string) => "added" | "removed" | "full";
  clearCompare: () => void;
};

const KEY = "pihn-prefs";
export const COMPARE_MAX = 3;
const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCur] = useState<DisplayCurrency>("orig");
  const [compare, setCompare] = useState<string[]>([]);
  const state = useRef({ currency: "orig" as DisplayCurrency, compare: [] as string[] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const v = JSON.parse(raw);
      if (v.currency === "HNL" || v.currency === "USD" || v.currency === "orig") { setCur(v.currency); state.current.currency = v.currency; }
      if (Array.isArray(v.compare)) { const c = v.compare.slice(0, COMPARE_MAX); setCompare(c); state.current.compare = c; }
    } catch {}
  }, []);

  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state.current)); } catch {} };

  const setCurrency = useCallback((c: DisplayCurrency) => {
    state.current.currency = c; setCur(c); persist();
  }, []);

  const toggleCompare = useCallback((id: string) => {
    const cmp = state.current.compare;
    let next: string[];
    let result: "added" | "removed" | "full";
    if (cmp.includes(id)) { next = cmp.filter((x) => x !== id); result = "removed"; }
    else if (cmp.length >= COMPARE_MAX) return "full";
    else { next = [...cmp, id]; result = "added"; }
    state.current.compare = next; setCompare(next); persist();
    return result;
  }, []);

  const clearCompare = useCallback(() => { state.current.compare = []; setCompare([]); persist(); }, []);

  return <Ctx.Provider value={{ currency, setCurrency, compare, toggleCompare, clearCompare }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs debe usarse dentro de PrefsProvider");
  return c;
}
