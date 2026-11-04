"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_ADMIN, DEMO_BUYER, DEMO_SELLER } from "@/lib/backend/demo";
import { useAuth } from "./AuthProvider";

export default function LoginForm() {
  const { backend, profile, refresh } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const [mode, setMode] = useState<"login" | "registro" | "olvido">(sp.get("modo") === "registro" ? "registro" : "login");
  const [f, setF] = useState({ fullName: "", phone: "", email: "", password: "", businessName: "" });
  const [accountType, setAccountType] = useState<"comprador" | "vendedor">(sp.get("tipo") === "vendedor" ? "vendedor" : "comprador");
  // Si llega un link a "crear cuenta de vendedor" estando ya en esta página, cambia la pestaña.
  useEffect(() => {
    if (sp.get("modo") === "registro") setMode("registro");
    if (sp.get("tipo") === "vendedor") setAccountType("vendedor");
  }, [sp]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (profile) router.replace(next || (profile.role === "admin" ? "/admin" : profile.role === "seller" ? "/panel" : "/cuenta"));
  }, [profile, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "login") await backend.signIn(f.email, f.password);
      else if (mode === "registro") {
        const r = await backend.signUp({ ...f, accountType });
        if (r.needsConfirmation) { setInfo("Te enviamos un correo para confirmar tu cuenta. Abre el enlace y luego ingresa."); setMode("login"); }
      } else { await backend.resetPassword(f.email); setInfo("Si el correo está registrado, te llegará un enlace para crear una contraseña nueva."); }
      await refresh();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  // Google: quien se registra como vendedor vuelve a "Quiero vender" para activar su cuenta.
  const google = async () => {
    setError(""); setInfo(""); setBusy(true);
    try {
      const dest = mode === "registro" && accountType === "vendedor" ? "/cuenta?tab=vender" : next || "/ingresar";
      await backend.signInWithGoogle(dest);
    } catch (err) { setError((err as Error).message); setBusy(false); }
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
      {mode !== "olvido" && <>
        <button type="button" className="btn btn--google btn--block" onClick={google} disabled={busy}>
          <GoogleLogo /> {mode === "registro" ? "Crear cuenta con Google" : "Continuar con Google"}
        </button>
        <div className="or"><span>o con tu correo</span></div>
      </>}
      <form className="form" onSubmit={submit}>
        {mode === "registro" && <>
          <div className="account-type" role="radiogroup" aria-label="Tipo de cuenta">
            <label className={accountType === "comprador" ? "is-active" : ""}><input type="radio" name="tipo" checked={accountType === "comprador"} onChange={() => setAccountType("comprador")} /><strong>Busco propiedad</strong><span>Guarda favoritos y consulta</span></label>
            <label className={accountType === "vendedor" ? "is-active" : ""}><input type="radio" name="tipo" checked={accountType === "vendedor"} onChange={() => setAccountType("vendedor")} /><strong>Quiero vender</strong><span>Publica tus propiedades</span></label>
          </div>
          {accountType === "vendedor" && <label>Nombre de tu negocio (opcional)<input value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} placeholder="Ej. Inmobiliaria Los Pinos" /></label>}
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
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { setMode("login"); setF({ ...f, email: DEMO_SELLER.email, password: DEMO_SELLER.password }); }}>Usar cuenta de vendedor</button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { setMode("login"); setF({ ...f, email: DEMO_BUYER.email, password: DEMO_BUYER.password }); }}>Usar cuenta de comprador</button>
          </div>
        </div>
      )}
      <p className="muted small center">Al crear tu cuenta aceptas que te contactemos sobre las propiedades que consultes. <Link href="/contacto">¿Necesitas ayuda?</Link></p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
