import {
  BaseChannel,
  EmbedField,
  Events,
  GuildBan,
  GuildChannel,
  GuildMember,
  Message,
  PartialMessage,
  Role,
  TextChannel,
} from 'discord.js';

import { BotModule } from '../types/BotTypes';
import { ConfigManager } from '../utils/ConfigManager';

interface ModLogConfig {
  enabled: boolean;
  channelId: string;
}

const MODULE_NAME = 'modLog';

const modLog: BotModule = {
  name: MODULE_NAME,
  commands: [],
  event: [
    {
      eventType: Events.GuildBanAdd,
      async execute(client, ban: GuildBan) {
        const config = getValidatedConfig(ban.guild.id);
        const channel = ban.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) await sendBanEmbed(channel, ban);
      },
      once: false,
    },
    {
      eventType: Events.GuildBanRemove,
      async execute(client, ban: GuildBan) {
        const config = getValidatedConfig(ban.guild.id);
        const channel = ban.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) await sendUnbanEmbed(channel, ban);
      },
      once: false,
    },
    {
      eventType: Events.GuildMemberAdd,
      async execute(client, member: GuildMember) {
        const config = getValidatedConfig(member.guild.id);
        const channel = member.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          await sendEmbed(channel, '➕ Nouveau membre', `<@${member.id}> a rejoint.`, [], 0x57f287);
        }
      },
      once: false,
    },
    {
      eventType: Events.GuildMemberRemove,
      async execute(client, member: GuildMember) {
        const config = getValidatedConfig(member.guild.id);
        const channel = member.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          await sendEmbed(
            channel,
            '➖ Membre parti',
            `<@${member.id}> a quitté ou a été kick.`,
            [],
            0xed4245
          );
        }
      },
      once: false,
    },
    {
      eventType: Events.MessageDelete,
      async execute(client, message: Message | PartialMessage) {
        if (client.user && message.author?.id === client.user.id) return;
        if (!message.guild) return;
        const config = getValidatedConfig(message.guild.id);
        const channel = message.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          const content = message.content || '*Contenu inconnu*';
          await sendEmbed(
            channel,
            '🗑️ Message supprimé',
            `Auteur: <@${message.author?.id}>`,
            [genField('Contenu', content.slice(0, 1024))],
            0xf1c40f
          );
        }
      },
      once: false,
    },
    {
      eventType: Events.MessageUpdate,
      async execute(client, oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
        if (client.user && oldMsg.author?.id === client.user.id) return;
        if (!oldMsg.guild || oldMsg.content === newMsg.content) return;
        const config = getValidatedConfig(oldMsg.guild.id);
        const channel = oldMsg.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          await sendEmbed(
            channel,
            '📝 Message modifié',
            `Auteur: <@${oldMsg.author?.id}>`,
            [
              genField('Avant', oldMsg.content!.slice(0, 1024) || '*vide*'),
              genField('Après', newMsg.content!.slice(0, 1024) || '*vide*'),
            ],
            0xe67e22
          );
        }
      },
      once: false,
    },
    {
      eventType: Events.ChannelCreate,
      async execute(client, channel: GuildChannel) {
        if (!channel.guild) return;
        const config = getValidatedConfig(channel.guild.id);
        const logChannel = channel.guild.channels.cache.get(config.channelId);
        if (logChannel?.isTextBased()) {
          await sendEmbed(
            logChannel,
            '📁 Channel créé',
            `#${channel.name ? channel.name : 'Inconnu'}`,
            [],
            0x1abc9c
          );
        }
      },
      once: false,
    },
    {
      eventType: Events.ChannelDelete,
      async execute(client, channel: GuildChannel) {
        if (!channel.guild) return;
        const config = getValidatedConfig(channel.guild.id);
        const logChannel = channel.guild.channels.cache.get(config.channelId);
        if (logChannel?.isTextBased()) {
          await sendEmbed(
            logChannel,
            '🔥 Channel supprimé',
            `#${channel.name ? channel.name : 'Inconnu'}`,
            [],
            0xe74c3c
          );
        }
      },
      once: false,
    },
    {
      eventType: Events.GuildRoleCreate,
      async execute(client, role: Role) {
        const config = getValidatedConfig(role.guild.id);
        const channel = role.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          await sendEmbed(channel, '🎭 Rôle créé', `Rôle: <@&${role.id}>`, [], 0x9b59b6);
        }
      },
      once: false,
    },
    {
      eventType: Events.GuildRoleDelete,
      async execute(client, role: Role) {
        const config = getValidatedConfig(role.guild.id);
        const channel = role.guild.channels.cache.get(config.channelId);
        if (channel?.isTextBased()) {
          await sendEmbed(channel, '🧹 Rôle supprimé', `Nom du rôle: ${role.name}`, [], 0x95a5a6);
        }
      },
      once: false,
    },
  ],
};

function getValidatedConfig(guildId: string): ModLogConfig {
  const config = ConfigManager.getConfig<ModLogConfig>(MODULE_NAME, guildId);
  if (!config?.enabled || config.channelId) {
    throw new Error('Configuration de modLog invalide');
  }
  return config;
}

function genField(name: string, value: string): EmbedField {
  return {
    name: name,
    value: value,
    inline: true,
  };
}

async function sendBanEmbed(channel: BaseChannel, ban: GuildBan) {
  const user = ban.user;
  const fields: EmbedField[] = [
    genField('User name', user.username),
    genField('User ID', user.id),
    genField('User tag', `<@${user.id}>`),
  ];
  if (ban.reason) fields.push(genField('Reason', ban.reason));
  await sendEmbed(channel as TextChannel, '🔨 Ban', '', fields, 0x3498db);
}

async function sendUnbanEmbed(channel: BaseChannel, ban: GuildBan) {
  const user = ban.user;
  const fields: EmbedField[] = [
    genField('User name', user.username),
    genField('User ID', user.id),
    genField('User tag', `<@${user.id}>`),
  ];
  await sendEmbed(channel as TextChannel, '✅ Unban', '', fields, 0x2ecc71);
}

async function sendEmbed(
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

export default modLog;
