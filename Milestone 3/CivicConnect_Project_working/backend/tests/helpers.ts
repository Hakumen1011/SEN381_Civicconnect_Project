import request from 'supertest';
import { loadEnv } from '../src/config/env.js';
import { createApp, type AppContext } from '../src/app.js';
import type { Role } from '../src/modules/users/user.types.js';

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
  const ctx = createApp(loadEnv());
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
