import {
  Events,
  GuildMember,
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";

type WelcomeConfig = {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  message: string;
};


const welcomeMessage: BotModule = {
  name: "welcomeMessage",
  commands: [],
  event: [
    {
      eventType: Events.GuildMemberAdd,
      async execute(client, member: GuildMember) {
        const welcomeChannel = member.guild.systemChannel;
        if (welcomeChannel) {
          const config = ConfigManager.getConfig<WelcomeConfig>(
              "welcomeMessage",
              member.guild.id
          );
          const channel = member.guild.channels.cache.get(config.channelId);
          if(channel?.isTextBased())
          {
            await channel.send(config.message.replace("%userid%", member.user.id))
          }
          await welcomeChannel.send(`👋 Bienvenue ${member.user.tag} !`);
        }
      },
      once: false,
    },
  ],
};

export default welcomeMessage;
