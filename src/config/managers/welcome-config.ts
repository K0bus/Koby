import { GuildModuleConfig } from '../base/guild-module-config';
import { MessageCreateOptions } from 'discord.js';
import { isMessageCreateOptions } from '../../utils/validation';

export type WelcomeConfig = {
  enabled: boolean;
  bot: boolean;
  channelId: string;
  message: MessageCreateOptions;
};

export class WelcomeConfigManager extends GuildModuleConfig<WelcomeConfig> {
  constructor(guildId: string) {
    super(guildId, 'welcomeMessage');
  }

  fallback: WelcomeConfig = {
    enabled: false,
    bot: false,
    channelId: '',
    message: {
      content: '',
      embeds: [],
    },
  };

  override validate(obj: unknown): obj is WelcomeConfig {
    if (typeof obj !== 'object' || obj === null) return false;
    const config = obj as Partial<WelcomeConfig>;
    return (
      typeof config.enabled === 'boolean' &&
      typeof config.bot === 'boolean' &&
      typeof config.channelId === 'string' &&
      isMessageCreateOptions(config.message)
    );
  }
}
