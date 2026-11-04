import type { InquiryStatus } from "./backend/types";

export const statusLabel: Record<InquiryStatus, string> = { nueva: "Nueva", en_proceso: "En proceso", cerrada: "Cerrada" };

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat("es-HN", withTime
    ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}
