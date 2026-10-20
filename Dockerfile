# Stage 1: Build
FROM node:20-alpine AS builder

# better-sqlite3 在 alpine(musl) 無預編譯二進位，需原始碼編譯 → 補 node-gyp 必要工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
