# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Install dependencies
RUN npm install

# Provide a dummy URL so prisma generate can parse the schema without a live DB
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Generate Prisma client (required before tsc)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm install --only=production

# Copy built application
COPY --from=builder /app/dist ./dist/

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
