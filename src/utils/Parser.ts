import { APIEmbed, GuildMember, JSONEncodable, MessageCreateOptions } from 'discord.js';

type Parser = (text: string | undefined, ...args: any[]) => string | undefined;

export function parseMessage(
  message: MessageCreateOptions,
  member: GuildMember,
  parser: Parser
): MessageCreateOptions {
  // Deep clone to avoid mutating the original config message
  const clonedMessage = JSON.parse(JSON.stringify(message)) as MessageCreateOptions;

  if (clonedMessage.content) {
    clonedMessage.content = parser(clonedMessage.content, member);
  }

  if (clonedMessage.embeds && Array.isArray(clonedMessage.embeds)) {
    const newEmbeds: APIEmbed[] = [];
    clonedMessage.embeds.forEach((embed: APIEmbed | JSONEncodable<APIEmbed>) => {
      let apiEmbed: APIEmbed;
      if (embed && 'toJSON' in embed && typeof embed.toJSON === 'function') {
        apiEmbed = embed.toJSON();
      } else {
        apiEmbed = embed as APIEmbed;
      }

      if (apiEmbed.title) apiEmbed.title = parser(apiEmbed.title, member);
      if (apiEmbed.description) apiEmbed.description = parser(apiEmbed.description, member);
      if (apiEmbed.url) apiEmbed.url = parser(apiEmbed.url, member);

      if (apiEmbed.author) {
        if (apiEmbed.author.name) apiEmbed.author.name = parser(apiEmbed.author.name, member) || '';
        if (apiEmbed.author.url) apiEmbed.author.url = parser(apiEmbed.author.url, member);
        if (apiEmbed.author.icon_url)
          apiEmbed.author.icon_url = parser(apiEmbed.author.icon_url, member);
      }

      if (apiEmbed.footer) {
        if (apiEmbed.footer.text) apiEmbed.footer.text = parser(apiEmbed.footer.text, member) || '';
        if (apiEmbed.footer.icon_url)
          apiEmbed.footer.icon_url = parser(apiEmbed.footer.icon_url, member);
      }

      if (apiEmbed.image && apiEmbed.image.url) {
        apiEmbed.image.url = parser(apiEmbed.image.url, member) || '';
      }

      if (apiEmbed.thumbnail && apiEmbed.thumbnail.url) {
        let thumbnail_url = parser(apiEmbed.thumbnail.url, member);
        if (!thumbnail_url) {
          thumbnail_url = 'https://archive.org/download/discordprofilepictures/discordblue.png';
        }
        apiEmbed.thumbnail.url = thumbnail_url;
      }

      if (apiEmbed.fields && Array.isArray(apiEmbed.fields)) {
        apiEmbed.fields.forEach((field) => {
          if (field.name) field.name = parser(field.name, member) || '';
          if (field.value) field.value = parser(field.value, member) || '';
        });
      }

      newEmbeds.push(apiEmbed);
    });
    clonedMessage.embeds = newEmbeds;
  }

  return clonedMessage;
}
