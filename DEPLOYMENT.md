# Deployment

Production runs via `docker-compose.prod.yml`: **postgres**, a one-shot **migrate** job, the **app** (Next.js standalone, non-root), and **nginx** (TLS termination + reverse proxy). Only nginx is published on `80`/`443`; the app is internal.

## 1. Prerequisites
- A server with Docker + Docker Compose v2.
- A domain pointed at the server.
- TLS certs at `./certs/fullchain.pem` and `./certs/privkey.pem` (see step 4).

## 2. Configure environment
```bash
cp .env.production.example .env
```
Fill in **at minimum**:
- `POSTGRES_PASSWORD` — strong password
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` — `https://your-domain.com`

Optional: `RESEND_API_KEY` (emails), `STRIPE_*` (leave blank — booking uses WhatsApp), `SEED_*_PASSWORD` (only if seeding).

The app **fails fast** at startup if a required value is missing or a placeholder.

> `NEXT_PUBLIC_*` values are read at runtime here (server-side), so `.env` is sufficient. If you later add client-side use of a `NEXT_PUBLIC_*` var, it must be present at **build** time (pass it as a build arg).

## 3. Build & start
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Order is automatic: postgres becomes healthy → `migrate` runs `prisma migrate deploy` (applies all migrations incl. the partial unique index) and exits → `app` starts and passes its healthcheck → `nginx` starts.

Check status / logs:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

## 4. TLS certificates
Place certs at `./certs/fullchain.pem` and `./certs/privkey.pem` (nginx mounts `./certs` read-only). With Let's Encrypt/certbot, the ACME webroot is mounted at `./certbot/www`; issue once, then reload nginx:
```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 5. First-run data (optional)
Seed baseline users/content (uses `SEED_*_PASSWORD` from `.env`):
```bash
docker compose -f docker-compose.prod.yml run --rm migrate npm run db:seed
```
Then, in the dashboard (Settings → الإعدادات): set the **WhatsApp number** (required for the booking CTA), upload the logo and real images, and review the homepage stats so they reflect reality.

## 6. Update / redeploy
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
New migrations apply automatically via the `migrate` job on each deploy.

## 7. Backups
Dump the database regularly, e.g.:
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U "${POSTGRES_USER:-postgres}" zahrat_al_hayat > backup-$(date +%F).sql
```

## Notes
- **Payments:** disabled; booking hands off to WhatsApp. To enable Stripe later, set real `STRIPE_*` keys and re-wire the booking confirm step.
- **Rate limiting** is in-memory (per instance). Running multiple `app` replicas needs a shared store (Redis); a single instance is fine as-is.
- **Uploads** are written to `public/uploads` inside the container. For persistence across redeploys, mount a volume there or move to object storage/CDN.
