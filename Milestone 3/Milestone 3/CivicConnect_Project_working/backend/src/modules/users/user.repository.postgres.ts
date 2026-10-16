import { dbOf, iso, isoOrNull, type PostgresStore } from '../../db/postgres.js';
import type { Transaction } from '../../shared/transaction.js';
import type { UserRepository } from './user.repository.js';
import type { Role, User } from './user.types.js';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  sms_opted_in_at: Date | null;
  whatsapp_opted_in_at: Date | null;
  created_at: Date;
}

const COLUMNS =
  'id, name, email, password_hash, role, phone, sms_opted_in_at, whatsapp_opted_in_at, created_at';

/** Converts a database row (snake_case columns) into the User object the services use. */
function toUser(row: UserRow): User {
  const sms = isoOrNull(row.sms_opted_in_at);
  const whatsapp = isoOrNull(row.whatsapp_opted_in_at);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    phone: row.phone,
    notificationPreferences: {
      sms: sms ? { optedInAt: sms } : null,
      whatsapp: whatsapp ? { optedInAt: whatsapp } : null,
    },
    createdAt: iso(row.created_at),
  };
}

/** The values for the parameters $2..$9 used by insert and update. */
const params = (u: User) => [
  u.name,
  u.email,
  u.passwordHash,
  u.role,
  u.phone,
  u.notificationPreferences.sms?.optedInAt ?? null,
  u.notificationPreferences.whatsapp?.optedInAt ?? null,
  u.createdAt,
];

/** PostgreSQL implementation of UserRepository (same interface as the in-memory version). */
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly store: PostgresStore) {}

  async findById(id: string, tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<UserRow>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ? toUser(rows[0]) : undefined;
  }

  async findByEmail(email: string, tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<UserRow>(`SELECT ${COLUMNS} FROM users WHERE email = $1`, [
      email.trim().toLowerCase(),
    ]);
    return rows[0] ? toUser(rows[0]) : undefined;
  }

  async list(tx: Transaction = this.store.read()) {
    const { rows } = await dbOf(tx).query<UserRow>(`SELECT ${COLUMNS} FROM users ORDER BY name, email`);
    return rows.map(toUser);
  }

  async insert(user: User, tx: Transaction) {
    await dbOf(tx).query(
      `INSERT INTO users (id, name, email, password_hash, role, phone, sms_opted_in_at, whatsapp_opted_in_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [user.id, ...params(user)],
    );
  }

  async update(user: User, tx: Transaction) {
    await dbOf(tx).query(
      `UPDATE users
          SET name = $2, email = $3, password_hash = $4, role = $5, phone = $6,
              sms_opted_in_at = $7, whatsapp_opted_in_at = $8, created_at = $9
        WHERE id = $1`,
      [user.id, ...params(user)],
    );
  }
}
