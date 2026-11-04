import { photos } from "./photos";
// Guías y consejos (blog). Contenido general de orientación; no sustituye asesoría legal.
export type Guide = { slug: string; title: string; summary: string; category: string; minutes: number; image: string; body: { h?: string; p?: string; list?: string[] }[] };

export const guides: Guide[] = [
  {
    slug: "comprar-casa-en-honduras-desde-el-extranjero",
    title: "Cómo comprar casa en Honduras si vives en el extranjero",
    summary: "Los pasos para comprar con seguridad desde Estados Unidos, España o cualquier país, sin tener que viajar varias veces.",
    category: "Extranjero", minutes: 6, image: photos.salaLuminosa,
    body: [
      { p: "Cada año miles de hondureños que viven fuera compran su casa o terreno en Honduras. Se puede hacer de forma segura si sigues un orden y trabajas con personas que verifiquen todo por ti." },
      { h: "1. Define presupuesto y forma de pago", p: "Decide si pagarás de contado, con un préstamo de un banco hondureño o con un plan directo del desarrollador. Muchos bancos atienden a hondureños en el exterior con constancia de ingresos del país donde viven." },
      { h: "2. Recorre la propiedad por videollamada", p: "Pide un recorrido en vivo, no solo fotos. Revisa acabados, presión de agua, vecindario y acceso. En Punto Inmobiliario lo hacemos por WhatsApp a la hora que te convenga." },
      { h: "3. Verifica los documentos", list: ["Escritura pública inscrita en el Instituto de la Propiedad (IP)", "Solvencia municipal y de bienes inmuebles", "Que el vendedor sea el dueño registrado o tenga poder vigente", "Planos y permisos de construcción, si aplica"] },
      { h: "4. Firma a distancia con poder especial", p: "Puedes otorgar un poder especial en el consulado de Honduras más cercano para que un familiar o tu abogado firme por ti. El notario autoriza la compraventa y luego se inscribe en el IP." },
      { h: "5. Recibe y administra", p: "Si la compras para alquilar, define quién la administrará. Podemos ayudarte a encontrar inquilinos y cobrar la renta." },
    ],
  },
  {
    slug: "documentos-para-vender-una-propiedad",
    title: "Documentos que necesitas para vender tu propiedad",
    summary: "Tener todo en orden acelera la venta y genera confianza en el comprador. Esta es la lista básica.",
    category: "Vender", minutes: 4, image: photos.casaFamiliar,
    body: [
      { p: "Antes de publicar, reúne los documentos. Un comprador serio y su banco los van a pedir, y tenerlos listos evita que la venta se caiga." },
      { h: "Lista básica", list: ["Escritura pública o título de propiedad", "Constancia de inscripción en el Instituto de la Propiedad", "Solvencia de bienes inmuebles de la municipalidad", "Tarjeta de identidad del propietario (o de todos, si son varios)", "Plano o croquis con medidas del terreno", "Recibos recientes de agua y energía"] },
      { h: "Si la propiedad tiene hipoteca", p: "Solicita al banco una constancia del saldo. La deuda se puede cancelar con el mismo pago del comprador el día de la firma." },
      { h: "Consejo", p: "Las publicaciones con buenas fotos, precio claro y documentos al día se venden más rápido. Con un plan destacado tu propiedad aparece en la portada y primero en las búsquedas." },
    ],
  },
  {
    slug: "cuanto-necesito-para-la-prima",
    title: "¿Cuánto necesito para la prima de una casa?",
    summary: "Qué porcentaje piden los bancos, qué gastos adicionales debes considerar y cómo calcular tu cuota.",
    category: "Financiamiento", minutes: 5, image: photos.casaJardin,
    body: [
      { p: "La prima es el pago inicial que haces con tu dinero. El resto lo financia el banco o la cooperativa." },
      { h: "Porcentajes comunes", list: ["Vivienda nueva en proyecto: desde 5 % a 10 %", "Vivienda usada: normalmente 10 % a 20 %", "Terrenos y locales: suele pedirse 20 % a 30 %"] },
      { h: "Gastos de cierre", p: "Además de la prima, aparta entre 3 % y 5 % del precio para gastos de escrituración, avalúo, seguros e impuestos de traspaso." },
      { h: "Calcula tu cuota", p: "Usa nuestra calculadora para probar distintos plazos y tasas. Como regla general, la cuota no debería pasar del 35 % del ingreso familiar." },
    ],
  },
  {
    slug: "zonas-para-vivir-en-tegucigalpa",
    title: "Zonas para vivir en Tegucigalpa: guía rápida",
    summary: "Un recorrido por las colonias más buscadas de la capital según presupuesto, seguridad y estilo de vida.",
    category: "Zonas", minutes: 5, image: photos.ciudad,
    body: [
      { p: "Tegucigalpa tiene opciones para cada etapa de la vida. Estas son algunas de las zonas que más buscan nuestros clientes." },
      { h: "Lomas del Guijarro y Lomas del Mayab", p: "Residencial de alto nivel, cerca de embajadas y restaurantes. Casas amplias y torres modernas." },
      { h: "Colonia Palmira y Boulevard Morazán", p: "Céntricas y caminables, ideales para ejecutivos. Mucha oferta de apartamentos amueblados en alquiler." },
      { h: "Los Próceres y Altos de Miramontes", p: "Buena relación precio y ubicación, con apartamentos en torre y fácil acceso a centros comerciales." },
      { h: "Valle de Ángeles y Santa Lucía", p: "Clima fresco y bosque de pinos a menos de 40 minutos. Muy buscadas para casas de campo." },
    ],
  },
  {
    slug: "invertir-en-roatan",
    title: "Invertir en Roatán: lo que debes saber",
    summary: "Renta vacacional, compra frente al mar y cómo funciona la propiedad en las Islas de la Bahía.",
    category: "Inversión", minutes: 4, image: photos.playa,
    body: [
      { p: "Roatán es uno de los destinos de buceo más visitados del Caribe y muchas familias compran para rentar por temporadas." },
      { h: "Zonas más buscadas", list: ["West Bay: playa de arena blanca y resorts", "West End: ambiente relajado, restaurantes y vida nocturna", "French Harbour y Sandy Bay: más residencial y tranquilo"] },
      { h: "Renta vacacional", p: "Una propiedad bien ubicada y amueblada puede generar ingresos por noche en temporada alta. Considera los gastos de administración, limpieza y mantenimiento." },
      { h: "Revisa la zona costera", p: "En propiedades frente al mar confirma la situación legal de la franja costera y los permisos ambientales." },
    ],
  },
];
