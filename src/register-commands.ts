import { REST, RESTPostAPIApplicationCommandsResult, Routes } from "discord.js";
import botConfig from '../config/bots.json';
import path from "path";
import { readdirSync } from "fs";
import { BotCommand, BotModule } from "./types/BotTypes";

const commands: any[] = [];

// Charger les commandes
const foldersPath = path.join(__dirname, "modules");
const moduleFile = readdirSync(foldersPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of moduleFile) {
	const eventPath = path.join(foldersPath, file);
	const imported = require(eventPath);
	const module: BotModule = imported.default ?? imported;
	module.commands.forEach((command:BotCommand) => {
		commands.push(command.slashCommand.toJSON())
	});
}
botConfig.forEach(bot => {
	const rest = new REST().setToken(bot.token);

	(async () => {
		try {
			console.log(commands);
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data: RESTPostAPIApplicationCommandsResult[] = await rest.put(
				Routes.applicationCommands(bot.client_id),
				{ body: commands },
			) as RESTPostAPIApplicationCommandsResult[];

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	})();
})
