"use client";
import { useCallback, useEffect, useState } from "react";
import { CameraIcon, ChevronLeft, ChevronRight, CloseIcon } from "./Icons";

// Galería: mosaico de hasta 5 fotos y visor a pantalla completa con flechas y teclado.
export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const imgs = images.length ? images : ["/img/casa-1.svg"];
  const [open, setOpen] = useState<number | null>(null);
  const tiles = imgs.slice(0, 5);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + imgs.length) % imgs.length)), [imgs.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("no-scroll"); };
  }, [open, go]);

  return (
    <>
      <div className={`gallery gallery--${tiles.length}`}>
        {tiles.map((src, i) => (
          <button key={i} type="button" className="gallery__tile" onClick={() => setOpen(i)} aria-label={`Ver foto ${i + 1} de ${imgs.length}`}>
            <img src={src} alt={`${title}, foto ${i + 1}`} />
          </button>
        ))}
        <button type="button" className="gallery__all btn btn--outline btn--sm" onClick={() => setOpen(0)}>
          <CameraIcon size={16} /> Ver {imgs.length === 1 ? "la foto" : `las ${imgs.length} fotos`}
        </button>
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Fotos de la propiedad" onClick={() => setOpen(null)}>
          <div className="lightbox__top" onClick={(e) => e.stopPropagation()}>
            <span>{open + 1} / {imgs.length}</span>
            <button type="button" className="icon-btn" aria-label="Cerrar" onClick={() => setOpen(null)}><CloseIcon size={22} /></button>
          </div>
          <img className="lightbox__img" src={imgs[open]} alt={`${title}, foto ${open + 1}`} onClick={(e) => e.stopPropagation()} />
          {imgs.length > 1 && <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label="Foto anterior" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft size={28} /></button>
            <button type="button" className="lightbox__nav lightbox__nav--next" aria-label="Foto siguiente" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight size={28} /></button>
          </>}
          <div className="lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
            {imgs.map((src, i) => (
              <button key={i} type="button" className={i === open ? "is-active" : ""} onClick={() => setOpen(i)} aria-label={`Foto ${i + 1}`}><img src={src} alt="" /></button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
