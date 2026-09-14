# Deployment

Production runs on a single VPS at **`/srv/zahrat-al-hayat`**.

**Architecture**

```
Internet ──► host nginx (TLS, /etc/nginx/sites-available/zahratalhayat.online)
                 └─► 127.0.0.1:3001 ──► docker: app (Next.js standalone, non-root)
                                         docker: postgres 16
                                         docker: migrate (one-shot, exits)
```

nginx runs on the **host** (apt package), not in Docker. The app container is
bound to loopback only and is never exposed publicly.

## 1. Environment
Secrets live in `/srv/zahrat-al-hayat/.env` (git-ignored, never committed).
Required:

```bash
# Database (compose reads these; DATABASE_URL must match them)
POSTGRES_USER=zahrat
POSTGRES_PASSWORD=<strong password>
POSTGRES_DB=zahrat_al_hayat
DATABASE_URL=postgresql://zahrat:<same password>@postgres:5432/zahrat_al_hayat

# Auth (required — app refuses to boot on a missing/placeholder secret)
NEXTAUTH_SECRET=<min 32 chars: openssl rand -base64 32>   # AUTH_SECRET also works
NEXTAUTH_URL=https://zahratalhayat.online
NEXT_PUBLIC_APP_URL=https://zahratalhayat.online

# Optional — email. If unset, emails are skipped (never crashes).
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Optional — Stripe. Booking currently completes via WhatsApp, so leave blank.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

`trustHost: true` is set in `lib/auth.ts`, so running behind nginx needs no
`AUTH_TRUST_HOST`.

## 2. Deploy / update
```bash
cd /srv/zahrat-al-hayat
git pull origin production-readiness
docker compose up -d --build
docker compose ps
```
Order is automatic: postgres healthy → `migrate` applies Prisma migrations and
exits → `app` starts and must pass its healthcheck.

> **Low-memory host:** this VPS has 3.8 GB RAM. `next build` needs headroom —
> keep the 4 GB swap file enabled (`free -h` should show swap). Without it the
> build can wedge the machine. Prune build cache occasionally:
> `docker builder prune -af` and `docker image prune -af`.
> **Never** use `docker system prune --volumes` — it would delete the Postgres
> data volume.

## 3. Create / reset the admin login
Re-seeding will **not** reset an existing password (the seed upserts with an
empty update). Use the dedicated script via the `migrate` image, which has the
full `node_modules`:
```bash
docker compose run --rm \
  -e ADMIN_EMAIL='admin@zahrat-alhayat.com' -e ADMIN_PASSWORD='<strong password>' \
  migrate node node_modules/tsx/dist/cli.mjs prisma/set-admin-password.ts
```
Creates the admin if missing, resets the password if it exists. Then sign in at
`/ar/auth/login`.

## 4. First-run content
In the dashboard (الإعدادات): set the **WhatsApp number** — the booking CTA
depends on it — then upload the logo and real images.

## 5. Health checks
```bash
docker compose ps                       # app should be "healthy"
docker compose logs --tail=50 app
curl -sI https://zahratalhayat.online/ar | head -1
```

## 6. Backups
```bash
docker compose exec postgres \
  pg_dump -U "${POSTGRES_USER:-zahrat}" zahrat_al_hayat > backup-$(date +%F).sql
```

## Notes
- **Payments:** disabled; booking hands off to WhatsApp. To re-enable Stripe,
  set real `STRIPE_*` keys and re-wire the booking confirm step.
- **Rate limiting** is in-memory (per instance) — fine for a single container.
- **Uploads** persist in the `uploads` volume mounted at `/app/public/uploads`.
