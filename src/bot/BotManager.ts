import { Client } from 'discord.js';
import botConfig from '../../config/bots.json';
import { createClient } from './client';
import { Bot } from '../types/BotTypes';

export class BotManager {
  private bots: Client[] = [];

  public init() {
    this.bots = botConfig.map((data: Bot) => createClient(data));
  }

  public getClients(): Client[] {
    return this.bots;
  }

  public getClientByGuild(guildId: string): Client | undefined {
    return this.bots.find((c) => c.guilds.cache.has(guildId));
  }

  public getAllGuilds() {
    return this.bots.flatMap((c) => Array.from(c.guilds.cache.values()));
  }
}

// Ce sera notre "singleton" exporté, mais non initialisé
export const botManager = new BotManager();
