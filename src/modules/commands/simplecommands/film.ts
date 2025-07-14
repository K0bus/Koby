import { BotCommand } from '../../../types/BotTypes';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { MovieDb } from 'moviedb-promise';

export const film: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('film')
    .setDescription('Renvoie un film')
    .addStringOption((option) => option.setName('nom').setDescription('Nom du film chercher')),
  async execute(client, interaction) {
    const mdb = new MovieDb('71d37b540271bcdf9c61a0137ebf3c64');
    const parameters = {
      query: interaction.options.getString('nom')!,
      language: 'fr', // ISO 639-1 code
    };

    await mdb.searchMovie(parameters).then(async (data) => {
      console.log(data.results);
      let text: string = '';
      data.results?.forEach((data) => {
        text = `${text}## ${data.title} (${data.vote_average})\n`;
      });
      await interaction.reply({ content: text, flags: MessageFlags.Ephemeral });
    });
  },
};
