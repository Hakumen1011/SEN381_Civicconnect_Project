import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { PostgresStore } from '../src/db/postgres.js';
import { auth, setup, submitRequest, USE_POSTGRES, type TestContext } from './helpers.js';
import request from 'supertest';

/**
 * PostgreSQL-only checks (run with `npm run test:db`). The other test files already run every API
 * test against the database; these cover what only a real database can show.
 */
describe.skipIf(!USE_POSTGRES)('PostgreSQL data layer (Decision 7)', () => {
  let ctx: TestContext;
  let db: PostgresStore;

  beforeEach(async () => {
    ctx = await setup();
    db = ctx.store as PostgresStore;
  });

  it('keeps data after the API restarts (a new app on the same database)', async () => {
    const r = await submitRequest(ctx);
    const restarted = createApp({ ...loadEnv(), DATABASE_URL: undefined }, { pool: db.pool });
    const res = await request(restarted.app).get(`/api/requests/${r.id}`).set(auth(ctx.users.requester));
    expect(res.status).toBe(200);
    expect(res.body.request.reference).toBe(r.reference);
  });

  it('reports the database in the health check', async () => {
    const res = await ctx.api.get('/api/health');
    expect(res.body).toMatchObject({ status: 'ok', storage: 'postgres', database: 'connected' });
  });

  it('the audit trail cannot be changed or deleted (append-only)', async () => {
    const r = await submitRequest(ctx);
    await expect(db.pool.query("UPDATE status_history SET note = 'edited' WHERE request_id = $1", [r.id])).rejects.toThrow(
      /append-only/,
    );
    await expect(db.pool.query('DELETE FROM status_history WHERE request_id = $1', [r.id])).rejects.toThrow(/append-only/);
  });

  it('database rules reject bad data even if application code had a bug', async () => {
    const r = await submitRequest(ctx);
    await expect(db.pool.query("UPDATE service_requests SET category = 'PIZZA' WHERE id = $1", [r.id])).rejects.toThrow(
      /check constraint/,
    );
    // Work in progress must have an owner
    await expect(db.pool.query("UPDATE service_requests SET status = 'IN_PROGRESS' WHERE id = $1", [r.id])).rejects.toThrow(
      /requests_active_work_has_owner/,
    );
  });

  it('two people changing the same request at once: one succeeds, the other gets a conflict', async () => {
    const r = await submitRequest(ctx);
    const assigned = await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    const version = assigned.body.request.version; // both people are looking at this version
    const change = (who: keyof TestContext['users']) =>
      ctx.api
        .put(`/api/requests/${r.id}/status`)
        .set(auth(ctx.users[who]))
        .send({ status: 'IN_PROGRESS', expectedVersion: version });

    const results = await Promise.all([change('staff'), change('manager')]);
    expect(results.map((res) => res.status).sort()).toEqual([200, 409]);

    const history = await ctx.api.get(`/api/requests/${r.id}/history`).set(auth(ctx.users.manager));
    expect(history.body.history.filter((h: { toStatus: string }) => h.toStatus === 'IN_PROGRESS')).toHaveLength(1);
  });

  it('a failed change leaves nothing half-saved (rollback)', async () => {
    const r = await submitRequest(ctx);
    await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    ctx.events.subscribe('RequestStatusChanged', () => {
      throw new Error('handler failure');
    });
    const res = await ctx.api.put(`/api/requests/${r.id}/status`).set(auth(ctx.users.staff)).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    const { rows } = await db.pool.query('SELECT status FROM service_requests WHERE id = $1', [r.id]);
    expect(rows[0].status).toBe('ASSIGNED');
    const history = await db.pool.query('SELECT count(*)::int AS n FROM status_history WHERE request_id = $1', [r.id]);
    expect(history.rows[0].n).toBe(2);
  });
});
