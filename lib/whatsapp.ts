/**
 * Build a wa.me deep link. Strips everything but digits from the number
 * (wa.me requires a bare international number, no +, spaces or dashes).
 * Returns null when no usable number is configured so callers can fall back.
 */
export function whatsappUrl(
  number: string | null | undefined,
  message?: string
): string | null {
  const phone = (number || "").replace(/[^\d]/g, "");
  if (!phone) return null;
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
