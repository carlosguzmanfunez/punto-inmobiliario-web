import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify, type Property } from "@/data/properties";
import type { Backend, Inquiry, Profile, Role } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const toProperty = (r: Row): Property => ({
  id: r.id, slug: r.slug, title: r.title, operation: r.operation, type: r.type,
  price: Number(r.price), currency: r.currency, city: r.city, neighborhood: r.neighborhood,
  bedrooms: r.bedrooms, bathrooms: Number(r.bathrooms), areaM2: Number(r.area_m2),
  lotM2: r.lot_m2 == null ? undefined : Number(r.lot_m2), parking: r.parking,
  images: r.images ?? [], features: r.features ?? [], description: r.description,
  isNew: r.is_new, featured: r.featured, published: r.published, views: r.views, createdAt: r.created_at,
});

const toProfile = (r: Row): Profile => ({
  id: r.id, email: r.email, fullName: r.full_name, phone: r.phone, role: r.role, createdAt: r.created_at,
});

const toInquiry = (r: Row): Inquiry => ({
  id: r.id, propertyId: r.property_id, userId: r.user_id, name: r.name, email: r.email, phone: r.phone,
  message: r.message, status: r.status, createdAt: r.created_at,
  propertyTitle: r.properties?.title, propertySlug: r.properties?.slug,
});

// Traduce los errores más comunes de Supabase al español.
function fail(error: { message: string } | null): asserts error is null {
  if (!error) return;
  const m = error.message;
  if (/Invalid login credentials/i.test(m)) throw new Error("Correo o contraseña incorrectos.");
  if (/already registered/i.test(m)) throw new Error("Ya existe una cuenta con ese correo.");
  if (/Email not confirmed/i.test(m)) throw new Error("Confirma tu correo con el enlace que te enviamos antes de ingresar.");
  if (/Password should be/i.test(m)) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  if (/duplicate key.*slug/i.test(m)) throw new Error("Ya existe otra propiedad con esa dirección web (slug).");
  if (/row-level security/i.test(m)) throw new Error("No tienes permiso para esta acción.");
  throw new Error(m);
}

export function createSupabaseBackend(url: string, key: string): Backend {
  const sb: SupabaseClient = createClient(url, key);
  const uid = async () => (await sb.auth.getSession()).data.session?.user.id ?? null;

  return {
    mode: "supabase",
    async getCurrentProfile() {
      const id = await uid(); if (!id) return null;
      const { data, error } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
      fail(error); return data ? toProfile(data) : null;
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },
    async signUp({ email, password, fullName, phone }) {
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone }, emailRedirectTo: `${location.origin}/cuenta` },
      });
      fail(error); return { needsConfirmation: !data.session };
    },
    async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); fail(error); },
    async signOut() { await sb.auth.signOut(); },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/cuenta` }); fail(error);
    },
    async updateProfile({ fullName, phone }) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const { error } = await sb.from("profiles").update({ full_name: fullName, phone }).eq("id", id); fail(error);
    },

    async listProperties(opts) {
      let q = sb.from("properties").select("*").order("created_at", { ascending: false });
      if (!opts?.includeUnpublished) q = q.eq("published", true);
      const { data, error } = await q; fail(error); return (data ?? []).map(toProperty);
    },
    async getProperty(slug) {
      const { data, error } = await sb.from("properties").select("*").eq("slug", slug).maybeSingle();
      fail(error); return data ? toProperty(data) : null;
    },
    async saveProperty(p) {
      const row = {
        slug: p.slug?.trim() ? slugify(p.slug) : slugify(p.title), title: p.title, operation: p.operation, type: p.type,
        price: p.price, currency: p.currency, city: p.city, neighborhood: p.neighborhood, bedrooms: p.bedrooms,
        bathrooms: p.bathrooms, area_m2: p.areaM2, lot_m2: p.lotM2 ?? null, parking: p.parking, images: p.images,
        features: p.features, description: p.description, is_new: !!p.isNew, featured: !!p.featured,
        published: p.published !== false, updated_at: new Date().toISOString(),
      };
      const res = p.id
        ? await sb.from("properties").update(row).eq("id", p.id).select().single()
        : await sb.from("properties").insert(row).select().single();
      fail(res.error); return toProperty(res.data);
    },
    async deleteProperty(id) { const { error } = await sb.from("properties").delete().eq("id", id); fail(error); },
    async uploadImage(file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from("property-images").upload(path, file, { contentType: file.type, upsert: false });
      fail(error);
      return sb.storage.from("property-images").getPublicUrl(path).data.publicUrl;
    },
    async recordView(id) { await sb.rpc("record_view", { p_id: id }); },

    async listFavoriteIds() {
      const id = await uid(); if (!id) return [];
      const { data, error } = await sb.from("favorites").select("property_id").eq("user_id", id);
      fail(error); return (data ?? []).map((r) => r.property_id);
    },
    async toggleFavorite(propertyId) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const { data } = await sb.from("favorites").select("property_id").eq("user_id", id).eq("property_id", propertyId).maybeSingle();
      if (data) { const { error } = await sb.from("favorites").delete().eq("user_id", id).eq("property_id", propertyId); fail(error); return false; }
      const { error } = await sb.from("favorites").insert({ user_id: id, property_id: propertyId }); fail(error); return true;
    },

    async createInquiry(d) {
      const id = await uid();
      const { error } = await sb.from("inquiries").insert({
        property_id: d.propertyId, user_id: id, name: d.name, email: d.email, phone: d.phone, message: d.message,
      });
      fail(error);
    },
    async listMyInquiries() {
      const id = await uid(); if (!id) return [];
      const { data, error } = await sb.from("inquiries").select("*, properties(title, slug)").eq("user_id", id).order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toInquiry);
    },
    async listInquiries() {
      const { data, error } = await sb.from("inquiries").select("*, properties(title, slug)").order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toInquiry);
    },
    async setInquiryStatus(id, status) { const { error } = await sb.from("inquiries").update({ status }).eq("id", id); fail(error); },
    async deleteInquiry(id) { const { error } = await sb.from("inquiries").delete().eq("id", id); fail(error); },

    async listUsers() {
      const [p, f, i] = await Promise.all([
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("favorites").select("user_id"),
        sb.from("inquiries").select("user_id"),
      ]);
      fail(p.error);
      const count = (rows: Row[] | null, id: string) => (rows ?? []).filter((r) => r.user_id === id).length;
      return (p.data ?? []).map((r) => ({ ...toProfile(r), favorites: count(f.data, r.id), inquiries: count(i.data, r.id) }));
    },
    async setUserRole(id, role: Role) {
      if (id === (await uid()) && role !== "admin") throw new Error("No puedes quitarte tu propio acceso de administrador.");
      const { error } = await sb.from("profiles").update({ role }).eq("id", id); fail(error);
    },
  };
}
