import { Events, GuildMember } from 'discord.js';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';
import { BotEvent } from '../../../types/BotTypes';
import { sendEmbed } from '../../services/modlog-service';

export const modlogGuildmemberadd: BotEvent = {
  eventType: Events.GuildMemberAdd,
  async execute(client, member: GuildMember) {
    const config = await new ModLogConfigManager(member.guild.id).get();
    const channel = member.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await sendEmbed(channel, '➕ Nouveau membre', `<@${member.id}> a rejoint.`, [], 0x57f287);
    }
  },
  once: false,
};
