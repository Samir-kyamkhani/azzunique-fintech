# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

# Root workspace files
COPY package.json pnpm-lock.yaml ./

# Web workspace package.json
COPY apps/web/package.json apps/web/package.json

# Install deps
RUN pnpm install --frozen-lockfile

# Copy full repo
COPY . .

# Build Next.js app
WORKDIR /app/apps/web
RUN pnpm build


# ---------- Runner ----------
FROM node:20-alpine

WORKDIR /app
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
