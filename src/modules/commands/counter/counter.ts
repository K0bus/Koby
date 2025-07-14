import { BotCommand } from '../../../types/BotTypes';
import {
  ChatInputCommandInteraction,
  Client,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { refreshCounter } from '../../services/counter-service';

export const counterCommand: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('counter')
    .setDescription('Refresh your actual member counter if enabled !')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts(InteractionContextType.Guild),
  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    if (interaction.guild != null) {
      await refreshCounter(interaction.guild, client).then(async (r) => {
        if (r === true) {
          await interaction.reply({
            content: '✅ Member counter refreshed successfully !',
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: '❌ Error while refreshing member counter :' + r,
            flags: MessageFlags.Ephemeral,
          });
        }
      });
    }
  },
};
