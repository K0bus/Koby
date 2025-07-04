import {
  Events,
  GuildMember, MessageCreateOptions
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";
import {parseMessage} from "../utils/Parser";

export type WelcomeConfig = {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  message: MessageCreateOptions;
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
            await channel.send(parseMessage(config.message, member, parseString))
          }
        }
      },
      once: false,
    },
  ],
};

function parseString(text: string | undefined, member: GuildMember): string | undefined {
  if(text) {
    text.replace("%userid%", member.user.id)
  }
  return text;
}

export default welcomeMessage;
