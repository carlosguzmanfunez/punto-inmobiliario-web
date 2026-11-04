import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <section className="section container auth">
      <div className="auth__intro">
        <h1 className="h2">Tu cuenta en Punto Inmobiliario</h1>
        <p className="muted">Guarda tus propiedades favoritas, sigue tus consultas y recibe atención personalizada.</p>
        <ul className="auth__perks">
          <li>❤️ Guarda casas y terrenos para compararlos después</li>
          <li>💬 Revisa el estado de cada consulta que envíes</li>
          <li>🌎 Ideal si compras desde el extranjero</li>
        </ul>
      </div>
      <Suspense><LoginForm /></Suspense>
    </section>
  );
}
