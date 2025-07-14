import { Client, Events, GuildMember } from 'discord.js';
import { mainAutoRole } from '../../services/autorole-service';
import { BotEvent } from '../../../types/BotTypes';

export const autoroleGuildmemberaddEvent: BotEvent = {
  eventType: Events.GuildMemberAdd,
  async execute(client: Client, member: GuildMember) {
    await mainAutoRole(member);
  },
  once: false,
};
