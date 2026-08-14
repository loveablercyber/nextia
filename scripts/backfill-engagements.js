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

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 1000;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('[Backfill] Nenhuma DATABASE_URL encontrada. Execução finalizada.');
  process.exit(0);
}

const client = new pg.Client({
  connectionString,
  ssl: connectionString.includes('sslmode=require') || connectionString.includes('render.com') || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined,
});

function generatePublicCode() {
  return `ENG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function runBackfill() {
  console.log(`[Backfill] Conectando ao PostgreSQL (modo dry-run: ${isDryRun})...`);
  await client.connect();

  let processedCount = 0;
  let exactCount = 0;
  let inferredCount = 0;
  let reviewCount = 0;

  try {
    // 1. Load legacy projects without linked engagement_id
    const projectsRes = await client.query(`
      SELECT p.*, o.item_id AS order_item_id, o.item_name AS order_item_name, o.amount_cents AS order_amount
      FROM public.projects p
      LEFT JOIN public.commercial_orders o ON o.id = p.source_order_id
      WHERE p.engagement_id IS NULL
      ORDER BY p.created_at ASC
      LIMIT $1
    `, [limit]);

    console.log(`[Backfill] Encontrados ${projectsRes.rows.length} projetos legados para migrar.`);

    for (const project of projectsRes.rows) {
      processedCount++;
      const userRes = await client.query(`SELECT id FROM public.profiles WHERE id = $1`, [project.user_id]);
      
      if (!userRes.rows[0]) {
        reviewCount++;
        console.log(`[Backfill ISSUE] Projeto "${project.name}" (${project.id}) possui user_id inválido.`);
        if (!isDryRun) {
          await client.query(`
            INSERT INTO public.data_migration_issues (entity_type, entity_id, issue_code, description, evidence, status)
            VALUES ('project', $1, 'missing_user', 'Usuário proprietário do projeto não existe na tabela profiles', $2, 'needs_review')
            ON CONFLICT DO NOTHING
          `, [project.id, JSON.stringify({ userId: project.user_id, projectName: project.name })]);
        }
        continue;
      }

      // Determine service_slug & workflow_key
      let serviceSlug = 'sites';
      let serviceCategory = 'digital';
      let workflowKey = 'digital_site';
      let migrationState = 'exact';

      const nameLower = (project.name || '').toLowerCase();
      const segmentLower = (project.segment || '').toLowerCase();

      if (nameLower.includes('loja') || segmentLower.includes('e-commerce') || project.store_model_id) {
        serviceSlug = 'lojas-virtuais';
        serviceCategory = 'digital';
        workflowKey = 'digital_ecommerce';
      } else if (nameLower.includes('automação') || nameLower.includes('bot') || nameLower.includes('ia')) {
        serviceSlug = 'automacao-ia';
        serviceCategory = 'automation';
        workflowKey = 'automation_ia';
        migrationState = 'inferred';
      } else if (nameLower.includes('techcare') || nameLower.includes('suporte')) {
        serviceSlug = 'techcare';
        serviceCategory = 'techcare';
        workflowKey = 'techcare_maintenance';
        migrationState = 'inferred';
      }

      const publicCode = generatePublicCode();
      const activationCents = Math.round((Number(project.activation_fee) || 0) * 100);
      const monthlyCents = Math.round((Number(project.monthly_fee) || 0) * 100);

      if (!isDryRun) {
        await client.query('BEGIN');
        try {
          const engRes = await client.query(`
            INSERT INTO public.service_engagements
              (public_code, user_id, service_slug, service_name_snapshot, service_category, workflow_key, status, source_kind, source_order_id, source_contract_id, migration_state, activation_amount_cents, monthly_amount_cents)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'legacy', $8, $9, $10, $11, $12)
            RETURNING id
          `, [
            publicCode,
            project.user_id,
            serviceSlug,
            project.name || 'Serviço Migrado',
            serviceCategory,
            workflowKey,
            project.status === 'publicado' ? 'active' : 'awaiting_briefing',
            project.source_order_id || null,
            project.source_contract_id || null,
            migrationState,
            activationCents,
            monthlyCents,
          ]);

          const engagementId = engRes.rows[0].id;

          await client.query(`UPDATE public.projects SET engagement_id = $1 WHERE id = $2`, [engagementId, project.id]);

          if (project.domain && String(project.domain).trim()) {
            await client.query(`
              INSERT INTO public.service_domains (engagement_id, fqdn, mode, registration_fee_cents, status)
              VALUES ($1, $2, 'connect', 0, 'verified')
              ON CONFLICT (engagement_id) DO NOTHING
            `, [engagementId, String(project.domain).trim().toLowerCase()]);
          }

          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[Backfill ERROR] Falha ao migrar projeto ${project.id}:`, err.message);
          reviewCount++;
          continue;
        }
      }

      if (migrationState === 'exact') exactCount++;
      else inferredCount++;
    }

    console.log(`\n========================================`);
    console.log(`[Backfill Resumo] Processados: ${processedCount}`);
    console.log(`[Backfill Resumo] Mapeados Exatos: ${exactCount}`);
    console.log(`[Backfill Resumo] Mapeados Inferidos: ${inferredCount}`);
    console.log(`[Backfill Resumo] Marcados para Revisão: ${reviewCount}`);
    console.log(`========================================\n`);
  } finally {
    await client.end();
  }
}

runBackfill().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
