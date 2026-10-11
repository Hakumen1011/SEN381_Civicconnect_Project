import type { Request, Response } from 'express';
import { z } from 'zod';
import { parseOrThrow } from '../../shared/http/validate.js';
import { authOf } from '../auth/auth.middleware.js';
import type { NotificationDispatcher } from './notification.dispatcher.js';
import type { NotificationRepository } from './notification.repository.js';
import { CHANNELS, NOTIFICATION_STATUSES } from './notification.types.js';

const logQuery = z.object({
  requestId: z.uuid().optional(),
  channel: z.enum(CHANNELS).optional(),
  status: z.enum(NOTIFICATION_STATUSES).optional(),
});

export class NotificationController {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  /** Simulated inbox (FR-NOT-005): every message the signed-in user has received, on every channel. */
  myInbox = async (req: Request, res: Response) => {
    res.json({ notifications: await this.notifications.find({ recipientId: authOf(req).userId }) });
  };

  /** Notification log for administrators (FR-NOT-004). */
  log = async (req: Request, res: Response) => {
    const q = parseOrThrow(logQuery, req.query);
    res.json({
      notifications: await this.notifications.find({
        requestId: q.requestId,
        channel: q.channel,
        status: q.status ? [q.status] : undefined,
      }),
    });
  };

  /** Runs one sending pass immediately (useful for demonstrations and testing). */
  dispatch = async (_req: Request, res: Response) => {
    res.json({ summary: await this.dispatcher.runOnce() });
  };
}
