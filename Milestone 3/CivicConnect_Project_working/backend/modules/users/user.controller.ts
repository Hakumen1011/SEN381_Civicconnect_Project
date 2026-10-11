import type { Request, Response } from 'express';
import type { AuthService } from '../auth/auth.service.js';
import { authOf } from '../auth/auth.middleware.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly auth: AuthService,
  ) {}

  /** FR-NOT-002: the signed-in user chooses notification channels and gives opt-in. */
  updateNotificationPreferences = async (req: Request, res: Response) => {
    res.json({ user: await this.users.updateNotificationPreferences(authOf(req).userId, req.body) });
  };

  /** Staff list, used when assigning requests. */
  listStaff = async (_req: Request, res: Response) => {
    res.json({ users: await this.users.listStaff() });
  };

  /** STK-004: administrators create staff, manager and admin accounts. */
  create = async (req: Request, res: Response) => {
    res.status(201).json({ user: await this.auth.createUserAsAdmin(req.body) });
  };
}
