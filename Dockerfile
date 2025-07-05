# Multi-stage build pour optimiser l'image finale
FROM node:22-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration de package
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci --only=production --silent

# Copier le code source
COPY src ./src

# Compiler TypeScript
RUN npm run build

# Image finale de production
FROM node:22-alpine

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S koby -u 1001

WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copier les fichiers de configuration par défaut
COPY config/guilds/default ./config/guilds/default
COPY config/bots_default.json ./config/bots_default.json

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /app/config/guilds /app/data /app/logs && \
    chown -R koby:nodejs /app

# Script d'initialisation
COPY --chown=koby:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Utiliser l'utilisateur non-root
USER koby

# Variables d'environnement
ENV NODE_ENV=production
ENV TZ=Europe/Paris

# Exposition du port (si nécessaire pour des API futures)
EXPOSE 3000

# Volumes pour la persistance des données
VOLUME ["/app/config", "/app/data", "/app/logs"]

# Point d'entrée
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "./dist/index.js"]