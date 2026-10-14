import { tablesOf, type InMemoryStore } from '../../data/store.js';
import type { Transaction } from '../../shared/transaction.js';
import type { Category, Comment, RequestStatus, ServiceRequest, StatusHistoryEntry } from './request.types.js';
import { isOverdue } from './serviceLevels.js';

export interface RequestFilter {
  requesterId?: string;
  assigneeId?: string | null;
  status?: RequestStatus[];
  category?: Category[];
  /** Free-text search on reference, title and description (FR-STF-002). */
  search?: string;
  /** Only requests past their service-level due date (FR-MGT-002). */
  overdue?: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}


export interface RequestRepository {
  nextReference(tx: Transaction): Promise<string>;
  insert(request: ServiceRequest, tx: Transaction): Promise<void>;
  update(request: ServiceRequest, tx: Transaction): Promise<void>;
  findById(id: string, tx?: Transaction): Promise<ServiceRequest | undefined>;
  search(filter: RequestFilter, tx?: Transaction): Promise<Page<ServiceRequest>>;

  listAll(tx?: Transaction): Promise<ServiceRequest[]>;
  addHistory(entry: StatusHistoryEntry, tx: Transaction): Promise<void>;
  historyFor(requestId: string, tx?: Transaction): Promise<StatusHistoryEntry[]>;
  addComment(comment: Comment, tx: Transaction): Promise<void>;
  commentsFor(requestId: string, tx?: Transaction): Promise<Comment[]>;
}

const PRIORITY_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;

export class InMemoryRequestRepository implements RequestRepository {
  constructor(private readonly store: InMemoryStore) {}

  async nextReference(tx: Transaction) {
    tablesOf(tx).counters.requestReference += 1;
    const year = new Date().getFullYear();
    return `CC-${year}-${String(tablesOf(tx).counters.requestReference).padStart(6, '0')}`;
  }

  async insert(request: ServiceRequest, tx: Transaction) {
    tablesOf(tx).requests.set(request.id, structuredClone(request));
  }

  async update(request: ServiceRequest, tx: Transaction) {
    tablesOf(tx).requests.set(request.id, structuredClone(request));
  }

  async findById(id: string, tx: Transaction = this.store.read()) {
    const found = tablesOf(tx).requests.get(id);
    return found ? structuredClone(found) : undefined;
  }

  async search(filter: RequestFilter, tx: Transaction = this.store.read()) {
    const term = filter.search?.trim().toLowerCase();
    const now = new Date();
    let rows = [...tablesOf(tx).requests.values()].filter((r) => {
      if (filter.requesterId && r.requesterId !== filter.requesterId) return false;
      if (filter.assigneeId !== undefined && r.assigneeId !== filter.assigneeId) return false;
      if (filter.status?.length && !filter.status.includes(r.status)) return false;
      if (filter.category?.length && !filter.category.includes(r.category)) return false;
      if (filter.overdue !== undefined && isOverdue(r, now) !== filter.overdue) return false;
      if (term) {
        const haystack = `${r.reference} ${r.title} ${r.description}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    const dir = filter.sortOrder === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const key = filter.sortBy;
      const av = key === 'priority' ? PRIORITY_RANK[a.priority] : a[key];
      const bv = key === 'priority' ? PRIORITY_RANK[b.priority] : b[key];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return a.reference < b.reference ? -1 : 1;
    });

    const total = rows.length;
    const start = (filter.page - 1) * filter.pageSize;
    rows = rows.slice(start, start + filter.pageSize);
    return { items: rows.map((r) => structuredClone(r)), total, page: filter.page, pageSize: filter.pageSize };
  }

  async listAll(tx: Transaction = this.store.read()) {
    return [...tablesOf(tx).requests.values()].map((r) => structuredClone(r));
  }

  async addHistory(entry: StatusHistoryEntry, tx: Transaction) {
    tablesOf(tx).statusHistory.push(structuredClone(entry));
  }

  async historyFor(requestId: string, tx: Transaction = this.store.read()) {
    return tablesOf(tx).statusHistory
      .filter((h) => h.requestId === requestId)
      .map((h) => structuredClone(h))
      .sort((a, b) => a.changedAt.localeCompare(b.changedAt));
  }

  async addComment(comment: Comment, tx: Transaction) {
    tablesOf(tx).comments.push(structuredClone(comment));
  }

  async commentsFor(requestId: string, tx: Transaction = this.store.read()) {
    return tablesOf(tx).comments
      .filter((c) => c.requestId === requestId)
      .map((c) => structuredClone(c))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
