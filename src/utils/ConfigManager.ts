import fs from 'fs';
import path from 'path';
import { ModuleConfig } from '../types/ModuleConfig';
import { GuildSettingsService } from '../db';
import { GuildSetting } from '@prisma/client';

export class ConfigManager {
  static async getConfig<T extends ModuleConfig>(moduleName: string, guildId?: string): Promise<T> {
    console.log(`[${guildId}] Loading config for module ${moduleName}`);
    const setting: GuildSetting | null = await GuildSettingsService.get(guildId ?? '', moduleName);
    console.log(`[${guildId}] Config for module ${moduleName} loaded`);
    if (setting) {
      return setting.settingValue as T;
    } else {
      const basePath = path.join(
        __dirname.replace('dist/', ''),
        '../../config',
        'guilds_default',
        `${moduleName}.json`
      );
      if (fs.existsSync(basePath)) {
        const jsonSetting: T = JSON.parse(fs.readFileSync(basePath, 'utf-8')) as T;
        await GuildSettingsService.set(guildId ?? '', moduleName, jsonSetting);
        return jsonSetting;
      }
    }
    throw new Error(`Configuration introuvable pour le module "${moduleName}"`);
  }
}
