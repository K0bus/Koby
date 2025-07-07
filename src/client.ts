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
    if(bot.status && bot.status !== "")
    {
        client.user!.setActivity(
            bot.status,
            {type: ActivityType.Custom}
        )
    }
    // Fetch all messages
    refreshCache(client).then(() => {
        console.log(`[${c.user.tag}] 🔄 Refreshed cache messages`);
    });
  });

  client.login(bot.token).catch(() => {
      console.log("Can't login to discord for bot " + bot.name);
  });
  
  loadModules(client);

  async function refreshCache(client: Client) {
      await client.guilds.fetch().then(() => {
          client.guilds.cache.forEach(guild => {
              guild.channels.fetch().then(() => {
                  guild.channels.cache.forEach(channel => {
                      if(channel.isTextBased())
                      {
                          channel.messages.fetch();
                      }
                  })
              })
          })
      })
  }

  return client;
}