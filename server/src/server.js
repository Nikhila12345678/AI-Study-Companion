import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] AI Study Companion API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] failed to start:', err);
  process.exit(1);
});
