import type { z } from 'zod';
import { badRequest } from '../errors.js';

export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || '(body)',
      message: issue.message,
    }));
    throw badRequest('Some of the submitted information is missing or invalid', fields);
  }
  return result.data;
}
