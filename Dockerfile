# Étape 1 : build TypeScript
FROM node:22-alpine AS build

WORKDIR /app

# Copie des fichiers de configuration et de code
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY config ./config

# Installation des dépendances
RUN npm ci

# Étape 2 : image finale allégée
FROM node:22-alpine

WORKDIR /app

# Copie uniquement ce qui est nécessaire pour exécuter
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/config ./config

# Lancement du bot
CMD ["npm", "run", "dev"]