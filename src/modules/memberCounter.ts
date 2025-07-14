import {
  ChatInputCommandInteraction,
  Events,
  Guild,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  Client,
  VoiceChannel,
} from 'discord.js';

import { BotModule } from '../types/BotTypes';
import { CounterConfigManager } from '../config/managers/counter-config';

const MODULE_NAME = 'memberCounter';

const memberCounter: BotModule = {
  name: MODULE_NAME,
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
        .setName('counter')
        .setDescription('Refresh your actual member counter if enabled !')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction: ChatInputCommandInteraction) {
        if (interaction.guild != null) {
          await refreshCounter(interaction.guild, client).then(async (r) => {
            if (r === true) {
              await interaction.reply({
                content: '✅ Member counter refreshed successfully !',
                flags: MessageFlags.Ephemeral,
              });
            } else {
              await interaction.reply({
                content: '❌ Error while refreshing member counter :' + r,
                flags: MessageFlags.Ephemeral,
              });
            }
          });
        }
      },
    },
  ],
  event: [
    {
      eventType: Events.GuildMemberAdd,
      async execute(client: Client, member: GuildMember) {
        await refreshCounter(member.guild, client);
      },
      once: false,
    },
  ],
};

async function refreshCounter(guild: Guild, client: Client): Promise<boolean | string> {
  const config = await new CounterConfigManager(guild.id).get();
  if (config.enabled) {
    const members = await guild.members.fetch();
    const humanCount = members.filter((m) => !m.user.bot).size;
    const channel: VoiceChannel = <VoiceChannel>client.channels.cache.get(config.channelId);
    if (channel) {
      const newName = config.format.replace('%count%', humanCount.toString());
      if (channel.name !== newName) {
        const newVoice = await channel.setName(
          config.format.replace('%count%', humanCount.toString())
        );
        if (newVoice.name !== newName) return 'Change fail due to too many change !';
        return true;
      }
      return 'Channel name still be unchanged !';
    } else {
      return "Can't find channel " + config.channelId;
    }
  } else {
    return 'Counter is disabled !';
  }
}

export default memberCounter;
