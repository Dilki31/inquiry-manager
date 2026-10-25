import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { parse } from '../validation/parse.js';
import {
  createInquirySchema,
  updateStatusSchema,
  listQuerySchema,
  idSchema,
} from '../validation/inquiries.js';
import { canTransition, allowedTransitions } from '../domain/statusRules.js';

const router = Router();
router.use(requireAuth); // every inquiry route requires a valid token

const COLUMNS = `
  i.id, i.customer_name, i.contact, i.subject, i.description, i.status,
  i.version, i.created_by, i.created_at, i.updated_at, u.full_name AS created_by_name
`;

const toDto = (r) => ({
  id: r.id,
  customerName: r.customer_name,
  contact: r.contact,
  subject: r.subject,
  description: r.description,
  status: r.status,
  version: r.version,
  createdBy: r.created_by,
  createdByName: r.created_by_name,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  allowedTransitions: allowedTransitions(r.status),
});

const isAdmin = (user) => user.role === 'admin';

// Loads one inquiry the current user is allowed to see.
// Not found and not allowed look identical on purpose (404), so ids cannot be probed.
async function findVisibleInquiry(id, user) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM inquiries i JOIN users u ON u.id = i.created_by WHERE i.id = $1`,
    [id]
  );
  const row = rows[0];
  if (!row || (!isAdmin(user) && row.created_by !== user.id)) {
    throw notFound('Inquiry not found');
  }
  return row;
}

// Create
router.post('/', async (req, res, next) => {
  try {
    const data = parse(createInquirySchema, req.body);

    // Duplicate policy: same user, same contact + subject, still open => reject.
    const dup = await query(
      `SELECT id FROM inquiries
       WHERE created_by = $1
         AND lower(contact) = lower($2)
         AND lower(subject) = lower($3)
         AND status <> 'resolved'
       LIMIT 1`,
      [req.user.id, data.contact, data.subject]
    );
    if (dup.rows.length > 0) {
      throw conflict('An open inquiry with the same contact and subject already exists', {
        existingId: dup.rows[0].id,
      });
    }

    const inserted = await query(
      `INSERT INTO inquiries (customer_name, contact, subject, description, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.customerName, data.contact, data.subject, data.description, req.user.id]
    );
    const row = await findVisibleInquiry(inserted.rows[0].id, req.user);
    res.status(201).json({ inquiry: toDto(row) });
  } catch (err) {
    next(err);
  }
});

// List (search + status filter + pagination)
router.get('/', async (req, res, next) => {
  try {
    const { status, q, page, pageSize } = parse(listQuerySchema, req.query);

    const where = [];
    const params = [];
    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (!isAdmin(req.user)) where.push(`i.created_by = ${add(req.user.id)}`);
    if (status) where.push(`i.status = ${add(status)}`);
    if (q) {
      const p = add(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
      where.push(`(i.customer_name ILIKE ${p} OR i.subject ILIKE ${p} OR i.contact ILIKE ${p})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await query(`SELECT count(*)::int AS total FROM inquiries i ${whereSql}`, params);

    const limitP = add(pageSize);
    const offsetP = add((page - 1) * pageSize);
    const { rows } = await query(
      `SELECT ${COLUMNS} FROM inquiries i JOIN users u ON u.id = i.created_by
       ${whereSql} ORDER BY i.created_at DESC LIMIT ${limitP} OFFSET ${offsetP}`,
      params
    );

    res.json({
      inquiries: rows.map(toDto),
      page,
      pageSize,
      total: countResult.rows[0].total,
    });
  } catch (err) {
    next(err);
  }
});

// Get one
router.get('/:id', async (req, res, next) => {
  try {
    const id = parse(idSchema, req.params.id);
    const row = await findVisibleInquiry(id, req.user);
    res.json({ inquiry: toDto(row) });
  } catch (err) {
    next(err);
  }
});

// Change status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const id = parse(idSchema, req.params.id);
    const { status: nextStatus, version } = parse(updateStatusSchema, req.body);

    const current = await findVisibleInquiry(id, req.user);

    if (current.version !== version) {
      throw conflict('This inquiry was changed by someone else. Refresh to see the latest.', {
        currentVersion: current.version,
        currentStatus: current.status,
      });
    }
    if (!canTransition(current.status, nextStatus)) {
      throw conflict(`Cannot change status from "${current.status}" to "${nextStatus}"`, {
        currentStatus: current.status,
        allowed: allowedTransitions(current.status),
      });
    }

    // The WHERE version = $3 makes the check atomic: if two requests race,
    // only one update matches and the other gets zero rows.
    const updated = await query(
      `UPDATE inquiries
       SET status = $1, version = version + 1, updated_at = now()
       WHERE id = $2 AND version = $3`,
      [nextStatus, id, version]
    );
    if (updated.rowCount === 0) {
      throw conflict('This inquiry was changed by someone else. Refresh to see the latest.');
    }

    const row = await findVisibleInquiry(id, req.user);
    res.json({ inquiry: toDto(row) });
  } catch (err) {
    next(err);
  }
});

export default router;