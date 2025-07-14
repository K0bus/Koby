import { GuildModuleConfig } from '../base/guild-module-config';

export interface CounterConfig {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  format: string;
}

export class CounterConfigManager extends GuildModuleConfig<CounterConfig> {
  constructor(guildId: string) {
    super(guildId, 'memberCounter');
  }

  fallback: CounterConfig = {
    enabled: false,
    bot: false,
    channelId: '',
    format: '{count} membres',
  };
}
