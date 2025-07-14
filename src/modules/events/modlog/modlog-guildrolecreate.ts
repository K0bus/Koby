import { BotEvent } from '../../../types/BotTypes';
import { Events, Role } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendEmbed } from '../../services/modlog-service';

export const modlogGuildrolecreate: BotEvent = {
  eventType: Events.GuildRoleCreate,
  async execute(client, role: Role) {
    const config = await new ModLogConfigManager(role.guild.id).get();
    const channel = role.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await sendEmbed(channel, '🎭 Rôle créé', `Rôle: <@&${role.id}>`, [], 0x9b59b6);
    }
  },
  once: false,
};
