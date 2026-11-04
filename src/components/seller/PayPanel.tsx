"use client";
import { useState } from "react";
import type { Property } from "@/data/properties";
import { formatLempiras, plans, whatsappLink, type PlanKind } from "@/lib/site";
import { useAuth } from "../AuthProvider";
import { CloseIcon, WhatsAppIcon } from "../Icons";

// Solicitud de pago de un plan. El pago se hace por transferencia o depósito; el vendedor
// deja la referencia y el administrador lo confirma para activar la publicación o la vitrina.
export default function PayPanel({ property, vitrina, onDone, onClose }: {
  property?: Property | null; vitrina?: boolean; onDone: () => void; onClose: () => void;
}) {
  const { backend, profile } = useAuth();
  const options: PlanKind[] = vitrina ? ["vitrina"] : ["publicacion", "destacada"];
  const [kind, setKind] = useState<PlanKind>(options[0]);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const plan = plans[kind];
  const what = vitrina ? "mi vitrina de vendedor" : `"${property?.title}"`;
  const ask = `Hola, soy ${profile?.fullName || "vendedor"}. Quiero pagar el plan ${plan.name} (${formatLempiras(plan.price)}) para ${what}. ¿Me envían los datos para transferir?`;

  return (
    <div className="panel pay">
      <div className="pay__head">
        <h2 className="h3">{vitrina ? "Activar tu vitrina" : property?.status === "publicada" ? "Renovar publicación" : "Publicar propiedad"}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar"><CloseIcon size={18} /></button>
      </div>
      {property && <p className="muted small">{property.title}</p>}
      <div className="pay__plans">
        {options.map((k) => (
          <label key={k} className={`plan-option${kind === k ? " is-active" : ""}`}>
            <input type="radio" name="plan" checked={kind === k} onChange={() => setKind(k)} />
            <span className="plan-option__name">{plans[k].name}</span>
            <span className="plan-option__price">{formatLempiras(plans[k].price)} <small>por {plans[k].days} días</small></span>
            <span className="muted small">{plans[k].summary}</span>
          </label>
        ))}
      </div>
      <ol className="pay__steps">
        <li>Pide los datos bancarios y paga por transferencia o depósito.
          <a className="btn btn--wa btn--sm" href={whatsappLink(ask)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> Pedir datos de pago</a>
        </li>
        <li>Escribe el número de referencia de tu pago y envíalo. Activamos tu {vitrina ? "vitrina" : "publicación"} en cuanto lo confirmemos.</li>
      </ol>
      <form className="form" onSubmit={async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try { await backend.requestPayment({ kind, propertyId: property?.id ?? null, reference }); onDone(); }
        catch (err) { setError((err as Error).message); setBusy(false); }
      }}>
        <label>Referencia del pago<input required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ej. Transferencia BAC #123456" /></label>
        {error && <p className="form__error">{error}</p>}
        <button className="btn btn--primary" disabled={busy}>{busy ? "Enviando…" : `Enviar pago de ${formatLempiras(plan.price)}`}</button>
      </form>
    </div>
  );
}
