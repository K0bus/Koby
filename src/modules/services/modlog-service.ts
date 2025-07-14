import { BaseChannel, EmbedField, GuildBan, TextChannel } from 'discord.js';

export function genField(name: string, value: string): EmbedField {
  return {
    name: name,
    value: value,
    inline: true,
  };
}

export async function sendBanEmbed(channel: BaseChannel, ban: GuildBan) {
  const user = ban.user;
  const fields: EmbedField[] = [
    genField('User name', user.username),
    genField('User ID', user.id),
    genField('User tag', `<@${user.id}>`),
  ];
  if (ban.reason) fields.push(genField('Reason', ban.reason));
  await sendEmbed(channel as TextChannel, '🔨 Ban', '', fields, 0x3498db);
}

export async function sendUnbanEmbed(channel: BaseChannel, ban: GuildBan) {
  const user = ban.user;
  const fields: EmbedField[] = [
    genField('User name', user.username),
    genField('User ID', user.id),
    genField('User tag', `<@${user.id}>`),
  ];
  await sendEmbed(channel as TextChannel, '✅ Unban', '', fields, 0x2ecc71);
}

export async function sendEmbed(
  channel: BaseChannel,
  title: string,
  message: string,
  fields: EmbedField[],
  color: number
) {
  if (!channel.isTextBased()) return;

  await (<TextChannel>channel).send({
    embeds: [
      {
        title,
        description: message,
        fields,
        timestamp: new Date().toISOString(),
        color,
      },
    ],
  });
}
