# Stage 1: Build
FROM node:24-bookworm-slim AS builder

# better-sqlite3 v13 無預編譯二進位 → node-gyp 原始碼編譯需要 python3/make/g++
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
