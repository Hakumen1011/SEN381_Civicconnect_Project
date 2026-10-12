import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { InMemoryStore } from '../../data/store.js';
import { conflict, unauthorized } from '../../shared/errors.js';
import { parseOrThrow } from '../../shared/http/validate.js';
import type { UserRepository } from '../users/user.repository.js';
import { phoneSchema } from '../users/user.service.js';
import { ROLES, toPublicUser, type PublicUser, type Role, type User } from '../users/user.types.js';
import { DUMMY_HASH, PASSWORD_RULES, hashPassword, verifyPassword } from './password.js';
import type { TokenService } from './token.js';

const passwordSchema = z
  .string()
  .min(PASSWORD_RULES.minLength, `Password must be at least ${PASSWORD_RULES.minLength} characters`)
  .max(PASSWORD_RULES.maxLength, `Password must be at most ${PASSWORD_RULES.maxLength} characters`)
  .regex(PASSWORD_RULES.pattern, 'Password must contain at least one letter and one number');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.email('A valid email address is required').max(254).transform((e) => e.toLowerCase()),
  password: passwordSchema,
  phone: phoneSchema.optional(),
});

const createUserSchema = registerSchema.extend({
  role: z.enum(ROLES),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').max(254),
  password: z.string().min(1, 'Password is required').max(200),
});

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  /** Public self-registration always creates a REQUESTER account. */
  async registerRequester(input: unknown): Promise<LoginResult> {
    const body = parseOrThrow(registerSchema, input);
    const user = await this.createUser({ ...body, role: 'REQUESTER' });
    return { token: this.tokens.sign({ userId: user.id, role: user.role }), user };
  }

  /** Administrators create staff, manager and admin accounts. */
  async createUserAsAdmin(input: unknown): Promise<PublicUser> {
    const body = parseOrThrow(createUserSchema, input);
    return this.createUser(body);
  }

  async login(input: unknown): Promise<LoginResult> {
    const body = parseOrThrow(loginSchema, input);
    const user = await this.users.findByEmail(body.email);
    // Always run a hash comparison so response time does not reveal whether the email exists.
    const valid = await verifyPassword(body.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw unauthorized('Incorrect email or password');
    return { token: this.tokens.sign({ userId: user.id, role: user.role }), user: toPublicUser(user) };
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
  }): Promise<PublicUser> {
    const passwordHash = await hashPassword(data.password);
    return this.store.transaction(async (tx) => {
      if (await this.users.findByEmail(data.email, tx)) {
        throw conflict('An account with this email address already exists');
      }
      const user: User = {
        id: randomUUID(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash,
        role: data.role,
        phone: data.phone ?? null,
        notificationPreferences: { sms: null, whatsapp: null },
        createdAt: new Date().toISOString(),
      };
      await this.users.insert(user, tx);
      return toPublicUser(user);
    });
  }
}
