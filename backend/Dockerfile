# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY src ./src/

RUN npm install

# Generate Prisma client (schema has no url; prisma.config.ts supplies the adapter at runtime)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
COPY package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install production dependencies (includes prisma CLI for db push at startup)
RUN npm install --only=production

# Copy generated Prisma client from builder (prisma generate output lives in .prisma/client)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist/

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# Sync schema to DB on every start (no-op if already up to date), then launch
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
