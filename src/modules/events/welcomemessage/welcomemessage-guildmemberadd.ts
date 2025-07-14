import { BotEvent } from '../../../types/BotTypes';
import { Events, GuildMember } from 'discord.js';
import { sendWelcome } from '../../services/welcomemessage-service';

export const welcomemessageGuildmemberadd: BotEvent = {
  eventType: Events.GuildMemberAdd,
  async execute(client, member: GuildMember) {
    await sendWelcome(member);
  },
  once: false,
};
