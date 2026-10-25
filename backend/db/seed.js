import bcrypt from 'bcrypt';
import { pool } from '../src/db.js';

const SALT_ROUNDS = 12;

// Demo accounts for local development only. Documented in the README.
const users = [
  { email: 'admin@example.test', fullName: 'Admin User', role: 'admin', password: 'Admin@12345' },
  { email: 'staff1@example.test', fullName: 'Staff One', role: 'staff', password: 'Staff@12345' },
  { email: 'staff2@example.test', fullName: 'Staff Two', role: 'staff', password: 'Staff@12345' },
];

async function seed() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    // ON CONFLICT makes the script safe to re-run.
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [u.email, passwordHash, u.fullName, u.role]
    );
  }
  console.log(`Seeded ${users.length} users.`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());