#!/bin/bash

# Script de déploiement pour Koby Bot
# Ce script gère le déploiement initial et les mises à jour

set -e  # Arrêter le script en cas d'erreur

# Configuration
PROJECT_NAME="koby-bot"
DOCKER_IMAGE="koby-bot:latest"
CONTAINER_NAME="koby-bot"
BACKUP_DIR="./backups"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Vérifier que Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé!"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé!"
        exit 1
    fi
}

# Vérifier que Git est installé
check_git() {
    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé!"
        exit 1
    fi
}

# Créer les dossiers nécessaires
create_directories() {
    log "Création des dossiers nécessaires..."
    mkdir -p config data logs scripts backups

    # Créer le fichier de configuration des bots s'il n'existe pas
    if [ ! -f "config/bots.json" ]; then
        log "Création du fichier de configuration des bots..."
        cp config/bots_default.json config/bots.json
        warning "N'oubliez pas de configurer config/bots.json avec vos tokens!"
    fi
}

# Backup de la configuration
backup_config() {
    if [ -f "config/bots.json" ]; then
        log "Sauvegarde de la configuration..."
        mkdir -p "$BACKUP_DIR"
        cp -r config "$BACKUP_DIR/config-$(date +%Y%m%d-%H%M%S)"
        success "Configuration sauvegardée"
    fi
}

# Mise à jour du code source
update_source() {
    log "Mise à jour du code source..."

    # Vérifier si on est dans un repo git
    if [ ! -d ".git" ]; then
        error "Ce n'est pas un dépôt Git!"
        exit 1
    fi

    # Stash les modifications locales
    git stash push -m "Auto-stash avant mise à jour $(date)"

    # Pull les dernières modifications
    git pull origin main

    success "Code source mis à jour"
}

# Construire l'image Docker
build_image() {
    log "Construction de l'image Docker..."
    docker-compose build --no-cache
    success "Image Docker construite"
}

# Arrêter les conteneurs existants
stop_containers() {
    log "Arrêt des conteneurs existants..."
    docker-compose down || true
    success "Conteneurs arrêtés"
}

# Démarrer les conteneurs
start_containers() {
    log "Démarrage des conteneurs..."
    docker-compose up -d
    success "Conteneurs démarrés"
}

# Vérifier l'état des conteneurs
check_containers() {
    log "Vérification de l'état des conteneurs..."
    sleep 5

    if docker-compose ps | grep -q "Up"; then
        success "Les conteneurs sont opérationnels"
        docker-compose ps
    else
        error "Problème avec les conteneurs"
        docker-compose logs --tail=50
        exit 1
    fi
}

# Nettoyage des images Docker inutiles
cleanup_docker() {
    log "Nettoyage des images Docker inutiles..."
    docker image prune -f
    docker container prune -f
    success "Nettoyage terminé"
}

# Afficher les logs
show_logs() {
    log "Affichage des logs récents..."
    docker-compose logs --tail=50 -f
}

# Fonction principale
main() {
    log "Début du déploiement de $PROJECT_NAME"

    # Vérifications préalables
    check_docker
    check_git

    # Créer les dossiers
    create_directories

    # Backup de la configuration
    backup_config

    # Mise à jour du code
    update_source

    # Arrêter les conteneurs
    stop_containers

    # Construire l'image
    build_image

    # Démarrer les conteneurs
    start_containers

    # Vérifier l'état
    check_containers

    # Nettoyage
    cleanup_docker

    success "Déploiement terminé avec succès!"

    # Demander si on veut voir les logs
    echo -e "\n${YELLOW}Voulez-vous voir les logs en temps réel ? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy    Déployer ou mettre à jour l'application"
    echo "  start     Démarrer les conteneurs"
    echo "  stop      Arrêter les conteneurs"
    echo "  restart   Redémarrer les conteneurs"
    echo "  logs      Afficher les logs"
    echo "  status    Afficher l'état des conteneurs"
    echo "  backup    Sauvegarder la configuration"
    echo "  cleanup   Nettoyer les images Docker inutiles"
    echo "  help      Afficher cette aide"
    echo ""
}

# Gestion des arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    start)
        log "Démarrage des conteneurs..."
        docker-compose up -d
        check_containers
        ;;
    stop)
        log "Arrêt des conteneurs..."
        docker-compose down
        success "Conteneurs arrêtés"
        ;;
    restart)
        log "Redémarrage des conteneurs..."
        docker-compose restart
        check_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        docker-compose ps
        ;;
    backup)
        backup_config
        ;;
    cleanup)
        cleanup_docker
        ;;
    help)
        show_help
        ;;
    *)
        error "Option inconnue: $1"
        show_help
        exit 1
        ;;
esac