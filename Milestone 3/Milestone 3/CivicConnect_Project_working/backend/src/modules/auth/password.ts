import bcrypt from 'bcryptjs';

/**
 * Passwords are never stored in plaintext (NFR-SEC-002): only a salted bcrypt hash is kept.
 * Cost factor 12 is a reasonable balance between security and response time.
 * Automated tests use a low cost only so the test suite runs quickly.
 */
const COST = process.env.NODE_ENV === 'test' ? 4 : 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Used when no user matches the email, so a failed login takes about the same time
 * whether or not the account exists (avoids leaking which emails are registered).
 */
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);

/** Password rules: at least 8 characters with a letter and a number. */
export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 72, // bcrypt only uses the first 72 bytes
  pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
};
