import { photos } from "./photos";
// Geografía de Honduras usada en buscadores y filtros: los 18 departamentos y las
// ciudades donde más se mueve el mercado inmobiliario.
export const departments = [
  "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso", "Francisco Morazán",
  "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz", "Lempira", "Ocotepeque", "Olancho",
  "Santa Bárbara", "Valle", "Yoro",
] as const;

export const citiesByDepartment: Record<string, string[]> = {
  "Francisco Morazán": ["Tegucigalpa", "Comayagüela", "Valle de Ángeles", "Santa Lucía", "Tatumbla", "Ojojona", "Zambrano", "El Zamorano"],
  "Cortés": ["San Pedro Sula", "Choloma", "Villanueva", "La Lima", "Puerto Cortés", "Omoa"],
  "Atlántida": ["La Ceiba", "Tela"],
  "Islas de la Bahía": ["Roatán", "Utila", "Guanaja"],
  "Comayagua": ["Comayagua", "Siguatepeque"],
  "Choluteca": ["Choluteca"],
  "El Paraíso": ["Danlí", "Yuscarán"],
  "Copán": ["Santa Rosa de Copán", "Copán Ruinas"],
  "Olancho": ["Juticalpa", "Catacamas"],
  "Yoro": ["El Progreso", "Yoro"],
  "Lempira": ["Gracias"],
  "Colón": ["Trujillo", "Tocoa"],
  "Valle": ["Amapala", "Nacaome"],
  "Santa Bárbara": ["Santa Bárbara"],
  "Intibucá": ["La Esperanza"],
  "La Paz": ["La Paz", "Marcala"],
  "Ocotepeque": ["Ocotepeque"],
  "Gracias a Dios": ["Puerto Lempira"],
};

export const allCities = Object.values(citiesByDepartment).flat();

export function departmentOf(city: string): string {
  for (const [d, list] of Object.entries(citiesByDepartment)) if (list.includes(city)) return d;
  return "";
}

// Colonias y zonas conocidas para sugerir en el buscador.
export const popularZones = [
  "Lomas del Guijarro", "Colonia Palmira", "Los Próceres", "Colonia Kennedy", "Altos de Miramontes", "Boulevard Morazán",
  "Jardines del Valle", "Colonia Trejo", "Barrio Los Andes", "Zona Viva", "Colonia Alameda", "Río de Piedras",
  "West Bay", "West End", "Colonia El Toronjal",
];

// Ciudades destacadas en la portada, con una imagen de referencia.
export const featuredCities = [
  { name: "Tegucigalpa", department: "Francisco Morazán", image: photos.ciudad },
  { name: "San Pedro Sula", department: "Cortés", image: photos.ciudadNoche },
  { name: "Roatán", department: "Islas de la Bahía", image: photos.playa },
  { name: "La Ceiba", department: "Atlántida", image: photos.resortPlaya },
  { name: "Comayagua", department: "Comayagua", image: photos.casaClasica },
  { name: "Valle de Ángeles", department: "Francisco Morazán", image: photos.valle },
];
