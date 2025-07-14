import { BotCommand } from '../../../types/BotTypes';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const ping: BotCommand = {
  slashCommand: new SlashCommandBuilder().setName('ping').setDescription('Renvoie Pong !'),
  async execute(client, interaction) {
    await interaction.reply({ content: '🏓 Pong !', flags: MessageFlags.Ephemeral });
  },
};
