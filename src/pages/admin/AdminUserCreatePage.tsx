import { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { defaultRolePermissions, permissionCatalog, type PermissionKey } from '../../config/permissions';
import type { UserRole } from '../../types/auth';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
  phone: string;
  cpfCnpj: string;
  partnerStatus: string;
  permissions: PermissionKey[];
}

const emptyForm: UserForm = {
  name: '', email: '', password: '', role: 'client', company: '', phone: '',
  cpfCnpj: '', partnerStatus: 'pendente', permissions: [],
};

function Field({ label, value, onChange, type = 'text', required = true }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="font-bold text-slate-800">
      {label}
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal" />
    </label>
  );
}

export default function AdminUserCreatePage() {
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isStaff = form.role === 'financial' || form.role === 'support';

  const updateRole = (role: UserRole) => {
    setForm((current) => ({ ...current, role, permissions: [...(defaultRolePermissions[role] || [])] }));
  };

  const togglePermission = (key: PermissionKey) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key],
    }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao cadastrar.');
      setMessage('Usuário cadastrado com sucesso.');
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao cadastrar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><UserPlus />Cadastro manual de usuário</h2>
        <p className="text-slate-600">Crie clientes, parceiros, técnicos, profissionais do financeiro, suporte ou administradores.</p>
      </header>
      {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-700">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Field label="Nome" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
        <Field label="E-mail" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} />
        <Field label="Senha inicial" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} />
        <label className="font-bold text-slate-800">
          Perfil
          <select value={form.role} onChange={(event) => updateRole(event.target.value as UserRole)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal">
            <option value="client">Cliente</option><option value="partner">Parceiro</option><option value="technician">Técnico</option>
            <option value="financial">Financeiro</option><option value="support">Suporte</option><option value="admin">Administrador</option>
          </select>
        </label>
        <Field label="Empresa" required={false} value={form.company} onChange={(company) => setForm((current) => ({ ...current, company }))} />
        <Field label="Telefone" required={false} value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
        {form.role === 'partner' && <>
          <Field label="CPF/CNPJ" required={false} value={form.cpfCnpj} onChange={(cpfCnpj) => setForm((current) => ({ ...current, cpfCnpj }))} />
          <label className="font-bold text-slate-800">Situação<select value={form.partnerStatus} onChange={(event) => setForm((current) => ({ ...current, partnerStatus: event.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 font-normal"><option value="pendente">Pendente</option><option value="ativo">Ativo</option></select></label>
        </>}
        {isStaff && (
          <fieldset className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:col-span-2">
            <legend className="flex items-center gap-2 px-2 font-black text-slate-900"><ShieldCheck className="h-5 w-5 text-blue-600" />Permissões iniciais</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {permissionCatalog.map((permission) => (
                <label key={permission.key} className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" checked={form.permissions.includes(permission.key)} onChange={() => togglePermission(permission.key)} className="mt-1 h-4 w-4" />
                  <span><span className="block font-bold text-slate-900">{permission.label}</span><span className="text-sm text-slate-600">{permission.description}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <button disabled={saving} className="min-h-12 rounded-xl bg-[#1677FF] font-bold text-white disabled:opacity-60 sm:col-span-2">{saving ? 'Cadastrando...' : 'Cadastrar usuário'}</button>
      </form>
    </div>
  );
}
