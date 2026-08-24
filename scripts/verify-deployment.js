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
  console.log('[Deploy Check] Iniciando verificação de homologação/produção...');
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
    console.log('[Deploy Check] Conexão com banco de dados OK.\n');

    // 1. Check Tables
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map((r) => r.table_name);

    const requiredTables = [
      'schema_migrations',
      'commercial_services',
      'commercial_plans',
      'commercial_store_templates',
      'commercial_store_drafts',
      'commercial_addons',
      'commercial_pricing_quotes',
      'commercial_orders',
      'commercial_order_items',
      'invoices',
      'invoice_items',
      'payment_transactions',
      'provider_webhook_events',
      'service_workflow_policies',
      'service_engagements',
      'service_domains',
      'briefing_submissions',
      'outbox_events',
      'data_migration_issues',
    ];

    let missingTables = 0;
    console.log('--- Verificação de Tabelas ---');
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        console.log(`  ✓ public.${table}`);
      } else {
        console.log(`  ✗ public.${table} AUSENTE!`);
        missingTables++;
      }
    }

    if (missingTables > 0) {
      throw new Error(`${missingTables} tabelas obrigatórias ausentes. Execute "npm run db:migrate".`);
    }

    // 2. Check Critical Columns
    console.log('\n--- Verificação de Colunas Críticas ---');
    const colsRes = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);
    const colMap = new Set(colsRes.rows.map((r) => `${r.table_name}.${r.column_name}`));

    const requiredColumns = [
      'commercial_pricing_quotes.normalized_selection',
      'commercial_pricing_quotes.consumed_order_id',
      'commercial_pricing_quotes.expires_at',
      'commercial_orders.pricing_quote_id',
      'commercial_orders.idempotency_key',
      'commercial_orders.engagement_id',
      'commercial_orders.service_slug_snapshot',
      'commercial_orders.service_name_snapshot',
      'commercial_orders.plan_name_snapshot',
      'commercial_orders.template_name_snapshot',
      'commercial_orders.domain_fqdn',
      'invoices.order_id',
      'invoices.engagement_id',
      'commercial_store_templates.service_slug',
      'commercial_store_templates.price_cents',
      'commercial_store_templates.activation_fee_cents',
      'commercial_store_templates.cover_image',
      'commercial_addons.service_slug',
      'commercial_addons.amount_cents',
      'commercial_addons.billing_cycle',
      'provider_webhook_events.resource_id',
      'projects.engagement_id',
      'projects.source_order_id',
      'projects.service_slug',
    ];

    let missingCols = 0;
    for (const col of requiredColumns) {
      if (colMap.has(col)) {
        console.log(`  ✓ ${col}`);
      } else {
        console.log(`  ✗ ${col} AUSENTE!`);
        missingCols++;
      }
    }

    if (missingCols > 0) {
      throw new Error(`${missingCols} colunas obrigatórias ausentes.`);
    }

    // 3. Check Migrations
    console.log('\n--- Verificação de Migrações Aplicadas ---');
    const migRes = await client.query('SELECT version FROM public.schema_migrations ORDER BY version ASC');
    const appliedMigrations = migRes.rows.map((r) => r.version);
    console.log(`  Migrações registradas: ${appliedMigrations.join(', ')}`);

    // 4. Check Addons Seed (Domain registration)
    const addonCheck = await client.query("SELECT code, amount_cents FROM public.commercial_addons WHERE code = 'domain-registration'");
    if (!addonCheck.rows[0]) {
      throw new Error('Opcional de domínio "domain-registration" não encontrado em commercial_addons.');
    }
    console.log(`  ✓ Opcional de domínio configurado: R$ ${(addonCheck.rows[0].amount_cents / 100).toFixed(2)}`);

    // 5. Check Template Data
    const tplCheck = await client.query("SELECT count(*)::int AS count FROM public.commercial_store_templates WHERE service_slug = 'sites-prontos'");
    console.log(`  ✓ Modelos de sites prontos cadastrados: ${tplCheck.rows[0].count}`);

    console.log('\n====================================================');
    console.log('[Deploy Check SUCESSO] Estrutura do banco de dados 100% pronta para produção!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n[Deploy Check ERRO]', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyDeployment();
