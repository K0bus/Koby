import { GuildMember } from 'discord.js';
import { WelcomeConfigManager } from '../../config/managers/welcome-config';
import { parseMessage } from '../../utils/Parser';

export async function sendWelcome(member: GuildMember): Promise<string> {
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
    const replacements: Record<string, string> = {
      '%userid%': member.user.id,
      '{userid}': member.user.id,
      '%username%': member.user.displayName,
      '{username}': member.user.displayName,
      '%user_avatar%': member.user.displayAvatarURL(),
      '{user_avatar}': member.user.displayAvatarURL(),
      '%guild_name%': member.guild.name,
      '{guild_name}': member.guild.name,
      '%member_count%': member.guild.memberCount.toString(),
      '{member_count}': member.guild.memberCount.toString(),
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.split(placeholder).join(value);
    }
  }
  return text;
}
