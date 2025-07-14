import { BotEvent } from '../../../types/BotTypes';
import { Events, GuildChannel } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendEmbed } from '../../services/modlog-service';

export const modlogChannelCreate: BotEvent = {
  eventType: Events.ChannelCreate,
  async execute(client, channel: GuildChannel) {
    if (!channel.guild) return;
    const config = await new ModLogConfigManager(channel.guild.id).get();
    const logChannel = channel.guild.channels.cache.get(config.channelId);
    if (logChannel?.isTextBased()) {
      await sendEmbed(
        logChannel,
        '📁 Channel créé',
        `#${channel.name ? channel.name : 'Inconnu'}`,
        [],
        0x1abc9c
      );
    }
  },
  once: false,
};
