import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
} from 'discord.js';
import { BotModule } from '../types/BotTypes';
import { AutoRoleConfig, AutoRoleConfigManager } from '../config/managers/autorole-config';

const MODULE_NAME = 'autoRole';

const autoRole: BotModule = {
  name: MODULE_NAME,
  commands: [
    {
      slashCommand: new SlashCommandBuilder()
        .setName('autoroletest')
        .setDescription('Test your autorole configuration')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
      async execute(client: Client, interaction: ChatInputCommandInteraction) {
        const member = <GuildMember>interaction.member!;
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
          await interaction.reply("❌ You don't have the permission to use this command !");
          return;
        }
        try {
          const config: AutoRoleConfig = await new AutoRoleConfigManager(member.guild.id).get();
          if (!shouldAssignRoles(member, config)) return;
          await assignRoles(member, config.rolesIds);
          await interaction.reply({
            content: "❌ Erreur lors de l'attribution des rôles automatiques",
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          console.error(`❌ Erreur lors de l'attribution des rôles automatiques :`, error);
        }
        await interaction.reply({
          content: '✅ Autoroles test done !',
          flags: MessageFlags.Ephemeral,
        });
      },
    },
  ],
  event: [
    {
      eventType: Events.GuildMemberAdd,
      async execute(client, member: GuildMember) {
        try {
          const config: AutoRoleConfig = await new AutoRoleConfigManager(member.guild.id).get();
          if (!shouldAssignRoles(member, config)) return;
          await assignRoles(member, config.rolesIds);
        } catch (error) {
          console.error(`Erreur lors de l'attribution des rôles automatiques:`, error);
        }
      },
      once: false,
    },
  ],
};

function shouldAssignRoles(member: GuildMember, config: AutoRoleConfig): boolean {
  return !(member.user.bot && !config.bot);
}

async function assignRoles(member: GuildMember, roleIds: string[]): Promise<void> {
  const rolesToAdd = roleIds
    .map((roleId) => member.guild.roles.cache.find((r) => r.id === roleId))
    .filter((role): role is Role => role !== undefined);

  if (rolesToAdd.length > 0) {
    await member.roles.add(rolesToAdd);
  }
}

export default autoRole;
