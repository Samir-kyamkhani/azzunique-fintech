FROM node:20-alpine

WORKDIR /app
RUN corepack enable

# Copy ONLY backend package files
COPY package.json ./
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Install deps (no workspace)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]
