import { BotEvent } from '../../../types/BotTypes';
import { Client, Events, Message, TextChannel } from 'discord.js';
import { AutomodConfigManager } from '../../../config/managers/automod-config';
import {
  checkBadWords,
  checkCrossSpam,
  getSpamEntries,
  clearUserSpamCache,
  AutomodWarningsService,
} from '../../services/automod/automod-service';

async function logToModChannel(client: Client, channelId: string | null, embed: any) {
  if (!channelId) return;
  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to log automod action:', err);
  }
}

export const messageCreate: BotEvent = {
  eventType: Events.MessageCreate,
  once: false,
  async execute(client: Client, message: Message) {
    // 1. Ignore bot messages and non-guild messages
    if (message.author.bot || !message.guild || !message.member) return;

    // 2. Fetch automod configuration
    const configManager = new AutomodConfigManager(message.guild.id);
    const config = await configManager.get();

    const textChannel = message.channel as TextChannel;

    // 3. Badwords filtering
    if (config.badWordsEnabled) {
      const isBad = checkBadWords(message.content);
      if (isBad) {
        // Delete message
        await message.delete().catch(() => {});

        // Increment infractions
        const warnings = await AutomodWarningsService.increment(
          message.guild.id,
          message.author.id
        );

        if (warnings >= config.warnThreshold) {
          // Timeout sanction
          let timeoutSuccess = true;
          const timeoutDuration = 5 * 60 * 1000; // 5 minutes
          await message.member
            .timeout(timeoutDuration, 'Automod: Seuil de vulgarités dépassé')
            .catch((err) => {
              console.error('Failed to timeout member:', err);
              timeoutSuccess = false;
            });

          // Reset warning count
          await AutomodWarningsService.reset(message.guild.id, message.author.id);

          // Warn user in channel
          const warnMsg = await textChannel
            .send(
              `🔇 <@${message.author.id}> a été exclu temporairement de 5 minutes pour vulgarités répétées.`
            )
            .catch(() => null);
          if (warnMsg) {
            setTimeout(() => {
              warnMsg.delete().catch(() => {});
            }, 5000);
          }

          // Send logs
          const logEmbed = {
            title: "🔨 Automod - Seuil d'infractions atteint",
            color: 0xe74c3c, // Red
            fields: [
              {
                name: 'Membre',
                value: `<@${message.author.id}> (${message.author.tag})`,
                inline: true,
              },
              { name: 'Salon', value: `<#${message.channelId}>`, inline: true },
              { name: 'Seuil atteint', value: `${config.warnThreshold} infractions`, inline: true },
              {
                name: 'Sanction',
                value: `Exclusion temporaire (5 minutes)${timeoutSuccess ? '' : ' (Échec: permissions insuffisantes)'}`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          };
          await logToModChannel(client, config.modLogChannelId, logEmbed);
        } else {
          // Warn user in channel
          const warnMsg = await textChannel
            .send(
              `⚠️ <@${message.author.id}>, les vulgarités ne sont pas autorisées sur ce serveur. (${warnings}/${config.warnThreshold})`
            )
            .catch(() => null);
          if (warnMsg) {
            setTimeout(() => {
              warnMsg.delete().catch(() => {});
            }, 5000);
          }

          // Send logs
          const logEmbed = {
            title: '📯 Automod - Vulgarité détectée',
            color: 0xf1c40f, // Yellow
            fields: [
              {
                name: 'Membre',
                value: `<@${message.author.id}> (${message.author.tag})`,
                inline: true,
              },
              { name: 'Salon', value: `<#${message.channelId}>`, inline: true },
              { name: 'Infractions', value: `${warnings} / ${config.warnThreshold}`, inline: true },
              {
                name: 'Message supprimé',
                value: `\`\`\`${message.content.substring(0, 1000)}\`\`\``,
              },
            ],
            timestamp: new Date().toISOString(),
          };
          await logToModChannel(client, config.modLogChannelId, logEmbed);
        }
        return; // Stop processing other filters once message is deleted
      }
    }

    // 4. Cross-spam filtering
    if (config.crossSpamEnabled) {
      const isSpam = checkCrossSpam(
        message.author.id,
        message.channel.id,
        message.content,
        config,
        message.id
      );

      if (isSpam) {
        // Apply native timeout immediately (10 minutes)
        let timeoutSuccess = true;
        const timeoutDuration = 10 * 60 * 1000; // 10 minutes
        await message.member
          .timeout(timeoutDuration, 'Automod: Cross-Spam détecté')
          .catch((err) => {
            console.error('Failed to timeout member:', err);
            timeoutSuccess = false;
          });

        // Delete all spam messages in cache
        const spamEntries = getSpamEntries(message.author.id, message.content);
        const deletedChannels: string[] = [];

        for (const entry of spamEntries) {
          try {
            const chan = await message.guild.channels.fetch(entry.channelId).catch(() => null);
            if (chan && chan.isTextBased()) {
              const msg = await chan.messages.fetch(entry.messageId).catch(() => null);
              if (msg) {
                await msg.delete().catch(() => {});
                if (!deletedChannels.includes(`<#${entry.channelId}>`)) {
                  deletedChannels.push(`<#${entry.channelId}>`);
                }
              }
            }
          } catch (err) {
            console.error(
              `Failed to delete spam message ${entry.messageId} in channel ${entry.channelId}:`,
              err
            );
          }
        }

        // Delete current message if it failed in loop
        await message.delete().catch(() => {});

        // Clear spam cache for this user
        clearUserSpamCache(message.author.id);

        // Warn user in channel
        const warnMsg = await textChannel
          .send(
            `🔇 <@${message.author.id}> a été exclu temporairement de 10 minutes pour cross-spam.`
          )
          .catch(() => null);
        if (warnMsg) {
          setTimeout(() => {
            warnMsg.delete().catch(() => {});
          }, 5000);
        }

        // Send alert logs
        const logEmbed = {
          title: '🚨 Automod - Alerte Cross-Spam détecté',
          color: 0xe74c3c, // Red
          fields: [
            {
              name: 'Membre',
              value: `<@${message.author.id}> (${message.author.tag})`,
              inline: true,
            },
            {
              name: 'Sanction',
              value: `Exclusion temporaire (10 minutes)${timeoutSuccess ? '' : ' (Échec: permissions insuffisantes)'}`,
              inline: true,
            },
            {
              name: 'Salons ciblés',
              value:
                deletedChannels.length > 0 ? deletedChannels.join(', ') : `<#${message.channelId}>`,
            },
            { name: 'Message spamé', value: `\`\`\`${message.content.substring(0, 1000)}\`\`\`` },
          ],
          timestamp: new Date().toISOString(),
        };
        await logToModChannel(client, config.modLogChannelId, logEmbed);
      }
    }
  },
};
