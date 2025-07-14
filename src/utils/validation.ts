import { MessageCreateOptions } from 'discord.js';

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
export function isMessageCreateOptions(obj: unknown): obj is MessageCreateOptions {
  if (typeof obj !== 'object' || obj === null) return false;

  const message = obj as Partial<MessageCreateOptions>;

  const hasContent = typeof message.content === 'string' || message.content === undefined;
  const hasEmbeds =
    !message.embeds ||
    (Array.isArray(message.embeds) &&
      message.embeds.every(
        (e) => typeof e === 'object' && e !== null && ('title' in e || 'description' in e)
      ));

  return hasContent && hasEmbeds;
}

export function isSameShape(a: unknown, b: unknown): boolean {
  if (a === null || b === null) return a === b;

  // Array
  if (Array.isArray(a) && Array.isArray(b)) {
    return true; // on pourrait aller + loin : comparer les types internes
  }

  // Object
  if (typeof a === 'object' && typeof b === 'object') {
    for (const key of Object.keys(b)) {
      if (!(key in (a as any))) return false;
      if (!isSameShape((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
        return false;
    }
    return true;
  }

  // Primitif
  return typeof a === typeof b;
}
