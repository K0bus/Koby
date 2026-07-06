import { BotEvent } from '../../../types/BotTypes';
import { Events, Guild } from 'discord.js';
import { initializeGuildConfig } from '../../../utils/config-init';

export const guildCreate: BotEvent = {
  eventType: Events.GuildCreate,
  async execute(client, guild: Guild) {
    try {
      console.log(`[GuildCreate] Joined guild ${guild.name} (${guild.id}). Initializing configurations...`);
      await initializeGuildConfig(guild.id);
      console.log(`[GuildCreate] Successfully initialized configurations for guild ${guild.name}`);
    } catch (error) {
      console.error(`[GuildCreate] Failed to initialize configurations for guild ${guild.name}:`, error);
    }
  },
  once: false,
};
