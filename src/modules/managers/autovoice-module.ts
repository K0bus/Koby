import { BaseModule } from '../base/base-module';
import { autovoiceVoiceStateUpdate } from '../events/autovoice/autovoice-voicestateupdate';

export class AutovoiceModule extends BaseModule {
  constructor() {
    super('autoVoice');
    this.registerEvent(autovoiceVoiceStateUpdate);
  }
}
