import { APIEmbed, GuildMember, JSONEncodable, MessageCreateOptions } from 'discord.js';

type Parser = (text: string | undefined, ...args: any[]) => string | undefined;

export function parseMessage(
  message: MessageCreateOptions,
  member: GuildMember,
  parser: Parser
): MessageCreateOptions {
  message.content = parser(message.content, member);
  const newEmbeds: APIEmbed[] = [];
  message.embeds?.forEach((embed: APIEmbed | JSONEncodable<APIEmbed>) => {
    let apiEmbed: APIEmbed;

    if ('toJSON' in embed && typeof embed.toJSON === 'function') {
      apiEmbed = embed.toJSON(); // JSONEncodable
    } else {
      apiEmbed = embed as APIEmbed;
    }
    apiEmbed.title = parser(apiEmbed.title, member);
    apiEmbed.description = parser(apiEmbed.description, member);
    if (apiEmbed.thumbnail && apiEmbed.thumbnail.url) {
      let thumbnail_url = parser(apiEmbed.thumbnail.url, member);
      if (!thumbnail_url)
        thumbnail_url = 'https://archive.org/download/discordprofilepictures/discordblue.png';
      apiEmbed.thumbnail.url = thumbnail_url;
    }
    newEmbeds.push(apiEmbed);
  });
  message.embeds = newEmbeds;
  return message;
}
