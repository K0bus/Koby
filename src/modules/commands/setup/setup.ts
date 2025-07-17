import {
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { BotCommand } from '../../../types/BotTypes';
import { mainSetup } from '../../services/setup/setup-service';

export const setupCommand: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure your server for Koby')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const member = <GuildMember>interaction.member!;
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply("❌ You don't have the permission to use this command !");
      return;
    }
    await mainSetup(interaction);
  },
};
