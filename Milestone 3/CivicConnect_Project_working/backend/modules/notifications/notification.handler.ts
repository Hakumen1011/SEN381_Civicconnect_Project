import { randomUUID } from 'node:crypto';
import type { Transaction } from '../../shared/transaction.js';
import type { EventBus } from '../../shared/eventBus.js';
import type { UserRepository } from '../users/user.repository.js';
import type { NotificationRepository } from './notification.repository.js';
import type { Channel, Notification } from './notification.types.js';
import { assignedToYou, requestReceived, statusChanged } from './templates.js';

/**
 * NotificationHandler (Design decision 1 / Decision 8): listens to request events and queues
 * notifications. It runs inside the same transaction as the request change (transactional outbox),
 * so the change and its notifications are always saved together. Sending happens later, in the
 * background dispatcher, so it never slows the user down (FR-NOT-007).
 */
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

    // In-app notifications are always created and are "delivered" immediately.
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
