# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY svelte.config.js ./

RUN npm install

COPY src ./src
COPY public ./public

RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json* ./

RUN npm install --only=production

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "build"]
