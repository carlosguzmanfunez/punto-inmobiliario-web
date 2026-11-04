// Tipos de propiedad y datos de ejemplo. Las propiedades reales se administran desde /admin.
export type Operation = "venta" | "alquiler";
export type PropertyType = "casa" | "apartamento" | "terreno" | "local";

export type Property = {
  id: string;
  slug: string;
  title: string;
  operation: Operation;
  type: PropertyType;
  price: number;
  currency: "USD" | "HNL";
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  lotM2?: number;
  parking: number;
  images: string[];
  features: string[];
  description: string;
  isNew?: boolean;
  featured?: boolean;
  published?: boolean;
  views?: number;
  createdAt?: string;
  // Publicaciones de vendedores (las de Punto Inmobiliario no tienen dueño).
  ownerId?: string | null;
  status?: ListingStatus;
  paidUntil?: string | null;
};

// borrador: el vendedor la está preparando · pendiente: espera pago y revisión ·
// publicada: visible hasta paidUntil · pausada: el vendedor la ocultó · rechazada: no aprobada.
export type ListingStatus = "borrador" | "pendiente" | "publicada" | "pausada" | "rechazada";

export const listingStatusLabel: Record<ListingStatus, string> = {
  borrador: "Borrador", pendiente: "Pendiente de pago", publicada: "Publicada", pausada: "Pausada", rechazada: "Rechazada",
};

// Una propiedad se ve en el sitio si está publicada y, si es de un vendedor, su plan sigue vigente.
export function isLive(p: Property, now = Date.now()) {
  if (p.published === false) return false;
  if (!p.ownerId) return true;
  return !!p.paidUntil && new Date(p.paidUntil).getTime() >= now;
}

// Propiedades iniciales: se usan en el modo demo y como carga inicial de la base de datos.
const seed: Omit<Property, "id">[] = [
  {
    slug: "casa-lomas-del-guijarro",
    title: "Casa moderna con jardín en Lomas del Guijarro",
    operation: "venta", type: "casa", price: 285000, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Lomas del Guijarro",
    bedrooms: 4, bathrooms: 3.5, areaM2: 320, lotM2: 450, parking: 2,
    images: ["/img/casa-2.svg", "/img/casa-4.svg", "/img/casa-1.svg"],
    features: ["Jardín", "Seguridad 24/7", "Cuarto de servicio", "Cisterna", "Vista a la ciudad"],
    description: "Casa de dos niveles con amplios ventanales, cocina abierta y jardín privado en una de las zonas más seguras de la capital.",
    featured: true, isNew: true,
  },
  {
    slug: "apartamento-colonia-palmira",
    title: "Apartamento amueblado en Colonia Palmira",
    operation: "alquiler", type: "apartamento", price: 1100, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Colonia Palmira",
    bedrooms: 2, bathrooms: 2, areaM2: 110, parking: 1,
    images: ["/img/apto-1.svg", "/img/apto-2.svg"],
    features: ["Amueblado", "Gimnasio", "Piscina", "Planta eléctrica", "Cerca de embajadas"],
    description: "Apartamento listo para vivir, ideal para ejecutivos, a pasos de restaurantes y embajadas.",
    featured: true,
  },
  {
    slug: "casa-residencial-jardines-del-valle",
    title: "Casa familiar en Jardines del Valle",
    operation: "venta", type: "casa", price: 4650000, currency: "HNL",
    city: "San Pedro Sula", neighborhood: "Jardines del Valle",
    bedrooms: 3, bathrooms: 2.5, areaM2: 210, lotM2: 280, parking: 2,
    images: ["/img/casa-3.svg", "/img/casa-5.svg"],
    features: ["Residencial cerrado", "Área social", "Patio", "Calentador de agua"],
    description: "Casa en residencial con acceso controlado, cerca de colegios y centros comerciales del sector norte.",
    featured: true,
  },
  {
    slug: "terreno-carretera-santa-lucia",
    title: "Terreno con vista al bosque, salida a Santa Lucía",
    operation: "venta", type: "terreno", price: 95000, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Carretera a Santa Lucía",
    bedrooms: 0, bathrooms: 0, areaM2: 0, lotM2: 2800, parking: 0,
    images: ["/img/terreno-1.svg"],
    features: ["Agua potable", "Energía eléctrica", "Escritura pública", "Clima fresco"],
    description: "Terreno plano ideal para casa de campo o proyecto residencial pequeño, a 20 minutos de la capital.",
    isNew: true,
  },
  {
    slug: "apartamento-torre-sps",
    title: "Apartamento en torre con amenidades, Zona Viva",
    operation: "venta", type: "apartamento", price: 168000, currency: "USD",
    city: "San Pedro Sula", neighborhood: "Barrio Los Andes",
    bedrooms: 2, bathrooms: 2, areaM2: 125, parking: 2,
    images: ["/img/apto-2.svg", "/img/apto-1.svg"],
    features: ["Piscina", "Terraza social", "Seguridad 24/7", "Ascensor"],
    description: "Apartamento en piso alto con vista al Merendón, excelente para vivir o como inversión en renta.",
    featured: true,
  },
  {
    slug: "casa-playa-roatan",
    title: "Casa frente al mar en West Bay, Roatán",
    operation: "venta", type: "casa", price: 520000, currency: "USD",
    city: "Roatán", neighborhood: "West Bay",
    bedrooms: 3, bathrooms: 3, areaM2: 240, lotM2: 600, parking: 2,
    images: ["/img/playa-1.svg", "/img/casa-4.svg"],
    features: ["Frente al mar", "Muelle", "Ideal para renta vacacional", "Terraza"],
    description: "Propiedad con acceso directo a la playa, perfecta para hondureños en el extranjero que buscan inversión.",
    featured: true, isNew: true,
  },
  {
    slug: "local-comercial-boulevard-morazan",
    title: "Local comercial sobre Boulevard Morazán",
    operation: "alquiler", type: "local", price: 38000, currency: "HNL",
    city: "Tegucigalpa", neighborhood: "Boulevard Morazán",
    bedrooms: 0, bathrooms: 1, areaM2: 90, parking: 3,
    images: ["/img/casa-2.svg"],
    features: ["Alto tráfico", "Vitrina", "Parqueo para clientes"],
    description: "Local en primer nivel con excelente visibilidad, ideal para cafetería, clínica u oficina.",
  },
  {
    slug: "casa-colonia-trejo",
    title: "Casa remodelada en Colonia Trejo",
    operation: "alquiler", type: "casa", price: 32000, currency: "HNL",
    city: "San Pedro Sula", neighborhood: "Colonia Trejo",
    bedrooms: 3, bathrooms: 2, areaM2: 180, lotM2: 220, parking: 2,
    images: ["/img/casa-1.svg", "/img/casa-5.svg"],
    features: ["Remodelada", "Patio", "Cerca de hospitales", "Seguridad"],
    description: "Casa amplia y fresca, recién remodelada, en zona céntrica y segura.",
  },
];

export const properties: Property[] = seed.map((p, i) => ({
  ...p, id: p.slug, published: true, views: [184, 132, 97, 61, 75, 210, 28, 44][i] ?? 0,
  createdAt: new Date(Date.UTC(2026, 9, 1 + i * 3)).toISOString(),
}));

export const cities = ["Tegucigalpa", "San Pedro Sula", "Roatán", "La Ceiba"] as const;

export function formatPrice(p: Pick<Property, "price" | "currency" | "operation">) {
  const n = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(p.price);
  const amount = p.currency === "USD" ? `US$${n}` : `L ${n}`;
  return p.operation === "alquiler" ? `${amount} /mes` : amount;
}

export const typeLabel: Record<PropertyType, string> = {
  casa: "Casa", apartamento: "Apartamento", terreno: "Terreno", local: "Local comercial",
};

export const operationLabel: Record<Operation, string> = { venta: "En venta", alquiler: "En alquiler" };

export function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
