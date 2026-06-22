import { useState } from 'react';
import {
  Globe, Sliders, Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { statusConfig } from '../../types/project';
import { templates } from '../../data/templates';
import Button from '../../components/ui/Button';

export default function AdminProjectsPage() {
  const { projects, profiles, loading, updateProjectProgress, updateProjectStatus, createProject, refreshData } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(0);

  // Modal and Form states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    userId: '',
    name: '',
    template: 'restaurante-premium',
    segment: '',
    plan: 'Pro' as 'Start' | 'Pro' | 'Business' | 'Personalizado',
    monthlyFee: 79,
    activationFee: 497,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Filter client profiles
  const clientProfiles = profiles.filter(p => p.role === 'client');

  const handleEditProgress = (id: string, currentVal: number) => {
    setEditingId(id);
    setSliderVal(currentVal);
  };

  const handleSaveProgress = async (id: string) => {
    await updateProjectProgress(id, sliderVal);
    setEditingId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.name) return;

    setSubmitting(true);
    try {
      const createdProj = await createProject({
        userId: form.userId,
        name: form.name,
        template: templates.find(t => t.slug === form.template)?.name || form.template,
        segment: form.segment,
        plan: form.plan,
        monthlyFee: Number(form.monthlyFee),
        activationFee: Number(form.activationFee),
        estimatedDelivery: new Date(form.estimatedDelivery).toISOString()
      });

      if (createdProj) {
        setSuccessMessage('Projeto criado e ativado com sucesso!');
        await refreshData();
        setTimeout(() => {
          setSuccessMessage(null);
          setCreateModalOpen(false);
          setForm({
            userId: '',
            name: '',
            template: 'restaurante-premium',
            segment: '',
            plan: 'Pro',
            monthlyFee: 79,
            activationFee: 497,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }, 2000);
      } else {
        alert('Erro ao criar projeto no servidor.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  // Automatically update suggested fees when changing template
  const handleTemplateChange = (slug: string) => {
    const selected = templates.find(t => t.slug === slug);
    if (selected) {
      setForm(prev => ({
        ...prev,
        template: slug,
        plan: (selected.recommendedPlan as any) || 'Pro',
        monthlyFee: selected.price || 79,
        activationFee: selected.activationFee || 197
      }));
    } else {
      setForm(prev => ({ ...prev, template: slug }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-950 text-sm mb-1">Gerenciar projetos de clientes</h3>
          <p className="text-gray-400 text-xs">
            Atualize a porcentagem de desenvolvimento dos sites, altere os status das etapas e crie novos projetos ativos.
          </p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Projeto Ativo
        </Button>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-4">Todos os projetos</h3>

        <div className="space-y-6">
          {projects.map((p) => {
            const currentStatus = statusConfig[p.status];
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Meta details */}
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}
                    >
                      {currentStatus.label}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Plano: <strong>Nextia {p.plan}</strong></span>
                    {p.domain && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        {p.domain}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress controls */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-500">Progresso do projeto</span>
                    <span className="text-pink-600 font-bold">{isEditing ? sliderVal : p.progressPercent}%</span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={sliderVal}
                        onChange={e => setSliderVal(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                      />
                      <Button variant="gradient" size="sm" onClick={() => handleSaveProgress(p.id)}>
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-[#7c3aed] rounded-full transition-all duration-300"
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>
                      <button
                        onClick={() => handleEditProgress(p.id, p.progressPercent)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Ajustar progresso"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status dropdown selector */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={p.status}
                    onChange={e => updateProjectStatus(p.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="aguardando-briefing">Aguardando Briefing</option>
                    <option value="em-desenvolvimento">Em Desenvolvimento</option>
                    <option value="em-revisao">Em Revisão</option>
                    <option value="aguardando-aprovacao">Aguardando Aprovação</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="publicado">🌐 Publicado</option>
                    <option value="em-manutencao">Em Manutenção</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Manual Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Criar Novo Projeto Ativo</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Cadastre e vincule um projeto diretamente ao perfil de um cliente.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h5 className="font-bold text-gray-900">{successMessage}</h5>
                <p className="text-xs text-gray-400">Criando banco de dados local/remoto...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Profile selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Perfil do Cliente Responsável <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.userId}
                    onChange={e => setForm({ ...form, userId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="">Selecione o perfil do cliente cadastrado...</option>
                    {clientProfiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.company ? `(${p.company})` : ''} — {p.phone || 'Sem celular'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    💡 Se o cliente não constar aqui, ele precisa primeiro se cadastrar na tela de `/cadastro`.
                  </p>
                </div>

                <hr className="border-gray-100" />

                {/* Project Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nome do Projeto / Site <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Site Restaurante Sabor & Arte"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Segmento
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Consultoria"
                        value={form.segment}
                        onChange={e => setForm({ ...form, segment: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Template Sugerido
                      </label>
                      <select
                        value={form.template}
                        onChange={e => handleTemplateChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      >
                        {templates.map(t => (
                          <option key={t.slug} value={t.slug}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Plano Nextia
                      </label>
                      <select
                        value={form.plan}
                        onChange={e => setForm({ ...form, plan: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      >
                        <option value="Start">Start</option>
                        <option value="Pro">Pro</option>
                        <option value="Business">Business</option>
                        <option value="Personalizado">Personalizado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mensal (R$)
                      </label>
                      <input
                        type="number"
                        required
                        value={form.monthlyFee}
                        onChange={e => setForm({ ...form, monthlyFee: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Ativação (R$)
                      </label>
                      <input
                        type="number"
                        required
                        value={form.activationFee}
                        onChange={e => setForm({ ...form, activationFee: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Prazo Estimado de Entrega
                    </label>
                    <input
                      type="date"
                      required
                      value={form.estimatedDelivery}
                      onChange={e => setForm({ ...form, estimatedDelivery: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                  <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" loading={submitting}>
                    ✓ Criar Projeto
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



