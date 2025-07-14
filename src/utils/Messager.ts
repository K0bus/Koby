import { CommandInteraction, DiscordAPIError, MessageFlags } from 'discord.js';

export class Messager {
  public static async sendWaitingMessage(interaction: CommandInteraction, message: string) {
    if (interaction.replied) {
      await interaction.editReply({
        content: `⏳ ${message}`,
      });
    } else {
      await interaction.reply({
        content: `⏳ ${message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  public static async sendSuccessMessage(interaction: CommandInteraction, message: string) {
    if (interaction.replied) {
      await interaction.editReply({
        content: `✅ ${message}`,
      });
    } else {
      await interaction.reply({
        content: `✅ ${message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  public static async sendErrorMessage(interaction: CommandInteraction, message: string) {
    if (interaction.replied) {
      await interaction.editReply({
        content: `❌ ${message}`,
      });
    } else {
      await interaction.reply({
        content: `❌ ${message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  public static async sendAPIError(interaction: CommandInteraction, reason: DiscordAPIError) {
    if ('message' in reason.rawError) {
      await this.sendErrorMessage(interaction, `Discord Error : ${reason.rawError.message}`);
    } else {
      await this.sendErrorMessage(interaction, `Discord Error : Unknown`);
    }
  }
}
