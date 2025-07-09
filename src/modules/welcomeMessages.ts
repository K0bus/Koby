import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GuildMember,
  InteractionContextType,
  MessageCreateOptions,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { BotModule } from '../types/BotTypes';
import { ConfigManager } from '../utils/ConfigManager';
import { parseMessage } from '../utils/Parser';

export type WelcomeConfig = {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  message: MessageCreateOptions;
};

const MODULE_NAME = 'welcomeMessage';

const welcomeMessage: BotModule = {
  name: MODULE_NAME,
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
        .setName(MODULE_NAME)
        .setDescription('Test your Welcome message')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const member = <GuildMember>interaction.member!;
        if (!hasPermissionsAdmin(member))
          return await sendError(
            interaction,
            "You don't have the permission to use this command !"
          );
        await sendWelcome(<GuildMember>interaction.member);
        await interaction.reply({
          content: 'Welcome message sent !',
          flags: MessageFlags.Ephemeral,
        });
      },
    },
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

function hasPermissionsAdmin(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

async function sendError(interaction: ChatInputCommandInteraction, error: string) {
  await interaction.reply(error);
}

async function sendWelcome(member: GuildMember) {
  const config = ConfigManager.getConfig<WelcomeConfig>(MODULE_NAME, member.guild.id);

  const channels = await member.guild.channels.fetch();
  const welcomeChannel = channels.get(config.channelId);

  if (!config.enabled) return;
  if (welcomeChannel) {
    const config = ConfigManager.getConfig<WelcomeConfig>(MODULE_NAME, member.guild.id);
    const channel = member.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      await channel.send(parseMessage(config.message, member, parseString));
    }
  } else {
    console.log("Can't find channel " + config.channelId);
  }
}
function parseString(text: string | undefined, member: GuildMember): string | undefined {
  if (text) {
    text = text.replace('%userid%', member.user.id);
    text = text.replace('%username%', member.user.displayName);
    text = text.replace('%user_avatar%', member.user.displayAvatarURL());
  }
  return text;
}

export default welcomeMessage;
