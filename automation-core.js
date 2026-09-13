import { createHash } from 'node:crypto';

const SECRET_KEY = /(authorization|api[_-]?key|password|passwd|secret|token|cookie|credential|private[_-]?key)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)/g;

export class AutomationError extends Error {
  constructor(message, { code = 'AUTOMATION_ERROR', retryable = false, status = 500 } = {}) {
    super(message);
    this.name = 'AutomationError';
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

export function stableHash(value) {
  return createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex');
}

export function sanitizeForLog(value, depth = 0) {
  if (depth > 8) return '[TRUNCATED]';
  if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') {
    return value.slice(0, 4000).replace(EMAIL, '[EMAIL]').replace(PHONE, '[PHONE]');
  }
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitizeForLog(item, depth + 1));
  if (typeof value === 'object') {
    const output = {};
    for (const [key, item] of Object.entries(value).slice(0, 100)) {
      output[key] = SECRET_KEY.test(key) ? '[REDACTED]' : sanitizeForLog(item, depth + 1);
    }
    return output;
  }
  return String(value).slice(0, 1000);
}

export function buildMinimalAiContext(purpose, source = {}) {
  const allowlists = {
    lead_qualification: ['name', 'companyName', 'city', 'segment', 'service', 'source', 'notes', 'message', 'status', 'score'],
    followup_draft: ['name', 'companyName', 'service', 'proposalTitle', 'proposalStatus', 'lastInteraction', 'stage'],
    proposal_draft: ['companyName', 'service', 'need', 'objectives', 'stage', 'catalogFacts'],
    briefing_analysis: ['service', 'objectives', 'audience', 'references', 'requirements', 'responses'],
    support_triage: ['subject', 'message', 'service', 'currentStatus'],
    summary: ['title', 'status', 'service', 'history', 'notes'],
  };
  const keys = allowlists[purpose] || [];
  const context = {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') context[key] = source[key];
  }
  return sanitizeForLog(context);
}

export function valueAtPath(source, path) {
  if (!path || typeof path !== 'string' || !/^[a-zA-Z0-9_.]+$/.test(path)) return undefined;
  return path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), source);
}

function compareCondition(actual, operator, expected) {
  switch (operator) {
    case 'eq': return actual === expected;
    case 'neq': return actual !== expected;
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : String(actual ?? '').includes(String(expected));
    case 'exists': return expected === false ? actual === undefined || actual === null : actual !== undefined && actual !== null;
    default: return false;
  }
}

export function evaluateConditions(definition, context) {
  const operator = String(definition?.operator || 'and').toLowerCase();
  const rules = Array.isArray(definition?.rules) ? definition.rules : [];
  if (rules.length === 0) return { matched: true, results: [] };
  const results = rules.map((rule) => {
    if (rule?.rules) return evaluateConditions(rule, context);
    const actual = valueAtPath(context, rule?.field);
    return {
      field: rule?.field,
      operator: rule?.operator,
      matched: compareCondition(actual, rule?.operator, rule?.value),
    };
  });
  const matched = operator === 'or' ? results.some((item) => item.matched) : results.every((item) => item.matched);
  return { matched, results };
}

export function retryDelaySeconds(attempt) {
  const schedule = [30, 120, 600, 1800, 3600];
  return schedule[Math.min(Math.max(Number(attempt || 1) - 1, 0), schedule.length - 1)];
}

export function validateAction(action) {
  const allowed = new Set([
    'assign_lead',
    'create_crm_activity',
    'notify_admins',
    'prefill_project_briefing',
    'create_project_milestones',
    'ai_generate',
    'call_webhook',
  ]);
  if (!action || typeof action !== 'object' || !action.id || !allowed.has(action.type)) {
    throw new AutomationError('Ação de automação inválida.', { code: 'INVALID_ACTION', status: 400 });
  }
  return {
    id: String(action.id).slice(0, 100),
    type: action.type,
    config: action.config && typeof action.config === 'object' ? action.config : {},
    requiresApproval: action.requiresApproval === true,
  };
}

export function validateConditionTree(definition, depth = 0) {
  if (depth > 4) throw new AutomationError('Condições excedem a profundidade permitida.', { code: 'INVALID_CONDITIONS', status: 400 });
  const operator = String(definition?.operator || 'and').toLowerCase();
  if (!['and', 'or'].includes(operator)) throw new AutomationError('Operador de condições inválido.', { code: 'INVALID_CONDITIONS', status: 400 });
  const rules = Array.isArray(definition?.rules) ? definition.rules : [];
  if (rules.length > 25) throw new AutomationError('Muitas condições em uma automação.', { code: 'INVALID_CONDITIONS', status: 400 });
  for (const rule of rules) {
    if (rule?.rules) validateConditionTree(rule, depth + 1);
    else if (!rule?.field || !['eq','neq','gt','gte','lt','lte','in','not_in','contains','exists'].includes(rule?.operator)) {
      throw new AutomationError('Regra de condição inválida.', { code: 'INVALID_CONDITIONS', status: 400 });
    }
  }
  return { operator, rules };
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}
