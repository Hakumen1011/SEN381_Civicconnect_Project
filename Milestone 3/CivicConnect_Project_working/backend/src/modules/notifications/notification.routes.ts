import { Router, type RequestHandler } from 'express';
import { requireRole } from '../auth/auth.middleware.js';
import type { NotificationController } from './notification.controller.js';

export function notificationRoutes(controller: NotificationController, requireAuth: RequestHandler): Router {
  const router = Router();
  router.use(requireAuth);
  router.get('/me', controller.myInbox);
  router.get('/', requireRole('ADMIN'), controller.log);
  router.post('/dispatch', requireRole('ADMIN'), controller.dispatch);
  return router;
}
