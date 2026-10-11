import type { Request, RequestHandler } from 'express';
import { forbidden, unauthorized } from '../../shared/errors.js';
import type { UserRepository } from '../users/user.repository.js';
import type { Role } from '../users/user.types.js';
import type { AuthContext, TokenService } from './token.js';

declare global {
  
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * FR-SEC-001: every protected route requires a valid token.
 * The user is re-loaded so a deleted account or changed role takes effect immediately.
 */
export function requireAuth(tokens: TokenService, users: UserRepository): RequestHandler {
  return async (req, _res, next) => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw unauthorized();

    const ctx = tokens.verify(token);
    if (!ctx) throw unauthorized('Your session is invalid or has expired. Please log in again.');

    const user = await users.findById(ctx.userId);
    if (!user) throw unauthorized('Your session is invalid or has expired. Please log in again.');

    req.auth = { userId: user.id, role: user.role };
    next();
  };
}

/** FR-SEC-002 / NFR-SEC-001: only the listed roles may use the route. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) throw unauthorized();
    if (!roles.includes(req.auth.role)) throw forbidden();
    next();
  };
}

export function authOf(req: Request): AuthContext {
  if (!req.auth) throw unauthorized();
  return req.auth;
}
