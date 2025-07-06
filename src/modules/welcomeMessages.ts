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
              await interaction.reply({
                content: "Welcome message sent !",
                flags: MessageFlags.Ephemeral
              })
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
  const config = ConfigManager.getConfig<WelcomeConfig>(
      "welcomeMessage",
      member.guild.id
  );
  let channels = await member.guild.channels.fetch();
  let welcomeChannel = channels.get(config.channelId)
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
  else {
    console.log("Can't find channel " + config.channelId)
  }
}
function parseString(text: string | undefined, member: GuildMember): string | undefined {
  if(text) {
    text = text.replace("%userid%", member.user.id)
    text = text.replace("%username%", member.user.displayName)
    text = text.replace("%user_avatar%", member.user.displayAvatarURL())
  }
  return text;
}

export default welcomeMessage;
