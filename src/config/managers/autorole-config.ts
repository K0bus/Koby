import { GuildModuleConfig } from '../base/guild-module-config';

export interface AutoRoleConfig {
  enabled: boolean;
  bot: boolean;
  rolesIds: string[];
}

export class AutoRoleConfigManager extends GuildModuleConfig<AutoRoleConfig> {
  constructor(guildId: string) {
    super(guildId, 'autoRole');
  }

  fallback: AutoRoleConfig = {
    enabled: false,
    bot: false,
    rolesIds: [],
  };
}
