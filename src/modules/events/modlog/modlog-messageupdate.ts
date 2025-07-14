import { BotEvent } from '../../../types/BotTypes';
import { Events, Message, PartialMessage } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { genField, sendEmbed } from '../../services/modlog-service';

export const modlogMessageUpdate: BotEvent = {
  eventType: Events.MessageUpdate,
  async execute(client, oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
    if (client.user && oldMsg.author?.id === client.user.id) return;
    if (!oldMsg.guild || oldMsg.content === newMsg.content) return;
    const config = await new ModLogConfigManager(oldMsg.guild.id).get();
    const channel = oldMsg.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await sendEmbed(
        channel,
        '📝 Message modifié',
        `Auteur: <@${oldMsg.author?.id}>`,
        [
          genField('Avant', oldMsg.content!.slice(0, 1024) || '*vide*'),
          genField('Après', newMsg.content!.slice(0, 1024) || '*vide*'),
        ],
        0xe67e22
      );
    }
  },
  once: false,
};
