import { BotModule } from '../types/BotTypes';
import autoRole from './autoRole';
import autoVoice from './autoVoice';
import memberCounter from './memberCounter';
import modLog from './modLog';
import simpleCommands from './simpleCommands';
import welcomeMessages from './welcomeMessages';

export * from './autoRole';
export * from './autoVoice';
export * from './memberCounter';
export * from './modLog';
export * from './simpleCommands';
export * from './welcomeMessages';

class ModuleManager {
  modules: BotModule[] = [];
  constructor() {
    this.modules.push(autoRole);
    this.modules.push(autoVoice);
    this.modules.push(memberCounter);
    this.modules.push(modLog);
    this.modules.push(simpleCommands);
    this.modules.push(welcomeMessages);
  }
  list(): BotModule[] {
    return this.modules;
  }
}

export default ModuleManager;
