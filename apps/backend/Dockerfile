FROM node:20-alpine

WORKDIR /app

# ✅ REQUIRED for Coolify healthcheck
RUN apk add --no-cache curl

RUN corepack enable

# Copy only backend files
COPY package.json ./

# Install deps using package.json
RUN pnpm install

# Copy source code
COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]
