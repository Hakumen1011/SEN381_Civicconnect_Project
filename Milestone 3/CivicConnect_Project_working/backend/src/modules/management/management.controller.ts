import type { Request, Response } from 'express';
import { authOf } from '../auth/auth.middleware.js';
import type { ManagementService } from './management.service.js';

export class ManagementController {
  constructor(private readonly service: ManagementService) {}

 
  listRequests = async (req: Request, res: Response) => {
    res.json(await this.service.listRequests(authOf(req), req.query as Record<string, unknown>));
  };

  
  summary = async (_req: Request, res: Response) => {
    res.json(await this.service.summary());
  };
}
