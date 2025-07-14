import { BaseModule } from '../base/base-module';
import { autoroletestCommand } from '../commands/autorole/autoroletest';
import { autoroleGuildmemberaddEvent } from '../events/autorole/autorole-guildmemberadd';

export class AutoroleModule extends BaseModule {
  constructor() {
    super('autoRole');
    this.registerCommand(autoroletestCommand);
    this.registerEvent(autoroleGuildmemberaddEvent);
  }
}
