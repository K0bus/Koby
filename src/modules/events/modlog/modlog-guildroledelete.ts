import { BotEvent } from '../../../types/BotTypes';
import { Events, Role } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendEmbed } from '../../services/modlog-service';

export const modlogGuildRoleDelete: BotEvent = {
  eventType: Events.GuildRoleDelete,
  async execute(client, role: Role) {
    const config = await new ModLogConfigManager(role.guild.id).get();
    const channel = role.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await sendEmbed(channel, '🧹 Rôle supprimé', `Nom du rôle: ${role.name}`, [], 0x95a5a6);
    }
  },
  once: false,
};
