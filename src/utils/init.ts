import fs from "fs";
import path from "path";

const configPath = path.resolve(__dirname, "../config");
const botsDefault = path.join(configPath, "bots_default.json");
const botsFile = path.join(configPath, "bots.json");

const guildsPath = path.join(configPath, "guilds");
const defaultSource = path.resolve(__dirname, "../config/guilds_default");
const defaultTarget = path.join(guildsPath, "default");

export function initConfig() {
    // ✅ Copier bots_default.json → bots.json si manquant
    if (!fs.existsSync(botsFile)) {
        fs.copyFileSync(botsDefault, botsFile);
        console.log("✅ Fichier bots.json initialisé depuis bots_default.json");
    }

    // ✅ Créer le dossier guilds s'il n'existe pas
    if (!fs.existsSync(guildsPath)) {
        fs.mkdirSync(guildsPath, { recursive: true });
    }

    // ✅ (Ré)écriture du dossier default uniquement
    if (fs.existsSync(defaultTarget)) {
        fs.rmSync(defaultTarget, { recursive: true, force: true });
    }

    fs.cpSync(defaultSource, defaultTarget, { recursive: true });
    console.log("✅ Dossier guilds/default mis à jour");
}