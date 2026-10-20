# Stage 1: Build
FROM node:20-bookworm-slim AS builder

# glibc 映像：better-sqlite3 直接下載預編譯二進位（免 python/make）

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
