import express from 'express';
import { botManager } from '../bot/BotManager';
import { GuildSettingsService } from '../db';
import { GuildSetting } from '@prisma/client';
import cors from 'cors';

interface UpdateSettingBody {
  key: string;
  value: unknown;
}

export function createExpressApp() {
  const app = express();
  app.use(express.json());

  app.use(cors());
  app.get('/api/guilds', (req, res) => {
    const guilds = botManager.getAllGuilds().map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount,
    }));
    res.json(guilds);
  });

  app.get('/api/settings/:guildId/:settingName', async (req, res) => {
    const config = await GuildSettingsService.get(req.params.guildId, req.params.settingName);
    if (config === null) return res.status(404).json({ error: 'Setting not found' });
    res.json(config.settingValue);
  });

  app.post('/api/settings/:guildId/:settingName', async (req, res) => {
    const { guildId, settingName } = req.params;
    if (req.body === undefined) return res.status(400).json({ error: 'Body is undefined' });

    const { key, value } = req.body as UpdateSettingBody;

    const config = await GuildSettingsService.get(guildId, settingName);
    if (!config) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const currentValue = config.settingValue as Record<string, unknown>;
    if (!(key in currentValue)) {
      return res.status(400).json({ error: `Key "${key}" not found in setting "${settingName}"` });
    }
    currentValue[key] = value;

    const updated: GuildSetting = await GuildSettingsService.set(
      guildId,
      settingName,
      currentValue
    );

    return res.json({
      status: 'updated',
      updated: {
        guildId,
        settingName,
        key,
        newValue: value,
      },
      fullConfig: updated,
    });
  });

  app.get('/api/guilds/:id', (req, res) => {
    const guildId = req.params.id;
    const client = botManager.getClientByGuild(guildId);
    if (!client) return res.status(404).json({ error: 'Guild not found in any bot' });

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found in cache' });

    res.json({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
    });
  });

  return app;
}
