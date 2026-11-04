import { cities } from "@/data/properties";
import { SearchIcon } from "./Icons";

// Buscador principal al estilo Redfin: pestañas + campo grande con botón redondo.
// Es un formulario GET normal hacia /propiedades, así funciona sin JavaScript.
export default function HeroSearch() {
  const tabs = [
    { value: "venta", label: "Comprar" },
    { value: "alquiler", label: "Alquilar" },
    { value: "terreno", label: "Terrenos" },
  ];
  return (
    <form className="hero-search" action="/propiedades" method="get" role="search">
      <div className="hero-tabs" role="radiogroup" aria-label="Qué buscas">
        {tabs.map((t, i) => (
          <label key={t.value} className="hero-tab">
            <input type="radio" name="operacion" value={t.value} defaultChecked={i === 0} />
            <span>{t.label}</span>
          </label>
        ))}
      </div>
      <div className="hero-field">
        <input
          type="search" name="q" list="hero-cities" autoComplete="off"
          placeholder="Ciudad, colonia o residencial (ej. Lomas del Guijarro)"
          aria-label="Buscar por ciudad, colonia o residencial"
        />
        <datalist id="hero-cities">
          {cities.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button type="submit" className="hero-submit" aria-label="Buscar">
          <SearchIcon size={22} />
        </button>
      </div>
    </form>
  );
}
