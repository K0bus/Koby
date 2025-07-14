import { GuildSettingsService } from '../../db';
import { BaseConfig } from './base-config';
import { isSameShape } from '../../utils/validation';

export abstract class GuildModuleConfig<T> extends BaseConfig<T> {
  protected constructor(
    public readonly guildId: string,
    settingName: string
  ) {
    super(settingName);
  }

  abstract fallback: T;

  async get(): Promise<T> {
    const setting = await GuildSettingsService.get(this.guildId, this.settingName);
    if (setting && this.validate(setting.settingValue)) {
      return setting.settingValue;
    }

    const fallback = this.fallback;
    await this.save(fallback);
    if (setting) {
      console.log(
        `[${this.guildId}] Config for module ${this.settingName} found but not valid, using fallback`
      );
    } else {
      console.log(
        `[${this.guildId}] Config for module ${this.settingName} not found, using fallback`
      );
    }
    return fallback;
  }

  async save(config: T): Promise<void> {
    await GuildSettingsService.set(this.guildId, this.settingName, config);
  }

  validate(obj: unknown): obj is T {
    return isSameShape(obj, this.fallback);
  }
}
