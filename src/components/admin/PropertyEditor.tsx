"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cities, listingStatusLabel, slugify, typeLabel, type Property } from "@/data/properties";
import type { PropertyInput } from "@/lib/backend";
import { useAuth } from "../AuthProvider";
import { CloseIcon, ImageIcon } from "../Icons";
import AdminShell from "./AdminShell";

const empty: PropertyInput = {
  slug: "", title: "", operation: "venta", type: "casa", price: 0, currency: "USD", city: "Tegucigalpa",
  neighborhood: "", bedrooms: 0, bathrooms: 0, areaM2: 0, lotM2: undefined, parking: 0, images: [], features: [],
  description: "", isNew: true, featured: false, published: true, status: "publicada",
};

// Editor de propiedades. En el panel del vendedor no se elige la visibilidad: la publicación
// se activa al confirmar el pago de un plan.
export default function PropertyEditor({ mode = "admin" }: { mode?: "admin" | "seller" }) {
  const sp = useSearchParams();
  const id = sp.get("id");
  const router = useRouter();
  const { backend, profile } = useAuth();
  const seller = mode === "seller";
  const back = seller ? "/panel?tab=propiedades" : "/admin?tab=propiedades";
  const [p, setP] = useState<PropertyInput | null>(id ? null : seller ? { ...empty, status: "borrador", published: false } : empty);
  const [featuresText, setFeaturesText] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !profile || profile.role === "user") return;
    (seller ? backend.listProperties({ ownerId: profile.id }) : backend.listProperties({ includeUnpublished: true })).then((l) => {
      const found = l.find((x) => x.id === id);
      if (!found) { setError("No encontramos esa propiedad."); return; }
      const { views: _v, createdAt: _c, ...rest } = found as Property;
      setP(rest); setFeaturesText(found.features.join("\n"));
    });
  }, [id, backend, profile, seller]);

  const set = <K extends keyof PropertyInput>(k: K, v: PropertyInput[K]) => setP((x) => (x ? { ...x, [k]: v } : x));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setUploading(list.length);
    for (const f of list) {
      try {
        if (f.size > 10 * 1024 * 1024) throw new Error(`"${f.name}" pesa más de 10 MB.`);
        const url = await backend.uploadImage(f);
        setP((x) => (x ? { ...x, images: [...x.images, url] } : x));
      } catch (e) { setError((e as Error).message); }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const move = (from: number, to: number) => setP((x) => {
    if (!x || to < 0 || to >= x.images.length) return x;
    const imgs = [...x.images]; const [it] = imgs.splice(from, 1); imgs.splice(to, 0, it);
    return { ...x, images: imgs };
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!p) return;
    setError(""); setBusy(true);
    try {
      const features = featuresText.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
      await backend.saveProperty({ ...p, features, slug: p.slug || slugify(p.title) });
      router.push(back);
    } catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const isLand = p?.type === "terreno";

  return (
    <AdminShell active="propiedades" mode={mode}>
      <div className="admin__title">
        <h1 className="h2">{id ? "Editar propiedad" : "Nueva propiedad"}</h1>
        <Link className="btn btn--ghost" href={back}>Cancelar</Link>
      </div>
      {!p ? <p className="muted">{error || "Cargando…"}</p> : (
        <form className="editor" onSubmit={submit}>
          <div className="editor__main">
            <fieldset className="panel">
              <legend className="h3">Datos principales</legend>
              <label>Título<input required value={p.title} onChange={(e) => set("title", e.target.value)} placeholder="Casa con jardín en Lomas del Guijarro" /></label>
              <div className="grid-3">
                <label>Operación<select value={p.operation} onChange={(e) => set("operation", e.target.value as PropertyInput["operation"])}><option value="venta">Venta</option><option value="alquiler">Alquiler</option></select></label>
                <label>Tipo<select value={p.type} onChange={(e) => set("type", e.target.value as PropertyInput["type"])}>{Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label>Precio{p.operation === "alquiler" && " mensual"}
                  <span className="price-input">
                    <select value={p.currency} onChange={(e) => set("currency", e.target.value as PropertyInput["currency"])} aria-label="Moneda"><option value="USD">US$</option><option value="HNL">L</option></select>
                    <input type="number" min={0} step="any" required value={p.price || ""} onChange={(e) => set("price", num(e.target.value))} />
                  </span>
                </label>
              </div>
              <div className="grid-2">
                <label>Ciudad<input list="city-list" required value={p.city} onChange={(e) => set("city", e.target.value)} /><datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist></label>
                <label>Colonia, residencial o zona<input required value={p.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} /></label>
              </div>
            </fieldset>

            <fieldset className="panel">
              <legend className="h3">Fotos</legend>
              <p className="muted small">La primera foto es la portada. Arrastra para cambiar el orden.</p>
              <div className="photos">
                {p.images.map((src, i) => (
                  <div key={src + i} className={`photo${drag === i ? " is-drag" : ""}`} draggable
                    onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
                    onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}>
                    <img src={src} alt={`Foto ${i + 1}`} />
                    {i === 0 && <span className="photo__cover">Portada</span>}
                    <div className="photo__tools">
                      <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Mover a la izquierda">‹</button>
                      <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.images.length - 1} aria-label="Mover a la derecha">›</button>
                      <button type="button" onClick={() => set("images", p.images.filter((_, k) => k !== i))} aria-label="Quitar foto"><CloseIcon size={14} /></button>
                    </div>
                  </div>
                ))}
                <label className="photo photo--add" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
                  <ImageIcon size={26} />
                  <span>{uploading ? `Subiendo ${uploading}…` : "Agregar fotos"}</span>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
                </label>
              </div>
            </fieldset>

            <fieldset className="panel">
              <legend className="h3">Características</legend>
              <div className="grid-4">
                {!isLand && <label>Habitaciones<input type="number" min={0} value={p.bedrooms || ""} onChange={(e) => set("bedrooms", num(e.target.value))} /></label>}
                {!isLand && <label>Baños<input type="number" min={0} step={0.5} value={p.bathrooms || ""} onChange={(e) => set("bathrooms", num(e.target.value))} /></label>}
                {!isLand && <label>Construcción (m²)<input type="number" min={0} value={p.areaM2 || ""} onChange={(e) => set("areaM2", num(e.target.value))} /></label>}
                <label>Terreno (m²)<input type="number" min={0} value={p.lotM2 ?? ""} onChange={(e) => set("lotM2", e.target.value === "" ? undefined : Number(e.target.value))} /></label>
                {!isLand && <label>Parqueos<input type="number" min={0} value={p.parking || ""} onChange={(e) => set("parking", num(e.target.value))} /></label>}
              </div>
              <label>Descripción<textarea rows={5} required value={p.description} onChange={(e) => set("description", e.target.value)} /></label>
              <label>Lo que ofrece (una por línea)<textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Seguridad 24/7\nCisterna\nPlanta eléctrica"} /></label>
            </fieldset>
          </div>

          <aside className="editor__side">
            <div className="panel">
              <h2 className="h3">Publicación</h2>
              {seller ? (
                <>
                  <p className="small">Estado: <strong>{listingStatusLabel[p.status ?? "borrador"]}</strong></p>
                  <p className="muted small">{p.status === "publicada" || p.status === "pausada"
                    ? "Los cambios se verán en tu publicación en cuanto guardes."
                    : "Guarda la propiedad y luego toca “Publicar” en tu panel para elegir el plan y activar tu link profesional."}</p>
                  <label className="check"><input type="checkbox" checked={!!p.isNew} onChange={(e) => set("isNew", e.target.checked)} /> Etiqueta “Nuevo”</label>
                </>
              ) : <>
                <label className="check"><input type="checkbox" checked={(p.status ?? "publicada") === "publicada"} onChange={(e) => setP((x) => (x ? { ...x, status: e.target.checked ? "publicada" : "pausada", published: e.target.checked } : x))} /> Visible en el sitio</label>
                <label className="check"><input type="checkbox" checked={!!p.featured} onChange={(e) => set("featured", e.target.checked)} /> Destacada en la portada</label>
                <label className="check"><input type="checkbox" checked={!!p.isNew} onChange={(e) => set("isNew", e.target.checked)} /> Etiqueta “Nuevo”</label>
              </>}
              <label>Dirección web<input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(p.title) || "se-genera-del-titulo"} /></label>
              <p className="muted small">/propiedades/{p.slug ? slugify(p.slug) : slugify(p.title) || "…"}</p>
              {error && <p className="form__error">{error}</p>}
              <button className="btn btn--primary btn--block" disabled={busy || uploading > 0}>{busy ? "Guardando…" : id ? "Guardar cambios" : seller ? "Guardar propiedad" : "Publicar propiedad"}</button>
            </div>
          </aside>
        </form>
      )}
    </AdminShell>
  );
}
