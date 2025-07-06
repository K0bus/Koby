import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GuildMember, InteractionContextType, MessageCreateOptions, MessageFlags, PermissionFlagsBits, SlashCommandBuilder
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
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
          .setName("welcometest")
          .setDescription("Test your Welcome message")
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
          .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction :ChatInputCommandInteraction) {
        if(interaction.guild != null)
        {
          if(interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator))
          {
            if(interaction.member)
            {
              await sendWelcome(<GuildMember>interaction.member)
              await interaction.reply("Welcome message sent !")
            }
          }
        }
      }
    }
  ],
  event: [
    {
      eventType: Events.GuildMemberAdd,
      async execute(client, member: GuildMember) {
        await sendWelcome(member);
      },
      once: false,
    },
  ],
};


async function sendWelcome(member: GuildMember) {
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
}
function parseString(text: string | undefined, member: GuildMember): string | undefined {
  if(text) {
    text = text.replace("%userid%", member.user.id)
    text = text.replace("%username%", member.user.displayName)
    if(member.user.avatarURL)
    {
      text = text.replace("%user_avatar%", member.user.avatarURL.toString)
    }
  }
  return text;
}

export default welcomeMessage;
