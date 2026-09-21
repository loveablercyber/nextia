import { createHash } from 'node:crypto';

const CLIENT_VISIBILITIES = new Set(['client', 'both']);
const ALL_VISIBILITIES = new Set(['internal', 'client', 'both']);
const TASK_STATUSES = new Set(['pending', 'in_progress', 'blocked', 'completed', 'cancelled']);
const PROJECT_STATUSES = new Set([
  'aguardando-briefing', 'em-desenvolvimento', 'em-revisao', 'aguardando-aprovacao',
  'aprovado', 'publicado', 'em-manutencao', 'pausado', 'cancelado', 'concluido',
]);
let projectOperationsSchemaPromise;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return UUID_PATTERN.test(String(value || ''));
}

export function normalizeVisibility(value, fallback = 'both') {
  return ALL_VISIBILITIES.has(value) ? value : fallback;
}

export function isClientVisible(visibility) {
  return CLIENT_VISIBILITIES.has(visibility);
}

export function calculateMilestoneProgress(milestones) {
  const valid = milestones.filter((item) => item.status !== 'cancelado');
  if (valid.length === 0) return 0;
  const completed = valid.filter((item) => item.status === 'concluido').length;
  return Math.round((completed / valid.length) * 100);
}

export function isAllowedProjectFile(mimeType, buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > 20 * 1024 * 1024) return false;
  const mime = String(mimeType || '').toLowerCase();
  const starts = (...bytes) => bytes.every((byte, index) => buffer[index] === byte);
  if (mime === 'image/jpeg') return starts(0xff, 0xd8, 0xff);
  if (mime === 'image/png') return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (mime === 'image/gif') return buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a';
  if (mime === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (mime === 'application/pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (mime === 'text/plain' || mime === 'text/csv') return !buffer.subarray(0, Math.min(buffer.length, 4096)).includes(0);
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return starts(0x50, 0x4b, 0x03, 0x04);
  }
  return false;
}

export function safeFileName(value) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/]/g, '_')
    .trim()
    .slice(0, 255);
}

export async function ensureProjectOperationsSchema(client) {
  if (!projectOperationsSchemaPromise) projectOperationsSchemaPromise = client.query(`
    ALTER TABLE public.projects
      ADD COLUMN IF NOT EXISTS crm_proposal_id UUID REFERENCES public.crm_proposals(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE public.milestones
      ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'both',
      ADD COLUMN IF NOT EXISTS requires_client_action BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE public.files
      ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'both',
      ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS storage_resource_type TEXT;
    ALTER TABLE public.change_requests
      ADD COLUMN IF NOT EXISTS requested_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS request_kind TEXT NOT NULL DEFAULT 'general',
      ADD COLUMN IF NOT EXISTS deliverable_id UUID,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    CREATE TABLE IF NOT EXISTS public.project_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL, title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', task_kind TEXT NOT NULL DEFAULT 'internal',
      visibility TEXT NOT NULL DEFAULT 'internal', responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      due_at TIMESTAMPTZ, priority TEXT NOT NULL DEFAULT 'normal', completed_at TIMESTAMPTZ,
      version INTEGER NOT NULL DEFAULT 1, created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_project_tasks_project_status ON public.project_tasks(project_id,status,due_at);
    CREATE TABLE IF NOT EXISTS public.project_deliverables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft', visibility TEXT NOT NULL DEFAULT 'client', current_version INTEGER NOT NULL DEFAULT 0,
      created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_project_deliverables_project_status ON public.project_deliverables(project_id,status,updated_at DESC);
    CREATE TABLE IF NOT EXISTS public.project_deliverable_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), deliverable_id UUID NOT NULL REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
      version INTEGER NOT NULL, file_id UUID REFERENCES public.files(id) ON DELETE SET NULL, external_url TEXT, notes TEXT NOT NULL DEFAULT '',
      created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unq_project_deliverable_version UNIQUE(deliverable_id,version)
    );
    CREATE TABLE IF NOT EXISTS public.project_deliverable_approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), deliverable_id UUID NOT NULL REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
      deliverable_version_id UUID NOT NULL REFERENCES public.project_deliverable_versions(id) ON DELETE RESTRICT,
      actor_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, result TEXT NOT NULL, comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unq_deliverable_version_actor_result UNIQUE(deliverable_version_id,actor_user_id,result)
    );
    DO $$ BEGIN
      ALTER TABLE public.change_requests ADD CONSTRAINT change_requests_deliverable_id_fkey
        FOREIGN KEY(deliverable_id) REFERENCES public.project_deliverables(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE TABLE IF NOT EXISTS public.project_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      deliverable_id UUID REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
      task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
      author_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
      body TEXT NOT NULL, visibility TEXT NOT NULL DEFAULT 'both',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_project_comments_project_created ON public.project_comments(project_id,created_at DESC);
    CREATE TABLE IF NOT EXISTS public.project_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, event_type TEXT NOT NULL,
      entity_type TEXT, entity_id UUID, visibility TEXT NOT NULL DEFAULT 'both', summary TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_project_events_project_created ON public.project_events(project_id,created_at DESC);
  `).catch((error) => {
    projectOperationsSchemaPromise = undefined;
    throw error;
  });
  await projectOperationsSchemaPromise;
}

async function projectScope(client, projectId, session, admin = false) {
  if (!isUuid(projectId)) return null;
  const result = await client.query(
    `SELECT p.*, pr.name AS customer_name, pr.email AS customer_email,
            e.service_name_snapshot, e.plan_name_snapshot, e.public_code AS engagement_code
     FROM public.projects p
     JOIN public.profiles pr ON pr.id=p.user_id
     LEFT JOIN public.service_engagements e ON e.id=p.engagement_id
     WHERE p.id=$1 AND ($2::boolean OR p.user_id=$3)`,
    [projectId, admin, session.id],
  );
  return result.rows[0] || null;
}

export async function recordProjectEvent(client, { projectId, actorId, type, entityType = null, entityId = null, visibility = 'both', summary, metadata = {} }) {
  const result = await client.query(
    `INSERT INTO public.project_events(project_id,actor_user_id,event_type,entity_type,entity_id,visibility,summary,metadata)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [projectId, actorId, type, entityType, entityId, normalizeVisibility(visibility), summary, JSON.stringify(metadata)],
  );
  await client.query(
    `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
     VALUES('project',$1,$2,$3,$4) ON CONFLICT(idempotency_key) DO NOTHING`,
    [projectId, type, JSON.stringify({ projectId, entityType, entityId, ...metadata }), `${type}:${result.rows[0].id}`],
  );
  return result.rows[0];
}

export async function createProjectNotification(client, userId, title, message, type = 'project') {
  await client.query(
    `INSERT INTO public.notifications(user_id,title,message,type) VALUES($1,$2,$3,$4)`,
    [userId, title, message, type],
  );
}

async function loadWorkspace(client, project, isAdmin) {
  const visibilitySql = isAdmin ? '' : `AND visibility IN ('client','both')`;
  const [milestones, tasks, files, requests, deliverables, approvals, comments, events] = await Promise.all([
    client.query(`SELECT * FROM public.milestones WHERE project_id=$1 ${visibilitySql} ORDER BY position,estimated_at`, [project.id]),
    client.query(`SELECT * FROM public.project_tasks WHERE project_id=$1 ${visibilitySql} ORDER BY completed_at NULLS FIRST,due_at NULLS LAST,created_at`, [project.id]),
    client.query(`SELECT id,project_id,name,size,type,uploaded_at,uploaded_by,original_name,mime_type,size_bytes,scan_status,visibility FROM public.files WHERE project_id=$1 AND deleted_at IS NULL ${visibilitySql} ORDER BY uploaded_at DESC`, [project.id]),
    client.query('SELECT * FROM public.change_requests WHERE project_id=$1 ORDER BY created_at DESC', [project.id]),
    client.query(`SELECT d.*,v.id AS version_id,v.version,v.file_id,v.external_url,v.notes AS version_notes,v.created_at AS version_created_at
                  FROM public.project_deliverables d LEFT JOIN public.project_deliverable_versions v
                    ON v.deliverable_id=d.id AND v.version=d.current_version
                  WHERE d.project_id=$1 ${visibilitySql} ORDER BY d.updated_at DESC`, [project.id]),
    client.query(`SELECT a.* FROM public.project_deliverable_approvals a JOIN public.project_deliverables d ON d.id=a.deliverable_id
                  WHERE d.project_id=$1 ORDER BY a.created_at DESC`, [project.id]),
    client.query(`SELECT c.*,p.name AS author_name FROM public.project_comments c JOIN public.profiles p ON p.id=c.author_user_id
                  WHERE c.project_id=$1 ${visibilitySql} ORDER BY c.created_at DESC`, [project.id]),
    client.query(`SELECT e.*,p.name AS actor_name FROM public.project_events e LEFT JOIN public.profiles p ON p.id=e.actor_user_id
                  WHERE e.project_id=$1 ${visibilitySql} ORDER BY e.created_at DESC LIMIT 200`, [project.id]),
  ]);
  const pendingActions = [
    ...tasks.rows.filter((task) => task.task_kind === 'client_action' && !['completed', 'cancelled'].includes(task.status)).map((task) => ({ type: 'task', id: task.id, title: task.title, dueAt: task.due_at })),
    ...deliverables.rows.filter((item) => item.status === 'submitted').map((item) => ({ type: 'deliverable', id: item.id, title: `Revisar: ${item.title}` })),
  ];
  if (!project.briefing?.submitted && project.status === 'aguardando-briefing') pendingActions.unshift({ type: 'briefing', id: project.id, title: 'Preencher briefing' });
  const clientProject = {
    id: project.id, user_id: project.user_id, engagement_id: project.engagement_id,
    name: project.name, template: project.template, segment: project.segment, status: project.status,
    plan: project.plan, site_url: project.site_url, preview_url: project.preview_url, domain: project.domain,
    monthly_fee: project.monthly_fee, activation_fee: project.activation_fee, started_at: project.started_at,
    estimated_delivery: project.estimated_delivery, published_at: project.published_at,
    progress_percent: project.progress_percent, requests_remaining: project.requests_remaining,
    requests_total: project.requests_total, briefing: project.briefing, service_slug: project.service_slug,
    workflow_key: project.workflow_key, created_at: project.created_at, updated_at: project.updated_at,
  };
  return {
    project: isAdmin ? project : clientProject,
    milestones: milestones.rows,
    tasks: tasks.rows,
    files: files.rows,
    requests: requests.rows,
    deliverables: deliverables.rows.map((item) => ({ ...item, approvals: approvals.rows.filter((a) => a.deliverable_id === item.id) })),
    comments: comments.rows,
    events: events.rows,
    pendingActions,
  };
}

function bodyText(value, max = 5000) {
  return String(value || '').trim().slice(0, max);
}

export async function handleProjectOperationsApi(req, res, url, { client, session, json, readJson }) {
  const isAdmin = session.role === 'admin';

  if (url.pathname === '/api/app/project/workspace' && req.method === 'GET') {
    const project = await projectScope(client, url.searchParams.get('projectId'), session, false);
    if (!project) return json(res, 404, { error: 'Projeto não encontrado.' });
    return json(res, 200, await loadWorkspace(client, project, false));
  }

  if (url.pathname === '/api/app/project/file/access' && req.method === 'GET') {
    const fileId = url.searchParams.get('fileId');
    if (!isUuid(fileId)) return json(res, 404, { error: 'Arquivo não encontrado.' });
    const file = (await client.query(
      `SELECT f.* FROM public.files f JOIN public.projects p ON p.id=f.project_id
       WHERE f.id=$1 AND p.user_id=$2 AND f.deleted_at IS NULL AND f.visibility IN ('client','both')`,
      [fileId, session.id],
    )).rows[0];
    if (!file) return json(res, 404, { error: 'Arquivo não encontrado.' });
    if (!file.storage_key) return json(res, 409, { error: 'Arquivo legado sem chave segura de armazenamento.' });
    const cloudinary = (await import('cloudinary')).v2;
    if (process.env.CLOUDINARY_CLOUD_NAME) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    const accessUrl = cloudinary.utils.private_download_url(file.storage_key, '', {
      resource_type: file.storage_resource_type || 'raw', type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 600, attachment: true,
    });
    return json(res, 200, { url: accessUrl, expiresIn: 600 });
  }

  if (url.pathname === '/api/app/project/change-request' && req.method === 'POST') {
    const body = await readJson(req);
    const title = bodyText(body.title, 200);
    const description = bodyText(body.description);
    if (!isUuid(body.projectId)) return json(res, 404, { error: 'Projeto não encontrado.' });
    if (!title || !description) return json(res, 400, { error: 'Título e descrição são obrigatórios.' });
    await client.query('BEGIN');
    try {
      const quota = await client.query(
        `UPDATE public.projects SET requests_remaining=requests_remaining-1,updated_at=NOW(),version=version+1
         WHERE id=$1 AND user_id=$2 AND requests_remaining>0 RETURNING id,user_id`,
        [body.projectId, session.id],
      );
      if (!quota.rows[0]) { await client.query('ROLLBACK'); return json(res, 409, { error: 'Projeto não encontrado ou sem solicitações disponíveis.' }); }
      const result = await client.query(
        `INSERT INTO public.change_requests(project_id,title,description,priority,category,requested_by_user_id,request_kind)
         VALUES($1,$2,$3,$4,$5,$6,'general') RETURNING *`,
        [body.projectId, title, description, ['baixa', 'normal', 'alta'].includes(body.priority) ? body.priority : 'normal', bodyText(body.category, 100) || 'geral', session.id],
      );
      await recordProjectEvent(client, { projectId: body.projectId, actorId: session.id, type: 'client.request_created', entityType: 'change_request', entityId: result.rows[0].id, summary: `Solicitação criada: ${title}` });
      await client.query(
        `INSERT INTO public.notifications(user_id,title,message,type)
         SELECT id,'Nova solicitação de projeto',$1,'request' FROM public.profiles WHERE role='admin'`,
        [`${session.name || session.email} abriu “${title}”.`],
      );
      await client.query('COMMIT');
      return json(res, 201, { request: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/app/project/comment' && req.method === 'POST') {
    const body = await readJson(req);
    const project = await projectScope(client, body.projectId, session, false);
    const text = bodyText(body.body);
    if (!project) return json(res, 404, { error: 'Projeto não encontrado.' });
    if (!text) return json(res, 400, { error: 'Escreva um comentário.' });
    if ((body.deliverableId && !isUuid(body.deliverableId)) || (body.taskId && !isUuid(body.taskId))) return json(res, 400, { error: 'Contexto do comentário inválido.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `INSERT INTO public.project_comments(project_id,deliverable_id,task_id,author_user_id,body,visibility)
         SELECT $1,$2,$3,$4,$5,'both'
         WHERE ($2::uuid IS NULL OR EXISTS(SELECT 1 FROM public.project_deliverables WHERE id=$2 AND project_id=$1 AND visibility IN ('client','both')))
           AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM public.project_tasks WHERE id=$3 AND project_id=$1 AND visibility IN ('client','both')))
         RETURNING *`,
        [project.id, body.deliverableId || null, body.taskId || null, session.id, text],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 400, { error: 'Contexto do comentário inválido.' }); }
      await recordProjectEvent(client, { projectId: project.id, actorId: session.id, type: 'project.comment_created', entityType: 'comment', entityId: result.rows[0].id, summary: 'Cliente adicionou um comentário.' });
      await client.query(`INSERT INTO public.notifications(user_id,title,message,type) SELECT id,'Novo comentário de cliente',$1,'project' FROM public.profiles WHERE role='admin'`, [`${session.name || session.email} comentou no projeto “${project.name}”.`]);
      await client.query('COMMIT');
      return json(res, 201, { comment: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/app/project/task/complete' && req.method === 'POST') {
    const body = await readJson(req);
    if (!isUuid(body.taskId)) return json(res, 404, { error: 'Ação do cliente não encontrada.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.project_tasks t SET status='completed',completed_at=NOW(),updated_at=NOW(),version=version+1
         FROM public.projects p WHERE t.id=$1 AND p.id=t.project_id AND p.user_id=$2
           AND t.task_kind='client_action' AND t.visibility IN ('client','both') AND t.status<>'cancelled' RETURNING t.*,p.user_id`,
        [body.taskId, session.id],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Ação do cliente não encontrada.' }); }
      await recordProjectEvent(client, { projectId: result.rows[0].project_id, actorId: session.id, type: 'task.completed', entityType: 'task', entityId: result.rows[0].id, summary: `Ação concluída: ${result.rows[0].title}` });
      await client.query(`INSERT INTO public.notifications(user_id,title,message,type) SELECT id,'Ação do cliente concluída',$1,'project' FROM public.profiles WHERE role='admin'`, [`${session.name || session.email} concluiu “${result.rows[0].title}”.`]);
      await client.query('COMMIT');
      return json(res, 200, { task: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/app/project/deliverable/review' && req.method === 'POST') {
    const body = await readJson(req);
    const resultValue = body.result === 'approved' ? 'approved' : body.result === 'changes_requested' ? 'changes_requested' : null;
    const comment = bodyText(body.comment, 3000);
    if (!isUuid(body.deliverableId)) return json(res, 404, { error: 'Entrega pendente não encontrada.' });
    if (!resultValue || (resultValue === 'changes_requested' && !comment)) return json(res, 400, { error: 'Resultado ou comentário inválido.' });
    await client.query('BEGIN');
    try {
      const target = (await client.query(
        `SELECT d.*,v.id AS version_id,p.user_id FROM public.project_deliverables d
         JOIN public.project_deliverable_versions v ON v.deliverable_id=d.id AND v.version=d.current_version
         JOIN public.projects p ON p.id=d.project_id
         WHERE d.id=$1 AND p.user_id=$2 AND d.visibility IN ('client','both') AND d.status='submitted' FOR UPDATE`,
        [body.deliverableId, session.id],
      )).rows[0];
      if (!target) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Entrega pendente não encontrada.' }); }
      const approval = await client.query(
        `INSERT INTO public.project_deliverable_approvals(deliverable_id,deliverable_version_id,actor_user_id,result,comment)
         VALUES($1,$2,$3,$4,$5) ON CONFLICT(deliverable_version_id,actor_user_id,result) DO NOTHING RETURNING *`,
        [target.id, target.version_id, session.id, resultValue, comment || null],
      );
      if (!approval.rows[0]) { await client.query('ROLLBACK'); return json(res, 409, { error: 'Esta decisão já foi registrada para a versão atual.' }); }
      await client.query('UPDATE public.project_deliverables SET status=$1,updated_at=NOW() WHERE id=$2', [resultValue, target.id]);
      if (resultValue === 'changes_requested') {
        await client.query(
          `INSERT INTO public.change_requests(project_id,title,description,status,priority,category,requested_by_user_id,request_kind,deliverable_id)
           VALUES($1,$2,$3,'aberto','normal','Entrega',$4,'deliverable_change',$5)`,
          [target.project_id, `Ajustes em ${target.title}`, comment, session.id, target.id],
        );
      }
      await recordProjectEvent(client, { projectId: target.project_id, actorId: session.id, type: resultValue === 'approved' ? 'deliverable.approved' : 'deliverable.changes_requested', entityType: 'deliverable', entityId: target.id, summary: resultValue === 'approved' ? `Entrega aprovada: ${target.title}` : `Ajustes solicitados: ${target.title}`, metadata: { versionId: target.version_id } });
      await client.query(`INSERT INTO public.notifications(user_id,title,message,type) SELECT id,$1,$2,'project' FROM public.profiles WHERE role='admin'`, [resultValue === 'approved' ? 'Entrega aprovada' : 'Ajustes solicitados', `${session.name || session.email}: ${target.title}.`]);
      await client.query('COMMIT');
      return json(res, 200, { approval: approval.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/projects' && req.method === 'GET') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const values = [];
    const where = [];
    const add = (sql, value) => { values.push(value); where.push(sql.replace('?', `$${values.length}`)); };
    if (url.searchParams.get('status')) add('p.status=?', url.searchParams.get('status'));
    if (url.searchParams.get('service')) add('p.service_slug=?', url.searchParams.get('service'));
    if (url.searchParams.get('responsible')) {
      if (!isUuid(url.searchParams.get('responsible'))) return json(res, 400, { error: 'Responsável inválido.' });
      add('p.responsible_user_id=?', url.searchParams.get('responsible'));
    }
    if (url.searchParams.get('customer')) add('(pr.name ILIKE ? OR pr.email ILIKE ?)', `%${url.searchParams.get('customer')}%`);
    // Customer needs the same value twice; keep this branch explicit.
    if (url.searchParams.get('customer')) { const value = values.pop(); where.pop(); values.push(value, value); where.push(`(pr.name ILIKE $${values.length - 1} OR pr.email ILIKE $${values.length})`); }
    if (url.searchParams.get('pending') === 'true') where.push(`EXISTS(SELECT 1 FROM public.project_tasks t WHERE t.project_id=p.id AND t.task_kind='client_action' AND t.status NOT IN ('completed','cancelled'))`);
    const result = await client.query(
      `SELECT p.id,p.name,p.status,p.service_slug,p.progress_percent,p.updated_at,p.responsible_user_id,
              pr.name AS customer_name,pr.email AS customer_email,r.name AS responsible_name,e.service_name_snapshot,
              (SELECT title FROM public.milestones m WHERE m.project_id=p.id AND m.status<>'concluido' ORDER BY position LIMIT 1) AS next_stage,
              (SELECT COUNT(*)::int FROM public.project_tasks t WHERE t.project_id=p.id AND t.task_kind='client_action' AND t.status NOT IN ('completed','cancelled')) AS pending_count
       FROM public.projects p JOIN public.profiles pr ON pr.id=p.user_id LEFT JOIN public.profiles r ON r.id=p.responsible_user_id
       LEFT JOIN public.service_engagements e ON e.id=p.engagement_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY p.updated_at DESC`, values);
    return json(res, 200, { projects: result.rows });
  }

  if (url.pathname === '/api/admin/app/project/detail' && req.method === 'GET') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const project = await projectScope(client, url.searchParams.get('projectId'), session, true);
    if (!project) return json(res, 404, { error: 'Projeto não encontrado.' });
    return json(res, 200, await loadWorkspace(client, project, true));
  }

  if (url.pathname === '/api/admin/app/project/task' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    const project = await projectScope(client, body.projectId, session, true);
    const title = bodyText(body.title, 200);
    if (!project || !title) return json(res, project ? 400 : 404, { error: project ? 'Título obrigatório.' : 'Projeto não encontrado.' });
    const visibility = normalizeVisibility(body.visibility, body.taskKind === 'client_action' ? 'both' : 'internal');
    const taskKind = body.taskKind === 'client_action' ? 'client_action' : 'internal';
    if (taskKind === 'client_action' && visibility === 'internal') return json(res, 400, { error: 'Ação do cliente precisa ser visível ao cliente.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `INSERT INTO public.project_tasks(project_id,milestone_id,title,description,status,task_kind,visibility,responsible_user_id,due_at,priority,created_by)
         VALUES($1,$2,$3,$4,'pending',$5,$6,$7,$8,$9,$10) RETURNING *`,
        [project.id, body.milestoneId || null, title, bodyText(body.description), taskKind, visibility, body.responsibleUserId || null, body.dueAt || null, ['low','normal','high'].includes(body.priority) ? body.priority : 'normal', session.id],
      );
      await recordProjectEvent(client, { projectId: project.id, actorId: session.id, type: 'task.created', entityType: 'task', entityId: result.rows[0].id, visibility, summary: taskKind === 'client_action' ? `Ação solicitada ao cliente: ${title}` : `Tarefa criada: ${title}` });
      if (taskKind === 'client_action') await createProjectNotification(client, project.user_id, 'Nova ação necessária', title, 'project');
      await client.query('COMMIT');
      return json(res, 201, { task: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/project/task/status' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    if (!isUuid(body.taskId)) return json(res, 404, { error: 'Tarefa não encontrada.' });
    if (!Number.isInteger(Number(body.version)) || Number(body.version) < 1) return json(res, 400, { error: 'Versão da tarefa inválida.' });
    if (!TASK_STATUSES.has(body.status)) return json(res, 400, { error: 'Status inválido.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.project_tasks SET status=$1,completed_at=CASE WHEN $1='completed' THEN NOW() ELSE NULL END,
         updated_at=NOW(),version=version+1 WHERE id=$2 AND version=$3 RETURNING *`,
        [body.status, body.taskId, Number(body.version)],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 409, { error: 'Tarefa alterada por outra sessão ou não encontrada.' }); }
      await recordProjectEvent(client, { projectId: result.rows[0].project_id, actorId: session.id, type: body.status === 'completed' ? 'task.completed' : 'task.updated', entityType: 'task', entityId: result.rows[0].id, visibility: result.rows[0].visibility, summary: `Tarefa atualizada: ${result.rows[0].title}` });
      await client.query('COMMIT');
      return json(res, 200, { task: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/project/milestone/status' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    if (!isUuid(body.milestoneId)) return json(res, 404, { error: 'Etapa não encontrada.' });
    if (!['pendente', 'em-andamento', 'concluido', 'cancelado'].includes(body.status)) return json(res, 400, { error: 'Status inválido.' });
    await client.query('BEGIN');
    try {
      const milestone = (await client.query(
        `UPDATE public.milestones SET status=$1,completed_at=CASE WHEN $1='concluido' THEN NOW() ELSE NULL END,updated_at=NOW()
         WHERE id=$2 RETURNING *`, [body.status, body.milestoneId],
      )).rows[0];
      if (!milestone) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Etapa não encontrada.' }); }
      const milestones = (await client.query('SELECT status FROM public.milestones WHERE project_id=$1', [milestone.project_id])).rows;
      const progress = calculateMilestoneProgress(milestones);
      await client.query('UPDATE public.projects SET progress_percent=$1,updated_at=NOW(),version=version+1 WHERE id=$2', [progress, milestone.project_id]);
      await recordProjectEvent(client, { projectId: milestone.project_id, actorId: session.id, type: body.status === 'concluido' ? 'project.stage_completed' : 'project.stage_updated', entityType: 'milestone', entityId: milestone.id, visibility: milestone.visibility, summary: `Etapa atualizada: ${milestone.title}`, metadata: { progress } });
      if (progress === 100) {
        await client.query(
          `INSERT INTO public.outbox_events(aggregate_type,aggregate_id,event_type,payload,idempotency_key)
           SELECT 'project',p.id,'project.completed',jsonb_build_object('projectId',p.id,'customerId',p.user_id,'engagementId',p.engagement_id),$2
           FROM public.projects p WHERE p.id=$1 ON CONFLICT(idempotency_key) DO NOTHING`,
          [milestone.project_id, `project.completed:${milestone.project_id}`],
        );
      }
      await client.query('COMMIT');
      return json(res, 200, { milestone, progress });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/project/deliverable' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    const project = await projectScope(client, body.projectId, session, true);
    const title = bodyText(body.title, 200);
    const externalUrl = bodyText(body.externalUrl, 2000);
    if (!project || !title || (!body.fileId && !externalUrl)) return json(res, project ? 400 : 404, { error: project ? 'Título e arquivo/link são obrigatórios.' : 'Projeto não encontrado.' });
    if ((body.fileId && !isUuid(body.fileId)) || (body.deliverableId && !isUuid(body.deliverableId)) || (body.milestoneId && !isUuid(body.milestoneId))) return json(res, 400, { error: 'Referência da entrega inválida.' });
    if (externalUrl) { try { const parsed = new URL(externalUrl); if (parsed.protocol !== 'https:') throw new Error(); } catch { return json(res, 400, { error: 'A entrega deve usar uma URL HTTPS válida.' }); } }
    if (body.fileId) {
      const ownsFile = (await client.query('SELECT 1 FROM public.files WHERE id=$1 AND project_id=$2 AND deleted_at IS NULL', [body.fileId, project.id])).rows[0];
      if (!ownsFile) return json(res, 400, { error: 'Arquivo não pertence ao projeto.' });
    }
    await client.query('BEGIN');
    try {
      let deliverable;
      if (body.deliverableId) {
        deliverable = (await client.query('SELECT * FROM public.project_deliverables WHERE id=$1 AND project_id=$2 FOR UPDATE', [body.deliverableId, project.id])).rows[0];
        if (!deliverable) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Entrega não encontrada.' }); }
      } else {
        deliverable = (await client.query(
          `INSERT INTO public.project_deliverables(project_id,milestone_id,title,description,status,visibility,created_by)
           VALUES($1,$2,$3,$4,'draft',$5,$6) RETURNING *`,
          [project.id, body.milestoneId || null, title, bodyText(body.description), normalizeVisibility(body.visibility, 'client'), session.id],
        )).rows[0];
      }
      const nextVersion = Number(deliverable.current_version) + 1;
      const version = (await client.query(
        `INSERT INTO public.project_deliverable_versions(deliverable_id,version,file_id,external_url,notes,created_by)
         VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
        [deliverable.id, nextVersion, body.fileId || null, externalUrl || null, bodyText(body.notes), session.id],
      )).rows[0];
      deliverable = (await client.query(
        `UPDATE public.project_deliverables SET title=$1,description=$2,current_version=$3,status='submitted',submitted_at=NOW(),updated_at=NOW()
         WHERE id=$4 RETURNING *`, [title, bodyText(body.description), nextVersion, deliverable.id],
      )).rows[0];
      await recordProjectEvent(client, { projectId: project.id, actorId: session.id, type: 'deliverable.submitted', entityType: 'deliverable', entityId: deliverable.id, visibility: deliverable.visibility, summary: `Nova entrega disponível: ${deliverable.title}`, metadata: { version: nextVersion, versionId: version.id } });
      if (CLIENT_VISIBILITIES.has(deliverable.visibility)) await createProjectNotification(client, project.user_id, 'Nova entrega disponível', `Revise a entrega “${deliverable.title}”.`, 'project');
      await client.query('COMMIT');
      return json(res, 201, { deliverable: { ...deliverable, version } });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/project/comment' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    const project = await projectScope(client, body.projectId, session, true);
    const text = bodyText(body.body);
    if (!project || !text) return json(res, project ? 400 : 404, { error: project ? 'Escreva um comentário.' : 'Projeto não encontrado.' });
    if ((body.deliverableId && !isUuid(body.deliverableId)) || (body.taskId && !isUuid(body.taskId))) return json(res, 400, { error: 'Contexto do comentário inválido.' });
    const visibility = normalizeVisibility(body.visibility, 'both');
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `INSERT INTO public.project_comments(project_id,deliverable_id,task_id,author_user_id,body,visibility)
         SELECT $1,$2,$3,$4,$5,$6
         WHERE ($2::uuid IS NULL OR EXISTS(SELECT 1 FROM public.project_deliverables WHERE id=$2 AND project_id=$1))
           AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM public.project_tasks WHERE id=$3 AND project_id=$1)) RETURNING *`,
        [project.id, body.deliverableId || null, body.taskId || null, session.id, text, visibility],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 400, { error: 'Contexto do comentário inválido.' }); }
      await recordProjectEvent(client, { projectId: project.id, actorId: session.id, type: 'project.comment_created', entityType: 'comment', entityId: result.rows[0].id, visibility, summary: 'Equipe adicionou um comentário.' });
      if (CLIENT_VISIBILITIES.has(visibility)) await createProjectNotification(client, project.user_id, 'Novo comentário no projeto', text.slice(0, 180), 'project');
      await client.query('COMMIT');
      return json(res, 201, { comment: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/request/status' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    if (!isUuid(body.requestId)) return json(res, 404, { error: 'Solicitação não encontrada.' });
    if (!['aberto', 'em-andamento', 'concluido', 'cancelado'].includes(body.status)) return json(res, 400, { error: 'Status inválido.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.change_requests SET status=$1,resolved_at=CASE WHEN $1='concluido' THEN NOW() ELSE NULL END,updated_at=NOW()
         WHERE id=$2 RETURNING *`, [body.status, body.requestId],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 404, { error: 'Solicitação não encontrada.' }); }
      await recordProjectEvent(client, { projectId: result.rows[0].project_id, actorId: session.id, type: 'client.request_updated', entityType: 'change_request', entityId: result.rows[0].id, summary: `Solicitação atualizada: ${result.rows[0].title}`, metadata: { status: body.status } });
      await client.query('COMMIT');
      return json(res, 200, { request: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  if (url.pathname === '/api/admin/app/project/status-safe' && req.method === 'POST') {
    if (!isAdmin) return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    const body = await readJson(req);
    if (!isUuid(body.projectId)) return json(res, 404, { error: 'Projeto não encontrado.' });
    if (!Number.isInteger(Number(body.version)) || Number(body.version) < 1) return json(res, 400, { error: 'Versão do projeto inválida.' });
    if (!PROJECT_STATUSES.has(body.status)) return json(res, 400, { error: 'Status inválido.' });
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE public.projects SET status=$1,published_at=CASE WHEN $1='publicado' THEN COALESCE(published_at,NOW()) ELSE published_at END,
         updated_at=NOW(),version=version+1 WHERE id=$2 AND version=$3 RETURNING *`,
        [body.status, body.projectId, Number(body.version)],
      );
      if (!result.rows[0]) { await client.query('ROLLBACK'); return json(res, 409, { error: 'Projeto alterado por outra sessão ou não encontrado.' }); }
      await recordProjectEvent(client, { projectId: result.rows[0].id, actorId: session.id, type: 'project.status_changed', summary: `Status do projeto alterado para ${body.status}.`, metadata: { status: body.status } });
      await createProjectNotification(client, result.rows[0].user_id, 'Status do projeto atualizado', `O projeto “${result.rows[0].name}” agora está como ${body.status}.`, 'project');
      await client.query('COMMIT');
      return json(res, 200, { project: result.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }

  return false;
}

export function fileChecksum(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
