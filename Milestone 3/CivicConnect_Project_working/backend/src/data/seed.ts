import type { AuthService } from '../../modules/auth/auth.service.js';
import type { Role } from '../../modules/users/user.types.js';


export const DEMO_USERS: { name: string; email: string; role: Role; phone?: string }[] = [
  { name: 'Demo Requester', email: 'requester@civicconnect.local', role: 'REQUESTER', phone: '+27820000000' },
  { name: 'Demo Staff', email: 'staff@civicconnect.local', role: 'STAFF' },
  { name: 'Demo Manager', email: 'manager@civicconnect.local', role: 'MANAGER' },
  { name: 'Demo Admin', email: 'admin@civicconnect.local', role: 'ADMIN' },
];

export async function seedDemoUsers(auth: AuthService, password: string): Promise<void> {
  for (const user of DEMO_USERS) {
    await auth.createUser({ ...user, password });
  }
}
