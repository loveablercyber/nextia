// src/lib/leadAttribution.ts
// Captura de origem/UTMs com first touch persistente (localStorage)
// e last touch da sessao atual (sessionStorage).
// As chaves emitidas (utm_*) sao compativeis com a tabela public.crm_leads
// criada pela migration 0006_crm_module.sql.

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const FIRST_TOUCH_KEY = 'nextia_first_touch';
const LAST_TOUCH_KEY = 'nextia_last_touch';
const STORAGE_VERSION = 1;

export interface LeadAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  conversion_page: string | null;
  first_touch_source: string | null;
  first_touch_at: string | null;
  last_touch_source: string | null;
  last_touch_at: string | null;
}

interface TouchSnapshot {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  ts: string;
}

interface StoredTouch {
  version: number;
  data: TouchSnapshot;
}

function readUtms(): Record<string, string | null> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string | null> = {};
  for (const k of UTM_KEYS) out[k] = params.get(k);
  return out;
}

function referrerHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname;
    return host === window.location.hostname ? null : host;
  } catch {
    return null;
  }
}

/**
 * Captura first touch uma unica vez (localStorage) e atualiza o last touch
 * (sessionStorage) a cada visita com UTM ou referrer externo.
 * Deve ser chamada na inicializacao do app e a cada navegacao de rota.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const utms = readUtms();
    const hasAnyUtm = UTM_KEYS.some((k) => utms[k]);
    const externalRef = referrerHost(document.referrer);
    const previousLast = readSnapshot(sessionStorage, LAST_TOUCH_KEY);
    const snapshot: TouchSnapshot = {
      utm_source: hasAnyUtm ? utms.utm_source : previousLast?.utm_source || null,
      utm_medium: hasAnyUtm ? utms.utm_medium : previousLast?.utm_medium || null,
      utm_campaign: hasAnyUtm ? utms.utm_campaign : previousLast?.utm_campaign || null,
      utm_term: hasAnyUtm ? utms.utm_term : previousLast?.utm_term || null,
      utm_content: hasAnyUtm ? utms.utm_content : previousLast?.utm_content || null,
      referrer: externalRef ? document.referrer : previousLast?.referrer || document.referrer || null,
      landing_page: window.location.pathname + window.location.search,
      ts: new Date().toISOString(),
    };

    if (!localStorage.getItem(FIRST_TOUCH_KEY)) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify({ version: STORAGE_VERSION, data: snapshot } satisfies StoredTouch));
    }
    sessionStorage.setItem(LAST_TOUCH_KEY, JSON.stringify({ version: STORAGE_VERSION, data: snapshot } satisfies StoredTouch));
  } catch {
    // storage indisponivel (modo privado) - ignora sem quebrar
  }
}

function readSnapshot(storage: Storage, key: string): TouchSnapshot | null {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null') as TouchSnapshot | StoredTouch | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if ('version' in parsed && 'data' in parsed) return parsed.version === STORAGE_VERSION ? parsed.data : null;
    return parsed as TouchSnapshot;
  } catch {
    return null;
  }
}

/** Retorna o payload de atribuicao pronto para enviar junto com o lead/orcamento. */
export function getAttribution(): LeadAttribution {
  if (typeof window === 'undefined') {
    return {
      utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null,
      referrer: null, landing_page: null, conversion_page: null,
      first_touch_source: null, first_touch_at: null, last_touch_source: null, last_touch_at: null,
    };
  }
  const first = readSnapshot(window.localStorage, FIRST_TOUCH_KEY);
  const last = readSnapshot(window.sessionStorage, LAST_TOUCH_KEY);
  const now = new Date().toISOString();
  const firstSource = first?.utm_source || referrerHost(first?.referrer ?? null) || 'direto';
  const lastSource = last?.utm_source || referrerHost(last?.referrer ?? null) || firstSource;
  return {
    utm_source: last?.utm_source ?? first?.utm_source ?? null,
    utm_medium: last?.utm_medium ?? first?.utm_medium ?? null,
    utm_campaign: last?.utm_campaign ?? first?.utm_campaign ?? null,
    utm_term: last?.utm_term ?? first?.utm_term ?? null,
    utm_content: last?.utm_content ?? first?.utm_content ?? null,
    referrer: last?.referrer ?? first?.referrer ?? null,
    landing_page: first?.landing_page ?? window.location.pathname,
    conversion_page: window.location.pathname,
    first_touch_source: firstSource,
    first_touch_at: first?.ts ?? now,
    last_touch_source: lastSource,
    last_touch_at: last?.ts ?? now,
  };
}

/**
 * Envia um lead publico para o CRM (endpoint POST /api/leads, nao autenticado).
 * Nunca lanca - falha de tracking nao pode quebrar o formulario do usuario.
 */
export async function submitPublicLead(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, ...getAttribution() }),
    });
  } catch {
    // silencioso por design
  }
}
