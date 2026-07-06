import { BotCommand } from '../../../types/BotTypes';
import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Messager } from '../../../utils/Messager';
import { initializeGuildConfig } from '../../../utils/config-init';

export const init: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('init')
    .setDescription('Initialise les configurations par défaut du bot pour ce serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await Messager.sendErrorMessage(interaction, 'Cette commande doit être exécutée dans un serveur.');
      return;
    }

    await Messager.sendWaitingMessage(interaction, 'Initialisation des configurations...');

    try {
      await initializeGuildConfig(guildId);
      await Messager.sendSuccessMessage(interaction, 'Les configurations par défaut ont été initialisées avec succès !');
    } catch (error) {
      console.error(`[InitCommand] Error initializing config for guild ${guildId}:`, error);
      await Messager.sendErrorMessage(interaction, "Une erreur est survenue lors de l'initialisation des configurations.");
    }
  },
};
