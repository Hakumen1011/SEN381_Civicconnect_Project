import { beforeEach, describe, expect, it } from 'vitest';
import { auth, setup, submitRequest, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeEach(async () => {
  ctx = await setup();
});

const optIn = (ctx: TestContext, body: object) =>
  ctx.api.put('/api/users/me/notification-preferences').set(auth(ctx.users.requester)).send(body);

async function moveToInProgress(ctx: TestContext, id: string) {
  await ctx.api.put(`/api/requests/${id}/assignment`).set(auth(ctx.users.staff)).send({});
  await ctx.api.put(`/api/requests/${id}/status`).set(auth(ctx.users.staff)).send({ status: 'IN_PROGRESS' });
}

const inbox = async (ctx: TestContext) =>
  (await ctx.api.get('/api/notifications/me').set(auth(ctx.users.requester))).body.notifications as {
    channel: string;
    status: string;
    message: string;
    attempts: number;
    flagged: boolean;
  }[];

describe('Simulated notifications (FR-NOT-001 to FR-NOT-007)', () => {
  it('AC-NOT-002-A: without opt-in only in-app notifications are created', async () => {
    const r = await submitRequest(ctx);
    await moveToInProgress(ctx, r.id);
    const msgs = await inbox(ctx);
    expect(msgs.every((m) => m.channel === 'IN_APP')).toBe(true);
    expect(msgs.map((m) => m.message).join(' ')).toContain('is now in progress');
  });

  it('records opt-in with a date and time, and needs a phone number', async () => {
    const res = await optIn(ctx, { sms: true, whatsapp: false });
    expect(res.status).toBe(200);
    expect(Date.parse(res.body.user.notificationPreferences.sms.optedInAt)).not.toBeNaN();
    expect(res.body.user.notificationPreferences.whatsapp).toBeNull();

    const noPhone = await ctx.api
      .put('/api/users/me/notification-preferences')
      .set(auth(ctx.users.otherRequester))
      .send({ sms: true, whatsapp: false });
    expect(noPhone.status).toBe(400);
  });

  it('AC-NOT-001-A: an opted-in SMS is queued, then sent and delivered by the dispatcher', async () => {
    await optIn(ctx, { sms: true, whatsapp: true });
    const r = await submitRequest(ctx);

    let sms = (await inbox(ctx)).filter((m) => m.channel === 'SMS');
    expect(sms).toHaveLength(1);
    expect(sms[0]!.status).toBe('QUEUED');
    expect(sms[0]!.message).toContain(r.reference);

    await ctx.dispatcher.runOnce(); // QUEUED -> SENT
    await ctx.dispatcher.runOnce(); // SENT -> DELIVERED
    sms = (await inbox(ctx)).filter((m) => m.channel === 'SMS');
    expect(sms[0]!.status).toBe('DELIVERED');
    expect((ctx.channels.SMS as unknown as { outbox: unknown[] }).outbox).toHaveLength(1);
  });

  it('AC-NOT-006-A: a failing test number is retried three times and then flagged', async () => {
    await optIn(ctx, { phone: '+27820000001', sms: true, whatsapp: false });
    await submitRequest(ctx);
    for (let i = 0; i < 4; i++) await ctx.dispatcher.runOnce();
    const sms = (await inbox(ctx)).find((m) => m.channel === 'SMS')!;
    expect(sms.status).toBe('FAILED');
    expect(sms.attempts).toBe(3);
    expect(sms.flagged).toBe(true);
  });

  it('a number ending in 0009 is marked undelivered', async () => {
    await optIn(ctx, { phone: '+27820000009', sms: true, whatsapp: false });
    await submitRequest(ctx);
    await ctx.dispatcher.runOnce();
    await ctx.dispatcher.runOnce();
    const sms = (await inbox(ctx)).find((m) => m.channel === 'SMS')!;
    expect(sms.status).toBe('UNDELIVERED');
  });

  it('only admins can view the full notification log', async () => {
    await submitRequest(ctx);
    expect((await ctx.api.get('/api/notifications').set(auth(ctx.users.staff))).status).toBe(403);
    const log = await ctx.api.get('/api/notifications').set(auth(ctx.users.admin));
    expect(log.status).toBe(200);
    expect(log.body.notifications.length).toBeGreaterThan(0);
  });

  it('notifies a staff member in-app when a manager assigns a request to them', async () => {
    const r = await submitRequest(ctx);
    await ctx.api
      .put(`/api/requests/${r.id}/assignment`)
      .set(auth(ctx.users.manager))
      .send({ assigneeId: ctx.users.staff.id });
    const staffInbox = await ctx.api.get('/api/notifications/me').set(auth(ctx.users.staff));
    expect(staffInbox.body.notifications[0].message).toContain('assigned to you');
  });
});
