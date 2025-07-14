import { BaseModule } from '../base/base-module';
import { counterCommand } from '../commands/counter/counter';
import { counterGuildmemberadd } from '../events/counter/counter-guildmemberadd';

export class CounterModule extends BaseModule {
  constructor() {
    super('memberCounter');
    this.registerCommand(counterCommand);
    this.registerEvent(counterGuildmemberadd);
  }
}
