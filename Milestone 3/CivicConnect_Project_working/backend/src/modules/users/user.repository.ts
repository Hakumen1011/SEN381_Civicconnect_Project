import type { InMemoryStore, Transaction } from '../../src/data/store.js';
import type { User } from './user.types.js';


export interface UserRepository {
  findById(id: string, tx?: Transaction): Promise<User | undefined>;
  findByEmail(email: string, tx?: Transaction): Promise<User | undefined>;
  list(tx?: Transaction): Promise<User[]>;
  insert(user: User, tx: Transaction): Promise<void>;
  update(user: User, tx: Transaction): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly store: InMemoryStore) {}

  async findById(id: string, tx = this.store.read()) {
    const user = tx.tables.users.get(id);
    return user ? structuredClone(user) : undefined;
  }

  async findByEmail(email: string, tx = this.store.read()) {
    const target = email.trim().toLowerCase();
    for (const user of tx.tables.users.values()) {
      if (user.email === target) return structuredClone(user);
    }
    return undefined;
  }

  async list(tx = this.store.read()) {
    return [...tx.tables.users.values()].map((u) => structuredClone(u));
  }

  async insert(user: User, tx: Transaction) {
    tx.tables.users.set(user.id, structuredClone(user));
  }

  async update(user: User, tx: Transaction) {
    tx.tables.users.set(user.id, structuredClone(user));
  }
}
