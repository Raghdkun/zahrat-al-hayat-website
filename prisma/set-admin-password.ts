/**
 * Create or reset an ADMIN user with a known password.
 *
 * Unlike the seed (which upserts with an empty update and won't touch an
 * existing password), this always sets the password — use it to recover access
 * in production.
 *
 * Usage (locally):
 *   ADMIN_EMAIL=admin@zahrat-alhayat.com ADMIN_PASSWORD='YourStrong1' npm run db:set-admin
 *
 * In Docker (prod) — run via the `migrate` service, which has tsx + Prisma:
 *   docker compose -f docker-compose.prod.yml run --rm \
 *     -e ADMIN_EMAIL='admin@zahrat-alhayat.com' -e ADMIN_PASSWORD='YourStrong1' \
 *     migrate npm run db:set-admin
 */
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@zahrat-alhayat.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "مدير النظام";

  if (!password || password.length < 8) {
    console.error("❌ ADMIN_PASSWORD is required (min 8 characters). Aborting.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.ADMIN },
    create: { name, email, passwordHash, role: Role.ADMIN },
  });

  console.log(`✅ Admin ready — email: ${user.email} (role: ${user.role})`);
  console.log("   You can now log in with the password you provided.");
}

main()
  .catch((e) => {
    console.error("❌ Failed to set admin password:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
