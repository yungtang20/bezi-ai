# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
RUN apk add --no-cache python3 make g++ \
  && npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=builder /app/packages ./packages
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm ci --omit=dev \
  && apk del .build-deps \
  && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health/ready" >/dev/null || exit 1

CMD ["node", "dist/server.cjs"]
