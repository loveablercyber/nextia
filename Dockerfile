# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration
COPY package.json package-lock.json ./

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Compila o frontend TypeScript + Vite
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN apk add --no-cache postgresql-client

# Copy compiled dist, all server runtime modules, database schemas, scripts, and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js /app/app-api.js /app/crm-api.js /app/automation-api.js /app/automation-engine.js /app/automation-core.js /app/ai-service.js /app/operational-guards.js /app/project-operations.js /app/seo-routing.js /app/content-management.js /app/customer-success.js ./
COPY --from=builder /app/database ./database
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

CMD ["npm", "start"]
