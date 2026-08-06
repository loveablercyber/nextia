import { useState } from 'react';
import {
  Plus, CheckCircle2, AlertTriangle, Send, Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Button from '../../components/ui/Button';

export default function AdminPaymentsPage() {
  const { projects, loading, createInvoice, refreshData } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    projectId: '',
    description: '',
    amount: '',
    type: 'mensalidade' as 'ativacao' | 'mensalidade',
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Flatten all invoices/payments
  const allPayments = projects.flatMap(p => p.payments.map(y => ({ ...y, project: p })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.description || !form.amount) return;

    setSubmitting(true);
    await createInvoice(form.projectId, form.description, Number(form.amount), form.type);
    setForm({ projectId: '', description: '', amount: '', type: 'mensalidade' });
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleDeletePayment = async (paymentId: string, desc: string) => {
    if (!confirm(`Deseja realmente remover a cobrança "${desc}"? Esta ação é irreversível.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/app/payment/delete', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover cobrança.');
      }

      alert('Cobrança removida com sucesso!');
      await refreshData();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Erro inesperado ao remover cobrança.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3" /> Pago
          </span>
        );
      case 'atrasado':
        return (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            <AlertTriangle className="w-3 h-3" /> Atrasado
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats & action */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-950 text-sm mb-1">Painel Financeiro Nextia</h3>
          <p className="text-gray-400 text-xs">
            Visualize cobranças emitidas e envie novas faturas para os clientes.
          </p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Emitir Nova Cobrança
        </Button>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-4">Todas as faturas</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-semibold text-[10px]">
                <th className="pb-3 w-[200px]">Cliente / Projeto</th>
                <th className="pb-3 w-[200px]">Descrição</th>
                <th className="pb-3 w-[100px]">Vencimento</th>
                <th className="pb-3 w-[100px]">Valor</th>
                <th className="pb-3 w-[120px]">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {allPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/20 transition-all">
                  <td className="py-4">
                    <div className="font-bold text-gray-900">{p.project.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Plano: {p.project.plan}</div>
                  </td>
                  <td className="py-4 font-semibold text-gray-800">{p.description}</td>
                  <td className="py-4">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td className="py-4 font-bold text-gray-900">
                    R$ {p.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4">{getStatusBadge(p.status)}</td>
                  <td className="py-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeletePayment(p.id, p.description)}
                      title="Remover cobrança"
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-100 px-2 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Emitter Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm">Emitir Nova Cobrança</h4>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Selecione o Cliente / Projeto
                </label>
                <select
                  required
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                >
                  <option value="">Selecione um projeto...</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 79"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tipo de Cobrança
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as typeof form.type })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="mensalidade">Mensalidade</option>
                    <option value="ativacao">Ativação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Descrição da Fatura
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mensalidade — Julho/2026"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" size="sm" loading={submitting}>
                  <Send className="w-3.5 h-3.5" />
                  Gerar Cobrança
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
