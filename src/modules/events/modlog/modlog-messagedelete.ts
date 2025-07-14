import { BotEvent } from '../../../types/BotTypes';
import { Events, Message, PartialMessage } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { genField, sendEmbed } from '../../services/modlog-service';

export const modlogMessageDelete: BotEvent = {
  eventType: Events.MessageDelete,
  async execute(client, message: Message | PartialMessage) {
    if (client.user && message.author?.id === client.user.id) return;
    if (!message.guild) return;
    const config = await new ModLogConfigManager(message.guild.id).get();
    const channel = message.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      const content = message.content || '*Contenu inconnu*';
      await sendEmbed(
        channel,
        '🗑️ Message supprimé',
        `Auteur: <@${message.author?.id}>`,
        [genField('Contenu', content.slice(0, 1024))],
        0xf1c40f
      );
    }
  },
  once: false,
};
