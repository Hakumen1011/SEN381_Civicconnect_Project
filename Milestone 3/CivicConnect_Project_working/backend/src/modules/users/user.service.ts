import { z } from 'zod';
import type { InMemoryStore } from '../../src/data/store.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { parseOrThrow } from '../../shared/http/validate.js';
import type { UserRepository } from './user.repository.js';
import { toPublicUser, type PublicUser } from './user.types.js';


export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone number must be in international format, e.g. +27821234567');

export const notificationPreferencesSchema = z.object({
  phone: phoneSchema.nullable().optional(),
  sms: z.boolean(),
  whatsapp: z.boolean(),
});

export class UserService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly users: UserRepository,
  ) {}

  async getById(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw notFound('User not found');
    return toPublicUser(user);
  }

  async listStaff(): Promise<PublicUser[]> {
    const all = await this.users.list();
    return all.filter((u) => u.role !== 'REQUESTER').map(toPublicUser);
  }

  
  async updateNotificationPreferences(userId: string, input: unknown): Promise<PublicUser> {
    const body = parseOrThrow(notificationPreferencesSchema, input);
    return this.store.transaction(async (tx) => {
      const user = await this.users.findById(userId, tx);
      if (!user) throw notFound('User not found');

      const phone = body.phone === undefined ? user.phone : body.phone;
      if ((body.sms || body.whatsapp) && !phone) {
        throw badRequest('A phone number is required to receive SMS or WhatsApp notifications');
      }
      const now = new Date().toISOString();
      user.phone = phone ?? null;
      user.notificationPreferences = {
        sms: body.sms ? (user.notificationPreferences.sms ?? { optedInAt: now }) : null,
        whatsapp: body.whatsapp ? (user.notificationPreferences.whatsapp ?? { optedInAt: now }) : null,
      };
      await this.users.update(user, tx);
      return toPublicUser(user);
    });
  }
}
