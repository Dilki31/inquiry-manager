import { z } from 'zod';

const text = (field, max) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`);

export const createInquirySchema = z.object({
  customerName: text('Customer name', 120),
  contact: text('Contact', 200).min(3, 'Contact must be at least 3 characters'),
  subject: text('Subject', 200),
  description: text('Description', 2000),
});

export const STATUSES = ['new', 'in_progress', 'resolved'];

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, { error: `Status must be one of: ${STATUSES.join(', ')}` }),
  version: z.number({ error: 'Version is required' }).int().positive(),
});

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const idSchema = z.string().uuid('Invalid inquiry id');