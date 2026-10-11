export const ROLES = ['REQUESTER', 'STAFF', 'MANAGER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

/** Explicit opt-in for SMS / WhatsApp, with the date and time it was given (FR-NOT-002). */
export interface ChannelOptIn {
  optedInAt: string;
}

export interface NotificationPreferences {
  sms: ChannelOptIn | null;
  whatsapp: ChannelOptIn | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone: string | null;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

/** The shape of a user that is safe to send to the front end (never includes the password hash). */
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _omit, ...safe } = user;
  return safe;
}

/** Roles that work requests on behalf of the organisation. */
export const STAFF_ROLES: readonly Role[] = ['STAFF', 'MANAGER', 'ADMIN'];
export const isStaffRole = (role: Role) => STAFF_ROLES.includes(role);
