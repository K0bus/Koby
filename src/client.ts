import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import { loadModules } from "./utils/loadModules";

export function createClient(bot: any) {
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
  });

  client.login(bot.token);
  
  loadModules(client);

  return client;
}