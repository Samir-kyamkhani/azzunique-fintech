FROM node:20-alpine

WORKDIR /app
RUN corepack enable

# Copy deps + lockfile
COPY package.json ./
RUN pnpm install

# Copy source
COPY . .

# Build Next.js
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
