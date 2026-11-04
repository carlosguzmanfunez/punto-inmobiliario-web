"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const roles = ["Comprador", "Inquilino", "Agente inmobiliario", "Otro"];

// Formulario de consulta. Con `visit` se puede pedir una fecha de visita o videollamada.
export default function InquiryForm({ propertyId, defaultMessage, visit = false, context }: { propertyId: string | null; defaultMessage: string; visit?: boolean; context?: string }) {
  const { backend, profile } = useAuth();
  const [f, setF] = useState({ name: "", email: "", phone: "", message: defaultMessage });
  const [role, setRole] = useState(roles[0]);
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("Presencial");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) setF((x) => ({ ...x, name: x.name || profile.fullName, email: x.email || profile.email, phone: x.phone || profile.phone }));
  }, [profile]);

  if (state === "sent") {
    return (
      <div className="notice notice--ok">
        <strong>¡Consulta enviada!</strong> Te contactaremos pronto por WhatsApp o correo.
        {profile ? <> Puedes verla en <Link href="/cuenta?tab=consultas">tu cuenta</Link>.</> : null}
        <button type="button" className="link-btn" onClick={() => { setState("idle"); setDate(""); }}>Enviar otra</button>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault(); setError(""); setState("sending");
      const extra = [context, visit ? `Soy: ${role}` : "", visit && date ? `Visita ${mode.toLowerCase()} solicitada para el ${new Date(date + "T12:00:00").toLocaleDateString("es-HN", { weekday: "long", day: "numeric", month: "long" })}` : ""].filter(Boolean).join(" · ");
      try { await backend.createInquiry({ propertyId, ...f, message: extra ? `${f.message}\n\n${extra}` : f.message }); setState("sent"); }
      catch (err) { setError((err as Error).message); setState("idle"); }
    }}>
      <label>Nombre<input required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <div className="form__row">
        <label>Correo<input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>WhatsApp<input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+504 9999-9999" /></label>
      </div>
      {visit && (
        <>
          <label>Soy
            <select value={role} onChange={(e) => setRole(e.target.value)}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <div className="form__row">
            <label>Fecha de visita (opcional)<input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label>Modalidad
              <select value={mode} onChange={(e) => setMode(e.target.value)}><option>Presencial</option><option>Videollamada</option></select>
            </label>
          </div>
        </>
      )}
      <label>Mensaje<textarea required rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      {error && <p className="form__error">{error}</p>}
      <button className="btn btn--primary btn--block" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : visit && date ? "Agendar visita" : "Enviar consulta"}</button>
    </form>
  );
}
