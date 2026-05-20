# ===== BUILD STAGE =====
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json vite.config.ts svelte.config.js ./

RUN npm install

# VITE_API_URL must be baked in at build time: Vite replaces import.meta.env.VITE_*
# at compile time, not at runtime. Railway passes service variables as build args.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY src ./src
COPY public ./public

# adapter-node outputs to build/
RUN npm run build


# ===== PRODUCTION STAGE =====
FROM node:22-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# adapter-node outputs to build/, not dist/
COPY --from=builder /app/build ./build

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000;require('http').get('http://localhost:'+p,r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

# adapter-node entry point (not "node build" — that runs the directory, not the file)
CMD ["node", "build/index.js"]
