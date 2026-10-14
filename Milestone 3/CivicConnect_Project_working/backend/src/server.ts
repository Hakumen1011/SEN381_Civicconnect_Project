import { loadEnv } from './config/env.js';
import { DEMO_USERS, seedDemoUsers } from './data/seed.js';
import { runMigrations } from './db/migrate.js';
import { PostgresStore } from './db/postgres.js';
import { createApp } from './app.js';

// Load a local .env file if there is one (Node 22+). In hosting, real environment variables are used.
try {
  process.loadEnvFile();
} catch {
  /* no .env file - that's fine */
}

const env = loadEnv();
const { app, storage, store, authService, dispatcher, close } = createApp(env);

if (store instanceof PostgresStore) {
  // Creates or updates the tables before the API accepts requests (safe to run every start).
  try {
    await runMigrations(store.pool);
  } catch (error) {
    console.error(`[db] could not prepare the database: ${(error as Error).message}`);
    console.error('[db] check DATABASE_URL in .env and that PostgreSQL is running.');
    await close();
    process.exit(1);
  }
} else {
  console.warn('[db] DATABASE_URL is not set: using the temporary in-memory store (data is lost on restart).');
}

if (env.SEED_DEMO_USERS) {
  if (!env.DEMO_PASSWORD) throw new Error('DEMO_PASSWORD is required when SEED_DEMO_USERS=true');
  const created = await seedDemoUsers(authService, env.DEMO_PASSWORD);
  console.log(
    created.length
      ? `Demo users created: ${created.join(', ')}`
      : `Demo users already exist: ${DEMO_USERS.map((u) => `${u.email} (${u.role})`).join(', ')}`,
  );
}

const server = app.listen(env.PORT, () => {
  console.log(`CivicConnect API listening on http://localhost:${env.PORT} (${env.NODE_ENV}, storage: ${storage})`);
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
  server.close(() => {
    close().finally(() => process.exit(0));
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
