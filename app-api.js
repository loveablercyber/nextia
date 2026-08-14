let appSchemaPromise;

export async function ensureAppSchema(client) {
  if (!appSchemaPromise) {
    appSchemaPromise = client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        template TEXT,
        segment TEXT NOT NULL DEFAULT 'Geral',
        status TEXT NOT NULL DEFAULT 'aguardando-briefing',
        plan TEXT NOT NULL DEFAULT 'Pro',
        site_url TEXT,
        preview_url TEXT,
        domain TEXT,
        monthly_fee NUMERIC NOT NULL DEFAULT 0,
        activation_fee NUMERIC NOT NULL DEFAULT 0,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        estimated_delivery TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        published_at TIMESTAMPTZ,
        progress_percent INTEGER NOT NULL DEFAULT 0,
        requests_remaining INTEGER NOT NULL DEFAULT 5,
        requests_total INTEGER NOT NULL DEFAULT 5,
        briefing JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);

      CREATE TABLE IF NOT EXISTS public.milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pendente',
        completed_at TIMESTAMPTZ,
        estimated_at TIMESTAMPTZ,
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS milestones_project_id_idx ON public.milestones(project_id);

      CREATE TABLE IF NOT EXISTS public.files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        size TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'other',
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        uploaded_by TEXT NOT NULL DEFAULT '',
        url TEXT
      );
      CREATE INDEX IF NOT EXISTS files_project_id_idx ON public.files(project_id);

      CREATE TABLE IF NOT EXISTS public.change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'aberto',
        priority TEXT NOT NULL DEFAULT 'normal',
        category TEXT NOT NULL DEFAULT 'geral',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS change_requests_project_id_idx ON public.change_requests(project_id);

      CREATE TABLE IF NOT EXISTS public.payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        due_date TIMESTAMPTZ NOT NULL,
        paid_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'pendente',
        type TEXT NOT NULL DEFAULT 'mensalidade',
        invoice_url TEXT,
        provider_preference_id TEXT,
        provider_payment_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS payments_project_id_idx ON public.payments(project_id);

      CREATE TABLE IF NOT EXISTS public.quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_type TEXT,
        segment TEXT,
        pages INTEGER NOT NULL DEFAULT 0,
        features JSONB NOT NULL DEFAULT '[]'::jsonb,
        has_identity BOOLEAN,
        urgency TEXT,
        budget_range TEXT,
        contact_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_company TEXT,
        city TEXT,
        notes TEXT,
        estimated_min NUMERIC NOT NULL DEFAULT 0,
        estimated_max NUMERIC NOT NULL DEFAULT 0,
        recommended_plan TEXT,
        status TEXT NOT NULL DEFAULT 'novo',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON public.quotes(created_at DESC);

      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
        ON public.notifications(user_id, created_at DESC);

      ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS briefing JSONB;
      ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS source_contract_id UUID;
      CREATE UNIQUE INDEX IF NOT EXISTS projects_source_contract_id_idx
        ON public.projects(source_contract_id) WHERE source_contract_id IS NOT NULL;
      ALTER TABLE public.milestones ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_preference_id TEXT;
      ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_payment_id TEXT;
      ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    `).catch((error) => {
      appSchemaPromise = undefined;
      throw error;
    });
  }
  await appSchemaPromise;
}

async function loadProjects(client, userId = null) {
  let result = await client.query(
    `SELECT * FROM public.projects
     WHERE ($1::uuid IS NULL OR user_id = $1)
     ORDER BY created_at DESC`,
    [userId],
  );
  let projects = result.rows;

  if (projects.length === 0 && userId) {
    const [orderRes, contractRes, draftRes] = await Promise.all([
      client.query(`SELECT * FROM public.commercial_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]),
      client.query(`SELECT * FROM public.commercial_plan_contracts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]),
      client.query(`SELECT * FROM public.commercial_store_drafts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]),
    ]);

    const latestOrder = orderRes.rows[0];
    const latestContract = contractRes.rows[0];
    const latestDraft = draftRes.rows[0];

    const name = latestOrder?.item_name || (latestContract ? `Plano ${latestContract.plan_name}` : (latestDraft ? `Loja Virtual` : 'Meu Projeto Digital'));
    const domain = latestOrder?.store_snapshot?.domain || latestContract?.domain || '';
    const plan = latestContract?.plan_name || latestDraft?.plan_id || 'Pro';
    const activationFee = latestOrder ? (latestOrder.amount_cents / 100) : (latestContract ? (latestContract.activation_amount_cents / 100) : 0);
    const monthlyFee = latestContract ? (latestContract.monthly_amount_cents / 100) : 0;

    const inserted = await client.query(
      `INSERT INTO public.projects (user_id, name, template, segment, status, plan, domain, monthly_fee, activation_fee, requests_remaining, requests_total)
       VALUES ($1, $2, $3, $4, 'aguardando-briefing', $5, $6, $7, $8, 5, 5)
       RETURNING *`,
      [userId, name, 'Personalizado', 'Geral', plan, domain, monthlyFee, activationFee],
    );
    const pId = inserted.rows[0].id;

    await client.query(
      `INSERT INTO public.milestones (project_id, title, description, status, completed_at, position)
       VALUES
         ($1, 'Contratação realizada', 'Pedido registrado na plataforma', 'concluido', NOW(), 1),
         ($1, 'Preenchimento do Briefing', 'Envio de informações e logotipo', 'em-andamento', NULL, 2),
         ($1, 'Desenvolvimento e Layout', 'Criação das páginas e estrutura', 'pendente', NULL, 3),
         ($1, 'Revisão e Publicação', 'Ajustes finais e conexão de domínio', 'pendente', NULL, 4)`,
      [pId],
    );

    const reResult = await client.query(`SELECT * FROM public.projects WHERE id = $1`, [pId]);
    projects = reResult.rows;
  }

  if (projects.length === 0) return [];
  const ids = projects.map((project) => project.id);
  const [milestones, files, requests, payments] = await Promise.all([
    client.query('SELECT * FROM public.milestones WHERE project_id = ANY($1::uuid[]) ORDER BY position, estimated_at', [ids]),
    client.query('SELECT * FROM public.files WHERE project_id = ANY($1::uuid[]) ORDER BY uploaded_at DESC', [ids]),
    client.query('SELECT * FROM public.change_requests WHERE project_id = ANY($1::uuid[]) ORDER BY created_at DESC', [ids]),
    client.query('SELECT * FROM public.payments WHERE project_id = ANY($1::uuid[]) ORDER BY created_at DESC', [ids]),
  ]);
  return projects.map((project) => ({
    ...project,
    milestones: milestones.rows.filter((row) => row.project_id === project.id),
    files: files.rows.filter((row) => row.project_id === project.id),
    change_requests: requests.rows.filter((row) => row.project_id === project.id),
    payments: payments.rows.filter((row) => row.project_id === project.id),
  }));
}

function requireAdmin(session, json, res) {
  if (!session) {
    json(res, 401, { error: 'Usuário não autenticado.' });
    return false;
  }
  if (session.role !== 'admin') {
    json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    return false;
  }
  return true;
}

export function isAppApiPath(pathname) {
  return pathname === '/api/quotes'
    || pathname.startsWith('/api/payments/')
    || pathname.startsWith('/api/app/')
    || pathname.startsWith('/api/admin/app/')
    || pathname.startsWith('/api/notifications');
}

export async function handleAppApi(req, res, url, dependencies) {
  const { dbClient, ensurePartnerSchema, getSessionProfile, json, readJson } = dependencies;
  const client = dbClient();
  await client.connect();
  try {
    await ensureAppSchema(client);

    if (url.pathname === '/api/quotes' && req.method === 'POST') {
      const body = await readJson(req);
      const name = String(body.contact_name || '').trim();
      const email = String(body.contact_email || '').trim().toLowerCase();
      const phone = String(body.contact_phone || '').trim();
      if (!name || !email || !phone) return json(res, 400, { error: 'Nome, e-mail e WhatsApp são obrigatórios.' });
      const result = await client.query(
        `INSERT INTO public.quotes
           (project_type, segment, pages, features, has_identity, urgency, budget_range,
            contact_name, contact_email, contact_phone, contact_company, city, notes,
            estimated_min, estimated_max, recommended_plan)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING *`,
        [body.project_type || null, body.segment || null, Number(body.pages || 0), JSON.stringify(body.features || []),
          body.has_identity ?? null, body.urgency || null, body.budget_range || null, name, email, phone,
          body.contact_company || '', body.city || '', body.notes || '', Number(body.estimated_min || 0),
          Number(body.estimated_max || 0), body.recommended_plan || null],
      );
      return json(res, 201, { quote: result.rows[0] });
    }

    if (url.pathname === '/api/payments/webhook' && req.method === 'POST') {
      const body = await readJson(req);
      const eventType = body.type || url.searchParams.get('type');
      const resourceId = body.data?.id || url.searchParams.get('data.id');
      if (eventType !== 'payment' || !resourceId) return json(res, 200, { status: 'ignored' });

      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(resourceId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!paymentResponse.ok) {
        console.error('[PAYMENTS] Mercado Pago lookup failed', paymentResponse.status, await paymentResponse.text());
        return json(res, 502, { error: 'Não foi possível validar o pagamento.' });
      }

      const providerPayment = await paymentResponse.json();
      const paymentId = String(providerPayment.external_reference || '');
      if (providerPayment.status !== 'approved' || !paymentId) {
        return json(res, 200, { status: 'not_approved', providerStatus: providerPayment.status || 'unknown' });
      }

      await ensurePartnerSchema(client);

      await client.query('BEGIN');
      try {
        const paymentResult = await client.query(
          `SELECT pay.*, p.user_id, p.plan, pr.name AS client_name
           FROM public.payments pay
           JOIN public.projects p ON p.id = pay.project_id
           JOIN public.profiles pr ON pr.id = p.user_id
           WHERE pay.id = $1 FOR UPDATE`,
          [paymentId],
        );
        const payment = paymentResult.rows[0];
        if (!payment) {
          await client.query('ROLLBACK');
          return json(res, 404, { error: 'Cobrança não encontrada.' });
        }
        const receivedAmount = Number(providerPayment.transaction_amount);
        if (providerPayment.currency_id !== 'BRL' || Math.abs(receivedAmount - Number(payment.amount)) > 0.001) {
          throw new Error(`Pagamento divergente: moeda=${providerPayment.currency_id}, valor=${receivedAmount}`);
        }
        if (payment.status === 'pago') {
          await client.query('COMMIT');
          return json(res, 200, { status: 'already_paid' });
        }

        await client.query(
          `UPDATE public.payments
           SET status = 'pago', paid_at = NOW(), provider_payment_id = $2
           WHERE id = $1`,
          [paymentId, String(resourceId)],
        );
        const commissionResult = await client.query(
          `INSERT INTO public.partner_commissions
             (partner_id, referral_id, payment_id, client_name, plan, monthly_fee,
              commission_value, status, period)
           SELECT referral.partner_id, referral.id, $1, $2, $3, $4,
                  ROUND(($4::numeric * referral.commission_rate), 2), 'confirmado', TO_CHAR(NOW(), 'YYYY-MM')
           FROM public.partner_referrals referral
           WHERE referral.referred_user_id = $5
           ON CONFLICT (payment_id) DO NOTHING
           RETURNING referral_id`,
          [payment.id, payment.client_name, payment.plan, Number(payment.amount), payment.user_id],
        );
        if (commissionResult.rows[0]) {
          await client.query(
            `UPDATE public.partner_referrals
             SET status = 'ativo', plan = $2, monthly_fee = $3,
                 commission_generated = commission_generated + ROUND(($3::numeric * commission_rate), 2),
                 start_date = COALESCE(start_date, NOW()), last_payment_date = NOW()
             WHERE id = $1`,
            [commissionResult.rows[0].referral_id, payment.plan, Number(payment.amount)],
          );
        }
        await client.query(
          `INSERT INTO public.notifications(user_id, title, message, type)
           VALUES ($1, 'Pagamento confirmado', $2, 'payment')`,
          [payment.user_id, `A fatura "${payment.description}" foi processada com sucesso.`],
        );
        await client.query(
          `INSERT INTO public.notifications(user_id, title, message, type)
           SELECT id, 'Pagamento recebido', $1, 'payment' FROM public.profiles WHERE role = 'admin'`,
          [`${payment.client_name || 'Cliente'} pagou a fatura "${payment.description}".`],
        );
        await client.query('COMMIT');
        console.log(`[PAYMENTS] Payment ${paymentId} confirmed by Mercado Pago transaction ${resourceId}`);
        return json(res, 200, { status: 'success', paymentId });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    const session = await getSessionProfile(req, client);
    if (!session) return json(res, 401, { error: 'Usuário não autenticado.' });

    if (url.pathname === '/api/app/project' && req.method === 'GET') {
      const projects = await loadProjects(client, session.id);
      return json(res, 200, { project: projects[0] || null });
    }

    if (url.pathname === '/api/app/project/file' && req.method === 'POST') {
      const body = await readJson(req);
      const name = String(body.name || '').trim();
      const type = String(body.type || 'other');
      const dataUrl = body.dataUrl || body.url || null;
      const sizeBytes = Number(body.sizeBytes || 0);

      // Max size limit: 20MB
      if (sizeBytes > 20 * 1024 * 1024) {
        return json(res, 400, { error: 'Arquivo excede o limite máximo permitido de 20MB.' });
      }

      let fileUrl = dataUrl;

      // Cloudinary upload if configured
      if (dataUrl && (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME)) {
        try {
          const cloudinary = (await import('cloudinary')).v2;
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            cloudinary.config({
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            });
          }
          const uploadRes = await cloudinary.uploader.upload(dataUrl, {
            folder: 'nextia_uploads',
            resource_type: 'auto',
          });
          fileUrl = uploadRes.secure_url;
        } catch (cErr) {
          console.error('[Cloudinary Upload Warning]', cErr.message || cErr);
        }
      }

      const result = await client.query(
        `INSERT INTO public.files(project_id, name, size, type, uploaded_by, url)
         SELECT p.id, $2, $3, $4, $5, $6 FROM public.projects p WHERE p.id = $1 AND p.user_id = $7
         RETURNING *`,
        [body.projectId, name, body.size || '1.0 MB', type, session.name || session.email, fileUrl, session.id],
      );
      if (!result.rows[0]) return json(res, 404, { error: 'Projeto não encontrado.' });
      return json(res, 201, { file: result.rows[0] });
    }

    if (url.pathname === '/api/app/project/change-request' && req.method === 'POST') {
      const body = await readJson(req);
      await client.query('BEGIN');
      try {
        const quota = await client.query(
          `UPDATE public.projects SET requests_remaining = requests_remaining - 1, updated_at = NOW()
           WHERE id = $1 AND user_id = $2 AND requests_remaining > 0 RETURNING id`,
          [body.projectId, session.id],
        );
        if (!quota.rows[0]) {
          await client.query('ROLLBACK');
          return json(res, 409, { error: 'Não há solicitações disponíveis para este projeto.' });
        }
        const result = await client.query(
          `INSERT INTO public.change_requests(project_id, title, description, priority, category)
           VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [body.projectId, String(body.title || '').trim(), String(body.description || '').trim(), body.priority || 'normal', body.category || 'geral'],
        );
        await client.query('COMMIT');
        return json(res, 201, { request: result.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    if (url.pathname === '/api/payments/create' && req.method === 'POST') {
      const body = await readJson(req);
      const result = await client.query(
        `SELECT pay.id, pay.amount, pay.description, pay.status, p.name AS project_name,
                pr.name AS user_name, pr.email AS user_email
         FROM public.payments pay
         JOIN public.projects p ON p.id = pay.project_id
         JOIN public.profiles pr ON pr.id = p.user_id
         WHERE pay.id = $1 AND p.user_id = $2`,
        [body.paymentId, session.id],
      );
      const payment = result.rows[0];
      if (!payment) return json(res, 404, { error: 'Fatura não encontrada.' });
      if (payment.status === 'pago') return json(res, 409, { error: 'Esta fatura já foi paga.' });

      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) return json(res, 503, { error: 'Mercado Pago não configurado.' });
      const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      if (!host) return json(res, 500, { error: 'Host da aplicação não identificado.' });
      const baseUrl = `${protocol}://${host}`;
      const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `nextia-payment-${payment.id}`,
        },
        body: JSON.stringify({
          items: [{
            id: payment.id,
            title: `${payment.project_name} - ${payment.description}`,
            quantity: 1,
            unit_price: Number(payment.amount),
            currency_id: 'BRL',
          }],
          payer: { name: payment.user_name, email: payment.user_email },
          back_urls: {
            success: `${baseUrl}/painel/pagamentos?success=true`,
            failure: `${baseUrl}/painel/pagamentos?failure=true`,
            pending: `${baseUrl}/painel/pagamentos?pending=true`,
          },
          auto_return: 'approved',
          external_reference: payment.id,
          notification_url: `${baseUrl}/api/payments/webhook`,
        }),
      });
      const preference = await preferenceResponse.json();
      if (!preferenceResponse.ok || !preference.init_point) {
        console.error('[PAYMENTS] Preference creation failed', preferenceResponse.status, preference);
        return json(res, 502, { error: 'Não foi possível iniciar o checkout.' });
      }
      await client.query(
        'UPDATE public.payments SET provider_preference_id = $2 WHERE id = $1',
        [payment.id, preference.id || null],
      );
      return json(res, 200, { initPoint: preference.init_point });
    }

    if (url.pathname === '/api/app/project/briefing' && req.method === 'POST') {
      const body = await readJson(req);
      const submittedAt = new Date().toISOString();
      await client.query('BEGIN');
      try {
        let pId = body.projectId;
        let result = await client.query(
          `UPDATE public.projects
           SET briefing = $1::jsonb, status = 'em-desenvolvimento', progress_percent = GREATEST(progress_percent, 35), updated_at = NOW()
           WHERE id = $2 AND user_id = $3 RETURNING id`,
          [JSON.stringify({ ...body.briefing, submitted: true, submittedAt }), pId, session.id],
        );
        if (!result.rows[0]) {
          const userProjects = await loadProjects(client, session.id);
          if (userProjects.length > 0) {
            pId = userProjects[0].id;
            result = await client.query(
              `UPDATE public.projects
               SET briefing = $1::jsonb, status = 'em-desenvolvimento', progress_percent = GREATEST(progress_percent, 35), updated_at = NOW()
               WHERE id = $2 AND user_id = $3 RETURNING id`,
              [JSON.stringify({ ...body.briefing, submitted: true, submittedAt }), pId, session.id],
            );
          }
        }
        if (!result.rows[0]) {
          await client.query('ROLLBACK');
          return json(res, 404, { error: 'Projeto não encontrado.' });
        }
        await client.query(
          `UPDATE public.milestones SET status = CASE WHEN position <= 2 THEN 'concluido' WHEN position = 3 THEN 'em-andamento' ELSE status END,
             completed_at = CASE WHEN position <= 2 THEN NOW() ELSE completed_at END WHERE project_id = $1`,
          [pId],
        );
        await client.query('COMMIT');
        const projects = await loadProjects(client, session.id);
        return json(res, 200, { project: projects.find((project) => project.id === pId) || projects[0] || null });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    if (url.pathname === '/api/notifications' && req.method === 'GET') {
      const result = await client.query('SELECT * FROM public.notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200', [session.id]);
      return json(res, 200, { notifications: result.rows });
    }

    if (url.pathname === '/api/app/engagements' && req.method === 'GET') {
      if (!session) return json(res, 401, { error: 'Faça login para consultar seus serviços.' });
      const engagementsRes = await client.query(
        `SELECT e.*, d.fqdn, d.mode AS domain_mode, d.status AS domain_status, d.registration_fee_cents,
                p.id AS project_id, p.name AS project_name, p.status AS project_status, p.progress_percent
         FROM public.service_engagements e
         LEFT JOIN public.service_domains d ON d.engagement_id = e.id
         LEFT JOIN public.projects p ON p.engagement_id = e.id OR p.source_order_id = e.source_order_id
         WHERE e.user_id = $1
         ORDER BY e.created_at DESC`,
        [session.id],
      );
      return json(res, 200, { engagements: engagementsRes.rows });
    }

    if (url.pathname.startsWith('/api/app/engagements/') && req.method === 'GET') {
      if (!session) return json(res, 401, { error: 'Faça login para consultar este serviço.' });
      const idOrCode = url.pathname.replace('/api/app/engagements/', '').trim();
      const engagementRes = await client.query(
        `SELECT e.*, d.fqdn, d.mode AS domain_mode, d.status AS domain_status, d.registration_fee_cents,
                p.id AS project_id, p.name AS project_name, p.status AS project_status, p.progress_percent
         FROM public.service_engagements e
         LEFT JOIN public.service_domains d ON d.engagement_id = e.id
         LEFT JOIN public.projects p ON p.engagement_id = e.id OR p.source_order_id = e.source_order_id
         WHERE (e.id::text = $1 OR e.public_code = $1) AND e.user_id = $2`,
        [idOrCode, session.id],
      );
      if (!engagementRes.rows[0]) return json(res, 404, { error: 'Serviço não encontrado.' });
      return json(res, 200, { engagement: engagementRes.rows[0] });
    }

    if (url.pathname === '/api/notifications' && req.method === 'POST') {
      const body = await readJson(req);
      const target = String(body.targetUserId || session.id);
      if (target !== session.id && target !== 'admins' && session.role !== 'admin') {
        return json(res, 403, { error: 'Destino de notificação não permitido.' });
      }
      const values = [String(body.title || '').trim(), String(body.message || '').trim(), body.type || 'info'];
      if (!values[0] || !values[1]) return json(res, 400, { error: 'Título e mensagem são obrigatórios.' });
      const result = target === 'admins'
        ? await client.query(
            `INSERT INTO public.notifications(user_id, title, message, type)
             SELECT id, $1, $2, $3 FROM public.profiles WHERE role = 'admin' RETURNING *`, values)
        : await client.query(
            `INSERT INTO public.notifications(user_id, title, message, type) VALUES ($1,$2,$3,$4) RETURNING *`,
            [target, ...values],
          );
      return json(res, 201, { notifications: result.rows });
    }

    if (url.pathname === '/api/notifications/read' && req.method === 'POST') {
      const body = await readJson(req);
      await client.query(
        body.all
          ? 'UPDATE public.notifications SET read = TRUE WHERE user_id = $1'
          : 'UPDATE public.notifications SET read = TRUE WHERE id = $2 AND user_id = $1',
        body.all ? [session.id] : [session.id, body.id],
      );
      return json(res, 200, { status: 'success' });
    }

    if (url.pathname === '/api/notifications/delete' && req.method === 'POST') {
      const body = await readJson(req);
      await client.query('DELETE FROM public.notifications WHERE id = $1 AND user_id = $2', [body.id, session.id]);
      return json(res, 200, { status: 'success' });
    }

    if (url.pathname.startsWith('/api/admin/app/')) {
      if (!requireAdmin(session, json, res)) return;

      if (url.pathname === '/api/admin/app/engagements' && req.method === 'GET') {
        const result = await client.query(`
          SELECT e.*, d.fqdn, d.mode AS domain_mode, d.status AS domain_status, d.registration_fee_cents,
                 p.name AS customer_name, p.email AS customer_email,
                 proj.name AS project_name, proj.status AS project_status
          FROM public.service_engagements e
          JOIN public.profiles p ON p.id = e.user_id
          LEFT JOIN public.service_domains d ON d.engagement_id = e.id
          LEFT JOIN public.projects proj ON proj.engagement_id = e.id
          ORDER BY e.created_at DESC
        `);
        return json(res, 200, { engagements: result.rows });
      }

      if (url.pathname === '/api/admin/app/domains' && req.method === 'GET') {
        const result = await client.query(`
          SELECT d.*, e.public_code, e.service_name_snapshot, p.name AS customer_name, p.email AS customer_email
          FROM public.service_domains d
          JOIN public.service_engagements e ON e.id = d.engagement_id
          JOIN public.profiles p ON p.id = e.user_id
          ORDER BY d.created_at DESC
        `);
        return json(res, 200, { domains: result.rows });
      }

      if (url.pathname === '/api/admin/app/domains' && req.method === 'PATCH') {
        const body = await readJson(req);
        const { domainId, status, fqdn } = body;
        const result = await client.query(`
          UPDATE public.service_domains
          SET status = COALESCE($1, status),
              fqdn = COALESCE($2, fqdn),
              dns_verified_at = CASE WHEN $1 = 'verified' THEN NOW() ELSE dns_verified_at END,
              updated_at = NOW()
          WHERE id = $3 RETURNING *
        `, [status, fqdn, domainId]);
        if (!result.rows[0]) return json(res, 404, { error: 'Domínio não encontrado.' });
        return json(res, 200, { domain: result.rows[0] });
      }

      if (url.pathname === '/api/admin/app/migration-issues' && req.method === 'GET') {
        const result = await client.query(`
          SELECT i.*, p.name AS reviewer_name
          FROM public.data_migration_issues i
          LEFT JOIN public.profiles p ON p.id = i.resolved_by
          ORDER BY i.created_at DESC
        `);
        return json(res, 200, { issues: result.rows });
      }

      if (url.pathname === '/api/admin/app/migration-issues' && req.method === 'PATCH') {
        const body = await readJson(req);
        const { issueId, status, notes } = body;
        const result = await client.query(`
          UPDATE public.data_migration_issues
          SET status = $1, resolution_notes = $2, resolved_by = $3, resolved_at = NOW()
          WHERE id = $4 RETURNING *
        `, [status || 'resolved', notes || '', session.id, issueId]);
        if (!result.rows[0]) return json(res, 404, { error: 'Ocorrência não encontrada.' });
        return json(res, 200, { issue: result.rows[0] });
      }

      if (url.pathname === '/api/admin/app/data' && req.method === 'GET') {
        const [projects, quotes] = await Promise.all([
          loadProjects(client),
          client.query('SELECT * FROM public.quotes ORDER BY created_at DESC'),
        ]);
        return json(res, 200, { projects, quotes: quotes.rows });
      }

      const body = await readJson(req);
      if (url.pathname === '/api/admin/app/project/progress' && req.method === 'POST') {
        await client.query('UPDATE public.projects SET progress_percent = $1, updated_at = NOW() WHERE id = $2', [Math.max(0, Math.min(100, Number(body.progress))), body.projectId]);
      } else if (url.pathname === '/api/admin/app/project/status' && req.method === 'POST') {
        await client.query(`UPDATE public.projects SET status = $1, published_at = CASE WHEN $1 = 'publicado' THEN COALESCE(published_at, NOW()) ELSE published_at END, updated_at = NOW() WHERE id = $2`, [body.status, body.projectId]);
      } else if (url.pathname === '/api/admin/app/request/status' && req.method === 'POST') {
        await client.query(`UPDATE public.change_requests SET status = $1, resolved_at = CASE WHEN $1 = 'concluido' THEN NOW() ELSE NULL END WHERE id = $2`, [body.status, body.requestId]);
      } else if (url.pathname === '/api/admin/app/invoice' && req.method === 'POST') {
        await client.query(`INSERT INTO public.payments(project_id, description, amount, due_date, status, type) VALUES ($1,$2,$3,NOW() + INTERVAL '5 days','pendente',$4)`, [body.projectId, body.description, Number(body.amount), body.type]);
      } else if (url.pathname === '/api/admin/app/quote/status' && req.method === 'POST') {
        await client.query('UPDATE public.quotes SET status = $1, updated_at = NOW() WHERE id = $2', [body.status, body.quoteId]);
      } else if (url.pathname === '/api/admin/app/quote/delete' && req.method === 'POST') {
        await client.query('DELETE FROM public.quotes WHERE id = $1', [body.quoteId]);
      } else if (url.pathname === '/api/admin/app/project/delete' && req.method === 'POST') {
        await client.query('DELETE FROM public.projects WHERE id = $1', [body.projectId]);
      } else if (url.pathname === '/api/admin/app/payment/delete' && req.method === 'POST') {
        await client.query('DELETE FROM public.payments WHERE id = $1', [body.paymentId]);
      } else if (url.pathname === '/api/admin/app/project' && req.method === 'POST') {
        await client.query('BEGIN');
        try {
          const project = await client.query(
            `INSERT INTO public.projects(user_id,name,template,segment,plan,monthly_fee,activation_fee,estimated_delivery)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [body.userId, body.name, body.template || '', body.segment || 'Geral', body.plan || 'Pro', Number(body.monthlyFee || 0), Number(body.activationFee || 0), body.estimatedDelivery],
          );
          const projectId = project.rows[0].id;
          const milestones = [
            ['Briefing recebido', 'Formulário de briefing preenchido e arquivos enviados.', 2],
            ['Design aprovado', 'Wireframes e identidade visual aprovados.', 5],
            ['Desenvolvimento', 'Construção do site.', 10],
            ['Revisão do cliente', 'Site enviado para revisão.', 12],
            ['Publicação', 'Publicação no domínio contratado.', 14],
          ];
          for (let position = 0; position < milestones.length; position += 1) {
            const [title, description, days] = milestones[position];
            await client.query(
              `INSERT INTO public.milestones(project_id,title,description,estimated_at,position)
               VALUES ($1,$2,$3,NOW() + ($4 || ' days')::interval,$5)`,
              [projectId, title, description, days, position],
            );
          }
          if (Number(body.activationFee || 0) > 0) {
            await client.query(
              `INSERT INTO public.payments(project_id,description,amount,due_date,status,type)
               VALUES ($1,$2,$3,NOW() + INTERVAL '3 days','pendente','ativacao')`,
              [projectId, `Taxa de ativação — Plano ${body.plan}`, Number(body.activationFee)],
            );
          }
          await client.query('COMMIT');
          const projects = await loadProjects(client);
          return json(res, 201, { project: projects.find((item) => item.id === projectId) });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        return json(res, 404, { error: 'API route not found' });
      }
      return json(res, 200, { status: 'success' });
    }

    return json(res, 404, { error: 'API route not found' });
  } finally {
    await client.end();
  }
}
