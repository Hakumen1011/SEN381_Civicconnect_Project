import pg from 'pg';
import type { Transaction, TransactionManager } from '../shared/transaction.js';

/** Anything we can run a SQL query on: the shared pool, or one connection inside a transaction. */
export type Queryable = Pick<pg.Pool, 'query'> | Pick<pg.PoolClient, 'query'>;

/** The PostgreSQL version of a transaction: it carries the connection the work must use. */
export interface PgTransaction extends Transaction {
  readonly kind: 'pg';
  readonly db: Queryable;
}

/** Used by the PostgreSQL repositories to get the connection for a transaction. */
export function dbOf(tx: Transaction): Queryable {
  if (tx.kind !== 'pg') throw new Error('PostgreSQL repository used with a non-PostgreSQL transaction');
  return (tx as PgTransaction).db;
}

export interface PoolOptions {
  connectionString: string;
  /** Hosted databases (Render, Neon, Supabase ...) usually require SSL. */
  ssl?: boolean;
}

export function createPool({ connectionString, ssl }: PoolOptions): pg.Pool {
  const pool = new pg.Pool({
    connectionString,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
  // An idle connection can drop (e.g. the database restarts). Log it instead of crashing the server.
  pool.on('error', (err) => console.error('[db] idle client error', err.message));
  return pool;
}

/**
 * PostgreSQL implementation of the storage-neutral TransactionManager (src/shared/transaction.ts).
 * transaction() maps directly to BEGIN ... COMMIT, or ROLLBACK if anything throws, so a status
 * change, its history row and its notifications are saved together or not at all (Decision 7).
 */
export class PostgresStore implements TransactionManager {
  constructor(readonly pool: pg.Pool) {}

  /** Outside a transaction: each query runs on its own pooled connection. */
  read(): PgTransaction {
    return { kind: 'pg', db: this.pool };
  }

  async transaction<T>(work: (tx: Transaction) => Promise<T> | T): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx: PgTransaction = { kind: 'pg', db: client };
      const result = await work(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}

/** Converts a timestamptz value from PostgreSQL to the ISO text the rest of the app uses. */
export const iso = (value: Date | string): string => (value instanceof Date ? value : new Date(value)).toISOString();
export const isoOrNull = (value: Date | string | null): string | null => (value === null ? null : iso(value));
