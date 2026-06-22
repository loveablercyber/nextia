import { useState } from 'react';
import {
  User as UserIcon, Bell, CheckCircle2, Lock, Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    company: user?.company ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate saving
    await new Promise(r => setTimeout(r, 800));
    updateProfile(form);
    
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return;

    setPwLoading(true);
    setPwSuccess(false);

    // Simulate saving
    await new Promise(r => setTimeout(r, 800));
    
    setPwLoading(false);
    setPwSuccess(true);
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Profile Info */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-950 text-sm mb-1 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#5B4FE9]" />
            Dados cadastrais
          </h3>
          <p className="text-gray-400 text-xs mb-5">
            Mantenha suas informações de contato atualizadas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Empresa / Negócio
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  E-mail de acesso
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              {success ? (
                <span className="text-xs text-green-600 font-bold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Alterações salvas!
                </span>
              ) : (
                <span />
              )}
              <Button type="submit" variant="gradient" size="sm" loading={loading}>
                <Save className="w-3.5 h-3.5" />
                Salvar alterações
              </Button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-950 text-sm mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7c3aed]" />
            Alterar senha
          </h3>
          <p className="text-gray-400 text-xs mb-5">
            Atualize sua senha de acesso por segurança.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Senha atual
              </label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nova senha
                </label>
                <input
                  type="password"
                  required
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  required
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              {pwSuccess ? (
                <span className="text-xs text-green-600 font-bold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Senha atualizada!
                </span>
              ) : (
                <span />
              )}
              <Button type="submit" variant="gradient" size="sm" loading={pwLoading}>
                <Save className="w-3.5 h-3.5" />
                Alterar senha
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Preferences Info */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-950 text-sm mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Notificações
          </h3>
          <div className="space-y-3">
            {[
              { id: 'n1', title: 'Atualizações do site', desc: 'Alertas sobre aprovação de design e etapas de desenvolvimento' },
              { id: 'n2', title: 'Mensagens do suporte', desc: 'Aviso quando um atendente responder sua solicitação' },
              { id: 'n3', title: 'Financeiro', desc: 'Alertas de vencimento de boleto e faturamento' },
            ].map(item => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded border-gray-300 text-[#5B4FE9] focus:ring-[#5B4FE9] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-gray-700 block">{item.title}</span>
                  <span className="text-[10px] text-gray-400 leading-tight block">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
