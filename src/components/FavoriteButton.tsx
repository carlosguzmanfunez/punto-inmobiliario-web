"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { HeartIcon } from "./Icons";

export default function FavoriteButton({ id, className = "card__fav", label = false }: { id: string; className?: string; label?: boolean }) {
  const { favorites, toggleFavorite } = useAuth();
  const router = useRouter();
  const on = favorites.has(id);
  return (
    <button
      type="button"
      className={`${className}${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={async (e) => {
        e.preventDefault();
        const r = await toggleFavorite(id);
        if (r === "login") router.push(`/ingresar?next=${encodeURIComponent(location.pathname)}&motivo=favoritos`);
      }}
    >
      <HeartIcon size={label ? 18 : 22} />
      {label && <span>{on ? "Guardada" : "Guardar"}</span>}
    </button>
  );
}
