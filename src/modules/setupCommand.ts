import {
    ActionRowBuilder, Client,
    EmbedBuilder, Events, Interaction,
    MessageFlags, ModalBuilder, PermissionFlagsBits,
    SlashCommandBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle
} from "discord.js";

import { MovieDb } from "moviedb-promise";

import { BotModule } from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";
import {WelcomeConfig} from "./welcomeMessages";
import MemberCounter, {CounterConfig} from "./memberCounter";
import {AutoVoiceConfig} from "./autoVoice";

const simpleCommands: BotModule = {
    name: "simpleCommands",
    commands: [
        {
            slashCommand: new SlashCommandBuilder()
                .setName("setup")
                .setDescription("Renvoie les informatios du Bot Discord"),
            async execute(client, interaction) {
                const embed = new EmbedBuilder()
                    .setTitle("🔧 Configuration des modules")
                    .setDescription("Sélectionnez un module à configurer")
                    .setColor(0x00b0f4);
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("selectModule")
                    .setPlaceholder("Choisissez un module à configurer")
                    .addOptions([
                        {
                            label: "AutoVoice",
                            value: "autoVoice",
                            description: "Configurer les salons vocaux temporaires",
                        },
                        {
                            label: "Welcome",
                            value: "welcomeMessage",
                            description: "Configurer le message de bienvenue",
                        },
                        {
                            label: "AutoRole",
                            value: "autoRole",
                            description: "Configurer les rôles automatiques",
                        },
                        {
                            label: "Counter",
                            value: "memberCounter",
                            description: "Configurer le compteur de membres",
                        },
                    ]);
                const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
                await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    ],
    event: [
        {
            eventType: Events.InteractionCreate,
            once: false,
            async execute(client: Client, interaction: Interaction) {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return;
                if (interaction.isStringSelectMenu()) {
                    if (interaction.customId !== "selectModule") return;

                    const selected = interaction.values[0]; // ex: "welcome"

                    if (selected === "welcomeMessage") {
                        const config = ConfigManager.getConfig<WelcomeConfig>(
                            "welcomeMessage",
                            interaction.guild?.id
                        );
                        const modal = new ModalBuilder()
                            .setCustomId("modalSetupWelcome")
                            .setTitle("🔧 Configurer le module Welcome");

                        const channelIdInput = new TextInputBuilder()
                            .setCustomId("channelId")
                            .setLabel("ID du salon de bienvenue")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("123456789012345678")
                            .setRequired(true)
                            .setValue(config.channelId)

                        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput);

                        await interaction.showModal(modal.addComponents(row1));
                    } else if (selected === "memberCounter") {
                        const config = ConfigManager.getConfig<CounterConfig>(
                            "memberCounter",
                            interaction.guild?.id
                        );
                        const modal = new ModalBuilder()
                            .setCustomId("modalSetupCounter")
                            .setTitle("🔧 Configurer le module Counter");

                        const channelIdInput = new TextInputBuilder()
                            .setCustomId("channelId")
                            .setLabel("ID du salon de bienvenue")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("123456789012345678")
                            .setRequired(true)
                            .setValue(config.channelId)

                        const formatInput = new TextInputBuilder()
                            .setCustomId("format")
                            .setLabel("Format du compteur")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("👀 Users : %count%")
                            .setRequired(true)
                            .setValue(config.format)

                        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput);
                        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(formatInput);

                        await interaction.showModal(modal.addComponents(row1, row2));
                    } else if (selected === "memberCounter") {
                        const config = ConfigManager.getConfig<AutoVoiceConfig>(
                            "autoVoice",
                            interaction.guild?.id
                        );
                        const modal = new ModalBuilder()
                            .setCustomId("modalSetupAutoVoice")
                            .setTitle("🔧 Configurer le module Counter");

                        const channelIdInput = new TextInputBuilder()
                            .setCustomId("channelId")
                            .setLabel("ID du salon de bienvenue")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("123456789012345678")
                            .setRequired(true)
                            .setValue(config.channelsIds[0])

                        const formatInput = new TextInputBuilder()
                            .setCustomId("format")
                            .setLabel("Format du canal temporaire")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("\uD83D\uDCAC %user%")
                            .setRequired(true)
                            .setValue(config.format)

                        const categoryInput = new TextInputBuilder()
                            .setCustomId("tempCategory")
                            .setLabel("Catégorie de création des canaux temporaire")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("123456789012345678")
                            .setRequired(true)
                            .setValue(config.tempCategory)

                        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(channelIdInput);
                        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(formatInput);
                        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput);

                        await interaction.showModal(modal.addComponents(row1, row2, row3));
                    }
                }
                else if(interaction.isModalSubmit()) {
                    if (interaction.customId === "modalSetupWelcome") {
                        try {
                            const channelId = interaction.fields.getTextInputValue("channelId");
                            const config = ConfigManager.getConfig<WelcomeConfig>(
                                "welcomeMessage",
                                interaction.guild?.id
                            );
                            config.channelId = channelId;
                            ConfigManager.saveConfig("welcomeMessage", interaction.guild?.id, channelId);
                        } catch (err) {
                            console.error(err);
                            await interaction.reply({
                                content: `❌ Une erreur est survenue : ${(err as Error).message}`,
                                ephemeral: true,
                            });
                        }
                    }
                }
            }
        }
    ],
};

export default simpleCommands;
