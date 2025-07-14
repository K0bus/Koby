import { Events, GuildMember } from 'discord.js';
import { ModLogConfig, ModLogConfigManager } from '../../../config/managers/modlog-config';
import { sendEmbed } from '../../services/modlog-service';
import { BotEvent } from '../../../types/BotTypes';

export const modlogGuildmemberremove: BotEvent = {
  eventType: Events.GuildMemberRemove,
  async execute(client, member: GuildMember) {
    const config: ModLogConfig = await new ModLogConfigManager(member.guild.id).get();
    const channel = member.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await sendEmbed(
        channel,
        '➖ Membre parti',
        `<@${member.id}> a quitté ou a été kick.`,
        [],
        0xed4245
      );
    }
  },
  once: false,
};
