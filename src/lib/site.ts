// Configuración general del sitio. Cambia aquí el número de WhatsApp y los datos de contacto.
export const site = {
  name: "Punto Inmobiliario Hn",
  shortName: "Punto Inmobiliario",
  tagline: "Tu punto de encuentro para comprar, alquilar y vender en Honduras",
  // Número en formato internacional sin "+" ni espacios.
  whatsapp: "5048909222285",
  whatsappDisplay: "+504 890922-2285",
  email: "info@puntoinmobiliariohn.com",
  address: "Tegucigalpa, Honduras",
  hours: "Lunes a sábado, 8:00 a. m. a 6:00 p. m.",
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
      { label: "Tegucigalpa", href: "/propiedades?ciudad=Tegucigalpa" },
      { label: "San Pedro Sula", href: "/propiedades?ciudad=San+Pedro+Sula" },
    ],
  },
  {
    label: "Alquilar",
    href: "/propiedades?operacion=alquiler",
    children: [
      { label: "Casas en alquiler", href: "/propiedades?operacion=alquiler&tipo=casa" },
      { label: "Apartamentos en alquiler", href: "/propiedades?operacion=alquiler&tipo=apartamento" },
      { label: "Locales y oficinas", href: "/propiedades?operacion=alquiler&tipo=local" },
    ],
  },
  { label: "Vender", href: "/vender" },
  {
    label: "Clientes en el extranjero",
    href: "/extranjero",
    children: [
      { label: "Compra desde Estados Unidos o España", href: "/extranjero", description: "Recorridos por videollamada y firma a distancia" },
      { label: "Remesas e inversión", href: "/extranjero#inversion" },
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
    ],
  },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Contacto", href: "/contacto" },
];
