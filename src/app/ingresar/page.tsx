import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <section className="section container auth">
      <div className="auth__intro">
        <h1 className="h2">Tu cuenta en Punto Inmobiliario</h1>
        <p className="muted">Una sola cuenta para buscar tu próxima propiedad o para vender las tuyas.</p>
        <h2 className="h3">Si buscas propiedad</h2>
        <ul className="auth__perks">
          <li>Guarda casas y terrenos para compararlos después</li>
          <li>Revisa el estado de cada consulta que envíes</li>
        </ul>
        <h2 className="h3">Si vendes</h2>
        <ul className="auth__perks">
          <li>Publica tus propiedades con un link profesional para tus compradores</li>
          <li>Ten tu propia vitrina con todos tus proyectos</li>
        </ul>
      </div>
      <Suspense><LoginForm /></Suspense>
    </section>
  );
}
