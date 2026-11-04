import type { Backend } from "./types";
import { createDemoBackend } from "./demo";
import { createSupabaseBackend } from "./supabase";

export * from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let instance: Backend | null = null;

// Si hay claves de Supabase en el entorno se usa la base de datos real; si no, el modo demo.
export function getBackend(): Backend {
  if (!instance) instance = url && key ? createSupabaseBackend(url, key) : createDemoBackend();
  return instance;
}
