import { Router, type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import type { AuthController } from './auth.controller.js';

/** Routes only map URLs and middleware to controller methods. */
export function authRoutes(
  controller: AuthController,
  requireAuth: RequestHandler,
  options: { rateLimit: boolean },
): Router {
  const router = Router();

  
  const limiter: RequestHandler = options.rateLimit
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Please try again later.' } },
      })
    : (_req, _res, next) => next();

  router.post('/register', limiter, controller.register);
  router.post('/login', limiter, controller.login);
  router.get('/me', requireAuth, controller.me);
  return router;
}
