import {
  CategoryChannel,
  ChannelType,
  Client,
  EmbedBuilder,
  GuildMember,
  StageChannel,
  VoiceChannel,
  VoiceState,
} from 'discord.js';
import { AutoVoiceConfig, AutoVoiceConfigManager } from '../../config/managers/autovoice-config';

const EMBED_COLOR = 0x00aaff;
const OWNER_FIELD_CHANNEL = 'Salon';
const OWNER_FIELD_NAME = 'Propriétaire';

export async function handleVoiceJoin(
  client: Client,
  state: VoiceState,
  config: AutoVoiceConfig
): Promise<void> {
  const category = client.channels.cache.get(config.tempCategory) as CategoryChannel;
  const member = state.member;

  if (!category || !member) return;

  const tempVoice = await createTempVoiceChannel(state, category, member, config);
  await state.setChannel(tempVoice);
  await sendTempChannelEmbed(tempVoice, member);
}

async function createTempVoiceChannel(
  state: VoiceState,
  category: CategoryChannel,
  member: GuildMember,
  config: AutoVoiceConfig
) {
  return state.guild.channels.create({
    name: config.format.replace('%user%', member.displayName),
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [],
  });
}

async function sendTempChannelEmbed(channel: VoiceChannel, owner: GuildMember) {
  const embed = new EmbedBuilder()
    .setTitle('🧩 Salon vocal temporaire créé')
    .addFields([
      { name: OWNER_FIELD_CHANNEL, value: `<#${channel.id}>`, inline: true },
      { name: OWNER_FIELD_NAME, value: `<@${owner.id}>`, inline: true },
      { name: 'ID', value: `\`${channel.id}\``, inline: false },
    ])
    .setTimestamp()
    .setColor(EMBED_COLOR);

  await channel.send({ embeds: [embed] });
}

export async function handleVoiceLeave(
  client: Client,
  state: VoiceState,
  config: AutoVoiceConfig
): Promise<void> {
  const category = state.channel!.parent;
  if (!category || category.id !== config.tempCategory) return;

  if (state.channel!.members.size === 0) {
    await state.channel!.delete();
    return;
  }

  const ownerId = await fetchOwnerId(state.channel!, client);
  const hasOwnerLeft = !state.channel!.members.some((m) => m.id === ownerId);

  if (hasOwnerLeft) {
    await updateChannelOwnership(state.channel!, client);
  }
}

async function fetchOwnerId(channel: VoiceChannel | StageChannel, client: Client): Promise<string> {
  const messages = await channel.messages.fetch();
  const botMessage = messages.find((msg) => msg.author.id === client.user?.id);
  if (!botMessage?.embeds[0]) return '';

  const ownerField = botMessage.embeds[0].fields.find((f) => f.name === OWNER_FIELD_NAME);
  return ownerField?.value.replace(/[<@>]/g, '') || '';
}

async function updateChannelOwnership(channel: VoiceChannel | StageChannel, client: Client) {
  const newOwner = channel.members.first();
  if (!newOwner) return;

  const config: AutoVoiceConfig = await new AutoVoiceConfigManager(newOwner.guild.id).get();
  await channel.setName(config.format.replace('%user%', newOwner.displayName));

  const messages = await channel.messages.fetch();
  const botMessage = messages.find((msg) => msg.author.id === client.user?.id);

  if (botMessage?.embeds[0]) {
    const updatedEmbed = EmbedBuilder.from(botMessage.embeds[0]).setFields(
      botMessage.embeds[0].fields.map((field) =>
        field.name === OWNER_FIELD_NAME ? { ...field, value: `<@${newOwner.id}>` } : field
      )
    );

    await botMessage.edit({ embeds: [updatedEmbed] });
  }
}

export function isAutoVoiceChannel(channelId: string, config: AutoVoiceConfig): boolean {
  return config.channelsIds.includes(channelId);
}
