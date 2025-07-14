import { BotEvent } from '../../../types/BotTypes';
import { Events, GuildChannel } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendEmbed } from '../../services/modlog-service';

export const modlogChanneldelete: BotEvent = {
  eventType: Events.ChannelDelete,
  async execute(client, channel: GuildChannel) {
    if (!channel.guild) return;
    const config = await new ModLogConfigManager(channel.guild.id).get();
    const logChannel = channel.guild.channels.cache.get(config.channelId);
    if (logChannel?.isTextBased()) {
      await sendEmbed(
        logChannel,
        '🔥 Channel supprimé',
        `#${channel.name ? channel.name : 'Inconnu'}`,
        [],
        0xe74c3c
      );
    }
  },
  once: false,
};
