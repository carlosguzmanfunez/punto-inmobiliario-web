import type { ListingStatus, Property } from "@/data/properties";
import type { PlanKind } from "@/lib/site";

// user: busca propiedades · seller: publica sus propiedades · admin: administra todo.
export type Role = "user" | "seller" | "admin";

export const roleLabel: Record<Role, string> = { user: "Comprador", seller: "Vendedor", admin: "Administrador" };

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  createdAt: string;
};

// Datos públicos del vendedor: aparecen en sus publicaciones y en su vitrina.
export type Seller = {
  id: string;
  slug: string;
  name: string;
  bio: string;
  whatsapp: string;
  city: string;
  logo: string;
  vitrinaUntil: string | null;
  createdAt: string;
};

export function vitrinaActive(s: Pick<Seller, "vitrinaUntil"> | null | undefined, now = Date.now()) {
  return !!s?.vitrinaUntil && new Date(s.vitrinaUntil).getTime() >= now;
}

export type InquiryStatus = "nueva" | "en_proceso" | "cerrada";

export type Inquiry = {
  id: string;
  propertyId: string | null;
  propertyTitle?: string;
  propertySlug?: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

export type InquiryInput = Pick<Inquiry, "propertyId" | "name" | "email" | "phone" | "message">;

export type PaymentStatus = "pendiente" | "pagado" | "rechazado";

// Solicitud de pago de un plan. El vendedor la crea con la referencia de su transferencia
// y el administrador la confirma; al confirmarla se activa la publicación o la vitrina.
export type Payment = {
  id: string;
  sellerId: string;
  sellerName?: string;
  kind: PlanKind;
  propertyId: string | null;
  propertyTitle?: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt: string | null;
};

// Ajustes del negocio que el administrador cambia desde su panel.
export type Settings = { usdRate: number; prices: Record<PlanKind, number>; bankInfo: string };

// Búsqueda guardada por un comprador: el texto de la URL de /propiedades.
export type SavedSearch = { id: string; name: string; query: string; createdAt: string };

export type PropertyInput = Omit<Property, "id" | "views" | "createdAt"> & { id?: string };

export type UserRow = Profile & { favorites: number; inquiries: number; properties: number };

export type SignUpInput = { email: string; password: string; fullName: string; phone: string; accountType: "comprador" | "vendedor"; businessName?: string };

// Todo lo que el sitio necesita de la base de datos. Hay dos implementaciones:
// Supabase (producción) y demo (guarda en el navegador, para probar sin base de datos).
export interface Backend {
  mode: "demo" | "supabase";
  getCurrentProfile(): Promise<Profile | null>;
  onAuthChange(cb: () => void): () => void;
  signUp(d: SignUpInput): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updateProfile(d: { fullName: string; phone: string }): Promise<void>;
  becomeSeller(businessName: string): Promise<void>;

  // Propiedades. listProperties sin opciones devuelve solo las visibles en el sitio.
  listProperties(opts?: { includeUnpublished?: boolean; ownerId?: string }): Promise<Property[]>;
  getProperty(slug: string): Promise<Property | null>;
  saveProperty(p: PropertyInput): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
  recordView(id: string): Promise<void>;

  // Vendedores y vitrinas.
  getSeller(id: string): Promise<Seller | null>;
  getSellerBySlug(slug: string): Promise<Seller | null>;
  saveMySeller(d: Pick<Seller, "slug" | "name" | "bio" | "whatsapp" | "city" | "logo">): Promise<Seller>;
  listSellers(): Promise<Seller[]>;
  // Vendedores con vitrina vigente (página pública de proyectos).
  listVitrinas(): Promise<Seller[]>;

  // Pagos de planes.
  requestPayment(d: { kind: PlanKind; propertyId: string | null; reference: string }): Promise<void>;
  listMyPayments(): Promise<Payment[]>;
  listPayments(): Promise<Payment[]>;
  confirmPayment(id: string): Promise<void>;
  rejectPayment(id: string): Promise<void>;

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;

  listSavedSearches(): Promise<SavedSearch[]>;
  saveSearch(d: { name: string; query: string }): Promise<void>;
  deleteSavedSearch(id: string): Promise<void>;

  listFavoriteIds(): Promise<string[]>;
  toggleFavorite(propertyId: string): Promise<boolean>;

  createInquiry(d: InquiryInput): Promise<void>;
  listMyInquiries(): Promise<Inquiry[]>;
  listReceivedInquiries(): Promise<Inquiry[]>;
  listInquiries(): Promise<Inquiry[]>;
  setInquiryStatus(id: string, status: InquiryStatus): Promise<void>;
  deleteInquiry(id: string): Promise<void>;

  listUsers(): Promise<UserRow[]>;
  setUserRole(id: string, role: Role): Promise<void>;
}

export type { ListingStatus };
