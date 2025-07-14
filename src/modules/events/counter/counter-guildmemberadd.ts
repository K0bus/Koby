import { BotEvent } from '../../../types/BotTypes';
import { Client, Events, GuildMember } from 'discord.js';
import { refreshCounter } from '../../services/counter-service';

export const counterGuildmemberadd: BotEvent = {
  eventType: Events.GuildMemberAdd,
  async execute(client: Client, member: GuildMember) {
    await refreshCounter(member.guild, client);
  },
  once: false,
};
