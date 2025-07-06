import {
  ChatInputCommandInteraction,
  Events, Guild,
  GuildMember, MessageFlags,
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits, Client, VoiceChannel
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";

export type CounterConfig = {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  format: string;
};

const memberCounter: BotModule = {
  name: "memberCounter",
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
          .setName("counter")
          .setDescription("Refresh your actual member counter if enabled !")
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
          .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction :ChatInputCommandInteraction) {
        if(interaction.guild != null)
        {
          refreshCounter(interaction.guild, client).then(() => {
            interaction.reply({content: "Member counter refreshed successfully !", flags: MessageFlags.Ephemeral})
          })
        }
      }
    }
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

async function refreshCounter(guild: Guild, client: Client)
{
  const config = ConfigManager.getConfig<CounterConfig>(
      "memberCounter",
      guild.id
  );
  if(config.enabled) {
    const members = await guild!.members.fetch();
    const humanCount = members.filter(m => !m.user.bot).size;
    let channel: VoiceChannel;
    channel = <VoiceChannel> client.channels.cache.get(config.channelId);
    if(channel)
    {
      await channel.setName(config.format.replace("%count%", humanCount.toString()));
    }
    else
    {
      console.log("Can't find channel " + config.channelId)
    }
  }
}

export default memberCounter;
