import { BotCommand } from '../../../types/BotTypes';
import {
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { sendWelcome } from '../../services/welcomemessage-service';

export const welcometest: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('welcometest')
    .setDescription('Test your Welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const member = <GuildMember>interaction.member!;
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply("You don't have the permission to use this command !");
      return;
    }
    await interaction.reply({
      content: await sendWelcome(member),
      flags: MessageFlags.Ephemeral,
    });
  },
};
