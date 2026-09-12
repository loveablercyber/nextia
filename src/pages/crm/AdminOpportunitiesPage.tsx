import { useState, useEffect, useCallback } from 'react';
import { Plus, User } from 'lucide-react';

interface Opportunity {
  id: string;
  public_code: string;
  title: string;
  lead_name: string;
  lead_email: string;
  lead_company: string;
  stage_name: string;
  stage_slug: string;
  stage_color: string;
  pipeline_name: string;
  estimated_value: number;
  status: string;
  assigned_name: string;
  expected_close_date: string;
  created_at: string;
}

interface Stage {
  id: string;
  name: string;
  slug: string;
  color: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
}

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const [oppRes, stagesRes] = await Promise.all([
        fetch('/api/admin/crm/opportunities'),
        fetch('/api/admin/crm/stages')
      ]);
      if (!oppRes.ok || !stagesRes.ok) throw new Error('Erro ao carregar dados');
      const oppData = await oppRes.json();
      const stagesData = await stagesRes.json();
      setOpportunities(oppData.opportunities);
      setStages(stagesData.stages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar oportunidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // A consulta sincroniza o kanban com o backend do CRM.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleMoveStage = async (oppId: string, newStageId: string) => {
    try {
      const res = await fetch('/api/admin/crm/opportunities/move-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: oppId, newStageId })
      });
      if (!res.ok) throw new Error('Erro ao mover oportunidade');
      fetchData();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao mover oportunidade.'));
    }
  };

  if (loading) return <div className="text-white text-center py-12">Carregando oportunidades...</div>;
  if (error) return <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Oportunidades</h2>
          <p className="text-gray-400 mt-1">{opportunities.length} oportunidades no pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            >
              Lista
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Oportunidade
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.filter(s => !s.is_lost).map((stage) => {
            const stageOpps = opportunities.filter(opp => opp.stage_slug === stage.slug);
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-[#1a2332] rounded-2xl border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <h3 className="text-white font-semibold">{stage.name}</h3>
                    </div>
                    <span className="text-sm text-gray-400">{stageOpps.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageOpps.map((opp) => (
                      <div key={opp.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-medium text-sm">{opp.title}</h4>
                          <span className="text-xs text-gray-500">{opp.public_code}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">{opp.lead_name}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-indigo-400 font-semibold">{formatCurrency(Number(opp.estimated_value))}</span>
                          {opp.expected_close_date && (
                            <span className="text-gray-500">{new Date(opp.expected_close_date).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                        {opp.assigned_name && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {opp.assigned_name}
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          {stages.filter(s => s.slug !== stage.slug && !s.is_lost && !s.is_won).slice(0, 3).map((nextStage) => (
                            <button
                              key={nextStage.id}
                              onClick={() => handleMoveStage(opp.id, nextStage.id)}
                              className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors"
                              title={`Mover para ${nextStage.name}`}
                            >
                              {nextStage.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1a2332] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Oportunidade</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Lead</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Estágio</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Valor</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Responsável</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Previsão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{opp.title}</div>
                      <div className="text-xs text-gray-400">{opp.public_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{opp.lead_name}</div>
                      <div className="text-xs text-gray-500">{opp.lead_company || opp.lead_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: opp.stage_color }}>
                        {opp.stage_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-400 font-semibold">{formatCurrency(Number(opp.estimated_value))}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{opp.assigned_name || 'Não atribuído'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && <CreateOpportunityModal onClose={() => setShowCreateModal(false)} onCreated={fetchData} stages={stages} />}
    </div>
  );
}

function CreateOpportunityModal({ onClose, onCreated, stages }: { onClose: () => void; onCreated: () => void; stages: Stage[] }) {
  const [form, setForm] = useState({ leadId: '', title: '', expectedValue: '', expectedCloseDate: '', stageId: stages[0]?.id || '' });
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Array<{ id: string; public_code: string; name: string }>>([]);

  useEffect(() => {
    fetch('/api/admin/crm/leads?limit=100', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Falha ao carregar leads.')))
      .then((data) => setLeads(Array.isArray(data.leads) ? data.leads : []))
      .catch(() => setLeads([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/opportunities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, expectedValue: Number(form.expectedValue) })
      });
      if (!res.ok) throw new Error('Erro ao criar oportunidade');
      onCreated();
      onClose();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao criar oportunidade.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2332] rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Nova Oportunidade</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Lead *</label>
            <select
              required
              value={form.leadId}
              onChange={(e) => setForm({ ...form, leadId: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            >
              <option value="">Selecione um lead</option>
              {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.public_code} · {lead.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Título *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Valor Estimado</label>
            <input
              type="number"
              step="0.01"
              value={form.expectedValue}
              onChange={(e) => setForm({ ...form, expectedValue: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Estágio Inicial</label>
            <select
              value={form.stageId}
              onChange={(e) => setForm({ ...form, stageId: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            >
              {stages.filter(s => !s.is_won && !s.is_lost).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Previsão de Fechamento</label>
            <input
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Oportunidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
