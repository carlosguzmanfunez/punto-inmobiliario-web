import { isLive, properties as seedProperties, slugify, type ListingStatus, type Property } from "@/data/properties";
import { defaultSettings, plans, plansWith } from "@/lib/site";
import { photos } from "@/data/photos";
import { vitrinaActive, type Backend, type Inquiry, type Payment, type Profile, type SavedSearch, type Seller, type Settings } from "./types";

// Modo demo: todo se guarda en localStorage del navegador. Sirve para probar el sitio
// sin base de datos. Cuentas de prueba (clave 123456789@): puntoinmobiliariohn@gmail.com y
// admin@demo.hn (administradores), ventas@morazan.hn (vendedor) y maria@ejemplo.com (compradora).
type DemoUser = Profile & { password: string };
type DB = {
  users: DemoUser[]; sellers: Seller[]; properties: Property[]; payments: Payment[];
  favorites: { userId: string; propertyId: string }[]; inquiries: Inquiry[]; session: string | null;
  searches: (SavedSearch & { userId: string })[];
  settings?: Settings;
};

const KEY = "pihn-demo-v6";
// Todas las cuentas de prueba usan la misma clave, como pidió el dueño del sitio.
export const DEMO_PASSWORD = "123456789@";
export const DEMO_OWNER = { email: "puntoinmobiliariohn@gmail.com", password: DEMO_PASSWORD };
export const DEMO_ADMIN = { email: "admin@demo.hn", password: DEMO_PASSWORD };
export const DEMO_SELLER = { email: "ventas@morazan.hn", password: DEMO_PASSWORD };
export const DEMO_BUYER = { email: "maria@ejemplo.com", password: DEMO_PASSWORD };

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();
const DAY = 864e5;
const plusDays = (from: string | null | undefined, days: number) => {
  const base = Math.max(Date.now(), from ? new Date(from).getTime() : 0);
  return new Date(base + days * DAY).toISOString();
};

function seed(): DB {
  const admin: DemoUser = { id: "u-admin", email: DEMO_ADMIN.email, password: DEMO_ADMIN.password, fullName: "Administrador", phone: "+504 8909-2285", role: "admin", createdAt: "2026-10-01T12:00:00.000Z" };
  const owner: DemoUser = { id: "u-owner", email: DEMO_OWNER.email, password: DEMO_OWNER.password, fullName: "Carlos Guzmán", phone: "+504 8909-2285", role: "admin", createdAt: "2026-09-26T12:00:00.000Z" };
  const maria: DemoUser = { id: "u-maria", email: DEMO_BUYER.email, password: DEMO_BUYER.password, fullName: "María López", phone: "+1 305 555 0182", role: "user", createdAt: "2026-10-20T15:30:00.000Z" };
  const seller: DemoUser = { id: "u-morazan", email: DEMO_SELLER.email, password: DEMO_SELLER.password, fullName: "Ricardo Fiallos", phone: "+504 9876-5432", role: "seller", createdAt: "2026-10-12T10:00:00.000Z" };
  const morazan: Seller = {
    id: seller.id, slug: "desarrollos-morazan", name: "Desarrollos Morazán", city: "San Pedro Sula", whatsapp: "+504 9876-5432", logo: "",
    bio: "Constructora familiar con 15 años desarrollando vivienda y apartamentos en San Pedro Sula y Tegucigalpa. Acompañamos a cada familia desde la reserva hasta la entrega de llaves.",
    vitrinaUntil: plusDays(null, 21), createdAt: seller.createdAt,
  };
  const p = seedProperties.map((x) => ({ ...x }));
  // Dos propiedades del vendedor de prueba, con su plan vigente.
  for (const [slug, days] of [["apartamento-torre-sps", 18], ["terreno-carretera-santa-lucia", 5]] as const) {
    const x = p.find((y) => y.slug === slug)!;
    x.ownerId = seller.id; x.status = "publicada"; x.paidUntil = plusDays(null, days);
  }
  // Propiedades de los otros vendedores de ejemplo.
  for (const [slug, owner, days] of [["casa-colonia-el-toronjal-la-ceiba", "u-caribe", 23], ["apartamento-frente-al-mar-west-end", "u-caribe", 3], ["oficina-corporativa-lomas-del-mayab", "u-lempira", 27], ["bodega-industrial-choloma", "u-lempira", 11], ["casa-familiar-siguatepeque", "u-karla", 6]] as const) {
    const x = p.find((y) => y.slug === slug)!;
    x.ownerId = owner; x.status = "publicada"; x.paidUntil = plusDays(null, days);
  }
  const draft: Property = {
    id: "torre-alameda-pendiente", slug: "torre-alameda-apartamentos-preventa", title: "Torre Alameda: apartamentos en preventa",
    operation: "venta", type: "apartamento", price: 3200000, currency: "HNL", city: "San Pedro Sula", neighborhood: "Colonia Alameda",
    bedrooms: 2, bathrooms: 2, areaM2: 98, parking: 1, images: [photos.edificios, photos.salaLuminosa],
    features: ["Preventa", "Prima en cuotas", "Piscina", "Gimnasio", "Entrega 2027"],
    description: "Proyecto de 48 apartamentos en la Colonia Alameda. Reserva con L 20,000 y paga la prima en cuotas durante la construcción.",
    isNew: true, featured: false, published: false, views: 0, createdAt: now(), ownerId: seller.id, status: "pendiente", paidUntil: null,
  };
  p.push(draft);

  // Historia de ejemplo de 90 días para que el panel muestre métricas realistas.
  const h = history(p, [seller, ...extraSellerUsers], maria);
  return {
    users: [owner, admin, maria, seller, ...extraSellerUsers, ...h.buyers],
    sellers: [morazan, ...extraSellers],
    properties: p,
    payments: [
      { id: uid(), sellerId: seller.id, kind: "publicacion", propertyId: draft.id, amount: plans.publicacion.price, reference: "Transferencia BAC #448812", status: "pendiente", createdAt: now(), confirmedAt: null, receipt: sampleReceipt(plans.publicacion.price) },
      { id: uid(), sellerId: seller.id, kind: "vitrina", propertyId: null, amount: plans.vitrina.price, reference: "Depósito Atlántida", status: "pagado", createdAt: new Date(Date.now() - 9 * DAY).toISOString(), confirmedAt: new Date(Date.now() - 9 * DAY).toISOString() },
      { id: uid(), sellerId: seller.id, kind: "destacada", propertyId: "apartamento-torre-sps", amount: plans.destacada.price, reference: "Transferencia BAC #440219", status: "pagado", createdAt: new Date(Date.now() - 12 * DAY).toISOString(), confirmedAt: new Date(Date.now() - 12 * DAY).toISOString() },
      { id: uid(), sellerId: seller.id, kind: "publicacion", propertyId: "terreno-carretera-santa-lucia", amount: plans.publicacion.price, reference: "Depósito Ficohsa", status: "pagado", createdAt: new Date(Date.now() - 25 * DAY).toISOString(), confirmedAt: new Date(Date.now() - 25 * DAY).toISOString() },
      ...h.payments,
    ],
    favorites: [{ userId: maria.id, propertyId: p[5].id }, { userId: maria.id, propertyId: p[0].id }, ...h.favorites],
    inquiries: [
      { id: uid(), propertyId: p[5].id, userId: maria.id, name: maria.fullName, email: maria.email, phone: maria.phone, message: "Vivo en Miami, ¿pueden hacerme un recorrido por videollamada este sábado?", status: "nueva", createdAt: new Date(Date.now() - 1.2 * DAY).toISOString() },
      { id: uid(), propertyId: p[1].id, userId: null, name: "Jorge Martínez", email: "jorge.m@ejemplo.com", phone: "+504 9988-7766", message: "¿El alquiler incluye mantenimiento? Me interesa por 12 meses.", status: "en_proceso", createdAt: new Date(Date.now() - 2.4 * DAY).toISOString() },
      { id: uid(), propertyId: p[2].id, userId: null, name: "Ana Reyes", email: "ana.reyes@ejemplo.com", phone: "+504 3311-2244", message: "¿Aceptan financiamiento con BAC? Quisiera visitarla.", status: "cerrada", createdAt: new Date(Date.now() - 6.6 * DAY).toISOString() },
      { id: uid(), propertyId: p[4].id, userId: null, name: "Luis Paredes", email: "luis.p@ejemplo.com", phone: "+504 9512-3344", message: "¿El apartamento tiene vista al Merendón desde la sala? Me interesa para inversión.", status: "nueva", createdAt: new Date(Date.now() - 0.4 * DAY).toISOString() },
      ...h.inquiries,
    ],
    settings: { ...defaultSettings, bankInfo: "BAC Credomatic · Cuenta de ahorro en lempiras 7300-0000-00 · A nombre de Punto Inmobiliario Hn (datos de prueba)" },
    searches: [
      { id: uid(), userId: maria.id, name: "Casas en venta en Tegucigalpa", query: "operacion=venta&tipo=casa&ciudad=Tegucigalpa", createdAt: "2026-11-01T10:00:00.000Z" },
    ],
    session: null,
  };
}

// ---------- Datos de ejemplo para el panel (nombres y contactos ficticios) ----------
const extraSellerUsers: DemoUser[] = [
  { id: "u-caribe", email: "info@caribeinmuebles.hn", password: DEMO_PASSWORD, fullName: "Gabriela Ramos", phone: "+504 9455-1020", role: "seller", createdAt: new Date(Date.now() - 64 * DAY).toISOString() },
  { id: "u-lempira", email: "ventas@lempirabienes.hn", password: DEMO_PASSWORD, fullName: "Óscar Zelaya", phone: "+504 9733-8812", role: "seller", createdAt: new Date(Date.now() - 41 * DAY).toISOString() },
  { id: "u-karla", email: "karla.mejia@ejemplo.com", password: DEMO_PASSWORD, fullName: "Karla Mejía", phone: "+504 3190-4471", role: "seller", createdAt: new Date(Date.now() - 17 * DAY).toISOString() },
];
const extraSellers: Seller[] = [
  { id: "u-caribe", slug: "caribe-inmuebles", name: "Caribe Inmuebles", city: "La Ceiba", whatsapp: "+504 9455-1020", logo: "", bio: "Casas y apartamentos en La Ceiba, Roatán y Utila. Especialistas en compradores que viven fuera de Honduras.", vitrinaUntil: new Date(Date.now() + 4 * DAY).toISOString(), createdAt: extraSellerUsers[0].createdAt },
  { id: "u-lempira", slug: "lempira-bienes-raices", name: "Lempira Bienes Raíces", city: "Tegucigalpa", whatsapp: "+504 9733-8812", logo: "", bio: "Oficinas, locales y bodegas para empresas en Tegucigalpa y el valle de Sula.", vitrinaUntil: null, createdAt: extraSellerUsers[1].createdAt },
  { id: "u-karla", slug: "karla-mejia", name: "Karla Mejía, agente", city: "Siguatepeque", whatsapp: "+504 3190-4471", logo: "", bio: "Agente independiente en la zona central: Siguatepeque, Comayagua y La Esperanza.", vitrinaUntil: null, createdAt: extraSellerUsers[2].createdAt },
];

// Generador con semilla fija: siempre produce la misma historia.
function rng(seed = 7) { let x = seed; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }

function history(p: Property[], sellerUsers: DemoUser[], maria: DemoUser) {
  const r = rng(11);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const ago = (d: number) => new Date(Date.now() - d * DAY - Math.floor(r() * 10) * 3600e3).toISOString();
  const first = ["Carlos", "José", "Luis", "Ana", "María", "Sofía", "Daniel", "Andrea", "Fernando", "Gabriela", "Mario", "Lucía", "Héctor", "Paola", "Roberto", "Valeria", "Javier", "Diana", "Kevin", "Alejandra", "Marvin", "Claudia", "Wilmer", "Fátima"];
  const last = ["Hernández", "López", "Martínez", "Rodríguez", "García", "Flores", "Cruz", "Reyes", "Mejía", "Castro", "Ordóñez", "Pineda", "Zúniga", "Banegas", "Aguilar", "Rivera"];
  const abroad = ["+1 305", "+1 713", "+1 718", "+34 6", "+1 404", "+1 214"];
  const phone = () => r() < 0.32 ? `${pick(abroad)} ${100 + Math.floor(r() * 900)} ${1000 + Math.floor(r() * 9000)}` : `+504 ${pick(["9", "8", "3"])}${100 + Math.floor(r() * 900)}-${1000 + Math.floor(r() * 9000)}`;
  const buyers: DemoUser[] = [];
  for (let k = 0; k < 34; k++) {
    const fn = pick(first), ln = pick(last);
    // Más registros en las últimas semanas: el sitio va creciendo.
    const d = Math.floor(Math.pow(r(), 1.6) * 88) + 1;
    buyers.push({ id: `u-b${k}`, email: `${fn}.${ln}${k}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "@ejemplo.com", password: DEMO_PASSWORD, fullName: `${fn} ${ln}`, phone: phone(), role: "user", createdAt: ago(d) });
  }
  const live = p.filter((x) => x.published !== false);
  const msgs = [
    "¿Sigue disponible? Me gustaría agendar una visita.",
    "¿Cuál es el precio final? ¿Aceptan negociación?",
    "Vivo fuera de Honduras, ¿pueden hacer el recorrido por videollamada?",
    "¿Aceptan financiamiento bancario o con cooperativa?",
    "¿Tiene escritura pública y está libre de gravámenes?",
    "Me interesa para inversión, ¿cuánto se renta en la zona?",
    "¿Incluye mantenimiento y seguridad? ¿Cuál es la cuota?",
    "Visita presencial el sábado por la mañana, ¿es posible?",
  ];
  const inquiries: Inquiry[] = [];
  for (let k = 0; k < 58; k++) {
    const d = Math.pow(r(), 1.3) * 89 + 0.5;
    const prop = r() < 0.88 ? live[Math.floor(Math.pow(r(), 1.4) * live.length)] : null;
    const reg = r() < 0.45 ? pick(buyers) : null;
    const fn = pick(first), ln = pick(last);
    const name = reg?.fullName ?? `${fn} ${ln}`;
    const status: Inquiry["status"] = d < 4 ? (r() < 0.7 ? "nueva" : "en_proceso") : d < 20 ? pick(["en_proceso", "en_proceso", "cerrada", "nueva"] as const) : "cerrada";
    inquiries.push({
      id: uid(), propertyId: prop?.id ?? null, userId: reg?.id ?? null, name,
      email: reg?.email ?? `${fn}.${ln}.${k}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "@ejemplo.com",
      phone: reg?.phone ?? phone(), message: prop ? pick(msgs) : "Busco casa de 3 habitaciones en Tegucigalpa, presupuesto de L 3 millones.",
      status, createdAt: ago(d),
    });
  }
  // Pagos confirmados de los vendedores en los últimos 90 días.
  const payments: Payment[] = [];
  const kinds = ["publicacion", "publicacion", "publicacion", "destacada", "destacada", "vitrina"] as const;
  for (let k = 0; k < 26; k++) {
    const d = Math.pow(r(), 1.2) * 88 + 1;
    const kind = pick(kinds);
    const su = pick(sellerUsers);
    const owned = p.filter((x) => x.ownerId === su.id);
    const at = ago(d);
    payments.push({ id: uid(), sellerId: su.id, kind, propertyId: kind === "vitrina" ? null : owned[0]?.id ?? null, amount: plans[kind].price, reference: `${pick(["Transferencia BAC", "Depósito Ficohsa", "Transferencia Atlántida", "Depósito Banpaís"])} #${100000 + Math.floor(r() * 899999)}`, status: r() < 0.93 ? "pagado" : "rechazado", createdAt: at, confirmedAt: at });
  }
  const favorites = buyers.slice(0, 20).flatMap((b, k) => [{ userId: b.id, propertyId: live[(k * 3) % live.length].id }, ...(k % 2 ? [{ userId: b.id, propertyId: live[(k * 7 + 2) % live.length].id }] : [])]);
  void maria;
  return { buyers, inquiries, payments, favorites };
}

function load(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const db = JSON.parse(raw); db.searches ??= []; db.settings ??= { ...defaultSettings }; return db; }
  } catch {}
  const db = seed();
  save(db);
  return db;
}

function save(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {
    throw new Error("El navegador no tiene espacio para guardar más datos de prueba. Usa fotos más pequeñas.");
  }
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const strip = ({ password: _p, ...rest }: DemoUser): Profile => rest;
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));

function current(db: DB) { return db.users.find((u) => u.id === db.session) ?? null; }
function requireUser(db: DB) { const u = current(db); if (!u) throw new Error("Debes iniciar sesión."); return u; }
function requireAdmin(db: DB) { const u = requireUser(db); if (u.role !== "admin") throw new Error("Solo para administradores."); return u; }
function requireSeller(db: DB) { const u = requireUser(db); if (u.role !== "seller" && u.role !== "admin") throw new Error("Necesitas una cuenta de vendedor."); return u; }

function withTitles(db: DB, list: Inquiry[]) {
  return list.map((i) => {
    const p = db.properties.find((x) => x.id === i.propertyId);
    return { ...i, propertyTitle: p?.title, propertySlug: p?.slug };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function withPaymentNames(db: DB, list: Payment[]) {
  return list.map((x) => ({
    ...x,
    sellerName: db.sellers.find((s) => s.id === x.sellerId)?.name,
    propertyTitle: db.properties.find((p) => p.id === x.propertyId)?.title,
  })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function newSeller(u: DemoUser, name: string, db: DB): Seller {
  let slug = slugify(name) || `vendedor-${u.id.slice(0, 6)}`;
  if (db.sellers.some((s) => s.slug === slug)) slug = `${slug}-${u.id.slice(0, 4)}`;
  return { id: u.id, slug, name, bio: "", whatsapp: u.phone, city: "", logo: "", vitrinaUntil: null, createdAt: now() };
}

// Reduce la foto a un máximo de 1600 px para que quepa en el navegador.
// Comprobante de ejemplo para el modo demo (una imagen simple, no un documento real).
function sampleReceipt(amount: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="420" viewBox="0 0 360 420"><rect width="360" height="420" fill="#f7f9fc"/><rect x="20" y="20" width="320" height="380" rx="14" fill="#fff" stroke="#d8dee8"/><text x="180" y="70" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#0b5cc2">Comprobante de ejemplo</text><text x="180" y="98" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6b7480">Modo de prueba</text><g font-family="sans-serif" font-size="15" fill="#1b1f24"><text x="44" y="160">Referencia</text><text x="316" y="160" text-anchor="end">#448812</text><text x="44" y="200">Monto</text><text x="316" y="200" text-anchor="end">L ${amount.toLocaleString("en-US")}</text><text x="44" y="240">Concepto</text><text x="316" y="240" text-anchor="end">Publicación</text></g><text x="180" y="340" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#127a43">✓</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function resizeImage(file: File, max = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = url;
  });
}

// Estado que queda al guardar. El vendedor solo puede pausar o reactivar una publicación
// pagada; publicarla por primera vez requiere un pago confirmado por el administrador.
export function nextStatus(isAdmin: boolean, input: Pick<Property, "status" | "published">, old: Property | null): ListingStatus {
  if (isAdmin) return input.status ?? old?.status ?? "publicada";
  const prev = old?.status ?? "borrador";
  const paid = !!old?.paidUntil && new Date(old.paidUntil).getTime() >= Date.now();
  if (input.status === "pausada" && prev === "publicada") return "pausada";
  if (input.status === "publicada" && prev === "pausada" && paid) return "publicada";
  if (prev === "rechazada") return "borrador";
  return prev;
}

// Orden del listado público: destacadas primero, luego las más recientes.
const byListing = (a: Property, b: Property) => Number(!!b.featured) - Number(!!a.featured) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

export function createDemoBackend(): Backend {
  return {
    mode: "demo",
    async getCurrentProfile() { const u = current(load()); return delay(u ? strip(u) : null); },
    onAuthChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async signUp({ email, password, fullName, phone, accountType, businessName }) {
      const db = load();
      const e = email.trim().toLowerCase();
      if (db.users.some((u) => u.email === e)) throw new Error("Ya existe una cuenta con ese correo.");
      if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
      const u: DemoUser = { id: uid(), email: e, password, fullName, phone, role: accountType === "vendedor" ? "seller" : "user", createdAt: now() };
      db.users.push(u);
      if (u.role === "seller") db.sellers.push(newSeller(u, businessName?.trim() || fullName, db));
      db.session = u.id; save(db); emit();
      return delay({ needsConfirmation: false });
    },
    async signIn(email, password) {
      const db = load();
      const u = db.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) throw new Error("Correo o contraseña incorrectos.");
      db.session = u.id; save(db); emit(); await delay(null);
    },
    async signInWithGoogle() {
      throw new Error("El ingreso con Google se activa cuando el sitio se conecte a la base de datos. Mientras tanto entra con tu correo y contraseña.");
    },
    async signOut() { const db = load(); db.session = null; save(db); emit(); },
    async resetPassword() { await delay(null); },
    async updateProfile({ fullName, phone }) {
      const db = load(); const u = requireUser(db);
      u.fullName = fullName; u.phone = phone; save(db); emit();
    },
    async becomeSeller(businessName) {
      const db = load(); const u = requireUser(db);
      if (u.role === "user") u.role = "seller";
      if (!db.sellers.some((s) => s.id === u.id)) db.sellers.push(newSeller(u, businessName.trim() || u.fullName, db));
      save(db); emit();
    },

    async listProperties(opts) {
      const db = load(); const u = current(db);
      let list = db.properties;
      if (opts?.ownerId) {
        if (u?.id !== opts.ownerId && u?.role !== "admin") list = list.filter((p) => p.ownerId === opts.ownerId && isLive(p));
        else list = list.filter((p) => p.ownerId === opts.ownerId);
      } else if (!(opts?.includeUnpublished && u?.role === "admin")) {
        list = list.filter((p) => isLive(p));
      }
      return delay([...list].sort(byListing));
    },
    async getProperty(slug) {
      const db = load(); const u = current(db);
      const p = db.properties.find((x) => x.slug === slug);
      if (!p) return delay(null);
      if (!isLive(p) && u?.role !== "admin" && u?.id !== p.ownerId) return delay(null);
      return delay(p);
    },
    async saveProperty(input) {
      const db = load(); const u = requireSeller(db);
      const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
      if (db.properties.some((p) => p.slug === slug && p.id !== input.id)) throw new Error("Ya existe otra propiedad con esa dirección web. Cambia el título o la dirección.");
      const i = input.id ? db.properties.findIndex((p) => p.id === input.id) : -1;
      const old = i >= 0 ? db.properties[i] : null;
      if (old && u.role !== "admin" && old.ownerId !== u.id) throw new Error("Solo puedes editar tus propias publicaciones.");
      let next: Property = old ? { ...old, ...input, id: old.id, slug } : { ...input, id: uid(), slug, views: 0, createdAt: now() };
      next.status = nextStatus(u.role === "admin", input, old);
      if (u.role !== "admin") {
        // El vendedor no decide la visibilidad pagada: eso lo activa el pago confirmado.
        next = { ...next, ownerId: old?.ownerId ?? u.id, featured: old?.featured ?? false, paidUntil: old?.paidUntil ?? null, views: old?.views ?? 0 };
      }
      next.published = next.status === "publicada";
      if (old) db.properties[i] = next; else db.properties.push(next);
      save(db); return delay(next);
    },
    async deleteProperty(id) {
      const db = load(); const u = requireSeller(db);
      const p = db.properties.find((x) => x.id === id);
      if (p && u.role !== "admin" && p.ownerId !== u.id) throw new Error("Solo puedes eliminar tus propias publicaciones.");
      db.properties = db.properties.filter((x) => x.id !== id);
      db.favorites = db.favorites.filter((f) => f.propertyId !== id);
      db.inquiries.forEach((q) => { if (q.propertyId === id) q.propertyId = null; });
      save(db);
    },
    async uploadImage(file) { requireSeller(load()); return resizeImage(file); },
    async recordView(id) {
      const db = load(); const p = db.properties.find((x) => x.id === id);
      if (p) { p.views = (p.views ?? 0) + 1; save(db); }
    },

    async getSeller(id) { return delay(load().sellers.find((s) => s.id === id) ?? null); },
    async getSellerBySlug(slug) { return delay(load().sellers.find((s) => s.slug === slug) ?? null); },
    async saveMySeller(d) {
      const db = load(); const u = requireSeller(db);
      const slug = slugify(d.slug || d.name);
      if (!slug) throw new Error("Escribe el nombre de tu negocio.");
      if (db.sellers.some((s) => s.slug === slug && s.id !== u.id)) throw new Error("Esa dirección ya la usa otro vendedor. Prueba con otra.");
      let s = db.sellers.find((x) => x.id === u.id);
      if (!s) { s = newSeller(u, d.name, db); db.sellers.push(s); }
      Object.assign(s, { ...d, slug });
      save(db); return delay({ ...s });
    },
    async listSellers() { const db = load(); requireAdmin(db); return delay([...db.sellers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))); },
    async getSettings() { return delay({ ...defaultSettings, ...load().settings }); },
    async saveSettings(st) {
      const db = load(); requireAdmin(db);
      if (!(st.usdRate > 0)) throw new Error("El tipo de cambio debe ser mayor que cero.");
      db.settings = st; save(db); emit();
    },
    async listVitrinas() { return delay(load().sellers.filter((s) => vitrinaActive(s))); },

    async listSavedSearches() {
      const db = load(); const u = requireUser(db);
      return delay(db.searches.filter((x) => x.userId === u.id).map(({ userId: _u, ...x }) => x).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },
    async saveSearch({ name, query }) {
      const db = load(); const u = requireUser(db);
      if (db.searches.some((x) => x.userId === u.id && x.query === query)) throw new Error("Ya tienes guardada esta búsqueda.");
      db.searches.push({ id: uid(), userId: u.id, name: name.trim() || "Mi búsqueda", query, createdAt: now() });
      save(db); await delay(null);
    },
    async deleteSavedSearch(id) {
      const db = load(); const u = requireUser(db);
      db.searches = db.searches.filter((x) => !(x.id === id && x.userId === u.id)); save(db);
    },

    async requestPayment({ kind, propertyId, reference, receipt }) {
      const db = load(); const u = requireSeller(db);
      if (!db.sellers.some((s) => s.id === u.id)) db.sellers.push(newSeller(u, u.fullName, db));
      if (propertyId) {
        const p = db.properties.find((x) => x.id === propertyId);
        if (!p || (p.ownerId !== u.id && u.role !== "admin")) throw new Error("No encontramos esa publicación.");
        if (p.status !== "publicada") p.status = "pendiente";
      }
      db.payments.push({ id: uid(), sellerId: u.id, kind, propertyId, amount: plansWith(db.settings?.prices)[kind].price, reference: reference.trim(), status: "pendiente", createdAt: now(), confirmedAt: null, receipt: receipt ? await resizeImage(receipt, 1100) : null });
      save(db); await delay(null);
    },
    async receiptUrl(receipt) { return receipt; },
    async listMyPayments() { const db = load(); const u = requireUser(db); return delay(withPaymentNames(db, db.payments.filter((x) => x.sellerId === u.id))); },
    async listPayments() { const db = load(); requireAdmin(db); return delay(withPaymentNames(db, db.payments)); },
    async confirmPayment(id) {
      const db = load(); requireAdmin(db);
      const pay = db.payments.find((x) => x.id === id);
      if (!pay || pay.status !== "pendiente") throw new Error("Ese pago ya fue procesado.");
      pay.status = "pagado"; pay.confirmedAt = now();
      const days = plans[pay.kind].days;
      if (pay.kind === "vitrina") {
        const s = db.sellers.find((x) => x.id === pay.sellerId);
        if (s) s.vitrinaUntil = plusDays(s.vitrinaUntil, days);
      } else {
        const p = db.properties.find((x) => x.id === pay.propertyId);
        if (p) { p.status = "publicada"; p.published = true; p.paidUntil = plusDays(p.paidUntil, days); p.featured = pay.kind === "destacada"; }
      }
      save(db);
    },
    async rejectPayment(id) {
      const db = load(); requireAdmin(db);
      const pay = db.payments.find((x) => x.id === id);
      if (!pay || pay.status !== "pendiente") throw new Error("Ese pago ya fue procesado.");
      pay.status = "rechazado"; pay.confirmedAt = now();
      const p = db.properties.find((x) => x.id === pay.propertyId);
      if (p && p.status === "pendiente") p.status = "rechazada";
      save(db);
    },

    async listFavoriteIds() {
      const db = load(); const u = current(db);
      return delay(u ? db.favorites.filter((f) => f.userId === u.id).map((f) => f.propertyId) : []);
    },
    async toggleFavorite(propertyId) {
      const db = load(); const u = requireUser(db);
      const i = db.favorites.findIndex((f) => f.userId === u.id && f.propertyId === propertyId);
      if (i >= 0) db.favorites.splice(i, 1); else db.favorites.push({ userId: u.id, propertyId });
      save(db); return i < 0;
    },

    async createInquiry(d) {
      const db = load(); const u = current(db);
      db.inquiries.push({ ...d, id: uid(), userId: u?.id ?? null, status: "nueva", createdAt: now() });
      save(db); await delay(null);
    },
    async listMyInquiries() {
      const db = load(); const u = requireUser(db);
      return delay(withTitles(db, db.inquiries.filter((i) => i.userId === u.id)));
    },
    async listReceivedInquiries() {
      const db = load(); const u = requireSeller(db);
      const mine = new Set(db.properties.filter((p) => p.ownerId === u.id).map((p) => p.id));
      return delay(withTitles(db, db.inquiries.filter((i) => i.propertyId && mine.has(i.propertyId))));
    },
    async listInquiries() { const db = load(); requireAdmin(db); return delay(withTitles(db, db.inquiries)); },
    async setInquiryStatus(id, status) {
      const db = load(); const u = requireSeller(db);
      const q = db.inquiries.find((x) => x.id === id); if (!q) return;
      const owner = db.properties.find((p) => p.id === q.propertyId)?.ownerId;
      if (u.role !== "admin" && owner !== u.id) throw new Error("No tienes permiso para esta consulta.");
      q.status = status; save(db);
    },
    async deleteInquiry(id) { const db = load(); requireAdmin(db); db.inquiries = db.inquiries.filter((x) => x.id !== id); save(db); },

    async listUsers() {
      const db = load(); requireAdmin(db);
      return delay(db.users.map((u) => ({
        ...strip(u),
        favorites: db.favorites.filter((f) => f.userId === u.id).length,
        inquiries: db.inquiries.filter((i) => i.userId === u.id).length,
        properties: db.properties.filter((p) => p.ownerId === u.id).length,
      })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },
    async setUserRole(id, role) {
      const db = load(); const me = requireAdmin(db);
      if (id === me.id && role !== "admin") throw new Error("No puedes quitarte tu propio acceso de administrador.");
      const u = db.users.find((x) => x.id === id); if (!u) return;
      u.role = role;
      if (role === "seller" && !db.sellers.some((s) => s.id === u.id)) db.sellers.push(newSeller(u, u.fullName, db));
      save(db);
    },
  };
}
