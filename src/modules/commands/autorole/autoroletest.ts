import {
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { BotCommand } from '../../../types/BotTypes';
import { mainAutoRole } from '../../services/autorole-service';

export const autoroletestCommand: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('autoroletest')
    .setDescription('Test your autorole configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const member = <GuildMember>interaction.member!;
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply("❌ You don't have the permission to use this command !");
      return;
    }
    await mainAutoRole(member);
    await interaction.reply({
      content: '✅ Autoroles test done !',
      flags: MessageFlags.Ephemeral,
    });
  },
};
