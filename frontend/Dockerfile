# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY svelte.config.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN pnpm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json* ./

# Install production dependencies only
RUN npm install --only=production

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application using Vite preview
CMD ["pnpm", "run", "preview"]
