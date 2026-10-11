import type { Request, Response } from 'express';
import type { AuthService } from '../auth/auth.service.js';
import { authOf } from '../auth/auth.middleware.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly auth: AuthService,
  ) {}

 
  updateNotificationPreferences = async (req: Request, res: Response) => {
    res.json({ user: await this.users.updateNotificationPreferences(authOf(req).userId, req.body) });
  };

  
  listStaff = async (_req: Request, res: Response) => {
    res.json({ users: await this.users.listStaff() });
  };

 
  create = async (req: Request, res: Response) => {
    res.status(201).json({ user: await this.auth.createUserAsAdmin(req.body) });
  };
}
