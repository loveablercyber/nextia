import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, KeyRound, Loader2, Save, ShieldCheck, Users } from 'lucide-react';
import { roleLabel, type PermissionKey } from '../../config/permissions';
import type { UserRole } from '../../types/auth';

interface PermissionDefinition {
  key: PermissionKey;
  group: string;
  label: string;
  description: string;
}

interface PermissionUser {
  id: string;
  name: string;
  email: string;
  role: Extract<UserRole, 'admin' | 'financial' | 'support'>;
  permissions: PermissionKey[];
}

interface PermissionsResponse {
  catalog: PermissionDefinition[];
  users: PermissionUser[];
}

export default function AdminPermissionsPage() {
  const [catalog, setCatalog] = useState<PermissionDefinition[]>([]);
  const [users, setUsers] = useState<PermissionUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/permissions/users', { credentials: 'include' });
      const data = await response.json() as PermissionsResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as permissões.');
      setCatalog(data.catalog || []);
      setUsers(data.users || []);
      setSelectedId((current) => current || data.users.find((user) => user.role !== 'admin')?.id || data.users[0]?.id || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar as permissões.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => users.find((user) => user.id === selectedId), [selectedId, users]);
  useEffect(() => { setDraft(selected?.permissions || []); }, [selected]);

  const toggle = (key: PermissionKey) => {
    setDraft((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const save = async () => {
    if (!selected || selected.role === 'admin') return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/permissions/users/update', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selected.id, permissions: draft }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar as permissões.');
      setUsers((current) => current.map((user) => user.id === selected.id ? { ...user, permissions: [...draft] } : user));
      setMessage('Permissões atualizadas com sucesso. Elas valerão na próxima requisição do usuário.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar as permissões.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Carregando permissões" /></div>;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4"><span className="rounded-2xl bg-blue-50 p-3 text-blue-600"><KeyRound /></span><div><h2 className="text-2xl font-black text-slate-950">Gerenciamento de permissões</h2><p className="mt-1 text-slate-600">Defina exatamente quais módulos cada usuário interno pode visualizar e gerenciar. Administradores mantêm acesso total.</p></div></div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-4" aria-label="Usuários internos">
          <h3 className="mb-3 flex items-center gap-2 px-2 font-black text-slate-900"><Users className="h-5 w-5" />Equipe</h3>
          <div className="space-y-2">
            {users.map((user) => <button key={user.id} type="button" onClick={() => { setSelectedId(user.id); setMessage(''); }} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === user.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}><span className="block font-bold text-slate-950">{user.name || user.email}</span><span className="block truncate text-sm text-slate-500">{user.email}</span><span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{roleLabel(user.role)}</span></button>)}
            {users.length === 0 && <p className="p-4 text-sm text-slate-500">Nenhum usuário interno cadastrado.</p>}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          {!selected ? <p className="text-slate-500">Selecione um usuário para revisar os acessos.</p> : <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><div><h3 className="text-xl font-black text-slate-950">{selected.name || selected.email}</h3><p className="text-sm text-slate-500">Perfil: {roleLabel(selected.role)}</p></div>{selected.role === 'admin' && <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700"><ShieldCheck className="h-4 w-4" />Acesso total protegido</span>}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catalog.map((permission) => {
                const checked = selected.role === 'admin' || draft.includes(permission.key);
                return <label key={permission.key} className={`flex gap-3 rounded-2xl border p-4 ${checked ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200'}`}><input type="checkbox" disabled={selected.role === 'admin'} checked={checked} onChange={() => toggle(permission.key)} className="mt-1 h-4 w-4" /><span><span className="mb-1 flex items-center gap-2 font-bold text-slate-950">{permission.label}{checked && <Check className="h-4 w-4 text-blue-600" />}</span><span className="block text-sm text-slate-600">{permission.description}</span><span className="mt-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{permission.group}</span></span></label>;
              })}
            </div>
            {selected.role !== 'admin' && <div className="mt-6 flex justify-end"><button type="button" disabled={saving} onClick={() => void save()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Salvando...' : 'Salvar permissões'}</button></div>}
          </>}
        </section>
      </div>
    </div>
  );
}
