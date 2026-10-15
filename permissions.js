export const PERMISSION_CATALOG = Object.freeze([
  Object.freeze({ key: 'finance.view', group: 'Financeiro', label: 'Visualizar financeiro', description: 'Consulta projetos, cobranças e faturas.' }),
  Object.freeze({ key: 'finance.manage', group: 'Financeiro', label: 'Gerenciar financeiro', description: 'Emite e remove cobranças e envia avisos financeiros.' }),
  Object.freeze({ key: 'support.view', group: 'Suporte', label: 'Visualizar suporte', description: 'Consulta chamados, mensagens e dados necessários ao atendimento.' }),
  Object.freeze({ key: 'support.manage', group: 'Suporte', label: 'Gerenciar suporte', description: 'Responde, classifica, atribui e encerra chamados.' }),
]);

export const PERMISSION_KEYS = Object.freeze(PERMISSION_CATALOG.map((item) => item.key));

const DEFAULTS = Object.freeze({
  financial: Object.freeze(['finance.view', 'finance.manage']),
  support: Object.freeze(['support.view', 'support.manage']),
});

export function normalizePermissionOverrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, granted]) => PERMISSION_KEYS.includes(key) && typeof granted === 'boolean'),
  );
}

export function effectivePermissions(role, overrides = {}) {
  if (role === 'admin') return [...PERMISSION_KEYS];
  if (role !== 'financial' && role !== 'support') return [];
  const permissions = new Set(DEFAULTS[role] || []);
  for (const [key, granted] of Object.entries(normalizePermissionOverrides(overrides))) {
    if (granted) permissions.add(key);
    else permissions.delete(key);
  }
  return PERMISSION_KEYS.filter((key) => permissions.has(key));
}

export function hasPermission(profile, permission) {
  return profile?.role === 'admin' || Boolean(profile?.permissions?.includes(permission));
}

export function defaultPermissions(role) {
  return effectivePermissions(role);
}
