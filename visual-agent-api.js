import crypto from 'node:crypto';
import { AIService } from './ai-service.js';

const PUBLIC_PREFIX = '/api/visual-agent';
const ADMIN_PREFIX = '/api/admin/visual-agent';
const allowedStates = new Set(['idle','listening','thinking','speaking','success','happy','warning','error','attention']);
const allowedPages = new Set(['/painel/pedidos','/painel/configuracoes','/painel/servicos','/painel/suporte','/modelos','/solucoes','/contato','/login']);

export function isVisualAgentApiPath(pathname) { return pathname.startsWith(PUBLIC_PREFIX) || pathname.startsWith(ADMIN_PREFIX); }

function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function sessionKey(req, session) {
  if (session?.id) return `user:${session.id}`;
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return `guest:${hash(`${forwarded || req.socket?.remoteAddress || 'unknown'}:${req.headers['user-agent'] || ''}`).slice(0, 32)}`;
}
export function safeConfig(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    model: source.model === '33' ? '33' : '22', desktop: source.desktop !== false, tablet: source.tablet !== false, mobile: source.mobile !== false,
    desktopSize: Math.max(260, Math.min(360, Number(source.desktopSize || 320))), tabletSize: Math.max(180, Math.min(280, Number(source.tabletSize || 220))), mobileSize: Math.max(120, Math.min(180, Number(source.mobileSize || 150))),
    position: source.position === 'left' ? 'left' : 'right', draggable: source.draggable !== false, minimizable: source.minimizable !== false, hideable: source.hideable !== false, followCursor: source.followCursor === true,
    voiceAutoplay: source.voiceAutoplay === true, volume: Math.max(0, Math.min(1, Number(source.volume ?? .8))), speechRate: Math.max(.5, Math.min(2, Number(source.speechRate || 1))), lipSync: source.lipSync !== false,
    maxInputChars: Math.max(200, Math.min(4000, Number(source.maxInputChars || 2000))), maxOutputTokens: Math.max(100, Math.min(1000, Number(source.maxOutputTokens || 500))), contextMessages: Math.max(2, Math.min(10, Number(source.contextMessages || 6))),
    perMinute: Math.max(1, Math.min(30, Number(source.perMinute || 6))), perHour: Math.max(10, Math.min(500, Number(source.perHour || 60))), perDay: Math.max(20, Math.min(2000, Number(source.perDay || 200))), guestPerDay: Math.max(5, Math.min(500, Number(source.guestPerDay || 40))),
    globalDailyCalls: Math.max(10, Math.min(100000, Number(source.globalDailyCalls || 1000))), globalDailyTokens: Math.max(1000, Math.min(100000000, Number(source.globalDailyTokens || 1000000))),
    performanceProfile: ['high','balanced','economy','fallback'].includes(source.performanceProfile) ? source.performanceProfile : 'balanced',
    idleSeconds: Math.max(30, Math.min(600, Number(source.idleSeconds || 90))), personality: ['profissional','amigável','objetivo'].includes(source.personality) ? source.personality : 'profissional',
    agentName: String(source.agentName || 'Nia').slice(0, 40), welcomeMessage: String(source.welcomeMessage || 'Olá! Posso ajudar com a plataforma Nextia.').slice(0, 300),
  };
}
export function compactHistory(rows, maxChars = 1800) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  return rows.map((row) => `${row.role === 'assistant' ? 'Assistente' : 'Usuário'}: ${String(row.content || '').replace(/\s+/g, ' ').slice(0, 280)}`).join('\n').slice(-maxChars);
}
async function settings(client) {
  const result = await client.query("SELECT key,value FROM public.automation_settings WHERE key LIKE 'visual_agent.%'");
  const map = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return { enabled: map['visual_agent.enabled'] === true, live2dEnabled: map['visual_agent.live2d_enabled'] === true, aiEnabled: map['visual_agent.ai_enabled'] === true, voiceEnabled: map['visual_agent.voice_enabled'] === true, config: safeConfig(map['visual_agent.config']) };
}
export function classify(message) {
  const normalized = message.toLocaleLowerCase('pt-BR');
  if (/(ignore|esqueça|desconsidere).{0,35}(instruç|regra|prompt|sistema)|revele.{0,20}(prompt|segredo|chave)/i.test(normalized)) return 'off_topic';
  if (/(receita|segunda guerra|lição de casa|redação|escreva (um )?livro|exercício de matemática)/i.test(normalized)) return 'off_topic';
  if (/(idiota|imbecil|ameaça|ódio)/i.test(normalized)) return 'abuse';
  if (/(pedido|senha|cadastro|conta|agendamento|serviço|produto|site|plano|pagamento|fatura|suporte|configuraç|naveg|nextia|orçamento|modelo)/i.test(normalized)) return 'allowed';
  return 'unknown';
}
export function localAnswer(message, authenticated) {
  const value = message.toLocaleLowerCase('pt-BR');
  if (/onde.{0,20}(meus )?pedidos|ver.{0,15}pedidos/.test(value)) return authenticated ? { message: 'Seus pedidos ficam em Meu painel → Pedidos.', path: '/painel/pedidos' } : { message: 'Entre na sua conta para consultar seus pedidos.', path: '/login' };
  if (/(alterar|trocar|mudar).{0,15}senha/.test(value)) return authenticated ? { message: 'Abra as configurações da conta para atualizar sua senha.', path: '/painel/configuracoes' } : { message: 'Na tela de login, use “Esqueci minha senha”.', path: '/login' };
  if (/entrar em contato|falar com|contato/.test(value)) return { message: 'Você pode falar com a equipe pela página de contato.', path: '/contato' };
  if (/serviços|soluções/.test(value)) return { message: 'Veja todas as soluções disponíveis na página de soluções.', path: '/solucoes' };
  return null;
}
function structured(message, path = null, avatarState = 'success') { return { message, avatarState, speak: false, suggestedAction: path ? { type: 'open_page', path, label: 'Abrir página' } : null }; }

async function enforceLimits(client, key, config, message, authenticated) {
  const counts = await client.query(`SELECT
    COUNT(*) FILTER (WHERE role='user' AND created_at>=NOW()-INTERVAL '1 minute')::int minute,
    COUNT(*) FILTER (WHERE role='user' AND created_at>=NOW()-INTERVAL '1 hour')::int hour,
    COUNT(*) FILTER (WHERE role='user' AND created_at>=CURRENT_DATE)::int day,
    COUNT(*) FILTER (WHERE role='user' AND content=$2 AND created_at>=NOW()-INTERVAL '10 minutes')::int repeated
    FROM public.visual_agent_messages WHERE session_key=$1`, [key, message]);
  const row = counts.rows[0];
  const daily = authenticated ? config.perDay : Math.min(config.perDay, config.guestPerDay);
  if (row.repeated >= 2) throw Object.assign(new Error('Mensagem repetida muitas vezes. Aguarde antes de tentar novamente.'), { status: 429 });
  if (row.minute >= config.perMinute || row.hour >= config.perHour || row.day >= daily) throw Object.assign(new Error('Limite temporário de mensagens atingido. Tente novamente mais tarde.'), { status: 429 });
}
async function enforceGlobalBudget(client, config) {
  const result = await client.query(`SELECT COUNT(*)::int calls,
    COALESCE(SUM(tokens_input+tokens_output),0)::bigint tokens
    FROM public.ai_runs WHERE purpose='visual_agent_chat' AND created_at>=CURRENT_DATE`);
  const row = result.rows[0] || { calls: 0, tokens: 0 };
  if (Number(row.calls) >= config.globalDailyCalls || Number(row.tokens) >= config.globalDailyTokens) {
    throw Object.assign(new Error('O orçamento diário do assistente foi atingido. As respostas locais continuam disponíveis.'), { status: 429 });
  }
}
export function validateAction(action) {
  if (!action || action.type !== 'open_page' || !allowedPages.has(action.path)) return null;
  return { type: 'open_page', path: action.path, label: String(action.label || 'Abrir página').slice(0, 60) };
}

export async function handleVisualAgentApi(req, res, url, { dbClient, getSessionProfile, json, readJson }) {
  const client = dbClient();
  await client.connect();
  try {
  const session = await getSessionProfile(req, client);
  const current = await settings(client);
  if (url.pathname === `${PUBLIC_PREFIX}/config` && req.method === 'GET') return json(res, 200, current);

  if (url.pathname === `${PUBLIC_PREFIX}/event` && req.method === 'POST') {
    const body = await readJson(req); const eventType = String(body.eventType || '').slice(0, 80);
    if (!/^[a-z0-9_.-]+$/i.test(eventType)) return json(res, 400, { error: 'Evento inválido.' });
    await client.query('INSERT INTO public.visual_agent_events(session_key,user_id,event_type,metadata) VALUES($1,$2,$3,$4)', [sessionKey(req, session), session?.id || null, eventType, JSON.stringify(body.metadata && typeof body.metadata === 'object' ? body.metadata : {})]);
    return json(res, 202, { accepted: true });
  }

  if (url.pathname === `${PUBLIC_PREFIX}/feedback` && req.method === 'POST') {
    const body = await readJson(req); const rating = String(body.rating || ''); const messageId = String(body.messageId || '');
    if (!['up','down'].includes(rating) || !/^[0-9a-f-]{36}$/i.test(messageId)) return json(res, 400, { error: 'Feedback inválido.' });
    const key = sessionKey(req, session);
    const owned = await client.query("SELECT id FROM public.visual_agent_messages WHERE id=$1 AND session_key=$2 AND role='assistant'", [messageId, key]);
    if (!owned.rows[0]) return json(res, 404, { error: 'Resposta não encontrada.' });
    await client.query(`INSERT INTO public.visual_agent_feedback(message_id,session_key,user_id,rating)
      VALUES($1,$2,$3,$4) ON CONFLICT(message_id,session_key) DO UPDATE SET rating=EXCLUDED.rating,created_at=NOW()`, [messageId, key, session?.id || null, rating]);
    return json(res, 200, { accepted: true });
  }

  if (url.pathname === `${PUBLIC_PREFIX}/chat` && req.method === 'POST') {
    if (!current.enabled) return json(res, 503, { error: 'Assistente temporariamente indisponível.' });
    const body = await readJson(req); const message = String(body.message || '').trim();
    if (!message) return json(res, 400, { error: 'Digite uma mensagem.' });
    if (message.length > current.config.maxInputChars) return json(res, 413, { error: `A mensagem deve ter até ${current.config.maxInputChars} caracteres.` });
    const key = sessionKey(req, session);
    try { await enforceLimits(client, key, current.config, message, Boolean(session)); } catch (error) { return json(res, error.status || 429, { error: error.message }); }
    const scope = classify(message);
    await client.query('INSERT INTO public.visual_agent_messages(session_key,user_id,role,content,scope_classification) VALUES($1,$2,$3,$4,$5)', [key, session?.id || null, 'user', message, scope]);
    if (scope === 'off_topic' || scope === 'abuse') {
      const result = structured('Posso ajudar com funções, serviços e informações disponíveis na plataforma Nextia.', null, 'warning');
      const saved = await client.query('INSERT INTO public.visual_agent_messages(session_key,user_id,role,content,scope_classification) VALUES($1,$2,$3,$4,$5) RETURNING id', [key, session?.id || null, 'assistant', result.message, scope]);
      return json(res, 200, { ...result, source: 'scope_filter', messageId: saved.rows[0].id });
    }
    const faq = localAnswer(message, Boolean(session));
    if (faq) {
      const saved = await client.query('INSERT INTO public.visual_agent_messages(session_key,user_id,role,content,scope_classification) VALUES($1,$2,$3,$4,$5) RETURNING id', [key, session?.id || null, 'assistant', faq.message, scope]);
      return json(res, 200, { ...structured(faq.message, faq.path), source: 'faq', messageId: saved.rows[0].id });
    }
    if (!current.aiEnabled || !navigatorOnline(body)) return json(res, 200, { ...structured('A IA está indisponível agora. Posso continuar ajudando com navegação e dúvidas frequentes.', null, 'warning'), source: 'fallback', degraded: true });
    try { await enforceGlobalBudget(client, current.config); } catch (error) { return json(res, error.status || 429, { ...structured(error.message, null, 'warning'), source: 'budget', degraded: true }); }
    const history = await client.query('SELECT role,content,created_at FROM public.visual_agent_messages WHERE session_key=$1 ORDER BY created_at DESC LIMIT $2', [key, current.config.contextMessages * 3]);
    const chronological = history.rows.reverse(); const recent = chronological.slice(-current.config.contextMessages); const older = chronological.slice(0, -current.config.contextMessages);
    let summary = '';
    if (older.length) {
      summary = compactHistory(older);
      await client.query(`INSERT INTO public.visual_agent_sessions(session_key,user_id,summary,updated_at) VALUES($1,$2,$3,NOW())
        ON CONFLICT(session_key) DO UPDATE SET user_id=EXCLUDED.user_id,summary=EXCLUDED.summary,updated_at=NOW()`, [key, session?.id || null, summary]);
    } else {
      const stored = await client.query('SELECT summary FROM public.visual_agent_sessions WHERE session_key=$1', [key]); summary = stored.rows[0]?.summary || '';
    }
    const context = { message, scope, summary, history: recent, user: session ? { authenticated: true, role: session.role } : { authenticated: false }, allowedActions: [...allowedPages].map((path) => ({ type: 'open_page', path })) };
    try {
      const generated = await new AIService(client).generate({ purpose: 'visual_agent_chat', source: {}, contextOverride: context, enabledSetting: 'visual_agent.ai_enabled', maxTokens: current.config.maxOutputTokens });
      const raw = generated.result || {}; const result = { message: String(raw.message || '').slice(0, 2000) || 'Não consegui formular uma resposta.', avatarState: allowedStates.has(raw.avatarState) ? raw.avatarState : 'success', speak: raw.speak === true, suggestedAction: validateAction(raw.suggestedAction) };
      const saved = await client.query('INSERT INTO public.visual_agent_messages(session_key,user_id,role,content,scope_classification) VALUES($1,$2,$3,$4,$5) RETURNING id', [key, session?.id || null, 'assistant', result.message, scope]);
      return json(res, 200, { ...result, source: 'ai', requestId: generated.aiRunId, messageId: saved.rows[0].id });
    } catch {
      return json(res, 200, { ...structured('Não consegui acessar a IA agora. Tente novamente em instantes ou use as opções de navegação.', null, 'warning'), source: 'fallback', degraded: true });
    }
  }

  if (url.pathname.startsWith(ADMIN_PREFIX)) {
    if (!session) return json(res, 401, { error: 'Não autenticado.' });
    if (session.role !== 'admin') return json(res, 403, { error: 'Acesso exclusivo para administradores.' });
    if (url.pathname === `${ADMIN_PREFIX}/settings` && req.method === 'GET') return json(res, 200, current);
    if (url.pathname === `${ADMIN_PREFIX}/settings` && req.method === 'PATCH') {
      const body = await readJson(req); const nextConfig = safeConfig({ ...current.config, ...(body.config || {}) });
      const entries = [['visual_agent.enabled', body.enabled ?? current.enabled], ['visual_agent.live2d_enabled', body.live2dEnabled ?? current.live2dEnabled], ['visual_agent.ai_enabled', body.aiEnabled ?? current.aiEnabled], ['visual_agent.voice_enabled', body.voiceEnabled ?? current.voiceEnabled], ['visual_agent.config', nextConfig]];
      for (const [key, value] of entries) await client.query('UPDATE public.automation_settings SET value=$2,updated_by=$3,updated_at=NOW() WHERE key=$1', [key, JSON.stringify(value), session.id]);
      return json(res, 200, await settings(client));
    }
    if (url.pathname === `${ADMIN_PREFIX}/overview` && req.method === 'GET') {
      const [events, usage, feedback] = await Promise.all([
        client.query("SELECT event_type,COUNT(*)::int total FROM public.visual_agent_events WHERE created_at>=CURRENT_DATE-INTERVAL '30 days' GROUP BY event_type ORDER BY total DESC"),
        client.query("SELECT COUNT(*)::int calls,COALESCE(SUM(tokens_input+tokens_output),0)::bigint tokens,COALESCE(SUM(cost_estimate),0)::numeric cost FROM public.ai_runs WHERE purpose='visual_agent_chat' AND created_at>=CURRENT_DATE"),
        client.query("SELECT rating,COUNT(*)::int total FROM public.visual_agent_feedback WHERE created_at>=CURRENT_DATE-INTERVAL '30 days' GROUP BY rating"),
      ]);
      return json(res, 200, { events: events.rows, usage: usage.rows[0], feedback: feedback.rows });
    }
  }
  return json(res, 404, { error: 'Rota do assistente não encontrada.' });
  } finally {
    await client.end();
  }
}

function navigatorOnline(body) { return body.online !== false; }
