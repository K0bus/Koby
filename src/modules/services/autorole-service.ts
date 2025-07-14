import { GuildMember, Role } from 'discord.js';
import { AutoRoleConfig, AutoRoleConfigManager } from '../../config/managers/autorole-config';

export async function mainAutoRole(member: GuildMember): Promise<void> {
  try {
    const config: AutoRoleConfig = await new AutoRoleConfigManager(member.guild.id).get();
    if (!shouldAssignRoles(member, config)) return;
    await assignRoles(member, config.rolesIds);
  } catch (error) {
    console.error(`Erreur lors de l'attribution des rôles automatiques:`, error);
  }
}

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
