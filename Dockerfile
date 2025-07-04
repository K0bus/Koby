# Étape 1 : build en TypeScript
FROM node:22-alpine AS builder

WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

# Étape 2 : exécution
FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --omit=dev

ENV NODE_ENV=production
CMD ["node", "./dist/index.js"]