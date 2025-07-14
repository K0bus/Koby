import { GuildModuleConfig } from '../base/guild-module-config';
import { MessageCreateOptions } from 'discord.js';

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
}
