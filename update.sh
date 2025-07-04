#!/bin/bash

# Script de mise à jour automatique pour Koby Bot
# Ce script peut être utilisé avec un cron job pour des mises à jour automatiques

set -e

# Configuration
PROJECT_DIR="/path/to/your/bot"  # Changez ce chemin
LOG_FILE="$PROJECT_DIR/logs/update.log"
LOCK_FILE="$PROJECT_DIR/.update.lock"

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[ERROR] $1" | tee -a "$LOG_FILE"
}

# Vérifier si une mise à jour est déjà en cours
check_lock() {
    if [ -f "$LOCK_FILE" ]; then
        error "Une mise à jour est déjà en cours (fichier de verrou présent)"
        exit 1
    fi
}

# Créer le fichier de verrou
create_lock() {
    echo $$ > "$LOCK_FILE"
}

# Supprimer le fichier de verrou
remove_lock() {
    rm -f "$LOCK_FILE"
}

# Fonction de nettoyage en cas d'erreur
cleanup() {
    remove_lock
    error "Mise à jour échouée"
    exit 1
}

# Piège pour nettoyer en cas d'erreur
trap cleanup ERR

# Fonction principale
main() {
    log "Début de la vérification des mises à jour"

    # Vérifier le verrou
    check_lock

    # Créer le verrou
    create_lock

    # Aller dans le dossier du projet
    cd "$PROJECT_DIR"

    # Vérifier s'il y a des mises à jour
    git fetch origin main

    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    if [ "$LOCAL" = "$REMOTE" ]; then
        log "Aucune mise à jour disponible"
        remove_lock
        exit 0
    fi

    log "Mise à jour disponible, démarrage du processus..."

    # Exécuter le script de déploiement
    ./deploy.sh deploy

    log "Mise à jour terminée avec succès"

    # Supprimer le verrou
    remove_lock
}

# Créer le dossier de logs s'il n'existe pas
mkdir -p "$(dirname "$LOG_FILE")"

# Exécuter la fonction principale
main