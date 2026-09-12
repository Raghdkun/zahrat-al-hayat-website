import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { loginSchema, roleSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Valid-format bcrypt hash used to equalize response timing when an account
// does not exist (mitigates user-enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", 12);

export const authConfig: NextAuthConfig = {
  // Self-hosted behind an nginx reverse proxy: trust the forwarded Host /
  // X-Forwarded-Proto headers. Without this, Auth.js v5 rejects the proxied
  // host in production (NODE_ENV=production) and login fails with
  // `error=Configuration`. (In dev trustHost defaults to true.)
  trustHost: true,
  // Resolve the same secret Auth.js and the proxy both use (AUTH_SECRET is the
  // v5 name; NEXTAUTH_SECRET is the legacy fallback this project ships with).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    // Locale-less paths: the next-intl proxy redirects these to the visitor's
    // locale (/ar/... or /en/...), so auth pages don't force Arabic on English
    // users. Both pages exist under app/[locale]/auth/.
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const role = roleSchema.safeParse((user as { role?: unknown }).role);
        token.role = role.success ? role.data : "STUDENT";
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Only ever expose a valid role.
        const role = roleSchema.safeParse(token.role);
        (session.user as unknown as { role: string }).role = role.success
          ? role.data
          : "STUDENT";
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Throttle credential stuffing / brute force by IP + email.
        const ip = request ? getClientIp(request) : "unknown";
        const rl = rateLimit({
          key: `login:${ip}:${email.toLowerCase()}`,
          limit: 10,
          windowMs: 15 * 60_000,
        });
        if (!rl.ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          // Equalize timing whether or not the account exists.
          await bcrypt.compare(password, DUMMY_HASH);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
