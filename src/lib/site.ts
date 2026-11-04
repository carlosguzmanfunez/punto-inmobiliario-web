// Configuración general del sitio. Cambia aquí el número de WhatsApp y los datos de contacto.
export const site = {
  name: "Punto Inmobiliario Hn",
  // Dominio público (para links compartidos, mapa del sitio y vistas previas en WhatsApp).
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://puntoinmobiliariohn.com").replace(/\/$/, ""),
  shortName: "Punto Inmobiliario",
  tagline: "Tu punto de encuentro para comprar, alquilar y vender en Honduras",
  // Número en formato internacional sin "+" ni espacios.
  whatsapp: "50489092285",
  whatsappDisplay: "+504 8909-2285",
  email: "info@puntoinmobiliariohn.com",
  address: "Tegucigalpa, Honduras",
  hours: "Lunes a sábado, 8:00 a. m. a 6:00 p. m.",
  // Tipo de cambio de referencia (lempiras por dólar) para mostrar precios en las dos monedas.
  usdRate: 26.3,
};

export function whatsappLink(message = "Hola, me interesa una propiedad de Punto Inmobiliario Hn.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type NavItem = { label: string; href: string; children?: { label: string; href: string; description?: string }[] };

export const mainNav: NavItem[] = [
  {
    label: "Comprar",
    href: "/propiedades?operacion=venta",
    children: [
      { label: "Casas en venta", href: "/propiedades?operacion=venta&tipo=casa" },
      { label: "Apartamentos en venta", href: "/propiedades?operacion=venta&tipo=apartamento" },
      { label: "Terrenos y lotes", href: "/propiedades?operacion=venta&tipo=terreno" },
      { label: "Locales, oficinas y bodegas", href: "/propiedades?operacion=venta&tipo=local" },
      { label: "Frente al mar", href: "/propiedades?operacion=venta&am=Frente+al+mar" },
      { label: "Comparar propiedades", href: "/comparar", description: "Hasta 3 opciones lado a lado" },
    ],
  },
  {
    label: "Alquilar",
    href: "/propiedades?operacion=alquiler",
    children: [
      { label: "Casas en alquiler", href: "/propiedades?operacion=alquiler&tipo=casa" },
      { label: "Apartamentos en alquiler", href: "/propiedades?operacion=alquiler&tipo=apartamento" },
      { label: "Amueblados", href: "/propiedades?operacion=alquiler&am=Amueblado" },
      { label: "Locales comerciales", href: "/propiedades?operacion=alquiler&tipo=local" },
      { label: "Oficinas", href: "/propiedades?operacion=alquiler&tipo=oficina" },
      { label: "Bodegas", href: "/propiedades?operacion=alquiler&tipo=bodega" },
    ],
  },
  {
    label: "Proyectos",
    href: "/proyectos",
    children: [
      { label: "Constructoras y desarrolladores", href: "/proyectos", description: "Vitrinas con todos sus proyectos" },
      { label: "Tegucigalpa", href: "/propiedades?ciudad=Tegucigalpa&depto=Francisco+Moraz%C3%A1n" },
      { label: "San Pedro Sula", href: "/propiedades?ciudad=San+Pedro+Sula&depto=Cort%C3%A9s" },
      { label: "Roatán e Islas de la Bahía", href: "/propiedades?depto=Islas+de+la+Bah%C3%ADa" },
    ],
  },
  {
    label: "Vender",
    href: "/vender",
    children: [
      { label: "Publica tu propiedad", href: "/vender", description: "Link profesional para compartir con tus compradores" },
      { label: "Planes y precios", href: "/vender#planes" },
      { label: "Vitrina para desarrolladores", href: "/vender#vitrina", description: "Tu página con todos tus proyectos" },
      { label: "Servicios: fotos, dron y avalúos", href: "/servicios" },
      { label: "Crear cuenta de vendedor", href: "/ingresar?modo=registro&tipo=vendedor" },
    ],
  },
  {
    label: "Clientes en el extranjero",
    href: "/extranjero",
    children: [
      { label: "Compra desde Estados Unidos o España", href: "/extranjero", description: "Recorridos por videollamada y firma a distancia" },
      { label: "Remesas e inversión", href: "/extranjero#inversion" },
      { label: "Guía para comprar desde afuera", href: "/guias/comprar-casa-en-honduras-desde-el-extranjero" },
      { label: "Preguntas frecuentes", href: "/extranjero#preguntas" },
    ],
  },
  {
    label: "Financiamiento",
    href: "/financiamiento",
    children: [
      { label: "Calculadora de cuota", href: "/financiamiento#calculadora" },
      { label: "Préstamos bancarios", href: "/financiamiento#bancos" },
      { label: "Requisitos", href: "/financiamiento#requisitos" },
      { label: "¿Cuánto necesito de prima?", href: "/guias/cuanto-necesito-para-la-prima" },
    ],
  },
  {
    label: "Quiénes somos",
    href: "/quienes-somos",
    children: [
      { label: "Nuestra empresa", href: "/quienes-somos" },
      { label: "Servicios", href: "/servicios" },
      { label: "Guías y consejos", href: "/guias" },
    ],
  },
  { label: "Contacto", href: "/contacto" },
];

// Planes que se cobran a los vendedores. Los precios se cambian aquí.
export type PlanKind = "publicacion" | "destacada" | "vitrina";

export type Plan = { kind: PlanKind; name: string; price: number; days: number; summary: string; perks: string[] };

export const plans: Record<PlanKind, Plan> = {
  publicacion: {
    kind: "publicacion", name: "Publicación profesional", price: 590, days: 30,
    summary: "Una propiedad visible en Punto Inmobiliario con su propio link profesional.",
    perks: ["Página propia con galería, mapa de características y precio", "Link para enviar por WhatsApp a tus compradores", "Consultas directas a tu WhatsApp y a tu panel", "Estadísticas de visitas"],
  },
  destacada: {
    kind: "destacada", name: "Publicación destacada", price: 990, days: 30,
    summary: "Todo lo de la publicación profesional, en la portada y primero en las búsquedas.",
    perks: ["Todo lo de la publicación profesional", "Aparece en la portada del sitio", "Primeros lugares en el listado", "Etiqueta “Destacada”"],
  },
  vitrina: {
    kind: "vitrina", name: "Vitrina del vendedor", price: 2490, days: 30,
    summary: "Tu propia página dentro de Punto Inmobiliario con todos tus proyectos ordenados.",
    perks: ["Página con tu logo, descripción y contacto", "Todas tus propiedades y desarrollos en un solo link", "Ideal para constructoras y desarrolladores", "Se combina con tus publicaciones activas"],
  },
};

export function formatLempiras(n: number) {
  return `L ${new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(n)}`;
}

// Link de WhatsApp a cualquier número (deja solo los dígitos).
export function whatsappTo(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Valores iniciales de los ajustes (el administrador los cambia en /admin?tab=ajustes).
export const defaultSettings = {
  usdRate: site.usdRate,
  prices: { publicacion: plans.publicacion.price, destacada: plans.destacada.price, vitrina: plans.vitrina.price } as Record<PlanKind, number>,
  bankInfo: "",
};

// Planes con los precios vigentes de los ajustes.
export function plansWith(prices: Partial<Record<PlanKind, number>> | undefined): Record<PlanKind, Plan> {
  const out = { ...plans };
  for (const k of Object.keys(out) as PlanKind[]) if (prices?.[k] && prices[k]! > 0) out[k] = { ...out[k], price: prices[k]! };
  return out;
}
