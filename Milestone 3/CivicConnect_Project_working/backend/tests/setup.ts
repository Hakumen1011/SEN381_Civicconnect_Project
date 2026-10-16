import { afterAll } from 'vitest';
import { closeTestDatabase } from './helpers.js';

// Close the shared PostgreSQL pool after each test file (no-op for the in-memory tests).
afterAll(async () => {
  await closeTestDatabase();
});
