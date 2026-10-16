import { beforeEach, describe, expect, it } from 'vitest';
import { auth, setDueAt, setup, submitRequest, validRequest, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeEach(async () => {
  ctx = await setup();
});

/** Test helper: push a request's due date into the past so it counts as overdue. */
function makeOverdue(id: string) {
  return setDueAt(ctx, id, new Date(Date.now() - 60_000));
}

async function resolve(id: string) {
  const put = (path: string, body: object) =>
    ctx.api.put(`/api/requests/${id}/${path}`).set(auth(ctx.users.staff)).send(body);
  await put('assignment', {});
  await put('status', { status: 'IN_PROGRESS' });
  await put('status', { status: 'RESOLVED', note: 'Fixed' });
}

describe('Management queries (FR-MGT-001 to FR-MGT-004)', () => {
  it('only managers and admins can use management endpoints', async () => {
    expect((await ctx.api.get('/api/management/summary').set(auth(ctx.users.staff))).status).toBe(403);
    expect((await ctx.api.get('/api/management/summary').set(auth(ctx.users.requester))).status).toBe(403);
    expect((await ctx.api.get('/api/management/summary').set(auth(ctx.users.manager))).status).toBe(200);
  });

  it('FR-MGT-001/002/003: lists open, overdue and resolved work', async () => {
    const a = await submitRequest(ctx);
    const b = await submitRequest(ctx);
    await submitRequest(ctx);
    await makeOverdue(a.id);
    await resolve(b.id);

    const view = async (v: string) =>
      (await ctx.api.get(`/api/management/requests?view=${v}`).set(auth(ctx.users.manager))).body;

    expect((await view('open')).total).toBe(2);
    const overdue = await view('overdue');
    expect(overdue.total).toBe(1);
    expect(overdue.items[0].id).toBe(a.id);
    expect(overdue.items[0].overdue).toBe(true);
    expect((await view('resolved')).total).toBe(1);
  });

  it('a resolved request is never counted as overdue', async () => {
    const r = await submitRequest(ctx);
    await resolve(r.id);
    await makeOverdue(r.id);
    const res = await ctx.api.get('/api/management/requests?view=overdue').set(auth(ctx.users.manager));
    expect(res.body.total).toBe(0);
  });

  it('FR-MGT-004: summarises requests by status and category', async () => {
    await submitRequest(ctx);
    await submitRequest(ctx, { ...validRequest, category: 'SECURITY_CONCERN' });
    const done = await submitRequest(ctx);
    await resolve(done.id);

    const res = await ctx.api.get('/api/management/summary').set(auth(ctx.users.manager));
    expect(res.status).toBe(200);
    expect(res.body.totals).toMatchObject({ all: 3, open: 2, resolved: 1, overdue: 0 });
    expect(res.body.byStatus.SUBMITTED).toBe(2);
    const security = res.body.byCategory.find((c: { category: string }) => c.category === 'SECURITY_CONCERN');
    expect(security).toMatchObject({ total: 1, open: 1 });
    expect(res.body.averageResolutionHours).toBeTypeOf('number');
  });

  it('rejects an unknown view', async () => {
    const res = await ctx.api.get('/api/management/requests?view=everything').set(auth(ctx.users.manager));
    expect(res.status).toBe(400);
  });
});

describe('Audit history (FR-MGT-005, FR-SEC-004)', () => {
  it('shows who changed what and when, with names', async () => {
    const r = await submitRequest(ctx);
    await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    await ctx.api.post(`/api/requests/${r.id}/actions`).set(auth(ctx.users.staff)).send({ body: 'Inspected on site' });

    const res = await ctx.api.get(`/api/requests/${r.id}/history`).set(auth(ctx.users.manager));
    expect(res.status).toBe(200);
    expect(res.body.history.map((h: { toStatus: string }) => h.toStatus)).toEqual(['SUBMITTED', 'ASSIGNED']);
    expect(res.body.history[1].changedByName).toBe('Staff');
    expect(res.body.actions[0]).toMatchObject({ body: 'Inspected on site', authorName: 'Staff' });
  });

  it('requesters cannot open the audit history', async () => {
    const r = await submitRequest(ctx);
    const res = await ctx.api.get(`/api/requests/${r.id}/history`).set(auth(ctx.users.requester));
    expect(res.status).toBe(403);
  });
});
