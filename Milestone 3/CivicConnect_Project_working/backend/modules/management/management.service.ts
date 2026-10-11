import { z } from 'zod';
import { parseOrThrow } from '../../shared/http/validate.js';
import type { AuthContext } from '../auth/token.js';
import type { RequestRepository } from '../requests/request.repository.js';
import type { RequestService } from '../requests/request.service.js';
import { CATEGORIES, CATEGORY_LABELS, STATUSES, type Category, type RequestStatus } from '../requests/request.types.js';
import { DONE_STATUSES, OPEN_STATUSES, TARGET_HOURS, isOverdue } from '../requests/serviceLevels.js';

/** Quick views for the management dashboard (FR-MGT-001 to FR-MGT-003). */
const VIEWS = ['all', 'open', 'overdue', 'resolved', 'closed'] as const;
const viewSchema = z.object({ view: z.enum(VIEWS).default('all') }).loose();

export interface ManagementSummary {
  generatedAt: string;
  totals: { all: number; open: number; overdue: number; resolved: number; closed: number; rejected: number };
  byStatus: Record<RequestStatus, number>;
  byCategory: { category: Category; label: string; total: number; open: number; overdue: number }[];
  /** Average hours from submission to first resolution, or null if nothing is resolved yet. */
  averageResolutionHours: number | null;
  serviceLevelTargetHours: typeof TARGET_HOURS;
}

/**
 * Management queries (FR-MGT-001 to FR-MGT-004). Read-only: managers see the state of all work,
 * but changes still go through RequestService so the workflow rules always apply.
 */
export class ManagementService {
  constructor(
    private readonly requests: RequestRepository,
    private readonly requestService: RequestService,
  ) {}

  /** Lists requests for managers, with a quick "view" plus all the normal filters. */
  async listRequests(auth: AuthContext, query: Record<string, unknown>) {
    const { view, ...rest } = parseOrThrow(viewSchema, query);
    const viewFilter: Record<string, string> = {
      all: {},
      open: { status: OPEN_STATUSES.join(',') },
      overdue: { overdue: 'true' },
      resolved: { status: 'RESOLVED' },
      closed: { status: 'CLOSED' },
    }[view];
    return this.requestService.list(auth, { ...rest, ...viewFilter });
  }

  async summary(): Promise<ManagementSummary> {
    const now = new Date();
    const all = await this.requests.listAll();

    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<RequestStatus, number>;
    const byCategory = new Map(
      CATEGORIES.map((c) => [c, { category: c, label: CATEGORY_LABELS[c], total: 0, open: 0, overdue: 0 }]),
    );
    let overdue = 0;

    for (const r of all) {
      byStatus[r.status] += 1;
      const cat = byCategory.get(r.category)!;
      cat.total += 1;
      if (!DONE_STATUSES.includes(r.status)) cat.open += 1;
      if (isOverdue(r, now)) {
        overdue += 1;
        cat.overdue += 1;
      }
    }

    // Average time to resolution, using the first RESOLVED entry in each request's history.
    const durations: number[] = [];
    for (const r of all) {
      const history = await this.requests.historyFor(r.id);
      const resolved = history.find((h) => h.toStatus === 'RESOLVED');
      if (resolved) durations.push(Date.parse(resolved.changedAt) - Date.parse(r.createdAt));
    }
    const averageResolutionHours = durations.length
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length / 3_600_000) * 10) / 10
      : null;

    return {
      generatedAt: now.toISOString(),
      totals: {
        all: all.length,
        open: OPEN_STATUSES.reduce((n, s) => n + byStatus[s], 0),
        overdue,
        resolved: byStatus.RESOLVED,
        closed: byStatus.CLOSED,
        rejected: byStatus.REJECTED,
      },
      byStatus,
      byCategory: [...byCategory.values()],
      averageResolutionHours,
      serviceLevelTargetHours: TARGET_HOURS,
    };
  }
}
