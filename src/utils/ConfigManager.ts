import fs from "fs";
import path from "path";
import { ModuleConfig } from "../types/ModuleConfig";

const basePath = path.join(__dirname, "../../config");

export class ConfigManager {
    static getConfig<T extends ModuleConfig>(moduleName: string, guildId?: string): T {
        const defaultPath = path.join(basePath, "guilds_default", `${moduleName}.json`);
        const guildPath = guildId ? path.join(basePath, "guilds", guildId, `${moduleName}.json`) : null;

        if (guildPath && fs.existsSync(guildPath)) {
            const raw = fs.readFileSync(guildPath, "utf-8");
            return JSON.parse(raw) as T;
        }

        if (fs.existsSync(defaultPath)) {
            return JSON.parse(fs.readFileSync(defaultPath, "utf-8")) as T;
        }

        throw new Error(`Configuration introuvable pour le module "${moduleName}"`);
    }

    static saveConfig<T extends ModuleConfig>(moduleName: string, guildId: string | undefined, config: string): void {
        if(guildId){
            const folder = path.join(basePath, guildId);
            if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

            const filePath = path.join(folder, `${moduleName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
        }
    }
}