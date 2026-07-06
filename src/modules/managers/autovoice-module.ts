import { BaseModule } from '../base/base-module';
import { autovoiceVoiceStateUpdate } from '../events/autovoice/autovoice-voicestateupdate';
import { autovoiceInteractionCreate } from '../events/autovoice/autovoice-interactioncreate';

export class AutovoiceModule extends BaseModule {
  constructor() {
    super('autoVoice');
    this.registerEvent(autovoiceVoiceStateUpdate);
    this.registerEvent(autovoiceInteractionCreate);
  }
}
