import { botManager } from './bot/BotManager';
import { createExpressApp } from './api';

function init() {
  botManager.init();

  const app = createExpressApp();

  app.listen(5000, () => {
    console.log('✅ Express server is running on port 5000');
  });
}

void init();
