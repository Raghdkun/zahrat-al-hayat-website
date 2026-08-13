# Project Guidelines

## Code Style
- Use TypeScript across app, API routes, and shared libraries.
- Follow existing component patterns in `components/ui` and route structure in `app/[locale]`.
- Keep changes minimal and localized; do not reformat unrelated files.

## Architecture
- App Router project with locale-prefixed routes under `app/[locale]`.
- Server logic is split between API route handlers in `app/api/*/route.ts` and shared services in `lib/*`.
- Data access uses Prisma with PostgreSQL (`lib/db.ts`, `prisma/schema.prisma`).
- Authentication uses NextAuth v5 beta (`lib/auth.ts`) with credentials and role-aware session data.
- Payments use Stripe (`lib/stripe.ts`, `app/api/payments/*`) and notification side-effects (`lib/notifications.ts`).

## Build and Test
- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`
- Prisma: `npm run db:generate`, `npm run db:migrate`, `npm run db:push`, `npm run db:seed`

## Conventions
- This is NOT the Next.js you know: this repo uses Next.js 16.2.0, so APIs and conventions can differ from older versions.
- Before framework-level changes, read relevant docs in `node_modules/next/dist/docs/` and follow deprecation notices.
- Keep i18n behavior aligned with `next-intl` setup in `i18n/*` and bilingual message files in `messages/*`.
- Preserve RTL/LTR behavior in locale-aware UI (`ar` and `en`) and avoid hardcoding locale assumptions in new code.
- Keep Prisma adapter usage consistent between runtime and scripts to avoid initialization mismatches.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
