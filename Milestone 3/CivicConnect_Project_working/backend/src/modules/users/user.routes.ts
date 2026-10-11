import { Router, type RequestHandler } from 'express';
import { requireRole } from '../auth/auth.middleware.js';
import type { UserController } from './user.controller.js';

export function userRoutes(controller: UserController, requireAuth: RequestHandler): Router {
  const router = Router();
  router.use(requireAuth);
  router.put('/me/notification-preferences', controller.updateNotificationPreferences);
  router.get('/staff', requireRole('STAFF', 'MANAGER', 'ADMIN'), controller.listStaff);
  router.post('/', requireRole('ADMIN'), controller.create);
  return router;
}
