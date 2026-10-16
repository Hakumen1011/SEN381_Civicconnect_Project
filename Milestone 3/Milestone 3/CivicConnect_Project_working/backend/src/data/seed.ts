import type { AuthService } from '../modules/auth/auth.service.js';
import { AppError } from '../shared/errors.js';
import type { Role } from '../modules/users/user.types.js';

/**
 * Development only: creates one demo account per role so the front end can be tried straight away.
 * Never runs in production (see config/env.ts). The password comes from DEMO_PASSWORD.
 */
export const DEMO_USERS: { name: string; email: string; role: Role; phone?: string }[] = [
  { name: 'Demo Requester', email: 'requester@civicconnect.local', role: 'REQUESTER', phone: '+27820000000' },
  { name: 'Demo Staff', email: 'staff@civicconnect.local', role: 'STAFF' },
  { name: 'Demo Manager', email: 'manager@civicconnect.local', role: 'MANAGER' },
  { name: 'Demo Admin', email: 'admin@civicconnect.local', role: 'ADMIN' },
];

/**
 * Creates the demo accounts that do not exist yet. With a real database they survive restarts,
 * so accounts that already exist are left alone. Returns the emails that were created.
 */
export async function seedDemoUsers(auth: AuthService, password: string): Promise<string[]> {
  const created: string[] = [];
  for (const user of DEMO_USERS) {
    try {
      await auth.createUser({ ...user, password });
      created.push(user.email);
    } catch (error) {
      if (error instanceof AppError && error.status === 409) continue; // already exists
      throw error;
    }
  }
  return created;
}
