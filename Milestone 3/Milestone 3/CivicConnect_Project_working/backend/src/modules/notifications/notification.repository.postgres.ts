import { dbOf, iso, type PostgresStore } from '../../db/postgres.js';
import type { Transaction } from '../../shared/transaction.js';
import type { NotificationFilter, NotificationRepository } from './notification.repository.js';
import type { Channel, Notification, NotificationStatus } from './notification.types.js';

interface NotificationRow {
  id: string;
  request_id: string;
  reference: string;
  recipient_id: string;
  channel: Channel;
  address: string | null;
  template: string;
  message: string;
  status: NotificationStatus;
  attempts: number;
  provider_message_id: string | null;
  last_error: string | null;
  flagged: boolean;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS = `id, request_id, reference, recipient_id, channel, address, template, message, status,
  attempts, provider_message_id, last_error, flagged, created_at, updated_at`;

function toNotification(n: NotificationRow): Notification {
  return {
    id: n.id,
    requestId: n.request_id,
    reference: n.reference,
    recipientId: n.recipient_id,
    channel: n.channel,
    address: n.address,
    template: n.template,
    message: n.message,
    status: n.status,
    attempts: n.attempts,
    providerMessageId: n.provider_message_id,
    lastError: n.last_error,
    flagged: n.flagged,
    createdAt: iso(n.created_at),
    updatedAt: iso(n.updated_at),
  };
}

/** PostgreSQL implementation of NotificationRepository (the notification log / outbox). */
export class PostgresNotificationRepository implements NotificationRepository {
  constructor(private readonly store: PostgresStore) {}

  async insert(n: Notification, tx: Transaction) {
    await dbOf(tx).query(
      `INSERT INTO notifications (${COLUMNS})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        n.id, n.requestId, n.reference, n.recipientId, n.channel, n.address, n.template, n.message,
        n.status, n.attempts, n.providerMessageId, n.lastError, n.flagged, n.createdAt, n.updatedAt,
      ],
    );
  }

  async update(n: Notification, tx: Transaction) {
    await dbOf(tx).query(
      `UPDATE notifications
          SET status = $2, attempts = $3, provider_message_id = $4, last_error = $5, flagged = $6, updated_at = $7
        WHERE id = $1`,
      [n.id, n.status, n.attempts, n.providerMessageId, n.lastError, n.flagged, n.updatedAt],
    );
  }

  async find(filter: NotificationFilter, tx: Transaction = this.store.read()) {
    const where: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      values.push(value);
      where.push(sql.replace('?', `$${values.length}`));
    };
    if (filter.recipientId) add('recipient_id = ?', filter.recipientId);
    if (filter.requestId) add('request_id = ?', filter.requestId);
    if (filter.channel) add('channel = ?', filter.channel);
    if (filter.status?.length) add('status = ANY(?)', filter.status);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await dbOf(tx).query<NotificationRow>(
      `SELECT ${COLUMNS} FROM notifications ${whereSql} ORDER BY created_at DESC, seq DESC`,
      values,
    );
    return rows.map(toNotification);
  }
}
