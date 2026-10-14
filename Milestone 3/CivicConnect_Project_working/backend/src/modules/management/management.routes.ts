import { Router, type RequestHandler } from 'express';
import { requireRole } from '../auth/auth.middleware.js';
import type { ManagementController } from './management.controller.js';

export function managementRoutes(controller: ManagementController, requireAuth: RequestHandler): Router {
  const router = Router();
  router.use(requireAuth, requireRole('MANAGER', 'ADMIN'));
  router.get('/requests', controller.listRequests);
  router.get('/summary', controller.summary);
  return router;
}
