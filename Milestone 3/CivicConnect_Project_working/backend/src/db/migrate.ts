import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import type pg from 'pg';

/**
 * Very small migration runner.
 *
 * Every file in backend/db/migrations (001_..., 002_..., in name order) is run once, inside a
 * transaction, and recorded in the schema_migrations table. Running it again only applies new files,
 * so it is safe to run on every server start. Never edit a migration that has already been applied:
 * add a new numbered file instead (this keeps every database change traceable).
 */
export const MIGRATIONS_DIR = fileURLToPath(new URL('../../db/migrations/', import.meta.url));

export async function runMigrations(pool: pg.Pool, log: (msg: string) => void = console.log): Promise<string[]> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    // Only one process may migrate at a time (e.g. two servers starting together).
    await client.query('SELECT pg_advisory_lock(381381)');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name        text        PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )`);
    const done = new Set((await client.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name));

    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
      }
      applied.push(file);
      log(`[db] applied migration ${file}`);
    }
    if (applied.length === 0) log('[db] database schema is up to date');
  } finally {
    await client.query('SELECT pg_advisory_unlock(381381)').catch(() => undefined);
    client.release();
  }
  return applied;
}

// `npm run db:migrate` runs this file directly.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { loadEnv } = await import('../config/env.js');
  const { createPool } = await import('./postgres.js');
  try {
    process.loadEnvFile();
  } catch {
    /* no .env file */
  }
  const env = loadEnv();
  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in .env - nothing to migrate.');
    process.exit(1);
  }
  const pool = createPool({ connectionString: env.DATABASE_URL, ssl: env.DATABASE_SSL });
  try {
    await runMigrations(pool);
  } finally {
    await pool.end();
  }
}
