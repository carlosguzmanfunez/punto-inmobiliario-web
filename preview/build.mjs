import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const shim = { name: "shim", setup(b) {
  b.onResolve({ filter: /^next\/link$/ }, () => ({ path: path.join(root, "preview/next-link.tsx") }));
  b.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: path.join(root, "preview/next-navigation.ts") }));
  b.onResolve({ filter: /^@\// }, (a) => ({ path: require_resolve(path.join(root, "src", a.path.slice(2))) }));
}};
import { existsSync } from "node:fs";
function require_resolve(p) { for (const e of [".tsx", ".ts", "/index.ts", ""]) if (existsSync(p + e)) return p + e; return p; }
const r = await build({
  entryPoints: [path.join(root, "preview/main.tsx")], bundle: true, minify: true, write: false, format: "iife",
  jsx: "automatic", plugins: [shim], loader: { ".css": "empty" },
  define: { "process.env.NEXT_PUBLIC_SUPABASE_URL": "undefined", "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": "undefined", "process.env.NODE_ENV": '"production"' },
});
let js = r.outputFiles[0].text.replaceAll('"/img/', '"img/').replaceAll("`/img/", "`img/");
writeFileSync(path.join(out, "app.js"), js);
writeFileSync(path.join(out, "styles.css"), readFileSync(path.join(root, "src/app/globals.css"), "utf8").replaceAll('url("/img/', 'url("img/'));
cpSync(path.join(root, "public/img"), path.join(out, "img"), { recursive: true });
writeFileSync(path.join(out, "index.html"), `<title>Punto Inmobiliario Hn</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css"><style>body{background:#fff;color:#1b1f24;font-family:"Plus Jakarta Sans",system-ui,sans-serif}</style>
<div id="root"></div><script src="app.js"></script>
`);
console.log("ok", (js.length/1024).toFixed(0)+"KB");
