import request from 'supertest';
import type pg from 'pg';
import { loadEnv } from '../src/config/env.js';
import { createApp, type AppContext } from '../src/app.js';
import { InMemoryStore } from '../src/data/store.js';
import { runMigrations } from '../src/db/migrate.js';
import { createPool } from '../src/db/postgres.js';
import type { Role } from '../src/modules/users/user.types.js';

/**
 * The same API tests run against either data layer:
 *   npm test          -> in-memory store (fast, no database needed)
 *   npm run test:db   -> real PostgreSQL database from TEST_DATABASE_URL
 */
export const USE_POSTGRES = process.env.TEST_STORAGE === 'postgres';

let pool: pg.Pool | undefined;

async function testPool(): Promise<pg.Pool> {
  if (pool) return pool;
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set. Add it to .env (use a separate, empty test database).');
  }
  if (process.env.DATABASE_URL && url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must not be the same as DATABASE_URL: the tests delete all data in it.');
  }
  pool = createPool({ connectionString: url, ssl: process.env.TEST_DATABASE_SSL === 'true' });
  await runMigrations(pool, () => undefined);
  return pool;
}

/** Empties every table so each test starts from a clean database. */
async function resetDatabase(db: pg.Pool) {
  await db.query('TRUNCATE notifications, request_comments, status_history, service_requests, users CASCADE');
  await db.query('ALTER SEQUENCE request_reference_seq RESTART WITH 1');
}

export async function closeTestDatabase() {
  await pool?.end();
  pool = undefined;
}

export const PASSWORD = 'Passw0rd!';

export interface TestUser {
  id: string;
  token: string;
  email: string;
}

export interface TestContext extends AppContext {
  api: ReturnType<typeof request>;
  users: Record<'requester' | 'otherRequester' | 'staff' | 'otherStaff' | 'manager' | 'admin', TestUser>;
}

async function makeUser(ctx: AppContext, name: string, role: Role, phone?: string): Promise<TestUser> {
  const email = `${name.toLowerCase()}@test.local`;
  const user = await ctx.authService.createUser({ name, email, password: PASSWORD, role, phone });
  const res = await request(ctx.app).post('/api/auth/login').send({ email, password: PASSWORD });
  return { id: user.id, token: res.body.token, email };
}

/** A fresh app with one user per role, logged in. */
export async function setup(): Promise<TestContext> {
  const env = { ...loadEnv(), DATABASE_URL: undefined };
  let ctx: AppContext;
  if (USE_POSTGRES) {
    const db = await testPool();
    await resetDatabase(db);
    ctx = createApp(env, { pool: db });
  } else {
    ctx = createApp(env);
  }
  const users = {
    requester: await makeUser(ctx, 'Requester', 'REQUESTER', '+27820000000'),
    otherRequester: await makeUser(ctx, 'Other', 'REQUESTER'),
    staff: await makeUser(ctx, 'Staff', 'STAFF'),
    otherStaff: await makeUser(ctx, 'Staff2', 'STAFF'),
    manager: await makeUser(ctx, 'Manager', 'MANAGER'),
    admin: await makeUser(ctx, 'Admin', 'ADMIN'),
  };
  return { ...ctx, api: request(ctx.app), users };
}

export const auth = (user: TestUser) => ({ Authorization: `Bearer ${user.token}` });

export const validRequest = {
  title: 'Broken light in hallway',
  description: 'The light outside room B12 has been flickering for two days.',
  category: 'FACILITY_FAULT',
  location: 'Block B, room B12',
};

export async function submitRequest(ctx: TestContext, body: object = validRequest, who = ctx.users.requester) {
  const res = await request(ctx.app).post('/api/requests').set(auth(who)).send(body);
  if (res.status !== 201) throw new Error(`submit failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.request as { id: string; reference: string; status: string; version: number };
}

/** Test helper: moves a request's due date, e.g. into the past to make it overdue. */
export async function setDueAt(ctx: TestContext, id: string, dueAt: Date) {
  if (ctx.store instanceof InMemoryStore) {
    ctx.store.read().tables.requests.get(id)!.dueAt = dueAt.toISOString();
  } else {
    await ctx.store.pool.query('UPDATE service_requests SET due_at = $2 WHERE id = $1', [id, dueAt]);
  }
}
