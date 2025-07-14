import { createClient } from './bot/client';
import { Bot } from './types/BotTypes';
import botConfig from '../config/bots.json';

botConfig.forEach((data: Bot) => {
  createClient(data);
});
