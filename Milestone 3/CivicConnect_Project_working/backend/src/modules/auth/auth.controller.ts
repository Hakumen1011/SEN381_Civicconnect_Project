import type { Request, Response } from 'express';
import type { UserService } from '../users/user.service.js';
import { authOf } from './auth.middleware.js';
import type { AuthService } from './auth.service.js';

/** Controller: turns HTTP requests into service calls and service results into HTTP responses. */
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  register = async (req: Request, res: Response) => {
    res.status(201).json(await this.auth.registerRequester(req.body));
  };

  login = async (req: Request, res: Response) => {
    res.json(await this.auth.login(req.body));
  };

  me = async (req: Request, res: Response) => {
    res.json({ user: await this.users.getById(authOf(req).userId) });
  };
}
