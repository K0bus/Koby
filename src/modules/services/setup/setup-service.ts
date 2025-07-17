import {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from 'discord.js';

export async function mainSetup(interaction: ChatInputCommandInteraction): Promise<void> {
  const select = new StringSelectMenuBuilder()
    .setCustomId('setting_main_menu')
    .setPlaceholder('Make a selection!')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Welcome Message').setValue('welcomemessage'),
      new StringSelectMenuOptionBuilder().setLabel('Mod Log').setValue('modlog'),
      new StringSelectMenuOptionBuilder().setLabel('Counter').setValue('counter'),
      new StringSelectMenuOptionBuilder().setLabel('AutoVoice').setValue('autovoice'),
      new StringSelectMenuOptionBuilder().setLabel('AutoRole').setValue('autorole')
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  await interaction.reply({
    content: 'Choisissez le module à paramétrer',
    components: [row],
  });
}
