import { WelcomeConfigManager } from '../config/managers/welcome-config';
import { AutoVoiceConfigManager } from '../config/managers/autovoice-config';
import { AutoRoleConfigManager } from '../config/managers/autorole-config';
import { CounterConfigManager } from '../config/managers/counter-config';
import { AutomodConfigManager } from '../config/managers/automod-config';
import { ModLogConfigManager } from '../config/managers/modlog-config';

/**
 * Initializes all fallback configurations for a guild if they do not already exist in the database.
 */
export async function initializeGuildConfig(guildId: string): Promise<void> {
  const managers = [
    new WelcomeConfigManager(guildId),
    new AutoVoiceConfigManager(guildId),
    new AutoRoleConfigManager(guildId),
    new CounterConfigManager(guildId),
    new AutomodConfigManager(guildId),
    new ModLogConfigManager(guildId),
  ];

  // We call .get() on all managers. This reads the database. If not found, it writes/saves the fallback values.
  await Promise.all(managers.map((manager) => manager.get()));
}
