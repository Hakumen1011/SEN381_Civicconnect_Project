import jwt, { type SignOptions } from 'jsonwebtoken';
import { ROLES, type Role } from '../users/user.types.js';

export interface AuthContext {
  userId: string;
  role: Role;
}


export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(ctx: AuthContext): string {
    return jwt.sign({ role: ctx.role }, this.secret, {
      subject: ctx.userId,
      algorithm: 'HS256',
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    });
  }

 
  verify(token: string): AuthContext | undefined {
    try {
      const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      if (typeof payload === 'string' || !payload.sub) return undefined;
      const role = (payload as { role?: unknown }).role;
      if (typeof role !== 'string' || !(ROLES as readonly string[]).includes(role)) return undefined;
      return { userId: payload.sub, role: role as Role };
    } catch {
      return undefined;
    }
  }
}
