import {
  differenceInCalendarDays,
  format,
  isPast,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "dd MMM yyyy", { locale: es });
}

export function formatDateTime(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "dd MMM yyyy HH:mm", { locale: es });
}

export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const value = typeof date === "string" ? parseISO(date) : date;
  return isPast(value);
}

export function daysUntilExpiration(
  date: Date | string | null | undefined
): number {
  if (!date) return Number.POSITIVE_INFINITY;
  const value = typeof date === "string" ? parseISO(date) : date;
  return differenceInCalendarDays(value, new Date());
}

export function expirationLabel(
  date: Date | string | null | undefined
): string {
  if (!date) return "Sin expiración";
  const days = daysUntilExpiration(date);
  if (days < 0) return "Expirado";
  if (days === 0) return "Expira hoy";
  if (days === 1) return "1 día restante";
  return `${days} días restantes`;
}
