import { BaseModule } from '../base/base-module';
import { welcometest } from '../commands/welcomemessage/welcometest';
import { welcomemessageGuildmemberadd } from '../events/welcomemessage/welcomemessage-guildmemberadd';

export class WelcomemessageModule extends BaseModule {
  constructor() {
    super('welcomeMessage');
    this.registerCommand(welcometest);
    this.registerEvent(welcomemessageGuildmemberadd);
  }
}
