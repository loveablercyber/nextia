import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';

interface Lead {
  id: string;
  public_code: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  company_name: string;
  status: string;
  source: string;
  assigned_user_id: string;
  assigned_name: string;
  score: number;
  opportunity_count: number;
  pending_activities: number;
  created_at: string;
}

export default function AdminLeadsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const page = 1;
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchLeads = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      const res = await fetch(`/api/admin/crm/leads?${params}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const result = await res.json();
      setLeads(result.leads);
      setTotal(result.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar leads.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    // A consulta sincroniza a lista com os filtros do CRM.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja arquivar este lead?')) return;
    try {
      const res = await fetch('/api/admin/crm/leads/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId })
      });
      if (!res.ok) throw new Error('Erro ao deletar');
      await fetchLeads();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao arquivar lead.'));
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-indigo-600',
    contact: 'bg-purple-600',
    qualified: 'bg-violet-600',
    won: 'bg-emerald-600',
    lost: 'bg-red-600',
  };

  if (id) {
    return <LeadDetailPage leadId={id} onBack={() => navigate('/admin/crm/leads')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Leads</h2>
          <p className="text-gray-400 mt-1">{total} leads encontrados</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="all">Todos os status</option>
          <option value="new">Novos</option>
          <option value="contact">Em Contato</option>
          <option value="qualified">Qualificados</option>
          <option value="won">Ganhos</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      {loading ? (
        <div className="text-white text-center py-12">Carregando leads...</div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300">{error}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhum lead encontrado</div>
      ) : (
        <div className="bg-[#1a2332] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Lead</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Contato</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Origem</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Responsável</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{lead.name}</div>
                          <div className="text-xs text-gray-400">{lead.public_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{lead.email}</div>
                      <div className="text-xs text-gray-500">{lead.phone || lead.whatsapp || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-600'} text-white`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{lead.source || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{lead.assigned_name || 'Não atribuído'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/crm/leads/${lead.id}`)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Arquivar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && <CreateLeadModal onClose={() => setShowCreateModal(false)} onCreated={fetchLeads} />}
    </div>
  );
}

interface LeadDetail extends Lead {
  metadata?: Record<string, unknown>;
}

interface LeadOpportunity {
  id: string;
  title: string;
  status: string;
  estimated_value_cents: number;
}

interface LeadActivity {
  id: string;
  title: string;
  type: string;
  status: string;
}

function LeadDetailPage({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [opportunities, setOpportunities] = useState<LeadOpportunity[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/admin/crm/leads/${leadId}`);
        if (!res.ok) throw new Error('Erro ao carregar');
        const data = await res.json();
        setLead(data.lead);
        setOpportunities(data.opportunities);
        setActivities(data.activities);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void fetchDetail();
  }, [leadId]);

  if (loading) return <div className="text-white text-center py-12">Carregando...</div>;
  if (!lead) return <div className="text-white text-center py-12">Lead não encontrado</div>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 text-sm">&larr; Voltar para leads</button>
      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">{lead.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Email</div>
            <div className="text-white">{lead.email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Telefone</div>
            <div className="text-white">{lead.phone || lead.whatsapp || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Empresa</div>
            <div className="text-white">{lead.company_name || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="text-white">{lead.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Origem</div>
            <div className="text-white">{lead.source || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Responsável</div>
            <div className="text-white">{lead.assigned_name || 'Não atribuído'}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Oportunidades ({opportunities.length})</h3>
        {opportunities.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma oportunidade criada</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-gray-900 rounded-lg p-3">
                <div className="text-white font-medium">{opp.title}</div>
                <div className="text-sm text-gray-400">{opp.status} - {(Number(opp.estimated_value_cents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Atividades ({activities.length})</h3>
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-2">
            {activities.map((act) => (
              <div key={act.id} className="bg-gray-900 rounded-lg p-3">
                <div className="text-white font-medium">{act.title}</div>
                <div className="text-sm text-gray-400">{act.type} - {act.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', companyName: '', source: 'manual' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Erro ao criar lead');
      onCreated();
      onClose();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao criar lead.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2332] rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Novo Lead</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Nome *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">WhatsApp</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Empresa</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
