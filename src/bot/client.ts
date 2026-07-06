import { Client, GatewayIntentBits, Events, Partials, ActivityType } from 'discord.js';
import { Bot } from '../types/BotTypes';
import { loadModules } from '../modules';

export function createClient(bot: Bot) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
  });

  client.setMaxListeners(25);

  client.once(Events.ClientReady, (c) => {
    console.log(`[${c.user.tag}] ✅ Logged in`);
    // Set status
    if (bot.status && bot.status !== '') {
      client.user!.setActivity(bot.status, { type: ActivityType.Custom });
    }
    // Fetch all messages
    void refreshCache(client).then(() => {
      console.log(`[${c.user.tag}] 🔄 Refreshed cache messages`);
    });
  });

  client.login(bot.token).catch(() => {
    console.log(`[${bot.name}] ❌ Can't login to discord`);
  });

  void loadModules(client);

  async function refreshCache(client: Client) {
    await client.guilds.fetch().then(() => {
      client.guilds.cache.forEach((guild) => {
        void guild.channels.fetch().then(() => {
          guild.channels.cache.forEach((channel) => {
            if (channel.isTextBased()) {
              void channel.messages.fetch();
            }
          });
        });
      });
    });
  }

  return client;
}
