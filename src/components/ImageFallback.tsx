"use client";
import { useEffect } from "react";
import { fallbackFor } from "@/data/photos";

// Si una foto remota no carga, la cambia por su ilustración local. Escucha los errores de
// todas las imágenes (fase de captura) y revisa las que ya fallaron antes de que cargara React.
export default function ImageFallback() {
  useEffect(() => {
    const swap = (img: HTMLImageElement) => {
      const src = img.currentSrc || img.src;
      // Si la que falló es la propia ilustración, no insistir. Si React le puso otra foto
      // remota al mismo elemento, sí se vuelve a cambiar.
      if (img.dataset.fallback && img.dataset.fallback === src) return;
      const fb = fallbackFor(src);
      if (!fb) return;
      img.removeAttribute("srcset");
      img.src = fb;
      img.dataset.fallback = img.src;
    };
    const onError = (e: Event) => { if (e.target instanceof HTMLImageElement) swap(e.target); };
    document.addEventListener("error", onError, true);
    // Revisión de respaldo por si algún error ocurrió antes de que existiera el escucha.
    const sweep = () => document.querySelectorAll("img").forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.src) swap(img); });
    sweep();
    const t = window.setInterval(sweep, 1500);
    return () => { document.removeEventListener("error", onError, true); window.clearInterval(t); };
  }, []);
  return null;
}
