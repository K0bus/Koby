import { BotCommand } from '../../../types/BotTypes';
import {
  ChatInputCommandInteraction,
  Client,
  GuildChannel,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Messager } from '../../../utils/Messager';
import { AutomodConfigManager } from '../../../config/managers/automod-config';

export const automod: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configuration du module Automod avancé')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup((group) =>
      group
        .setName('channel')
        .setDescription('Configuration du salon des logs')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('set')
            .setDescription('Définir le salon de log pour les alertes automod')
            .addChannelOption((option) =>
              option
                .setName('salon')
                .setDescription('Le salon textuel pour les logs')
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Activer/Désactiver un filtre')
        .addStringOption((option) =>
          option
            .setName('filtre')
            .setDescription('Le filtre à basculer')
            .setRequired(true)
            .addChoices(
              { name: 'Badwords (Vulgarités)', value: 'badwords' },
              { name: 'Cross-Spam (Anti-spam multi-salons)', value: 'crossspam' }
            )
        )
    ),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    const guildId = interaction.guildId;
    if (!guildId) {
      await Messager.sendErrorMessage(
        interaction,
        'Cette commande doit être exécutée dans un serveur.'
      );
      return;
    }

    const configManager = new AutomodConfigManager(guildId);
    const config = await configManager.get();

    // /automod channel set <#salon>
    if (subcommandGroup === 'channel' && subcommand === 'set') {
      const channel = interaction.options.getChannel('salon', true) as GuildChannel;
      if (!channel.isTextBased()) {
        await Messager.sendErrorMessage(
          interaction,
          'Le salon de logs doit être un salon textuel.'
        );
        return;
      }

      config.modLogChannelId = channel.id;
      await configManager.save(config);

      await Messager.sendSuccessMessage(
        interaction,
        `Le salon de logs d'automod a été défini sur <#${channel.id}>.`
      );
      return;
    }

    // /automod toggle <badwords | crossspam>
    if (subcommand === 'toggle') {
      const filter = interaction.options.getString('filtre', true);

      if (filter === 'badwords') {
        config.badWordsEnabled = !config.badWordsEnabled;
        await configManager.save(config);
        await Messager.sendSuccessMessage(
          interaction,
          `Le filtre de vulgarités (badwords) a été ${config.badWordsEnabled ? 'activé' : 'désactivé'}.`
        );
      } else if (filter === 'crossspam') {
        config.crossSpamEnabled = !config.crossSpamEnabled;
        await configManager.save(config);
        await Messager.sendSuccessMessage(
          interaction,
          `Le filtre anti-spam multi-salons (cross-spam) a été ${config.crossSpamEnabled ? 'activé' : 'désactivé'}.`
        );
      } else {
        await Messager.sendErrorMessage(interaction, 'Filtre inconnu.');
      }
      return;
    }

    await Messager.sendErrorMessage(interaction, 'Sous-commande invalide.');
  },
};
