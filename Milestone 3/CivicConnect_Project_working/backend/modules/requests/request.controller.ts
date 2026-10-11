import type { Request, Response } from 'express';
import { notFound } from '../../shared/errors.js';
import { authOf } from '../auth/auth.middleware.js';
import type { RequestService } from './request.service.js';
import { CATEGORIES, CATEGORY_LABELS, STATUSES } from './request.types.js';
import { TARGET_HOURS } from './serviceLevels.js';
import { ALLOWED_TRANSITIONS } from './statusTransitions.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Route ids must be UUIDs; anything else cannot exist, so it is a 404. */
function idOf(req: Request): string {
  const id = req.params.id;
  if (typeof id !== 'string' || !UUID.test(id)) throw notFound('Request not found');
  return id;
}

export class RequestController {
  constructor(private readonly service: RequestService) {}

  /** Lookup data for the front end: categories, statuses, allowed workflow and service levels. */
  meta = (_req: Request, res: Response) => {
    res.json({
      categories: CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
      statuses: STATUSES,
      transitions: ALLOWED_TRANSITIONS,
      serviceLevelTargetHours: TARGET_HOURS,
    });
  };

  submit = async (req: Request, res: Response) => {
    const request = await this.service.submit(authOf(req), req.body);
    res.status(201).json({
      message: `Your request has been recorded. Your reference number is ${request.reference}.`,
      request,
    });
  };

  list = async (req: Request, res: Response) => {
    res.json(await this.service.list(authOf(req), req.query));
  };

  detail = async (req: Request, res: Response) => {
    res.json(await this.service.getDetail(authOf(req), idOf(req)));
  };

  history = async (req: Request, res: Response) => {
    res.json(await this.service.getAuditTrail(authOf(req), idOf(req)));
  };

  assign = async (req: Request, res: Response) => {
    res.json({ request: await this.service.assign(authOf(req), idOf(req), req.body ?? {}) });
  };

  changeStatus = async (req: Request, res: Response) => {
    res.json({ request: await this.service.changeStatus(authOf(req), idOf(req), req.body) });
  };

  recordAction = async (req: Request, res: Response) => {
    res.status(201).json({ action: await this.service.recordAction(authOf(req), idOf(req), req.body) });
  };
}
