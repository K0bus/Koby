import { Client, Events, MessageFlags } from 'discord.js';
import { BotCommand, BotEvent } from '../types/BotTypes';
import ModuleManager from '../modules';

const moduleManager = new ModuleManager();

export function loadModules(client: Client) {
  for (const module of moduleManager.list()) {
    console.log(`[Global] Loading module ${module.name}`);

    module.event.forEach((event: BotEvent) => {
      if (event.once) {
        client.once(event.eventType, (...args) => void event.execute(client, ...args));
      } else {
        client.on(event.eventType, (...args) => void event.execute(client, ...args));
      }
    });

    module.commands.forEach((command: BotCommand) => {
      client.on(Events.InteractionCreate, (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName != command.slashCommand.toJSON().name) return;
        try {
          void command.execute(client, interaction);
        } catch (err) {
          console.error(err);
          if (!interaction.replied)
            void interaction.reply({
              content: "❌ Erreur lors de l'exécution de la commande.",
              flags: MessageFlags.Ephemeral,
            });
        }
      });
    });
  }
}
