import {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  Events,
  GuildMember,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  VoiceChannel,
} from 'discord.js';
import { BotEvent } from '../../../types/BotTypes';
import { fetchOwnerId, OWNER_FIELD_NAME } from '../../services/autovoice-service';
import { AutoVoiceConfig, AutoVoiceConfigManager } from '../../../config/managers/autovoice-config';

export const autovoiceInteractionCreate: BotEvent = {
  eventType: Events.InteractionCreate,
  async execute(client: Client, interaction: Interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isUserSelectMenu())
      return;
    if (!interaction.customId.startsWith('autovoice_')) return;

    const channel = interaction.channel;
    if (!channel || !channel.isVoiceBased()) {
      await interaction.reply({
        content: "❌ Ce salon n'est pas un salon vocal.",
        ephemeral: true,
      });
      return;
    }

    const voiceChannel = channel as VoiceChannel;
    const ownerId = await fetchOwnerId(voiceChannel, client);

    // Specific logic for Claiming the channel, where non-owners are allowed to interact
    if (interaction.customId === 'autovoice_claim') {
      const isOwnerInChannel = voiceChannel.members.has(ownerId);
      if (isOwnerInChannel) {
        if (ownerId === interaction.user.id) {
          await interaction.reply({
            content: '❌ Vous êtes déjà le propriétaire de ce salon.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Le propriétaire actuel est toujours présent dans le salon.',
            ephemeral: true,
          });
        }
        return;
      }

      const newOwner = interaction.member as GuildMember;
      const config: AutoVoiceConfig = await new AutoVoiceConfigManager(interaction.guildId!).get();
      await voiceChannel.setName(config.format.replace('%user%', newOwner.displayName));

      const message = interaction.message;
      if (message && message.embeds[0]) {
        const updatedEmbed = EmbedBuilder.from(message.embeds[0]).setFields(
          message.embeds[0].fields.map(
            (field: { name: string; value: string; inline?: boolean }) =>
              field.name === OWNER_FIELD_NAME ? { ...field, value: `<@${newOwner.id}>` } : field
          )
        );
        await message.edit({ embeds: [updatedEmbed] });
      }

      await interaction.reply({
        content: `👑 Vous êtes maintenant le nouveau propriétaire du salon vocal !`,
        ephemeral: true,
      });
      return;
    }

    // For all other actions, verify owner permissions
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: '❌ Seul le propriétaire du salon peut utiliser ces commandes.',
        ephemeral: true,
      });
      return;
    }

    // Button interactions
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'autovoice_lock':
          await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
            Connect: false,
          });
          await interaction.reply({ content: '🔒 Le salon a été verrouillé.', ephemeral: true });
          break;

        case 'autovoice_unlock':
          await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
            Connect: null,
          });
          await interaction.reply({ content: '🔓 Le salon a été déverrouillé.', ephemeral: true });
          break;

        case 'autovoice_hide':
          await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
            ViewChannel: false,
          });
          await interaction.reply({
            content: '🙈 Le salon est maintenant masqué.',
            ephemeral: true,
          });
          break;

        case 'autovoice_unhide':
          await voiceChannel.permissionOverwrites.edit(voiceChannel.guild.roles.everyone, {
            ViewChannel: null,
          });
          await interaction.reply({
            content: '👁️ Le salon est maintenant visible.',
            ephemeral: true,
          });
          break;

        case 'autovoice_rename': {
          const modal = new ModalBuilder()
            .setCustomId('autovoice_modal_rename')
            .setTitle('Renommer le salon');

          const nameInput = new TextInputBuilder()
            .setCustomId('new_name')
            .setLabel('Nouveau nom du salon')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Gaming, Blabla...')
            .setRequired(true)
            .setMaxLength(100);

          const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
          modal.addComponents(row);

          await interaction.showModal(modal);
          break;
        }

        case 'autovoice_limit': {
          const modal = new ModalBuilder()
            .setCustomId('autovoice_modal_limit')
            .setTitle("Limite d'utilisateurs");

          const limitInput = new TextInputBuilder()
            .setCustomId('user_limit')
            .setLabel('Limite (0 pour aucune, max 99)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 5')
            .setRequired(true)
            .setMaxLength(2);

          const row = new ActionRowBuilder<TextInputBuilder>().addComponents(limitInput);
          modal.addComponents(row);

          await interaction.showModal(modal);
          break;
        }

        case 'autovoice_trust': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('autovoice_select_trust')
            .setPlaceholder('Sélectionnez un membre à autoriser')
            .setMinValues(1)
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectMenu);

          await interaction.reply({
            content: 'Sélectionnez un membre à autoriser dans votre salon :',
            components: [row],
            ephemeral: true,
          });
          break;
        }

        case 'autovoice_kick': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('autovoice_select_kick')
            .setPlaceholder('Sélectionnez un membre à expulser')
            .setMinValues(1)
            .setMaxValues(1);

          const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectMenu);

          await interaction.reply({
            content: 'Sélectionnez un membre à expulser du salon vocal :',
            components: [row],
            ephemeral: true,
          });
          break;
        }
      }
    }

    // Modal submit interactions
    if (interaction.isModalSubmit()) {
      switch (interaction.customId) {
        case 'autovoice_modal_rename': {
          const newName = interaction.fields.getTextInputValue('new_name');
          await voiceChannel.setName(newName);
          await interaction.reply({
            content: `📝 Le salon a été renommé en **${newName}**.`,
            ephemeral: true,
          });
          break;
        }

        case 'autovoice_modal_limit': {
          const limitStr = interaction.fields.getTextInputValue('user_limit');
          const limit = parseInt(limitStr, 10);
          if (isNaN(limit) || limit < 0 || limit > 99) {
            await interaction.reply({
              content: '❌ Veuillez entrer un nombre valide entre 0 et 99.',
              ephemeral: true,
            });
            return;
          }
          await voiceChannel.setUserLimit(limit);
          await interaction.reply({
            content:
              limit === 0
                ? "👥 La limite d'utilisateurs a été retirée."
                : `👥 La limite d'utilisateurs a été fixée à **${limit}**.`,
            ephemeral: true,
          });
          break;
        }
      }
    }

    // User select menu interactions
    if (interaction.isUserSelectMenu()) {
      switch (interaction.customId) {
        case 'autovoice_select_trust': {
          const targetId = interaction.values[0];
          await voiceChannel.permissionOverwrites.edit(targetId, {
            Connect: true,
            ViewChannel: true,
          });
          await interaction.reply({
            content: `✅ <@${targetId}> a maintenant l'autorisation de rejoindre ce salon.`,
            ephemeral: true,
          });
          break;
        }

        case 'autovoice_select_kick': {
          const targetId = interaction.values[0];
          const targetMember = await interaction.guild?.members.fetch(targetId);
          if (!targetMember) {
            await interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
            return;
          }
          if (targetMember.voice.channelId !== voiceChannel.id) {
            await interaction.reply({
              content: "❌ Ce membre n'est pas dans votre salon vocal.",
              ephemeral: true,
            });
            return;
          }
          await voiceChannel.permissionOverwrites.edit(targetId, {
            Connect: false,
          });
          await targetMember.voice.disconnect();
          await interaction.reply({
            content: `🚷 <@${targetId}> a été expulsé du salon vocal.`,
            ephemeral: true,
          });
          break;
        }
      }
    }
  },
  once: false,
};
