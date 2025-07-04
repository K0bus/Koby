# Makefile pour Koby Bot
# Commandes utiles pour le développement et le déploiement

.PHONY: help install build dev start stop restart logs status clean deploy backup

# Variables
PROJECT_NAME := koby-bot
DOCKER_IMAGE := koby-bot:latest
COMPOSE_FILE := docker-compose.yml

# Commande par défaut
help: ## Afficher l'aide
	@echo "Commandes disponibles pour $(PROJECT_NAME):"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Développement
install: ## Installer les dépendances
	npm install

build: ## Compiler le TypeScript
	npm run build

dev: ## Lancer en mode développement
	npm run dev

register: ## Enregistrer les commandes Discord
	npm run commands:register

# Docker
docker-build: ## Construire l'image Docker
	docker-compose build

docker-up: ## Démarrer les conteneurs
	docker-compose up -d

docker-down: ## Arrêter les conteneurs
	docker-compose down

docker-restart: ## Redémarrer les conteneurs
	docker-compose restart

docker-logs: ## Afficher les logs
	docker-compose logs -f

docker-status: ## Afficher l'état des conteneurs
	docker-compose ps

# Déploiement
deploy: ## Déployer l'application
	chmod +x deploy.sh
	./deploy.sh deploy

start: ## Démarrer l'application
	./deploy.sh start

stop: ## Arrêter l'application
	./deploy.sh stop

restart: ## Redémarrer l'application
	./deploy.sh restart

logs: ## Afficher les logs
	./deploy.sh logs

status: ## Afficher l'état
	./deploy.sh status

# Maintenance
backup: ## Sauvegarder la configuration
	./deploy.sh backup

clean: ## Nettoyer les fichiers temporaires
	./deploy.sh cleanup
	rm -rf node_modules dist logs/*.log

clean-docker: ## Nettoyer les images Docker
	docker system prune -f
	docker volume prune -f

# Configuration
setup: ## Configuration initiale
	@echo "Configuration initiale..."
	@if [ ! -f "config/bots.json" ]; then \
		cp config/bots_default.json config/bots.json; \
		echo "Fichier config/bots.json créé. Veuillez le configurer."; \
	fi
	@if [ ! -f ".env" ]; then \
		cp .env.example .env; \
		echo "Fichier .env créé. Veuillez le configurer."; \
	fi
	@chmod +x deploy.sh update.sh
	@mkdir -p data logs backups
	@echo "Configuration terminée!"

# Tests et validation
lint: ## Vérifier le code TypeScript
	npx tsc --noEmit

test: ## Lancer les tests (à implémenter)
	@echo "Tests non implémentés pour le moment"

validate: ## Valider la configuration
	@echo "Validation de la configuration..."
	@if [ ! -f "config/bots.json" ]; then echo "❌ config/bots.json manquant"; exit 1; fi
	@if [ ! -f ".env" ]; then echo "⚠️  .env manquant (optionnel)"; fi
	@echo "✅ Configuration valide"

# Monitoring
health: ## Vérifier l'état de santé
	@echo "Vérification de l'état de santé..."
	@docker-compose ps | grep -q "Up" && echo "✅ Conteneurs opérationnels" || echo "❌ Problème avec les conteneurs"

monitor: ## Surveiller les ressources
	@echo "Utilisation des ressources:"
	@docker stats --no-stream $(PROJECT_NAME) || echo "Conteneur non démarré"

# Sauvegardes
backup-full: ## Sauvegarde complète
	@echo "Sauvegarde complète..."
	@mkdir -p backups
	@tar -czf backups/backup-$(shell date +%Y%m%d-%H%M%S).tar.gz config data logs
	@echo "Sauvegarde terminée"

restore: ## Restaurer une sauvegarde (usage: make restore BACKUP=backup-file.tar.gz)
	@if [ -z "$(BACKUP)" ]; then echo "Usage: make restore BACKUP=backup-file.tar.gz"; exit 1; fi
	@echo "Restauration de $(BACKUP)..."
	@tar -xzf backups/$(BACKUP)
	@echo "Restauration terminée"

# Mise à jour
update: ## Mettre à jour l'application
	@echo "Mise à jour de l'application..."
	@git pull origin main
	@make deploy
	@echo "Mise à jour terminée"

# Développement avancé
debug: ## Lancer en mode debug
	@echo "Mode debug - consultez les logs en temps réel"
	@docker-compose logs -f

shell: ## Ouvrir un shell dans le conteneur
	@docker-compose exec $(PROJECT_NAME) /bin/sh

# Nettoyage complet
purge: ## Nettoyage complet (ATTENTION: supprime tout)
	@echo "⚠️  ATTENTION: Cette commande va supprimer tous les conteneurs, volumes et images!"
	@read -p "Êtes-vous sûr? (y/N) " -n 1 -r; echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker rmi $(DOCKER_IMAGE) || true; \
		docker system prune -af; \
		echo "Nettoyage terminé"; \
	else \
		echo "Annulé"; \
	fi