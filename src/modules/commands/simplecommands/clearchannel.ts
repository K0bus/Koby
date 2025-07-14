import { BotCommand } from '../../../types/BotTypes';
import {
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  GuildMember,
  TextChannel,
  DiscordAPIError,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Messager } from '../../../utils/Messager';

export const clearchannel: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('clearchannel')
    .setDescription('Nettoyer le channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addIntegerOption((option) =>
      option.setName('nombre').setDescription('Nombre de message a suprimmer')
    ),
  async execute(client, interaction: ChatInputCommandInteraction) {
    await Messager.sendWaitingMessage(interaction, 'Nettoyage du channel...');
    const member = <GuildMember>interaction.member;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      const channel = interaction.channel;
      const n: number = interaction.options.getInteger('nombre') || 0;
      if (channel?.isTextBased()) {
        await channel.messages.fetch();
        (<TextChannel>channel)
          .bulkDelete(n)
          .then(async () => {
            await Messager.sendSuccessMessage(interaction, 'Channel nettoyé !');
          })
          .catch(async (reason: DiscordAPIError) => {
            await Messager.sendAPIError(interaction, reason);
          });
      } else {
        await Messager.sendErrorMessage(
          interaction,
          'Commande à effectuer dans un channel textuel'
        );
      }
    } else {
      await Messager.sendErrorMessage(interaction, "Vous n'avez pas les permissions nécessaires");
    }
  },
};
