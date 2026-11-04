"use client";
import { useEffect } from "react";
import { fallbackFor } from "@/data/photos";

// Si una foto remota no carga, la cambia por su ilustración local. Escucha los errores de
// todas las imágenes (fase de captura) y revisa las que ya fallaron antes de que cargara React.
export default function ImageFallback() {
  useEffect(() => {
    const swap = (img: HTMLImageElement) => {
      if (img.dataset.fallback) return;
      const fb = fallbackFor(img.currentSrc || img.src);
      if (!fb) return;
      img.dataset.fallback = "1";
      img.removeAttribute("srcset");
      img.src = fb;
    };
    const onError = (e: Event) => { if (e.target instanceof HTMLImageElement) swap(e.target); };
    document.addEventListener("error", onError, true);
    document.querySelectorAll("img").forEach((img) => { if (img.complete && img.naturalWidth === 0 && img.src) swap(img); });
    return () => document.removeEventListener("error", onError, true);
  }, []);
  return null;
}
