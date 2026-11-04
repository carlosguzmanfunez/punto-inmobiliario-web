import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { photos } from "@/data/photos";
import { CheckIcon } from "@/components/Icons";

export const metadata = { title: "Ingresar" };

const buyer = ["Guarda casas y terrenos para compararlos después", "Recibe recomendaciones según lo que te gusta", "Revisa el estado de cada consulta que envíes"];
const seller = ["Publica con un link profesional para tus compradores", "Mira visitas y consultas de cada propiedad", "Ten tu propia vitrina con todos tus proyectos"];

export default function LoginPage() {
  return (
    <section className="section container auth">
      <div className="auth__intro auth__intro--media" style={{ backgroundImage: `linear-gradient(160deg, rgba(8,32,74,.92), rgba(11,92,194,.78)), url("${photos.salaLuminosa}"), url("/img/apto-1.svg")` }}>
        <h1 className="h2">Tu cuenta en Punto Inmobiliario</h1>
        <p>Una sola cuenta para buscar tu próxima propiedad o para vender las tuyas.</p>
        <h2 className="h3">Si buscas propiedad</h2>
        <ul className="auth__perks">{buyer.map((t) => <li key={t}><CheckIcon size={16} /> {t}</li>)}</ul>
        <h2 className="h3">Si vendes</h2>
        <ul className="auth__perks">{seller.map((t) => <li key={t}><CheckIcon size={16} /> {t}</li>)}</ul>
      </div>
      <Suspense><LoginForm /></Suspense>
    </section>
  );
}
