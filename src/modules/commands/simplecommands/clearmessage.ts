import { BotCommand } from '../../../types/BotTypes';
import {
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  GuildMember,
  TextChannel,
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { Messager } from '../../../utils/Messager';

function parseDuration(durationStr: string): number | null {
  const match = durationStr.trim().match(/^(\d+)\s*(s|m|h|d|j|w)?$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'm').toLowerCase();
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
    case 'j':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

export const clearmessage: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('clearmessage')
    .setDescription("Supprimer les messages d'un membre sur une durée définie")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addUserOption((option) =>
      option
        .setName('membre')
        .setDescription('Le membre dont les messages seront supprimés')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duree')
        .setDescription('La durée de recherche (ex: 1h, 12h, 2d, 30m)')
        .setRequired(true)
    ),
  async execute(client, interaction: ChatInputCommandInteraction) {
    await Messager.sendWaitingMessage(interaction, 'Suppression des messages en cours...');
    const member = <GuildMember>interaction.member;
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      await Messager.sendErrorMessage(interaction, "Vous n'avez pas les permissions nécessaires");
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await Messager.sendErrorMessage(
        interaction,
        'Cette commande doit être utilisée dans un serveur.'
      );
      return;
    }

    const targetUser = interaction.options.getUser('membre', true);
    const targetMember = interaction.options.getMember('membre') as GuildMember | null;

    if (targetMember) {
      if (targetMember.id === guild.ownerId) {
        await Messager.sendErrorMessage(
          interaction,
          'Vous ne pouvez pas supprimer les messages du propriétaire du serveur.'
        );
        return;
      }

      if (interaction.user.id !== guild.ownerId) {
        if (member.roles.highest.position <= targetMember.roles.highest.position) {
          await Messager.sendErrorMessage(
            interaction,
            "Vous ne pouvez pas supprimer les messages d'un membre ayant un rôle supérieur ou égal au vôtre."
          );
          return;
        }
      }
    }

    const durationStr = interaction.options.getString('duree', true);
    const durationMs = parseDuration(durationStr);

    if (durationMs === null) {
      await Messager.sendErrorMessage(
        interaction,
        'Format de durée invalide. Exemples : 30m (minutes), 2h (heures), 1d (jours).'
      );
      return;
    }

    const cutoffTime = Date.now() - durationMs;
    // bulkDelete can only delete messages under 14 days old
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const effectiveCutoffTime = Math.max(cutoffTime, fourteenDaysAgo);
    const capped = cutoffTime < fourteenDaysAgo;

    let totalDeleted = 0;
    let processedChannelsCount = 0;

    try {
      const channels = await guild.channels.fetch();
      const textChannels: TextChannel[] = [];

      for (const channel of channels.values()) {
        if (channel && channel.isTextBased() && !channel.isThread()) {
          const textChannel = channel as TextChannel;
          const botMember = guild.members.me;
          if (!botMember) continue;
          const permissions = textChannel.permissionsFor(botMember);
          if (
            permissions &&
            permissions.has([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages,
            ])
          ) {
            textChannels.push(textChannel);
          }
        }
      }

      for (const channel of textChannels) {
        let beforeMessageId: string | undefined = undefined;
        let fetchMore = true;
        // Limit to 3 fetches (300 messages) per channel to avoid API rate limit bottlenecks
        let fetchCount = 0;

        while (fetchMore && fetchCount < 3) {
          const options: { limit: number; before?: string } = { limit: 100 };
          if (beforeMessageId) {
            options.before = beforeMessageId;
          }

          const messages = await channel.messages.fetch(options).catch((err) => {
            console.error(`Erreur de fetch dans le salon ${channel.name}:`, err);
            return null;
          });

          if (!messages || messages.size === 0) {
            break;
          }

          fetchCount++;
          const messagesToDelete: Message[] = [];
          let oldestInChunk: Message | null = null;

          for (const msg of messages.values()) {
            if (!oldestInChunk || msg.createdTimestamp < oldestInChunk.createdTimestamp) {
              oldestInChunk = msg;
            }

            if (msg.createdTimestamp < effectiveCutoffTime) {
              fetchMore = false;
              continue;
            }

            if (msg.author.id === targetUser.id) {
              messagesToDelete.push(msg);
            }
          }

          if (messagesToDelete.length > 0) {
            try {
              const deleted = await channel.bulkDelete(messagesToDelete, true);
              totalDeleted += deleted.size;
            } catch (err) {
              console.error(`Erreur de suppression dans le salon ${channel.name}:`, err);
            }
          }

          if (oldestInChunk) {
            beforeMessageId = oldestInChunk.id;
            if (oldestInChunk.createdTimestamp < effectiveCutoffTime) {
              fetchMore = false;
            }
          } else {
            fetchMore = false;
          }
        }
        processedChannelsCount++;
      }

      let successMsg = `Suppression terminée. ${totalDeleted} messages de ${targetUser.tag} supprimés dans ${processedChannelsCount} salons.`;
      if (capped) {
        successMsg += `\n⚠️ Remarque : Discord limite la suppression en masse aux messages de moins de 14 jours. La recherche a été limitée à 14 jours.`;
      }
      await Messager.sendSuccessMessage(interaction, successMsg);
    } catch (error: any) {
      console.error('Erreur globale clearmessage :', error);
      await Messager.sendErrorMessage(
        interaction,
        `Une erreur est survenue lors de la suppression.`
      );
    }
  },
};
