# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# App files
COPY --from=build /app /app

# Data directory for SQLite
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
VOLUME ["/app/data"]

USER appuser

HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 CMD node src/scripts/healthcheck.js || exit 1

ENTRYPOINT ["/app/src/scripts/watchdog.sh"]


