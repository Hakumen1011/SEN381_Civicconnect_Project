import { tablesOf, type InMemoryStore } from '../../src/data/store.js';
import type { Transaction } from '../../shared/transaction.js';
import type { Channel, Notification, NotificationStatus } from './notification.types.js';

export interface NotificationFilter {
  recipientId?: string;
  requestId?: string;
  channel?: Channel;
  status?: NotificationStatus[];
}


export interface NotificationRepository {
  insert(notification: Notification, tx: Transaction): Promise<void>;
  update(notification: Notification, tx: Transaction): Promise<void>;
  find(filter: NotificationFilter, tx?: Transaction): Promise<Notification[]>;
}

export class InMemoryNotificationRepository implements NotificationRepository {
  constructor(private readonly store: InMemoryStore) {}

  async insert(notification: Notification, tx: Transaction) {
    tablesOf(tx).notifications.set(notification.id, structuredClone(notification));
  }

  async update(notification: Notification, tx: Transaction) {
    tablesOf(tx).notifications.set(notification.id, structuredClone(notification));
  }

  async find(filter: NotificationFilter, tx: Transaction = this.store.read()) {
    return [...tablesOf(tx).notifications.values()]
      .filter(
        (n) =>
          (!filter.recipientId || n.recipientId === filter.recipientId) &&
          (!filter.requestId || n.requestId === filter.requestId) &&
          (!filter.channel || n.channel === filter.channel) &&
          (!filter.status?.length || filter.status.includes(n.status)),
      )
      .map((n) => structuredClone(n))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
