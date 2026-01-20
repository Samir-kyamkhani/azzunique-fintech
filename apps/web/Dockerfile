# -------- BUILDER --------
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

# Copy workspace files
COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
COPY ../../packages ./packages

# Copy web app
COPY . .

# Install deps (only web)
RUN pnpm install --frozen-lockfile --filter web...

# Build Next.js
RUN pnpm --filter web... build


# -------- RUNTIME --------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
