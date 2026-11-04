import { properties as seedProperties, slugify, type Property } from "@/data/properties";
import type { Backend, Inquiry, Profile } from "./types";

// Modo demo: todo se guarda en localStorage del navegador. Sirve para probar el sitio
// sin base de datos. Cuenta de administrador de prueba: admin@demo.hn / admin123.
type DemoUser = Profile & { password: string };
type DB = { users: DemoUser[]; properties: Property[]; favorites: { userId: string; propertyId: string }[]; inquiries: Inquiry[]; session: string | null };

const KEY = "pihn-demo-v1";
export const DEMO_ADMIN = { email: "admin@demo.hn", password: "admin123" };

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

function seed(): DB {
  const admin: DemoUser = { id: "u-admin", email: DEMO_ADMIN.email, password: DEMO_ADMIN.password, fullName: "Administrador", phone: "+504 0000-0000", role: "admin", createdAt: "2026-10-01T12:00:00.000Z" };
  const maria: DemoUser = { id: "u-maria", email: "maria@ejemplo.com", password: "maria123", fullName: "María López", phone: "+1 305 555 0182", role: "user", createdAt: "2026-10-20T15:30:00.000Z" };
  const p = seedProperties;
  return {
    users: [admin, maria],
    properties: p.map((x) => ({ ...x })),
    favorites: [{ userId: maria.id, propertyId: p[5].id }, { userId: maria.id, propertyId: p[0].id }],
    inquiries: [
      { id: uid(), propertyId: p[5].id, userId: maria.id, name: maria.fullName, email: maria.email, phone: maria.phone, message: "Vivo en Miami, ¿pueden hacerme un recorrido por videollamada este sábado?", status: "nueva", createdAt: "2026-11-02T18:10:00.000Z" },
      { id: uid(), propertyId: p[1].id, userId: null, name: "Jorge Martínez", email: "jorge.m@ejemplo.com", phone: "+504 9988-7766", message: "¿El alquiler incluye mantenimiento? Me interesa por 12 meses.", status: "en_proceso", createdAt: "2026-11-01T14:22:00.000Z" },
      { id: uid(), propertyId: p[2].id, userId: null, name: "Ana Reyes", email: "ana.reyes@ejemplo.com", phone: "+504 3311-2244", message: "¿Aceptan financiamiento con BAC? Quisiera visitarla.", status: "cerrada", createdAt: "2026-10-28T09:45:00.000Z" },
    ],
    session: null,
  };
}

function load(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const db = seed();
  save(db);
  return db;
}

function save(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {
    throw new Error("El navegador no tiene espacio para guardar más datos de prueba. Usa fotos más pequeñas.");
  }
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());
const strip = ({ password: _p, ...rest }: DemoUser): Profile => rest;
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));

function current(db: DB) { return db.users.find((u) => u.id === db.session) ?? null; }
function requireUser(db: DB) { const u = current(db); if (!u) throw new Error("Debes iniciar sesión."); return u; }
function requireAdmin(db: DB) { const u = requireUser(db); if (u.role !== "admin") throw new Error("Solo para administradores."); return u; }

function withTitles(db: DB, list: Inquiry[]) {
  return list.map((i) => {
    const p = db.properties.find((x) => x.id === i.propertyId);
    return { ...i, propertyTitle: p?.title, propertySlug: p?.slug };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Reduce la foto a un máximo de 1600 px para que quepa en el navegador.
function resizeImage(file: File, max = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = url;
  });
}

export function createDemoBackend(): Backend {
  return {
    mode: "demo",
    async getCurrentProfile() { const u = current(load()); return delay(u ? strip(u) : null); },
    onAuthChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async signUp({ email, password, fullName, phone }) {
      const db = load();
      const e = email.trim().toLowerCase();
      if (db.users.some((u) => u.email === e)) throw new Error("Ya existe una cuenta con ese correo.");
      if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
      const u: DemoUser = { id: uid(), email: e, password, fullName, phone, role: "user", createdAt: now() };
      db.users.push(u); db.session = u.id; save(db); emit();
      return delay({ needsConfirmation: false });
    },
    async signIn(email, password) {
      const db = load();
      const u = db.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) throw new Error("Correo o contraseña incorrectos.");
      db.session = u.id; save(db); emit(); await delay(null);
    },
    async signOut() { const db = load(); db.session = null; save(db); emit(); },
    async resetPassword() { await delay(null); },
    async updateProfile({ fullName, phone }) {
      const db = load(); const u = requireUser(db);
      u.fullName = fullName; u.phone = phone; save(db); emit();
    },

    async listProperties(opts) {
      const db = load();
      const list = opts?.includeUnpublished ? db.properties : db.properties.filter((p) => p.published !== false);
      return delay([...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")));
    },
    async getProperty(slug) {
      const db = load(); const u = current(db);
      const p = db.properties.find((x) => x.slug === slug);
      if (!p || (p.published === false && u?.role !== "admin")) return delay(null);
      return delay(p);
    },
    async saveProperty(input) {
      const db = load(); requireAdmin(db);
      const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
      if (db.properties.some((p) => p.slug === slug && p.id !== input.id)) throw new Error("Ya existe otra propiedad con esa dirección web (slug).");
      let saved: Property;
      const i = input.id ? db.properties.findIndex((p) => p.id === input.id) : -1;
      if (i >= 0) { saved = { ...db.properties[i], ...input, id: db.properties[i].id, slug }; db.properties[i] = saved; }
      else { saved = { ...input, id: uid(), slug, views: 0, createdAt: now() }; db.properties.push(saved); }
      save(db); return delay(saved);
    },
    async deleteProperty(id) {
      const db = load(); requireAdmin(db);
      db.properties = db.properties.filter((p) => p.id !== id);
      db.favorites = db.favorites.filter((f) => f.propertyId !== id);
      db.inquiries.forEach((q) => { if (q.propertyId === id) q.propertyId = null; });
      save(db);
    },
    async uploadImage(file) { requireAdmin(load()); return resizeImage(file); },
    async recordView(id) {
      const db = load(); const p = db.properties.find((x) => x.id === id);
      if (p) { p.views = (p.views ?? 0) + 1; save(db); }
    },

    async listFavoriteIds() {
      const db = load(); const u = current(db);
      return delay(u ? db.favorites.filter((f) => f.userId === u.id).map((f) => f.propertyId) : []);
    },
    async toggleFavorite(propertyId) {
      const db = load(); const u = requireUser(db);
      const i = db.favorites.findIndex((f) => f.userId === u.id && f.propertyId === propertyId);
      if (i >= 0) db.favorites.splice(i, 1); else db.favorites.push({ userId: u.id, propertyId });
      save(db); return i < 0;
    },

    async createInquiry(d) {
      const db = load(); const u = current(db);
      db.inquiries.push({ ...d, id: uid(), userId: u?.id ?? null, status: "nueva", createdAt: now() });
      save(db); await delay(null);
    },
    async listMyInquiries() {
      const db = load(); const u = requireUser(db);
      return delay(withTitles(db, db.inquiries.filter((i) => i.userId === u.id)));
    },
    async listInquiries() { const db = load(); requireAdmin(db); return delay(withTitles(db, db.inquiries)); },
    async setInquiryStatus(id, status) {
      const db = load(); requireAdmin(db);
      const q = db.inquiries.find((x) => x.id === id); if (q) q.status = status; save(db);
    },
    async deleteInquiry(id) { const db = load(); requireAdmin(db); db.inquiries = db.inquiries.filter((x) => x.id !== id); save(db); },

    async listUsers() {
      const db = load(); requireAdmin(db);
      return delay(db.users.map((u) => ({
        ...strip(u),
        favorites: db.favorites.filter((f) => f.userId === u.id).length,
        inquiries: db.inquiries.filter((i) => i.userId === u.id).length,
      })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },
    async setUserRole(id, role) {
      const db = load(); const me = requireAdmin(db);
      if (id === me.id && role !== "admin") throw new Error("No puedes quitarte tu propio acceso de administrador.");
      const u = db.users.find((x) => x.id === id); if (u) u.role = role; save(db);
    },
  };
}
