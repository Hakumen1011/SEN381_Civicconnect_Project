import { loadEnv } from './config/env.js';
import { createApp } from './app.js';

// Load the .env file if there is one.
try {
  process.loadEnvFile();
} catch {
  
}

const env = loadEnv();
const { app } = createApp(env);

app.listen(env.PORT, () => {
  console.log(`CivicConnect API running on http://localhost:${env.PORT}`);
});