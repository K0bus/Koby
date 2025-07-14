import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { BotModule } from '../types/BotTypes';
import { parseMessage } from '../utils/Parser';
import { WelcomeConfigManager } from '../config/managers/welcome-config';

const MODULE_NAME: string = 'welcomeMessage';
const welcomeMessage: BotModule = {
  name: MODULE_NAME,
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
        .setName('welcometest')
        .setDescription('Test your Welcome message')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const member = <GuildMember>interaction.member!;
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
          await interaction.reply("You don't have the permission to use this command !");
          return;
        }
        await interaction.reply({
          content: await sendWelcome(member),
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

async function sendWelcome(member: GuildMember): Promise<string> {
  const config = await new WelcomeConfigManager(member.guild.id).get();

  const channels = await member.guild.channels.fetch();
  const welcomeChannel = channels.get(config.channelId);
  if (!config.enabled) return '❌ Welcome message disabled in config';
  if (welcomeChannel) {
    const channel = member.guild.channels.cache.get(config.channelId);
    if (channel?.isTextBased()) {
      const message = parseMessage(config.message, member, parseString);
      const messages = await channel.messages.fetch({ limit: 10 });
      for (const lastMessage of messages.values()) {
        if (lastMessage) {
          if (
            JSON.stringify(message.embeds) === JSON.stringify(lastMessage.embeds) &&
            message.content === lastMessage.content
          ) {
            console.log('Duplicate welcome message');
            return '❌ Duplicate welcome message';
          }
        }
      }
      await channel.send(parseMessage(config.message, member, parseString));
    } else {
      return '❌ Welcome channel not found';
    }
  } else {
    return '❌ Welcome channel not found';
  }
  return '✅ Welcome message sent';
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
