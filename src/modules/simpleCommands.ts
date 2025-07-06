import {
    ChatInputCommandInteraction,
    Guild,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";

import { MovieDb } from "moviedb-promise";

import { BotModule } from "../types/BotTypes";

const simpleCommands: BotModule = {
  name: "simpleCommands",
  commands: [
    {
        slashCommand: new SlashCommandBuilder()
            .setName("info")
            .setDescription("Renvoie les informatios du Bot Discord"),
        async execute(client, interaction: ChatInputCommandInteraction) {
            const members = await interaction.guild!.members.fetch();
            const humanCount = members.filter(m => !m.user.bot).size;

            await interaction.reply({
                embeds: [
                    {
                        title: "🧩 Information de Koby",
                        fields: [
                            { name: "Serveurs", value: `${client.guilds.cache.size}`, inline: true },
                            { name: "Membre sur ce serveur", value: `${humanCount}`, inline: true },
                        ],
                        timestamp: new Date().toISOString(),
                        color: 0x00aaff,
                    },
                ],
                flags: MessageFlags.Ephemeral
            })
        }
    },
    {
        slashCommand: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Renvoie Pong !"),
        async execute(client, interaction) {
            await interaction.reply({content: "🏓 Pong !", flags: MessageFlags.Ephemeral})
        }
    },
    {
        slashCommand: new SlashCommandBuilder()
            .setName("film")
            .setDescription("Renvoie un film")
            .addStringOption(option => 
                option.setName("nom")
                .setDescription("Nom du film chercher")
            ),
        async execute(client, interaction)
        {
            const mdb = new MovieDb("71d37b540271bcdf9c61a0137ebf3c64")
            const parameters = {
                query: interaction.options.getString("nom")!,
                language: 'fr' // ISO 639-1 code
            }
            
            mdb.searchMovie(parameters).then((data) => {
                console.log(data.results)
                let text: string = "";
                data.results?.forEach((data) => {
                    text = `${text}## ${data.title} (${data.vote_average})\n`
                })
                interaction.reply({content:text, flags:MessageFlags.Ephemeral})
            })
        }
    }
  ],
  event: [],
};

export default simpleCommands;
