import { BotCommand } from '../../../types/BotTypes';
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const info: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Renvoie les informatios du Bot Discord'),
  async execute(client, interaction: ChatInputCommandInteraction) {
    const members = await interaction.guild!.members.fetch();
    const humanCount = members.filter((m) => !m.user.bot).size;

    await interaction.reply({
      embeds: [
        {
          title: '🧩 Information de Koby',
          fields: [
            { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Membre sur ce serveur', value: `${humanCount}`, inline: true },
          ],
          timestamp: new Date().toISOString(),
          color: 0x00aaff,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
