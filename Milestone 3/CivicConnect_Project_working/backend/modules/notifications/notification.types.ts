export const CHANNELS = ['IN_APP', 'SMS', 'WHATSAPP'] as const;
export type Channel = (typeof CHANNELS)[number];

/** Same lifecycle real SMS providers report (queued, sent, delivered, undelivered, failed). */
export const NOTIFICATION_STATUSES = ['QUEUED', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED'] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const MAX_SEND_ATTEMPTS = 3;

/** One row in the notification log / outbox (FR-NOT-004). */
export interface Notification {
  id: string;
  requestId: string;
  reference: string;
  recipientId: string;
  channel: Channel;
  /** Phone number for SMS / WhatsApp; null for in-app messages. */
  address: string | null;
  template: string;
  message: string;
  status: NotificationStatus;
  attempts: number;
  providerMessageId: string | null;
  lastError: string | null;
  /** True when retries are used up and someone should look at it (FR-NOT-006). */
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}
