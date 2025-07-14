import { Client, Events, VoiceState } from 'discord.js';
import { AutoVoiceConfig, AutoVoiceConfigManager } from '../../../config/managers/autovoice-config';
import {
  handleVoiceJoin,
  handleVoiceLeave,
  isAutoVoiceChannel,
} from '../../services/autovoice-service';
import { BotEvent } from '../../../types/BotTypes';

export const autovoiceVoiceStateUpdate: BotEvent = {
  eventType: Events.VoiceStateUpdate,
  async execute(client: Client, oldState: VoiceState, newState: VoiceState) {
    const config: AutoVoiceConfig = await new AutoVoiceConfigManager(oldState.guild.id).get();

    if (newState.channel && isAutoVoiceChannel(newState.channel.id, config)) {
      await handleVoiceJoin(client, newState, config);
    }

    if (oldState.channel) {
      await handleVoiceLeave(client, oldState, config);
    }
  },
  once: false,
};
