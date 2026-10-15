import { describe, expect, it } from 'vitest';
import { defaultPermissions, effectivePermissions, hasPermission } from './permissions.js';

describe('permissões internas', () => {
  it('concede somente o módulo padrão de cada perfil', () => {
    expect(defaultPermissions('financial')).toEqual(['finance.view', 'finance.manage']);
    expect(defaultPermissions('support')).toEqual(['support.view', 'support.manage']);
  });

  it('aplica concessões e revogações explícitas', () => {
    expect(effectivePermissions('support', { 'support.manage': false, 'finance.view': true }))
      .toEqual(['finance.view', 'support.view']);
  });

  it('não concede permissões internas a clientes mesmo com registros órfãos', () => {
    expect(effectivePermissions('client', { 'finance.manage': true })).toEqual([]);
  });

  it('mantém administrador com acesso total e valida permissões de equipe', () => {
    expect(hasPermission({ role: 'admin' }, 'support.manage')).toBe(true);
    expect(hasPermission({ role: 'support', permissions: ['support.view'] }, 'support.view')).toBe(true);
    expect(hasPermission({ role: 'support', permissions: ['support.view'] }, 'finance.view')).toBe(false);
  });
});
