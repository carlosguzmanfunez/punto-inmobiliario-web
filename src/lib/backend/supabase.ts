import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify, type Property } from "@/data/properties";
import { defaultSettings } from "@/lib/site";
import type { Backend, Inquiry, Payment, Profile, Role, Seller } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const toProperty = (r: Row): Property => ({
  id: r.id, slug: r.slug, title: r.title, operation: r.operation, type: r.type,
  price: Number(r.price), currency: r.currency, city: r.city, department: r.department || undefined, neighborhood: r.neighborhood,
  bedrooms: r.bedrooms, bathrooms: Number(r.bathrooms), areaM2: Number(r.area_m2),
  lotM2: r.lot_m2 == null ? undefined : Number(r.lot_m2), parking: r.parking,
  images: r.images ?? [], features: r.features ?? [], description: r.description,
  isNew: r.is_new, featured: r.featured, published: r.published, views: r.views, createdAt: r.created_at,
  ownerId: r.owner_id, status: r.status, paidUntil: r.paid_until,
});

const toSeller = (r: Row): Seller => ({
  id: r.id, slug: r.slug, name: r.name, bio: r.bio, whatsapp: r.whatsapp, city: r.city, logo: r.logo,
  vitrinaUntil: r.vitrina_until, createdAt: r.created_at,
});

const toPayment = (r: Row): Payment => ({
  id: r.id, sellerId: r.seller_id, kind: r.kind, propertyId: r.property_id, amount: Number(r.amount), reference: r.reference,
  status: r.status, createdAt: r.created_at, confirmedAt: r.confirmed_at, receipt: r.receipt ?? null,
  sellerName: r.sellers?.name, propertyTitle: r.properties?.title,
});

// Visible en el sitio: publicada y, si es de un vendedor, con el plan vigente.
const live = () => `and(published.eq.true,or(owner_id.is.null,paid_until.gte.${new Date().toISOString()}))`;

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
    async signUp({ email, password, fullName, phone, accountType, businessName }) {
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName, phone, account_type: accountType, business_name: businessName ?? "" },
          emailRedirectTo: `${location.origin}${accountType === "vendedor" ? "/panel" : "/cuenta"}`,
        },
      });
      fail(error); return { needsConfirmation: !data.session };
    },
    async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); fail(error); },
    async signInWithGoogle(next = "/cuenta") {
      const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${next}` } });
      fail(error);
    },
    async signOut() { await sb.auth.signOut(); },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/cuenta` }); fail(error);
    },
    async updateProfile({ fullName, phone }) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const { error } = await sb.from("profiles").update({ full_name: fullName, phone }).eq("id", id); fail(error);
    },

    async becomeSeller(businessName) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const me = await sb.from("profiles").select("*").eq("id", id).single(); fail(me.error);
      if (me.data.role === "user") { const { error } = await sb.from("profiles").update({ role: "seller" }).eq("id", id); fail(error); }
      const name = businessName.trim() || me.data.full_name || "Vendedor";
      const { error } = await sb.from("sellers").upsert({ id, slug: `${slugify(name) || "vendedor"}-${id.slice(0, 4)}`, name, whatsapp: me.data.phone }, { onConflict: "id", ignoreDuplicates: true });
      fail(error);
    },

    async listProperties(opts) {
      let q = sb.from("properties").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
      const me = await uid();
      if (opts?.ownerId) {
        q = q.eq("owner_id", opts.ownerId);
        if (opts.ownerId !== me) q = q.or(live());
      } else if (!opts?.includeUnpublished) q = q.or(live());
      const { data, error } = await q; fail(error); return (data ?? []).map(toProperty);
    },
    async getProperty(slug) {
      const { data, error } = await sb.from("properties").select("*").eq("slug", slug).maybeSingle();
      fail(error); return data ? toProperty(data) : null;
    },
    async saveProperty(p) {
      const row = {
        slug: p.slug?.trim() ? slugify(p.slug) : slugify(p.title), title: p.title, operation: p.operation, type: p.type,
        price: p.price, currency: p.currency, city: p.city, department: p.department ?? "", neighborhood: p.neighborhood, bedrooms: p.bedrooms,
        bathrooms: p.bathrooms, area_m2: p.areaM2, lot_m2: p.lotM2 ?? null, parking: p.parking, images: p.images,
        features: p.features, description: p.description, is_new: !!p.isNew, featured: !!p.featured,
        published: p.published !== false, status: p.status ?? "publicada",
        updated_at: new Date().toISOString(),
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

    async getSeller(id) {
      const { data, error } = await sb.from("sellers").select("*").eq("id", id).maybeSingle(); fail(error);
      return data ? toSeller(data) : null;
    },
    async getSellerBySlug(slug) {
      const { data, error } = await sb.from("sellers").select("*").eq("slug", slug).maybeSingle(); fail(error);
      return data ? toSeller(data) : null;
    },
    async saveMySeller(d) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const slug = slugify(d.slug || d.name);
      if (!slug) throw new Error("Escribe el nombre de tu negocio.");
      const { data, error } = await sb.from("sellers").upsert({ id, ...d, slug }, { onConflict: "id" }).select().single();
      if (error && /duplicate key/i.test(error.message)) throw new Error("Esa dirección ya la usa otro vendedor. Prueba con otra.");
      fail(error); return toSeller(data);
    },
    async listSellers() {
      const { data, error } = await sb.from("sellers").select("*").order("created_at", { ascending: false }); fail(error);
      return (data ?? []).map(toSeller);
    },
    async getSettings() {
      const { data } = await sb.from("settings").select("data").eq("id", 1).maybeSingle();
      return { ...defaultSettings, ...(data?.data ?? {}), prices: { ...defaultSettings.prices, ...(data?.data?.prices ?? {}) } };
    },
    async saveSettings(st) {
      const { error } = await sb.from("settings").upsert({ id: 1, data: st }); fail(error);
    },
    async listVitrinas() {
      const { data, error } = await sb.from("sellers").select("*").gte("vitrina_until", new Date().toISOString()).order("name"); fail(error);
      return (data ?? []).map(toSeller);
    },

    async listSavedSearches() {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const { data, error } = await sb.from("saved_searches").select("*").eq("user_id", id).order("created_at", { ascending: false }); fail(error);
      return (data ?? []).map((r) => ({ id: r.id, name: r.name, query: r.query, createdAt: r.created_at }));
    },
    async saveSearch({ name, query }) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      const { error } = await sb.from("saved_searches").insert({ user_id: id, name: name.trim() || "Mi búsqueda", query });
      if (error?.code === "23505") throw new Error("Ya tienes guardada esta búsqueda.");
      fail(error);
    },
    async deleteSavedSearch(sid) { const { error } = await sb.from("saved_searches").delete().eq("id", sid); fail(error); },

    async requestPayment({ kind, propertyId, reference, receipt }) {
      const id = await uid(); if (!id) throw new Error("Debes iniciar sesión.");
      let path: string | null = null;
      if (receipt) {
        // Bucket privado: cada vendedor sube a su carpeta y solo él y el administrador la ven.
        const ext = (receipt.name.split(".").pop() || "jpg").toLowerCase();
        path = `${id}/${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from("payment-receipts").upload(path, receipt, { contentType: receipt.type, upsert: false });
        fail(up.error);
      }
      const { error } = await sb.from("payments").insert({ seller_id: id, kind, property_id: propertyId, amount: 0, reference: reference.trim(), receipt: path });
      fail(error);
    },
    async receiptUrl(receipt) {
      const { data, error } = await sb.storage.from("payment-receipts").createSignedUrl(receipt, 600);
      fail(error); return data!.signedUrl;
    },
    async listMyPayments() {
      const id = await uid(); if (!id) return [];
      const { data, error } = await sb.from("payments").select("*, sellers(name), properties(title)").eq("seller_id", id).order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toPayment);
    },
    async listPayments() {
      const { data, error } = await sb.from("payments").select("*, sellers(name), properties(title)").order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toPayment);
    },
    async confirmPayment(id) { const { error } = await sb.rpc("confirm_payment", { p_id: id, p_approve: true }); fail(error); },
    async rejectPayment(id) { const { error } = await sb.rpc("confirm_payment", { p_id: id, p_approve: false }); fail(error); },

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
    async listReceivedInquiries() {
      const id = await uid(); if (!id) return [];
      const { data, error } = await sb.from("inquiries").select("*, properties!inner(title, slug, owner_id)").eq("properties.owner_id", id).order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toInquiry);
    },
    async listInquiries() {
      const { data, error } = await sb.from("inquiries").select("*, properties(title, slug)").order("created_at", { ascending: false });
      fail(error); return (data ?? []).map(toInquiry);
    },
    async setInquiryStatus(id, status) { const { error } = await sb.from("inquiries").update({ status }).eq("id", id); fail(error); },
    async deleteInquiry(id) { const { error } = await sb.from("inquiries").delete().eq("id", id); fail(error); },

    async listUsers() {
      const [p, f, i, o] = await Promise.all([
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("favorites").select("user_id"),
        sb.from("inquiries").select("user_id"),
        sb.from("properties").select("owner_id").not("owner_id", "is", null),
      ]);
      fail(p.error);
      const count = (rows: Row[] | null, id: string, key = "user_id") => (rows ?? []).filter((r) => r[key] === id).length;
      return (p.data ?? []).map((r) => ({ ...toProfile(r), favorites: count(f.data, r.id), inquiries: count(i.data, r.id), properties: count(o.data, r.id, "owner_id") }));
    },
    async setUserRole(id, role: Role) {
      if (id === (await uid()) && role !== "admin") throw new Error("No puedes quitarte tu propio acceso de administrador.");
      const { error } = await sb.from("profiles").update({ role }).eq("id", id); fail(error);
      if (role === "seller") {
        const u = await sb.from("profiles").select("full_name, phone").eq("id", id).single();
        const name = u.data?.full_name || "Vendedor";
        await sb.from("sellers").upsert({ id, slug: `${slugify(name) || "vendedor"}-${id.slice(0, 4)}`, name, whatsapp: u.data?.phone ?? "" }, { onConflict: "id", ignoreDuplicates: true });
      }
    },
  };
}
