import { Client, GatewayIntentBits, Events, Partials, ActivityType } from "discord.js";
import { loadModules } from "./utils/loadModules";
import {Bot} from "./types/BotTypes";

export function createClient(bot: Bot) {
  const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel
    ]});

  client.once(Events.ClientReady, c => {
    console.log(`✅ Connecté en tant que ${c.user.tag}`);
      client.user!.setActivity(
          bot.status,
          {type: ActivityType.Custom}
      )
  });

  client.login(bot.token).catch(() => {
      console.log("Can't login to discord for bot " + bot.name);
  });
  
  loadModules(client);

  return client;
}