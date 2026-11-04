"use client";
import { useEffect, useState } from "react";
import { absoluteUrl } from "@/lib/labels";
import { CheckIcon, LinkIcon, WhatsAppIcon } from "./Icons";

// Link profesional listo para enviar: copiar o compartir por WhatsApp.
export default function ShareBox({ path, title, message, compact = false }: { path: string; title: string; message?: string; compact?: boolean }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(absoluteUrl(path)); }, [path]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { const el = document.getElementById(`share-${path}`) as HTMLInputElement | null; el?.select(); }
  };
  const text = `${message ?? title}\n${url}`;

  return (
    <div className={`share${compact ? " share--compact" : ""}`}>
      {!compact && <p className="share__label"><LinkIcon size={16} /> Link profesional</p>}
      <div className="share__row">
        <input id={`share-${path}`} className="share__url" value={url} readOnly onFocus={(e) => e.target.select()} aria-label="Link para compartir" />
        <button type="button" className="btn btn--outline btn--sm" onClick={copy}>{copied ? <><CheckIcon size={16} /> Copiado</> : "Copiar"}</button>
        <a className="btn btn--wa btn--sm" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
          <WhatsAppIcon size={16} />{!compact && " Enviar"}
        </a>
      </div>
    </div>
  );
}
