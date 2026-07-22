import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { Client } from 'pg';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

if (password.length < 10) {
  throw new Error('ADMIN_PASSWORD must have at least 10 characters.');
}

function hashPassword(rawPassword) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(rawPassword, salt, 210000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$210000$${salt}$${hash}`;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query('BEGIN');
  const profile = await client.query(
    `INSERT INTO public.profiles (id, email, name, company, phone, role, avatar_initials)
     VALUES (gen_random_uuid(), lower($1), 'Admin Nextia', 'Nextia', '(14) 99640-5496', 'admin', 'AN')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'
     RETURNING id, email, role`,
    [email],
  );

  await client.query(
    `INSERT INTO public.local_auth_users (id, password_hash, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (id) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         updated_at = NOW()`,
    [profile.rows[0].id, hashPassword(password)],
  );

  await client.query('COMMIT');
  console.log(`Local admin ready: ${profile.rows[0].email} (${profile.rows[0].role})`);
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}
