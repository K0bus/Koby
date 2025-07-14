import { BaseModule } from '../base/base-module';
import { film } from '../commands/simplecommands/film';
import { info } from '../commands/simplecommands/info';
import { ping } from '../commands/simplecommands/ping';
import { clearchannel } from '../commands/simplecommands/clearchannel';

export class SimplecommandsModule extends BaseModule {
  constructor() {
    super('simpleCommands');
    this.registerCommand(film);
    this.registerCommand(info);
    this.registerCommand(ping);
    this.registerCommand(clearchannel);
  }
}
