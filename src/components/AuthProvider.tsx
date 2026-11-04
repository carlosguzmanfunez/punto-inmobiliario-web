"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getBackend, type Backend, type Profile } from "@/lib/backend";
import { PrefsProvider } from "./PrefsProvider";

type Ctx = {
  backend: Backend;
  profile: Profile | null;
  loading: boolean;
  favorites: Set<string>;
  toggleFavorite: (propertyId: string) => Promise<"added" | "removed" | "login">;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const backend = getBackend();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const p = await backend.getCurrentProfile();
      setProfile(p);
      setFavorites(new Set(p ? await backend.listFavoriteIds() : []));
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    refresh();
    return backend.onAuthChange(() => { refresh(); });
  }, [backend, refresh]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!profile) return "login" as const;
    const added = await backend.toggleFavorite(id);
    setFavorites((prev) => { const n = new Set(prev); if (added) n.add(id); else n.delete(id); return n; });
    return added ? ("added" as const) : ("removed" as const);
  }, [backend, profile]);

  return <AuthContext.Provider value={{ backend, profile, loading, favorites, toggleFavorite, refresh }}><PrefsProvider>{children}</PrefsProvider></AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return c;
}
