import { loadEnv } from './config/env.js';
import { DEMO_USERS, seedDemoUsers } from './data/seed.js';
import { createApp } from './app.js';

// Load a local .env file if there is one (Node 22+). In hosting, real environment variables are used.
try {
  process.loadEnvFile();
} catch {
  /* no .env file - that's fine */
}

const env = loadEnv();
const { app, authService, dispatcher } = createApp(env);

if (env.SEED_DEMO_USERS) {
  if (!env.DEMO_PASSWORD) throw new Error('DEMO_PASSWORD is required when SEED_DEMO_USERS=true');
  await seedDemoUsers(authService, env.DEMO_PASSWORD);
  console.log(`Demo users created: ${DEMO_USERS.map((u) => `${u.email} (${u.role})`).join(', ')}`);
}

const server = app.listen(env.PORT, () => {
  console.log(`CivicConnect API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Background sender for queued SMS / WhatsApp notifications (simulated).
const timer =
  env.NOTIFICATION_DISPATCH_INTERVAL_MS > 0
    ? setInterval(() => {
        dispatcher.runOnce().catch((err) => console.error('[dispatcher]', err));
      }, env.NOTIFICATION_DISPATCH_INTERVAL_MS)
    : undefined;

function shutdown() {
  if (timer) clearInterval(timer);
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
