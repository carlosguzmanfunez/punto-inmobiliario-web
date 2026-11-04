"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function InquiryForm({ propertyId, defaultMessage }: { propertyId: string | null; defaultMessage: string }) {
  const { backend, profile } = useAuth();
  const [f, setF] = useState({ name: "", email: "", phone: "", message: defaultMessage });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) setF((x) => ({ ...x, name: x.name || profile.fullName, email: x.email || profile.email, phone: x.phone || profile.phone }));
  }, [profile]);

  if (state === "sent") {
    return (
      <div className="notice notice--ok">
        <strong>¡Consulta enviada!</strong> Un asesor te contactará pronto.
        {profile ? <> Puedes verla en <Link href="/cuenta?tab=consultas">tu cuenta</Link>.</> : null}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault(); setError(""); setState("sending");
      try { await backend.createInquiry({ propertyId, ...f }); setState("sent"); }
      catch (err) { setError((err as Error).message); setState("idle"); }
    }}>
      <label>Nombre<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label>Correo<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Teléfono o WhatsApp<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+504 9999-9999" /></label>
      <label>Mensaje<textarea required rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      {error && <p className="form__error">{error}</p>}
      <button className="btn btn--primary btn--block" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar consulta"}</button>
    </form>
  );
}
