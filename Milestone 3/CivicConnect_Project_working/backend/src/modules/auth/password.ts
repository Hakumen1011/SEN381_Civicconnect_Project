import bcrypt from 'bcryptjs';


const COST = process.env.NODE_ENV === 'test' ? 4 : 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}


export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);


export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 72, // bcrypt only uses the first 72 bytes
  pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
};
