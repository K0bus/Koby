# Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app
COPY . .
COPY bots_example.json bots.json

# Installe toutes les dépendances, y compris dev
RUN npm i
RUN npm run build

# Étape 2 : image de prod plus légère
FROM node:22-alpine

WORKDIR /app

# Copie uniquement les fichiers nécessaires
COPY package.json ./
COPY --from=builder /app/dist ./dist

# Installe seulement les dépendances de prod
RUN npm install --omit=dev

ENV NODE_ENV=production
CMD ["node", "./dist/index.js"]
