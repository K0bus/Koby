import { Client, Events, MessageFlags } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { BotCommand, BotEvent, BotModule } from '../types/BotTypes';

export async function loadModules(client: Client) {
  const foldersPath = path.join(__dirname, '../modules');
  const moduleFile = readdirSync(foldersPath).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js')
  );

  for (const file of moduleFile) {
    const eventPath = path.join(foldersPath, file);
    const imported = (await import(eventPath)) as { default?: BotModule };
    const module: BotModule = (imported as { default: BotModule }).default;

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
