import type { User } from '../modules/users/user.types.js';
import type { Comment, ServiceRequest, StatusHistoryEntry } from '../modules/requests/request.types.js';
import type { Notification } from '../modules/notifications/notification.types.js';
import type { Transaction, TransactionManager } from '../shared/transaction.js';


export interface Tables {
  users: Map<string, User>;
  requests: Map<string, ServiceRequest>;
  statusHistory: StatusHistoryEntry[];
  comments: Comment[];
  notifications: Map<string, Notification>;
  counters: { requestReference: number };
}


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

 
  read(): InMemoryTransaction {
    return { kind: 'memory', tables: this.tables };
  }

  
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
