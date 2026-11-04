"use client";
import { useEffect, useState } from "react";
import type { Property } from "@/data/properties";
import { useAuth } from "./AuthProvider";

export function useProperties(opts?: { includeUnpublished?: boolean }) {
  const { backend } = useAuth();
  const [list, setList] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const all = !!opts?.includeUnpublished;
  useEffect(() => {
    let alive = true;
    backend.listProperties({ includeUnpublished: all })
      .then((l) => alive && setList(l))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [backend, all, tick]);
  return { list, error, reload: () => setTick((t) => t + 1) };
}
