import { BaseModule } from '../base/base-module';
import { setupCommand } from '../commands/setup/setup';

export class SetupModule extends BaseModule {
  constructor() {
    super('welcomeMessage');
    this.registerCommand(setupCommand);
  }
}
