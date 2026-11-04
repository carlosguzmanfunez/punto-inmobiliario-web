"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_ADMIN } from "@/lib/backend/demo";
import { useAuth } from "./AuthProvider";

export default function LoginForm() {
  const { backend, profile, refresh } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const [mode, setMode] = useState<"login" | "registro" | "olvido">(sp.get("modo") === "registro" ? "registro" : "login");
  const [f, setF] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (profile) router.replace(next || (profile.role === "admin" ? "/admin" : "/cuenta"));
  }, [profile, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "login") await backend.signIn(f.email, f.password);
      else if (mode === "registro") {
        const r = await backend.signUp(f);
        if (r.needsConfirmation) { setInfo("Te enviamos un correo para confirmar tu cuenta. Abre el enlace y luego ingresa."); setMode("login"); }
      } else { await backend.resetPassword(f.email); setInfo("Si el correo está registrado, te llegará un enlace para crear una contraseña nueva."); }
      await refresh();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-card">
      {sp.get("motivo") === "favoritos" && <div className="notice">Ingresa o crea tu cuenta gratis para guardar propiedades en favoritos.</div>}
      {mode !== "olvido" && (
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>Ingresar</button>
          <button type="button" role="tab" aria-selected={mode === "registro"} className={mode === "registro" ? "is-active" : ""} onClick={() => setMode("registro")}>Crear cuenta</button>
        </div>
      )}
      {mode === "olvido" && <h2 className="h3">Recuperar contraseña</h2>}
      <form className="form" onSubmit={submit}>
        {mode === "registro" && <>
          <label>Nombre completo<input required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} autoComplete="name" /></label>
          <label>Teléfono o WhatsApp<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+504 9999-9999" autoComplete="tel" /></label>
        </>}
        <label>Correo<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
        {mode !== "olvido" && <label>Contraseña<input type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>}
        {error && <p className="form__error">{error}</p>}
        {info && <p className="notice notice--ok">{info}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Un momento…" : mode === "login" ? "Ingresar" : mode === "registro" ? "Crear mi cuenta" : "Enviar enlace"}
        </button>
        {mode === "login" && <button type="button" className="link-btn" onClick={() => setMode("olvido")}>¿Olvidaste tu contraseña?</button>}
        {mode === "olvido" && <button type="button" className="link-btn" onClick={() => setMode("login")}>Volver a ingresar</button>}
      </form>
      {backend.mode === "demo" && (
        <div className="demo-box">
          <strong>Modo de prueba.</strong> Los datos se guardan solo en este navegador.
          <div className="demo-box__row">
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { setMode("login"); setF({ ...f, email: DEMO_ADMIN.email, password: DEMO_ADMIN.password }); }}>Usar cuenta de administrador</button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { setMode("login"); setF({ ...f, email: "maria@ejemplo.com", password: "maria123" }); }}>Usar cuenta de cliente</button>
          </div>
        </div>
      )}
      <p className="muted small center">Al crear tu cuenta aceptas que te contactemos sobre las propiedades que consultes. <Link href="/contacto">¿Necesitas ayuda?</Link></p>
    </div>
  );
}
