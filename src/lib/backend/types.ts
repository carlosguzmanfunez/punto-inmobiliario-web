import type { Property } from "@/data/properties";

export type Role = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  createdAt: string;
};

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

export type PropertyInput = Omit<Property, "id" | "views" | "createdAt"> & { id?: string };

export type UserRow = Profile & { favorites: number; inquiries: number };

// Todo lo que el sitio necesita de la base de datos. Hay dos implementaciones:
// Supabase (producción) y demo (guarda en el navegador, para probar sin base de datos).
export interface Backend {
  mode: "demo" | "supabase";
  getCurrentProfile(): Promise<Profile | null>;
  onAuthChange(cb: () => void): () => void;
  signUp(d: { email: string; password: string; fullName: string; phone: string }): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updateProfile(d: { fullName: string; phone: string }): Promise<void>;

  listProperties(opts?: { includeUnpublished?: boolean }): Promise<Property[]>;
  getProperty(slug: string): Promise<Property | null>;
  saveProperty(p: PropertyInput): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
  recordView(id: string): Promise<void>;

  listFavoriteIds(): Promise<string[]>;
  toggleFavorite(propertyId: string): Promise<boolean>;

  createInquiry(d: InquiryInput): Promise<void>;
  listMyInquiries(): Promise<Inquiry[]>;
  listInquiries(): Promise<Inquiry[]>;
  setInquiryStatus(id: string, status: InquiryStatus): Promise<void>;
  deleteInquiry(id: string): Promise<void>;

  listUsers(): Promise<UserRow[]>;
  setUserRole(id: string, role: Role): Promise<void>;
}
