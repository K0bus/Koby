import { BaseModule } from '../base/base-module';
import { film } from '../commands/simplecommands/film';
import { info } from '../commands/simplecommands/info';
import { ping } from '../commands/simplecommands/ping';
import { clearchannel } from '../commands/simplecommands/clearchannel';
import { clearmessage } from '../commands/simplecommands/clearmessage';
import { init } from '../commands/simplecommands/init';
import { guildCreate } from '../events/simplecommands/guildCreate';
import { setup } from '../commands/simplecommands/setup';

export class SimplecommandsModule extends BaseModule {
  constructor() {
    super('simpleCommands');
    this.registerCommand(film);
    this.registerCommand(info);
    this.registerCommand(ping);
    this.registerCommand(clearchannel);
    this.registerCommand(clearmessage);
    this.registerCommand(init);
    this.registerCommand(setup);
    this.registerEvent(guildCreate);
  }
}
