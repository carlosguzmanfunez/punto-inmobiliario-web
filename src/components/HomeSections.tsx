"use client";
import { photos } from "@/data/photos";
import Link from "next/link";
import { useEffect, useState } from "react";
import { typeLabel, typePlural, type PropertyType } from "@/data/properties";
import { allCities, featuredCities } from "@/data/geo";
import type { Seller } from "@/lib/backend";
import { formatLempiras, whatsappLink } from "@/lib/site";
import { useAuth, usePlans } from "./AuthProvider";
import { useProperties } from "./useProperties";
import { BuildingIcon, CheckIcon, HomeIcon, StoreIcon, WhatsAppIcon } from "./Icons";

const groups: { title: string; icon: React.ReactNode; types: PropertyType[] }[] = [
  { title: "Residencial", icon: <HomeIcon size={22} />, types: ["casa", "apartamento", "terreno"] },
  { title: "Comercial", icon: <StoreIcon size={22} />, types: ["local", "oficina", "bodega"] },
];
const typeImg: Record<PropertyType, string> = {
  casa: photos.casaJardin, apartamento: photos.torre, terreno: photos.terreno,
  local: photos.local, oficina: photos.oficina, bodega: photos.bodega,
};

export function TypeExplorer() {
  const { list } = useProperties();
  const count = (t: PropertyType) => (list ?? []).filter((p) => p.type === t).length;
  return (
    <div className="type-groups">
      {groups.map((g) => (
        <div key={g.title} className="type-group">
          <h3 className="type-group__title">{g.icon} {g.title}</h3>
          <div className="type-tiles">
            {g.types.map((t) => (
              <Link key={t} href={`/propiedades?tipo=${t}`} className="type-tile">
                <img src={typeImg[t]} alt="" loading="lazy" />
                <span className="type-tile__label"><strong>{typePlural[t]}</strong><small>{list ? `${count(t)} ${count(t) === 1 ? "disponible" : "disponibles"}` : "…"}</small></span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CityExplorer() {
  const { list } = useProperties();
  return (
    <div className="city-grid">
      {featuredCities.map((c) => {
        const n = (list ?? []).filter((p) => p.city === c.name).length;
        return (
          <Link key={c.name} href={`/propiedades?ciudad=${encodeURIComponent(c.name)}&depto=${encodeURIComponent(c.department)}`} className="city-card">
            <img src={c.image} alt="" loading="lazy" />
            <span className="city-card__shade" />
            <span className="city-card__text"><strong>{c.name}</strong><small>{c.department} · {list ? `${n} ${n === 1 ? "propiedad" : "propiedades"}` : "…"}</small></span>
          </Link>
        );
      })}
    </div>
  );
}

export function ProjectsBlock() {
  const plans = usePlans();
  const { backend } = useAuth();
  const { list } = useProperties();
  const [sellers, setSellers] = useState<Seller[] | null>(null);
  useEffect(() => { backend.listVitrinas().then(setSellers).catch(() => setSellers([])); }, [backend]);
  return (
    <div className="projects">
      {(sellers ?? []).slice(0, 3).map((s) => {
        const mine = (list ?? []).filter((p) => p.ownerId === s.id);
        return (
          <Link key={s.id} href={`/vendedores/${s.slug}`} className="project-card">
            <div className="project-card__media"><img src={mine[0]?.images[0] ?? "/img/apto-2.svg"} alt="" loading="lazy" /></div>
            <div className="project-card__body">
              <div className="seller-chip__logo">{s.logo ? <img src={s.logo} alt="" /> : s.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{s.name}</strong>
                <p className="muted small">{s.city || "Honduras"} · {mine.length} {mine.length === 1 ? "propiedad" : "propiedades"}</p>
              </div>
            </div>
            {s.bio && <p className="project-card__bio muted small">{s.bio}</p>}
            <span className="link-arrow">Ver vitrina →</span>
          </Link>
        );
      })}
      <div className="project-card project-card--cta">
        <BuildingIcon size={30} />
        <h3>¿Eres constructora o desarrollador?</h3>
        <p className="muted">Abre tu vitrina con logo, descripción y todos tus proyectos en un solo link. Desde {formatLempiras(plans.vitrina.price)} al mes.</p>
        <Link href="/vender#vitrina" className="btn btn--primary btn--sm">Conocer la vitrina</Link>
      </div>
    </div>
  );
}

// Formulario corto para dueños que prefieren que un asesor publique por ellos.
export function PublishLead() {
  const { backend, profile } = useAuth();
  const [f, setF] = useState({ op: "Vender", type: "Casa", city: "", name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (profile) setF((x) => ({ ...x, name: x.name || profile.fullName, phone: x.phone || profile.phone })); }, [profile]);
  if (sent) return (
    <div className="notice notice--ok lead-done">
      <strong>¡Gracias, {f.name.split(" ")[0]}!</strong> Un asesor te escribirá por WhatsApp para coordinar fotos y publicación.
      <div className="demo-box__row"><Link href="/vender" className="btn btn--outline btn--sm">Ver planes</Link></div>
    </div>
  );
  return (
    <form className="lead-form" onSubmit={async (e) => {
      e.preventDefault(); setErr("");
      try {
        await backend.createInquiry({ propertyId: null, name: f.name, email: profile?.email ?? "", phone: f.phone,
          message: `Quiero ${f.op.toLowerCase()} una propiedad: ${f.type} en ${f.city || "Honduras"}. Solicito asesoría para publicarla.` });
        setSent(true);
      } catch (x) { setErr((x as Error).message); }
    }}>
      <h3>Te ayudamos a publicar</h3>
      <div className="lead-form__grid">
        <label>¿Vendes o alquilas?<select value={f.op} onChange={(e) => setF({ ...f, op: e.target.value })}><option>Vender</option><option>Alquilar</option></select></label>
        <label>Tipo<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{Object.values(typeLabel).map((t) => <option key={t}>{t}</option>)}</select></label>
        <label>Ciudad<input list="lead-cities" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Ej. Tegucigalpa" /><datalist id="lead-cities">{allCities.map((c) => <option key={c} value={c} />)}</datalist></label>
        <label>Tu nombre<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="lead-form__wide">WhatsApp<input required type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+504 9999-9999" /></label>
      </div>
      {err && <p className="form__error">{err}</p>}
      <button className="btn btn--primary btn--block">Quiero que me contacten</button>
      <a className="btn btn--wa btn--block" href={whatsappLink("Hola, quiero publicar mi propiedad en Punto Inmobiliario Hn.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /> Prefiero escribir por WhatsApp</a>
    </form>
  );
}

export function PublishSteps() {
  const plans = usePlans();
  return (
    <ol className="publish-steps">
      <li><span className="steps__n">1</span><div><strong>Crea tu cuenta de vendedor</strong><p className="muted small">Gratis, en un minuto. O déjanos tus datos y un asesor lo hace contigo.</p></div></li>
      <li><span className="steps__n">2</span><div><strong>Sube fotos y detalles</strong><p className="muted small">Precio, ubicación, amenidades y todo lo que hace especial tu propiedad.</p></div></li>
      <li><span className="steps__n">3</span><div><strong>Activa tu plan y comparte tu link</strong><p className="muted small">Desde {formatLempiras(plans.publicacion.price)} por {plans.publicacion.days} días. Recibes un link profesional para enviar por WhatsApp.</p></div></li>
      <li className="publish-steps__perks">
        {["Consultas directo a tu WhatsApp", "Estadísticas de visitas", "Tu propia vitrina si eres desarrollador"].map((t) => <span key={t}><CheckIcon size={16} /> {t}</span>)}
      </li>
    </ol>
  );
}
