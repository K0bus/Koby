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
import { ConfigManager } from '../utils/ConfigManager';

interface CounterConfig {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  format: string;
}

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
          refreshCounter(interaction.guild, client).then((r) => {
            if (r === true) {
              interaction.reply({
                content: '✅ Member counter refreshed successfully !',
                flags: MessageFlags.Ephemeral,
              });
            } else {
              interaction.reply({
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
  const config = ConfigManager.getConfig<CounterConfig>(MODULE_NAME, guild.id);
  if (config.enabled) {
    const members = await guild.members.fetch();
    const humanCount = members.filter((m) => !m.user.bot).size;
    let channel: VoiceChannel;
    channel = <VoiceChannel>client.channels.cache.get(config.channelId);
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
  }
  return 'Unknown error';
}

export default memberCounter;
