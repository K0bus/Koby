import {Events, GuildMember, Role} from "discord.js";
import {BotModule} from "../types/BotTypes";
import {ConfigManager} from "../utils/ConfigManager";

interface AutoRoleConfig {
    enabled: boolean;
    bot: boolean;
    rolesIds: string[];
}

const MODULE_NAME = "autoRole";

const autoRole: BotModule = {
    name: MODULE_NAME,
    commands: [],
    event: [
        {
            eventType: Events.GuildMemberAdd,
            async execute(client, member: GuildMember) {
                try {
                    const config = await getValidatedConfig(member);
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

async function getValidatedConfig(member: GuildMember): Promise<AutoRoleConfig> {
    const config = ConfigManager.getConfig<AutoRoleConfig>(MODULE_NAME, member.guild.id);
    if (!config?.enabled || !Array.isArray(config.rolesIds)) {
        throw new Error("Configuration d'autorole invalide");
    }
    return config;
}

function shouldAssignRoles(member: GuildMember, config: AutoRoleConfig): boolean {
    return !(member.user.bot && !config.bot);
}

async function assignRoles(member: GuildMember, roleIds: string[]): Promise<void> {
    const rolesToAdd = roleIds
        .map(roleId => member.guild.roles.cache.find(r => r.id === roleId))
        .filter((role): role is Role => role !== undefined);

    if (rolesToAdd.length > 0) {
        await member.roles.add(rolesToAdd);
    }
}

export default autoRole;