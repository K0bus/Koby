import { BotCommand, BotEvent, BotModule } from '../types/BotTypes';
import { BaseModule } from './base/base-module';
import { AutoroleModule } from './managers/autorole-module';
import { AutovoiceModule } from './managers/autovoice-module';
import { CounterModule } from './managers/counter-module';
import { ModlogModule } from './managers/modlog-module';
import { SimplecommandsModule } from './managers/simplecommands-module';
import { WelcomemessageModule } from './managers/welcomemessage-module';
import { Client, Events, MessageFlags } from 'discord.js';
import { SetupModule } from './managers/setup-module';

export class ModuleManager {
  modules: BaseModule[] = [];
  constructor() {
    this.modules.push(new AutoroleModule());
    this.modules.push(new AutovoiceModule());
    this.modules.push(new CounterModule());
    this.modules.push(new ModlogModule());
    this.modules.push(new SimplecommandsModule());
    this.modules.push(new WelcomemessageModule());
    this.modules.push(new SetupModule());
  }
  list(): BotModule[] {
    return this.modules;
  }
}

export function loadModules(client: Client) {
  const moduleManager = new ModuleManager();
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

export default ModuleManager;
