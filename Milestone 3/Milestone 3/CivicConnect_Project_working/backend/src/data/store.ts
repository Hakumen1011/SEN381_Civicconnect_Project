import type { User } from '../modules/users/user.types.js';
import type { Comment, ServiceRequest, StatusHistoryEntry } from '../modules/requests/request.types.js';
import type { Notification } from '../modules/notifications/notification.types.js';
import type { Transaction, TransactionManager } from '../shared/transaction.js';

/**
 * TEMPORARY in-memory data store.
 *
 * The database is owned by another team member, so for now all data lives in memory and is lost
 * when the server restarts. Every module talks to the data only through its repository interface,
 * so the PostgreSQL version can replace these in-memory repositories without changing services,
 * routes or tests (Engineering Decision Log, Decision 7).
 */
export interface Tables {
  users: Map<string, User>;
  requests: Map<string, ServiceRequest>;
  statusHistory: StatusHistoryEntry[];
  comments: Comment[];
  notifications: Map<string, Notification>;
  counters: { requestReference: number };
}

/** The in-memory version of a transaction: it gives the in-memory repositories the tables. */
export interface InMemoryTransaction extends Transaction {
  readonly kind: 'memory';
  readonly tables: Tables;
}

/** Used by the in-memory repositories to reach the tables inside a transaction. */
export function tablesOf(tx: Transaction): Tables {
  if (tx.kind !== 'memory') throw new Error('In-memory repository used with a non-memory transaction');
  return (tx as InMemoryTransaction).tables;
}

export class InMemoryStore implements TransactionManager {
  private tables: Tables = InMemoryStore.emptyTables();
  private queue: Promise<unknown> = Promise.resolve();

  static emptyTables(): Tables {
    return {
      users: new Map(),
      requests: new Map(),
      statusHistory: [],
      comments: [],
      notifications: new Map(),
      counters: { requestReference: 0 },
    };
  }

  /** Read-only access outside a transaction. */
  read(): InMemoryTransaction {
    return { kind: 'memory', tables: this.tables };
  }

  /**
   * Runs `work` as one all-or-nothing unit (like a database transaction):
   * if it throws, every change it made is rolled back. Transactions run one at a time,
   * which mimics the isolation a real database would provide.
   */
  transaction<T>(work: (tx: Transaction) => Promise<T> | T): Promise<T> {
    const run = async (): Promise<T> => {
      const snapshot = structuredClone(this.tables);
      try {
        const tx: InMemoryTransaction = { kind: 'memory', tables: this.tables };
        return await work(tx);
      } catch (error) {
        this.tables = snapshot;
        throw error;
      }
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** Test helper: wipe all data. */
  reset(): void {
    this.tables = InMemoryStore.emptyTables();
  }
}
