import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Transaction, TransactionManager } from '../../shared/transaction.js';
import type { EventBus } from '../../shared/eventBus.js';
import { badRequest, conflict, forbidden, notFound } from '../../shared/errors.js';
import { parseOrThrow } from '../../shared/http/validate.js';
import type { AuthContext } from '../auth/token.js';
import type { UserRepository } from '../users/user.repository.js';
import { isStaffRole } from '../users/user.types.js';
import type { CategoryRules } from './categoryRules.js';
import type { Page, RequestRepository } from './request.repository.js';
import {
  CATEGORIES,
  STATUSES,
  type Comment,
  type RequestStatus,
  type ServiceRequest,
  type StatusHistoryEntry,
} from './request.types.js';
import { dueDateFor, isOverdue } from './serviceLevels.js';
import { NOTE_REQUIRED, canTransition } from './statusTransitions.js';

// ---------- input schemas (untrusted data from the client) ----------

const submitSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(4000),
  category: z.enum(CATEGORIES, { error: 'Category must be one of the listed categories' }),
  location: z.string().trim().max(200).optional().default(''),
});

const csv = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))
    .pipe(z.array(z.enum(values)).optional());

const listQuerySchema = z.object({
  status: csv(STATUSES),
  category: csv(CATEGORIES),
  search: z.string().trim().max(100).optional(),
  assignedToMe: z.enum(['true', 'false']).optional(),
  unassigned: z.enum(['true', 'false']).optional(),
  overdue: z.enum(['true', 'false']).optional(),
  assigneeId: z.uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const assignSchema = z.object({
  /** Leave out to accept the request yourself. */
  assigneeId: z.uuid().optional(),
});

const statusSchema = z.object({
  status: z.enum(STATUSES),
  note: z.string().trim().max(2000).optional(),
  /** Optional concurrency check: the version the user was looking at. */
  expectedVersion: z.number().int().positive().optional(),
});

const actionSchema = z.object({
  body: z.string().trim().min(1, 'Action description cannot be empty').max(2000),
});

/** A request as returned by the API, with its overdue flag worked out. */
export type RequestView = ServiceRequest & { overdue: boolean };

export interface RequestDetail {
  request: RequestView;
  history: StatusHistoryEntry[];
  actions?: Comment[];
}

/** Full audit trail with the names of the people involved (FR-MGT-005, NFR-AUD-001). */
export interface AuditTrail {
  request: RequestView;
  history: (StatusHistoryEntry & { changedByName: string })[];
  actions: (Comment & { authorName: string })[];
}

export const toView = (r: ServiceRequest, now = new Date()): RequestView => ({ ...r, overdue: isOverdue(r, now) });

/**
 * Request lifecycle: submit, view, assign, change status, comment.
 * Every change runs in one transaction together with its history row and its event handlers.
 */
export class RequestService {
  constructor(
    private readonly store: TransactionManager,
    private readonly requests: RequestRepository,
    private readonly users: UserRepository,
    private readonly categoryRules: CategoryRules,
    private readonly events: EventBus,
  ) {}

  /** FR-REQ-001 to FR-REQ-004: submit a request and return its confirmation and reference. */
  async submit(auth: AuthContext, input: unknown): Promise<RequestView> {
    if (auth.role !== 'REQUESTER') throw forbidden('Only requesters can submit service requests');
    const body = parseOrThrow(submitSchema, input);
    if (this.categoryRules.requiresLocation(body.category) && !body.location) {
      throw badRequest('Some of the submitted information is missing or invalid', [
        { field: 'location', message: 'Location is required for this category' },
      ]);
    }

    return this.store.transaction(async (tx) => {
      const created = new Date();
      const now = created.toISOString();
      const priority = this.categoryRules.initialPriority(body.category);
      const request: ServiceRequest = {
        id: randomUUID(),
        reference: await this.requests.nextReference(tx),
        requesterId: auth.userId,
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        priority,
        status: 'SUBMITTED',
        assigneeId: null,
        resolution: null,
        dueAt: dueDateFor(priority, created),
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      await this.requests.insert(request, tx);
      await this.requests.addHistory(
        {
          id: randomUUID(),
          requestId: request.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedById: auth.userId,
          note: null,
          changedAt: now,
        },
        tx,
      );
      await this.events.publish(
        'RequestSubmitted',
        { requestId: request.id, reference: request.reference, requesterId: auth.userId, occurredAt: now },
        tx,
      );
      return toView(request);
    });
  }

  /** FR-REQ-005/006 (own requests) and FR-STF-001 to FR-STF-004 (search, filter, sort). */
  async list(auth: AuthContext, query: unknown): Promise<Page<RequestView>> {
    const q = parseOrThrow(listQuerySchema, query);
    const staff = isStaffRole(auth.role);
    const page = await this.requests.search({
      requesterId: staff ? undefined : auth.userId, // requesters only ever see their own
      assigneeId: !staff
        ? undefined
        : q.assignedToMe === 'true'
          ? auth.userId
          : q.unassigned === 'true'
            ? null
            : q.assigneeId,
      status: q.status,
      category: q.category,
      search: q.search,
      overdue: q.overdue === undefined ? undefined : q.overdue === 'true',
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      page: q.page,
      pageSize: q.pageSize,
    });
    const now = new Date();
    return { ...page, items: page.items.map((r) => toView(r, now)) };
  }

  /** FR-STF-005 / FR-REQ-005: request details with its status timeline. */
  async getDetail(auth: AuthContext, id: string): Promise<RequestDetail> {
    const request = await this.loadVisible(auth, id);
    const history = await this.requests.historyFor(id);
    if (!isStaffRole(auth.role)) {
      return { request: toView(request), history };
    }
    return { request: toView(request), history, actions: await this.requests.commentsFor(id) };
  }

  /** FR-MGT-005 / FR-SEC-004: who changed what and when, with names, for staff and managers. */
  async getAuditTrail(auth: AuthContext, id: string): Promise<AuditTrail> {
    if (!isStaffRole(auth.role)) throw forbidden();
    const request = await this.loadVisible(auth, id);
    const [history, actions, users] = await Promise.all([
      this.requests.historyFor(id),
      this.requests.commentsFor(id),
      this.users.list(),
    ]);
    const nameOf = new Map(users.map((u) => [u.id, u.name]));
    return {
      request: toView(request),
      history: history.map((h) => ({ ...h, changedByName: nameOf.get(h.changedById) ?? 'Unknown user' })),
      actions: actions.map((a) => ({ ...a, authorName: nameOf.get(a.authorId) ?? 'Unknown user' })),
    };
  }

  /** FR-STF-006: staff accept a request; managers and admins can assign it to any staff member. */
  async assign(auth: AuthContext, id: string, input: unknown): Promise<RequestView> {
    const body = parseOrThrow(assignSchema, input);
    const assigneeId = body.assigneeId ?? auth.userId;

    return this.store.transaction(async (tx) => {
      const request = await this.loadForStaff(auth, id, tx);
      const isManager = auth.role === 'MANAGER' || auth.role === 'ADMIN';

      if (!isManager) {
        if (assigneeId !== auth.userId) throw forbidden('Staff can only assign requests to themselves');
        if (request.assigneeId && request.assigneeId !== auth.userId) {
          throw conflict('This request is already assigned to someone else');
        }
      }
      if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(request.status)) {
        throw conflict(`A request that is ${request.status} cannot be assigned`);
      }
      const assignee = await this.users.findById(assigneeId, tx);
      if (!assignee || !isStaffRole(assignee.role) || assignee.role === 'ADMIN') {
        throw badRequest('Requests can only be assigned to staff members or managers');
      }

      const now = new Date().toISOString();
      request.assigneeId = assignee.id;
      request.updatedAt = now;
      request.version += 1;
      await this.events.publish(
        'RequestAssigned',
        {
          requestId: request.id,
          reference: request.reference,
          requesterId: request.requesterId,
          assigneeId: assignee.id,
          assignedById: auth.userId,
          occurredAt: now,
        },
        tx,
      );
      // A new request moves to ASSIGNED automatically once someone owns it.
      if (request.status === 'SUBMITTED') {
        await this.applyStatus(request, 'ASSIGNED', auth.userId, null, now, tx);
      } else {
        await this.requests.update(request, tx);
      }
      return toView(request);
    });
  }

  /** FR-STF-007, FR-STF-009, FR-STF-010: change status along the allowed workflow only. */
  async changeStatus(auth: AuthContext, id: string, input: unknown): Promise<RequestView> {
    const body = parseOrThrow(statusSchema, input);

    return this.store.transaction(async (tx) => {
      const request = await this.loadForStaff(auth, id, tx);
      const isManager = auth.role === 'MANAGER' || auth.role === 'ADMIN';

      if (body.expectedVersion !== undefined && body.expectedVersion !== request.version) {
        throw conflict('This request was changed by someone else. Reload it and try again.', {
          currentVersion: request.version,
        });
      }
      if (!isManager && request.assigneeId !== auth.userId) {
        throw forbidden('Only the assigned staff member or a manager can change this request');
      }
      if (body.status === 'ASSIGNED') {
        throw badRequest('Use the assign action to assign a request');
      }
      if (!canTransition(request.status, body.status)) {
        throw conflict(`A request cannot move from ${request.status} to ${body.status}`, {
          from: request.status,
          to: body.status,
        });
      }
      if ((body.status === 'CLOSED' || body.status === 'REJECTED') && !isManager) {
        throw forbidden('Only a manager can close or reject a request');
      }
      if (NOTE_REQUIRED.includes(body.status) && !body.note) {
        throw badRequest('Some of the submitted information is missing or invalid', [
          { field: 'note', message: `A note is required when setting the status to ${body.status}` },
        ]);
      }

      const now = new Date().toISOString();
      if (body.status === 'RESOLVED') request.resolution = body.note ?? null;
      if (body.status === 'IN_PROGRESS' && request.status === 'RESOLVED') request.resolution = null;
      await this.applyStatus(request, body.status, auth.userId, body.note ?? null, now, tx);
      return toView(request);
    });
  }

  /** FR-STF-008: staff record actions and comments against a request. */
  async recordAction(auth: AuthContext, id: string, input: unknown): Promise<Comment> {
    const body = parseOrThrow(actionSchema, input);
    return this.store.transaction(async (tx) => {
      await this.loadForStaff(auth, id, tx);
      const comment: Comment = {
        id: randomUUID(),
        requestId: id,
        authorId: auth.userId,
        body: body.body,
        createdAt: new Date().toISOString(),
      };
      await this.requests.addComment(comment, tx);
      return comment;
    });
  }

  // ---------- helpers ----------

  /** Saves the new status, its history row and publishes the event, all in the same transaction. */
  private async applyStatus(
    request: ServiceRequest,
    to: RequestStatus,
    changedById: string,
    note: string | null,
    now: string,
    tx: Transaction,
  ) {
    const from = request.status;
    request.status = to;
    request.updatedAt = now;
    request.version += 1;
    await this.requests.update(request, tx);
    await this.requests.addHistory(
      { id: randomUUID(), requestId: request.id, fromStatus: from, toStatus: to, changedById, note, changedAt: now },
      tx,
    );
    await this.events.publish(
      'RequestStatusChanged',
      {
        requestId: request.id,
        reference: request.reference,
        requesterId: request.requesterId,
        fromStatus: from,
        toStatus: to,
        changedById,
        ...(note ? { note } : {}),
        occurredAt: now,
      },
      tx,
    );
  }

  /**
   * Object-level authorisation: requesters may only see their own requests.
   * Other people's requests return 404 (not 403) so their existence is not revealed.
   */
  private async loadVisible(auth: AuthContext, id: string, tx?: Transaction): Promise<ServiceRequest> {
    const request = await this.requests.findById(id, tx);
    if (!request) throw notFound('Request not found');
    if (!isStaffRole(auth.role) && request.requesterId !== auth.userId) throw notFound('Request not found');
    return request;
  }

  private async loadForStaff(auth: AuthContext, id: string, tx: Transaction): Promise<ServiceRequest> {
    if (!isStaffRole(auth.role)) throw forbidden();
    return this.loadVisible(auth, id, tx);
  }
}
