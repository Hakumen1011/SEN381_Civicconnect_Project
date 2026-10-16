import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config.js';

// Reads TEST_DATABASE_URL from .env when it is not already set (CI sets it directly).
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

/**
 * `npm run test:db`: the same API tests, but against a real PostgreSQL database.
 * Test files run one after another because they share (and empty) the same test database.
 */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      fileParallelism: false,
      env: {
        TEST_STORAGE: 'postgres',
        TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
      },
    },
  }),
);
