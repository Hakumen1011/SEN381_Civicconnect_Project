import { tablesOf, type InMemoryStore } from '../../data/store.js';
import type { Transaction } from '../../shared/transaction.js';
import type { User } from './user.types.js';

/** Data access for users. The PostgreSQL version must implement this same interface. */
export interface UserRepository {
  findById(id: string, tx?: Transaction): Promise<User | undefined>;
  findByEmail(email: string, tx?: Transaction): Promise<User | undefined>;
  list(tx?: Transaction): Promise<User[]>;
  insert(user: User, tx: Transaction): Promise<void>;
  update(user: User, tx: Transaction): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly store: InMemoryStore) {}

  async findById(id: string, tx: Transaction = this.store.read()) {
    const user = tablesOf(tx).users.get(id);
    return user ? structuredClone(user) : undefined;
  }

  async findByEmail(email: string, tx: Transaction = this.store.read()) {
    const target = email.trim().toLowerCase();
    for (const user of tablesOf(tx).users.values()) {
      if (user.email === target) return structuredClone(user);
    }
    return undefined;
  }

  async list(tx: Transaction = this.store.read()) {
    return [...tablesOf(tx).users.values()].map((u) => structuredClone(u));
  }

  async insert(user: User, tx: Transaction) {
    tablesOf(tx).users.set(user.id, structuredClone(user));
  }

  async update(user: User, tx: Transaction) {
    tablesOf(tx).users.set(user.id, structuredClone(user));
  }
}
