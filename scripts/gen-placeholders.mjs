// Genera ilustraciones SVG de ejemplo para las propiedades (se reemplazan por fotos reales desde el panel).
import { writeFileSync, mkdirSync } from "node:fs";

const scenes = [
  { name: "casa-1", sky: ["#8ec5fc", "#e0f0ff"], wall: "#f4efe6", roof: "#b5523b", trim: "#3d4a5c", ground: "#6fae5b", kind: "house" },
  { name: "casa-2", sky: ["#f6d365", "#fda085"], wall: "#ffffff", roof: "#2f3e4e", trim: "#2f3e4e", ground: "#7bb661", kind: "modern" },
  { name: "casa-3", sky: ["#a1c4fd", "#c2e9fb"], wall: "#e9d8c4", roof: "#8a3b2c", trim: "#5b4636", ground: "#5e9e4f", kind: "colonial" },
  { name: "apto-1", sky: ["#89f7fe", "#66a6ff"], wall: "#dfe6ee", roof: "#34495e", trim: "#1f2d3d", ground: "#6aa85a", kind: "tower" },
  { name: "apto-2", sky: ["#fbc2eb", "#a6c1ee"], wall: "#f1ece4", roof: "#4b5563", trim: "#374151", ground: "#71a95e", kind: "tower" },
  { name: "terreno-1", sky: ["#84fab0", "#8fd3f4"], wall: "#f1ece4", roof: "#4b5563", trim: "#374151", ground: "#5f9b48", kind: "land" },
  { name: "casa-4", sky: ["#ffecd2", "#fcb69f"], wall: "#fdfcf9", roof: "#1f2937", trim: "#1f2937", ground: "#6fae5b", kind: "modern" },
  { name: "casa-5", sky: ["#cfd9df", "#e2ebf0"], wall: "#f7e7ce", roof: "#9c4a2f", trim: "#4a3b30", ground: "#5e9e4f", kind: "colonial" },
  { name: "playa-1", sky: ["#48c6ef", "#6f86d6"], wall: "#ffffff", roof: "#c2703d", trim: "#1e3a5f", ground: "#e8d5a3", kind: "beach" },
  { name: "hero", sky: ["#1e3c72", "#f7b267"], wall: "#f4efe6", roof: "#2f3e4e", trim: "#2f3e4e", ground: "#3f6e3a", kind: "hero" },
];

const W = 1200, H = 800;
const windows = (x, y, cols, rows, w, h, gx, gy, c) => {
  let s = "";
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++)
    s += `<rect x="${x + i * (w + gx)}" y="${y + r * (h + gy)}" width="${w}" height="${h}" rx="4" fill="${c}" opacity=".85"/>`;
  return s;
};
const hills = (g) => `<path d="M0 520 Q 200 430 420 500 T 860 480 T 1200 470 V 800 H0Z" fill="${g}" opacity=".55"/><path d="M0 600 Q 300 540 600 590 T 1200 570 V800 H0Z" fill="${g}"/>`;
const palms = (x) => `<g transform="translate(${x} 0)"><rect x="-6" y="380" width="12" height="230" rx="6" fill="#6b4f35"/><g fill="#2e7d32"><ellipse cx="-50" cy="385" rx="60" ry="14" transform="rotate(-20 -50 385)"/><ellipse cx="50" cy="385" rx="60" ry="14" transform="rotate(20 50 385)"/><ellipse cx="0" cy="370" rx="14" ry="50"/></g></g>`;

function body(s) {
  switch (s.kind) {
    case "house":
    case "colonial":
      return `${hills(s.ground)}
<rect x="330" y="360" width="540" height="260" fill="${s.wall}"/>
<polygon points="300,370 600,220 900,370" fill="${s.roof}"/>
${windows(380, 410, 2, 1, 110, 90, 30, 0, s.trim)}${windows(710, 410, 1, 1, 110, 90, 0, 0, s.trim)}
<rect x="560" y="480" width="80" height="140" rx="6" fill="${s.trim}"/>
${s.kind === "colonial" ? `<rect x="330" y="600" width="540" height="20" fill="${s.roof}" opacity=".6"/>` : ""}
<rect x="0" y="620" width="1200" height="180" fill="${s.ground}"/>`;
    case "modern":
      return `${hills(s.ground)}
<rect x="260" y="400" width="420" height="220" fill="${s.wall}"/><rect x="560" y="300" width="400" height="200" fill="${s.wall}"/>
<rect x="540" y="290" width="440" height="16" fill="${s.roof}"/><rect x="240" y="390" width="320" height="14" fill="${s.roof}"/>
<rect x="600" y="340" width="320" height="120" fill="#9fc6e8"/><rect x="300" y="450" width="200" height="130" fill="#9fc6e8"/>
<rect x="560" y="500" width="400" height="120" fill="${s.wall}"/><rect x="620" y="520" width="90" height="100" fill="${s.trim}"/>
<rect x="0" y="620" width="1200" height="180" fill="${s.ground}"/><rect x="740" y="640" width="300" height="60" rx="8" fill="#5ab3e6"/>`;
    case "tower":
      return `${hills(s.ground)}
<rect x="430" y="140" width="340" height="480" fill="${s.wall}"/><rect x="420" y="130" width="360" height="16" fill="${s.roof}"/>
${windows(460, 170, 4, 8, 58, 38, 17, 16, "#7fb0de")}
<rect x="200" y="330" width="200" height="290" fill="${s.wall}" opacity=".8"/>${windows(220, 350, 3, 5, 40, 30, 20, 20, "#7fb0de")}
<rect x="800" y="380" width="220" height="240" fill="${s.wall}" opacity=".8"/>${windows(820, 400, 3, 4, 45, 32, 20, 20, "#7fb0de")}
<rect x="0" y="620" width="1200" height="180" fill="${s.ground}"/>`;
    case "land":
      return `<path d="M0 420 Q 250 330 520 400 T 1200 380 V 800 H0Z" fill="#3f7a3a" opacity=".6"/>${hills(s.ground)}
<rect x="0" y="620" width="1200" height="180" fill="${s.ground}"/>
<g stroke="#8a6a44" stroke-width="6">${[200, 360, 520, 680, 840, 1000].map((x) => `<line x1="${x}" y1="600" x2="${x}" y2="660"/>`).join("")}<line x1="180" y1="615" x2="1020" y2="615"/></g>
<g fill="#2e6b2e"><circle cx="150" cy="520" r="55"/><circle cx="1060" cy="500" r="65"/><circle cx="980" cy="540" r="40"/></g>`;
    case "beach":
      return `<rect x="0" y="470" width="1200" height="150" fill="#2aa7c9"/><rect x="0" y="470" width="1200" height="20" fill="#7fd6ea"/>
<rect x="0" y="600" width="1200" height="200" fill="${s.ground}"/>
<rect x="420" y="420" width="380" height="200" fill="${s.wall}"/><polygon points="390,430 610,330 830,430" fill="${s.roof}"/>
${windows(460, 460, 3, 1, 80, 70, 30, 0, s.trim)}<rect x="570" y="540" width="70" height="80" fill="${s.trim}"/>
${palms(250)}${palms(980)}`;
    case "hero": {
      const city = Array.from({ length: 26 }, (_, i) => {
        const w = 26 + ((i * 37) % 30), h = 40 + ((i * 53) % 90), x = i * 47;
        return `<rect x="${x}" y="${610 - h}" width="${w}" height="${h}" fill="#1c2f45"/>` +
          Array.from({ length: Math.floor(h / 22) }, (_, k) => `<rect x="${x + 6}" y="${615 - h + k * 22}" width="5" height="6" fill="#ffd58a" opacity="${(i + k) % 3 ? 0.8 : 0.2}"/>`).join("");
      }).join("");
      return `<circle cx="900" cy="360" r="110" fill="#ffd58a" opacity=".9"/>
<path d="M0 470 Q 200 360 450 430 T 900 400 T 1200 420 V 800 H0Z" fill="#2c4a3a" opacity=".75"/>
<path d="M0 540 Q 300 480 650 520 T 1200 500 V800 H0Z" fill="${s.ground}" opacity=".9"/>
${city}<rect x="0" y="610" width="1200" height="190" fill="#1f3a2a"/>${palms(140)}${palms(1080)}`;
    }
  }
}

mkdirSync("public/img", { recursive: true });
for (const s of scenes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<g fill="#fff" opacity=".7"><ellipse cx="220" cy="140" rx="90" ry="26"/><ellipse cx="280" cy="125" rx="60" ry="24"/><ellipse cx="980" cy="110" rx="80" ry="22"/></g>
${body(s)}
</svg>`;
  writeFileSync(`public/img/${s.name}.svg`, svg);
}
console.log("ok", scenes.length);
