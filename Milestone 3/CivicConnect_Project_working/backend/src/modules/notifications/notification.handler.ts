import { randomUUID } from 'node:crypto';
import type { Transaction } from '../../shared/transaction.js';
import type { EventBus } from '../../shared/eventBus.js';
import type { UserRepository } from '../users/user.repository.js';
import type { NotificationRepository } from './notification.repository.js';
import type { Channel, Notification } from './notification.types.js';
import { assignedToYou, requestReceived, statusChanged } from './templates.js';


export function registerNotificationHandler(
  events: EventBus,
  users: UserRepository,
  notifications: NotificationRepository,
): void {
  async function queueFor(
    recipientId: string,
    requestId: string,
    reference: string,
    content: { template: string; message: string },
    tx: Transaction,
    includeExternal: boolean,
  ) {
    const recipient = await users.findById(recipientId, tx);
    if (!recipient) return;
    const now = new Date().toISOString();

    const base = {
      requestId,
      reference,
      recipientId,
      template: content.template,
      message: content.message,
      attempts: 0,
      providerMessageId: null,
      lastError: null,
      flagged: false,
      createdAt: now,
      updatedAt: now,
    };

    
    await notifications.insert(
      { ...base, id: randomUUID(), channel: 'IN_APP', address: null, status: 'DELIVERED' },
      tx,
    );

    if (!includeExternal || !recipient.phone) return;
    // SMS / WhatsApp only with explicit opt-in (FR-NOT-002).
    const external: Channel[] = [];
    if (recipient.notificationPreferences.sms) external.push('SMS');
    if (recipient.notificationPreferences.whatsapp) external.push('WHATSAPP');
    for (const channel of external) {
      const n: Notification = { ...base, id: randomUUID(), channel, address: recipient.phone, status: 'QUEUED' };
      await notifications.insert(n, tx);
    }
  }

  events.subscribe('RequestSubmitted', (e, tx) =>
    queueFor(e.requesterId, e.requestId, e.reference, requestReceived(e.reference), tx, true),
  );

  events.subscribe('RequestStatusChanged', (e, tx) =>
    queueFor(e.requesterId, e.requestId, e.reference, statusChanged(e.reference, e.toStatus), tx, true),
  );

  // Staff are told in-app when a request is assigned to them by someone else.
  events.subscribe('RequestAssigned', (e, tx) =>
    e.assigneeId === e.assignedById
      ? undefined
      : queueFor(e.assigneeId, e.requestId, e.reference, assignedToYou(e.reference), tx, false),
  );
}
