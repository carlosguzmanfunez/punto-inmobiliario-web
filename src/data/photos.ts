// Fotos de ejemplo (Unsplash, licencia libre) para mostrar el sitio mientras llegan las fotos reales.
// Cada foto tiene una ilustración local de respaldo: si la foto no carga (sin internet, vista previa
// aislada o link caído), el sitio muestra la ilustración en su lugar. Ver ImageFallback.tsx.
const fallbacks = new Map<string, string>();

function ph(id: string, fallback: string, w = 1200) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
  fallbacks.set(url, fallback);
  return url;
}

export const photos = {
  // Casas
  casaModernaPiscina: ph("1600596542815-ffad4c1539a9", "/img/casa-2.svg"),
  casaModerna: ph("1600585154340-be6161a56a0c", "/img/casa-2.svg"),
  casaBlanca: ph("1512917774080-9991f1c4c750", "/img/casa-4.svg"),
  casaJardin: ph("1564013799919-ab600027ffc6", "/img/casa-1.svg"),
  casaFamiliar: ph("1568605114967-8130f3a36994", "/img/casa-3.svg"),
  casaClasica: ph("1570129477492-45c003edd2be", "/img/casa-5.svg"),
  casaContemporanea: ph("1580587771525-78b9dba3b914", "/img/casa-2.svg"),
  villa: ph("1613490493576-7fde63acd811", "/img/casa-4.svg"),
  villaPiscina: ph("1613977257363-707ba9348227", "/img/playa-1.svg"),
  casaCampo: ph("1449844908441-8829872d2607", "/img/casa-campo-1.svg"),
  casaResidencial: ph("1523217582562-09d0def993a6", "/img/casa-3.svg"),
  // Interiores
  sala: ph("1502672260266-1c1ef2d93688", "/img/apto-1.svg"),
  salaLuminosa: ph("1522708323590-d24dbb6b0267", "/img/apto-1.svg"),
  aptoInterior: ph("1560448204-e02f11c3d0e2", "/img/apto-2.svg"),
  estudio: ph("1493809842364-78817add7ffb", "/img/apto-1.svg"),
  salaModerna: ph("1600607687939-ce8a6c25118c", "/img/casa-1.svg"),
  cocina: ph("1600566753190-17f0baa2a6c3", "/img/casa-5.svg"),
  salaComedor: ph("1600210492486-724fe5c67fb0", "/img/casa-3.svg"),
  cocinaAbierta: ph("1484154218962-a197022b5858", "/img/apto-2.svg"),
  dormitorio: ph("1505691938895-1758d7feb511", "/img/apto-1.svg"),
  // Edificios y comercio
  torre: ph("1545324418-cc1a3fa10c00", "/img/apto-2.svg"),
  edificios: ph("1460317442991-0ec209397118", "/img/apto-2.svg"),
  oficina: ph("1497366216548-37526070297c", "/img/oficina-1.svg"),
  oficinaAbierta: ph("1497366811353-6870744d04b2", "/img/oficina-1.svg"),
  bodega: ph("1586528116311-ad8dd3c8310d", "/img/bodega-1.svg"),
  local: ph("1441986300917-64674bd600d8", "/img/local-1.svg"),
  restaurante: ph("1555396273-367ea4eb4db5", "/img/local-1.svg"),
  // Terrenos y paisajes
  terreno: ph("1500382017468-9049fed747ef", "/img/terreno-1.svg"),
  bosque: ph("1441974231531-c6227db76b6e", "/img/casa-campo-1.svg"),
  montanas: ph("1506905925346-21bda4d32df4", "/img/terreno-1.svg"),
  playa: ph("1507525428034-b723cf961d3e", "/img/playa-1.svg"),
  resortPlaya: ph("1520250497591-112f2f40a3f4", "/img/playa-1.svg"),
  ciudad: ph("1477959858617-67f85cf4f1df", "/img/apto-2.svg"),
  ciudadNoche: ph("1519501025264-65ba15a82390", "/img/apto-2.svg"),
  valle: ph("1501785888041-af3ef285b470", "/img/casa-campo-1.svg"),
  hero: ph("1600596542815-ffad4c1539a9", "/img/hero.svg", 2000),
};

// Ilustración que corresponde a una foto de ejemplo, o una genérica si no la conocemos.
export function fallbackFor(src: string): string | null {
  if (!/^https?:/.test(src)) return null;
  return fallbacks.get(src) ?? "/img/casa-1.svg";
}
