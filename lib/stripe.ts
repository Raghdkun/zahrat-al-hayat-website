import "@/lib/env";
import Stripe from "stripe";

// Payments are handled via WhatsApp for now, so Stripe is optional. Fall back to
// a disabled placeholder key so importing this module never throws when no key
// is configured (the /api/payments/* routes only function with a real key).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_disabled", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
