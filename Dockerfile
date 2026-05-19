FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Installer les dépendances
RUN npm ci --omit=optional

# Copier le code source
COPY . .

# Générer le client Prisma et construire l'app
RUN npx prisma generate && npm run build

# Stage de production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Installer uniquement les dépendances de prod
RUN npm ci --omit=dev --omit=optional

# Copier le Prisma client et la migration depuis le builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/build ./build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "-e", "import('./build/index.js')"]
