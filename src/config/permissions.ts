import type { User, UserRole } from '../types/auth';

export type PermissionKey = 'finance.view' | 'finance.manage' | 'support.view' | 'support.manage';

export const permissionCatalog: ReadonlyArray<{
  key: PermissionKey;
  group: string;
  label: string;
  description: string;
}> = [
  { key: 'finance.view', group: 'Financeiro', label: 'Visualizar financeiro', description: 'Consulta projetos, cobranças e faturas.' },
  { key: 'finance.manage', group: 'Financeiro', label: 'Gerenciar financeiro', description: 'Emite e remove cobranças e envia avisos financeiros.' },
  { key: 'support.view', group: 'Suporte', label: 'Visualizar suporte', description: 'Consulta chamados e mensagens.' },
  { key: 'support.manage', group: 'Suporte', label: 'Gerenciar suporte', description: 'Responde, classifica, atribui e encerra chamados.' },
];

export const defaultRolePermissions: Partial<Record<UserRole, PermissionKey[]>> = {
  financial: ['finance.view', 'finance.manage'],
  support: ['support.view', 'support.manage'],
};

export function hasPermission(user: User | null | undefined, permission: PermissionKey | 'admin.full') {
  if (user?.role === 'admin') return true;
  if (permission === 'admin.full') return false;
  return Boolean(user?.permissions?.includes(permission));
}

export function roleHome(role: UserRole) {
  if (role === 'admin') return '/admin';
  if (role === 'financial') return '/admin/pagamentos';
  if (role === 'support') return '/admin/suporte';
  if (role === 'partner') return '/parceiro';
  if (role === 'technician') return '/tecnico';
  return '/painel';
}

export function userHome(user: User) {
  if (user.role === 'financial') return hasPermission(user, 'finance.view') ? '/admin/pagamentos' : '/perfil';
  if (user.role === 'support') return hasPermission(user, 'support.view') ? '/admin/suporte' : '/perfil';
  return roleHome(user.role);
}

export function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    financial: 'Financeiro',
    support: 'Suporte',
    technician: 'Técnico',
    partner: 'Parceiro',
    client: 'Cliente',
  };
  return labels[role];
}
