import { BotCommand } from '../../../types/BotTypes';
import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import { WelcomeConfigManager } from '../../../config/managers/welcome-config';
import { AutoVoiceConfigManager } from '../../../config/managers/autovoice-config';
import { AutoRoleConfigManager } from '../../../config/managers/autorole-config';
import { CounterConfigManager } from '../../../config/managers/counter-config';
import { AutomodConfigManager } from '../../../config/managers/automod-config';
import { ModLogConfigManager } from '../../../config/managers/modlog-config';

// Define the view state types
type ViewState = 'main' | 'welcome' | 'autovoice' | 'autorole' | 'counter' | 'automod' | 'modlog';

export const setup: BotCommand = {
  slashCommand: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configuration interactive des différents modules de Koby')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: '❌ Cette commande doit être exécutée dans un serveur.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const guildId = guild.id;
    let currentView: ViewState = 'main';

    // Helper to generate components for current view
    async function renderView(): Promise<{ embeds: EmbedBuilder[]; components: any[] }> {
      // Load configurations
      const welcomeMgr = new WelcomeConfigManager(guildId);
      const autovoiceMgr = new AutoVoiceConfigManager(guildId);
      const autoroleMgr = new AutoRoleConfigManager(guildId);
      const counterMgr = new CounterConfigManager(guildId);
      const automodMgr = new AutomodConfigManager(guildId);
      const modlogMgr = new ModLogConfigManager(guildId);

      const welcomeConf = await welcomeMgr.get();
      const autovoiceConf = await autovoiceMgr.get();
      const autoroleConf = await autoroleMgr.get();
      const counterConf = await counterMgr.get();
      const automodConf = await automodMgr.get();
      const modlogConf = await modlogMgr.get();

      const embeds: EmbedBuilder[] = [];
      const components: any[] = [];

      if (currentView === 'main') {
        const embed = new EmbedBuilder()
          .setTitle('🛠️ Tableau de bord - Koby Setup')
          .setDescription('Sélectionnez un module ci-dessous pour le configurer.')
          .setColor(0x00aaff)
          .addFields(
            {
              name: '✉️ Message de Bienvenue',
              value: welcomeConf.enabled
                ? `✅ Activé\nSalon: ${welcomeConf.channelId ? `<#${welcomeConf.channelId}>` : 'Non défini'}`
                : '❌ Désactivé',
              inline: true,
            },
            {
              name: '🔊 Auto-Voice',
              value: autovoiceConf.enabled
                ? `✅ Activé\nSalons de création: ${autovoiceConf.channelsIds.length > 0 ? autovoiceConf.channelsIds.map((id) => `<#${id}>`).join(', ') : 'Aucun'}`
                : '❌ Désactivé',
              inline: true,
            },
            {
              name: '🏷️ Auto-Role',
              value: autoroleConf.enabled
                ? `✅ Activé\nRôles: ${autoroleConf.rolesIds.length > 0 ? autoroleConf.rolesIds.map((id) => `<@&${id}>`).join(', ') : 'Aucun'}\nCible: ${autoroleConf.bot ? 'Bots' : 'Humains'}`
                : '❌ Désactivé',
              inline: true,
            },
            {
              name: '📊 Compteur de Membres',
              value: counterConf.enabled
                ? `✅ Activé\nSalon: ${counterConf.channelId ? `<#${counterConf.channelId}>` : 'Non défini'}\nFormat: \`${counterConf.format}\``
                : '❌ Désactivé',
              inline: true,
            },
            {
              name: '🛡️ Automod',
              value: `Vulgarités: ${automodConf.badWordsEnabled ? '✅' : '❌'}\nAnti-Spam: ${automodConf.crossSpamEnabled ? '✅' : '❌'}\nLogs: ${automodConf.modLogChannelId ? `<#${automodConf.modLogChannelId}>` : 'Non défini'}`,
              inline: true,
            },
            {
              name: '📝 ModLog',
              value: modlogConf.enabled
                ? `✅ Activé\nSalon: ${modlogConf.channelId ? `<#${modlogConf.channelId}>` : 'Non défini'}`
                : '❌ Désactivé',
              inline: true,
            }
          )
          .setTimestamp();

        embeds.push(embed);

        const selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('setup_select_module')
            .setPlaceholder('Sélectionner un module à configurer')
            .addOptions([
              { label: 'Message de Bienvenue', value: 'welcome', emoji: '✉️' },
              { label: 'Auto-Voice', value: 'autovoice', emoji: '🔊' },
              { label: 'Auto-Role', value: 'autorole', emoji: '🏷️' },
              { label: 'Compteur de Membres', value: 'counter', emoji: '📊' },
              { label: 'Automod', value: 'automod', emoji: '🛡️' },
              { label: 'ModLog', value: 'modlog', emoji: '📝' },
            ])
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('setup_close')
            .setLabel('Fermer')
            .setStyle(ButtonStyle.Danger)
        );

        components.push(selectMenuRow, buttonRow);
      } else if (currentView === 'welcome') {
        let messageDisplay = '';
        if (welcomeConf.message.embeds && welcomeConf.message.embeds.length > 0) {
          messageDisplay = `\`\`\`json\n${JSON.stringify(welcomeConf.message, null, 2)}\n\`\`\``;
        } else if (welcomeConf.message.content) {
          messageDisplay = `\`\`\`${welcomeConf.message.content}\`\`\``;
        } else {
          messageDisplay = '*Par défaut*';
        }

        const embed = new EmbedBuilder()
          .setTitle('✉️ Configuration - Message de Bienvenue')
          .setDescription(
            `Configurez le message de bienvenue envoyé aux nouveaux membres.\n\n` +
              `**Statut**: ${welcomeConf.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Salon**: ${welcomeConf.channelId ? `<#${welcomeConf.channelId}>` : '*Non défini*'}\n` +
              `**Message**: ${messageDisplay}`
          )
          .setColor(0xe74c3c);

        embeds.push(embed);

        const channelSelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('welcome_channel_select')
            .setPlaceholder('Sélectionner le salon de bienvenue')
            .addChannelTypes(ChannelType.GuildText)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('welcome_toggle')
            .setLabel(welcomeConf.enabled ? 'Désactiver' : 'Activer')
            .setStyle(welcomeConf.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('welcome_edit_msg')
            .setLabel('Modifier le Message')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(channelSelectRow, buttonRow);
      } else if (currentView === 'autovoice') {
        const embed = new EmbedBuilder()
          .setTitle('🔊 Configuration - Auto-Voice')
          .setDescription(
            `Configurez les salons vocaux temporaires (Join-to-Create).\n\n` +
              `**Statut**: ${autovoiceConf.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Format**: \`${autovoiceConf.format}\`\n` +
              `**Catégorie temporaire**: ${autovoiceConf.tempCategory ? `<#${autovoiceConf.tempCategory}>` : '*Non définie*'}\n` +
              `**Salons déclencheurs**: ${autovoiceConf.channelsIds.length > 0 ? autovoiceConf.channelsIds.map((id) => `<#${id}>`).join(', ') : '*Aucun*'}`
          )
          .setColor(0x2ecc71);

        embeds.push(embed);

        const channelsSelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('autovoice_channels_select')
            .setPlaceholder('Sélectionner le(s) salon(s) vocal(aux) déclencheur(s)')
            .addChannelTypes(ChannelType.GuildVoice)
            .setMinValues(0)
            .setMaxValues(5)
        );

        const categorySelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('autovoice_category_select')
            .setPlaceholder('Sélectionner la catégorie temporaire')
            .addChannelTypes(ChannelType.GuildCategory)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('autovoice_toggle')
            .setLabel(autovoiceConf.enabled ? 'Désactiver' : 'Activer')
            .setStyle(autovoiceConf.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('autovoice_edit_format')
            .setLabel('Modifier le Format')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(channelsSelectRow, categorySelectRow, buttonRow);
      } else if (currentView === 'autorole') {
        const embed = new EmbedBuilder()
          .setTitle('🏷️ Configuration - Auto-Role')
          .setDescription(
            `Configurez les rôles attribués automatiquement lors de l'arrivée.\n\n` +
              `**Statut**: ${autoroleConf.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Cible**: ${autoroleConf.bot ? '🤖 Bots uniquement' : '👤 Humains uniquement'}\n` +
              `**Rôles**: ${autoroleConf.rolesIds.length > 0 ? autoroleConf.rolesIds.map((id) => `<@&${id}>`).join(', ') : '*Aucun*'}`
          )
          .setColor(0x9b59b6);

        embeds.push(embed);

        const roleSelectRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('autorole_roles_select')
            .setPlaceholder('Sélectionner le(s) rôle(s) à attribuer')
            .setMinValues(0)
            .setMaxValues(5)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('autorole_toggle')
            .setLabel(autoroleConf.enabled ? 'Désactiver' : 'Activer')
            .setStyle(autoroleConf.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('autorole_toggle_bot')
            .setLabel(autoroleConf.bot ? 'Cible : Humains' : 'Cible : Bots')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(roleSelectRow, buttonRow);
      } else if (currentView === 'counter') {
        const embed = new EmbedBuilder()
          .setTitle('📊 Configuration - Compteur de Membres')
          .setDescription(
            `Configurez le salon qui affiche le nombre de membres.\n\n` +
              `**Statut**: ${counterConf.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Salon**: ${counterConf.channelId ? `<#${counterConf.channelId}>` : '*Non défini*'}\n` +
              `**Format**: \`${counterConf.format}\``
          )
          .setColor(0xf1c40f);

        embeds.push(embed);

        const channelSelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('counter_channel_select')
            .setPlaceholder('Sélectionner le salon (Textuel ou Vocal)')
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildText)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('counter_toggle')
            .setLabel(counterConf.enabled ? 'Désactiver' : 'Activer')
            .setStyle(counterConf.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('counter_edit_format')
            .setLabel('Modifier le Format')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(channelSelectRow, buttonRow);
      } else if (currentView === 'automod') {
        const embed = new EmbedBuilder()
          .setTitle('🛡️ Configuration - Automod')
          .setDescription(
            `Configurez le module de modération automatique.\n\n` +
              `**Filtre de vulgarités**: ${automodConf.badWordsEnabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Filtre anti-spam**: ${automodConf.crossSpamEnabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Seuil d'avertissements**: \`${automodConf.warnThreshold}\` avertissements\n` +
              `**Salon des logs**: ${automodConf.modLogChannelId ? `<#${automodConf.modLogChannelId}>` : '*Non défini*'}`
          )
          .setColor(0xe67e22);

        embeds.push(embed);

        const channelSelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('automod_channel_select')
            .setPlaceholder('Sélectionner le salon des logs Automod')
            .addChannelTypes(ChannelType.GuildText)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('automod_toggle_badwords')
            .setLabel('Vulgarités')
            .setStyle(automodConf.badWordsEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('automod_toggle_crossspam')
            .setLabel('Anti-Spam')
            .setStyle(automodConf.crossSpamEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('automod_edit_threshold')
            .setLabel('Modifier le Seuil')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(channelSelectRow, buttonRow);
      } else if (currentView === 'modlog') {
        const embed = new EmbedBuilder()
          .setTitle('📝 Configuration - ModLog')
          .setDescription(
            `Configurez les logs d'activité du serveur (messages supprimés, rôles modifiés, bans, etc.).\n\n` +
              `**Statut**: ${modlogConf.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
              `**Salon de log**: ${modlogConf.channelId ? `<#${modlogConf.channelId}>` : '*Non défini*'}`
          )
          .setColor(0x34495e);

        embeds.push(embed);

        const channelSelectRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('modlog_channel_select')
            .setPlaceholder('Sélectionner le salon de logs général')
            .addChannelTypes(ChannelType.GuildText)
        );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('modlog_toggle')
            .setLabel(modlogConf.enabled ? 'Désactiver' : 'Activer')
            .setStyle(modlogConf.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('setup_back')
            .setLabel('Retour')
            .setStyle(ButtonStyle.Secondary)
        );

        components.push(channelSelectRow, buttonRow);
      }

      return { embeds, components };
    }

    // Send initial response
    const { embeds, components } = await renderView();
    const replyMessage = await interaction.reply({
      embeds,
      components,
      flags: MessageFlags.Ephemeral,
      fetchReply: true,
    });

    // Create interaction collector
    const collector = replyMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 600000, // 10 minutes
    });

    collector.on('collect', (componentInteraction) => {
      void (async () => {
        const customId = componentInteraction.customId;

        // Handle general navigation/control
        if (customId === 'setup_close') {
          collector.stop('user_closed');
          return;
        }

        if (customId === 'setup_back') {
          currentView = 'main';
          const render = await renderView();
          await componentInteraction.update({
            embeds: render.embeds,
            components: render.components,
          });
          return;
        }

        if (customId === 'setup_select_module') {
          if (componentInteraction.isStringSelectMenu()) {
            currentView = componentInteraction.values[0] as ViewState;
            const render = await renderView();
            await componentInteraction.update({
              embeds: render.embeds,
              components: render.components,
            });
          }
          return;
        }

        // Handle Module-Specific Actions
        const welcomeMgr = new WelcomeConfigManager(guildId);
        const autovoiceMgr = new AutoVoiceConfigManager(guildId);
        const autoroleMgr = new AutoRoleConfigManager(guildId);
        const counterMgr = new CounterConfigManager(guildId);
        const automodMgr = new AutomodConfigManager(guildId);
        const modlogMgr = new ModLogConfigManager(guildId);

        // --- WELCOME MESSAGE ---
        if (currentView === 'welcome') {
          const conf = await welcomeMgr.get();
          if (customId === 'welcome_toggle') {
            conf.enabled = !conf.enabled;
            await welcomeMgr.save(conf);
          } else if (
            customId === 'welcome_channel_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.channelId = componentInteraction.values[0];
            await welcomeMgr.save(conf);
          } else if (customId === 'welcome_edit_msg') {
            // Open Modal for welcome message content
            const modal = new ModalBuilder()
              .setCustomId('welcome_modal')
              .setTitle('Message de Bienvenue');

            let modalValue = '';
            if (conf.message.embeds && conf.message.embeds.length > 0) {
              modalValue = JSON.stringify(conf.message, null, 2);
            } else {
              modalValue = conf.message.content || '';
            }

            const messageInput = new TextInputBuilder()
              .setCustomId('welcome_text_input')
              .setLabel('Texte simple ou JSON complet')
              .setStyle(TextInputStyle.Paragraph)
              .setValue(modalValue)
              .setRequired(true)
              .setPlaceholder(
                'Ex: Bienvenue %username% ou {"content": "Bienvenue", "embeds": [{"title": "Bienvenue"}]}'
              );

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);
            modal.addComponents(row);

            await componentInteraction.showModal(modal);

            try {
              const submission = await componentInteraction.awaitModalSubmit({
                filter: (i) => i.customId === 'welcome_modal' && i.user.id === interaction.user.id,
                time: 120000,
              });

              const text = submission.fields.getTextInputValue('welcome_text_input');
              const trimmed = text.trim();
              let parseError = false;

              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
                  if (parsed && typeof parsed === 'object') {
                    const contentVal = typeof parsed.content === 'string' ? parsed.content : '';
                    const embedsVal = Array.isArray(parsed.embeds)
                      ? (parsed.embeds as unknown as APIEmbed[])
                      : [];

                    if ('content' in parsed || 'embeds' in parsed) {
                      conf.message = {
                        content: contentVal,
                        embeds: embedsVal,
                      };
                    } else {
                      conf.message = {
                        content: '',
                        embeds: [parsed as unknown as APIEmbed],
                      };
                    }
                  } else {
                    conf.message = {
                      content: text,
                      embeds: [],
                    };
                  }
                } catch {
                  parseError = true;
                  await submission.reply({
                    content: '❌ Le JSON fourni est invalide. Veuillez vérifier la syntaxe.',
                    flags: MessageFlags.Ephemeral,
                  });
                }
              } else {
                conf.message = {
                  content: text,
                  embeds: [],
                };
              }

              if (!parseError) {
                await welcomeMgr.save(conf);
                await submission.deferUpdate();
                const render = await renderView();
                await interaction.editReply({
                  embeds: render.embeds,
                  components: render.components,
                });
              }
            } catch (err) {
              console.error('Modal welcome timeout or error:', err);
            }
            return;
          }
        }

        // --- AUTO-VOICE ---
        if (currentView === 'autovoice') {
          const conf = await autovoiceMgr.get();
          if (customId === 'autovoice_toggle') {
            conf.enabled = !conf.enabled;
            await autovoiceMgr.save(conf);
          } else if (
            customId === 'autovoice_channels_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.channelsIds = componentInteraction.values;
            await autovoiceMgr.save(conf);
          } else if (
            customId === 'autovoice_category_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.tempCategory = componentInteraction.values[0];
            await autovoiceMgr.save(conf);
          } else if (customId === 'autovoice_edit_format') {
            const modal = new ModalBuilder()
              .setCustomId('autovoice_modal')
              .setTitle('Format du salon Auto-Voice');

            const formatInput = new TextInputBuilder()
              .setCustomId('autovoice_format_input')
              .setLabel('Format du nom du salon')
              .setStyle(TextInputStyle.Short)
              .setValue(conf.format)
              .setRequired(true)
              .setPlaceholder('Ex: Salon de %user%');

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(formatInput);
            modal.addComponents(row);

            await componentInteraction.showModal(modal);

            try {
              const submission = await componentInteraction.awaitModalSubmit({
                filter: (i) =>
                  i.customId === 'autovoice_modal' && i.user.id === interaction.user.id,
                time: 60000,
              });

              conf.format = submission.fields.getTextInputValue('autovoice_format_input');
              await autovoiceMgr.save(conf);

              await submission.deferUpdate();
              const render = await renderView();
              await interaction.editReply({
                embeds: render.embeds,
                components: render.components,
              });
            } catch (err) {
              console.error('Modal autovoice timeout or error:', err);
            }
            return;
          }
        }

        // --- AUTO-ROLE ---
        if (currentView === 'autorole') {
          const conf = await autoroleMgr.get();
          if (customId === 'autorole_toggle') {
            conf.enabled = !conf.enabled;
            await autoroleMgr.save(conf);
          } else if (customId === 'autorole_toggle_bot') {
            conf.bot = !conf.bot;
            await autoroleMgr.save(conf);
          } else if (
            customId === 'autorole_roles_select' &&
            componentInteraction.isRoleSelectMenu()
          ) {
            conf.rolesIds = componentInteraction.values;
            await autoroleMgr.save(conf);
          }
        }

        // --- MEMBER COUNTER ---
        if (currentView === 'counter') {
          const conf = await counterMgr.get();
          if (customId === 'counter_toggle') {
            conf.enabled = !conf.enabled;
            await counterMgr.save(conf);
          } else if (
            customId === 'counter_channel_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.channelId = componentInteraction.values[0];
            await counterMgr.save(conf);
          } else if (customId === 'counter_edit_format') {
            const modal = new ModalBuilder()
              .setCustomId('counter_modal')
              .setTitle('Format du compteur de membres');

            const formatInput = new TextInputBuilder()
              .setCustomId('counter_format_input')
              .setLabel('Format (ex: {count} membres)')
              .setStyle(TextInputStyle.Short)
              .setValue(conf.format)
              .setRequired(true)
              .setPlaceholder('Ex: {count} Membres');

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(formatInput);
            modal.addComponents(row);

            await componentInteraction.showModal(modal);

            try {
              const submission = await componentInteraction.awaitModalSubmit({
                filter: (i) => i.customId === 'counter_modal' && i.user.id === interaction.user.id,
                time: 60000,
              });

              conf.format = submission.fields.getTextInputValue('counter_format_input');
              await counterMgr.save(conf);

              await submission.deferUpdate();
              const render = await renderView();
              await interaction.editReply({
                embeds: render.embeds,
                components: render.components,
              });
            } catch (err) {
              console.error('Modal counter timeout or error:', err);
            }
            return;
          }
        }

        // --- AUTOMOD ---
        if (currentView === 'automod') {
          const conf = await automodMgr.get();
          if (customId === 'automod_toggle_badwords') {
            conf.badWordsEnabled = !conf.badWordsEnabled;
            await automodMgr.save(conf);
          } else if (customId === 'automod_toggle_crossspam') {
            conf.crossSpamEnabled = !conf.crossSpamEnabled;
            await automodMgr.save(conf);
          } else if (
            customId === 'automod_channel_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.modLogChannelId = componentInteraction.values[0];
            await automodMgr.save(conf);
          } else if (customId === 'automod_edit_threshold') {
            const modal = new ModalBuilder()
              .setCustomId('automod_modal')
              .setTitle("Seuil d'avertissements Automod");

            const thresholdInput = new TextInputBuilder()
              .setCustomId('automod_threshold_input')
              .setLabel("Nombre d'alertes avant action")
              .setStyle(TextInputStyle.Short)
              .setValue(conf.warnThreshold.toString())
              .setRequired(true)
              .setPlaceholder('Ex: 3');

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(thresholdInput);
            modal.addComponents(row);

            await componentInteraction.showModal(modal);

            try {
              const submission = await componentInteraction.awaitModalSubmit({
                filter: (i) => i.customId === 'automod_modal' && i.user.id === interaction.user.id,
                time: 60000,
              });

              const parsedVal = parseInt(
                submission.fields.getTextInputValue('automod_threshold_input'),
                10
              );
              if (!isNaN(parsedVal) && parsedVal > 0) {
                conf.warnThreshold = parsedVal;
                await automodMgr.save(conf);
              }

              await submission.deferUpdate();
              const render = await renderView();
              await interaction.editReply({
                embeds: render.embeds,
                components: render.components,
              });
            } catch (err) {
              console.error('Modal automod timeout or error:', err);
            }
            return;
          }
        }

        // --- MODLOG ---
        if (currentView === 'modlog') {
          const conf = await modlogMgr.get();
          if (customId === 'modlog_toggle') {
            conf.enabled = !conf.enabled;
            await modlogMgr.save(conf);
          } else if (
            customId === 'modlog_channel_select' &&
            componentInteraction.isChannelSelectMenu()
          ) {
            conf.channelId = componentInteraction.values[0];
            await modlogMgr.save(conf);
          }
        }

        // Refresh view for any other interactions
        const render = await renderView();
        await componentInteraction.update({
          embeds: render.embeds,
          components: render.components,
        });
      })();
    });

    collector.on('end', (_, reason) => {
      void (async () => {
        if (reason === 'user_closed') {
          await interaction.deleteReply().catch(() => {});
        } else {
          // Disable components on timeout
          const render = await renderView();
          const disabledComponents = (render.components as unknown[]).map((rawRow) => {
            const row = rawRow as Record<string, unknown>;
            if (row && 'components' in row && Array.isArray(row.components)) {
              const componentsArray = row.components as unknown[];
              componentsArray.forEach((rawC) => {
                const c = rawC as Record<string, unknown>;
                if (c && 'setDisabled' in c && typeof c.setDisabled === 'function') {
                  (c as { setDisabled: (disabled: boolean) => unknown }).setDisabled(true);
                }
              });
            }
            return row;
          });

          await interaction
            .editReply({
              embeds: [
                ...render.embeds,
                new EmbedBuilder()
                  .setDescription('⏳ Cette interaction a expiré. Relancez la commande `/setup`.')
                  .setColor(0x7f8c8d),
              ],
              components: disabledComponents,
            })
            .catch(() => {});
        }
      })();
    });
  },
};
