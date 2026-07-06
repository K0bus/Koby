import { Client, Guild, VoiceChannel } from 'discord.js';
import { CounterConfigManager } from '../../config/managers/counter-config';

export async function refreshCounter(guild: Guild, client: Client): Promise<boolean | string> {
  const config = await new CounterConfigManager(guild.id).get();
  if (config.enabled) {
    const members = await guild.members.fetch();
    const humanCount = members.filter((m) => !m.user.bot).size;
    const channel: VoiceChannel = <VoiceChannel>client.channels.cache.get(config.channelId);
    if (channel) {
      const countStr = humanCount.toString();
      const newName = config.format.replace(/{count}/g, countStr).replace(/%count%/g, countStr);
      if (channel.name !== newName) {
        const newVoice = await channel.setName(newName);
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
