import {
  Events,
  GuildMember,
  Client, VoiceState, CategoryChannel, ChannelType, VoiceChannel, StageChannel
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";
import {channel} from "node:diagnostics_channel";

export type AutoVoiceConfig = {
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
              tempVoice.send({
                embeds: [
                  {
                    title: "🧩 Salon vocal temporaire créé",
                    fields: [
                      { name: "Salon", value: `<#${tempVoice.id}>`, inline: true },
                      { name: "Propriétaire", value: `<@${newVoiceState.member!.id}>`, inline: true },
                      { name: "ID", value: `\`${tempVoice.id}\``, inline: false },
                    ],
                    timestamp: new Date().toISOString(),
                    color: 0x00aaff,
                  },
                ],
              });
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
            else if(category.id === config.tempCategory) {
              const ownerIds: string = await fetchOwnerId(oldVoiceState.channel, client)
              if(oldVoiceState.channel.members.filter((m) => {
                m.id === ownerIds
              }).size === 0) {
                const first = oldVoiceState.channel.members.first();
                if(first)
                {
                  const config = ConfigManager.getConfig<AutoVoiceConfig>(
                      "autoVoice",
                      oldVoiceState.guild.id
                  );
                  await oldVoiceState.channel.setName(config.format.replace("%user%", first.displayName))
                  const messages = await oldVoiceState.channel.messages.fetch()
                  let botMessage = messages.filter((message) => message.author.id === client.user?.id).first()
                  if(botMessage)
                  {
                    let embed = botMessage.embeds[0];
                    if(embed)
                    {
                      embed.fields.forEach((field) => {
                        if(field.name === "Propriétaire")
                          field.value = `<@${first.id}>`;
                      })
                      botMessage.embeds[0] = embed;
                    }
                    botMessage.edit({
                      content: botMessage.content,
                      embeds: botMessage.embeds,
                      components: botMessage.components
                    });
                  }

                }
              }
            }
          }
        }
      },
      once: false,
    },
  ],
};

async function fetchOwnerId(channel: VoiceChannel | StageChannel, client: Client): Promise<string> {
  const messages = await channel.messages.fetch()
  let botMessage = messages.filter((message) => message.author.id === client.user?.id).first()
  if(botMessage)
  {
    let embed = botMessage.embeds[0];
    if(embed)
    {
      embed.fields.forEach((field) => {
        if(field.name === "Propriétaire")
        {
          return field.value.replace("<@", "").replace(">", "")
        }
      })
    }
  }
  return "";
}

export default autoVoice;
