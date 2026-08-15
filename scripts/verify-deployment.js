import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = ['.env.production', '.env.development.local', '.env.local', '.env'];
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

async function verifyDeployment() {
  console.log('====================================================');
  console.log('[Deploy Check] Iniciando verificação de homologação...');
  console.log('====================================================\n');

  if (!connectionString) {
    console.log('[Deploy Check] AVISO: DATABASE_URL não configurada. Ignorando teste de banco.');
    process.exit(0);
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('render.com') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await client.connect();
    console.log('[Deploy Check] Conexão com banco de dados OK.');

    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map((r) => r.table_name);

    const requiredTables = [
      'schema_migrations',
      'service_engagements',
      'commercial_order_items',
      'service_domains',
      'briefing_submissions',
      'invoices',
      'data_migration_issues',
    ];

    let missing = 0;
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        console.log(`  ✓ Tabela public.${table} presente.`);
      } else {
        console.log(`  ✗ Tabela public.${table} AUSENTE!`);
        missing++;
      }
    }

    if (missing > 0) {
      console.error(`\n[Deploy Check ERRO] ${missing} tabelas essenciais ausentes. Execute "npm run db:migrate".`);
      process.exit(1);
    }

    console.log('\n[Deploy Check SUCESSO] Estrutura do banco de dados 100% pronta para produção!');
  } catch (err) {
    console.error('[Deploy Check ERRO]', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyDeployment();
