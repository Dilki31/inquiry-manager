import { badRequest } from '../errors.js';

// Parses data with a zod schema or throws a 400 with per-field messages.
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!fields[key]) fields[key] = issue.message;
    }
    throw badRequest('Validation failed', { fields });
  }
  return result.data;
}