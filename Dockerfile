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

# Copy compiled dist, server logic, and database schemas
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/app-api.js ./app-api.js
COPY --from=builder /app/database ./database

EXPOSE 3000

CMD ["node", "server.js"]
