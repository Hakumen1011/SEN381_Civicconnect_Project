import { beforeAll, describe, expect, it } from 'vitest';
import { auth, setup, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeAll(async () => {
  ctx = await setup();
});

describe('Authentication (FR-SEC-001, NFR-SEC-002)', () => {
  it('registers a requester and never returns the password hash', async () => {
    const res = await ctx.api
      .post('/api/auth/register')
      .send({ name: 'New Person', email: 'New@Example.com', password: 'abcdef12' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.role).toBe('REQUESTER');
    expect(res.body.user.email).toBe('new@example.com');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('cannot self-register with a staff role', async () => {
    const res = await ctx.api
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'sneaky@example.com', password: 'abcdef12', role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('REQUESTER');
  });

  it('rejects weak passwords and duplicate emails', async () => {
    const weak = await ctx.api.post('/api/auth/register').send({ name: 'Weak', email: 'weak@example.com', password: 'short' });
    expect(weak.status).toBe(400);
    const dup = await ctx.api
      .post('/api/auth/register')
      .send({ name: 'Dup', email: ctx.users.requester.email, password: 'abcdef12' });
    expect(dup.status).toBe(409);
  });

  it('gives the same message for unknown email and wrong password', async () => {
    const unknown = await ctx.api.post('/api/auth/login').send({ email: 'nobody@test.local', password: 'whatever1' });
    const wrong = await ctx.api.post('/api/auth/login').send({ email: ctx.users.requester.email, password: 'wrong123' });
    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('blocks protected routes without a valid token', async () => {
    expect((await ctx.api.get('/api/requests')).status).toBe(401);
    expect((await ctx.api.get('/api/requests').set('Authorization', 'Bearer not-a-token')).status).toBe(401);
  });

  it('returns the signed-in user', async () => {
    const res = await ctx.api.get('/api/auth/me').set(auth(ctx.users.staff));
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('STAFF');
  });

  it('only lets admins create staff accounts (FR-SEC-002)', async () => {
    const body = { name: 'New Staff', email: 'newstaff@test.local', password: 'abcdef12', role: 'STAFF' };
    expect((await ctx.api.post('/api/users').set(auth(ctx.users.manager)).send(body)).status).toBe(403);
    const ok = await ctx.api.post('/api/users').set(auth(ctx.users.admin)).send(body);
    expect(ok.status).toBe(201);
    expect(ok.body.user.role).toBe('STAFF');
  });
});
