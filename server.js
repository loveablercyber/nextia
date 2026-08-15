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
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  let totalBytes = 0;
  const maxBytes = 32 * 1024 * 1024;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) throw httpError(413, 'Corpo da requisição excede o limite permitido.', 'BODY_TOO_LARGE');
    chunks.push(chunk);
  }
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

function featureEnabled(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function httpError(statusCode, message, code = 'VALIDATION_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeDomainName(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  let hostname;
  try {
    hostname = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname;
  } catch {
    throw httpError(400, 'Domínio inválido.', 'INVALID_DOMAIN');
  }
  hostname = hostname.replace(/\.$/, '');
  if (!hostname || hostname.length > 253 || !hostname.includes('.') || !/^[a-z0-9.-]+$/.test(hostname)) {
    throw httpError(400, 'Domínio inválido.', 'INVALID_DOMAIN');
  }
  return hostname;
}

function verifyMercadoPagoSignature(req, resourceId) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  const signature = String(req.headers['x-signature'] || '');
  const requestId = String(req.headers['x-request-id'] || '');
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!parts.ts || !parts.v1 || !requestId || !resourceId) return false;
  const manifest = `id:${String(resourceId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  return secureTextEqual(expected, parts.v1);
}

const WORKFLOW_MILESTONES = {
  website_v1: [
    ['Briefing', 'Informações institucionais recebidas.', 0, 2],
    ['Conteúdo e identidade', 'Materiais e identidade organizados.', 1, 4],
    ['Layout', 'Layout preparado para aprovação.', 2, 7],
    ['Desenvolvimento', 'Site em desenvolvimento.', 3, 10],
    ['Revisão', 'Validação final do cliente.', 4, 12],
    ['Publicação', 'Domínio e publicação concluídos.', 5, 14],
  ],
  landing_page_v1: [
    ['Objetivo e oferta', 'Campanha, público e oferta definidos.', 0, 2],
    ['Copy e design', 'Conteúdo e layout preparados.', 1, 5],
    ['Integrações', 'Formulários e métricas configurados.', 2, 7],
    ['Homologação', 'Eventos e conversão validados.', 3, 9],
    ['Publicação', 'Landing page publicada.', 4, 10],
  ],
  ecommerce_v1: [
    ['Briefing comercial', 'Operação e catálogo inicial recebidos.', 0, 2],
    ['Catálogo', 'Produtos, categorias e variações configurados.', 1, 4],
    ['Pagamento e frete', 'Checkout e logística configurados.', 2, 7],
    ['Layout e homologação', 'Identidade e fluxo de compra validados.', 3, 9],
    ['Treinamento e publicação', 'Equipe orientada e loja publicada.', 4, 10],
  ],
  automation_v1: [
    ['Descoberta', 'Processo atual e resultado desejado mapeados.', 0, 3],
    ['Integrações e regras', 'Sistemas, dados e exceções definidos.', 1, 7],
    ['Implementação', 'Automação construída.', 2, 12],
    ['Homologação', 'Casos de teste aprovados.', 3, 15],
    ['Ativação', 'Operação ativada e monitorada.', 4, 18],
  ],
  whatsapp_bot_v1: [
    ['Qualificação', 'Canal, objetivos e público definidos.', 0, 3],
    ['Fluxos e base', 'Fluxos e base de conhecimento preparados.', 1, 7],
    ['Integrações', 'CRM e webhooks integrados.', 2, 12],
    ['Homologação', 'Mensagens e transferências validadas.', 3, 15],
    ['Ativação', 'Bot ativado com acompanhamento.', 4, 18],
  ],
  custom_system_v1: [
    ['Descoberta', 'Objetivos e usuários mapeados.', 0, 4],
    ['Requisitos', 'Escopo funcional aprovado.', 1, 9],
    ['Protótipo', 'Fluxos e telas homologados.', 2, 15],
    ['Desenvolvimento', 'Sistema em construção.', 3, 25],
    ['Homologação e entrega', 'Aceite e publicação concluídos.', 4, 30],
  ],
};

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
    lastLogin: row.last_login_at || row.created_at || new Date().toISOString(),
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
    await client.query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW()`).catch(() => {});
    await client.query(`UPDATE public.profiles SET last_login_at = NOW() WHERE id = $1 AND (last_login_at IS NULL OR last_login_at < NOW() - INTERVAL '2 minutes')`, [userId]).catch(() => {});
    const result = await client.query(
      `SELECT p.id, p.email, p.name, p.company, p.phone, p.role, p.avatar_initials, p.created_at, p.last_login_at,
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

const TECHNICIAN_ASSIGNMENT_WEIGHTS = Object.freeze({ specialty:30, sameCity:20, available:20, relativeLoad:15, schedule:10, level:5 });
const SERVICE_SPECIALTY_MAP = Object.freeze({ techcare:'hardware', 'suporte-ti':'windows', 'suporte-remoto':'windows', 'manutencao-computadores':'desktop', 'manutencao-notebooks':'notebook', 'redes-wifi':'wifi', cabeamento:'cabling', 'cameras-seguranca':'cameras', backup:'backup' });

async function rankTechnicians(client, request) {
  const result = await client.query(`SELECT p.id,p.name,tp.id AS profile_id,tp.technical_level,tp.employment_status,tp.availability_status,tp.accepts_remote,tp.accepts_onsite,tp.max_simultaneous_tickets,tp.home_city,tp.home_state,tp.service_cities,
    COALESCE((SELECT array_agg(s.specialty_id) FROM public.technician_profile_specialties s WHERE s.technician_profile_id=tp.id),'{}') specialties,
    COALESCE((SELECT array_agg(a.service_slug) FROM public.technician_authorized_services a WHERE a.technician_profile_id=tp.id),'{}') authorized_services,
    (SELECT COUNT(*)::int FROM public.support_tickets t WHERE t.assigned_technician_id=p.id AND t.status<>'fechado') active_tickets,
    EXISTS(SELECT 1 FROM public.technician_working_hours h WHERE h.technician_profile_id=tp.id AND h.weekday=EXTRACT(DOW FROM NOW() AT TIME ZONE 'America/Sao_Paulo')::int AND (NOW() AT TIME ZONE 'America/Sao_Paulo')::time BETWEEN h.start_time AND h.end_time) in_schedule,
    EXISTS(SELECT 1 FROM public.technician_time_off o WHERE o.technician_profile_id=tp.id AND NOW() BETWEEN o.starts_at AND o.ends_at) blocked
    FROM public.profiles p LEFT JOIN public.technician_profiles tp ON tp.user_id=p.id WHERE p.role='technician' ORDER BY p.name`);
  const requiredSpecialty=request.requiredSpecialty||SERVICE_SPECIALTY_MAP[request.serviceSlug]||null;
  return result.rows.map(t=>{const reasons=[];const failures=[];if(!t.profile_id)failures.push('Perfil profissional não configurado');if(t.employment_status!=='ACTIVE')failures.push('Vínculo não está ativo');if(['INACTIVE','ABSENT','OFFLINE'].includes(t.availability_status))failures.push(`Status ${t.availability_status||'não informado'}`);if(!t.authorized_services.includes(request.serviceSlug))failures.push('Serviço não autorizado');if(request.mode==='REMOTE'&&!t.accepts_remote)failures.push('Não aceita atendimento remoto');if(request.mode==='ONSITE'&&!t.accepts_onsite)failures.push('Não aceita atendimento presencial');if(!t.in_schedule)failures.push('Fora do horário configurado');if(t.blocked)failures.push('Possui bloqueio ativo');if(t.active_tickets>=t.max_simultaneous_tickets)failures.push('Capacidade máxima atingida');if(requiredSpecialty&&!t.specialties.includes(requiredSpecialty))failures.push(`Sem especialidade ${requiredSpecialty}`);if(request.mode==='ONSITE'&&request.city){const same=String(t.home_city||'').toLowerCase()===String(request.city).toLowerCase();const allowed=(t.service_cities||[]).some(c=>String(c).toLowerCase().includes(String(request.city).toLowerCase()));if(!same&&!allowed)failures.push('Cidade fora da área autorizada');}
    let score=0;if(requiredSpecialty&&t.specialties.includes(requiredSpecialty)){score+=TECHNICIAN_ASSIGNMENT_WEIGHTS.specialty;reasons.push('Especialidade compatível');}const sameCity=request.city&&String(t.home_city||'').toLowerCase()===String(request.city).toLowerCase();if(sameCity){score+=TECHNICIAN_ASSIGNMENT_WEIGHTS.sameCity;reasons.push('Mesma cidade');}if(t.availability_status==='AVAILABLE'){score+=TECHNICIAN_ASSIGNMENT_WEIGHTS.available;reasons.push('Disponível agora');}score+=Math.round(Math.max(0,1-(t.active_tickets/t.max_simultaneous_tickets))*TECHNICIAN_ASSIGNMENT_WEIGHTS.relativeLoad);if(t.in_schedule){score+=TECHNICIAN_ASSIGNMENT_WEIGHTS.schedule;reasons.push('Dentro do horário');}if(['SENIOR','SPECIALIST'].includes(t.technical_level))score+=TECHNICIAN_ASSIGNMENT_WEIGHTS.level;
    return {...t,eligible:failures.length===0,score,reasons,failures,required_specialty:requiredSpecialty};}).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.active_tickets-b.active_tickets);
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

    if ((url.pathname === '/api/catalog/store-templates' || url.pathname === '/api/admin/catalog/store-templates') && req.method === 'GET') {
      const result = await client.query(
        `SELECT id, slug, name, category, description, cover_image, preview_url, features, featured, active, sort_order, created_at, updated_at
         FROM public.commercial_store_templates
         ${isAdminRoute ? '' : 'WHERE active = TRUE'}
         ORDER BY sort_order, name`,
      );
      return json(res, 200, { templates: result.rows });
    }

    if (url.pathname === '/api/admin/catalog/store-templates' && req.method === 'POST') {
      const body = await readJson(req);
      const id = String(body.id || `tpl-${randomUUID().slice(0, 8)}`);
      const slug = String(body.slug || body.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const name = String(body.name || '').trim();
      const category = String(body.category || 'Geral').trim();
      const description = String(body.description || '').trim();
      const coverImage = String(body.coverImage || '').trim();
      const previewUrl = String(body.previewUrl || '').trim();
      const features = Array.isArray(body.features) ? body.features : [];
      const featured = body.featured === true;
      const active = body.active !== false;
      const sortOrder = Number(body.sortOrder || 0);

      if (!slug || !name || !description) {
        return json(res, 400, { error: 'Nome, slug e descrição são obrigatórios.' });
      }

      const result = await client.query(
        `INSERT INTO public.commercial_store_templates
           (id, slug, name, category, description, cover_image, preview_url, features, featured, active, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug, name = EXCLUDED.name, category = EXCLUDED.category,
           description = EXCLUDED.description, cover_image = EXCLUDED.cover_image,
           preview_url = EXCLUDED.preview_url, features = EXCLUDED.features,
           featured = EXCLUDED.featured, active = EXCLUDED.active, sort_order = EXCLUDED.sort_order, updated_at = NOW()
         RETURNING *`,
        [id, slug, name, category, description, coverImage, previewUrl, JSON.stringify(features), featured, active, sortOrder],
      );
      return json(res, 200, { template: result.rows[0] });
    }

async function calculateCommercialSelection(client, { serviceSlug, planId, templateId, addonCodes = [], domain }) {
  const normalizedServiceSlug = String(serviceSlug || '').trim();
  if (!normalizedServiceSlug) throw httpError(400, 'Serviço obrigatório.', 'SERVICE_REQUIRED');
  const sRes = await client.query(
    `SELECT slug, name, category, price_cents, recurring FROM public.commercial_services WHERE slug = $1 AND active = TRUE`,
    [normalizedServiceSlug]
  );
  const service = sRes.rows[0];
  if (!service) throw httpError(404, 'Serviço inexistente ou indisponível.', 'SERVICE_NOT_FOUND');

  let plan = null;
  if (planId) {
    const pRes = await client.query(
      `SELECT id, name, monthly_amount_cents AS monthly, activation_amount_cents AS activation FROM public.commercial_plans WHERE id = $1 AND active = TRUE`,
      [String(planId).toLowerCase()]
    );
    plan = pRes.rows[0];
    if (!plan) throw httpError(400, 'Plano inexistente ou indisponível.', 'PLAN_NOT_FOUND');
  }

  let template = null;
  if (templateId) {
    const tRes = await client.query(
      `SELECT id, slug, name, price_cents, activation_fee_cents FROM public.commercial_store_templates WHERE id = $1 OR slug = $1`,
      [templateId]
    );
    template = tRes.rows[0];
    if (!template) throw httpError(400, 'Modelo inexistente ou indisponível.', 'TEMPLATE_NOT_FOUND');
    if (service.slug !== 'lojas-virtuais' && service.slug !== 'sites' && service.slug !== 'landing-pages') {
      throw httpError(400, 'Este serviço não aceita modelo visual.', 'INCOMPATIBLE_TEMPLATE');
    }
  }

  const oneTimeItems = [];
  const monthlyItems = [];

  const baseActivation = plan ? plan.activation : (template ? (template.activation_fee_cents || 19700) : (service.price_cents || 19700));
  const baseMonthly = plan ? plan.monthly : (template ? (template.price_cents || 9900) : 9900);

  oneTimeItems.push({
    code: plan ? `activation-${plan.id}` : 'activation-base',
    name: plan ? `Ativação Nextia ${plan.name}` : `Ativação ${service.name}`,
    amountCents: baseActivation,
    billingCycle: 'one_time'
  });

  if (service.recurring) {
    monthlyItems.push({
      code: plan ? `plan-${plan.id}` : 'plan-base',
      name: plan ? `Assinatura Nextia ${plan.name}` : `Assinatura ${service.name}`,
      amountCents: baseMonthly,
      billingCycle: 'monthly'
    });
  }

  if (domain && domain.name && String(domain.name).trim()) {
    const dName = normalizeDomainName(domain.name);
    const domainMode = String(domain.mode || 'connect').toLowerCase();
    if (!['register', 'connect', 'transfer'].includes(domainMode)) {
      throw httpError(400, 'Modalidade de domínio inválida.', 'INVALID_DOMAIN_MODE');
    }
    const isRegister = domainMode === 'register';
    if (isRegister) {
      oneTimeItems.push({
        code: 'domain-registration',
        name: `Registro de domínio (${dName}) — 1 ano`,
        amountCents: 5000, // R$ 50,00 AUTHORITATIVE FEE
        billingCycle: 'one_time'
      });
    } else {
      oneTimeItems.push({
        code: 'domain-connect',
        name: `Apontamento de domínio existente (${dName})`,
        amountCents: 0,
        billingCycle: 'one_time'
      });
    }
  }

  const requestedAddonCodes = [...new Set(Array.isArray(addonCodes) ? addonCodes.map((code) => String(code).trim()).filter(Boolean) : [])]
    .filter((code) => code !== 'domain-registration');
  if (requestedAddonCodes.length > 0) {
    const aRes = await client.query(
      `SELECT code, name, amount_cents, billing_cycle FROM public.commercial_addons WHERE code = ANY($1) AND active = TRUE`,
      [requestedAddonCodes]
    );
    if (aRes.rows.length !== requestedAddonCodes.length) {
      throw httpError(400, 'Um ou mais opcionais são inválidos ou indisponíveis.', 'ADDON_NOT_FOUND');
    }
    for (const addon of aRes.rows) {
      const item = {
        code: addon.code,
        name: addon.name,
        amountCents: addon.amount_cents,
        billingCycle: addon.billing_cycle
      };
      if (addon.billing_cycle === 'monthly') {
        monthlyItems.push(item);
      } else {
        oneTimeItems.push(item);
      }
    }
  }

  const oneTimeTotalCents = oneTimeItems.reduce((sum, item) => sum + item.amountCents, 0);
  const monthlyTotalCents = monthlyItems.reduce((sum, item) => sum + item.amountCents, 0);

  return {
    service,
    plan,
    template,
    oneTimeItems,
    monthlyItems,
    oneTimeTotalCents,
    monthlyTotalCents
  };
}

    if (url.pathname === '/api/commerce/store-drafts' && req.method === 'POST') {
      const body = await readJson(req);
      const modelId = String(body.modelId || '').trim();
      const planId = body.planId ? String(body.planId).toLowerCase() : null;
      const optionalItems = Array.isArray(body.optionalItems) ? body.optionalItems : [];

      const tplRes = await client.query('SELECT * FROM public.commercial_store_templates WHERE (id = $1 OR slug = $1) AND active = TRUE', [modelId]);
      const template = tplRes.rows[0];
      if (!template) return json(res, 400, { error: 'Modelo de loja inválido ou inativo.' });

      const serviceRes = await client.query("SELECT price_cents FROM public.commercial_services WHERE slug = 'lojas-virtuais' AND active = TRUE");
      const servicePriceCents = serviceRes.rows[0]?.price_cents || 149000;

      let planMonthlyCents = 0;
      let planActivationCents = servicePriceCents;

      if (planId) {
        const planRes = await client.query('SELECT monthly_amount_cents, activation_amount_cents FROM public.commercial_plans WHERE id = $1 AND active = TRUE', [planId]);
        if (planRes.rows[0]) {
          planMonthlyCents = planRes.rows[0].monthly_amount_cents;
          planActivationCents = planRes.rows[0].activation_amount_cents;
        }
      }

      const OPTIONAL_PRICES = {
        'opt-checkout-integrado': { monthly: 7900, activation: 0 },
        'opt-calculo-frete': { monthly: 3900, activation: 0 },
        'opt-cupons-whatsapp': { monthly: 1900, activation: 0 },
        'opt-estoque-real': { monthly: 4900, activation: 0 },
        'opt-moedas-idiomas': { monthly: 0, activation: 19900 },
        'opt-chatbot': { monthly: 4900, activation: 0 },
        'opt-reservas': { monthly: 2900, activation: 0 },
        'opt-delivery': { monthly: 8900, activation: 0 },
        'opt-pdv': { monthly: 9900, activation: 0 },
        'opt-fidelidade': { monthly: 3900, activation: 0 },
        'opt-idiomas': { monthly: 0, activation: 19900 },
        'opt-fotos': { monthly: 0, activation: 29900 },
        'opt-agendamento-salao': { monthly: 2900, activation: 0 },
        'opt-lembrete-whatsapp': { monthly: 3900, activation: 0 },
        'opt-fidelidade-salao': { monthly: 3900, activation: 0 },
        'opt-galeria-trabalhos': { monthly: 1900, activation: 0 },
        'opt-fotos-salao': { monthly: 0, activation: 29900 },
        'opt-portal-cliente': { monthly: 5900, activation: 0 },
        'opt-consulta-processual': { monthly: 4900, activation: 0 },
        'opt-assinatura-digital': { monthly: 2900, activation: 0 },
        'opt-upload-seguro': { monthly: 1900, activation: 0 },
        'opt-agendamento-consultas': { monthly: 2900, activation: 0 },
        'opt-agendamento-clinica': { monthly: 2900, activation: 0 },
        'opt-prontuario-eletronico': { monthly: 4900, activation: 0 },
        'opt-teleconsulta': { monthly: 6900, activation: 0 },
        'opt-area-paciente': { monthly: 3900, activation: 0 },
        'opt-receitas-digitais': { monthly: 2900, activation: 0 },
        'opt-portal-contabil': { monthly: 5900, activation: 0 },
        'opt-armazenamento-xml': { monthly: 3900, activation: 0 },
        'opt-assinatura-contabil': { monthly: 2900, activation: 0 },
        'opt-upload-contabil': { monthly: 1900, activation: 0 },
        'opt-integracao-dominio': { monthly: 8900, activation: 0 },
        'opt-area-restrita-contabil': { monthly: 4900, activation: 0 },
        'opt-backup-nuvem': { monthly: 2900, activation: 0 },
        'opt-orcamento-whatsapp': { monthly: 1900, activation: 0 },
        'opt-acompanhamento-os': { monthly: 3900, activation: 0 },
        'opt-historico-veiculo': { monthly: 2900, activation: 0 },
        'opt-portal-corretor': { monthly: 6900, activation: 0 },
        'opt-crm-imobiliario': { monthly: 9900, activation: 0 },
        'opt-tour-360-premium': { monthly: 0, activation: 29900 },
        'opt-zap-vivareal': { monthly: 8900, activation: 0 },
        'opt-olx-imoveis': { monthly: 4900, activation: 0 },
        'opt-captacao-auto': { monthly: 5900, activation: 0 },
        'opt-avaliacao-online': { monthly: 3900, activation: 0 },
        'opt-simulador-avancado': { monthly: 2900, activation: 0 },
        'opt-assinatura-propostas': { monthly: 3900, activation: 0 },
        'opt-area-cliente-proprietario': { monthly: 6900, activation: 0 },
        'opt-comparador-favoritos': { monthly: 1900, activation: 0 },
        'opt-alertas-imoveis': { monthly: 2900, activation: 0 },
        'opt-rd-meta-google': { monthly: 7900, activation: 0 },
        'opt-chatbot-imobiliario': { monthly: 4900, activation: 0 },
      };

      let optionalMonthlyCents = 0;
      let optionalActivationCents = 0;
      for (const item of optionalItems) {
        const itemPrices = OPTIONAL_PRICES[item];
        if (itemPrices) {
          optionalMonthlyCents += itemPrices.monthly;
          optionalActivationCents += itemPrices.activation;
        }
      }

      const totalMonthlyCents = planMonthlyCents + optionalMonthlyCents;
      const totalActivationCents = planActivationCents + optionalActivationCents;

      const draftId = randomUUID();
      const result = await client.query(
        `INSERT INTO public.commercial_store_drafts
           (id, user_id, service_slug, model_id, offer_id, plan_id, store_info, needs, optional_items, snapshot_monthly_cents, snapshot_activation_cents)
         VALUES ($1, $2, 'lojas-virtuais', $3, 'lojas-virtuais', $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          draftId,
          sessionProfile?.id || null,
          template.id,
          planId,
          JSON.stringify(body.store || {}),
          JSON.stringify(body.needs || {}),
          JSON.stringify(optionalItems),
          totalMonthlyCents,
          totalActivationCents,
        ],
      );
      return json(res, 201, { draftId, draft: result.rows[0], template });
    }

    if (url.pathname.match(/^\/api\/commerce\/store-drafts\/[^/]+\/claim$/) && req.method === 'POST') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para continuar a contratação.' });
      const draftId = url.pathname.split('/').at(-2);
      await client.query('BEGIN');
      try {
        const draftResult = await client.query(
          `SELECT id, user_id FROM public.commercial_store_drafts
           WHERE id = $1 AND (user_id IS NULL OR user_id = $2) FOR UPDATE`,
          [draftId, sessionProfile.id],
        );
        if (!draftResult.rows[0]) {
          await client.query('ROLLBACK');
          return json(res, 404, { error: 'Rascunho de contratação não encontrado.' });
        }
        await client.query('UPDATE public.commercial_store_drafts SET user_id = $2, updated_at = NOW() WHERE id = $1', [draftId, sessionProfile.id]);
        await client.query(
          `UPDATE public.commercial_pricing_quotes SET user_id = $2
           WHERE session_draft_id = $1 AND user_id IS NULL AND consumed = FALSE`,
          [draftId, sessionProfile.id],
        );
        await client.query('COMMIT');
        return json(res, 200, { draftId, claimed: true });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    if (url.pathname.startsWith('/api/commerce/store-drafts/') && req.method === 'GET') {
      const draftId = url.pathname.replace('/api/commerce/store-drafts/', '').trim();
      const result = await client.query(
        `SELECT d.*, t.name as model_name, t.cover_image as model_cover, t.preview_url as model_preview
         FROM public.commercial_store_drafts d
         LEFT JOIN public.commercial_store_templates t ON t.id = d.model_id
         WHERE d.id = $1 AND (d.user_id IS NULL OR d.user_id = $2)`,
        [draftId, sessionProfile?.id || null],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Rascunho de contratação não encontrado.' });
      return json(res, 200, { draft: result.rows[0] });
    }

    if (url.pathname === '/api/catalog/services' && req.method === 'GET') {
      const result = await client.query(
        `SELECT slug, name, category, price_cents, price_label, recurring, active, sort_order
         FROM public.commercial_services WHERE active = TRUE ORDER BY sort_order, name`
      );
      return json(res, 200, { services: result.rows });
    }

    if (url.pathname.startsWith('/api/catalog/services/') && req.method === 'GET') {
      const slug = url.pathname.replace('/api/catalog/services/', '').trim();
      const result = await client.query(
        `SELECT slug, name, category, price_cents, price_label, recurring, active, sort_order
         FROM public.commercial_services WHERE slug = $1 AND active = TRUE`,
        [slug]
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Serviço não encontrado.' });
      return json(res, 200, { service: result.rows[0] });
    }

    if (url.pathname === '/api/catalog/addons' && req.method === 'GET') {
      const serviceSlug = url.searchParams.get('service');
      const result = await client.query(
        `SELECT code, name, description, amount_cents, billing_cycle, service_slug
         FROM public.commercial_addons WHERE active = TRUE ${serviceSlug ? 'AND (service_slug IS NULL OR service_slug = $1)' : ''} ORDER BY name`,
        serviceSlug ? [serviceSlug] : []
      );
      return json(res, 200, { addons: result.rows });
    }

    if (url.pathname === '/api/commerce/preview' && req.method === 'POST') {
      const body = await readJson(req);
      let draft = null;
      if (body.draftId) {
        const draftResult = await client.query(
          `SELECT * FROM public.commercial_store_drafts
           WHERE id = $1 AND (user_id IS NULL OR user_id = $2)`,
          [body.draftId, sessionProfile?.id || null],
        );
        draft = draftResult.rows[0];
        if (!draft) return json(res, 404, { error: 'Rascunho de contratação não encontrado.' });
        if (sessionProfile && !draft.user_id) {
          await client.query('UPDATE public.commercial_store_drafts SET user_id = $2, updated_at = NOW() WHERE id = $1', [draft.id, sessionProfile.id]);
        }
      }
      const domain = body.domain?.name ? { ...body.domain, name: normalizeDomainName(body.domain.name) } : null;
      const selection = await calculateCommercialSelection(client, {
        serviceSlug: body.serviceSlug || draft?.service_slug,
        planId: body.planId || draft?.plan_id,
        templateId: body.templateId || draft?.model_id,
        addonCodes: draft ? [] : body.addonCodes || [],
        domain,
      });
      if (draft) {
        const domainFee = domain?.mode === 'register' ? 5000 : 0;
        const baseActivation = selection.oneTimeTotalCents - domainFee;
        const optionalActivation = Math.max(0, Number(draft.snapshot_activation_cents || 0) - baseActivation);
        const optionalMonthly = Math.max(0, Number(draft.snapshot_monthly_cents || 0) - selection.monthlyTotalCents);
        if (optionalActivation > 0) selection.oneTimeItems.push({ code: 'store-options-activation', name: 'Opcionais da loja — ativação', amountCents: optionalActivation, billingCycle: 'one_time' });
        if (optionalMonthly > 0) selection.monthlyItems.push({ code: 'store-options-monthly', name: 'Opcionais da loja — mensalidade', amountCents: optionalMonthly, billingCycle: 'monthly' });
        selection.oneTimeTotalCents += optionalActivation;
        selection.monthlyTotalCents += optionalMonthly;
      }

      const quoteId = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      await client.query(
        `INSERT INTO public.commercial_pricing_quotes
           (id, user_id, session_draft_id, service_slug, template_slug, plan_id, addon_codes, domain_name, domain_mode,
            one_time_items, monthly_items, one_time_total_cents, monthly_total_cents, pricing_version, expires_at, normalized_selection)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, '2026-08-15.1', $14, $15)`,
        [
          quoteId,
          sessionProfile?.id || null,
          body.draftId || null,
          selection.service.slug,
          selection.template?.slug || null,
          selection.plan?.id || null,
          JSON.stringify(body.addonCodes || []),
          domain?.name || null,
          domain?.mode || null,
          JSON.stringify(selection.oneTimeItems),
          JSON.stringify(selection.monthlyItems),
          selection.oneTimeTotalCents,
          selection.monthlyTotalCents,
          expiresAt,
          JSON.stringify({
            serviceSlug: selection.service.slug,
            serviceName: selection.service.name,
            planId: selection.plan?.id || null,
            planName: selection.plan?.name || null,
            templateId: selection.template?.id || null,
            templateSlug: selection.template?.slug || null,
            templateName: selection.template?.name || null,
            addonCodes: body.addonCodes || [],
            domain,
            oneTimeTotalCents: selection.oneTimeTotalCents,
            monthlyTotalCents: selection.monthlyTotalCents,
          }),
        ],
      );

      return json(res, 200, {
        quoteId,
        expiresAt,
        pricingVersion: '2026-08-15.1',
        currency: 'BRL',
        serviceSlug: selection.service.slug,
        serviceName: selection.service.name,
        templateSlug: selection.template?.slug || null,
        planId: selection.plan?.id || null,
        domain: body.domain || null,
        oneTimeItems: selection.oneTimeItems,
        monthlyItems: selection.monthlyItems,
        oneTimeTotalCents: selection.oneTimeTotalCents,
        monthlyTotalCents: selection.monthlyTotalCents,
      });
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
        currency: 'BRL',
        serviceSlug: selection.service.slug,
        serviceName: selection.service.name,
        templateSlug: selection.template?.slug || null,
        planId: selection.plan?.id || null,
        domain: body.domain || null,
        oneTimeItems: selection.oneTimeItems,
        monthlyItems: selection.monthlyItems,
        oneTimeTotalCents: selection.oneTimeTotalCents,
        monthlyTotalCents: selection.monthlyTotalCents,
      });
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
      try {
        await ensureCommercialCatalogSchema(client);
        await ensureAppSchema(client);
        const result = await client.query(
          `SELECT o.id, o.item_type, o.item_id, o.item_name, o.amount_cents, o.recurring, o.status,
                  o.checkout_url, o.created_at, o.updated_at, o.paid_at, o.subtotal_cents, o.total_cents,
                  o.currency, o.service_slug_snapshot, o.service_name_snapshot, o.plan_name_snapshot,
                  o.template_name_snapshot, o.domain_fqdn, o.engagement_id,
                  COALESCE(jsonb_agg(jsonb_build_object(
                    'kind', i.item_kind, 'code', i.item_code, 'name', i.name_snapshot,
                    'amountCents', i.total_amount_cents, 'billingCycle', i.billing_cycle,
                    'metadata', i.metadata
                  ) ORDER BY i.created_at) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb) AS items
           FROM public.commercial_orders o
           LEFT JOIN public.commercial_order_items i ON i.order_id=o.id
           WHERE o.user_id = $1
           GROUP BY o.id ORDER BY o.created_at DESC`,
          [sessionProfile.id],
        );
        return json(res, 200, { orders: result.rows });
      } catch (err) {
        console.error('[Commerce Orders API Error]', err.message || err);
        return json(res, 200, { orders: [] });
      }
    }

    if (url.pathname === '/api/commerce/orders' && req.method === 'POST') {
      if (!sessionProfile) return json(res, 401, { error: 'Faça login para contratar.' });
      const body = await readJson(req);
      const idempotencyHeader = String(req.headers['idempotency-key'] || '').trim();
      const quoteId = body.quoteId ? String(body.quoteId).trim() : null;
      if (!quoteId) return json(res, 400, { error: 'Cotação obrigatória. Atualize o resumo da contratação.', code: 'QUOTE_REQUIRED' });
      if (idempotencyHeader.length < 8 || idempotencyHeader.length > 200) {
        return json(res, 400, { error: 'Chave de idempotência inválida.', code: 'IDEMPOTENCY_KEY_REQUIRED' });
      }

      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });

      const existingOrder = await client.query(
        `SELECT id, checkout_url, status, pricing_quote_id FROM public.commercial_orders
         WHERE user_id = $1 AND idempotency_key = $2`,
        [sessionProfile.id, idempotencyHeader],
      );
      if (existingOrder.rows[0]) {
        return json(res, 200, {
          orderId: existingOrder.rows[0].id,
          checkoutUrl: existingOrder.rows[0].checkout_url,
          status: existingOrder.rows[0].status,
          quoteId: existingOrder.rows[0].pricing_quote_id,
          idempotentReplay: true,
        });
      }

      let orderId;
      let selection;
      let finalAmountCents;
      let baseUrl;
      await client.query('BEGIN');
      try {
        const quoteResult = await client.query(
          `SELECT * FROM public.commercial_pricing_quotes
           WHERE id = $1 AND user_id = $2 AND consumed = FALSE AND expires_at > NOW()
           FOR UPDATE`,
          [quoteId, sessionProfile.id],
        );
        const quoteRecord = quoteResult.rows[0];
        if (!quoteRecord) {
          await client.query('ROLLBACK');
          return json(res, 400, { error: 'Cotação expirada, utilizada ou não pertencente a esta conta.', code: 'INVALID_QUOTE' });
        }

        const normalizedSelection = quoteRecord.normalized_selection || {};
        selection = {
          service: {
            slug: quoteRecord.service_slug,
            name: normalizedSelection.serviceName || quoteRecord.service_slug,
          },
          template: normalizedSelection.templateId ? {
            id: normalizedSelection.templateId,
            slug: normalizedSelection.templateSlug,
            name: normalizedSelection.templateName,
          } : null,
          plan: normalizedSelection.planId ? {
            id: normalizedSelection.planId,
            name: normalizedSelection.planName,
          } : null,
          domain: normalizedSelection.domain || null,
          oneTimeItems: Array.isArray(quoteRecord.one_time_items) ? quoteRecord.one_time_items : [],
          monthlyItems: Array.isArray(quoteRecord.monthly_items) ? quoteRecord.monthly_items : [],
          oneTimeTotalCents: Number(quoteRecord.one_time_total_cents),
          monthlyTotalCents: Number(quoteRecord.monthly_total_cents),
        };
        finalAmountCents = selection.oneTimeTotalCents > 0 ? selection.oneTimeTotalCents : selection.monthlyTotalCents;
        if (!Number.isInteger(finalAmountCents) || finalAmountCents <= 0) {
          await client.query('ROLLBACK');
          return json(res, 409, { error: 'Esta contratação precisa de orçamento antes do pagamento.' });
        }

        orderId = randomUUID();
        const protocol = String(req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http')).split(',')[0].trim();
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
        baseUrl = process.env.APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;

        await client.query(
          `INSERT INTO public.commercial_orders
            (id, user_id, item_id, item_name, amount_cents, subtotal_cents, total_cents, currency,
             recurring, customer_notes, draft_id, pricing_quote_id, idempotency_key, store_snapshot)
           VALUES ($1,$2,$3,$4,$5,$5,$5,'BRL',$6,$7,$8,$9,$10,$11)`,
          [
            orderId,
            sessionProfile.id,
            selection.service.slug,
            `Contratação - ${selection.service.name || selection.service.slug}`,
            finalAmountCents,
            true,
            String(body.notes || '').trim().slice(0, 2000) || null,
            quoteRecord.session_draft_id || null,
            quoteId,
            idempotencyHeader,
            JSON.stringify(normalizedSelection),
          ],
        );

        await client.query(
          `INSERT INTO public.commercial_order_items
            (order_id, item_kind, item_code, name_snapshot, quantity, unit_amount_cents, total_amount_cents, billing_cycle, metadata)
           VALUES ($1, 'service', $2, $3, 1, 0, 0, 'one_time', $4)`,
          [orderId, selection.service.slug, selection.service.name, JSON.stringify({
            templateId: selection.template?.id || null,
            templateSlug: selection.template?.slug || null,
            templateName: selection.template?.name || null,
          })],
        );
        for (const item of [...selection.oneTimeItems, ...selection.monthlyItems]) {
          await client.query(
            `INSERT INTO public.commercial_order_items
              (order_id, item_kind, item_code, name_snapshot, quantity, unit_amount_cents, total_amount_cents, billing_cycle)
             VALUES ($1, $2, $3, $4, 1, $5, $6, $7)`,
            [
              orderId,
              item.code.startsWith('domain') ? 'domain' : item.code.startsWith('plan') || item.code.startsWith('activation') ? 'plan' : 'addon',
              item.code,
              item.name,
              item.amountCents,
              item.amountCents,
              item.billingCycle,
            ],
          );
        }

        const invoiceId = randomUUID();
        await client.query(
          `INSERT INTO public.invoices
            (id, user_id, order_id, invoice_number, description, subtotal_cents, total_cents, currency, status, type, due_date)
           VALUES ($1,$2,$3,$4,$5,$6,$6,'BRL','pending','ativacao',NOW() + INTERVAL '1 day')`,
          [invoiceId, sessionProfile.id, orderId, `FAT-${orderId.slice(0, 8).toUpperCase()}`, `Contratação — ${selection.service.name}`, finalAmountCents],
        );
        for (const item of selection.oneTimeItems) {
          await client.query(
            `INSERT INTO public.invoice_items(invoice_id,item_code,description,amount_cents,billing_cycle)
             VALUES ($1,$2,$3,$4,$5)`,
            [invoiceId, item.code, item.name, item.amountCents, item.billingCycle],
          );
        }

        await client.query(
          `UPDATE public.commercial_pricing_quotes
           SET consumed = TRUE, consumed_at = NOW(), consumed_order_id = $2
           WHERE id = $1`,
          [quoteId, orderId],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        if (String(err.code) === '23505') {
          const replay = await client.query(
            `SELECT id, checkout_url, status, pricing_quote_id FROM public.commercial_orders
             WHERE user_id = $1 AND idempotency_key = $2`,
            [sessionProfile.id, idempotencyHeader],
          );
          if (replay.rows[0]) return json(res, 200, { orderId: replay.rows[0].id, checkoutUrl: replay.rows[0].checkout_url, status: replay.rows[0].status, quoteId: replay.rows[0].pricing_quote_id, idempotentReplay: true });
        }
        console.error('[COMMERCE ORDER ERROR]', err);
        return json(res, 500, { error: 'Falha ao criar o pedido.' });
      }

      try {
        const externalReference = `order:${orderId}`;
        const oneTimePayload = {
          items: (selection.oneTimeItems.length > 0 ? selection.oneTimeItems : selection.monthlyItems).map((i) => ({
            id: i.code,
            title: i.name,
            quantity: 1,
            unit_price: i.amountCents / 100,
            currency_id: 'BRL',
          })),
          payer: { name: sessionProfile.name, email: sessionProfile.email },
          external_reference: externalReference,
          back_urls: {
            success: `${baseUrl}/checkout?status=success&order=${orderId}`,
            failure: `${baseUrl}/checkout?status=failure&order=${orderId}`,
            pending: `${baseUrl}/checkout?status=pending&order=${orderId}`,
          },
          auto_return: 'approved',
          notification_url: `${baseUrl}/api/commerce/webhook`,
        };

        const providerResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `order-${idempotencyHeader}`,
          },
          body: JSON.stringify(oneTimePayload),
        });

        const providerData = await providerResponse.json();
        if (!providerResponse.ok || !providerData.init_point) {
          await client.query(
            `UPDATE public.commercial_orders SET status = 'failed', failure_code = 'PROVIDER_PREFERENCE_FAILED',
             failure_message = $2, updated_at = NOW() WHERE id = $1`,
            [orderId, String(providerData?.message || 'Mercado Pago não criou a preferência').slice(0, 500)],
          );
          return json(res, 502, { error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
        }

        await client.query(
          `UPDATE public.commercial_orders SET status = 'payment_pending', provider_reference = $2,
             checkout_url = $3, updated_at = NOW() WHERE id = $1`,
          [orderId, String(providerData.id), providerData.init_point],
        );

        return json(res, 201, { orderId, checkoutUrl: providerData.init_point, quoteId });
      } catch (err) {
        await client.query(
          `UPDATE public.commercial_orders SET status = 'failed', failure_code = 'PROVIDER_UNAVAILABLE',
           failure_message = $2, updated_at = NOW() WHERE id = $1`,
          [orderId, String(err.message || err).slice(0, 500)],
        ).catch(() => undefined);
        console.error('[COMMERCE PROVIDER ERROR]', err);
        return json(res, 502, { error: 'Serviço de pagamento temporariamente indisponível.' });
      }
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
      if (!featureEnabled('ENABLE_LEGACY_CONTRACT_CREATION', false)) {
        return json(res, 410, {
          error: 'Fluxo legado desativado. Use a cotação e o pedido itemizado do checkout.',
          code: 'LEGACY_CONTRACT_FLOW_RETIRED',
        });
      }
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

    if (url.pathname.startsWith('/api/admin/commerce/orders/') && req.method === 'DELETE') {
      const orderId = url.pathname.replace('/api/admin/commerce/orders/', '').trim();
      const result = await client.query('DELETE FROM public.commercial_orders WHERE id = $1 RETURNING id', [orderId]);
      if (!result.rows[0]) return json(res, 404, { error: 'Pedido não encontrado.' });
      return json(res, 200, { success: true, deletedId: orderId });
    }

    if (url.pathname.startsWith('/api/admin/commerce/contracts/') && req.method === 'DELETE') {
      const contractId = url.pathname.replace('/api/admin/commerce/contracts/', '').trim();
      const result = await client.query('DELETE FROM public.commercial_plan_contracts WHERE id = $1 RETURNING id', [contractId]);
      if (!result.rows[0]) return json(res, 404, { error: 'Contrato não encontrado.' });
      return json(res, 200, { success: true, deletedId: contractId });
    }

    if (url.pathname === '/api/commerce/webhook' && req.method === 'POST') {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const body = await readJson(req);
      const resourceId = String(body.data?.id || url.searchParams.get('data.id') || '');
      const eventType = String(body.type || url.searchParams.get('type') || '');
      if (!resourceId || !['payment', 'subscription_preapproval'].includes(eventType)) return json(res, 200, { status: 'ignored' });
      if (!verifyMercadoPagoSignature(req, resourceId)) {
        return json(res, 401, { error: 'Assinatura do webhook inválida.' });
      }
      const providerEventId = String(body.id || `${eventType}:${resourceId}:${req.headers['x-request-id'] || ''}`);
      const payloadHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
      const eventInsert = await client.query(
        `INSERT INTO public.provider_webhook_events
          (provider, event_id, event_type, resource_id, payload_hash, payload, status, attempts)
         VALUES ('mercado_pago',$1,$2,$3,$4,$5,'processing',1)
         ON CONFLICT (provider, event_id) DO NOTHING
         RETURNING id`,
        [providerEventId, eventType, resourceId, payloadHash, JSON.stringify(body)],
      );
      if (!eventInsert.rows[0]) return json(res, 200, { status: 'already_processed' });
      const webhookEventId = eventInsert.rows[0].id;
      const lookupUrl = eventType === 'payment'
        ? `https://api.mercadopago.com/v1/payments/${encodeURIComponent(resourceId)}`
        : `https://api.mercadopago.com/preapproval/${encodeURIComponent(resourceId)}`;
      const providerResponse = await fetch(lookupUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!providerResponse.ok) {
        await client.query(
          `UPDATE public.provider_webhook_events SET status = 'failed', error_message = $2 WHERE id = $1`,
          [webhookEventId, `Mercado Pago respondeu HTTP ${providerResponse.status}`],
        );
        return json(res, 502, { error: 'Não foi possível validar o evento.' });
      }
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
      if (!externalReference.startsWith('order:')) {
        await client.query(`UPDATE public.provider_webhook_events SET status = 'ignored', processed_at = NOW() WHERE id = $1`, [webhookEventId]);
        return json(res, 200, { status: 'ignored' });
      }
      const orderId = externalReference.slice(6);
      const approved = eventType === 'payment' ? providerData.status === 'approved' : providerData.status === 'authorized';

      await client.query('BEGIN');
      try {
        const orderResult = await client.query('SELECT * FROM public.commercial_orders WHERE id = $1 FOR UPDATE', [orderId]);
        const order = orderResult.rows[0];
        if (!order) {
          await client.query(`UPDATE public.provider_webhook_events SET status = 'ignored', error_message = 'Pedido não encontrado', processed_at = NOW() WHERE id = $1`, [webhookEventId]);
          await client.query('COMMIT');
          return json(res, 200, { status: 'ignored' });
        }
        if (eventType === 'payment') {
          const amountCents = Math.round(Number(providerData.transaction_amount) * 100);
          if (providerData.currency_id !== (order.currency || 'BRL') || amountCents !== Number(order.total_cents ?? order.amount_cents)) {
            throw httpError(409, 'Valor ou moeda divergente no pedido comercial.', 'PAYMENT_AMOUNT_MISMATCH');
          }
        }

        await client.query(
          `UPDATE public.commercial_orders SET status = $2, provider_payment_id = $3,
             paid_at = CASE WHEN $2 IN ('paid','active') THEN COALESCE(paid_at, NOW()) ELSE paid_at END, updated_at = NOW()
           WHERE id = $1`,
          [orderId, approved ? 'paid' : 'payment_pending', resourceId],
        );

        const invoiceResult = await client.query('SELECT id FROM public.invoices WHERE order_id = $1 ORDER BY created_at LIMIT 1', [orderId]);
        const invoiceId = invoiceResult.rows[0]?.id || null;
        if (invoiceId) {
          await client.query(
            `UPDATE public.invoices SET status = $2, paid_at = CASE WHEN $2 = 'paid' THEN COALESCE(paid_at, NOW()) ELSE paid_at END, updated_at = NOW()
             WHERE id = $1`,
            [invoiceId, approved ? 'paid' : 'pending'],
          );
          await client.query(
            `INSERT INTO public.payment_transactions
              (invoice_id,user_id,provider,provider_transaction_id,amount_cents,currency,status,payment_method,metadata)
             VALUES ($1,$2,'mercadopago',$3,$4,$5,$6,$7,$8)
             ON CONFLICT (provider,provider_transaction_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
            [invoiceId, order.user_id, resourceId, Number(order.total_cents ?? order.amount_cents), order.currency || 'BRL', approved ? 'approved' : 'pending', providerData.payment_method_id || null, JSON.stringify({ providerStatus: providerData.status })],
          );
        }

        let engagementId = order.engagement_id;
        if (approved) {
          const snapshot = order.store_snapshot || {};
          const serviceResult = await client.query('SELECT slug,name,category FROM public.commercial_services WHERE slug = $1', [order.item_id]);
          const service = serviceResult.rows[0] || { slug: order.item_id, name: snapshot.serviceName || order.item_name, category: 'digital' };
          const policyResult = await client.query(
            `SELECT * FROM public.service_workflow_policies WHERE service_slug = $1 ORDER BY version DESC LIMIT 1`,
            [service.slug],
          );
          const policy = policyResult.rows[0];
          if (!policy) throw httpError(409, `Workflow não configurado para ${service.slug}.`, 'WORKFLOW_NOT_CONFIGURED');

          const engagementResult = await client.query(
            `INSERT INTO public.service_engagements
              (public_code,user_id,service_slug,service_name_snapshot,service_category,segment_slug,segment_name_snapshot,
               template_id,template_slug_snapshot,template_name_snapshot,plan_id,plan_name_snapshot,workflow_key,workflow_version,
               execution_mode,status,source_kind,source_order_id,activation_amount_cents,monthly_amount_cents,currency,activated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'awaiting_onboarding','order',$16,$17,$18,$19,NOW())
             ON CONFLICT (source_order_id) WHERE source_order_id IS NOT NULL
             DO UPDATE SET status = 'awaiting_onboarding', activated_at = COALESCE(service_engagements.activated_at,NOW()), updated_at = NOW()
             RETURNING id`,
            [
              `ENG-${randomUUID().slice(0, 8).toUpperCase()}`,
              order.user_id,
              service.slug,
              snapshot.serviceName || service.name,
              service.category,
              snapshot.variantSlug || null,
              snapshot.variantName || null,
              snapshot.templateId || null,
              snapshot.templateSlug || null,
              snapshot.templateName || null,
              snapshot.planId || null,
              snapshot.planName || null,
              policy.workflow_key,
              policy.version,
              policy.execution_mode,
              order.id,
              Number(order.total_cents ?? order.amount_cents),
              Number(snapshot.monthlyTotalCents || 0),
              order.currency || 'BRL',
            ],
          );
          engagementId = engagementResult.rows[0].id;
          await client.query('UPDATE public.commercial_orders SET engagement_id = $2 WHERE id = $1', [orderId, engagementId]);
          if (invoiceId) await client.query('UPDATE public.invoices SET engagement_id = $2 WHERE id = $1', [invoiceId, engagementId]);

          if (snapshot.domain?.name) {
            const fqdn = normalizeDomainName(snapshot.domain.name);
            const domainMode = snapshot.domain.mode === 'register' ? 'register' : snapshot.domain.mode === 'transfer' ? 'transfer' : 'connect';
            await client.query(
              `INSERT INTO public.service_domains(engagement_id,fqdn,mode,registration_fee_cents,status)
               VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (engagement_id) DO UPDATE SET fqdn=EXCLUDED.fqdn,mode=EXCLUDED.mode,registration_fee_cents=EXCLUDED.registration_fee_cents,updated_at=NOW()`,
              [engagementId, fqdn, domainMode, domainMode === 'register' ? 5000 : 0, domainMode === 'register' ? 'payment_pending' : 'awaiting_dns'],
            );
          }

          if (policy.requires_project) {
            const projectResult = await client.query(
              `INSERT INTO public.projects
                (user_id,engagement_id,name,template,segment,status,plan,monthly_fee,activation_fee,estimated_delivery,
                 requests_remaining,requests_total,source_order_id,service_slug,workflow_key,workflow_version,store_model_id,store_details)
               VALUES ($1,$2,$3,$4,$5,'aguardando-briefing',$6,$7,$8,NOW()+INTERVAL '14 days',5,5,$9,$10,$11,$12,$13,$14)
               ON CONFLICT (source_order_id) WHERE source_order_id IS NOT NULL DO UPDATE SET engagement_id = EXCLUDED.engagement_id
               RETURNING id`,
              [
                order.user_id,
                engagementId,
                `${snapshot.serviceName || service.name}${snapshot.templateName ? ` — ${snapshot.templateName}` : ''}`,
                snapshot.templateSlug || '',
                snapshot.variantName || snapshot.templateName || service.name,
                snapshot.planName || 'Personalizado',
                Number(snapshot.monthlyTotalCents || 0) / 100,
                Number(order.total_cents ?? order.amount_cents) / 100,
                order.id,
                service.slug,
                policy.workflow_key,
                policy.version,
                service.slug === 'lojas-virtuais' ? snapshot.templateId || null : null,
                JSON.stringify(snapshot),
              ],
            );
            if (projectResult.rows[0]) {
              const milestones = WORKFLOW_MILESTONES[policy.workflow_key] || [];
              for (const [title, description, position, days] of milestones) {
                await client.query(
                  `INSERT INTO public.milestones(project_id,title,description,position,estimated_at)
                   VALUES ($1,$2,$3,$4,NOW()+($5 || ' days')::interval)`,
                  [projectResult.rows[0].id, title, description, position, days],
                );
              }
            }
          }

          await client.query(
            `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
             VALUES ('engagement',$1,'engagement.activated',$2,$3)
             ON CONFLICT (idempotency_key) DO NOTHING`,
            [engagementId, JSON.stringify({ engagementId, orderId, serviceSlug: service.slug }), `engagement-activated:${engagementId}`],
          );
          await client.query(
            `INSERT INTO public.notifications(user_id,title,message,type)
             VALUES ($1,'Serviço contratado',$2,'project')`,
            [order.user_id, `${snapshot.serviceName || service.name} foi confirmado. Complete o onboarding no painel.`],
          );
        }

        await client.query(
          `UPDATE public.provider_webhook_events SET status = 'processed', processed_at = NOW(), error_message = NULL WHERE id = $1`,
          [webhookEventId],
        );
        await client.query('COMMIT');
        return json(res, 200, { status: approved ? 'confirmed' : 'pending', engagementId });
      } catch (err) {
        await client.query('ROLLBACK');
        await client.query(
          `UPDATE public.provider_webhook_events SET status = 'failed', error_message = $2 WHERE id = $1`,
          [webhookEventId, String(err.message || err).slice(0, 1000)],
        ).catch(() => undefined);
        throw err;
      }
    }
    return json(res, 405, { error: 'Método não permitido.' });
  } catch (error) {
    if (error?.statusCode) {
      return json(res, error.statusCode, { error: error.message, code: error.code || 'REQUEST_ERROR' });
    }
    throw error;
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
  ['/api/admin/technicians', 'GET'],
  ['/api/admin/technicians/detail', 'GET'],
  ['/api/admin/technicians/save', 'POST'],
  ['/api/admin/users/create', 'POST'],
  ['/api/admin/technical-services/create', 'POST'],
  ['/api/admin/technical-tickets/create', 'POST'],
  ['/api/admin/support-ticket/delete', 'POST'],
  ['/api/technician/profile', 'GET'],
  ['/api/technician/availability', 'POST'],
  ['/api/technician/operations', 'GET'],
  ['/api/technician/ticket-action', 'POST'],
  ['/api/technician/calendar', 'POST'],
  ['/api/technician/service-order', 'POST'],
  ['/api/technician/notifications/read', 'POST'],
  ['/api/client/technical-overview', 'GET'],
  ['/api/client/ticket-review', 'POST'],
  ['/api/client/part-approval', 'POST'],
  ['/api/admin/technical-analytics', 'GET'],
  ['/api/admin/technician-governance', 'POST'],
  ['/api/admin/technician-governance-data', 'GET'],
  ['/api/service-requests', 'POST'],
  ['/api/support/create-ticket', 'POST'],
  ['/api/support/list-tickets', 'GET'],
  ['/api/support/get-ticket', 'GET'],
  ['/api/support/reply-ticket', 'POST'],
  ['/api/admin/list-support-tickets', 'GET'],
  ['/api/admin/update-ticket-status', 'POST'],
  ['/api/admin/assign-support-ticket', 'POST'],
  ['/api/admin/ticket-assignment-options', 'GET'],
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
    await ensureCommercialCatalogSchema(client);
    await ensureSupportSchema(client);

    if (url.pathname === '/api/admin/technicians') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const [technicians, specialties, services] = await Promise.all([
        client.query(`SELECT p.id AS user_id,p.name,p.email,p.phone,p.company,
          tp.id AS profile_id,tp.phone_secondary,tp.avatar,tp.professional_title,tp.bio,tp.technical_level,tp.employment_status,tp.availability_status,
          tp.accepts_remote,tp.accepts_onsite,tp.max_simultaneous_tickets,tp.home_city,tp.home_state,tp.service_radius_km,tp.service_cities,tp.notes,tp.created_at,tp.updated_at,
          COALESCE((SELECT json_agg(s.specialty_id) FROM public.technician_profile_specialties s WHERE s.technician_profile_id=tp.id),'[]') AS specialties,
          COALESCE((SELECT json_agg(a.service_slug) FROM public.technician_authorized_services a WHERE a.technician_profile_id=tp.id),'[]') AS authorized_services,
          COALESCE((SELECT json_agg(json_build_object('id',h.id,'weekday',h.weekday,'start_time',h.start_time,'end_time',h.end_time) ORDER BY h.weekday,h.start_time) FROM public.technician_working_hours h WHERE h.technician_profile_id=tp.id),'[]') AS working_hours,
          COALESCE((SELECT json_agg(json_build_object('id',o.id,'starts_at',o.starts_at,'ends_at',o.ends_at,'reason',o.reason) ORDER BY o.starts_at) FROM public.technician_time_off o WHERE o.technician_profile_id=tp.id AND o.ends_at>=NOW()),'[]') AS time_off,
          (SELECT COUNT(*)::int FROM public.support_tickets t WHERE t.assigned_technician_id=p.id AND t.status<>'fechado') AS active_tickets
          FROM public.profiles p LEFT JOIN public.technician_profiles tp ON tp.user_id=p.id WHERE p.role='technician' ORDER BY p.name`),
        client.query(`SELECT id,name FROM public.technician_specialties WHERE active=TRUE ORDER BY sort_order,name`),
        client.query(`SELECT slug,name,category FROM public.commercial_services WHERE active=TRUE ORDER BY sort_order,name`),
      ]);
      return json(res,200,{technicians:technicians.rows,specialties:specialties.rows,services:services.rows});
    }

    if (url.pathname === '/api/admin/technicians/detail') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const userId = String(url.searchParams.get('userId') || '');
      if (!UUID_PATTERN.test(userId)) return json(res, 400, { error: 'Usuário técnico inválido.' });
      const [technician, specialties, services, tickets] = await Promise.all([
        client.query(`SELECT p.id AS user_id,p.name,p.email,p.phone,p.company,
          tp.id AS profile_id,tp.phone_secondary,tp.avatar,tp.professional_title,tp.bio,tp.technical_level,tp.employment_status,tp.availability_status,
          tp.accepts_remote,tp.accepts_onsite,tp.max_simultaneous_tickets,tp.home_city,tp.home_state,tp.service_radius_km,tp.service_cities,tp.notes,tp.created_at,tp.updated_at,
          COALESCE((SELECT json_agg(s.specialty_id) FROM public.technician_profile_specialties s WHERE s.technician_profile_id=tp.id),'[]') AS specialties,
          COALESCE((SELECT json_agg(a.service_slug) FROM public.technician_authorized_services a WHERE a.technician_profile_id=tp.id),'[]') AS authorized_services,
          COALESCE((SELECT json_agg(json_build_object('id',h.id,'weekday',h.weekday,'start_time',h.start_time,'end_time',h.end_time) ORDER BY h.weekday,h.start_time) FROM public.technician_working_hours h WHERE h.technician_profile_id=tp.id),'[]') AS working_hours,
          COALESCE((SELECT json_agg(json_build_object('id',o.id,'starts_at',o.starts_at,'ends_at',o.ends_at,'reason',o.reason) ORDER BY o.starts_at) FROM public.technician_time_off o WHERE o.technician_profile_id=tp.id AND o.ends_at>=NOW()),'[]') AS time_off,
          (SELECT COUNT(*)::int FROM public.support_tickets t WHERE t.assigned_technician_id=p.id AND t.status<>'fechado') AS active_tickets
          FROM public.profiles p LEFT JOIN public.technician_profiles tp ON tp.user_id=p.id WHERE p.id=$1 AND p.role='technician'`,[userId]),
        client.query(`SELECT id,name FROM public.technician_specialties WHERE active=TRUE ORDER BY sort_order,name`),
        client.query(`SELECT slug,name,category FROM public.commercial_services WHERE active=TRUE ORDER BY sort_order,name`),
        client.query(`SELECT id,subject,name,company,priority,status,created_at,started_at,resolved_at FROM public.support_tickets WHERE assigned_technician_id=$1 ORDER BY created_at DESC LIMIT 100`,[userId]),
      ]);
      if(!technician.rows[0]) return json(res,404,{error:'Técnico não encontrado.'});
      return json(res,200,{technician:technician.rows[0],specialties:specialties.rows,services:services.rows,tickets:tickets.rows});
    }

    if (url.pathname === '/api/admin/technicians/save') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'admin') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para administradores.' });
      const body=await readJson(req); const userId=String(body.userId||'');
      if(!UUID_PATTERN.test(userId)) return json(res,400,{error:'Usuário técnico inválido.'});
      const levels=['JUNIOR','PLENO','SENIOR','SPECIALIST']; const employment=['ACTIVE','INACTIVE','ON_LEAVE'];
      const availability=['AVAILABLE','BUSY','ON_ROUTE','IN_SERVICE','BREAK','ABSENT','OFFLINE','INACTIVE'];
      const maxTickets=Number(body.maxSimultaneousTickets||4);
      if(!Number.isInteger(maxTickets)||maxTickets<1||maxTickets>100) return json(res,400,{error:'Capacidade de chamados inválida.'});
      let transactionStarted=false;
      try {
        const user=await client.query(`SELECT id FROM public.profiles WHERE id=$1 AND role='technician'`,[userId]);
        if(!user.rows[0]) return json(res,400,{error:'Usuário técnico inválido.'});
        await client.query('BEGIN');transactionStarted=true;
        const saved=await client.query(`INSERT INTO public.technician_profiles(user_id,phone_secondary,avatar,professional_title,bio,technical_level,employment_status,availability_status,accepts_remote,accepts_onsite,max_simultaneous_tickets,home_city,home_state,service_radius_km,service_cities,notes)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          ON CONFLICT(user_id) DO UPDATE SET phone_secondary=EXCLUDED.phone_secondary,avatar=EXCLUDED.avatar,professional_title=EXCLUDED.professional_title,bio=EXCLUDED.bio,technical_level=EXCLUDED.technical_level,employment_status=EXCLUDED.employment_status,availability_status=EXCLUDED.availability_status,accepts_remote=EXCLUDED.accepts_remote,accepts_onsite=EXCLUDED.accepts_onsite,max_simultaneous_tickets=EXCLUDED.max_simultaneous_tickets,home_city=EXCLUDED.home_city,home_state=EXCLUDED.home_state,service_radius_km=EXCLUDED.service_radius_km,service_cities=EXCLUDED.service_cities,notes=EXCLUDED.notes,updated_at=NOW() RETURNING *`,
          [userId,String(body.phoneSecondary||'').trim()||null,String(body.avatar||'').trim()||null,String(body.professionalTitle||'').trim()||null,String(body.bio||'').trim()||null,levels.includes(body.technicalLevel)?body.technicalLevel:'JUNIOR',employment.includes(body.employmentStatus)?body.employmentStatus:'ACTIVE',availability.includes(body.availabilityStatus)?body.availabilityStatus:'OFFLINE',body.acceptsRemote!==false,body.acceptsOnsite===true,maxTickets,String(body.homeCity||'').trim()||null,String(body.homeState||'').trim().toUpperCase().slice(0,2)||null,body.serviceRadiusKm===''||body.serviceRadiusKm==null?null:Number(body.serviceRadiusKm),(Array.isArray(body.serviceCities)?body.serviceCities:[]).map(String),String(body.notes||'').trim()||null]);
        const profileId=saved.rows[0].id;
        await Promise.all([client.query('DELETE FROM public.technician_profile_specialties WHERE technician_profile_id=$1',[profileId]),client.query('DELETE FROM public.technician_authorized_services WHERE technician_profile_id=$1',[profileId]),client.query('DELETE FROM public.technician_working_hours WHERE technician_profile_id=$1',[profileId]),client.query('DELETE FROM public.technician_time_off WHERE technician_profile_id=$1',[profileId])]);
        for(const id of Array.isArray(body.specialties)?body.specialties:[]) await client.query('INSERT INTO public.technician_profile_specialties(technician_profile_id,specialty_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[profileId,id]);
        for(const slug of Array.isArray(body.authorizedServices)?body.authorizedServices:[]) await client.query('INSERT INTO public.technician_authorized_services(technician_profile_id,service_slug) VALUES($1,$2) ON CONFLICT DO NOTHING',[profileId,slug]);
        for(const h of Array.isArray(body.workingHours)?body.workingHours:[]) if(Number.isInteger(Number(h.weekday))&&h.startTime&&h.endTime) await client.query('INSERT INTO public.technician_working_hours(technician_profile_id,weekday,start_time,end_time) VALUES($1,$2,$3,$4)',[profileId,Number(h.weekday),h.startTime,h.endTime]);
        for(const o of Array.isArray(body.timeOff)?body.timeOff:[]) if(o.startsAt&&o.endsAt) await client.query('INSERT INTO public.technician_time_off(technician_profile_id,starts_at,ends_at,reason) VALUES($1,$2,$3,$4)',[profileId,o.startsAt,o.endsAt,String(o.reason||'').trim()||null]);
        await client.query('COMMIT');transactionStarted=false; return json(res,200,{profile:saved.rows[0]});
      } catch(error){const incidentId=randomUUID();if(transactionStarted){try{await client.query('ROLLBACK');}catch(rollbackError){console.error('[ADMIN_TECHNICIAN_SAVE_ROLLBACK]',incidentId,rollbackError);}}console.error('[ADMIN_TECHNICIAN_SAVE]',incidentId,error);return json(res,500,{error:`Não foi possível salvar o técnico. Código: ${incidentId}`,incidentId});}
    }

    if (url.pathname === '/api/admin/users/create') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});const body=await readJson(req);
      const name=String(body.name||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),role=String(body.role||'client');
      if(!name||!/^\S+@\S+\.\S+$/.test(email)||password.length<6||!['client','partner','technician','admin'].includes(role))return json(res,400,{error:'Informe nome, e-mail válido, perfil e senha com ao menos 6 caracteres.'});
      const id=randomUUID(),initials=name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();await client.query('BEGIN');try{
        await client.query(`INSERT INTO public.profiles(id,email,name,company,phone,role,avatar_initials) VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,email,name,String(body.company||'').trim(),String(body.phone||'').trim(),role==='partner'?'client':role,initials]);
        await client.query(`INSERT INTO public.local_auth_users(id,password_hash) VALUES($1,$2)`,[id,hashPassword(password)]);
        if(role==='partner'){await ensurePartnerSchema(client);const referral=`${name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,20)||'partner'}-${Math.random().toString(36).slice(2,6)}`;await client.query(`INSERT INTO public.partner_profiles(user_id,referral_code,cpf_cnpj,status) VALUES($1,$2,$3,$4)`,[id,referral,String(body.cpfCnpj||''),body.partnerStatus==='ativo'?'ativo':'pendente']);}
        await client.query('COMMIT');return json(res,201,{status:'success',user:{id,name,email,role}});
      }catch(error){await client.query('ROLLBACK');if(String(error.message||'').includes('duplicate'))return json(res,409,{error:'Este e-mail já está cadastrado.'});throw error;}
    }

    if (url.pathname === '/api/admin/technical-services/create') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});const body=await readJson(req);const slug=String(body.slug||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'');const categories=['digital','automation','techcare','infrastructure','security'];
      if(!slug||!String(body.name||'').trim()||!categories.includes(body.category))return json(res,400,{error:'Nome, identificador e categoria são obrigatórios.'});const result=await client.query(`INSERT INTO public.commercial_services(slug,name,category,price_cents,price_label,recurring,active,sort_order,updated_by) VALUES($1,$2,$3,$4,$5,$6,TRUE,$7,$8) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,price_cents=EXCLUDED.price_cents,price_label=EXCLUDED.price_label,recurring=EXCLUDED.recurring,active=TRUE,updated_at=NOW(),updated_by=EXCLUDED.updated_by RETURNING *`,[slug,String(body.name).trim(),body.category,body.priceCents===''||body.priceCents==null?null:Number(body.priceCents),String(body.priceLabel||'sob orçamento'),body.recurring===true,Number(body.sortOrder||0),sessionProfile.id]);return json(res,201,{service:result.rows[0]});
    }

    if (url.pathname === '/api/admin/technical-tickets/create') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});const body=await readJson(req);const customer=(await client.query(`SELECT * FROM public.profiles WHERE id=$1`,[body.customerId])).rows[0];const service=(await client.query(`SELECT * FROM public.commercial_services WHERE slug=$1`,[body.serviceSlug])).rows[0];
      if(!customer||!service||!String(body.details||'').trim())return json(res,400,{error:'Cliente, serviço e descrição são obrigatórios.'});if(body.technicianId){const valid=(await client.query(`SELECT 1 FROM public.profiles WHERE id=$1 AND role='technician'`,[body.technicianId])).rows[0];if(!valid)return json(res,400,{error:'Técnico inválido.'});}
      const id=randomUUID(),assigned=body.technicianId||null;const result=await client.query(`INSERT INTO public.support_tickets(id,name,email,phone,company,subject,message,user_id,guest_token,service_slug,service_category,service_mode,service_city,service_state,assigned_technician_id,priority,assignment_status,assignment_source,assignment_reason,operational_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,[id,customer.name,customer.email,customer.phone,customer.company,String(body.subject||service.name).trim(),String(body.details).trim(),customer.id,randomUUID(),service.slug,service.category,body.serviceMode||'FLEXIBLE',String(body.city||'').trim()||null,String(body.state||'').trim().toUpperCase().slice(0,2)||null,assigned,['baixa','normal','alta','urgente'].includes(body.priority)?body.priority:'normal',assigned?'ASSIGNED':'AWAITING_MANUAL',assigned?'MANUAL':null,'Cadastro manual pelo administrador',assigned?'ASSIGNED':'REQUESTED']);if(assigned){await client.query(`INSERT INTO public.ticket_assignment_history(ticket_id,new_technician_id,source,reason,changed_by) VALUES($1,$2,'MANUAL',$3,$4)`,[id,assigned,'Cadastro manual pelo administrador',sessionProfile.id]);await client.query(`INSERT INTO public.technician_notifications(technician_id,ticket_id,type,title,message) VALUES($1,$2,'NEW_TICKET','Novo atendimento',$3)`,[assigned,id,result.rows[0].subject]);}return json(res,201,{ticket:result.rows[0]});
    }

    if (url.pathname === '/api/admin/support-ticket/delete') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});const body=await readJson(req);const result=await client.query(`DELETE FROM public.support_tickets WHERE id=$1 RETURNING id`,[body.ticketId]);if(!result.rows[0])return json(res,404,{error:'Ticket não encontrado.'});return json(res,200,{status:'success'});
    }

    if (url.pathname === '/api/technician/profile') {
      const sessionProfile=await getSessionProfile(req,client); if(sessionProfile?.role!=='technician') return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});
      const result=await client.query('SELECT * FROM public.technician_profiles WHERE user_id=$1',[sessionProfile.id]); return json(res,200,{profile:result.rows[0]||null});
    }

    if (url.pathname === '/api/technician/availability') {
      const sessionProfile=await getSessionProfile(req,client); if(sessionProfile?.role!=='technician') return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});
      const body=await readJson(req); const allowed=['AVAILABLE','BUSY','ON_ROUTE','IN_SERVICE','BREAK','ABSENT','OFFLINE'];
      if(!allowed.includes(body.status)) return json(res,400,{error:'Status inválido.'});
      const result=await client.query(`UPDATE public.technician_profiles SET availability_status=$1,updated_at=NOW() WHERE user_id=$2 AND employment_status='ACTIVE' RETURNING *`,[body.status,sessionProfile.id]);
      if(!result.rows[0]) return json(res,409,{error:'Perfil profissional ativo ainda não configurado pelo administrador.'}); return json(res,200,{profile:result.rows[0]});
    }

    if (url.pathname === '/api/technician/operations') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='technician')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});
      const [calendar,notifications,metrics]=await Promise.all([
        client.query(`SELECT * FROM public.technician_calendar_events WHERE technician_id=$1 AND ends_at>=NOW()-INTERVAL '1 day' ORDER BY starts_at LIMIT 100`,[sessionProfile.id]),
        client.query(`SELECT * FROM public.technician_notifications WHERE technician_id=$1 ORDER BY created_at DESC LIMIT 100`,[sessionProfile.id]),
        client.query(`SELECT COUNT(*) FILTER(WHERE status<>'fechado')::int active,COUNT(*) FILTER(WHERE operational_status='ASSIGNED')::int awaiting_acceptance,COUNT(*) FILTER(WHERE operational_status='IN_SERVICE')::int in_service,COUNT(*) FILTER(WHERE service_mode='ONSITE' AND status<>'fechado')::int onsite,COUNT(*) FILTER(WHERE service_mode='REMOTE' AND status<>'fechado')::int remote FROM public.support_tickets WHERE assigned_technician_id=$1`,[sessionProfile.id])]);
      return json(res,200,{calendar:calendar.rows,notifications:notifications.rows,metrics:metrics.rows[0]});
    }

    if (url.pathname === '/api/technician/notifications/read') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='technician')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});const body=await readJson(req);
      await client.query(`UPDATE public.technician_notifications SET read_at=NOW() WHERE technician_id=$1 AND ($2::uuid IS NULL OR id=$2)`,[sessionProfile.id,body.id||null]);return json(res,200,{status:'success'});
    }

    if (url.pathname === '/api/technician/ticket-action') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='technician')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});const body=await readJson(req);const action=String(body.action||'').toUpperCase();
      const ticket=(await client.query(`SELECT * FROM public.support_tickets WHERE id=$1 AND assigned_technician_id=$2`,[body.ticketId,sessionProfile.id])).rows[0];if(!ticket)return json(res,404,{error:'Chamado não encontrado ou não atribuído a você.'});
      await client.query('BEGIN');try{
        if(action==='ACCEPT'){await client.query(`UPDATE public.support_tickets SET assignment_status='ACCEPTED',operational_status='ACCEPTED',accepted_at=NOW() WHERE id=$1`,[ticket.id]);}
        else if(action==='REJECT'){const reason=String(body.reason||'').trim();if(!reason){await client.query('ROLLBACK');return json(res,400,{error:'Informe o motivo da recusa.'});}const ranked=await rankTechnicians(client,{serviceSlug:ticket.service_slug,mode:ticket.service_mode||'FLEXIBLE',city:ticket.service_city,state:ticket.service_state,requiredSpecialty:ticket.required_specialty});const next=ranked.find(c=>c.eligible&&c.id!==sessionProfile.id)||null;await client.query(`UPDATE public.support_tickets SET assigned_technician_id=$1,assignment_status=$2,assignment_source=$3,assignment_score=$4,assignment_reason=$5,rejected_at=NOW(),rejection_reason=$6,operational_status=$7 WHERE id=$8`,[next?.id||null,next?'ASSIGNED':'AWAITING_MANUAL',next?'REASSIGNMENT':null,next?.score||null,next?next.reasons.join(', '):'Nenhum técnico elegível após recusa',reason,next?'ASSIGNED':'REQUESTED',ticket.id]);await client.query(`INSERT INTO public.ticket_assignment_history(ticket_id,previous_technician_id,new_technician_id,source,score,reason,changed_by) VALUES($1,$2,$3,'REASSIGNMENT',$4,$5,$6)`,[ticket.id,sessionProfile.id,next?.id||null,next?.score||null,reason,sessionProfile.id]);if(next)await client.query(`INSERT INTO public.technician_notifications(technician_id,ticket_id,type,title,message) VALUES($1,$2,'NEW_TICKET','Novo atendimento',$3)`,[next.id,ticket.id,ticket.subject]);}
        else if(['START','RESUME'].includes(action)){const open=await client.query(`SELECT 1 FROM public.ticket_time_entries WHERE ticket_id=$1 AND technician_id=$2 AND ended_at IS NULL`,[ticket.id,sessionProfile.id]);if(!open.rows[0])await client.query(`INSERT INTO public.ticket_time_entries(ticket_id,technician_id,started_at,billable,entry_type,notes) VALUES($1,$2,NOW(),$3,'SERVICE',$4)`,[ticket.id,sessionProfile.id,body.billable!==false,String(body.notes||'').slice(0,1000)||null]);await client.query(`UPDATE public.support_tickets SET operational_status='IN_SERVICE',status='respondido',started_at=COALESCE(started_at,NOW()) WHERE id=$1`,[ticket.id]);}
        else if(action==='PAUSE'){await client.query(`UPDATE public.ticket_time_entries SET ended_at=NOW(),duration_minutes=GREATEST(1,FLOOR(EXTRACT(EPOCH FROM(NOW()-started_at))/60))::int WHERE ticket_id=$1 AND technician_id=$2 AND ended_at IS NULL`,[ticket.id,sessionProfile.id]);await client.query(`UPDATE public.support_tickets SET operational_status='PAUSED' WHERE id=$1`,[ticket.id]);}
        else if(action==='ON_ROUTE'){await client.query(`UPDATE public.support_tickets SET operational_status='ON_ROUTE',departure_at=NOW() WHERE id=$1`,[ticket.id]);}
        else if(action==='ON_SITE'){await client.query(`UPDATE public.support_tickets SET operational_status='ON_SITE',arrival_at=NOW() WHERE id=$1`,[ticket.id]);}
        else if(action==='FINISH'){await client.query(`UPDATE public.ticket_time_entries SET ended_at=NOW(),duration_minutes=GREATEST(1,FLOOR(EXTRACT(EPOCH FROM(NOW()-started_at))/60))::int WHERE ticket_id=$1 AND technician_id=$2 AND ended_at IS NULL`,[ticket.id,sessionProfile.id]);await client.query(`UPDATE public.support_tickets SET operational_status='FINISHED',status='fechado',resolved_at=NOW(),service_finished_at=NOW() WHERE id=$1`,[ticket.id]);}
        else{await client.query('ROLLBACK');return json(res,400,{error:'Ação inválida.'});}
        await client.query(`INSERT INTO public.ticket_events(ticket_id,actor_id,event_type,details) VALUES($1,$2,$3,$4)`,[ticket.id,sessionProfile.id,action,JSON.stringify({reason:body.reason||null})]);await client.query('COMMIT');return json(res,200,{status:'success'});
      }catch(error){await client.query('ROLLBACK');throw error;}
    }

    if (url.pathname === '/api/technician/calendar') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='technician')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});const body=await readJson(req);
      if(!body.title||!body.startsAt||!body.endsAt||!['ONSITE','REMOTE','MAINTENANCE','BLOCK'].includes(body.eventType))return json(res,400,{error:'Preencha título, tipo, início e fim do agendamento.'});
      const startsAt=new Date(body.startsAt);const endsAt=new Date(body.endsAt);
      if(Number.isNaN(startsAt.getTime())||Number.isNaN(endsAt.getTime()))return json(res,400,{error:'Data ou horário inválido.'});
      if(endsAt<=startsAt)return json(res,400,{error:'O término deve ser posterior ao início.'});
      try{const overlap=await client.query(`SELECT id,title FROM public.technician_calendar_events WHERE technician_id=$1 AND starts_at<$3 AND ends_at>$2 LIMIT 1`,[sessionProfile.id,startsAt.toISOString(),endsAt.toISOString()]);if(overlap.rows[0])return json(res,409,{error:`Já existe um compromisso nesse período: ${overlap.rows[0].title}.`});const result=await client.query(`INSERT INTO public.technician_calendar_events(technician_id,ticket_id,event_type,title,starts_at,ends_at,notes,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$1) RETURNING *`,[sessionProfile.id,body.ticketId||null,body.eventType,String(body.title).trim().slice(0,300),startsAt.toISOString(),endsAt.toISOString(),String(body.notes||'').trim().slice(0,2000)||null]);return json(res,201,{event:result.rows[0]});}catch(error){const incidentId=randomUUID();console.error('[TECH_CALENDAR_CREATE]',incidentId,error);return json(res,500,{error:'Não foi possível salvar o agendamento. Informe o código ao suporte.',incidentId});}
    }

    if (url.pathname === '/api/technician/service-order') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='technician')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para técnicos.'});const body=await readJson(req);const ticket=(await client.query(`SELECT * FROM public.support_tickets WHERE id=$1 AND assigned_technician_id=$2`,[body.ticketId,sessionProfile.id])).rows[0];if(!ticket)return json(res,404,{error:'Chamado inválido.'});
      if(body.status==='WAITING_APPROVAL')body.status='AWAITING_APPROVAL';const orderStatuses=['DRAFT','AWAITING_APPROVAL','APPROVED','COMPLETED','CANCELLED'];if(!orderStatuses.includes(body.status||'DRAFT'))return json(res,400,{error:'Status da ordem de serviço inválido.'});
      const order=await client.query(`INSERT INTO public.service_orders(ticket_id,customer_id,technician_id,equipment_id,problem,diagnosis,service_performed,travel_km,travel_cost_cents,notes,status,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT(ticket_id) DO UPDATE SET equipment_id=EXCLUDED.equipment_id,problem=EXCLUDED.problem,diagnosis=EXCLUDED.diagnosis,service_performed=EXCLUDED.service_performed,travel_km=EXCLUDED.travel_km,travel_cost_cents=EXCLUDED.travel_cost_cents,notes=EXCLUDED.notes,status=EXCLUDED.status,updated_at=NOW() RETURNING *`,[ticket.id,ticket.user_id,sessionProfile.id,body.equipmentId||null,String(body.problem||ticket.message),String(body.diagnosis||''),String(body.servicePerformed||''),body.travelKm||null,body.travelCostCents||null,String(body.notes||''),body.status||'DRAFT']);
      for(const part of Array.isArray(body.parts)?body.parts:[])await client.query(`INSERT INTO public.service_order_parts(service_order_id,name,description,quantity,estimated_price_cents,created_by) VALUES($1,$2,$3,$4,$5,$6)`,[order.rows[0].id,String(part.name),String(part.description||''),Number(part.quantity||1),Number(part.estimatedPriceCents||0),sessionProfile.id]);return json(res,200,{order:order.rows[0]});
    }

    if (url.pathname === '/api/client/technical-overview') {
      const sessionProfile=await getSessionProfile(req,client);if(!sessionProfile||sessionProfile.role!=='client')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para clientes.'});
      const [tickets,orders,equipment,balances]=await Promise.all([
        client.query(`SELECT t.id,t.subject,t.status,t.operational_status,t.priority,t.service_mode,t.created_at,t.accepted_at,t.started_at,t.resolved_at,t.assignment_status,p.name technician_name,(SELECT COALESCE(json_agg(json_build_object('type',e.event_type,'at',e.created_at,'details',e.details) ORDER BY e.created_at),'[]') FROM public.ticket_events e WHERE e.ticket_id=t.id) timeline FROM public.support_tickets t LEFT JOIN public.profiles p ON p.id=t.assigned_technician_id WHERE t.user_id=$1 ORDER BY t.created_at DESC`,[sessionProfile.id]),
        client.query(`SELECT o.*,COALESCE((SELECT json_agg(x.*) FROM public.service_order_parts x WHERE x.service_order_id=o.id),'[]') parts FROM public.service_orders o WHERE o.customer_id=$1 ORDER BY o.created_at DESC`,[sessionProfile.id]),
        client.query(`SELECT * FROM public.customer_equipment WHERE user_id=$1 ORDER BY name`,[sessionProfile.id]),
        client.query(`SELECT b.*,(SELECT COALESCE(SUM(te.duration_minutes),0)::int FROM public.ticket_time_entries te JOIN public.support_tickets t ON t.id=te.ticket_id WHERE t.user_id=b.user_id AND te.billable=TRUE AND te.entry_type='SERVICE' AND te.started_at::date BETWEEN b.period_start AND b.period_end) used_minutes FROM public.techcare_balances b WHERE b.user_id=$1 ORDER BY period_start DESC`,[sessionProfile.id])]);
      return json(res,200,{tickets:tickets.rows,orders:orders.rows,equipment:equipment.rows,balances:balances.rows});
    }
    if (url.pathname === '/api/client/ticket-review') {
      const sessionProfile=await getSessionProfile(req,client);if(!sessionProfile||sessionProfile.role!=='client')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para clientes.'});const body=await readJson(req);const rating=Number(body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return json(res,400,{error:'Avaliação inválida.'});
      const ticket=(await client.query(`SELECT assigned_technician_id FROM public.support_tickets WHERE id=$1 AND user_id=$2 AND status='fechado'`,[body.ticketId,sessionProfile.id])).rows[0];if(!ticket)return json(res,404,{error:'Chamado concluído não encontrado.'});const result=await client.query(`INSERT INTO public.ticket_reviews(ticket_id,technician_id,customer_id,rating,comment) VALUES($1,$2,$3,$4,$5) ON CONFLICT(ticket_id) DO UPDATE SET rating=EXCLUDED.rating,comment=EXCLUDED.comment RETURNING *`,[body.ticketId,ticket.assigned_technician_id,sessionProfile.id,rating,String(body.comment||'').slice(0,2000)||null]);return json(res,200,{review:result.rows[0]});
    }
    if (url.pathname === '/api/client/part-approval') {
      const sessionProfile=await getSessionProfile(req,client);if(!sessionProfile||sessionProfile.role!=='client')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para clientes.'});const body=await readJson(req);const value=body.approved===true?'APPROVED':'REJECTED';const result=await client.query(`UPDATE public.service_order_parts x SET approval_status=$1,approved_by=$2,approved_at=NOW() FROM public.service_orders o WHERE x.id=$3 AND o.id=x.service_order_id AND o.customer_id=$2 RETURNING x.*`,[value,sessionProfile.id,body.partId]);if(!result.rows[0])return json(res,404,{error:'Peça não encontrada.'});return json(res,200,{part:result.rows[0]});
    }
    if (url.pathname === '/api/admin/technical-analytics') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});
      const result=await client.query(`SELECT p.id,p.name,COUNT(t.id)::int received,COUNT(t.id) FILTER(WHERE t.accepted_at IS NOT NULL)::int accepted,COUNT(t.id) FILTER(WHERE t.rejected_at IS NOT NULL)::int rejected,COUNT(t.id) FILTER(WHERE t.status='fechado')::int completed,ROUND(AVG(EXTRACT(EPOCH FROM(t.accepted_at-t.created_at))/60) FILTER(WHERE t.accepted_at IS NOT NULL)) acceptance_minutes,ROUND(AVG(EXTRACT(EPOCH FROM(t.resolved_at-t.started_at))/60) FILTER(WHERE t.resolved_at IS NOT NULL AND t.started_at IS NOT NULL)) service_minutes,ROUND(AVG(r.rating),2) rating FROM public.profiles p LEFT JOIN public.support_tickets t ON t.assigned_technician_id=p.id LEFT JOIN public.ticket_reviews r ON r.ticket_id=t.id WHERE p.role='technician' GROUP BY p.id,p.name ORDER BY p.name`);return json(res,200,{analytics:result.rows});
    }
    if (url.pathname === '/api/admin/technician-governance') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});const body=await readJson(req);
      if(body.kind==='permission'){if(body.enabled)await client.query(`INSERT INTO public.technician_permissions(technician_id,permission,granted_by) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,[body.technicianId,body.permission,sessionProfile.id]);else await client.query(`DELETE FROM public.technician_permissions WHERE technician_id=$1 AND permission=$2`,[body.technicianId,body.permission]);}
      else if(body.kind==='compensation')await client.query(`INSERT INTO public.technician_compensation_rules(technician_id,service_slug,category,compensation_type,value) VALUES($1,$2,$3,$4,$5)`,[body.technicianId,body.serviceSlug||null,body.category||null,body.compensationType,Number(body.value||0)]);
      else return json(res,400,{error:'Operação inválida.'});return json(res,200,{status:'success'});
    }
    if (url.pathname === '/api/admin/technician-governance-data') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});
      const userId=String(url.searchParams.get('userId')||'');
      const [permissions,compensation]=await Promise.all([client.query('SELECT * FROM public.technician_permissions WHERE technician_id=$1 ORDER BY permission',[userId]),client.query('SELECT * FROM public.technician_compensation_rules WHERE technician_id=$1 ORDER BY created_at DESC',[userId])]);
      return json(res,200,{permissions:permissions.rows,compensation:compensation.rows});
    }

    if (url.pathname === '/api/service-requests') {
      const body = await readJson(req);
      const serviceSlug = String(body.serviceSlug || '').trim();
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const phone = String(body.phone || '').trim();
      const company = String(body.company || '').trim();
      const city = String(body.city || '').trim();
      const state = String(body.state || '').trim().toUpperCase().slice(0,2);
      const serviceMode = ['REMOTE','ONSITE','FLEXIBLE'].includes(body.serviceMode) ? body.serviceMode : 'FLEXIBLE';
      const details = String(body.details || '').trim();
      const requestedItem = String(body.requestedItem || '').trim();
      if (!serviceSlug || !name || !email || !phone || !details) return json(res, 400, { error: 'Preencha nome, e-mail, telefone e detalhes da solicitação.' });
      const serviceResult = await client.query('SELECT slug, name, category FROM public.commercial_services WHERE slug = $1 AND active = TRUE', [serviceSlug]);
      const service = serviceResult.rows[0];
      if (!service) return json(res, 404, { error: 'Serviço não encontrado ou indisponível.' });
      const technicalCategories = new Set(['techcare', 'infrastructure', 'security']);
      let technicianId = null;
      let assignment = null;
      if (technicalCategories.has(service.category)) {
        const ranked = await rankTechnicians(client,{serviceSlug:service.slug,mode:serviceMode,city,state});
        assignment = ranked.find(item=>item.eligible) || null;
        technicianId = assignment?.id || null;
      }
      const sessionProfile = await getSessionProfile(req, client);
      const linkedProfile = sessionProfile || (await client.query('SELECT id FROM public.profiles WHERE LOWER(email) = LOWER($1) LIMIT 1', [email])).rows[0];
      const ticketId = randomUUID(); const messageId = randomUUID(); const guestToken = randomBytes(32).toString('hex');
      const subject = `Solicitação de serviço: ${requestedItem || service.name}`.slice(0, 300);
      const message = [`Serviço: ${service.name}`, requestedItem && requestedItem !== service.name ? `Item solicitado: ${requestedItem}` : '', city ? `Cidade: ${city}` : '', '', details].filter(Boolean).join('\n').slice(0, 10000);
      await client.query('BEGIN');
      try {
        await client.query(`INSERT INTO public.support_tickets (id,name,email,phone,company,subject,message,user_id,guest_token,assigned_technician_id,priority,service_slug,service_category,service_mode,service_city,service_state,required_specialty,assignment_status,assignment_score,assignment_reason,assignment_source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'normal',$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`, [ticketId,name,email,phone,company || null,subject,message,linkedProfile?.id || null,guestToken,technicianId,service.slug,service.category,serviceMode,city||null,state||null,SERVICE_SPECIALTY_MAP[service.slug]||null,technicianId?'ASSIGNED':'AWAITING_MANUAL',assignment?.score||null,assignment?assignment.reasons.join(', '):'Nenhum técnico elegível',technicianId?'AUTOMATIC':null]);
        await client.query(`INSERT INTO public.ticket_messages (id,ticket_id,sender_role,message,sender_name) VALUES ($1,$2,'client',$3,$4)`, [messageId,ticketId,message,name]);
        const sla=(await client.query(`SELECT * FROM public.sla_rules WHERE active=TRUE AND priority='normal' AND (service_slug=$1 OR service_slug IS NULL) ORDER BY service_slug NULLS LAST LIMIT 1`,[service.slug])).rows[0];if(sla)await client.query(`UPDATE public.support_tickets SET sla_accept_by=NOW()+($2||' minutes')::interval,sla_response_by=NOW()+($3||' minutes')::interval WHERE id=$1`,[ticketId,sla.acceptance_minutes,sla.first_response_minutes]);
        if(technicianId){await client.query(`INSERT INTO public.ticket_assignment_history(ticket_id,new_technician_id,source,score,reason) VALUES($1,$2,'AUTOMATIC',$3,$4)`,[ticketId,technicianId,assignment.score,assignment.reasons.join(', ')]);await client.query(`INSERT INTO public.technician_notifications(technician_id,ticket_id,type,title,message) VALUES($1,$2,'NEW_TICKET','Novo atendimento',$3)`,[technicianId,ticketId,subject]);}
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      return json(res, 201, { ticketId, trackingLink: `${appBaseUrl(req)}/suporte/ticket/${ticketId}?token=${guestToken}`, routedToTechnician: Boolean(technicianId), routing: technicalCategories.has(service.category) ? 'client-admin-technician' : 'client-admin' });
    }

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
                technical_notes, started_at,service_slug,service_category,service_mode,service_city,service_state,
                assignment_status,assignment_score,assignment_reason,assignment_source
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
      const previous=await client.query('SELECT assigned_technician_id FROM public.support_tickets WHERE id=$1',[body.ticketId]);
      const result = await client.query(
        `UPDATE public.support_tickets SET assigned_technician_id = $1, priority = $2, assignment_status=$3,assignment_source='MANUAL',assignment_reason=$4
         WHERE id = $5 RETURNING id, assigned_technician_id, priority, assignment_status`,
        [technicianId, ['baixa','normal','alta','urgente'].includes(body.priority) ? body.priority : 'normal',technicianId?'ASSIGNED':'AWAITING_MANUAL',String(body.reason||'Atribuição manual pelo administrador').slice(0,1000),body.ticketId],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Chamado não encontrado.' });
      await client.query(`INSERT INTO public.ticket_assignment_history(ticket_id,previous_technician_id,new_technician_id,source,reason,changed_by) VALUES($1,$2,$3,'MANUAL',$4,$5)`,[body.ticketId,previous.rows[0]?.assigned_technician_id||null,technicianId,String(body.reason||'Atribuição manual pelo administrador').slice(0,1000),sessionProfile.id]);
      return json(res, 200, { ticket: result.rows[0] });
    }

    if (url.pathname === '/api/admin/ticket-assignment-options') {
      const sessionProfile=await getSessionProfile(req,client);if(sessionProfile?.role!=='admin')return json(res,sessionProfile?403:401,{error:'Acesso exclusivo para administradores.'});
      const ticket=(await client.query(`SELECT id,service_slug,service_mode,service_city,service_state,required_specialty FROM public.support_tickets WHERE id=$1`,[url.searchParams.get('ticketId')])).rows[0];
      if(!ticket)return json(res,404,{error:'Chamado não encontrado.'});
      const candidates=await rankTechnicians(client,{serviceSlug:ticket.service_slug,mode:ticket.service_mode||'FLEXIBLE',city:ticket.service_city,state:ticket.service_state,requiredSpecialty:ticket.required_specialty});
      return json(res,200,{candidates:candidates.map(c=>({id:c.id,name:c.name,eligible:c.eligible,score:c.score,reasons:c.reasons,failures:c.failures,availability_status:c.availability_status,active_tickets:c.active_tickets,max_simultaneous_tickets:c.max_simultaneous_tickets,home_city:c.home_city,technical_level:c.technical_level}))});
    }

    if (url.pathname === '/api/technician/tickets') {
      const sessionProfile = await getSessionProfile(req, client);
      if (sessionProfile?.role !== 'technician') return json(res, sessionProfile ? 403 : 401, { error: 'Acesso exclusivo para técnicos.' });
      const result = await client.query(
        `SELECT id, name, company, phone, subject, message, status, priority, technical_notes,
                created_at, started_at, resolved_at,assignment_status,operational_status,service_mode,service_city,service_state,sla_accept_by,sla_response_by
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
      if (!String(body.name || '').trim() || !['tool','driver','document','script','knowledge'].includes(body.category) || !/^https?:\/\//i.test(String(body.url || ''))) {
        return json(res, 400, { error: 'Nome, categoria e URL HTTP(S) válida são obrigatórios.' });
      }
      const result = body.id
        ? await client.query(
            `UPDATE public.technical_resources SET name=$1,description=$2,category=$3,platform=$4,version=$5,url=$6,active=$7,sort_order=$8,manufacturer=$9,model=$10,official=$11,last_verified_at=$12,updated_at=NOW()
             WHERE id=$13 RETURNING *`, [body.name.trim(), String(body.description || '').trim(), body.category, String(body.platform || 'Todos').trim(), String(body.version || '').trim() || null, body.url.trim(), body.active !== false, Number(body.sortOrder || 0),String(body.manufacturer||'').trim()||null,String(body.model||'').trim()||null,body.official===true,body.lastVerifiedAt||null,body.id])
        : await client.query(
            `INSERT INTO public.technical_resources(name,description,category,platform,version,url,active,sort_order,manufacturer,model,official,last_verified_at,created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, [body.name.trim(), String(body.description || '').trim(), body.category, String(body.platform || 'Todos').trim(), String(body.version || '').trim() || null, body.url.trim(), body.active !== false, Number(body.sortOrder || 0),String(body.manufacturer||'').trim()||null,String(body.model||'').trim()||null,body.official===true,body.lastVerifiedAt||null,sessionProfile.id]);
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
  ['/api/partners/public-stats', 'GET'],
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

    if (url.pathname === '/api/partners/public-stats') {
      const [partnerCount, commissionSum] = await Promise.all([
        client.query(`SELECT COUNT(*) FROM public.partner_profiles WHERE status = 'ativo'`),
        client.query(`SELECT COALESCE(SUM(commission_value), 0) AS total FROM public.partner_commissions WHERE status = 'confirmado'`),
      ]);

      const activePartners = Math.max(1, Number(partnerCount.rows[0]?.count || 0));
      const totalCommissionsCents = Math.round(Number(commissionSum.rows[0]?.total || 0) * 100);

      return json(res, 200, {
        activePartners,
        totalCommissionsFormatted: totalCommissionsCents > 0
          ? `R$ ${(totalCommissionsCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'R$ 0,00',
        recurringPercentage: 25,
      });
    }

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
  if (pathname === '/api/health' && req.method === 'GET') {
    return json(res, 200, {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: '2.0.0-pos-auditoria',
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: 'connected',
        canonicalEngagements: 'active',
        dualWrite: 'enabled',
      },
    });
  }

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
      const userProfile = {
        id,
        email: String(body.email).toLowerCase().trim(),
        name: body.name,
        company: body.company || '',
        phone: body.phone || '',
        role: 'client',
        avatarInitials: initials,
        isPartner,
      };
      const token = signToken({ sub: id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': sessionCookie(token),
        'Cache-Control': 'no-store',
      });
      return res.end(JSON.stringify({ ok: true, user: userProfile }));
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
    if (url.pathname === '/api/service-requests' || url.pathname.startsWith('/api/support/') || url.pathname.startsWith('/api/admin/') || url.pathname.startsWith('/api/technician/') || url.pathname.startsWith('/api/client/')) {
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
