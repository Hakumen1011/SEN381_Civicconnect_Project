import { beforeEach, describe, expect, it } from 'vitest';
import { auth, setup, submitRequest, validRequest, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeEach(async () => {
  ctx = await setup();
});

describe('Submit request (FR-REQ-001 to FR-REQ-004)', () => {
  it('AC-REQ-001-A/C: creates the request and returns confirmation and reference', async () => {
    const res = await ctx.api.post('/api/requests').set(auth(ctx.users.requester)).send(validRequest);
    expect(res.status).toBe(201);
    expect(res.body.request.reference).toMatch(/^CC-\d{4}-\d{6}$/);
    expect(res.body.request.status).toBe('SUBMITTED');
    expect(res.body.message).toContain(res.body.request.reference);
  });

  it('gives every request a unique reference', async () => {
    const a = await submitRequest(ctx);
    const b = await submitRequest(ctx);
    expect(a.reference).not.toBe(b.reference);
  });

  it('AC-REQ-001-B: rejects missing mandatory fields and lists them', async () => {
    const res = await ctx.api.post('/api/requests').set(auth(ctx.users.requester)).send({ category: 'IT_SUPPORT' });
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'description']));
  });

  it('AC-REQ-002-A/B: only accepts a category from the controlled list', async () => {
    const bad = await ctx.api
      .post('/api/requests')
      .set(auth(ctx.users.requester))
      .send({ ...validRequest, category: 'PIZZA' });
    expect(bad.status).toBe(400);
    const missing = await ctx.api
      .post('/api/requests')
      .set(auth(ctx.users.requester))
      .send({ ...validRequest, category: undefined });
    expect(missing.status).toBe(400);
  });

  it('only requesters can submit', async () => {
    const res = await ctx.api.post('/api/requests').set(auth(ctx.users.staff)).send(validRequest);
    expect(res.status).toBe(403);
  });
});

describe('Viewing requests and object-level access (FR-REQ-005/006, FR-SEC-003)', () => {
  it('requesters only see their own requests', async () => {
    await submitRequest(ctx);
    await submitRequest(ctx, validRequest, ctx.users.otherRequester);
    const mine = await ctx.api.get('/api/requests').set(auth(ctx.users.requester));
    expect(mine.body.total).toBe(1);
  });

  it("a requester cannot open someone else's request (404, not 403)", async () => {
    const r = await submitRequest(ctx);
    const res = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.otherRequester));
    expect(res.status).toBe(404);
  });

  it('staff can search, filter and sort (FR-STF-002 to FR-STF-004)', async () => {
    await submitRequest(ctx, { ...validRequest, title: 'Projector broken', category: 'DAMAGED_EQUIPMENT' });
    await submitRequest(ctx, { ...validRequest, title: 'Suspicious person at gate', category: 'SECURITY_CONCERN' });
    await submitRequest(ctx, { ...validRequest, title: 'Wi-Fi down', category: 'IT_SUPPORT', location: '' });

    const search = await ctx.api.get('/api/requests?search=projector').set(auth(ctx.users.staff));
    expect(search.body.total).toBe(1);

    const filtered = await ctx.api.get('/api/requests?category=SECURITY_CONCERN,IT_SUPPORT').set(auth(ctx.users.staff));
    expect(filtered.body.total).toBe(2);

    const sorted = await ctx.api.get('/api/requests?sortBy=priority&sortOrder=desc').set(auth(ctx.users.staff));
    expect(sorted.body.items[0].priority).toBe('HIGH');
  });

  it('rejects invalid filter values', async () => {
    const res = await ctx.api.get('/api/requests?status=NOPE').set(auth(ctx.users.staff));
    expect(res.status).toBe(400);
  });

  it('requesters do not see internal staff actions', async () => {
    const r = await submitRequest(ctx);
    await ctx.api.post(`/api/requests/${r.id}/actions`).set(auth(ctx.users.staff)).send({ body: 'Called the technician' });
    const asRequester = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.requester));
    expect(asRequester.body.actions).toBeUndefined();
    const asStaff = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.staff));
    expect(asStaff.body.actions).toHaveLength(1);
  });
});

describe('Assignment (FR-STF-006)', () => {
  it('AC-STF-006-A: staff can accept a request; owner is recorded and status becomes ASSIGNED', async () => {
    const r = await submitRequest(ctx);
    const res = await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    expect(res.status).toBe(200);
    expect(res.body.request.assigneeId).toBe(ctx.users.staff.id);
    expect(res.body.request.status).toBe('ASSIGNED');
  });

  it('AC-STF-006-B: requesters cannot assign', async () => {
    const r = await submitRequest(ctx);
    const res = await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.requester)).send({});
    expect(res.status).toBe(403);
  });

  it('staff cannot take a request already owned by someone else, but a manager can reassign it', async () => {
    const r = await submitRequest(ctx);
    await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    const steal = await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.otherStaff)).send({});
    expect(steal.status).toBe(409);
    const reassign = await ctx.api
      .put(`/api/requests/${r.id}/assignment`)
      .set(auth(ctx.users.manager))
      .send({ assigneeId: ctx.users.otherStaff.id });
    expect(reassign.status).toBe(200);
    expect(reassign.body.request.assigneeId).toBe(ctx.users.otherStaff.id);
  });
});

describe('Status changes (FR-STF-007, FR-STF-009, FR-STF-010, NFR-AUD-001)', () => {
  async function assigned() {
    const r = await submitRequest(ctx);
    await ctx.api.put(`/api/requests/${r.id}/assignment`).set(auth(ctx.users.staff)).send({});
    return r;
  }

  it('AC-STF-007-A/C: a valid change is accepted and the user and time are recorded', async () => {
    const r = await assigned();
    const res = await ctx.api
      .put(`/api/requests/${r.id}/status`)
      .set(auth(ctx.users.staff))
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('IN_PROGRESS');

    const detail = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.staff));
    const last = detail.body.history.at(-1);
    expect(last).toMatchObject({ fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', changedById: ctx.users.staff.id });
    expect(Date.parse(last.changedAt)).not.toBeNaN();
    expect(detail.body.history.map((h: { toStatus: string }) => h.toStatus)).toEqual([
      'SUBMITTED',
      'ASSIGNED',
      'IN_PROGRESS',
    ]);
  });

  it('AC-STF-007-B: an invalid transition is rejected and nothing changes', async () => {
    const r = await assigned();
    const res = await ctx.api.put(`/api/requests/${r.id}/status`).set(auth(ctx.users.staff)).send({ status: 'CLOSED' });
    expect(res.status).toBe(409);
    const detail = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.staff));
    expect(detail.body.request.status).toBe('ASSIGNED');
    expect(detail.body.history).toHaveLength(2);
  });

  it('only the assigned staff member (or a manager) can change the status', async () => {
    const r = await assigned();
    const res = await ctx.api
      .put(`/api/requests/${r.id}/status`)
      .set(auth(ctx.users.otherStaff))
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(403);
  });

  it('resolving needs a resolution note, and only a manager can close', async () => {
    const r = await assigned();
    const as = (u: keyof TestContext['users'], body: object) =>
      ctx.api.put(`/api/requests/${r.id}/status`).set(auth(ctx.users[u])).send(body);

    await as('staff', { status: 'IN_PROGRESS' });
    expect((await as('staff', { status: 'RESOLVED' })).status).toBe(400);
    const resolved = await as('staff', { status: 'RESOLVED', note: 'Replaced the light fitting' });
    expect(resolved.body.request.resolution).toBe('Replaced the light fitting');
    expect((await as('staff', { status: 'CLOSED' })).status).toBe(403);
    expect((await as('manager', { status: 'CLOSED' })).status).toBe(200);
  });

  it('detects conflicting updates with the version number', async () => {
    const r = await assigned();
    const res = await ctx.api
      .put(`/api/requests/${r.id}/status`)
      .set(auth(ctx.users.staff))
      .send({ status: 'IN_PROGRESS', expectedVersion: 1 });
    expect(res.status).toBe(409);
  });

  it('rolls back the status change if an event handler fails (one transaction)', async () => {
    const r = await assigned();
    ctx.events.subscribe('RequestStatusChanged', () => {
      throw new Error('handler failure');
    });
    const res = await ctx.api
      .put(`/api/requests/${r.id}/status`)
      .set(auth(ctx.users.staff))
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    const detail = await ctx.api.get(`/api/requests/${r.id}`).set(auth(ctx.users.staff));
    expect(detail.body.request.status).toBe('ASSIGNED');
    expect(detail.body.history).toHaveLength(2);
  });
});
