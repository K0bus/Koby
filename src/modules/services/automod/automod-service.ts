import { GuildSettingsService } from '../../../db';
import { BADWORDS } from './badwords-list';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Remove duplicate spaces
    .trim();
}

export function checkBadWords(content: string): boolean {
  const normalizedContent = normalizeText(content);
  if (!normalizedContent) return false;

  const contentWords = normalizedContent.split(' ');

  return BADWORDS.some((badword) => {
    const normalizedBadword = normalizeText(badword);
    if (!normalizedBadword) return false;

    if (normalizedBadword.includes(' ')) {
      // Phrase match using word boundaries
      const regex = new RegExp(`\\b${normalizedBadword}\\b`, 'i');
      return regex.test(normalizedContent);
    } else {
      // Exact word match
      return contentWords.includes(normalizedBadword);
    }
  });
}

export interface SpamEntry {
  content: string;
  channelId: string;
  messageId: string;
  timestamp: number;
}

const spamCache = new Map<string, SpamEntry[]>();

export function checkCrossSpam(
  userId: string,
  channelId: string,
  content: string,
  config: any,
  messageId?: string
): boolean {
  const now = Date.now();
  const cleanContent = content.trim().toLowerCase();

  // Get current user entries and filter out ones older than 5000ms
  let entries = spamCache.get(userId) || [];
  entries = entries.filter((entry) => now - entry.timestamp <= 5000);

  // Add the new entry if we have a message ID
  if (messageId) {
    entries.push({
      content: cleanContent,
      channelId,
      messageId,
      timestamp: now,
    });
  }

  spamCache.set(userId, entries);

  // Check unique channels for this exact clean content
  const uniqueChannels = new Set<string>();
  for (const entry of entries) {
    if (entry.content === cleanContent) {
      uniqueChannels.add(entry.channelId);
    }
  }

  // If unique channel count >= 3, it's cross-spam
  return uniqueChannels.size >= 3;
}

export function getSpamEntries(userId: string, content: string): SpamEntry[] {
  const cleanContent = content.trim().toLowerCase();
  const entries = spamCache.get(userId) || [];
  return entries.filter((entry) => entry.content === cleanContent);
}

export function clearUserSpamCache(userId: string): void {
  spamCache.delete(userId);
}

export class AutomodWarningsService {
  static async get(guildId: string, userId: string): Promise<number> {
    const setting = await GuildSettingsService.get(guildId, `automod_warnings_${userId}`);
    if (setting && typeof setting.settingValue === 'object' && setting.settingValue !== null) {
      const val = setting.settingValue as Record<string, unknown>;
      if (typeof val.count === 'number') {
        return val.count;
      }
    }
    return 0;
  }

  static async increment(guildId: string, userId: string): Promise<number> {
    const current = await this.get(guildId, userId);
    const next = current + 1;
    await GuildSettingsService.set(guildId, `automod_warnings_${userId}`, { count: next });
    return next;
  }

  static async reset(guildId: string, userId: string): Promise<void> {
    try {
      await GuildSettingsService.remove(guildId, `automod_warnings_${userId}`);
    } catch {
      // Ignored if the setting row didn't exist
    }
  }
}
