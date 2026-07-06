import { BaseModule } from '../base/base-module';
import { automod } from '../commands/automod/automod';
import { messageCreate } from '../events/automod/messageCreate';

export class AutomodModule extends BaseModule {
  constructor() {
    super('automod');
    this.registerCommand(automod);
    this.registerEvent(messageCreate);
  }
}
