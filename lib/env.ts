import { z } from "zod";

/**
 * Validated environment variables.
 *
 * In production the app fails fast at startup if a required secret is missing
 * or obviously a placeholder. During `next build` and in development we only
 * warn, so the build never breaks and local placeholders keep working.
 */

const isProd = process.env.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const skip = process.env.SKIP_ENV_VALIDATION === "1";

const placeholder = /placeholder|change-in-production|^$/i;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).startsWith("postgres", "DATABASE_URL must be a postgres connection string"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters (use: openssl rand -base64 32)")
    .refine((v) => !placeholder.test(v), "NEXTAUTH_SECRET is still a placeholder"),
  NEXTAUTH_URL: z.string().url().optional(),
  // Stripe is optional — booking currently completes via WhatsApp. Only
  // validate the format when a key is actually provided.
  STRIPE_SECRET_KEY: z
    .string()
    .optional()
    .refine(
      (v) => !v || (v.startsWith("sk_") && !placeholder.test(v)),
      "STRIPE_SECRET_KEY must start with sk_ and not be a placeholder"
    ),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .optional()
    .refine(
      (v) => !v || (v.startsWith("whsec_") && !placeholder.test(v)),
      "STRIPE_WEBHOOK_SECRET must start with whsec_ and not be a placeholder"
    ),
  RESEND_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function validate() {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return;

  const messages = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  if (isProd && !isBuild && !skip) {
    throw new Error(`Invalid environment configuration:\n${messages}`);
  }
  // dev / build: warn only so local placeholders and CI builds keep working.
  if (!skip) {
    console.warn(`[env] configuration warnings (non-fatal outside production):\n${messages}`);
  }
}

validate();
