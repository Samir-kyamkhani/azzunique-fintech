FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache curl wget
RUN corepack enable

# repo root already = web
COPY . .

# yahin package.json hai
RUN pnpm install
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "run", "start"]
