import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched routes under a locale. Calling notFound() here renders
 * the localized app/[locale]/not-found.tsx within the locale layout (Next only
 * renders a segment's not-found when notFound() is thrown, not for bare
 * unmatched URLs).
 */
export default function CatchAll() {
  notFound();
}
