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
for (const bot of botConfig) {
	try {
		const rest = new REST().setToken(bot.token);
		console.log(`[${bot.name}] Started refreshing ${commands.length} application (/) commands.`);

		const data = rest.put(
			Routes.applicationCommands(bot.client_id),
			{body: commands}
		) as unknown as RESTPostAPIApplicationCommandsResult[];

		console.log(`[${bot.name}] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(`[${bot.name}] ❌ Error while refreshing commands:`, error);
	}
}