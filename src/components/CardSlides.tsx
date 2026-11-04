"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "./Icons";

// Fotos de la tarjeta: se deslizan con el dedo o con las flechas, sin entrar a la propiedad.
export default function CardSlides({ images, href, title }: { images: string[]; href: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const go = (d: number) => (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const el = ref.current; if (!el) return;
    const n = (i + d + images.length) % images.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
    setI(n);
  };
  const onScroll = () => { const el = ref.current; if (el) setI(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); };
  return (
    <>
      <div className="card__slides" ref={ref} onScroll={onScroll} tabIndex={0} aria-label={`Fotos de ${title}`}>
        {images.map((src, k) => (
          <Link key={src + k} href={href} className="card__slide">
            <img src={src} alt={`${title}, foto ${k + 1}`} loading={k === 0 ? undefined : "lazy"} />
          </Link>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" className="card__arrow card__arrow--prev" aria-label="Foto anterior" onClick={go(-1)} hidden={i === 0}><ChevronLeft size={18} /></button>
          <button type="button" className="card__arrow card__arrow--next" aria-label="Foto siguiente" onClick={go(1)}><ChevronRight size={18} /></button>
          <div className="card__dots" aria-hidden>{images.map((_, k) => <span key={k} className={k === i ? "is-on" : ""} />)}</div>
          <span className="card__count" aria-hidden>{i + 1}/{images.length}</span>
        </>
      )}
    </>
  );
}
