FROM node:20-alpine

WORKDIR /app

# 🔴 THIS LINE WAS MISSING (MOST IMPORTANT)
RUN apk add --no-cache curl wget

RUN corepack enable

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
