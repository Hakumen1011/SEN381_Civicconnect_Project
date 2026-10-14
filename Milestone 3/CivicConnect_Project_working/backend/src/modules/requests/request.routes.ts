import { Router, type RequestHandler } from 'express';
import { requireRole } from '../auth/auth.middleware.js';
import type { RequestController } from './request.controller.js';

export function requestRoutes(controller: RequestController, requireAuth: RequestHandler): Router {
  const router = Router();
  const staffOnly = requireRole('STAFF', 'MANAGER', 'ADMIN');
  router.use(requireAuth);

  router.get('/meta', controller.meta);
  router.post('/', requireRole('REQUESTER'), controller.submit);
  router.get('/', controller.list);
  router.get('/:id', controller.detail);
  router.get('/:id/history', staffOnly, controller.history);
  router.put('/:id/assignment', staffOnly, controller.assign);
  router.put('/:id/status', staffOnly, controller.changeStatus);
  router.post('/:id/actions', staffOnly, controller.recordAction);
  return router;
}
