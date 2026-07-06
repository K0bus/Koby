import { GuildModuleConfig } from '../base/guild-module-config';

export interface AutomodConfig {
  modLogChannelId: string | null;
  badWordsEnabled: boolean;
  crossSpamEnabled: boolean;
  warnThreshold: number;
}

export class AutomodConfigManager extends GuildModuleConfig<AutomodConfig> {
  constructor(guildId: string) {
    super(guildId, 'automod');
  }

  fallback: AutomodConfig = {
    modLogChannelId: null,
    badWordsEnabled: false,
    crossSpamEnabled: false,
    warnThreshold: 3,
  };

  override validate(obj: unknown): obj is AutomodConfig {
    if (typeof obj !== 'object' || obj === null) return false;
    const config = obj as Partial<AutomodConfig>;
    return (
      (typeof config.modLogChannelId === 'string' || config.modLogChannelId === null) &&
      typeof config.badWordsEnabled === 'boolean' &&
      typeof config.crossSpamEnabled === 'boolean' &&
      typeof config.warnThreshold === 'number'
    );
  }
}
