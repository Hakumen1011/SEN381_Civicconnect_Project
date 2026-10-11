import type { TransactionManager } from '../../shared/transaction.js';
import type { ChannelSet } from './channels.js';
import type { NotificationRepository } from './notification.repository.js';
import { MAX_SEND_ATTEMPTS, type Notification } from './notification.types.js';

export interface DispatchSummary {
  sent: number;
  delivered: number;
  undelivered: number;
  failed: number;
  flagged: number;
}


export class NotificationDispatcher {
  private running = false;

  constructor(
    private readonly store: TransactionManager,
    private readonly notifications: NotificationRepository,
    private readonly channels: ChannelSet,
  ) {}

  async runOnce(): Promise<DispatchSummary> {
    const summary: DispatchSummary = { sent: 0, delivered: 0, undelivered: 0, failed: 0, flagged: 0 };
    if (this.running) return summary; // never overlap two passes
    this.running = true;
    try {
      const pending = await this.notifications.find({ status: ['QUEUED', 'FAILED', 'SENT'] });
      for (const n of pending) {
        if (n.channel === 'IN_APP') continue;
        if (n.status === 'FAILED' && (n.flagged || n.attempts >= MAX_SEND_ATTEMPTS)) continue;
        const updated = n.status === 'SENT' ? await this.checkDelivery(n) : await this.send(n);
        if (!updated) continue;
        await this.store.transaction((tx) => this.notifications.update(updated, tx));
        if (updated.status === 'SENT') summary.sent += 1;
        if (updated.status === 'DELIVERED') summary.delivered += 1;
        if (updated.status === 'UNDELIVERED') summary.undelivered += 1;
        if (updated.status === 'FAILED') summary.failed += 1;
        if (updated.flagged) summary.flagged += 1;
      }
    } finally {
      this.running = false;
    }
    return summary;
  }

  private async send(n: Notification): Promise<Notification> {
    const channel = this.channels[n.channel as 'SMS' | 'WHATSAPP'];
    const result = await channel.send(n.address ?? '', n.message);
    const attempts = n.attempts + 1;
    const now = new Date().toISOString();
    if (result.accepted) {
      return { ...n, attempts, status: 'SENT', providerMessageId: result.providerMessageId, lastError: null, updatedAt: now };
    }
    const outOfRetries = !result.retryable || attempts >= MAX_SEND_ATTEMPTS;
    return { ...n, attempts, status: 'FAILED', lastError: result.error, flagged: outOfRetries, updatedAt: now };
  }

  private async checkDelivery(n: Notification): Promise<Notification | undefined> {
    if (!n.providerMessageId || !n.address) return undefined;
    const channel = this.channels[n.channel as 'SMS' | 'WHATSAPP'];
    const result = await channel.checkDelivery(n.providerMessageId, n.address);
    return { ...n, status: result, updatedAt: new Date().toISOString() };
  }
}
