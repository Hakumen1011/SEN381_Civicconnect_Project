import type { Request, Response } from 'express';
import { authOf } from '../auth/auth.middleware.js';
import type { ManagementService } from './management.service.js';

export class ManagementController {
  constructor(private readonly service: ManagementService) {}

  /** FR-MGT-001 to FR-MGT-003: open, overdue, resolved and closed work, with filters. */
  listRequests = async (req: Request, res: Response) => {
    res.json(await this.service.listRequests(authOf(req), req.query as Record<string, unknown>));
  };

  /** FR-MGT-004: request counts by status and category, overdue totals and resolution time. */
  summary = async (_req: Request, res: Response) => {
    res.json(await this.service.summary());
  };
}
