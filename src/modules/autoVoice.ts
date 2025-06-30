import {
  Events,
  GuildMember,
  Client,VoiceState, CategoryChannel, ChannelType
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";

type AutoVoiceConfig = {
  enabled: boolean;
  channelsIds: string[];
  tempCategory: string;
  format: string;
};

const autoVoice: BotModule = {
  name: "autoVoice",
  commands: [],
  event: [
    {
      eventType: Events.VoiceStateUpdate,
      async execute(client: Client, oldVoiceState:VoiceState, newVoiceState:VoiceState) {
        const config = ConfigManager.getConfig<AutoVoiceConfig>(
            "autoVoice",
            oldVoiceState.guild.id
        );
        if (newVoiceState.channel) { // The member connected to a channel.
          if (config.channelsIds.includes(newVoiceState.channel.id.toString())) {
            let category: CategoryChannel = <CategoryChannel> client.channels.cache.get(config.tempCategory);
            let member:GuildMember | null = newVoiceState.member;
            if(category && member)
            {
              const tempVoice = await newVoiceState.guild.channels.create({
                name: config.format.replace("%user%", member.displayName),
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [],
              })
              await newVoiceState.setChannel(tempVoice);
            }
          }
        }
        if (oldVoiceState.channel) { // The member disconnected from a channel.
          let category: CategoryChannel | null = oldVoiceState.channel.parent;
          if(category)
          {
            if(category.id === config.tempCategory && oldVoiceState.channel.members.size === 0)
            {
              await oldVoiceState.channel.delete();
            }
          }
        }
      },
      once: false,
    },
  ],
};

export default autoVoice;
