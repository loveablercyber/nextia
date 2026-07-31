import { useState } from 'react';
import {
  FileText, CheckCircle2, AlertCircle, Calendar,
  Building, Mail, Phone, Search, Check, Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { templates } from '../../data/templates';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function AdminQuotesPage() {
  const { quotes, profiles, updateQuoteStatus, createProject, loading, refreshData } = useAdmin();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states for project creation
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

  // Filter quotes
  const filteredQuotes = quotes.filter(q => {
    const matchesStatus = filterStatus === 'todos' || q.status === filterStatus;
    const searchString = `${q.contact_name} ${q.contact_email} ${q.contact_company} ${q.project_type}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle open approval modal
  const handleOpenApprove = (quote: any) => {
    setSelectedQuote(quote);
    
    // Guess default values from quote
    const guessTemplate = templates.find(t => t.slug === quote.recommended_plan.toLowerCase() + '-premium' || t.recommendedPlan === quote.recommended_plan) || templates[0];
    
    setForm({
      userId: quote.user_id || '', // Prefill if associated
      name: quote.contact_company || `${quote.contact_name} - ${quote.project_type}`,
      template: guessTemplate ? guessTemplate.slug : 'restaurante-premium',
      segment: quote.segment || '',
      plan: (quote.recommended_plan as any) || 'Pro',
      monthlyFee: quote.recommended_plan === 'Start' ? 59 : quote.recommended_plan === 'Pro' ? 79 : quote.recommended_plan === 'Business' ? 89 : 79,
      activationFee: quote.estimated_min || 497,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setApproveModalOpen(true);
  };

  // Handle project submit
  const handleApproveSubmit = async (e: React.FormEvent) => {
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
        // Update quote status to contracted
        await updateQuoteStatus(selectedQuote.id, 'contratado');
        setSuccessMessage('Projeto criado e associado ao cliente com sucesso!');
        await refreshData();
        setTimeout(() => {
          setSuccessMessage(null);
          setApproveModalOpen(false);
          setSelectedQuote(null);
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

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Deseja realmente remover este orçamento? Esta ação é irreversível.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const response = await fetch('/api/admin/delete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'quote',
          id: quoteId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover orçamento.');
      }

      alert('Orçamento removido com sucesso!');
      await refreshData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro inesperado ao remover orçamento.');
    }
  };

  // Helper status badge mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'contratado':
        return <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">Contratado</span>;
      case 'respondido':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">Respondido</span>;
      case 'em-analise':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">Em análise</span>;
      default:
        return <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full">Novo</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Orçamentos', val: quotes.length, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Novos Recebidos', val: quotes.filter(q => q.status === 'novo').length, icon: AlertCircle, color: 'text-pink-600 bg-pink-50' },
          { label: 'Em Análise', val: quotes.filter(q => q.status === 'em-analise').length, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
          { label: 'Convertidos/Contratados', val: quotes.filter(q => q.status === 'contratado').length, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-400 text-xs block mb-0.5">{stat.label}</span>
              <span className="text-xl font-black text-gray-950">{stat.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main filter & search bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-full md:max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar orçamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-gray-700 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 border border-gray-100 p-1 rounded-2xl bg-gray-50/50">
            {['todos', 'novo', 'em-analise', 'respondido', 'contratado'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filterStatus === tab
                    ? 'bg-white text-pink-600 shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'em-analise' ? 'Em análise' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-gray-500 min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Contato / Empresa</th>
                <th className="pb-3">Projeto / Segmento</th>
                <th className="pb-3">Estimativa / Plano</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">
                    Nenhum orçamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/20 transition-all">
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{q.contact_name}</div>
                      <div className="text-[10px] text-gray-400 mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" /> {q.contact_email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 flex-shrink-0" /> {q.contact_phone}</span>
                        {q.contact_company && <span className="flex items-center gap-1 font-semibold text-gray-600"><Building className="w-3 h-3 flex-shrink-0" /> {q.contact_company}</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-gray-800">{q.project_type}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Segmento: {q.segment}</div>
                      <div className="text-[10px] text-gray-400">Páginas: {q.pages} · Identidade: {q.has_identity ? 'Sim' : 'Não'}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">R$ {Number(q.estimated_min || 0).toLocaleString()} - R$ {Number(q.estimated_max || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-pink-600 font-bold mt-0.5">Recomendado: Nextia {q.recommended_plan}</div>
                    </td>
                    <td className="py-4 text-gray-400">
                      {new Date(q.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4">{getStatusBadge(q.status)}</td>
                    <td className="py-4 text-right space-y-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={q.status}
                          onChange={e => updateQuoteStatus(q.id, e.target.value as any)}
                          className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-[10px] text-gray-700 outline-none"
                          disabled={q.status === 'contratado'}
                        >
                          <option value="novo">Novo</option>
                          <option value="em-analise">Em análise</option>
                          <option value="respondido">Respondido</option>
                          <option value="contratado" disabled>Contratado</option>
                        </select>

                        {q.status !== 'contratado' ? (
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => handleOpenApprove(q)}
                            className="px-2.5 py-1 text-[10px]"
                          >
                            Aprovar
                          </Button>
                        ) : (
                          <span className="text-green-600 bg-green-50 p-1.5 rounded-lg" title="Projeto já Ativo">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteQuote(q.id)}
                          title="Remover orçamento"
                          className="px-2 py-1 text-[10px] hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve and Create Project Modal */}
      {approveModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Converter em Projeto Ativo</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Criará o site, etapas e fatura de ativação automaticamente.</p>
              </div>
              <button
                onClick={() => setApproveModalOpen(false)}
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
                <p className="text-xs text-gray-400">Atualizando os painéis e sincronizando...</p>
              </div>
            ) : (
              <form onSubmit={handleApproveSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-1">
                  <div className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider">Orçamento Selecionado</div>
                  <div className="text-xs font-semibold text-gray-900">{selectedQuote.contact_name} ({selectedQuote.contact_company || 'Pessoa Física'})</div>
                  <div className="text-[10px] text-gray-500">{selectedQuote.project_type} · Plano Recomendado: <strong>Nextia {selectedQuote.recommended_plan}</strong></div>
                </div>

                {/* Profile selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Associar ao Perfil do Cliente <span className="text-red-500">*</span>
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
                    ⚠️ O cliente já deve ter se registrado pelo menos uma vez no site (`/cadastro`) para constar nesta lista.
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
                        placeholder="Ex: Restaurante"
                        value={form.segment}
                        onChange={e => setForm({ ...form, segment: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Template do Catálogo
                      </label>
                      <select
                        value={form.template}
                        onChange={e => setForm({ ...form, template: e.target.value })}
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
                  <Button type="button" variant="outline" size="sm" onClick={() => setApproveModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" loading={submitting}>
                    ✓ Criar & Ativar Projeto
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
