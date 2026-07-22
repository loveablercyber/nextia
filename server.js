import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { Client } from 'pg';

const port = Number(process.env.PORT || 3000);
const distDir = join(process.cwd(), 'dist');
const sessionSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'nextia-local-dev-secret';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const eq = part.indexOf('=');
        return eq === -1 ? [part, ''] : [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))];
      }),
  );
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function dbClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
}

function mapProfile(row) {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || '',
    company: row.company || '',
    phone: row.phone || '',
    avatarInitials: row.avatar_initials || 'NX',
    role: row.role === 'admin' ? 'admin' : 'client',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, 210000, 32, 'sha256').toString('hex');
  return `pbkdf2_sha256$210000$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, roundsRaw, salt, expected] = String(storedHash || '').split('$');
  if (scheme !== 'pbkdf2_sha256' || !roundsRaw || !salt || !expected) return false;
  const rounds = Number(roundsRaw);
  const actual = pbkdf2Sync(password, salt, rounds, 32, 'sha256');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

function signToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expected = createHmac('sha256', sessionSecret).update(encodedPayload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `nextia_session_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

async function getUserById(userId) {
  const client = dbClient();
  await client.connect();
  try {
    const result = await client.query(
      `SELECT p.id, p.email, p.name, p.company, p.phone, p.role, p.avatar_initials, p.created_at
       FROM public.profiles p
       WHERE p.id = $1`,
      [userId],
    );
    return result.rows[0] ? mapProfile(result.rows[0]) : null;
  } finally {
    await client.end();
  }
}

async function handleAuth(req, res, pathname) {
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const token = parseCookies(req).nextia_session_token || req.headers.authorization?.replace('Bearer ', '');
    const payload = verifyToken(token);
    if (!payload) return json(res, 200, { user: null });
    const user = await getUserById(payload.sub);
    return json(res, 200, { user });
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'nextia_session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'Cache-Control': 'no-store',
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = await readJson(req);
    const client = dbClient();
    await client.connect();
    try {
      const result = await client.query(
        `SELECT p.id, p.email, p.name, p.company, p.phone, p.role, p.avatar_initials, p.created_at, a.password_hash
         FROM public.local_auth_users a
         JOIN public.profiles p ON p.id = a.id
         WHERE lower(p.email) = lower($1)`,
        [email],
      );
      const row = result.rows[0];
      if (!row || !verifyPassword(password, row.password_hash)) {
        return json(res, 401, { error: 'E-mail ou senha incorretos.' });
      }
      const user = mapProfile(row);
      const token = signToken({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': sessionCookie(token),
        'Cache-Control': 'no-store',
      });
      return res.end(JSON.stringify({ user }));
    } finally {
      await client.end();
    }
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await readJson(req);
    const id = randomUUID();
    const initials = String(body.name || 'NX')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NX';
    const client = dbClient();
    await client.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO public.profiles (id, email, name, company, phone, role, avatar_initials)
         VALUES ($1, lower($2), $3, $4, $5, 'client', $6)`,
        [id, body.email, body.name, body.company || '', body.phone || '', initials],
      );
      await client.query(
        `INSERT INTO public.local_auth_users (id, password_hash) VALUES ($1, $2)`,
        [id, hashPassword(body.password)],
      );
      await client.query('COMMIT');
      return json(res, 200, { ok: true });
    } catch (err) {
      await client.query('ROLLBACK');
      if (String(err.message || '').includes('duplicate')) {
        return json(res, 409, { error: 'Este e-mail já está cadastrado.' });
      }
      throw err;
    } finally {
      await client.end();
    }
  }

  return json(res, 404, { error: 'Not found' });
}

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === '/') requestedPath = '/index.html';
  const normalized = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(distDir, normalized);
  if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/auth/')) {
      return await handleAuth(req, res, url.pathname);
    }
    return await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Internal server error' });
  }
}).listen(port, () => {
  console.log(`Nextia server listening on port ${port}`);
});
