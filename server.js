import { createHash, createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, cpSync, rmSync } from 'node:fs';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { extname, join, normalize, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { gzipSync, gunzipSync } from 'node:zlib';
import { Client } from 'pg';

const port = Number(process.env.PORT || 3000);
const distDir = join(process.cwd(), 'dist');
const sessionSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'nextia-local-dev-secret';
let supportSchemaPromise;
const execFileAsync = promisify(execFile);

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

function minioConfig() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const missing = [
    ['MINIO_ENDPOINT', endpoint],
    ['MINIO_BUCKET', bucket],
    ['MINIO_ACCESS_KEY', accessKey],
    ['MINIO_SECRET_KEY', secretKey],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`MinIO não configurado. Variáveis ausentes: ${missing.join(', ')}.`);
  }

  const normalizedEndpoint = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${endpoint}`;

  return {
    endpoint: new URL(normalizedEndpoint),
    bucket,
    accessKey,
    secretKey,
    region: process.env.MINIO_REGION || 'us-east-1',
  };
}

function minioSigningKey(secretKey, dateStamp, region) {
  const dateKey = createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
  const regionKey = createHmac('sha256', dateKey).update(region).digest();
  const serviceKey = createHmac('sha256', regionKey).update('s3').digest();
  return createHmac('sha256', serviceKey).update('aws4_request').digest();
}

function minioUrl(config, objectKey = '') {
  const url = new URL(config.endpoint);
  const basePath = url.pathname.replace(/\/$/, '');
  const segments = [config.bucket, ...objectKey.split('/').filter(Boolean)]
    .map((segment) => encodeURIComponent(segment));
  url.pathname = `${basePath}/${segments.join('/')}`.replace(/\/+/g, '/');
  return url;
}

async function minioRequest(method, objectKey = '', body) {
  const config = minioConfig();
  const url = minioUrl(config, objectKey);
  const payload = body ? (Buffer.isBuffer(body) ? body : Buffer.from(body)) : Buffer.alloc(0);
  const payloadHash = createHash('sha256').update(payload).digest('hex');
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = `${method}\n${url.pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${createHash('sha256').update(canonicalRequest).digest('hex')}`;
  const signature = createHmac('sha256', minioSigningKey(config.secretKey, dateStamp, config.region))
    .update(stringToSign)
    .digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      ...(body ? { 'Content-Type': 'application/gzip', 'Content-Length': String(payload.length) } : {}),
    },
    body: body ? payload : undefined,
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1000);
    throw new Error(`MinIO respondeu HTTP ${response.status}: ${details || response.statusText}`);
  }

  return response;
}

async function validateMinioUpload() {
  const probeKey = `backups/.healthchecks/${randomUUID()}.txt`;
  const probePayload = Buffer.from(`nextia-backup-preflight:${new Date().toISOString()}`);
  try {
    await minioRequest('PUT', probeKey, probePayload);
  } finally {
    await minioRequest('DELETE', probeKey).catch(() => undefined);
  }
}

function mapProfile(row) {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || '',
    company: row.company || '',
    phone: row.phone || '',
    avatarInitials: row.avatar_initials || 'NX',
    role: row.role === 'admin' ? 'admin' : (row.is_partner ? 'partner' : 'client'),
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
      `SELECT p.id, p.email, p.name, p.company, p.phone, p.role, p.avatar_initials, p.created_at,
              EXISTS(SELECT 1 FROM public.partner_profiles WHERE user_id = p.id) as is_partner
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

async function sendPasswordResetEmail({ email, name, resetLink }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[AUTH] Link de redefinição de senha para ${email}: ${resetLink}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Nextia Suporte <suporte@nextia.dev.br>',
      to: [email],
      subject: 'Nextia — Redefinição de Senha',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5B4FE9;">Olá, ${escapeHtml(name || 'Cliente')}!</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Nextia.</p>
          <p>Clique no botão abaixo para cadastrar uma nova senha (link válido por 1 hora):</p>
          <div style="margin: 30px 0;">
            <a href="${escapeHtml(resetLink)}" style="background-color: #5B4FE9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
          </div>
          <p style="color: #666; font-size: 12px;">Se você não solicitou a alteração, por favor ignore este e-mail.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error(`Resend returned HTTP ${response.status} while sending password reset email`);
  }
}

const supportApiMethods = new Map([
  ['/api/support/create-ticket', 'POST'],
  ['/api/support/list-tickets', 'GET'],
  ['/api/support/get-ticket', 'GET'],
  ['/api/support/reply-ticket', 'POST'],
  ['/api/admin/list-support-tickets', 'GET'],
  ['/api/admin/update-ticket-status', 'POST'],
  ['/api/admin/backup/create', 'POST'],
  ['/api/admin/backup/export', 'POST'],
  ['/api/admin/backup/list', 'GET'],
  ['/api/admin/backup/download', 'GET'],
  ['/api/admin/backup/download-file', 'GET'],
  ['/api/admin/backup/restore', 'POST'],
  ['/api/admin/backup/rollback', 'POST'],
  ['/api/admin/backup/delete', 'POST'],
  ['/api/admin/backup/logs', 'GET'],
  ['/api/admin/delete-item', 'POST'],
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

    if (url.pathname === '/api/admin/delete-item') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuário não autenticado.' });
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

      const body = await readJson(req);
      const { type, id } = body;
      if (!type || !id) return json(res, 400, { error: 'Faltam parâmetros obrigatórios: type e id.' });

      await client.query('BEGIN');
      try {
        let deleteQuery = '';
        if (type === 'client') {
          deleteQuery = 'DELETE FROM public.profiles WHERE id = $1';
        } else if (type === 'project') {
          deleteQuery = 'DELETE FROM public.projects WHERE id = $1';
        } else if (type === 'quote') {
          deleteQuery = 'DELETE FROM public.quotes WHERE id = $1';
        } else if (type === 'payment') {
          deleteQuery = 'DELETE FROM public.payments WHERE id = $1';
        } else {
          await client.query('ROLLBACK');
          return json(res, 400, { error: `Tipo de item inválido: ${type}` });
        }

        const dbRes = await client.query(deleteQuery, [id]);
        await client.query('COMMIT');
        return json(res, 200, { status: 'success', message: `${type} removido com sucesso`, rowsAffected: dbRes.rowCount });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    // =========================================================
    // SISTEMA DE BACKUP EMPRESARIAL CORPORATIVO (NEXTIA 2.0)
    // =========================================================

    // Garante tabelas relacionais de backups e auditoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.backups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        object_key TEXT NOT NULL,
        size NUMERIC DEFAULT 0,
        checksum TEXT,
        error_message TEXT,
        error_details TEXT,
        backup_type TEXT DEFAULT 'full',
        status TEXT DEFAULT 'PENDING',
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS error_message TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS error_details TEXT;

      CREATE TABLE IF NOT EXISTS public.backup_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        backup_id UUID REFERENCES public.backups(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        user_id TEXT,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Helper: Registra log de auditoria corporativa
    const logAuditAction = async (backupId, action, userId, details) => {
      console.info(`[BACKUP] ${action}`, { backupId, details });
      try {
        await client.query(
          `INSERT INTO public.backup_logs (backup_id, action, user_id, details) VALUES ($1, $2, $3, $4)`,
          [backupId, action, userId || 'system', details || '']
        );
      } catch (e) {
        console.error('[BACKUP AUDIT LOG ERR]', e.message);
      }
    };

    // Helper: POSIX USTAR TAR + GZIP builder
    const buildTarGzArchive = (fileList) => {
      const blocks = [];
      for (const file of fileList) {
        const filePath = file.path.replace(/\\/g, '/').replace(/^\//, '');
        const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, 'utf-8');

        const header = Buffer.alloc(512);
        header.write(filePath.substring(0, 100), 0, 100, 'utf-8');
        header.write('0000644\0', 100, 8, 'utf-8'); // mode
        header.write('0000000\0', 108, 8, 'utf-8'); // uid
        header.write('0000000\0', 116, 8, 'utf-8'); // gid
        header.write(dataBuf.length.toString(8).padStart(11, '0') + '\0', 124, 12, 'utf-8'); // size
        header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136, 12, 'utf-8'); // mtime
        header.write('        ', 148, 8, 'utf-8'); // chksum spaces
        header.write('0', 156, 1, 'utf-8'); // typeflag
        header.write('ustar\0', 257, 6, 'utf-8');
        header.write('00', 263, 2, 'utf-8');

        let chksum = 0;
        for (let i = 0; i < 512; i++) chksum += header[i];
        header.write(chksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'utf-8');

        blocks.push(header);
        blocks.push(dataBuf);
        const padding = (512 - (dataBuf.length % 512)) % 512;
        if (padding > 0) blocks.push(Buffer.alloc(padding));
      }
      blocks.push(Buffer.alloc(1024)); // 2 zero blocks end of tar
      return gzipSync(Buffer.concat(blocks));
    };

    // Helper: Descompactador de arquivo TAR.GZ
    const extractTarGzArchive = (tarGzBuffer) => {
      const tarBuf = gunzipSync(tarGzBuffer);
      const extractedFiles = [];
      let offset = 0;
      while (offset + 512 <= tarBuf.length) {
        const header = tarBuf.subarray(offset, offset + 512);
        if (header.every(b => b === 0)) break;

        const pathStr = header.toString('utf-8', 0, 100).replace(/\0/g, '').trim();
        const sizeStr = header.toString('utf-8', 124, 136).replace(/\0/g, '').trim();
        const size = parseInt(sizeStr, 8) || 0;

        offset += 512;
        if (pathStr) {
          const fileData = tarBuf.subarray(offset, offset + size);
          extractedFiles.push({ path: pathStr, data: fileData });
        }
        offset += Math.ceil(size / 512) * 512;
      }
      return extractedFiles;
    };

    const createBackupWorkspace = () => mkdtemp(join(tmpdir(), 'nextia-backup-'));

    const validateBackupPreflight = async () => {
      const workspace = await createBackupWorkspace();
      try {
        await execFileAsync('pg_dump', ['--version']);
        const writeProbe = join(workspace, '.write-check');
        await writeFile(writeProbe, 'ok');
        await access(writeProbe);

        const archiveProbe = buildTarGzArchive([{ path: 'healthcheck.txt', data: 'nextia backup preflight' }]);
        if (archiveProbe.length === 0) throw new Error('A geração de TAR.GZ produziu um arquivo vazio.');
        const checksumProbe = createHash('sha256').update(archiveProbe).digest('hex');
        if (!/^[a-f0-9]{64}$/.test(checksumProbe)) throw new Error('Não foi possível calcular SHA256 do arquivo de teste.');

        await validateMinioUpload();
      } finally {
        await rm(workspace, { recursive: true, force: true });
      }
    };

    const generatePostgresDump = async (workspace) => {
      const dumpPath = join(workspace, 'database.sql');
      await execFileAsync('pg_dump', [
        '--no-owner',
        '--no-privileges',
        '--format=plain',
        '--file', dumpPath,
        process.env.DATABASE_URL,
      ]);
      const dump = await readFile(dumpPath);
      if (dump.length === 0) throw new Error('pg_dump gerou um arquivo SQL vazio.');
      return dump;
    };

    // Auto-Descoberta de caminhos protegidos
    const discoverPersistentFiles = () => {
      const fileList = [];
      const rootDir = process.cwd();
      const protectedDirs = ['storage', 'uploads', 'public/uploads', 'assets'];
      const protectedConfigs = ['.env', 'package.json', 'package-lock.json', 'docker-compose.yml', 'docker-compose.override.yml'];

      for (const cfg of protectedConfigs) {
        const p = join(rootDir, cfg);
        if (existsSync(p)) {
          try {
            fileList.push({ path: `config/${cfg}`, data: readFileSync(p) });
          } catch (e) {}
        }
      }

      const scanDir = (dirRelative) => {
        const fullP = join(rootDir, dirRelative);
        if (!existsSync(fullP)) return;
        const items = readdirSync(fullP);
        for (const item of items) {
          if (['node_modules', 'dist', '.cache', 'tmp', 'logs', '.git', 'coverage', 'build-cache'].includes(item)) continue;
          const subRel = `${dirRelative}/${item}`;
          const subFull = join(rootDir, subRel);
          const st = statSync(subFull);
          if (st.isDirectory()) {
            scanDir(subRel);
          } else if (st.isFile()) {
            try {
              fileList.push({ path: `files/${subRel}`, data: readFileSync(subFull) });
            } catch (e) {}
          }
        }
      };

      for (const d of protectedDirs) {
        scanDir(d);
      }
      return fileList;
    };

    // Endpoint 1: Criar backup com execução durável na requisição.
    if (url.pathname === '/api/admin/backup/create' || url.pathname === '/api/admin/backup/export') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      try {
        await validateBackupPreflight();
      } catch (error) {
        const details = error instanceof Error ? error.stack || error.message : String(error);
        console.error('[BACKUP] PRECHECK_FAILED', details);
        return json(res, 503, {
          error: 'Pré-validação do backup falhou. Nenhum registro foi criado.',
          details,
        });
      }

      const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const filename = `nextia-fullbackup-${timestampStr}.tar.gz`;
      const objectKey = `backups/${filename}`;

      // Insere registro no banco com status PENDING
      const insertRes = await client.query(
        `INSERT INTO public.backups (filename, object_key, size, backup_type, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [filename, objectKey, 0, 'full', 'PENDING', sessionProfile.email]
      );
      const backupId = insertRes.rows[0].id;
      await logAuditAction(backupId, 'BACKUP_STARTED', sessionProfile.email, 'Início do backup após pré-validação completa.');

      let workspace;
      let currentStage = 'PROCESSING';
      try {
        workspace = await createBackupWorkspace();
        await client.query(`UPDATE public.backups SET status = 'PROCESSING', updated_at = NOW() WHERE id = $1`, [backupId]);
        await logAuditAction(backupId, 'BACKUP_PROCESSING', sessionProfile.email, 'Processamento iniciado.');

        currentStage = 'GENERATING_DATABASE';
        await client.query(`UPDATE public.backups SET status = $1, updated_at = NOW() WHERE id = $2`, [currentStage, backupId]);
        await logAuditAction(backupId, 'DATABASE_GENERATION_STARTED', sessionProfile.email, 'Gerando dump com pg_dump.');
        const sqlDump = await generatePostgresDump(workspace);

        currentStage = 'GENERATING_ARCHIVE';
        await client.query(`UPDATE public.backups SET status = $1, updated_at = NOW() WHERE id = $2`, [currentStage, backupId]);
        await logAuditAction(backupId, 'ARCHIVE_GENERATION_STARTED', sessionProfile.email, 'Gerando arquivo TAR.GZ.');
        const metadataObj = {
          backup_type: 'full', version: '2.0', created_at: new Date().toISOString(),
          database: true, files: true, application_version: '2.0.0', created_by: sessionProfile.email,
        };
        const tarGzBuffer = buildTarGzArchive([
          { path: 'database.sql', data: sqlDump },
          { path: 'metadata.json', data: JSON.stringify(metadataObj, null, 2) },
          ...discoverPersistentFiles(),
        ]);
        if (tarGzBuffer.length === 0) throw new Error('A geração de TAR.GZ produziu arquivo vazio.');
        await client.query(`UPDATE public.backups SET size = $1, updated_at = NOW() WHERE id = $2`, [tarGzBuffer.length, backupId]);

        currentStage = 'CALCULATING_CHECKSUM';
        await client.query(`UPDATE public.backups SET status = $1, updated_at = NOW() WHERE id = $2`, [currentStage, backupId]);
        await logAuditAction(backupId, 'CHECKSUM_STARTED', sessionProfile.email, 'Calculando SHA256 do TAR.GZ.');
        const checksum = createHash('sha256').update(tarGzBuffer).digest('hex');
        if (!/^[a-f0-9]{64}$/.test(checksum)) throw new Error('SHA256 inválido para o TAR.GZ gerado.');
        await client.query(`UPDATE public.backups SET checksum = $1, updated_at = NOW() WHERE id = $2`, [checksum, backupId]);

        currentStage = 'UPLOADING_TO_MINIO';
        await client.query(`UPDATE public.backups SET status = $1, updated_at = NOW() WHERE id = $2`, [currentStage, backupId]);
        await logAuditAction(backupId, 'MINIO_UPLOAD_STARTED', sessionProfile.email, `Enviando ${objectKey} ao MinIO.`);
        await minioRequest('PUT', objectKey, tarGzBuffer);

        await client.query(
          `UPDATE public.backups
           SET status = 'COMPLETED', error_message = NULL, error_details = NULL, updated_at = NOW()
           WHERE id = $1`,
          [backupId],
        );
        await logAuditAction(backupId, 'BACKUP_COMPLETED', sessionProfile.email, `Fim backup. Tamanho: ${tarGzBuffer.length} bytes; SHA256: ${checksum}`);

        try {
          const activeBackups = (await client.query(
            `SELECT id, object_key FROM public.backups WHERE status = 'COMPLETED' ORDER BY created_at ASC`,
          )).rows;
          for (const oldBackup of activeBackups.slice(0, Math.max(0, activeBackups.length - 30))) {
            await minioRequest('DELETE', oldBackup.object_key);
            await client.query(`UPDATE public.backups SET status = 'DELETED', updated_at = NOW() WHERE id = $1`, [oldBackup.id]);
            await logAuditAction(oldBackup.id, 'BACKUP_DELETED', 'system', 'Exclusão por retenção automática (limite de 30 backups).');
          }
        } catch (retentionError) {
          const details = retentionError instanceof Error ? retentionError.message : String(retentionError);
          console.error('[BACKUP] RETENTION_FAILED', details);
          await logAuditAction(backupId, 'RETENTION_FAILED', sessionProfile.email, details);
        }

        return json(res, 201, { ok: true, backupId, filename, status: 'COMPLETED' });
      } catch (error) {
        const details = error instanceof Error ? error.stack || error.message : String(error);
        const stageLabels = {
          GENERATING_DATABASE: 'Falha pg_dump',
          GENERATING_ARCHIVE: 'Falha TAR.GZ',
          CALCULATING_CHECKSUM: 'Falha SHA256',
          UPLOADING_TO_MINIO: 'Falha Upload MinIO',
        };
        const message = stageLabels[currentStage] || 'Falha no processamento do backup';
        console.error(`[BACKUP] ${message}`, details);
        await client.query(
          `UPDATE public.backups
           SET status = 'FAILED', error_message = $1, error_details = $2, updated_at = NOW()
           WHERE id = $3`,
          [message, details, backupId],
        );
        await logAuditAction(backupId, 'BACKUP_FAILED', sessionProfile.email, `${message}: ${error instanceof Error ? error.message : String(error)}`);
        return json(res, 500, { error: message, backupId });
      } finally {
        if (workspace) await rm(workspace, { recursive: true, force: true });
      }
    }

    // Endpoint 2: Listar Backups e Logs de Auditoria
    if (url.pathname === '/api/admin/backup/list') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      const backupsRes = await client.query(`SELECT * FROM public.backups ORDER BY created_at DESC`);
      const logsRes = await client.query(`SELECT * FROM public.backup_logs ORDER BY created_at DESC LIMIT 50`);

      const backupsList = backupsRes.rows.map(b => {
        const sizeNum = Number(b.size) || 0;
        const sizeFormatted = sizeNum >= 1024 * 1024
          ? (sizeNum / (1024 * 1024)).toFixed(2) + ' MB'
          : (sizeNum / 1024).toFixed(1) + ' KB';

        return {
          id: b.id,
          filename: b.filename,
          object_key: b.object_key,
          size: sizeNum,
          sizeFormatted,
          checksum: b.checksum || null,
          backup_type: b.backup_type,
          status: b.status,
          error_message: b.error_message,
          error_details: b.error_details,
          created_by: b.created_by,
          created_at: b.created_at,
          updated_at: b.updated_at,
        };
      });

      return json(res, 200, { backups: backupsList, logs: logsRes.rows });
    }

    // Endpoint 3: Gerar Presigned Download URL (Validade 15 Minutos)
    if (url.pathname === '/api/admin/backup/download') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      const searchParams = new URLSearchParams(url.search);
      const backupId = searchParams.get('id');
      if (!backupId) return json(res, 400, { error: 'ID do backup não informado.' });

      const bRes = await client.query(`SELECT * FROM public.backups WHERE id = $1`, [backupId]);
      if (bRes.rows.length === 0) return json(res, 404, { error: 'Backup não encontrado.' });
      const b = bRes.rows[0];
      if (b.status !== 'COMPLETED' || !b.checksum || Number(b.size) <= 0) {
        return json(res, 409, { error: 'Download disponível apenas para backup concluído e validado.' });
      }

      // Token temporário assinado válido por 15 minutos (900 segundos)
      const expiresAt = Date.now() + 15 * 60 * 1000;
      const downloadToken = createHmac('sha256', sessionSecret)
        .update(`${b.id}:${expiresAt}`)
        .digest('hex');

      const downloadUrl = `/api/admin/backup/download-file?id=${b.id}&expires=${expiresAt}&token=${downloadToken}`;

      await logAuditAction(b.id, 'BACKUP_DOWNLOADED', sessionProfile.email, 'Presigned URL de 15 min gerada');

      return json(res, 200, {
        ok: true,
        downloadUrl,
        filename: b.filename,
        expiresAt: new Date(expiresAt).toISOString(),
      });
    }

    // Endpoint 4: Streaming seguro de download via token presigned (15 Minutos)
    if (url.pathname === '/api/admin/backup/download-file') {
      const searchParams = new URLSearchParams(url.search);
      const backupId = searchParams.get('id');
      const expires = Number(searchParams.get('expires') || 0);
      const token = searchParams.get('token');

      if (!backupId || !expires || !token) {
        return json(res, 400, { error: 'Link de download inválido ou incompleto.' });
      }

      if (Date.now() > expires) {
        return json(res, 403, { error: 'Link de download expirado (validade de 15 minutos excedida).' });
      }

      const expectedToken = createHmac('sha256', sessionSecret)
        .update(`${backupId}:${expires}`)
        .digest('hex');

      if (token !== expectedToken) {
        return json(res, 403, { error: 'Assinatura do token de download inválida.' });
      }

      const bRes = await client.query(`SELECT * FROM public.backups WHERE id = $1`, [backupId]);
      if (bRes.rows.length === 0) return json(res, 404, { error: 'Arquivo não encontrado.' });
      const b = bRes.rows[0];
      if (b.status !== 'COMPLETED' || !b.checksum || Number(b.size) <= 0) {
        return json(res, 409, { error: 'Download disponível apenas para backup concluído e validado.' });
      }

      let fileBuffer;
      try {
        const response = await minioRequest('GET', b.object_key);
        fileBuffer = Buffer.from(await response.arrayBuffer());
      } catch (error) {
        console.error('[BACKUP] MINIO_DOWNLOAD_FAILED', error);
        return json(res, 502, { error: 'Não foi possível recuperar o arquivo no MinIO.' });
      }
      const computedChecksum = createHash('sha256').update(fileBuffer).digest('hex');
      if (computedChecksum !== b.checksum) {
        return json(res, 409, { error: 'Falha de integridade: SHA256 do arquivo MinIO não confere.' });
      }
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${b.filename}"`,
        'Content-Length': fileBuffer.length,
        'Cache-Control': 'no-store',
      });
      return res.end(fileBuffer);
    }

    // Endpoint 5: Restauração com Validação Checksum SHA256 & Rollback Atômico
    if (url.pathname === '/api/admin/backup/restore' || url.pathname === '/api/admin/backup/rollback') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      const body = await readJson(req);
      if (body.confirmation !== 'RESTAURAR') {
        return json(res, 400, { error: 'Confirmação inválida. Digite exatamente RESTAURAR para autorizar.' });
      }

      const backupId = body.backupId;
      if (!backupId) return json(res, 400, { error: 'ID do backup não especificado.' });

      const bRes = await client.query(`SELECT * FROM public.backups WHERE id = $1`, [backupId]);
      if (bRes.rows.length === 0) return json(res, 404, { error: 'Registro de backup não encontrado.' });
      const b = bRes.rows[0];
      if (b.status !== 'COMPLETED' || !b.checksum || Number(b.size) <= 0) {
        return json(res, 409, { error: 'Restauração disponível apenas para backup concluído e validado.' });
      }

      await client.query(`UPDATE public.backups SET status = 'RESTORING', updated_at = NOW() WHERE id = $1`, [backupId]);
      await logAuditAction(backupId, 'RESTORE_STARTED', sessionProfile.email, 'Restauração com Rollback atômico iniciada');

      // Executa Restauração em Background
      setTimeout(async () => {
        try {
          const minioResponse = await minioRequest('GET', b.object_key);
          const fileBuf = Buffer.from(await minioResponse.arrayBuffer());
          const computedChecksum = createHash('sha256').update(fileBuf).digest('hex');

          // Valida Checksum SHA256
          if (b.checksum !== computedChecksum) {
            throw new Error(`Falha de integridade! Checksum SHA256 diverge (${computedChecksum} vs ${b.checksum}).`);
          }

          const extractedFiles = extractTarGzArchive(fileBuf);
          const sqlDumpEntry = extractedFiles.find(f => f.path === 'database.sql');

          if (!sqlDumpEntry) {
            throw new Error('Dump SQL (database.sql) não encontrado dentro do pacote TAR.GZ.');
          }

          // Transação SQL Atômica para Restore
          await client.query('BEGIN');
          const sqlCommands = sqlDumpEntry.data.toString('utf-8').split(';\n');
          for (const cmd of sqlCommands) {
            const cleanCmd = cmd.trim();
            if (cleanCmd && !cleanCmd.startsWith('--')) {
              await client.query(cleanCmd);
            }
          }
          await client.query('COMMIT');

          // Restaura Arquivos Persistentes
          for (const file of extractedFiles) {
            if (file.path.startsWith('files/')) {
              const relativeTarget = file.path.replace(/^files\//, '');
              const fullTarget = join(process.cwd(), relativeTarget);
              const parentDir = join(fullTarget, '..');
              if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });
              writeFileSync(fullTarget, file.data);
            }
          }

          await client.query(`UPDATE public.backups SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [backupId]);
          await logAuditAction(backupId, 'RESTORE_COMPLETED', sessionProfile.email, 'Restauração concluída com sucesso!');
        } catch (err) {
          console.error('[RESTORE ROLLBACK TRIGGERED]', err);
          try {
            await client.query('ROLLBACK');
          } catch (rErr) {}

          await client.query(`UPDATE public.backups SET status = 'FAILED', updated_at = NOW() WHERE id = $1`, [backupId]);
          await logAuditAction(backupId, 'RESTORE_FAILED', sessionProfile.email, `Rollback ativado: ${err.message}`);
        }
      }, 100);

      return json(res, 200, {
        ok: true,
        message: 'Processo de restauração iniciado em segundo plano.',
        status: 'RESTORING',
      });
    }

    // Endpoint 6: Excluir Backup (MinIO + Banco + Logs)
    if (url.pathname === '/api/admin/backup/delete') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      const body = await readJson(req);
      const backupId = body.backupId;
      if (!backupId) return json(res, 400, { error: 'ID do backup não informado.' });

      const bRes = await client.query(`SELECT * FROM public.backups WHERE id = $1`, [backupId]);
      if (bRes.rows.length === 0) return json(res, 404, { error: 'Backup não encontrado.' });
      const b = bRes.rows[0];

      if (b.status === 'COMPLETED') await minioRequest('DELETE', b.object_key);

      await client.query(`UPDATE public.backups SET status = 'DELETED', updated_at = NOW() WHERE id = $1`, [backupId]);
      await logAuditAction(backupId, 'BACKUP_DELETED', sessionProfile.email, 'Backup removido manualmente pelo admin');

      return json(res, 200, { ok: true, message: 'Backup excluído do servidor com sucesso.' });
    }

    // Endpoint 7: Logs de Auditoria
    if (url.pathname === '/api/admin/backup/logs') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') {
        return json(res, 403, { error: 'Acesso restrito a administradores.' });
      }

      const logsRes = await client.query(`SELECT * FROM public.backup_logs ORDER BY created_at DESC LIMIT 100`);
      return json(res, 200, { logs: logsRes.rows });
    }

    return json(res, 404, { error: 'API route not found' });
  } finally {
    await client.end();
  }
}

let partnerSchemaPromise;
async function ensurePartnerSchema(client) {
  if (!partnerSchemaPromise) {
    partnerSchemaPromise = (async () => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.partner_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          cpf_cnpj TEXT,
          pix_key TEXT,
          referral_code TEXT UNIQUE,
          status TEXT DEFAULT 'ativo',
          level TEXT DEFAULT 'bronze',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );
        CREATE TABLE IF NOT EXISTS public.partner_referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
          client_name TEXT NOT NULL,
          client_company TEXT,
          plan TEXT,
          monthly_fee NUMERIC DEFAULT 0,
          status TEXT DEFAULT 'pendente',
          commission_rate NUMERIC DEFAULT 0.25,
          commission_generated NUMERIC DEFAULT 0,
          start_date TIMESTAMPTZ,
          last_payment_date TIMESTAMPTZ
        );
        CREATE TABLE IF NOT EXISTS public.partner_commissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
          referral_id UUID REFERENCES public.partner_referrals(id) ON DELETE SET NULL,
          client_name TEXT,
          plan TEXT,
          monthly_fee NUMERIC DEFAULT 0,
          commission_value NUMERIC DEFAULT 0,
          status TEXT DEFAULT 'pendente',
          period TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.partner_withdrawals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          partner_id UUID NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
          amount NUMERIC NOT NULL,
          pix_key TEXT NOT NULL,
          status TEXT DEFAULT 'pendente',
          requested_at TIMESTAMPTZ DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        );
      `);
    })();
  }
  try {
    await partnerSchemaPromise;
  } catch (error) {
    partnerSchemaPromise = undefined;
    throw error;
  }
}

const partnerApiMethods = new Map([
  ['/api/partner/me', 'GET'],
  ['/api/partner/ranking', 'GET'],
  ['/api/partner/update-profile', 'POST'],
  ['/api/partner/request-withdrawal', 'POST'],
  ['/api/admin/partners', 'GET'],
  ['/api/admin/partner-commissions', 'GET'],
  ['/api/admin/partner-withdrawals', 'GET'],
  ['/api/admin/update-withdrawal', 'POST'],
  ['/api/admin/update-partner', 'POST'],
]);

async function handlePartnerApi(req, res, url) {
  const expectedMethod = partnerApiMethods.get(url.pathname);
  if (!expectedMethod) return json(res, 404, { error: 'API route not found' });
  if (req.method !== expectedMethod) return json(res, 405, { error: 'Method not allowed' });

  const client = dbClient();
  await client.connect();
  try {
    await ensurePartnerSchema(client);
    const sessionProfile = await getSessionProfile(req, client);
    if (!sessionProfile) return json(res, 401, { error: 'Não autorizado.' });

    if (url.pathname.startsWith('/api/admin/')) {
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso restrito.' });
      
      if (url.pathname === '/api/admin/partners') {
        // Backfill partner profiles for accounts registered as partners (company = Parceiro)
        // that never got a partner_profiles row (e.g. failed post-register init).
        await client.query(`
          INSERT INTO public.partner_profiles (user_id, referral_code, status)
          SELECT p.id,
                 lower(regexp_replace(coalesce(nullif(trim(p.name), ''), 'partner'), '[^a-zA-Z0-9]+', '-', 'g'))
                   || '-' || substr(replace(p.id::text, '-', ''), 1, 6),
                 'pendente'
          FROM public.profiles p
          WHERE lower(coalesce(p.company, '')) = 'parceiro'
            AND NOT EXISTS (SELECT 1 FROM public.partner_profiles pp WHERE pp.user_id = p.id)
          ON CONFLICT (user_id) DO NOTHING
        `);

        const result = await client.query(`
          SELECT pp.id, pp.user_id as "userId", pr.name, pr.email, pr.phone as whatsapp, 
                 pp.cpf_cnpj as "cpfCnpj", pp.pix_key as "pixKey", pp.referral_code as "referralCode", 
                 pp.level, pp.status, pp.created_at as "createdAt",
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id) as "totalReferrals",
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id AND r.status = 'ativo') as "activeReferrals",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id) as "totalCommission",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id AND c.status = 'pendente') as "pendingBalance",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id AND c.status = 'confirmado') - 
                 (SELECT COALESCE(SUM(w.amount), 0) FROM public.partner_withdrawals w WHERE w.partner_id = pp.id AND w.status IN ('pendente', 'pago')) as "availableBalance"
          FROM public.partner_profiles pp
          JOIN public.profiles pr ON pr.id = pp.user_id
          ORDER BY "totalCommission" DESC
        `);
        return json(res, 200, { partners: result.rows });
      }

      if (url.pathname === '/api/admin/partner-commissions') {
        const result = await client.query(`
          SELECT c.id, c.partner_id as "partnerId", pr.name as "partnerName", c.referral_id as "referralId", 
                 c.client_name as "clientName", c.plan, c.monthly_fee as "monthlyFee", 
                 c.commission_value as "commissionValue", c.status, c.period, c.created_at as "createdAt"
          FROM public.partner_commissions c
          JOIN public.partner_profiles pp ON pp.id = c.partner_id
          JOIN public.profiles pr ON pr.id = pp.user_id
          ORDER BY c.created_at DESC
        `);
        return json(res, 200, { commissions: result.rows });
      }

      if (url.pathname === '/api/admin/partner-withdrawals') {
        const result = await client.query(`
          SELECT w.id, w.partner_id as "partnerId", pr.name as "partnerName", w.amount, w.pix_key as "pixKey", 
                 w.status, w.requested_at as "requestedAt", w.processed_at as "processedAt"
          FROM public.partner_withdrawals w
          JOIN public.partner_profiles pp ON pp.id = w.partner_id
          JOIN public.profiles pr ON pr.id = pp.user_id
          ORDER BY w.requested_at DESC
        `);
        return json(res, 200, { withdrawals: result.rows });
      }

      if (url.pathname === '/api/admin/update-withdrawal') {
        const body = await readJson(req);
        const { id, status } = body;
        if (!['pago', 'rejeitado'].includes(status)) return json(res, 400, { error: 'Status inválido' });
        
        await client.query(`UPDATE public.partner_withdrawals SET status = $1, processed_at = NOW() WHERE id = $2`, [status, id]);
        return json(res, 200, { status: 'success' });
      }

      if (url.pathname === '/api/admin/update-partner') {
        const body = await readJson(req);
        const { id, status } = body;
        if (!['ativo', 'pendente', 'suspenso'].includes(status)) return json(res, 400, { error: 'Status inválido' });
        
        await client.query(`UPDATE public.partner_profiles SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
        return json(res, 200, { status: 'success' });
      }
    }

    if (url.pathname.startsWith('/api/partner/')) {
      // Ensure partner profile exists for this user
      let profileRes = await client.query(`SELECT * FROM public.partner_profiles WHERE user_id = $1`, [sessionProfile.id]);
      if (profileRes.rows.length === 0) {
        const code = sessionProfile.name
          ? sessionProfile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 24) + '-' + Math.random().toString(36).substring(2, 6)
          : 'partner-' + Math.random().toString(36).substring(2, 8);
        profileRes = await client.query(`
          INSERT INTO public.partner_profiles (user_id, referral_code, status) 
          VALUES ($1, $2, 'pendente') RETURNING *`, 
          [sessionProfile.id, code]
        );
      }
      const partnerProfile = profileRes.rows[0];

      if (url.pathname === '/api/partner/me') {
        const profile = {
          id: partnerProfile.id,
          userId: sessionProfile.id,
          name: sessionProfile.name,
          email: sessionProfile.email,
          whatsapp: partnerProfile.whatsapp || '',
          cpfCnpj: partnerProfile.cpf_cnpj || '',
          pixKey: partnerProfile.pix_key || '',
          referralCode: partnerProfile.referral_code,
          level: partnerProfile.level,
          status: partnerProfile.status,
          createdAt: partnerProfile.created_at
        };

        const referralsRes = await client.query(`
          SELECT id, partner_id as "partnerId", client_name as "clientName", client_company as "clientCompany", 
                 plan, monthly_fee as "monthlyFee", status, commission_rate as "commissionRate", 
                 commission_generated as "commissionGenerated", start_date as "startDate", last_payment_date as "lastPaymentDate"
          FROM public.partner_referrals WHERE partner_id = $1 ORDER BY start_date DESC
        `, [partnerProfile.id]);

        const commissionsRes = await client.query(`
          SELECT id, partner_id as "partnerId", referral_id as "referralId", client_name as "clientName", 
                 plan, monthly_fee as "monthlyFee", commission_value as "commissionValue", status, period, created_at as "createdAt"
          FROM public.partner_commissions WHERE partner_id = $1 ORDER BY created_at DESC
        `, [partnerProfile.id]);

        const withdrawalsRes = await client.query(`
          SELECT id, partner_id as "partnerId", amount, pix_key as "pixKey", status, requested_at as "requestedAt", processed_at as "processedAt"
          FROM public.partner_withdrawals WHERE partner_id = $1 ORDER BY requested_at DESC
        `, [partnerProfile.id]);

        // Calculate balances
        profile.totalReferrals = referralsRes.rows.length;
        profile.activeReferrals = referralsRes.rows.filter(r => r.status === 'ativo').length;
        profile.totalCommission = commissionsRes.rows.reduce((sum, c) => sum + Number(c.commissionValue), 0);
        
        const confirmedCommissions = commissionsRes.rows.filter(c => c.status === 'confirmado').reduce((sum, c) => sum + Number(c.commissionValue), 0);
        const withdrawnAmount = withdrawalsRes.rows.filter(w => w.status === 'pendente' || w.status === 'pago').reduce((sum, w) => sum + Number(w.amount), 0);
        
        profile.availableBalance = Math.max(0, confirmedCommissions - withdrawnAmount);
        profile.pendingBalance = commissionsRes.rows.filter(c => c.status === 'pendente').reduce((sum, c) => sum + Number(c.commissionValue), 0);
        profile.rankingPosition = 0; // Can be calculated by joining all if needed

        return json(res, 200, { 
          profile, 
          referrals: referralsRes.rows, 
          commissions: commissionsRes.rows, 
          withdrawals: withdrawalsRes.rows 
        });
      }

      if (url.pathname === '/api/partner/update-profile') {
        const body = await readJson(req);
        await client.query(`
          UPDATE public.partner_profiles 
          SET pix_key = $1, cpf_cnpj = $2, updated_at = NOW() 
          WHERE id = $3
        `, [body.pixKey, body.cpfCnpj, partnerProfile.id]);
        return json(res, 200, { status: 'success' });
      }

      if (url.pathname === '/api/partner/request-withdrawal') {
        const body = await readJson(req);
        const amount = Number(body.amount);
        if (isNaN(amount) || amount <= 0) return json(res, 400, { error: 'Valor inválido' });
        
        // Ensure sufficient balance
        const commissionsRes = await client.query(`SELECT COALESCE(SUM(commission_value), 0) as total FROM public.partner_commissions WHERE partner_id = $1 AND status = 'confirmado'`, [partnerProfile.id]);
        const withdrawalsRes = await client.query(`SELECT COALESCE(SUM(amount), 0) as total FROM public.partner_withdrawals WHERE partner_id = $1 AND status IN ('pendente', 'pago')`, [partnerProfile.id]);
        const available = Number(commissionsRes.rows[0].total) - Number(withdrawalsRes.rows[0].total);

        if (amount > available) return json(res, 400, { error: 'Saldo insuficiente' });

        await client.query(`
          INSERT INTO public.partner_withdrawals (partner_id, amount, pix_key) 
          VALUES ($1, $2, $3)
        `, [partnerProfile.id, amount, partnerProfile.pix_key || body.pixKey]);
        return json(res, 200, { status: 'success' });
      }

      if (url.pathname === '/api/partner/ranking') {
        const rankRes = await client.query(`
          SELECT pp.id, pr.name, pp.level, pp.status,
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id) as "totalReferrals",
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id AND r.status = 'ativo') as "activeReferrals",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id) as "totalCommission"
          FROM public.partner_profiles pp
          JOIN public.profiles pr ON pr.id = pp.user_id
          WHERE pp.status = 'ativo'
          ORDER BY "totalCommission" DESC
          LIMIT 50
        `);
        return json(res, 200, { ranking: rankRes.rows });
      }
    }
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

  if ((pathname === '/api/auth/update-profile' || pathname === '/api/auth/profile') && (req.method === 'PUT' || req.method === 'POST')) {
    const token = requestToken(req);
    const payload = verifyToken(token);
    if (!payload?.sub) return json(res, 401, { error: 'Não autorizado. Sessão expirada.' });

    const body = await readJson(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const company = String(body.company || '').trim();
    const avatarInitials = String(body.avatarInitials || '').trim() || 'NX';

    if (!name || !email) {
      return json(res, 400, { error: 'Nome e e-mail são obrigatórios.' });
    }

    const client = dbClient();
    await client.connect();
    try {
      const result = await client.query(
        `UPDATE public.profiles
         SET name = $1, email = $2, phone = $3, company = $4, avatar_initials = $5
         WHERE id = $6
         RETURNING id, email, name, company, phone, role, avatar_initials, created_at`,
        [name, email, phone, company, avatarInitials, payload.sub],
      );

      if (result.rows.length === 0) {
        return json(res, 404, { error: 'Perfil não encontrado.' });
      }

      const user = mapProfile(result.rows[0]);
      return json(res, 200, { ok: true, user });
    } catch (err) {
      if (String(err.message || '').includes('duplicate')) {
        return json(res, 409, { error: 'Este e-mail já está sendo utilizado por outro usuário.' });
      }
      throw err;
    } finally {
      await client.end();
    }
  }

  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    const token = requestToken(req);
    const payload = verifyToken(token);
    if (!payload?.sub) return json(res, 401, { error: 'Não autorizado. Sessão expirada.' });

    const { currentPassword, newPassword } = await readJson(req);
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return json(res, 400, { error: 'Preencha a senha atual e a nova senha (mínimo de 6 caracteres).' });
    }

    const client = dbClient();
    await client.connect();
    try {
      const userRes = await client.query(
        `SELECT password_hash FROM public.local_auth_users WHERE id = $1`,
        [payload.sub],
      );

      const row = userRes.rows[0];
      let validPassword = false;
      if (row?.password_hash?.startsWith('pbkdf2_sha256$')) {
        validPassword = verifyPassword(currentPassword, row.password_hash);
      } else if (row?.password_hash) {
        const cryptCheck = await client.query('SELECT $1 = crypt($2, $1) AS ok', [row.password_hash, currentPassword]);
        validPassword = cryptCheck.rows[0]?.ok === true;
      }

      if (!row || !validPassword) {
        return json(res, 400, { error: 'A senha atual está incorreta.' });
      }

      const newHash = hashPassword(newPassword);
      await client.query(
        `UPDATE public.local_auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [newHash, payload.sub],
      );

      return json(res, 200, { ok: true, message: 'Senha alterada com sucesso!' });
    } finally {
      await client.end();
    }
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
        `SELECT p.id, p.email, p.name, p.company, p.phone, p.role, p.avatar_initials, p.created_at, a.password_hash,
                EXISTS(SELECT 1 FROM public.partner_profiles WHERE user_id = p.id) as is_partner
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
    const isPartner = String(body.role || '').toLowerCase() === 'partner';
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
      if (isPartner) {
        await ensurePartnerSchema(client);
        const nameSlug = String(body.name || 'partner')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 24) || 'partner';
        const referralCode = `${nameSlug}-${Math.random().toString(36).substring(2, 6)}`;
        await client.query(
          `INSERT INTO public.partner_profiles (user_id, referral_code, cpf_cnpj, status)
           VALUES ($1, $2, $3, 'pendente')
           ON CONFLICT (user_id) DO NOTHING`,
          [id, referralCode, body.cpfCnpj || body.cpf_cnpj || ''],
        );
      }
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

  if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
    const { email } = await readJson(req);
    if (!email) return json(res, 400, { error: 'E-mail é obrigatório.' });

    const client = dbClient();
    await client.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const userRes = await client.query(
        `SELECT id, name, email FROM public.profiles WHERE lower(email) = lower($1)`,
        [email.trim()],
      );

      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        const resetToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await client.query(`DELETE FROM public.password_reset_tokens WHERE user_id = $1`, [user.id]);
        await client.query(
          `INSERT INTO public.password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
          [user.id, resetToken, expiresAt.toISOString()],
        );

        const resetLink = `${appBaseUrl(req)}/redefinir-senha?token=${resetToken}`;
        await sendPasswordResetEmail({ email: user.email, name: user.name, resetLink });
      }

      return json(res, 200, {
        ok: true,
        message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
      });
    } finally {
      await client.end();
    }
  }

  if (pathname === '/api/auth/verify-reset-token' && req.method === 'GET') {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');
    if (!token) return json(res, 400, { valid: false, error: 'Token não informado.' });

    const client = dbClient();
    await client.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const tokenRes = await client.query(
        `SELECT id, expires_at FROM public.password_reset_tokens WHERE token = $1`,
        [token],
      );

      if (tokenRes.rows.length === 0) {
        return json(res, 200, { valid: false, error: 'Link de redefinição inválido.' });
      }

      const row = tokenRes.rows[0];
      if (new Date(row.expires_at) < new Date()) {
        return json(res, 200, { valid: false, error: 'Este link de redefinição já expirou.' });
      }

      return json(res, 200, { valid: true });
    } finally {
      await client.end();
    }
  }

  if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
    const { token, password } = await readJson(req);
    if (!token || !password || password.length < 6) {
      return json(res, 400, { error: 'Token e nova senha (mínimo 6 caracteres) são obrigatórios.' });
    }

    const client = dbClient();
    await client.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const tokenRes = await client.query(
        `SELECT user_id, expires_at FROM public.password_reset_tokens WHERE token = $1`,
        [token],
      );

      if (tokenRes.rows.length === 0 || new Date(tokenRes.rows[0].expires_at) < new Date()) {
        return json(res, 400, { error: 'Link de redefinição inválido ou expirado.' });
      }

      const userId = tokenRes.rows[0].user_id;
      const newHash = hashPassword(password);

      await client.query('BEGIN');
      await client.query(
        `UPDATE public.local_auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [newHash, userId],
      );
      await client.query(`DELETE FROM public.password_reset_tokens WHERE token = $1`, [token]);
      await client.query('COMMIT');

      return json(res, 200, { ok: true, message: 'Senha redefinida com sucesso!' });
    } catch (err) {
      await client.query('ROLLBACK');
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
    if (url.pathname === '/health' || url.pathname === '/healthz' || url.pathname === '/api/health') {
      return json(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    }
    if (url.pathname.startsWith('/api/auth/')) {
      return await handleAuth(req, res, url.pathname);
    }
    if (
      url.pathname.startsWith('/api/partner/') ||
      url.pathname.startsWith('/api/admin/partner') ||
      url.pathname === '/api/admin/update-partner' ||
      url.pathname === '/api/admin/update-withdrawal'
    ) {
      return await handlePartnerApi(req, res, url);
    }
    if (url.pathname.startsWith('/api/support/') || url.pathname.startsWith('/api/admin/')) {
      return await handleSupportApi(req, res, url);
    }
    if (url.pathname.startsWith('/api/')) {
      return json(res, 404, { error: 'API route not found' });
    }
    // G2: Referral link tracking — /ref/:code
    if (url.pathname.startsWith('/ref/')) {
      const code = url.pathname.replace('/ref/', '').trim();
      if (code) {
        // Set a cookie with the referral code (valid for 30 days)
        res.writeHead(302, {
          'Location': '/?ref=' + encodeURIComponent(code),
          'Set-Cookie': `nextia_ref=${encodeURIComponent(code)}; Path=/; Max-Age=2592000; SameSite=Lax`,
        });
        return res.end();
      }
    }
    return await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return json(res, 500, { error: 'Internal server error' });
  }
}).listen(port, () => {
  console.log(`Nextia server listening on port ${port}`);
});
