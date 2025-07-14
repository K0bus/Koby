import { BotEvent } from '../../../types/BotTypes';
import { Events, GuildBan } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendUnbanEmbed } from '../../services/modlog-service';

export const modlogGuildbanremove: BotEvent = {
  eventType: Events.GuildBanRemove,
  async execute(client, ban: GuildBan) {
    const config = await new ModLogConfigManager(ban.guild.id).get();
    const channel = ban.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) await sendUnbanEmbed(channel, ban);
  },
  once: false,
};
