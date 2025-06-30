import {
  Events,
  GuildMember, Role,
} from "discord.js";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";

export type AutoRoleConfig = {
  enabled: boolean;
  bot: boolean;
  rolesIds: string[];
};


const autoRole: BotModule = {
  name: "autoRole",
  commands: [],
  event: [
    {
      eventType: Events.GuildMemberAdd,
      async execute(client, member: GuildMember) {
        const config = ConfigManager.getConfig<AutoRoleConfig>(
            "autoRole",
            member.guild.id
        );
        if(member.user.bot && !config.bot) return;
        config.rolesIds.forEach((roleId) => {
          const role: Role | undefined = member.guild.roles.cache.find(r => r.id === roleId);
          if(role){
            member.roles.add(role);
          }
        })
      },
      once: false,
    },
  ],
};

export default autoRole;
