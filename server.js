import { createHash, createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, cpSync, rmSync } from 'node:fs';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { extname, join, resolve, sep, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { gzipSync, gunzipSync } from 'node:zlib';
import { Client } from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import { ensureAppSchema, handleAppApi, isAppApiPath } from './app-api.js';

const port = Number(process.env.PORT || 3000);
const distDir = join(process.cwd(), 'dist');
const sessionSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'nextia-local-dev-secret';
let supportSchemaPromise;
let commercialCatalogSchemaPromise;
const execFileAsync = promisify(execFile);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    'Cross-Origin-Opener-Policy': 'same-origin',
    ...(process.env.NODE_ENV === 'production' ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}),
  };
}

function json(res, status, body) {
  res.writeHead(status, {
    ...securityHeaders(),
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

function parseCloudinaryUrl(value, index) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'cloudinary:') throw new Error('protocolo inválido');
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    if (!cloudName || !apiKey || !apiSecret) throw new Error('credenciais incompletas');
    return { index, cloudName, apiKey, apiSecret };
  } catch (error) {
    const variableName = index === 'materials' ? 'CLOUDINARY_MATERIALS_URL' : `CLOUDINARY_BACKUP_URL_${index}`;
    throw new Error(`${variableName} inválida: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function cloudinaryMaterialsAccount() {
  return process.env.CLOUDINARY_MATERIALS_URL
    ? parseCloudinaryUrl(process.env.CLOUDINARY_MATERIALS_URL, 'materials')
    : cloudinaryBackupAccounts()[0];
}

function formatByteSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(0.1, bytes / 1024).toFixed(1)} KB`;
}

async function uploadMarketingMaterial(fileData, fileName) {
  const match = String(fileData || '').match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) throw new Error('Arquivo inválido. Envie um arquivo codificado em base64.');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > 25 * 1024 * 1024) {
    throw new Error('O material deve ter entre 1 byte e 25 MB.');
  }
  const safeName = basename(String(fileName || 'material.bin')).replace(/[^a-zA-Z0-9._-]/g, '-');
  const workspace = await mkdtemp(join(tmpdir(), 'nextia-material-'));
  const filePath = join(workspace, safeName);
  try {
    await writeFile(filePath, buffer);
    const account = cloudinaryMaterialsAccount();
    const result = await cloudinary.uploader.upload(filePath, {
      ...cloudinaryOptions(account),
      resource_type: 'auto',
      type: 'upload',
      folder: 'nextia-materials',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });
    return {
      account,
      assetId: result.asset_id,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format || safeName.split('.').pop() || 'bin',
      bytes: Number(result.bytes || buffer.length),
      secureUrl: result.secure_url,
    };
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

function cloudinaryBackupAccounts() {
  let entries = Object.entries(process.env)
    .map(([name, value]) => {
      const match = name.match(/^CLOUDINARY_BACKUP_URL_(\d+)$/);
      return match && value ? { index: Number(match[1]), value } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  if (entries.length === 0 && process.env.CLOUDINARY_URLS) {
    const raw = process.env.CLOUDINARY_URLS.trim().replace(/^['"]|['"]$/g, '');
    let urls = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) urls = parsed.filter((item) => typeof item === 'string');
    } catch {
      urls = raw.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
    }
    entries = urls.map((value, offset) => ({ index: offset + 1, value }));
  }

  if (entries.length < 2) {
    throw new Error('Configure pelo menos duas contas em CLOUDINARY_BACKUP_URL_1/CLOUDINARY_BACKUP_URL_2 ou na lista CLOUDINARY_URLS para ativar a rotação.');
  }
  const accounts = entries.map(({ index, value }) => parseCloudinaryUrl(value, index));
  if (new Set(accounts.map((account) => account.cloudName)).size !== accounts.length) {
    throw new Error('Cada CLOUDINARY_BACKUP_URL_n deve apontar para um cloud_name diferente.');
  }
  return accounts;
}

function cloudinaryOptions(account) {
  return {
    cloud_name: account.cloudName,
    api_key: account.apiKey,
    api_secret: account.apiSecret,
    secure: true,
    hide_sensitive: true,
  };
}

// The SDK configuration is process-global, so account rotations must not overlap.
let cloudinaryOperationQueue = Promise.resolve();

function withCloudinaryAccount(account, operation) {
  const run = cloudinaryOperationQueue.then(async () => {
    cloudinary.config(cloudinaryOptions(account));
    return operation();
  });
  cloudinaryOperationQueue = run.catch(() => undefined);
  return run;
}

async function selectCloudinaryBackupAccount(client) {
  const accounts = cloudinaryBackupAccounts();
  const sequence = await client.query(`SELECT nextval('public.backup_storage_rotation_seq') AS position`);
  const start = (Number(sequence.rows[0].position) - 1) % accounts.length;
  return accounts.map((_, offset) => accounts[(start + offset) % accounts.length]);
}

async function cloudinaryUploadFile(account, filePath, publicId, options = {}) {
  return withCloudinaryAccount(account, () => new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(filePath, {
      resource_type: 'raw',
      type: 'authenticated',
      public_id: publicId,
      overwrite: false,
      chunk_size: 6_000_000,
      ...options,
    }, (error, result) => {
      if (error) reject(error);
      else if (!result?.public_id) reject(new Error('Cloudinary não retornou o public_id após o upload.'));
      else resolve(result);
    });
  }));
}

async function cloudinaryDeleteAsset(account, publicId, options = {}) {
  const result = await withCloudinaryAccount(account, () => cloudinary.uploader.destroy(publicId, {
    resource_type: options.resourceType || 'raw',
    type: options.type || 'authenticated',
    invalidate: true,
  }));
  if (!['ok', 'not found'].includes(result.result)) {
    throw new Error(`Cloudinary não confirmou a exclusão do ativo ${publicId}.`);
  }
}

async function cloudinaryDownloadAsset(account, backup) {
  return withCloudinaryAccount(account, async () => {
    const publicId = backup.storage_public_id || backup.object_key;

    // If we have asset_id but the stored public_id might be stale, resolve via Admin API
    if (backup.storage_asset_id && !backup.storage_public_id) {
      try {
        const asset = await cloudinary.api.resource_by_asset_id(backup.storage_asset_id, { resource_type: 'raw' });
        if (asset && asset.public_id) {
          backup.storage_public_id = asset.public_id;
          backup.storage_version = asset.version;
        }
      } catch (resolveErr) {
        console.warn('[BACKUP] Não foi possível resolver ativo pelo asset_id:', resolveErr.message);
      }
    }

    const resolvedPublicId = backup.storage_public_id || publicId;

    // Primary: use private_download_url for authenticated raw assets
    try {
      const downloadUrl = cloudinary.utils.private_download_url(resolvedPublicId, '', {
        resource_type: 'raw',
        type: 'authenticated',
        expires_at: Math.floor(Date.now() / 1000) + 900,
      });
      const response = await fetch(downloadUrl, { headers: { Accept: 'application/octet-stream' } });
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer());
      }
      console.warn(`[BACKUP] private_download_url retornou HTTP ${response.status}, tentando fallback sign_url...`);
    } catch (pdErr) {
      console.warn('[BACKUP] private_download_url falhou:', pdErr.message, '— tentando fallback sign_url...');
    }

    // Fallback: signed URL via cloudinary.url
    const signedUrl = cloudinary.url(resolvedPublicId, {
      resource_type: 'raw',
      type: 'authenticated',
      sign_url: true,
      version: backup.storage_version || undefined,
    });
    const response = await fetch(signedUrl, { headers: { Accept: 'application/octet-stream' } });
    if (!response.ok) {
      throw new Error(`Cloudinary respondeu HTTP ${response.status} ao recuperar o backup (public_id: ${resolvedPublicId}).`);
    }
    return Buffer.from(await response.arrayBuffer());
  });
}

function cloudinaryAccountForBackup(backup) {
  const account = cloudinaryBackupAccounts().find((item) => item.cloudName === backup.storage_account);
  if (!account) throw new Error(`A conta Cloudinary "${backup.storage_account || 'não informada'}" não está configurada neste deploy.`);
  return account;
}

async function downloadBackupObject(backup) {
  if (backup.storage_provider === 'cloudinary') {
    return cloudinaryDownloadAsset(cloudinaryAccountForBackup(backup), backup);
  }
  const response = await minioRequest('GET', backup.object_key);
  return Buffer.from(await response.arrayBuffer());
}

async function deleteBackupObject(backup) {
  if (backup.storage_provider === 'cloudinary') {
    return cloudinaryDeleteAsset(
      cloudinaryAccountForBackup(backup),
      backup.storage_public_id || backup.object_key,
    );
  }
  return minioRequest('DELETE', backup.object_key);
}

function mapProfile(row) {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || '',
    company: row.company || '',
    phone: row.phone || '',
    avatarInitials: row.avatar_initials || 'NX',
    role: row.role === 'admin' ? 'admin' : (row.role === 'technician' ? 'technician' : (row.is_partner ? 'partner' : 'client')),
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
    `SELECT id, email, name, phone, role
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

async function ensureCommercialCatalogSchema(client) {
  if (!commercialCatalogSchemaPromise) {
    commercialCatalogSchemaPromise = readFile(join(process.cwd(), 'database', 'commercial-catalog.sql'), 'utf8')
      .then((schema) => client.query(schema));
  }
  try {
    await commercialCatalogSchemaPromise;
  } catch (error) {
    commercialCatalogSchemaPromise = undefined;
    throw error;
  }
}

async function handleCatalogApi(req, res, url) {
  const client = dbClient();
  await client.connect();
  try {
    await ensureCommercialCatalogSchema(client);
    await ensureAppSchema(client);
    const sessionProfile = await getSessionProfile(req, client);
    const isAdminRoute = url.pathname.startsWith('/api/admin/');
    if (isAdminRoute && sessionProfile?.role !== 'admin') {
      return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
    }

    if ((url.pathname === '/api/catalog/services' || url.pathname === '/api/admin/catalog/services') && req.method === 'GET') {
      const result = await client.query(
        `SELECT slug, name, category, price_cents, price_label, recurring, active, sort_order, updated_at
         FROM public.commercial_services
         ${isAdminRoute ? '' : 'WHERE active = TRUE'}
         ORDER BY sort_order, name`,
      );
      return json(res, 200, { services: result.rows });
    }

    if ((url.pathname === '/api/catalog/plans' || url.pathname === '/api/admin/catalog/plans') && req.method === 'GET') {
      const result = await client.query(
        `SELECT id, name, monthly_amount_cents, activation_amount_cents, active, sort_order, updated_at
         FROM public.commercial_plans ${isAdminRoute ? '' : 'WHERE active = TRUE'} ORDER BY sort_order, name`,
      );
      return json(res, 200, { plans: result.rows });
    }

    if (url.pathname === '/api/admin/catalog/plans' && req.method === 'PATCH') {
      const body = await readJson(req);
      const monthly = Number(body.monthlyAmountCents);
      const activation = Number(body.activationAmountCents);
      const order = Number(body.sortOrder);
      if (!String(body.id || '') || !Number.isInteger(monthly) || monthly <= 0 || !Number.isInteger(activation) || activation <= 0 || !Number.isInteger(order)) {
        return json(res, 400, { error: 'Plano ou valores inválidos.' });
      }
      const result = await client.query(
        `UPDATE public.commercial_plans SET monthly_amount_cents = $1, activation_amount_cents = $2,
           active = $3, sort_order = $4, updated_at = NOW(), updated_by = $5 WHERE id = $6 RETURNING *`,
        [monthly, activation, body.active !== false, order, sessionProfile.id, body.id],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Plano não encontrado.' });
      return json(res, 200, { plan: result.rows[0] });
    }

    if (url.pathname === '/api/admin/catalog/services' && req.method === 'PATCH') {
      const body = await readJson(req);
      const slug = String(body.slug || '').trim();
      const priceCents = body.priceCents === null || body.priceCents === '' ? null : Number(body.priceCents);
      const sortOrder = Number(body.sortOrder);
      if (!slug || (priceCents !== null && (!Number.isInteger(priceCents) || priceCents < 0))) {
        return json(res, 400, { error: 'Serviço ou preço inválido.' });
      }
      if (!Number.isInteger(sortOrder)) return json(res, 400, { error: 'Ordem inválida.' });
      const result = await client.query(
        `UPDATE public.commercial_services
         SET price_cents = $1, price_label = $2, recurring = $3, active = $4,
             sort_order = $5, updated_at = NOW(), updated_by = $6
         WHERE slug = $7
         RETURNING slug, name, category, price_cents, price_label, recurring, active, sort_order, updated_at`,
        [priceCents, String(body.priceLabel || '').trim() || 'sob orçamento', body.recurring === true,
          body.active !== false, sortOrder, sessionProfile.id, slug],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Serviço não encontrado.' });
      return json(res, 200, { service: result.rows[0] });
    }

    if (url.pathname === '/api/commerce/orders' && req.method === 'GET') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para consultar seus pedidos.' });
      const result = await client.query(
        `SELECT id, item_type, item_id, item_name, amount_cents, recurring, status,
                checkout_url, created_at, updated_at, paid_at
         FROM public.commercial_orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [sessionProfile.id],
      );
      return json(res, 200, { orders: result.rows });
    }

    if (url.pathname === '/api/commerce/orders' && req.method === 'POST') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para contratar.' });
      const body = await readJson(req);
      const serviceResult = await client.query(
        `SELECT slug, name, price_cents, recurring FROM public.commercial_services
         WHERE slug = $1 AND active = TRUE`,
        [String(body.serviceSlug || '').trim()],
      );
      const service = serviceResult.rows[0];
      if (!service) return json(res, 404, { error: 'Serviço não encontrado ou indisponível.' });
      if (!Number.isInteger(service.price_cents) || service.price_cents <= 0) {
        return json(res, 409, { error: 'Este serviço precisa de orçamento antes da contratação.' });
      }
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const orderId = randomUUID();
      const protocol = String(req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http')).split(',')[0].trim();
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
      const externalReference = `order:${orderId}`;
      await client.query(
        `INSERT INTO public.commercial_orders
          (id, user_id, item_id, item_name, amount_cents, recurring, customer_notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [orderId, sessionProfile.id, service.slug, service.name, service.price_cents, service.recurring, String(body.notes || '').trim().slice(0, 2000) || null],
      );

      const recurringPayload = {
        reason: `Nextia - ${service.name}`,
        external_reference: externalReference,
        payer_email: sessionProfile.email,
        back_url: `${baseUrl}/checkout?status=return&order=${orderId}`,
        notification_url: `${baseUrl}/api/commerce/webhook`,
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: service.price_cents / 100, currency_id: 'BRL' },
      };
      const oneTimePayload = {
        items: [{ id: service.slug, title: `Nextia - ${service.name}`, quantity: 1, unit_price: service.price_cents / 100, currency_id: 'BRL' }],
        payer: { name: sessionProfile.name, email: sessionProfile.email },
        external_reference: externalReference,
        back_urls: { success: `${baseUrl}/checkout?status=success&order=${orderId}`, failure: `${baseUrl}/checkout?status=failure&order=${orderId}`, pending: `${baseUrl}/checkout?status=pending&order=${orderId}` },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/commerce/webhook`,
      };
      const endpoint = service.recurring ? 'https://api.mercadopago.com/preapproval' : 'https://api.mercadopago.com/checkout/preferences';
      const providerResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `nextia-order-${orderId}` },
        body: JSON.stringify(service.recurring ? recurringPayload : oneTimePayload),
      });
      const providerData = await providerResponse.json();
      if (!providerResponse.ok || !providerData.init_point) {
        await client.query(`UPDATE public.commercial_orders SET status = 'failed', updated_at = NOW() WHERE id = $1`, [orderId]);
        console.error('[COMMERCE] Checkout creation failed', providerResponse.status, providerData);
        return json(res, 502, { error: 'Não foi possível iniciar o pagamento. O pedido foi registrado para análise.' });
      }
      await client.query(
        `UPDATE public.commercial_orders SET status = 'payment_pending', provider_reference = $2,
          checkout_url = $3, updated_at = NOW() WHERE id = $1`,
        [orderId, String(providerData.id), providerData.init_point],
      );
      return json(res, 201, { orderId, checkoutUrl: providerData.init_point, recurring: service.recurring });
    }

    if (url.pathname === '/api/commerce/plan-contracts' && req.method === 'GET') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para consultar seus planos.' });
      const result = await client.query(
        `SELECT id, plan_id, plan_name, monthly_amount_cents, activation_amount_cents, status,
                activation_checkout_url, subscription_checkout_url, created_at, updated_at, activated_at
         FROM public.commercial_plan_contracts WHERE user_id = $1 ORDER BY created_at DESC`,
        [sessionProfile.id],
      );
      return json(res, 200, { contracts: result.rows });
    }

    if (url.pathname === '/api/commerce/plan-contracts' && req.method === 'POST') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para assinar um plano.' });
      const body = await readJson(req);
      const planId = String(body.planId || '').toLowerCase();
      const planResult = await client.query(
        `SELECT id, name, monthly_amount_cents AS monthly, activation_amount_cents AS activation
         FROM public.commercial_plans WHERE id = $1 AND active = TRUE`, [planId],
      );
      const plan = planResult.rows[0];
      if (!plan) return json(res, 400, { error: 'Plano inválido.' });
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const contractId = randomUUID();
      const protocol = String(req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http')).split(',')[0].trim();
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
      await client.query(
        `INSERT INTO public.commercial_plan_contracts
          (id, user_id, plan_id, plan_name, monthly_amount_cents, activation_amount_cents)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [contractId, sessionProfile.id, planId, plan.name, plan.monthly, plan.activation],
      );
      const providerResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `nextia-contract-${contractId}` },
        body: JSON.stringify({
          items: [{ id: planId, title: `Ativação - ${plan.name}`, quantity: 1, unit_price: plan.activation / 100, currency_id: 'BRL' }],
          payer: { name: sessionProfile.name, email: sessionProfile.email },
          external_reference: `contract:${contractId}:activation`,
          back_urls: { success: `${baseUrl}/checkout?status=success&contract=${contractId}`, failure: `${baseUrl}/checkout?status=failure&contract=${contractId}`, pending: `${baseUrl}/checkout?status=pending&contract=${contractId}` },
          auto_return: 'approved', notification_url: `${baseUrl}/api/commerce/webhook`,
        }),
      });
      const providerData = await providerResponse.json();
      if (!providerResponse.ok || !providerData.init_point) {
        await client.query(`UPDATE public.commercial_plan_contracts SET status = 'failed', updated_at = NOW() WHERE id = $1`, [contractId]);
        return json(res, 502, { error: 'Não foi possível iniciar o pagamento da ativação.' });
      }
      await client.query(
        `UPDATE public.commercial_plan_contracts SET activation_preference_id = $2,
           activation_checkout_url = $3, updated_at = NOW() WHERE id = $1`,
        [contractId, String(providerData.id), providerData.init_point],
      );
      return json(res, 201, { contractId, checkoutUrl: providerData.init_point });
    }

    if (url.pathname === '/api/admin/commerce/orders' && req.method === 'GET') {
      const [result, contracts] = await Promise.all([client.query(
        `SELECT o.id, o.item_name, o.amount_cents, o.recurring, o.status, o.provider,
                o.created_at, o.updated_at, o.paid_at, p.name AS customer_name, p.email AS customer_email
         FROM public.commercial_orders o JOIN public.profiles p ON p.id = o.user_id
         ORDER BY o.created_at DESC`,
      ), client.query(
        `SELECT c.id, c.plan_id, c.plan_name, c.monthly_amount_cents, c.activation_amount_cents,
                c.status, c.created_at, c.updated_at, c.activated_at,
                p.name AS customer_name, p.email AS customer_email
         FROM public.commercial_plan_contracts c JOIN public.profiles p ON p.id = c.user_id
         ORDER BY c.created_at DESC`,
      )]);
      return json(res, 200, { orders: result.rows, contracts: contracts.rows });
    }

    if (url.pathname === '/api/admin/commerce/orders' && req.method === 'PATCH') {
      const body = await readJson(req);
      const status = String(body.status || '');
      if (!['pending', 'payment_pending', 'paid', 'active', 'failed', 'cancelled'].includes(status)) {
        return json(res, 400, { error: 'Status inválido.' });
      }
      const result = await client.query(
        `UPDATE public.commercial_orders SET status = $1, updated_at = NOW(),
           paid_at = CASE WHEN $1 IN ('paid','active') THEN COALESCE(paid_at, NOW()) ELSE paid_at END
         WHERE id = $2 RETURNING *`,
        [status, body.orderId],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Pedido não encontrado.' });
      return json(res, 200, { order: result.rows[0] });
    }

    if (url.pathname === '/api/admin/commerce/contracts' && req.method === 'PATCH') {
      const body = await readJson(req);
      const status = String(body.status || '');
      if (!['activation_pending', 'subscription_pending', 'active', 'failed', 'cancelled'].includes(status)) {
        return json(res, 400, { error: 'Status de contrato inválido.' });
      }
      const result = await client.query(
        `UPDATE public.commercial_plan_contracts SET status = $1, updated_at = NOW(),
           activated_at = CASE WHEN $1 = 'active' THEN COALESCE(activated_at, NOW()) ELSE activated_at END
         WHERE id = $2 RETURNING *`, [status, body.contractId],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Contrato não encontrado.' });
      return json(res, 200, { contract: result.rows[0] });
    }

    if (url.pathname === '/api/commerce/webhook' && req.method === 'POST') {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const body = await readJson(req);
      const resourceId = String(body.data?.id || url.searchParams.get('data.id') || '');
      const eventType = String(body.type || url.searchParams.get('type') || '');
      if (!resourceId || !['payment', 'subscription_preapproval'].includes(eventType)) return json(res, 200, { status: 'ignored' });
      const lookupUrl = eventType === 'payment'
        ? `https://api.mercadopago.com/v1/payments/${encodeURIComponent(resourceId)}`
        : `https://api.mercadopago.com/preapproval/${encodeURIComponent(resourceId)}`;
      const providerResponse = await fetch(lookupUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!providerResponse.ok) return json(res, 502, { error: 'Não foi possível validar o evento.' });
      const providerData = await providerResponse.json();
      const externalReference = String(providerData.external_reference || '');
      if (externalReference.startsWith('contract:') && eventType === 'payment') {
        const [, contractId, phase] = externalReference.split(':');
        if (phase !== 'activation' || providerData.status !== 'approved') return json(res, 200, { status: 'pending' });
        const contractResult = await client.query(
          `SELECT c.*, p.email AS customer_email FROM public.commercial_plan_contracts c
           JOIN public.profiles p ON p.id = c.user_id WHERE c.id = $1`, [contractId],
        );
        const contract = contractResult.rows[0];
        if (!contract) return json(res, 404, { error: 'Contrato não encontrado.' });
        if (providerData.currency_id !== 'BRL' || Math.round(Number(providerData.transaction_amount) * 100) !== contract.activation_amount_cents) {
          throw new Error('Valor de ativação divergente.');
        }
        if (contract.status !== 'activation_pending') return json(res, 200, { status: 'already_processed' });
        const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
        const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
        const subscriptionResponse = await fetch('https://api.mercadopago.com/preapproval', {
          method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `nextia-subscription-${contractId}` },
          body: JSON.stringify({ reason: contract.plan_name, external_reference: `contract:${contractId}:subscription`, payer_email: contract.customer_email, back_url: `${baseUrl}/checkout?status=subscription&contract=${contractId}`, notification_url: `${baseUrl}/api/commerce/webhook`, auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: contract.monthly_amount_cents / 100, currency_id: 'BRL' } }),
        });
        const subscription = await subscriptionResponse.json();
        if (!subscriptionResponse.ok || !subscription.init_point) throw new Error('Falha ao criar assinatura após ativação.');
        await client.query(
          `UPDATE public.commercial_plan_contracts SET status = 'subscription_pending', activation_payment_id = $2,
             subscription_id = $3, subscription_checkout_url = $4, updated_at = NOW() WHERE id = $1`,
          [contractId, resourceId, String(subscription.id), subscription.init_point],
        );
        return json(res, 200, { status: 'activation_confirmed' });
      }
      if (externalReference.startsWith('contract:') && eventType === 'subscription_preapproval') {
        const [, contractId, phase] = externalReference.split(':');
        if (phase !== 'subscription') return json(res, 200, { status: 'ignored' });
        const active = providerData.status === 'authorized';
        await client.query('BEGIN');
        try {
          const contractResult = await client.query(
            `UPDATE public.commercial_plan_contracts SET status = $2, subscription_id = $3,
               activated_at = CASE WHEN $2 = 'active' THEN COALESCE(activated_at, NOW()) ELSE activated_at END, updated_at = NOW()
             WHERE id = $1 RETURNING *`, [contractId, active ? 'active' : 'subscription_pending', resourceId],
          );
          const contract = contractResult.rows[0];
          if (active && contract) {
            const quotaMap = { start: 1, pro: 2, business: 4 };
            const quota = quotaMap[contract.plan_id] || 1;
            const projectResult = await client.query(
              `INSERT INTO public.projects
                (user_id, name, segment, status, plan, monthly_fee, activation_fee,
                 estimated_delivery, requests_remaining, requests_total, source_contract_id)
               VALUES ($1,$2,'Geral','aguardando-briefing',$3,$4,$5,NOW() + INTERVAL '14 days',$6,$6,$7)
               ON CONFLICT (source_contract_id) WHERE source_contract_id IS NOT NULL DO NOTHING
               RETURNING id`,
              [contract.user_id, `Projeto ${contract.plan_name}`, contract.plan_name.replace(/^Nextia\s+/i, ''),
                contract.monthly_amount_cents / 100, contract.activation_amount_cents / 100, quota, contract.id],
            );
            if (projectResult.rows[0]) {
              const projectId = projectResult.rows[0].id;
              const milestones = [
                ['Briefing recebido', 'Formulário e materiais recebidos.', 0, 2],
                ['Design aprovado', 'Estrutura visual aprovada.', 1, 5],
                ['Desenvolvimento', 'Construção e integrações.', 2, 10],
                ['Revisão do cliente', 'Validação antes da publicação.', 3, 12],
                ['Publicação', 'Publicação no domínio contratado.', 4, 14],
              ];
              for (const [title, description, position, days] of milestones) {
                await client.query(
                  `INSERT INTO public.milestones(project_id,title,description,position,estimated_at)
                   VALUES ($1,$2,$3,$4,NOW() + ($5 || ' days')::interval)`,
                  [projectId, title, description, position, days],
                );
              }
              await client.query(
                `INSERT INTO public.notifications(user_id,title,message,type)
                 VALUES ($1,'Plano ativado',$2,'project')`,
                [contract.user_id, `${contract.plan_name} foi ativado. Preencha o briefing para iniciar o projeto.`],
              );
            }
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
        return json(res, 200, { status: active ? 'active' : 'pending' });
      }
      if (!externalReference.startsWith('order:')) return json(res, 200, { status: 'ignored' });
      const orderId = externalReference.slice(6);
      const orderResult = await client.query('SELECT * FROM public.commercial_orders WHERE id = $1 FOR UPDATE', [orderId]);
      const order = orderResult.rows[0];
      if (!order) return json(res, 404, { error: 'Pedido não encontrado.' });
      if (eventType === 'payment') {
        const amountCents = Math.round(Number(providerData.transaction_amount) * 100);
        if (providerData.currency_id !== 'BRL' || amountCents !== order.amount_cents) throw new Error('Valor ou moeda divergente no pedido comercial.');
      }
      const approved = eventType === 'payment' ? providerData.status === 'approved' : providerData.status === 'authorized';
      await client.query(
        `UPDATE public.commercial_orders SET status = $2, provider_payment_id = $3,
           paid_at = CASE WHEN $2 IN ('paid','active') THEN COALESCE(paid_at, NOW()) ELSE paid_at END, updated_at = NOW()
         WHERE id = $1`,
        [orderId, approved ? (order.recurring ? 'active' : 'paid') : 'payment_pending', resourceId],
      );
      return json(res, 200, { status: approved ? 'confirmed' : 'pending' });
    }
    return json(res, 405, { error: 'Método não permitido.' });
  } finally {
    await client.end();
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
  ['/api/admin/assign-support-ticket', 'POST'],
  ['/api/technician/tickets', 'GET'],
  ['/api/technician/update-ticket', 'POST'],
  ['/api/technician/resources', 'GET'],
  ['/api/technician/equipment', 'GET'],
  ['/api/admin/technical-resources', 'GET'],
  ['/api/admin/technical-resources/save', 'POST'],
  ['/api/admin/technical-resources/delete', 'POST'],
  ['/api/admin/equipment', 'GET'],
  ['/api/admin/equipment/save', 'POST'],
  ['/api/admin/equipment/delete', 'POST'],
  ['/api/client/equipment', 'GET'],
  ['/api/admin/backup/create', 'POST'],
  ['/api/admin/backup/export', 'POST'],
  ['/api/admin/backup/list', 'GET'],
  ['/api/admin/backup/download', 'GET'],
  ['/api/admin/backup/download-file', 'GET'],
  ['/api/admin/backup/restore', 'POST'],
  ['/api/admin/backup/rollback', 'POST'],
  ['/api/admin/backup/delete', 'POST'],
  ['/api/admin/backup/logs', 'GET'],
  ['/api/admin/users', 'GET'],
  ['/api/admin/update-user', 'POST'],
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

      const [result, technicians] = await Promise.all([client.query(
        `SELECT id, name, email, phone, company, subject, message, status,
                created_at, resolved_at, user_id, assigned_technician_id, priority,
                technical_notes, started_at
         FROM public.support_tickets
         ORDER BY created_at DESC`,
      ), client.query(`SELECT id, name, email FROM public.profiles WHERE role = 'technician' ORDER BY name`)]);
      return json(res, 200, { tickets: result.rows, technicians: technicians.rows });
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

    if (url.pathname === '/api/admin/assign-support-ticket') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const body = await readJson(req);
      const technicianId = body.technicianId || null;
      if (technicianId) {
        const technician = await client.query(`SELECT 1 FROM public.profiles WHERE id = $1 AND role = 'technician'`, [technicianId]);
        if (!technician.rows[0]) return json(res, 400, { error: 'Técnico inválido.' });
      }
      const result = await client.query(
        `UPDATE public.support_tickets SET assigned_technician_id = $1, priority = $2,
           started_at = CASE WHEN $1::uuid IS NOT NULL THEN COALESCE(started_at, NOW()) ELSE started_at END
         WHERE id = $3 RETURNING id, assigned_technician_id, priority, started_at`,
        [technicianId, ['baixa','normal','alta','urgente'].includes(body.priority) ? body.priority : 'normal', body.ticketId],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Chamado não encontrado.' });
      return json(res, 200, { ticket: result.rows[0] });
    }

    if (url.pathname === '/api/technician/tickets') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'technician') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para técnicos.' });
      const result = await client.query(
        `SELECT id, name, company, phone, subject, message, status, priority, technical_notes,
                created_at, started_at, resolved_at
         FROM public.support_tickets WHERE assigned_technician_id = $1 ORDER BY
           CASE priority WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END, created_at`,
        [sessionProfile.id],
      );
      return json(res, 200, { tickets: result.rows });
    }

    if (url.pathname === '/api/technician/update-ticket') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'technician') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para técnicos.' });
      const body = await readJson(req);
      if (!['aberto','respondido','fechado'].includes(body.status)) return json(res, 400, { error: 'Status inválido.' });
      const result = await client.query(
        `UPDATE public.support_tickets SET status = $1, technical_notes = $2,
           resolved_at = CASE WHEN $1 = 'fechado' THEN NOW() ELSE NULL END,
           started_at = COALESCE(started_at, NOW())
         WHERE id = $3 AND assigned_technician_id = $4
         RETURNING id, status, technical_notes, resolved_at, started_at`,
        [body.status, String(body.technicalNotes || '').trim().slice(0, 10000) || null, body.ticketId, sessionProfile.id],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Chamado não encontrado ou não atribuído a você.' });
      return json(res, 200, { ticket: result.rows[0] });
    }

    if (url.pathname === '/api/technician/resources') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'technician') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para técnicos.' });
      const result = await client.query(
        `SELECT id, name, description, category, platform, version, url
         FROM public.technical_resources WHERE active = TRUE ORDER BY category, sort_order, name`,
      );
      return json(res, 200, { resources: result.rows });
    }

    if (url.pathname === '/api/technician/equipment') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'technician') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para técnicos.' });
      const result = await client.query(
        `SELECT DISTINCT e.*, p.name AS customer_name, p.company AS customer_company
         FROM public.customer_equipment e
         JOIN public.profiles p ON p.id = e.user_id
         JOIN public.support_tickets t ON t.user_id = e.user_id
         WHERE t.assigned_technician_id = $1
         ORDER BY p.name, e.name`, [sessionProfile.id],
      );
      return json(res, 200, { equipment: result.rows });
    }

    if (url.pathname === '/api/admin/technical-resources') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const result = await client.query('SELECT * FROM public.technical_resources ORDER BY category, sort_order, name');
      return json(res, 200, { resources: result.rows });
    }

    if (url.pathname === '/api/admin/technical-resources/save') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const body = await readJson(req);
      if (!String(body.name || '').trim() || !['tool','driver','document'].includes(body.category) || !/^https?:\/\//i.test(String(body.url || ''))) {
        return json(res, 400, { error: 'Nome, categoria e URL HTTP(S) válida são obrigatórios.' });
      }
      const result = body.id
        ? await client.query(
            `UPDATE public.technical_resources SET name=$1,description=$2,category=$3,platform=$4,version=$5,url=$6,active=$7,sort_order=$8,updated_at=NOW()
             WHERE id=$9 RETURNING *`, [body.name.trim(), String(body.description || '').trim(), body.category, String(body.platform || 'Todos').trim(), String(body.version || '').trim() || null, body.url.trim(), body.active !== false, Number(body.sortOrder || 0), body.id])
        : await client.query(
            `INSERT INTO public.technical_resources(name,description,category,platform,version,url,active,sort_order,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [body.name.trim(), String(body.description || '').trim(), body.category, String(body.platform || 'Todos').trim(), String(body.version || '').trim() || null, body.url.trim(), body.active !== false, Number(body.sortOrder || 0), sessionProfile.id]);
      if (!result.rows[0]) return json(res, 404, { error: 'Recurso não encontrado.' });
      return json(res, 200, { resource: result.rows[0] });
    }

    if (url.pathname === '/api/admin/technical-resources/delete') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      await client.query('DELETE FROM public.technical_resources WHERE id = $1', [(await readJson(req)).id]);
      return json(res, 200, { status: 'success' });
    }

    if (url.pathname === '/api/admin/equipment') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const result = await client.query(`SELECT e.*, p.name AS customer_name, p.email AS customer_email FROM public.customer_equipment e JOIN public.profiles p ON p.id=e.user_id ORDER BY p.name,e.name`);
      const customers = await client.query(`SELECT id,name,email,company FROM public.profiles WHERE role='client' ORDER BY name`);
      return json(res, 200, { equipment: result.rows, customers: customers.rows });
    }

    if (url.pathname === '/api/admin/equipment/save') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const body = await readJson(req);
      if (!body.userId || !String(body.name || '').trim() || !String(body.equipmentType || '').trim()) return json(res, 400, { error: 'Cliente, nome e tipo são obrigatórios.' });
      const values = [body.userId, body.name.trim(), body.equipmentType.trim(), String(body.manufacturer || '').trim() || null, String(body.model || '').trim() || null, String(body.serialNumber || '').trim() || null, String(body.operatingSystem || '').trim() || null, String(body.notes || '').trim() || null, ['active','maintenance','retired'].includes(body.status) ? body.status : 'active'];
      const result = body.id
        ? await client.query(`UPDATE public.customer_equipment SET user_id=$1,name=$2,equipment_type=$3,manufacturer=$4,model=$5,serial_number=$6,operating_system=$7,notes=$8,status=$9,updated_at=NOW() WHERE id=$10 RETURNING *`, [...values, body.id])
        : await client.query(`INSERT INTO public.customer_equipment(user_id,name,equipment_type,manufacturer,model,serial_number,operating_system,notes,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, values);
      if (!result.rows[0]) return json(res, 404, { error: 'Equipamento não encontrado.' });
      return json(res, 200, { equipment: result.rows[0] });
    }

    if (url.pathname === '/api/admin/equipment/delete') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      await client.query('DELETE FROM public.customer_equipment WHERE id = $1', [(await readJson(req)).id]);
      return json(res, 200, { status: 'success' });
    }

    if (url.pathname === '/api/client/equipment') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile || sessionProfile.role !== 'client') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para clientes.' });
      const result = await client.query(
        `SELECT id,name,equipment_type,manufacturer,model,serial_number,operating_system,status,notes,updated_at
         FROM public.customer_equipment WHERE user_id=$1 ORDER BY name`, [sessionProfile.id],
      );
      return json(res, 200, { equipment: result.rows });
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

    if (url.pathname === '/api/admin/users') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuário não autenticado.' });
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

      await ensurePartnerSchema(client);
      const result = await client.query(`
        SELECT p.id, p.email, p.name, p.company, p.phone, p.avatar_initials, p.created_at,
               CASE
                 WHEN p.role IN ('admin', 'technician') THEN p.role
                 WHEN pp.id IS NOT NULL THEN 'partner'
                 ELSE 'client'
               END AS role,
               pp.status AS partner_status,
               pp.decision_reason AS partner_decision_reason
        FROM public.profiles p
        LEFT JOIN public.partner_profiles pp ON pp.user_id = p.id
        ORDER BY p.name NULLS LAST, p.email
      `);
      return json(res, 200, { users: result.rows });
    }

    if (url.pathname === '/api/admin/update-user') {
      const sessionProfile = await getSessionProfile(req, client);
      if (!sessionProfile) return json(res, 401, { error: 'Usuário não autenticado.' });
      if (sessionProfile.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });

      const body = await readJson(req);
      const targetUserId = String(body.targetUserId || '');
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const role = String(body.role || 'client');
      const password = String(body.password || '');
      if (!targetUserId || !name || !email) {
        return json(res, 400, { error: 'Usuário, nome e e-mail são obrigatórios.' });
      }
      if (!['client', 'admin', 'partner', 'technician'].includes(role)) {
        return json(res, 400, { error: 'Perfil de acesso inválido.' });
      }
      if (password && password.length < 6) {
        return json(res, 400, { error: 'A nova senha deve conter ao menos 6 caracteres.' });
      }

      await client.query('BEGIN');
      try {
        const result = await client.query(
          `UPDATE public.profiles
           SET name = $1, email = $2, company = $3, phone = $4,
               role = CASE WHEN $5 IN ('admin', 'technician') THEN $5 ELSE 'client' END
           WHERE id = $6
           RETURNING id, email, name, company, phone, role, avatar_initials, created_at`,
          [name, email, String(body.company || '').trim(), String(body.phone || '').trim(), role, targetUserId],
        );
        if (!result.rows[0]) {
          await client.query('ROLLBACK');
          return json(res, 404, { error: 'Usuário não encontrado.' });
        }
        if (password) {
          await client.query(
            `UPDATE public.local_auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
            [hashPassword(password), targetUserId],
          );
        }
        await client.query('COMMIT');
        return json(res, 200, { status: 'success', user: result.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        if (String(error.message || '').includes('duplicate')) {
          return json(res, 409, { error: 'Este e-mail já está em uso.' });
        }
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
        storage_provider TEXT NOT NULL DEFAULT 'minio',
        storage_account TEXT,
        storage_asset_id TEXT,
        storage_public_id TEXT,
        storage_version BIGINT,
        status TEXT DEFAULT 'PENDING',
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS error_message TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS error_details TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'minio';
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS storage_account TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS storage_asset_id TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS storage_public_id TEXT;
      ALTER TABLE public.backups ADD COLUMN IF NOT EXISTS storage_version BIGINT;
      CREATE SEQUENCE IF NOT EXISTS public.backup_storage_rotation_seq;

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
        const { stdout: pgDumpVersionOutput } = await execFileAsync('pg_dump', ['--version']);
        const pgDumpVersionMatch = pgDumpVersionOutput.match(/PostgreSQL\)\s+(\d+)/i);
        if (!pgDumpVersionMatch) {
          throw new Error(`Não foi possível identificar a versão do pg_dump: ${pgDumpVersionOutput.trim()}`);
        }

        const serverVersionResult = await client.query(
          `SELECT current_setting('server_version_num')::int AS version_num,
                  current_setting('server_version') AS version`,
        );
        const pgDumpMajor = Number(pgDumpVersionMatch[1]);
        const serverVersion = serverVersionResult.rows[0];
        const serverMajor = Math.floor(Number(serverVersion.version_num) / 10000);
        if (pgDumpMajor < serverMajor) {
          throw new Error(
            `pg_dump ${pgDumpMajor} é incompatível com o servidor PostgreSQL ${serverVersion.version}. `
            + `Instale pg_dump ${serverMajor} ou superior no container.`,
          );
        }

        const writeProbe = join(workspace, '.write-check');
        await writeFile(writeProbe, 'ok');
        await access(writeProbe);

        const archiveProbe = buildTarGzArchive([{ path: 'healthcheck.txt', data: 'nextia backup preflight' }]);
        if (archiveProbe.length === 0) throw new Error('A geração de TAR.GZ produziu um arquivo vazio.');
        const checksumProbe = createHash('sha256').update(archiveProbe).digest('hex');
        if (!/^[a-f0-9]{64}$/.test(checksumProbe)) throw new Error('Não foi possível calcular SHA256 do arquivo de teste.');

        const accounts = await selectCloudinaryBackupAccount(client);
        const failures = [];
        for (const account of accounts) {
          const probePath = join(workspace, `cloudinary-probe-${account.index}.txt`);
          const probePublicId = `nextia-backups/healthchecks/${randomUUID()}.txt`;
          const probePayload = Buffer.from(`nextia-backup-preflight:${new Date().toISOString()}`);
          let uploaded;
          try {
            await writeFile(probePath, probePayload);
            uploaded = await cloudinaryUploadFile(account, probePath, probePublicId);
            const downloaded = await cloudinaryDownloadAsset(account, {
              storage_public_id: uploaded.public_id || probePublicId,
              storage_version: uploaded.version,
            });
            if (!downloaded.equals(probePayload)) throw new Error('O arquivo de teste retornou com conteúdo divergente.');
            await cloudinaryDeleteAsset(account, uploaded.public_id || probePublicId);
            return account;
          } catch (error) {
            if (uploaded) {
              await cloudinaryDeleteAsset(account, uploaded.public_id || probePublicId).catch(() => undefined);
            }
            failures.push(`${account.cloudName}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        throw new Error(`Nenhuma conta Cloudinary passou na validação de upload: ${failures.join(' | ')}`);
      } finally {
        await rm(workspace, { recursive: true, force: true });
      }
    };

    const generatePostgresDump = async (workspace) => {
      const dumpPath = join(workspace, 'database.sql');
      await execFileAsync('pg_dump', [
        '--no-owner',
        '--no-privileges',
        '--clean',
        '--if-exists',
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

      let selectedStorageAccount;
      try {
        selectedStorageAccount = await validateBackupPreflight();
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
      const objectKey = `nextia-backups/${randomUUID()}/${filename}`;

      // Insere registro no banco com status PENDING
      const insertRes = await client.query(
        `INSERT INTO public.backups
           (filename, object_key, size, backup_type, storage_provider, storage_account, status, created_by)
         VALUES ($1, $2, $3, $4, 'cloudinary', $5, $6, $7) RETURNING id`,
        [filename, objectKey, 0, 'full', selectedStorageAccount.cloudName, 'PENDING', sessionProfile.email]
      );
      const backupId = insertRes.rows[0].id;
      await logAuditAction(backupId, 'BACKUP_STARTED', sessionProfile.email, 'Início do backup após pré-validação completa.');

      let workspace;
      let uploadedCloudinaryAsset;
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

        currentStage = 'UPLOADING_TO_CLOUDINARY';
        await client.query(`UPDATE public.backups SET status = $1, updated_at = NOW() WHERE id = $2`, [currentStage, backupId]);
        await logAuditAction(
          backupId,
          'CLOUDINARY_UPLOAD_STARTED',
          sessionProfile.email,
          `Enviando ${objectKey} para a conta ${selectedStorageAccount.cloudName}.`,
        );
        const archivePath = join(workspace, filename);
        await writeFile(archivePath, tarGzBuffer);
        uploadedCloudinaryAsset = await cloudinaryUploadFile(selectedStorageAccount, archivePath, objectKey);

        // Validate that Cloudinary returned essential metadata
        if (!uploadedCloudinaryAsset.public_id || !uploadedCloudinaryAsset.asset_id || !uploadedCloudinaryAsset.version) {
          console.error('[BACKUP] Cloudinary retornou metadados incompletos:', JSON.stringify({
            public_id: uploadedCloudinaryAsset.public_id,
            asset_id: uploadedCloudinaryAsset.asset_id,
            version: uploadedCloudinaryAsset.version,
          }));
          throw new Error('Cloudinary não retornou public_id, asset_id ou version após o upload.');
        }

        await client.query(
          `UPDATE public.backups
           SET status = 'COMPLETED', storage_asset_id = $2, storage_public_id = $3,
               storage_version = $4, error_message = NULL, error_details = NULL, updated_at = NOW()
           WHERE id = $1`,
          [backupId, uploadedCloudinaryAsset.asset_id, uploadedCloudinaryAsset.public_id, uploadedCloudinaryAsset.version],
        );
        await logAuditAction(
          backupId,
          'BACKUP_COMPLETED',
          sessionProfile.email,
          `Fim backup na conta ${selectedStorageAccount.cloudName}. Tamanho: ${tarGzBuffer.length} bytes; SHA256: ${checksum}`,
        );

        try {
          const activeBackups = (await client.query(
            `SELECT * FROM public.backups WHERE status = 'COMPLETED' ORDER BY created_at ASC`,
          )).rows;
          for (const oldBackup of activeBackups.slice(0, Math.max(0, activeBackups.length - 30))) {
            await deleteBackupObject(oldBackup);
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
        if (uploadedCloudinaryAsset) {
          await cloudinaryDeleteAsset(
            selectedStorageAccount,
            uploadedCloudinaryAsset.public_id || objectKey,
          ).catch((cleanupError) => console.error('[BACKUP] CLOUDINARY_ORPHAN_CLEANUP_FAILED', cleanupError));
        }
        const details = error instanceof Error ? error.stack || error.message : String(error);
        const stageLabels = {
          GENERATING_DATABASE: 'Falha pg_dump',
          GENERATING_ARCHIVE: 'Falha TAR.GZ',
          CALCULATING_CHECKSUM: 'Falha SHA256',
          UPLOADING_TO_CLOUDINARY: 'Falha Upload Cloudinary',
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
          storage_provider: b.storage_provider,
          storage_account: b.storage_account,
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
        fileBuffer = await downloadBackupObject(b);
      } catch (error) {
        console.error('[BACKUP] STORAGE_DOWNLOAD_FAILED', error);
        return json(res, 502, { error: 'Não foi possível recuperar o arquivo no armazenamento configurado.' });
      }
      const computedChecksum = createHash('sha256').update(fileBuffer).digest('hex');
      if (computedChecksum !== b.checksum) {
        return json(res, 409, { error: 'Falha de integridade: SHA256 do arquivo armazenado não confere.' });
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

      let restoreWorkspace;
      try {
          restoreWorkspace = await createBackupWorkspace();
          const fileBuf = await downloadBackupObject(b);
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

          // O psql interpreta corretamente funções, COPY e demais comandos do pg_dump.
          const restoreSqlPath = join(restoreWorkspace, 'database.sql');
          await writeFile(restoreSqlPath, sqlDumpEntry.data);
          await execFileAsync('psql', [
            '--single-transaction',
            '--set', 'ON_ERROR_STOP=on',
            '--file', restoreSqlPath,
            process.env.DATABASE_URL,
          ]);

          // Restaura Arquivos Persistentes
          for (const file of extractedFiles) {
            if (file.path.startsWith('files/')) {
              const relativeTarget = file.path.replace(/^files\//, '');
              const restoreRoot = normalize(`${process.cwd()}/`);
              const fullTarget = normalize(join(restoreRoot, relativeTarget));
              if (!fullTarget.startsWith(restoreRoot)) {
                throw new Error(`Caminho inválido dentro do backup: ${file.path}`);
              }
              const parentDir = join(fullTarget, '..');
              if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });
              writeFileSync(fullTarget, file.data);
            }
          }

          await client.query(`UPDATE public.backups SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [backupId]);
          await logAuditAction(backupId, 'RESTORE_COMPLETED', sessionProfile.email, 'Restauração concluída com sucesso!');
          return json(res, 200, {
            ok: true,
            message: 'Restauração concluída e validada.',
            status: 'COMPLETED',
          });
        } catch (err) {
          console.error('[RESTORE ROLLBACK TRIGGERED]', err);
          const details = err instanceof Error ? err.stack || err.message : String(err);
          await client.query(
            `UPDATE public.backups
             SET status = 'FAILED', error_message = 'Falha na restauração', error_details = $2, updated_at = NOW()
             WHERE id = $1`,
            [backupId, details],
          );
          await logAuditAction(backupId, 'RESTORE_FAILED', sessionProfile.email, `Rollback ativado: ${err instanceof Error ? err.message : String(err)}`);
          return json(res, 500, { error: 'Falha na restauração do backup.', backupId });
        } finally {
          if (restoreWorkspace) await rm(restoreWorkspace, { recursive: true, force: true });
        }
    }

    // Endpoint 6: Excluir Backup no provedor original + atualizar banco e logs
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

      if (b.status === 'COMPLETED') await deleteBackupObject(b);

      // Delete backup record from database permanently
      await client.query(`DELETE FROM public.backups WHERE id = $1`, [backupId]);

      await logAuditAction(backupId, 'BACKUP_DELETED', sessionProfile.email, 'Backup removido permanentemente pelo admin');

      return json(res, 200, { ok: true, message: 'Backup excluído permanentemente.' });
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
        CREATE TABLE IF NOT EXISTS public.partner_materials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL,
          cloudinary_account TEXT NOT NULL,
          cloudinary_asset_id TEXT,
          cloudinary_public_id TEXT NOT NULL,
          resource_type TEXT NOT NULL DEFAULT 'raw',
          format TEXT NOT NULL DEFAULT 'bin',
          bytes BIGINT NOT NULL DEFAULT 0,
          secure_url TEXT NOT NULL,
          thumbnail_url TEXT,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS partner_materials_active_order_idx
          ON public.partner_materials(active, sort_order, created_at DESC);
        ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS decision_reason TEXT;
        ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
        ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS reviewed_by UUID;
        ALTER TABLE public.partner_referrals ADD COLUMN IF NOT EXISTS referred_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        ALTER TABLE public.partner_commissions ADD COLUMN IF NOT EXISTS payment_id UUID;
        CREATE UNIQUE INDEX IF NOT EXISTS partner_referrals_referred_user_uidx
          ON public.partner_referrals (referred_user_id)
          WHERE referred_user_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS partner_commissions_payment_uidx
          ON public.partner_commissions (payment_id)
          WHERE payment_id IS NOT NULL;
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
  ['/api/partner/materials', 'GET'],
  ['/api/partner/update-profile', 'POST'],
  ['/api/partner/request-withdrawal', 'POST'],
  ['/api/admin/partners', 'GET'],
  ['/api/admin/partner-commissions', 'GET'],
  ['/api/admin/partner-withdrawals', 'GET'],
  ['/api/admin/update-withdrawal', 'POST'],
  ['/api/admin/update-partner', 'POST'],
  ['/api/admin/partner-materials', 'GET'],
  ['/api/admin/partner-materials/save', 'POST'],
  ['/api/admin/partner-materials/delete', 'POST'],
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
        await client.query(`
          WITH referral_counts AS (
            SELECT pp.id,
                   COUNT(referral.id) FILTER (WHERE referral.status = 'ativo') AS active_count
            FROM public.partner_profiles pp
            LEFT JOIN public.partner_referrals referral ON referral.partner_id = pp.id
            GROUP BY pp.id
          )
          UPDATE public.partner_profiles profile
          SET level = CASE
            WHEN counts.active_count >= 51 THEN 'elite'
            WHEN counts.active_count >= 31 THEN 'diamante'
            WHEN counts.active_count >= 16 THEN 'ouro'
            WHEN counts.active_count >= 6 THEN 'prata'
            ELSE 'bronze'
          END,
          updated_at = NOW()
          FROM referral_counts counts
          WHERE counts.id = profile.id
        `);

        const result = await client.query(`
          SELECT pp.id, pp.user_id as "userId", pr.name, pr.email, pr.phone as whatsapp, 
                 pp.cpf_cnpj as "cpfCnpj", pp.pix_key as "pixKey", pp.referral_code as "referralCode", 
                 pp.level, pp.status, pp.decision_reason as "decisionReason",
                 pp.reviewed_at as "reviewedAt", pp.created_at as "createdAt",
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id) as "totalReferrals",
                 (SELECT COUNT(*) FROM public.partner_referrals r WHERE r.partner_id = pp.id AND r.status = 'ativo') as "activeReferrals",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id) as "totalCommission",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id AND c.status = 'pendente') as "pendingBalance",
                 (SELECT COALESCE(SUM(c.commission_value), 0) FROM public.partner_commissions c WHERE c.partner_id = pp.id AND c.status = 'confirmado') - 
                 (SELECT COALESCE(SUM(w.amount), 0) FROM public.partner_withdrawals w WHERE w.partner_id = pp.id AND w.status IN ('pendente', 'pago')) as "availableBalance",
                 (SELECT COALESCE(SUM(w.amount), 0) FROM public.partner_withdrawals w WHERE w.partner_id = pp.id AND w.status = 'pago') as "paidWithdrawals",
                 COALESCE((
                   SELECT json_agg(json_build_object(
                     'id', referral.id,
                     'partnerId', referral.partner_id,
                     'clientName', referral.client_name,
                     'clientCompany', referral.client_company,
                     'plan', referral.plan,
                     'monthlyFee', referral.monthly_fee,
                     'status', referral.status,
                     'commissionRate', referral.commission_rate,
                     'commissionGenerated', referral.commission_generated,
                     'startDate', referral.start_date,
                     'lastPaymentDate', referral.last_payment_date
                   ) ORDER BY referral.start_date DESC)
                   FROM public.partner_referrals referral WHERE referral.partner_id = pp.id
                 ), '[]'::json) as referrals
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
        const id = String(body.id || '');
        const status = String(body.status || '');
        const reason = String(body.reason || '').trim();
        if (!id || !['ativo', 'pendente', 'suspenso', 'recusado'].includes(status)) {
          return json(res, 400, { error: 'Parceiro ou status inválido.' });
        }
        if (status === 'recusado' && reason.length < 3) {
          return json(res, 400, { error: 'Informe o motivo da recusa.' });
        }

        const result = await client.query(
          `UPDATE public.partner_profiles
           SET status = $1, decision_reason = $2, reviewed_at = NOW(), reviewed_by = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING id, status, decision_reason as "decisionReason", reviewed_at as "reviewedAt"`,
          [status, reason || null, sessionProfile.id, id],
        );
        if (!result.rows[0]) return json(res, 404, { error: 'Parceiro não encontrado.' });
        return json(res, 200, { status: 'success', partner: result.rows[0] });
      }

      if (url.pathname === '/api/admin/partner-materials') {
        const result = await client.query(`
          SELECT id, title, description, category, format as "fileType", bytes,
                 secure_url as "downloadUrl", thumbnail_url as thumbnail,
                 active, sort_order as "sortOrder", created_at as "createdAt",
                 cloudinary_account as "storageAccount"
          FROM public.partner_materials
          ORDER BY sort_order, created_at DESC
        `);
        return json(res, 200, {
          materials: result.rows.map((item) => ({ ...item, fileSize: formatByteSize(Number(item.bytes)) })),
        });
      }

      if (url.pathname === '/api/admin/partner-materials/save') {
        const body = await readJson(req);
        const id = String(body.id || '');
        const title = String(body.title || '').trim();
        const description = String(body.description || '').trim();
        const category = String(body.category || '');
        const allowedCategories = ['instagram', 'facebook', 'stories', 'reels', 'whatsapp', 'video', 'pdf', 'logo'];
        if (!title || !allowedCategories.includes(category)) {
          return json(res, 400, { error: 'Título e categoria válida são obrigatórios.' });
        }

        if (id) {
          const result = await client.query(
            `UPDATE public.partner_materials
             SET title = $1, description = $2, category = $3, active = $4,
                 sort_order = $5, updated_at = NOW()
             WHERE id = $6 RETURNING id`,
            [title, description, category, body.active !== false, Number(body.sortOrder || 0), id],
          );
          if (!result.rows[0]) return json(res, 404, { error: 'Material não encontrado.' });
          return json(res, 200, { status: 'success', id });
        }

        if (!body.fileData || !body.fileName) {
          return json(res, 400, { error: 'Selecione o arquivo do material.' });
        }
        const uploaded = await uploadMarketingMaterial(body.fileData, body.fileName);
        const thumbnail = uploaded.resourceType === 'image' ? uploaded.secureUrl : null;
        try {
          const result = await client.query(
            `INSERT INTO public.partner_materials
               (title, description, category, cloudinary_account, cloudinary_asset_id,
                cloudinary_public_id, resource_type, format, bytes, secure_url,
                thumbnail_url, active, sort_order, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING id`,
            [title, description, category, uploaded.account.cloudName, uploaded.assetId,
              uploaded.publicId, uploaded.resourceType, uploaded.format, uploaded.bytes,
              uploaded.secureUrl, thumbnail, body.active !== false, Number(body.sortOrder || 0), sessionProfile.id],
          );
          return json(res, 201, { status: 'success', id: result.rows[0].id });
        } catch (error) {
          await cloudinaryDeleteAsset(uploaded.account, uploaded.publicId, {
            resourceType: uploaded.resourceType,
            type: 'upload',
          }).catch(() => undefined);
          throw error;
        }
      }

      if (url.pathname === '/api/admin/partner-materials/delete') {
        const body = await readJson(req);
        const result = await client.query('SELECT * FROM public.partner_materials WHERE id = $1', [body.id]);
        const material = result.rows[0];
        if (!material) return json(res, 404, { error: 'Material não encontrado.' });
        const account = material.cloudinary_account === cloudinaryMaterialsAccount().cloudName
          ? cloudinaryMaterialsAccount()
          : cloudinaryBackupAccounts().find((item) => item.cloudName === material.cloudinary_account);
        if (!account) return json(res, 409, { error: 'A conta Cloudinary deste material não está configurada.' });
        await cloudinaryDeleteAsset(account, material.cloudinary_public_id, {
          resourceType: material.resource_type,
          type: 'upload',
        });
        await client.query('DELETE FROM public.partner_materials WHERE id = $1', [material.id]);
        return json(res, 200, { status: 'success' });
      }
    }

    if (url.pathname.startsWith('/api/partner/')) {
      const profileRes = await client.query(`SELECT * FROM public.partner_profiles WHERE user_id = $1`, [sessionProfile.id]);
      if (profileRes.rows.length === 0) {
        return json(res, 403, { error: 'Esta conta não está cadastrada como parceira.' });
      }
      const partnerProfile = profileRes.rows[0];

      if (!['/api/partner/me', '/api/partner/update-profile'].includes(url.pathname) && partnerProfile.status !== 'ativo') {
        return json(res, 403, { error: 'A conta precisa estar aprovada para acessar este recurso.' });
      }

      if (url.pathname === '/api/partner/me') {
        const profile = {
          id: partnerProfile.id,
          userId: sessionProfile.id,
          name: sessionProfile.name,
          email: sessionProfile.email,
          whatsapp: sessionProfile.phone || '',
          cpfCnpj: partnerProfile.cpf_cnpj || '',
          pixKey: partnerProfile.pix_key || '',
          referralCode: partnerProfile.referral_code,
          level: partnerProfile.level,
          status: partnerProfile.status,
          decisionReason: partnerProfile.decision_reason || '',
          reviewedAt: partnerProfile.reviewed_at || null,
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
        profile.level = profile.activeReferrals >= 51 ? 'elite'
          : profile.activeReferrals >= 31 ? 'diamante'
          : profile.activeReferrals >= 16 ? 'ouro'
          : profile.activeReferrals >= 6 ? 'prata'
          : 'bronze';
        if (profile.level !== partnerProfile.level) {
          await client.query('UPDATE public.partner_profiles SET level = $1, updated_at = NOW() WHERE id = $2', [profile.level, partnerProfile.id]);
        }
        profile.totalCommission = commissionsRes.rows.reduce((sum, c) => sum + Number(c.commissionValue), 0);
        
        const confirmedCommissions = commissionsRes.rows.filter(c => c.status === 'confirmado').reduce((sum, c) => sum + Number(c.commissionValue), 0);
        const withdrawnAmount = withdrawalsRes.rows.filter(w => w.status === 'pendente' || w.status === 'pago').reduce((sum, w) => sum + Number(w.amount), 0);
        
        profile.availableBalance = Math.max(0, confirmedCommissions - withdrawnAmount);
        profile.pendingBalance = commissionsRes.rows.filter(c => c.status === 'pendente').reduce((sum, c) => sum + Number(c.commissionValue), 0);
        const rankingRes = await client.query(`
          WITH partner_totals AS (
            SELECT candidate.id,
                   COALESCE(SUM(commission.commission_value), 0) AS total
            FROM public.partner_profiles candidate
            LEFT JOIN public.partner_commissions commission ON commission.partner_id = candidate.id
            WHERE candidate.status = 'ativo'
            GROUP BY candidate.id
          ), ranked AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY total DESC, id) AS position
            FROM partner_totals
          )
          SELECT position FROM ranked WHERE id = $1
        `, [partnerProfile.id]);
        profile.rankingPosition = Number(rankingRes.rows[0]?.position || 0);

        return json(res, 200, { 
          profile, 
          referrals: referralsRes.rows, 
          commissions: commissionsRes.rows, 
          withdrawals: withdrawalsRes.rows 
        });
      }

      if (url.pathname === '/api/partner/materials') {
        const result = await client.query(`
          SELECT id, title, description, category, format as "fileType", bytes,
                 secure_url as "downloadUrl", thumbnail_url as thumbnail,
                 sort_order as "sortOrder", created_at as "createdAt"
          FROM public.partner_materials
          WHERE active = TRUE
          ORDER BY sort_order, created_at DESC
        `);
        return json(res, 200, {
          materials: result.rows.map((item) => ({ ...item, fileSize: formatByteSize(Number(item.bytes)) })),
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
        if (!Number.isFinite(amount) || amount < 50) {
          return json(res, 400, { error: 'O valor mínimo para saque é R$ 50,00.' });
        }
        const pixKey = String(partnerProfile.pix_key || body.pixKey || '').trim();
        if (!pixKey) return json(res, 400, { error: 'Cadastre uma chave PIX antes de solicitar o saque.' });

        await client.query('BEGIN');
        try {
          await client.query('SELECT id FROM public.partner_profiles WHERE id = $1 FOR UPDATE', [partnerProfile.id]);
          const commissionsRes = await client.query(`SELECT COALESCE(SUM(commission_value), 0) as total FROM public.partner_commissions WHERE partner_id = $1 AND status = 'confirmado'`, [partnerProfile.id]);
          const withdrawalsRes = await client.query(`SELECT COALESCE(SUM(amount), 0) as total FROM public.partner_withdrawals WHERE partner_id = $1 AND status IN ('pendente', 'pago')`, [partnerProfile.id]);
          const available = Number(commissionsRes.rows[0].total) - Number(withdrawalsRes.rows[0].total);
          if (amount > available) {
            await client.query('ROLLBACK');
            return json(res, 400, { error: 'Saldo insuficiente' });
          }
          await client.query(`
            INSERT INTO public.partner_withdrawals (partner_id, amount, pix_key)
            VALUES ($1, $2, $3)
          `, [partnerProfile.id, amount, pixKey]);
          await client.query('COMMIT');
          return json(res, 200, { status: 'success' });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
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
         RETURNING id, email, name, company, phone, role, avatar_initials, created_at,
                   EXISTS(SELECT 1 FROM public.partner_profiles WHERE user_id = public.profiles.id) as is_partner`,
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
    const trackedReferralCode = String(parseCookies(req).nextia_ref || '').trim();
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
      if (isPartner || trackedReferralCode) {
        await ensurePartnerSchema(client);
      }
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
      if (trackedReferralCode) {
        await client.query(
          `INSERT INTO public.partner_referrals
             (partner_id, referred_user_id, client_name, client_company, plan, status, start_date)
           SELECT pp.id, $2, $3, $4, $5, 'pendente', NOW()
           FROM public.partner_profiles pp
           WHERE pp.referral_code = $1 AND pp.status = 'ativo'
           ON CONFLICT (referred_user_id) WHERE referred_user_id IS NOT NULL DO NOTHING`,
          [trackedReferralCode, id, body.name, body.company || '', body.plan || ''],
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
  const distRoot = resolve(distDir);
  let filePath = resolve(distRoot, `.${requestedPath}`);
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
    return json(res, 403, { error: 'Caminho inválido.' });
  }
  if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
  const ext = extname(filePath);
  const isPrivateRoute = ['/admin', '/painel', '/parceiro', '/tecnico', '/checkout', '/perfil', '/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/suporte/ticket'].some((prefix) => url.pathname.startsWith(prefix));
  const cacheControl = filePath.endsWith('sw.js') || filePath.endsWith('index.html') ? 'no-cache' : /\.[a-f0-9_-]{8,}\.(?:js|css)$/i.test(filePath) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
  res.writeHead(200, {
    ...securityHeaders(),
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
    ...(isPrivateRoute ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
  });
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
    if (isAppApiPath(url.pathname)) {
      return await handleAppApi(req, res, url, { dbClient, ensurePartnerSchema, getSessionProfile, json, readJson });
    }
    if (url.pathname.startsWith('/api/catalog/') || url.pathname.startsWith('/api/admin/catalog') || url.pathname.startsWith('/api/admin/commerce') || url.pathname.startsWith('/api/commerce/')) {
      return await handleCatalogApi(req, res, url);
    }
    if (
      url.pathname.startsWith('/api/partner/') ||
      url.pathname.startsWith('/api/admin/partner') ||
      url.pathname === '/api/admin/update-partner' ||
      url.pathname === '/api/admin/update-withdrawal'
    ) {
      return await handlePartnerApi(req, res, url);
    }
    if (url.pathname.startsWith('/api/support/') || url.pathname.startsWith('/api/admin/') || url.pathname.startsWith('/api/technician/') || url.pathname.startsWith('/api/client/')) {
      return await handleSupportApi(req, res, url);
    }
    if (url.pathname.startsWith('/api/')) {
      return json(res, 404, { error: 'API route not found' });
    }
    // G2: Referral link tracking — /ref/:code
    if (url.pathname.startsWith('/ref/')) {
      const code = url.pathname.replace('/ref/', '').trim();
      if (code) {
        const client = dbClient();
        await client.connect();
        let validReferral = false;
        try {
          await ensurePartnerSchema(client);
          const result = await client.query(
            `SELECT 1 FROM public.partner_profiles WHERE referral_code = $1 AND status = 'ativo'`,
            [code],
          );
          validReferral = result.rowCount > 0;
        } finally {
          await client.end();
        }
        if (!validReferral) {
          res.writeHead(302, { 'Location': '/?ref=invalid' });
          return res.end();
        }
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        res.writeHead(302, {
          'Location': '/?ref=' + encodeURIComponent(code),
          'Set-Cookie': `nextia_ref=${encodeURIComponent(code)}; Path=/; HttpOnly; Max-Age=2592000; SameSite=Lax${secure}`,
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
