import { InputJsonValue } from '@prisma/client/runtime/library';
import { prisma } from './prisma.service';
import { GuildSetting } from '@prisma/client';

export class GuildSettingsService {
  static get(guildId: string, name: string): Promise<GuildSetting | null> {
    return prisma.guildSetting.findUnique({
      where: { guildId_settingName: { guildId, settingName: name } },
    });
  }

  static set(guildId: string, name: string, value: any): Promise<GuildSetting> {
    return prisma.guildSetting.upsert({
      where: { guildId_settingName: { guildId, settingName: name } },
      create: { guildId, settingName: name, settingValue: value as InputJsonValue },
      update: { settingValue: value as InputJsonValue },
    });
  }

  static remove(guildId: string, name: string): Promise<GuildSetting> {
    return prisma.guildSetting.delete({
      where: { guildId_settingName: { guildId, settingName: name } },
    }) as Promise<GuildSetting>;
  }

  static list(guildId: string): Promise<GuildSetting[]> {
    return prisma.guildSetting.findMany({
      where: { guildId },
    }) as Promise<GuildSetting[]>;
  }
}
