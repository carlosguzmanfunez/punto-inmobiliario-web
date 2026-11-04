import type { InquiryStatus, PaymentStatus } from "./backend/types";

export const statusLabel: Record<InquiryStatus, string> = { nueva: "Nueva", en_proceso: "En proceso", cerrada: "Cerrada" };

export const paymentStatusLabel: Record<PaymentStatus, string> = { pendiente: "Por confirmar", pagado: "Pagado", rechazado: "Rechazado" };

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat("es-HN", withTime
    ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function daysLeft(iso: string | null | undefined) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5));
}

// Dirección completa de una página del sitio, para copiar y compartir.
export function absoluteUrl(path: string) {
  if (typeof window === "undefined") return path;
  const hashRouted = location.hash.startsWith("#/");
  return hashRouted ? `${location.origin}${location.pathname}#${path}` : `${location.origin}${path}`;
}
