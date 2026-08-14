import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = ['.env.development.local', '.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.join(rootDir, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('[Migrate] Nenhuma DATABASE_URL encontrada. Pulando migração remota (modo offline).');
  process.exit(0);
}

const client = new pg.Client({
  connectionString,
  ssl: connectionString.includes('sslmode=require') || connectionString.includes('render.com') || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function runMigrations() {
  console.log('[Migrate] Conectando ao PostgreSQL...');
  await client.connect();

  const LOCK_ID = 987654321;
  try {
    console.log('[Migrate] Solicitando advisory lock...');
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);

    // Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Fetch existing executed migrations
    const res = await client.query('SELECT version, checksum FROM public.schema_migrations ORDER BY version ASC');
    const executedMap = new Map();
    for (const row of res.rows) {
      executedMap.set(row.version, row.checksum);
    }

    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[Migrate] Diretório database/migrations não encontrado.');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`[Migrate] Encontrados ${files.length} arquivos de migração.`);

    for (const file of files) {
      const version = file;
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const checksum = crypto.createHash('sha256').update(sqlContent).digest('hex');

      if (executedMap.has(version)) {
        const prevChecksum = executedMap.get(version);
        if (prevChecksum !== checksum) {
          throw new Error(`[Migrate ERROR] Checksum divergente na migração já executada "${version}". Esperado: ${prevChecksum}, Atual: ${checksum}`);
        }
        console.log(`[Migrate] ✔ Migration "${version}" já executada (checksum verificado).`);
      } else {
        console.log(`[Migrate] ⚙ Executando nova migração "${version}"...`);
        await client.query('BEGIN');
        try {
          await client.query(sqlContent);
          await client.query(
            'INSERT INTO public.schema_migrations (version, checksum, executed_at) VALUES ($1, $2, NOW())',
            [version, checksum]
          );
          await client.query('COMMIT');
          console.log(`[Migrate] ✅ Migration "${version}" executada com sucesso!`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw new Error(`[Migrate ERROR] Falha ao executar migração "${version}": ${err.message}`);
        }
      }
    }

    console.log('[Migrate] ✨ Todas as migrações foram verificadas/executadas com sucesso!');
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
    } catch {
      // Ignore unlock failure on exit
    }
    await client.end();
  }
}

runMigrations().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
