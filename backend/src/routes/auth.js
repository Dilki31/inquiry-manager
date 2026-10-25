import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db.js';
import { config } from '../config.js';
import { badRequest, unauthorized } from '../errors.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// A real bcrypt hash of a throwaway value. Used so a login for an unknown email
// takes about as long as one for a known email (avoids revealing which emails exist).
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5bIVKD7yOe4GoqhGBXSQ0T8ZsLQ6Hmi';

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest('Email and password are required');
    }
    const { email, password } = parsed.data;

    const { rows } = await query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    const hash = user ? user.password_hash : DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hash);

    if (!user || !passwordOk) {
      // Same message for both cases on purpose.
      throw unauthorized('Invalid email or password');
    }

    const token = jwt.sign({ role: user.role }, config.jwtSecret, {
      subject: user.id,
      expiresIn: config.jwtExpiresIn,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;