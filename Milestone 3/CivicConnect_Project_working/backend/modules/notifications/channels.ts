import { randomUUID } from 'node:crypto';


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


export class SimulatedChannel implements NotificationChannel {
  
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


export function createChannels(): ChannelSet {
  return { SMS: new SimulatedChannel('SMS'), WHATSAPP: new SimulatedChannel('WHATSAPP') };
}
