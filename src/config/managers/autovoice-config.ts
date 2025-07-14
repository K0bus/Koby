import { GuildModuleConfig } from '../base/guild-module-config';

export interface AutoVoiceConfig {
  enabled: boolean;
  channelsIds: string[];
  tempCategory: string;
  format: string;
}

export class AutoVoiceConfigManager extends GuildModuleConfig<AutoVoiceConfig> {
  constructor(guildId: string) {
    super(guildId, 'autoVoice');
  }

  fallback: AutoVoiceConfig = {
    enabled: false,
    channelsIds: [],
    tempCategory: '',
    format: "%user%'s channel",
  };
}
