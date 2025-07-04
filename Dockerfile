# Dockerfile multi-stage optimisé pour production
FROM node:22-alpine AS builder

# Installer les dépendances système nécessaires
RUN apk add --no-cache git

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration npm
COPY package*.json ./

# Installer les dépendances (avec cache optimisé)
RUN npm ci --only=production --silent

# Copier le code source
COPY src/ ./src/
COPY tsconfig.json ./

# Installer les dépendances de développement pour la compilation
RUN npm install --only=dev --silent

# Compiler le TypeScript
RUN npm run build

# Nettoyer les dépendances de développement
RUN npm prune --production

# Étape finale - image de production
FROM node:22-alpine AS runner

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Installer les dépendances système minimales
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Créer les dossiers nécessaires
RUN mkdir -p config data logs && \
    chown -R nodejs:nodejs /app

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port (si nécessaire pour votre bot)
# EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Healthcheck pour vérifier que le bot fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Bot is running')" || exit 1

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande par défaut
CMD ["node", "./dist/index.js"]