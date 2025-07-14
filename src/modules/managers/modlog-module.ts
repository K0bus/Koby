import { BaseModule } from '../base/base-module';
import { modlogChanneldelete } from '../events/modlog/modlog-channeldelete';
import { modlogChannelCreate } from '../events/modlog/modlog-channelcreate';
import { modlogGuildbanadd } from '../events/modlog/modlog-guildbanadd';
import { modlogGuildbanremove } from '../events/modlog/modlog-guildbanremove';
import { modlogGuildmemberadd } from '../events/modlog/modlog-guildmemberadd';
import { modlogGuildmemberremove } from '../events/modlog/modlog-guildmemberremove';
import { modlogGuildrolecreate } from '../events/modlog/modlog-guildrolecreate';
import { modlogGuildRoleDelete } from '../events/modlog/modlog-guildroledelete';
import { modlogMessageDelete } from '../events/modlog/modlog-messagedelete';
import { modlogMessageUpdate } from '../events/modlog/modlog-messageupdate';

export class ModlogModule extends BaseModule {
  constructor() {
    super('modLog');
    this.registerEvent(modlogChannelCreate);
    this.registerEvent(modlogChanneldelete);
    this.registerEvent(modlogGuildbanadd);
    this.registerEvent(modlogGuildbanremove);
    this.registerEvent(modlogGuildmemberadd);
    this.registerEvent(modlogGuildmemberremove);
    this.registerEvent(modlogGuildrolecreate);
    this.registerEvent(modlogGuildRoleDelete);
    this.registerEvent(modlogMessageDelete);
    this.registerEvent(modlogMessageUpdate);
  }
}
