FROM node:22-alpine AS base

# Dependencies.
# Node 22+ is required: @prisma/streams-local, camera-controls and sanitize-html
# all declare engines >= 22 (see "engines" in package.json).
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Migration runner — full node_modules, no app build needed. Kept as its own
# stage (rather than reusing "builder") so a memory-constrained host doesn't pay
# for two `npm run build`s. Compose runs this once before the app starts.
FROM base AS migrate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN node node_modules/prisma/build/index.js generate
CMD ["node", "node_modules/prisma/build/index.js", "migrate", "deploy"]

# Build the Next.js app.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node node_modules/prisma/build/index.js generate
RUN npm run build

# Production image — standalone output, non-root. Migrations do NOT run here.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Writable uploads dir owned by the runtime user (a mounted volume inherits this
# ownership on first use, so /api/upload can write as `nextjs`).
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
