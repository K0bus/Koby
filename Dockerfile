# Étape 1 : Compilation TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers nécessaires à l'installation
COPY package*.json ./
RUN npm ci

# Copie des sources
COPY . .

# Compilation TypeScript
RUN npm run build


# Étape 2 : Conteneur final d'exécution
FROM node:22-alpine

WORKDIR /app

# Copie des fichiers nécessaires à l'exécution
COPY package*.json ./
RUN npm install --omit=dev

# Copie du code compilé uniquement
COPY --from=builder /app/dist ./dist

# Copie des fichiers de configuration par défaut
COPY --from=builder /app/config/bots_default.json ./config/bots.json
COPY --from=builder /app/config/guilds ./config/guilds
COPY --from=builder /app/config/guilds_default ./config/guilds_default

# Configuration d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "run", "start"]