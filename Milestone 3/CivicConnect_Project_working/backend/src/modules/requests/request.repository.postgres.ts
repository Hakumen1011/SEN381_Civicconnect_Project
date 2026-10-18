import { dbOf, iso, type PostgresStore } from '../../db/postgres.js';
import type { Transaction } from '../../shared/transaction.js';
import type { Page, RequestFilter, RequestRepository } from './request.repository.js';
import type {
  Category,
  Comment,
  Priority,
  RequestStatus,
  ServiceRequest,
  StatusHistoryEntry,
} from './request.types.js';
import { DONE_STATUSES } from './serviceLevels.js';

interface RequestRow {
  id: string;
  reference: string;
  requester_id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  priority: Priority;
  status: RequestStatus;
  assignee_id: string | null;
  resolution: string | null;
  due_at: Date;
  created_at: Date;
  updated_at: Date;
  version: number;
}

const COLUMNS = `id, reference, requester_id, title, description, category, location, priority, status,
  assignee_id, resolution, due_at, created_at, updated_at, version`;

function toRequest(r: RequestRow): ServiceRequest {
  return {
    id: r.id,
    reference: r.reference,
    requesterId: r.requester_id,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    priority: r.priority,
    status: r.status,
    assigneeId: r.assignee_id,
    resolution: r.resolution,
    dueAt: iso(r.due_at),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    version: r.version,
  };
}

/** Column used for each sort option. Fixed list, so user input never ends up inside the SQL text. */
const SORT_SQL: Record<RequestFilter['sortBy'], string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  status: 'status',
  priority: "CASE priority WHEN 'LOW' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'HIGH' THEN 3 END",
};

/** Escapes % and _ so a search for "50%" looks for that text instead of acting as a wildcard. */
const likePattern = (term: string) => `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/** PostgreSQL implementation of RequestRepository (same interface as the in-memory version). */
export class PostgresRequestRepository implements RequestRepository {
  constructor(private readonly store: PostgresStore) {}

  async nextReference(tx: Transaction) {
    const { rows } = await dbOf(tx).query<{ reference: string }>(
      `SELECT 'CC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('request_reference_seq')::text, 6, '0') AS reference`,
    );
    return rows[0]!.reference;
  }

  async insert(r: ServiceRequest, tx: Transaction) {
    await dbOf(tx).query(
      `INSERT INTO service_requests (${COLUMNS})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        r.id, r.reference, r.requesterId, r.title, r.description, r.category, r.location, r.priority,
        r.status, r.assigneeId, r.resolution, r.dueAt, r.createdAt, r.updatedAt, r.version,
      ],
    );
  }

  async update(r: ServiceRequest, tx: Transaction) {
    await dbOf(tx).query(
      `UPDATE service_requests
          SET title = $2, description = $3, category = $4, location = $5, priority = $6, status = $7,
              assignee_id = $8, resolution = $9, due_at = $10, updated_at = $11, version = $12
        WHERE id = $1`,
      [
        r.id, r.title, r.description, r.category, r.location, r.priority, r.status,
        r.assigneeId, r.resolution, r.dueAt, r.updatedAt, r.version,
      ],
    );
  }

  
  async findById(id: string, tx?: Transaction) {
    const lock = tx ? ' FOR UPDATE' : '';
    const { rows } = await dbOf(tx ?? this.store.read()).query<RequestRow>(
      `SELECT ${COLUMNS} FROM service_requests WHERE id = $1${lock}`,
      [id],
    );
    return rows[0] ? toRequest(rows[0]) : undefined;
  }

  async search(filter: RequestFilter, tx: Transaction = this.store.read()): Promise<Page<ServiceRequest>> {
    const where: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      values.push(value);
      where.push(sql.replace('?', `$${values.length}`));
    };

    if (filter.requesterId) add('requester_id = ?', filter.requesterId);
    if (filter.assigneeId === null) where.push('assignee_id IS NULL');
    else if (filter.assigneeId !== undefined) add('assignee_id = ?', filter.assigneeId);
    if (filter.status?.length) add('status = ANY(?)', filter.status);
    if (filter.category?.length) add('category = ANY(?)', filter.category);
    if (filter.overdue !== undefined) {
      values.push(DONE_STATUSES);
      const overdueSql = `(status <> ALL($${values.length}) AND due_at < now())`;
      where.push(filter.overdue ? overdueSql : `NOT ${overdueSql}`);
    }
    const term = filter.search?.trim();
    if (term) {
      values.push(likePattern(term));
      const p = `$${values.length}`;
      where.push(`(reference ILIKE ${p} OR title ILIKE ${p} OR description ILIKE ${p})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const dir = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (filter.page - 1) * filter.pageSize;

    const db = dbOf(tx);
    const count = await db.query<{ total: string }>(`SELECT count(*) AS total FROM service_requests ${whereSql}`, values);
    const { rows } = await db.query<RequestRow>(
      `SELECT ${COLUMNS} FROM service_requests ${whereSql}
        ORDER BY ${SORT_SQL[filter.sortBy]} ${dir}, reference ASC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, filter.pageSize, offset],
    );
    return { items: rows.map(toRequest), total: Number(count.rows[0]!.total), page: filter.page, pageSize: filter.pageSize };
  }

  async listAll(tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<RequestRow>(`SELECT ${COLUMNS} FROM service_requests ORDER BY created_at`);
    return rows.map(toRequest);
  }

  async addHistory(e: StatusHistoryEntry, tx: Transaction) {
    await dbOf(tx).query(
      `INSERT INTO status_history (id, request_id, from_status, to_status, changed_by_id, note, changed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [e.id, e.requestId, e.fromStatus, e.toStatus, e.changedById, e.note, e.changedAt],
    );
  }

  async historyFor(requestId: string, tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<{
      id: string;
      request_id: string;
      from_status: RequestStatus | null;
      to_status: RequestStatus;
      changed_by_id: string;
      note: string | null;
      changed_at: Date;
    }>(
      `SELECT id, request_id, from_status, to_status, changed_by_id, note, changed_at
         FROM status_history WHERE request_id = $1 ORDER BY changed_at, seq`,
      [requestId],
    );
    return rows.map((h) => ({
      id: h.id,
      requestId: h.request_id,
      fromStatus: h.from_status,
      toStatus: h.to_status,
      changedById: h.changed_by_id,
      note: h.note,
      changedAt: iso(h.changed_at),
    }));
  }

  async addComment(c: Comment, tx: Transaction) {
    await dbOf(tx).query(
      `INSERT INTO request_comments (id, request_id, author_id, body, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [c.id, c.requestId, c.authorId, c.body, c.createdAt],
    );
  }

  async commentsFor(requestId: string, tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<{
      id: string;
      request_id: string;
      author_id: string;
      body: string;
      created_at: Date;
    }>(
      `SELECT id, request_id, author_id, body, created_at
         FROM request_comments WHERE request_id = $1 ORDER BY created_at, seq`,
      [requestId],
    );
    return rows.map((c) => ({
      id: c.id,
      requestId: c.request_id,
      authorId: c.author_id,
      body: c.body,
      createdAt: iso(c.created_at),
    }));
  }
}
