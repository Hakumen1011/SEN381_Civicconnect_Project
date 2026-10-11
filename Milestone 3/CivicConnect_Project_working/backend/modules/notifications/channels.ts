import { randomUUID } from 'node:crypto';

/**
 * FR-NOT-003: every external channel sits behind this one interface (Adapter pattern).
 * The simulated channels below can be swapped for live SMS / WhatsApp providers later
 * without changing the notification handler or dispatcher.
 */
export type SendResult =
  | { accepted: true; providerMessageId: string }
  | { accepted: false; error: string; retryable: boolean };

export type DeliveryResult = 'DELIVERED' | 'UNDELIVERED';

export interface NotificationChannel {
  readonly name: 'SMS' | 'WHATSAPP';
  send(to: string, message: string): Promise<SendResult>;
  checkDelivery(providerMessageId: string, to: string): Promise<DeliveryResult>;
}

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Simulated provider ("fake"): behaves like a real one but never contacts a real phone.
 * Reserved test numbers force errors, like a provider's test numbers do (FR-NOT-006):
 *   - number ending in 0001 -> send fails (retried, then flagged)
 *   - number ending in 0009 -> accepted but never delivered (UNDELIVERED)
 *   - any other valid number -> SENT, then DELIVERED
 */
export class SimulatedChannel implements NotificationChannel {
  /** Every message "sent" is kept so it can be shown in the simulated inbox and in tests. */
  readonly outbox: { to: string; message: string; providerMessageId: string; at: string }[] = [];

  constructor(readonly name: 'SMS' | 'WHATSAPP') {}

  async send(to: string, message: string): Promise<SendResult> {
    if (!E164.test(to)) return { accepted: false, error: 'Invalid phone number format', retryable: false };
    if (to.endsWith('0001')) return { accepted: false, error: 'Simulated provider error', retryable: true };
    const providerMessageId = `${this.name === 'SMS' ? 'SM' : 'WA'}-${randomUUID()}`;
    this.outbox.push({ to, message, providerMessageId, at: new Date().toISOString() });
    return { accepted: true, providerMessageId };
  }

  async checkDelivery(_providerMessageId: string, to: string): Promise<DeliveryResult> {
    return to.endsWith('0009') ? 'UNDELIVERED' : 'DELIVERED';
  }
}

export interface ChannelSet {
  SMS: NotificationChannel;
  WHATSAPP: NotificationChannel;
}

/**
 * Only the simulated mode exists in the current baseline. Live providers are a deferred decision
 * (Engineering Decision Log, Decision 12) and would be added here behind the same interface.
 */
export function createChannels(): ChannelSet {
  return { SMS: new SimulatedChannel('SMS'), WHATSAPP: new SimulatedChannel('WHATSAPP') };
}
