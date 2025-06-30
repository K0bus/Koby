import { Client, Events } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { BotCommand, BotEvent, BotModule } from "../types/BotTypes";

export function loadModules(client: Client) {
    const foldersPath = path.join(__dirname, "../modules");
    const moduleFile = readdirSync(foldersPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of moduleFile) {
            const eventPath = path.join(foldersPath, file);
            const imported = require(eventPath);

            const module: BotModule = imported.default ?? imported;
            
            module.event.forEach((event:BotEvent) => {
                if (event.once) {
                    client.once(event.eventType, (...args) => event.execute(client, ...args));
                } else {
                    client.on(event.eventType, (...args) => event.execute(client, ...args));
                }
            });

            module.commands.forEach((command:BotCommand) => {
                client.on(Events.InteractionCreate, async interaction => {
                    if (!interaction.isChatInputCommand()) return;
                    if(interaction.commandName != command.slashCommand.toJSON().name) return;
                    try {
                        await command.execute(client, interaction);
                    } catch (err) {
                        console.error(err);
                        await interaction.reply({ content: "❌ Erreur lors de l'exécution de la commande.", ephemeral: true });
                    }
                });
            });

        }
}