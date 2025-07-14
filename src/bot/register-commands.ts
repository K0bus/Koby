import { REST, RESTPostAPIApplicationCommandsResult, Routes } from 'discord.js';
import botConfig from '../../config/bots.json';
import { Bot, BotCommand } from '../types/BotTypes';
import ModuleManager from '../modules';

const commands: any[] = [];
const moduleManager = new ModuleManager();

void loadCommands();

function loadCommands() {
  for (const module of moduleManager.list()) {
    console.log(`[${module.name}] Loading commands`);
    if (module) {
      module.commands.forEach((command: BotCommand) => {
        commands.push(command.slashCommand.toJSON());
      });
    }
  }
  for (const bot of botConfig) {
    void registerCommands(bot).then((data: RESTPostAPIApplicationCommandsResult[] | undefined) => {
      if (data)
        console.log(`[${bot.name}] Successfully reloaded ${data.length} application (/) commands.`);
    });
  }
}

async function registerCommands(
  bot: Bot
): Promise<RESTPostAPIApplicationCommandsResult[] | undefined> {
  try {
    const rest = new REST().setToken(bot.token);
    console.log(`[${bot.name}] Started refreshing ${commands.length} application (/) commands.`);

    return (await rest.put(Routes.applicationCommands(bot.client_id), {
      body: commands,
    })) as RESTPostAPIApplicationCommandsResult[];
  } catch (error) {
    console.error(`[${bot.name}] ❌ Error while refreshing commands:`, error);
  }
  return undefined;
}
