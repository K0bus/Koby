import { GuildModuleConfig } from '../base/guild-module-config';

export interface ModLogConfig {
  enabled: boolean;
  channelId: string;
}

export class ModLogConfigManager extends GuildModuleConfig<ModLogConfig> {
  constructor(guildId: string) {
    super(guildId, 'modLog');
  }

  fallback: ModLogConfig = {
    enabled: false,
    channelId: '',
  };
}
