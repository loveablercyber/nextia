import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { Client } from 'pg';

const port = Number(process.env.PORT || 3000);
const distDir = join(process.cwd(), 'dist');
const sessionSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'nextia-local-dev-secret';
let supportSchemaPromise;

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
  try {
    if (!token || !token.includes('.')) return null;
    const [encodedPayload, signature] = token.split('.');
    const expected = createHmac('sha256', sessionSecret).update(encodedPayload).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
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

function requestToken(req) {
  const cookieToken = parseCookies(req).nextia_session_token;
  const authorization = String(req.headers.authorization || '');
  const bearerToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return cookieToken || bearerToken;
}

async function getSessionProfile(req, client) {
  const payload = verifyToken(requestToken(req));
  if (!payload?.sub) return null;
  const result = await client.query(
    `SELECT id, email, name, role
     FROM public.profiles
     WHERE id = $1`,
    [payload.sub],
  );
  return result.rows[0] || null;
}

async function ensureSupportSchema(client) {
  if (!supportSchemaPromise) {
    supportSchemaPromise = (async () => {
      const schema = await readFile(join(process.cwd(), 'database', 'local-support.sql'), 'utf8');
      await client.query(schema);
    })();
  }

  try {
    await supportSchemaPromise;
  } catch (error) {
    supportSchemaPromise = undefined;
    throw error;
  }
}

function secureTextEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length > 0
    && leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function appBaseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = forwardedHost || req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
}

async function sendSupportTicketEmail({ email, message, name, subject, trackingLink, ticketId }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Nextia Suporte <suporte@nextia.dev.br>',
      to: [email],
      subject: `Suporte Nextia: Chamado criado (#${ticketId.slice(0, 8)})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5B4FE9;">Ola, ${escapeHtml(name)}!</h2>
          <p>Recebemos sua solicitacao de suporte.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Mensagem:</strong> ${escapeHtml(message)}</p>
          </div>
          <p><a href="${escapeHtml(trackingLink)}">Acompanhar chamado</a></p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error(`Resend returned HTTP ${response.status} while creating support ticket`);
  }
}

const supportApiMethods = new Map([
  ['/api/support/create-ticket', 'POST'],
  ['/api/support/list-tickets', 'GET'],
  ['/api/support/get-ticket', 'GET'],
  ['/api/support/reply-ticket', 'POST'],
  ['/api/admin/list-support-tickets', 'GET'],
  ['/api/admin/update-ticket-status', 'POST'],
]);

async function handleSupportApi(req, res, url) {
  const expectedMethod = supportApiMethods.get(url.pathname);
  if (!expectedMethod) return json(res, 404, { error: 'API route not found' });
  if (req.method !== expectedMethod) return json(res, 405, { error: 'Method not allowed' });

  const client = dbClient();
  await client.connect();
  try {
    await ensureSupportSchema(client);

    if (url.pathname === '/api/support/create-ticket') {
      const body = await readJson(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const phone = String(body.phone || '').trim();
      const company = String(body.company || '').trim();
      const subject = String(body.subject || '').trim();
      const message = String(body.message || '').trim();

      if (!name || !email || !subject || !message) {
        return json(res, 400, { error: 'Preencha nome, e-mail, assunto e mensagem.' });
      }
      if (name.length > 200 || email.length > 320 || subject.length > 300 || message.length > 10000) {
        return json(res, 400, { error: 'Um ou mais campos excedem o tamanho permitido.' });
      }

      const sessionProfile = await getSessionProfile(req, client);
      const ticketId = randomUUID();
      const messageId = randomUUID();
      const guestToken = randomBytes(32).toString('hex');

      await client.query('BEGIN');
      try {
        await client.query(
          `INSERT INTO public.support_tickets
             (id, name, email, phone, company, subject, message, user_id, guest_token)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            ticketId,
            name,
            email,
            phone || null,
            company || null,
            subject,
            message,
            sessionProfile?.id || null,
            guestToken,
          ],
        );
        await client.query(
          `INSERT INTO public.ticket_messages
             (id, ticket_id, sender_role, message, sender_name)
           VALUES ($1, $2, 'client', $3, $4)`,
          [messageId, ticketId, message, name],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }

      const trackingLink = `${appBaseUrl(req)}/suporte/ticket/${ticketId}?token=${guestToken}`;
      try {
        await sendSupportTicketEmail({ email, message, name, subject, trackingLink, ticketId });
      } catch (emailError) {
        console.error('Failed to send support ticket email:', emailError);
      }

      return json(res, 200, { status: 'success', ticketId, guestToken, trackingLink });
    }

    if (url.pathname === '/api/support/list-tickets') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuario nao autenticado.' });

      await client.query('BEGIN');
      try {
        await client.query(
          `UPDATE public.support_tickets
           SET user_id = $1
           WHERE user_id IS NULL AND LOWER(email) = LOWER($2)`,
          [sessionProfile.id, sessionProfile.email],
        );
        const result = await client.query(
          `SELECT id, subject, status, created_at, resolved_at
           FROM public.support_tickets
           WHERE user_id = $1
           ORDER BY created_at DESC`,
          [sessionProfile.id],
        );
        await client.query('COMMIT');
        return json(res, 200, { tickets: result.rows });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    if (url.pathname === '/api/admin/list-support-tickets') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuario nao autenticado.' });
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

      const result = await client.query(
        `SELECT id, name, email, phone, company, subject, message, status,
                created_at, resolved_at, user_id
         FROM public.support_tickets
         ORDER BY created_at DESC`,
      );
      return json(res, 200, { tickets: result.rows });
    }

    if (url.pathname === '/api/admin/update-ticket-status') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuario nao autenticado.' });
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

      const body = await readJson(req);
      const validStatuses = new Set(['aberto', 'respondido', 'fechado']);
      if (!body.ticketId || !validStatuses.has(body.status)) {
        return json(res, 400, { error: 'Chamado ou status invalido.' });
      }
      const result = await client.query(
        `UPDATE public.support_tickets
         SET status = $1,
             resolved_at = CASE WHEN $1 = 'fechado' THEN NOW() ELSE NULL END
         WHERE id = $2
         RETURNING id, status, resolved_at`,
        [body.status, body.ticketId],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Chamado nao encontrado.' });
      return json(res, 200, { status: 'success', ticket: result.rows[0] });
    }

    if (url.pathname === '/api/support/get-ticket') {
      const ticketId = url.searchParams.get('id');
      const guestToken = url.searchParams.get('token');
      if (!ticketId) return json(res, 400, { error: 'Informe o chamado.' });

      const ticketResult = await client.query(
        `SELECT id, name, email, phone, company, subject, message, status,
                created_at, resolved_at, user_id, guest_token
         FROM public.support_tickets
         WHERE id = $1`,
        [ticketId],
      );
      const ticket = ticketResult.rows[0];
      if (!ticket) return json(res, 404, { error: 'Chamado nao encontrado.' });

      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile && !ticket.user_id && sessionProfile.email.toLowerCase() === ticket.email.toLowerCase()) {
        await client.query('UPDATE public.support_tickets SET user_id = $1 WHERE id = $2', [sessionProfile.id, ticket.id]);
        ticket.user_id = sessionProfile.id;
      }
      const guestAuthorized = guestToken && secureTextEqual(guestToken, ticket.guest_token);
      const sessionAuthorized = sessionProfile
        && (sessionProfile.role === 'admin' || sessionProfile.id === ticket.user_id);
      if (!guestAuthorized && !sessionAuthorized) {
        return json(res, 403, { error: 'Acesso negado a este chamado.' });
      }

      const messagesResult = await client.query(
        `SELECT id, sender_role, message, created_at, sender_name
         FROM public.ticket_messages
         WHERE ticket_id = $1
         ORDER BY created_at ASC`,
        [ticket.id],
      );
      const clientTicket = { ...ticket };
      delete clientTicket.guest_token;
      return json(res, 200, { ticket: clientTicket, messages: messagesResult.rows });
    }

    if (url.pathname === '/api/support/reply-ticket') {
      const body = await readJson(req);
      const ticketId = String(body.ticketId || '');
      const message = String(body.message || '').trim();
      if (!ticketId || !message) return json(res, 400, { error: 'Informe o chamado e a mensagem.' });
      if (message.length > 10000) return json(res, 400, { error: 'Mensagem muito longa.' });

      const ticketResult = await client.query(
        `SELECT id, user_id, guest_token, name, email, status
         FROM public.support_tickets
         WHERE id = $1`,
        [ticketId],
      );
      const ticket = ticketResult.rows[0];
      if (!ticket) return json(res, 404, { error: 'Chamado nao encontrado.' });
      if (ticket.status === 'fechado') return json(res, 409, { error: 'Este chamado esta fechado.' });

      const sessionProfile = await getSessionProfile(req, client);
      const guestAuthorized = body.token && secureTextEqual(body.token, ticket.guest_token);
      let senderRole = 'client';
      let senderName = ticket.name;
      let linkUserId = null;

      if (!guestAuthorized && sessionProfile?.role === 'admin') {
        senderRole = 'admin';
        senderName = sessionProfile.name || sessionProfile.email;
      } else if (!guestAuthorized && sessionProfile
        && (sessionProfile.id === ticket.user_id
          || (!ticket.user_id && sessionProfile.email.toLowerCase() === ticket.email.toLowerCase()))) {
        senderName = sessionProfile.name || ticket.name;
        linkUserId = ticket.user_id ? null : sessionProfile.id;
      } else if (!guestAuthorized) {
        return json(res, 403, { error: 'Acesso negado a este chamado.' });
      }

      const newStatus = senderRole === 'admin' ? 'respondido' : 'aberto';
      await client.query('BEGIN');
      try {
        if (linkUserId) {
          await client.query('UPDATE public.support_tickets SET user_id = $1 WHERE id = $2', [linkUserId, ticket.id]);
        }
        const messageResult = await client.query(
          `INSERT INTO public.ticket_messages
             (id, ticket_id, sender_role, message, sender_name)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, sender_role, message, created_at, sender_name`,
          [randomUUID(), ticket.id, senderRole, message, senderName],
        );
        await client.query(
          `UPDATE public.support_tickets
           SET status = $1, resolved_at = NULL
           WHERE id = $2`,
          [newStatus, ticket.id],
        );
        await client.query('COMMIT');
        return json(res, 200, { status: 'success', message: messageResult.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    return json(res, 404, { error: 'API route not found' });
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
      let validPassword = false;
      if (row?.password_hash?.startsWith('pbkdf2_sha256$')) {
        validPassword = verifyPassword(password, row.password_hash);
      } else if (row?.password_hash) {
        const cryptCheck = await client.query('SELECT $1 = crypt($2, $1) AS ok', [row.password_hash, password]);
        validPassword = cryptCheck.rows[0]?.ok === true;
      }

      if (!row || !validPassword) {
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
    if (url.pathname.startsWith('/api/support/') || url.pathname.startsWith('/api/admin/')) {
      return await handleSupportApi(req, res, url);
    }
    if (url.pathname.startsWith('/api/')) {
      return json(res, 404, { error: 'API route not found' });
    }
    return await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Internal server error' });
  }
}).listen(port, () => {
  console.log(`Nextia server listening on port ${port}`);
});
