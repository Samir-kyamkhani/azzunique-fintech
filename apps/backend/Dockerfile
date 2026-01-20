FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ./
COPY ../../packages ./packages
COPY . .

RUN pnpm install --frozen-lockfile --filter backend...

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]
