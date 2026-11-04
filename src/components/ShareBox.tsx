"use client";
import { useEffect, useState } from "react";
import { absoluteUrl } from "@/lib/labels";
import { CheckIcon, FacebookIcon, LinkIcon, MailIcon, WhatsAppIcon, XLogoIcon } from "./Icons";

// Link profesional listo para enviar: copiar o compartir por WhatsApp, Facebook, X o correo.
export default function ShareBox({ path, title, message, compact = false }: { path: string; title: string; message?: string; compact?: boolean }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(absoluteUrl(path)); }, [path]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { const el = document.getElementById(`share-${path}`) as HTMLInputElement | null; el?.select(); }
  };
  const text = message ?? title;
  const enc = encodeURIComponent;

  return (
    <div className={`share${compact ? " share--compact" : ""}`}>
      {!compact && <p className="share__label"><LinkIcon size={16} /> Link profesional</p>}
      <div className="share__row">
        <input id={`share-${path}`} className="share__url" value={url} readOnly onFocus={(e) => e.target.select()} aria-label="Link para compartir" />
        <button type="button" className="btn btn--outline btn--sm" onClick={copy}>{copied ? <><CheckIcon size={16} /> Copiado</> : "Copiar"}</button>
        <a className="btn btn--wa btn--sm" href={`https://wa.me/?text=${enc(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
          <WhatsAppIcon size={16} />{!compact && " Enviar"}
        </a>
      </div>
      {!compact && (
        <div className="share__social">
          <span className="muted small">Compartir en</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook" className="share__icon"><FacebookIcon /></a>
          <a href={`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en X" className="share__icon"><XLogoIcon /></a>
          <a href={`mailto:?subject=${enc(title)}&body=${enc(`${text}\n${url}`)}`} aria-label="Enviar por correo" className="share__icon"><MailIcon size={18} /></a>
        </div>
      )}
    </div>
  );
}
