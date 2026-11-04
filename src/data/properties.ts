import { photos } from "./photos";
// Tipos de propiedad y datos de ejemplo. Las propiedades reales se administran desde /admin.
export type Operation = "venta" | "alquiler";
export type PropertyType = "casa" | "apartamento" | "terreno" | "local" | "oficina" | "bodega";

export type Property = {
  id: string;
  slug: string;
  title: string;
  operation: Operation;
  type: PropertyType;
  price: number;
  currency: "USD" | "HNL";
  city: string;
  // Departamento. Si falta se deduce de la ciudad (ver departmentOf).
  department?: string;
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
    images: [photos.casaContemporanea, photos.salaModerna, photos.cocina, photos.dormitorio],
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
    images: [photos.salaLuminosa, photos.aptoInterior, photos.dormitorio],
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
    images: [photos.casaFamiliar, photos.salaComedor, photos.cocinaAbierta],
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
    images: [photos.bosque, photos.montanas],
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
    images: [photos.torre, photos.sala, photos.cocinaAbierta],
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
    images: [photos.villaPiscina, photos.playa, photos.salaLuminosa],
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
    images: [photos.local, photos.restaurante],
    features: ["Alto tráfico", "Vitrina", "Parqueo para clientes"],
    description: "Local en primer nivel con excelente visibilidad, ideal para cafetería, clínica u oficina.",
  },
  {
    slug: "casa-colonia-trejo",
    title: "Casa remodelada en Colonia Trejo",
    operation: "alquiler", type: "casa", price: 32000, currency: "HNL",
    city: "San Pedro Sula", neighborhood: "Colonia Trejo",
    bedrooms: 3, bathrooms: 2, areaM2: 180, lotM2: 220, parking: 2,
    images: [photos.casaJardin, photos.salaModerna, photos.dormitorio],
    features: ["Remodelada", "Patio", "Cerca de hospitales", "Seguridad"],
    description: "Casa amplia y fresca, recién remodelada, en zona céntrica y segura.",
  },
  {
    slug: "apartamento-amueblado-los-proceres",
    title: "Apartamento amueblado de una habitación en Los Próceres",
    operation: "alquiler", type: "apartamento", price: 750, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Los Próceres",
    bedrooms: 1, bathrooms: 1, areaM2: 62, parking: 1,
    images: [photos.estudio, photos.aptoInterior, photos.dormitorio],
    features: ["Amueblado", "Seguridad 24/7", "Planta eléctrica", "Ascensor", "Aire acondicionado"],
    description: "Ideal para profesionales o estudiantes de posgrado. A pocos minutos de centros comerciales, bancos y restaurantes. Incluye agua y mantenimiento.",
    isNew: true,
  },
  {
    slug: "oficina-corporativa-lomas-del-mayab",
    title: "Oficina corporativa con vista panorámica en Lomas del Mayab",
    operation: "alquiler", type: "oficina", price: 1800, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Lomas del Mayab",
    bedrooms: 0, bathrooms: 2, areaM2: 140, parking: 4,
    images: [photos.oficina, photos.oficinaAbierta],
    features: ["Vista panorámica", "Planta eléctrica", "Ascensor", "Aire acondicionado", "Parqueo de visitas", "Seguridad 24/7"],
    description: "Oficina en torre corporativa con recepción compartida, sala de reuniones y planta eléctrica al 100 %. Lista para instalarse.",
    featured: true,
  },
  {
    slug: "bodega-industrial-choloma",
    title: "Bodega industrial sobre carretera a Puerto Cortés",
    operation: "alquiler", type: "bodega", price: 85000, currency: "HNL",
    city: "Choloma", neighborhood: "Carretera a Puerto Cortés",
    bedrooms: 0, bathrooms: 2, areaM2: 850, lotM2: 1400, parking: 6,
    images: [photos.bodega],
    features: ["Acceso a carretera", "Andén de carga", "Seguridad 24/7", "Energía trifásica"],
    description: "Bodega con altura de 9 metros, andén para dos contenedores y oficina administrativa. A 25 minutos del puerto.",
  },
  {
    slug: "casa-de-campo-valle-de-angeles",
    title: "Casa de campo con bosque de pinos en Valle de Ángeles",
    operation: "venta", type: "casa", price: 185000, currency: "USD",
    city: "Valle de Ángeles", neighborhood: "Aldea San Francisco",
    bedrooms: 3, bathrooms: 2, areaM2: 190, lotM2: 1500, parking: 3,
    images: [photos.casaCampo, photos.bosque, photos.salaComedor],
    features: ["Jardín", "Chimenea", "Vista panorámica", "Cisterna", "Escritura pública"],
    description: "Casa de madera y piedra rodeada de pinos, a 30 minutos de Tegucigalpa. Perfecta para fines de semana o para vivir con clima fresco todo el año.",
    featured: true,
  },
  {
    slug: "casa-colonia-el-toronjal-la-ceiba",
    title: "Casa de una planta en Colonia El Toronjal",
    operation: "venta", type: "casa", price: 3950000, currency: "HNL",
    city: "La Ceiba", neighborhood: "Colonia El Toronjal",
    bedrooms: 3, bathrooms: 2, areaM2: 165, lotM2: 300, parking: 2,
    images: [photos.casaBlanca, photos.cocina, photos.dormitorio],
    features: ["Patio", "Aire acondicionado", "Calentador de agua", "Residencial cerrado"],
    description: "Casa fresca y bien iluminada, a cinco minutos de la playa y del centro de La Ceiba. Acepta financiamiento bancario.",
  },
  {
    slug: "apartamento-frente-al-mar-west-end",
    title: "Apartamento frente al mar en West End",
    operation: "alquiler", type: "apartamento", price: 1600, currency: "USD",
    city: "Roatán", neighborhood: "West End",
    bedrooms: 2, bathrooms: 2, areaM2: 95, parking: 1,
    images: [photos.resortPlaya, photos.salaLuminosa, photos.playa],
    features: ["Frente al mar", "Amueblado", "Piscina", "Aire acondicionado", "Terraza"],
    description: "Alquiler por meses en edificio con piscina y salida directa a la playa. Ideal para trabajo remoto o temporada larga en la isla.",
    isNew: true,
  },
  {
    slug: "terreno-salida-a-tegucigalpa-comayagua",
    title: "Terreno plano sobre la salida a Tegucigalpa",
    operation: "venta", type: "terreno", price: 1250000, currency: "HNL",
    city: "Comayagua", neighborhood: "Salida a Tegucigalpa",
    bedrooms: 0, bathrooms: 0, areaM2: 0, lotM2: 1200, parking: 0,
    images: [photos.terreno, photos.valle],
    features: ["Agua potable", "Energía eléctrica", "Escritura pública", "Acceso a carretera"],
    description: "Terreno de 1,200 m² con frente a calle pavimentada, ideal para vivienda, bodega o pequeño comercio. Cerca del aeropuerto Palmerola.",
  },
  {
    slug: "casa-familiar-siguatepeque",
    title: "Casa familiar con jardín en Siguatepeque",
    operation: "venta", type: "casa", price: 2800000, currency: "HNL",
    city: "Siguatepeque", neighborhood: "Barrio San Antonio",
    bedrooms: 4, bathrooms: 3, areaM2: 230, lotM2: 420, parking: 2,
    images: [photos.casaClasica, photos.salaComedor, photos.cocinaAbierta],
    features: ["Jardín", "Cisterna", "Cuarto de servicio", "Patio"],
    description: "Amplia casa en el centro del país con clima agradable, a pasos de escuelas y del parque central.",
  },
  {
    slug: "local-bulevar-del-norte-sps",
    title: "Local en plaza comercial sobre Bulevar del Norte",
    operation: "alquiler", type: "local", price: 45000, currency: "HNL",
    city: "San Pedro Sula", neighborhood: "Bulevar del Norte",
    bedrooms: 0, bathrooms: 1, areaM2: 120, parking: 8,
    images: [photos.restaurante, photos.local],
    features: ["Alto tráfico", "Vitrina", "Parqueo de visitas", "Aire acondicionado"],
    description: "Local esquinero en plaza con supermercado ancla. Excelente para farmacia, restaurante o banco.",
  },
  {
    slug: "apartamento-altos-de-miramontes",
    title: "Apartamento con terraza en Altos de Miramontes",
    operation: "venta", type: "apartamento", price: 128000, currency: "USD",
    city: "Tegucigalpa", neighborhood: "Altos de Miramontes",
    bedrooms: 3, bathrooms: 2, areaM2: 118, parking: 2,
    images: [photos.edificios, photos.salaModerna, photos.estudio],
    features: ["Terraza", "Gimnasio", "Área social", "Seguridad 24/7", "Mascotas permitidas"],
    description: "Apartamento esquinero con terraza privada, en edificio con gimnasio y área social. Cerca de colegios bilingües.",
  },
  {
    slug: "casa-colonia-las-colinas-choluteca",
    title: "Casa con piscina en Choluteca",
    operation: "venta", type: "casa", price: 2350000, currency: "HNL",
    city: "Choluteca", neighborhood: "Colonia Las Colinas",
    bedrooms: 3, bathrooms: 2, areaM2: 175, lotM2: 350, parking: 2,
    images: [photos.casaModernaPiscina, photos.sala, photos.dormitorio],
    features: ["Piscina", "Aire acondicionado", "Patio", "Cisterna"],
    description: "Casa fresca con piscina para el calor del sur, en colonia tranquila cerca del centro de Choluteca.",
  },
  {
    slug: "oficina-en-venta-colonia-trejo",
    title: "Oficina en edificio médico y corporativo, Colonia Trejo",
    operation: "venta", type: "oficina", price: 95000, currency: "USD",
    city: "San Pedro Sula", neighborhood: "Colonia Trejo",
    bedrooms: 0, bathrooms: 1, areaM2: 65, parking: 2,
    images: [photos.oficinaAbierta, photos.oficina],
    features: ["Ascensor", "Planta eléctrica", "Aire acondicionado", "Parqueo de visitas"],
    description: "Oficina lista para consultorio o despacho profesional, en edificio con recepción y seguridad.",
  },
];

export const properties: Property[] = seed.map((p, i) => ({
  ...p, id: p.slug, published: true, views: [184, 132, 97, 61, 75, 210, 28, 44, 58, 91, 33, 120, 47, 88, 22, 31, 40, 66, 29, 25][i] ?? 0,
  createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
}));

export const cities = ["Tegucigalpa", "San Pedro Sula", "Roatán", "La Ceiba", "Comayagua", "Valle de Ángeles", "Choloma", "Siguatepeque", "Choluteca"] as const;

// Amenidades que se pueden filtrar en el buscador y marcar en el editor.
export const amenities = [
  "Amueblado", "Piscina", "Gimnasio", "Seguridad 24/7", "Planta eléctrica", "Cisterna", "Jardín", "Terraza", "Balcón",
  "Ascensor", "Área social", "Aire acondicionado", "Mascotas permitidas", "Residencial cerrado", "Vista panorámica",
  "Frente al mar", "Parqueo de visitas", "Cuarto de servicio", "Patio", "Calentador de agua", "Escritura pública",
  "Agua potable", "Energía eléctrica", "Acceso a carretera",
];

// Código corto y estable para citar una propiedad por teléfono o WhatsApp (ej. PI-4K7Q2).
export function propertyCode(p: Pick<Property, "id">) {
  let h = 2166136261;
  for (const c of p.id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return "PI-" + (h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-5);
}

export function formatPrice(p: Pick<Property, "price" | "currency" | "operation">) {
  const n = new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(p.price);
  const amount = p.currency === "USD" ? `US$${n}` : `L ${n}`;
  return p.operation === "alquiler" ? `${amount} /mes` : amount;
}

export const typeLabel: Record<PropertyType, string> = {
  casa: "Casa", apartamento: "Apartamento", terreno: "Terreno", local: "Local comercial", oficina: "Oficina", bodega: "Bodega",
};

export const typePlural: Record<PropertyType, string> = {
  casa: "Casas", apartamento: "Apartamentos", terreno: "Terrenos", local: "Locales", oficina: "Oficinas", bodega: "Bodegas",
};

export const operationLabel: Record<Operation, string> = { venta: "En venta", alquiler: "En alquiler" };

export function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
