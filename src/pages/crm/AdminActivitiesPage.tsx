import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Calendar, User, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

interface Activity {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_code: string;
  opportunity_title: string;
  type: string;
  title: string;
  description: string;
  status: string;
  scheduled_at: string;
  completed_at: string;
  assigned_name: string;
  created_at: string;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('pending');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchActivities = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'pending') params.append('status', 'pending');
      else if (filter === 'completed') params.append('status', 'completed');
      else if (filter === 'overdue') params.append('overdue', 'true');
      const res = await fetch(`/api/admin/crm/activities?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar');
      const result = await res.json();
      setActivities(result.activities);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar atividades.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // A consulta sincroniza esta tela com o CRM quando o filtro muda.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchActivities();
  }, [fetchActivities]);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/crm/activities/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Erro ao completar');
      fetchActivities();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao concluir atividade.'));
    }
  };

  const isOverdue = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date();
  };

  const typeIcons: Record<string, React.ReactNode> = {
    call: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    task: <Check className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />,
    whatsapp: <MessageSquare className="w-4 h-4" />,
  };

  if (loading) return <div className="text-white text-center py-12">Carregando atividades...</div>;
  if (error) return <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Atividades e Follow-ups</h2>
          <p className="text-gray-400 mt-1">{activities.length} atividades</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Atividade
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['pending', 'overdue', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {f === 'pending' ? 'Pendentes' : f === 'overdue' ? 'Atrasadas' : f === 'completed' ? 'Concluídas' : 'Todas'}
          </button>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhuma atividade encontrada</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const overdue = activity.status === 'pending' && activity.scheduled_at && isOverdue(activity.scheduled_at);
            return (
              <div key={activity.id} className={`bg-[#1a2332] rounded-2xl p-4 border ${overdue ? 'border-red-800' : 'border-gray-800'} hover:border-gray-700 transition-colors`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${overdue ? 'bg-red-600/20 text-red-400' : activity.status === 'completed' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'}`}>
                      {typeIcons[activity.type] || <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${activity.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>{activity.title}</h3>
                        {overdue && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Atrasada</span>}
                      </div>
                      {activity.description && <p className="text-sm text-gray-400 mb-2">{activity.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.lead_name}
                        </span>
                        {activity.opportunity_title && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {activity.opportunity_title}
                          </span>
                        )}
                        {activity.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.scheduled_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                        {activity.assigned_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.assigned_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {activity.status === 'pending' && (
                    <button
                      onClick={() => handleComplete(activity.id)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && <CreateActivityModal onClose={() => setShowCreateModal(false)} onCreated={fetchActivities} />}
    </div>
  );
}

function CreateActivityModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ leadId: '', type: 'task', title: '', description: '', scheduledAt: '' });
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
      const res = await fetch('/api/admin/crm/activities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledAt: form.scheduledAt || null })
      });
      if (!res.ok) throw new Error('Erro ao criar');
      onCreated();
      onClose();
    } catch (caught) {
      alert('Erro: ' + (caught instanceof Error ? caught.message : 'Falha ao criar atividade.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2332] rounded-2xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Nova Atividade</h3>
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
            <label className="text-sm text-gray-400">Tipo *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            >
              <option value="task">Tarefa</option>
              <option value="follow_up">Follow-up</option>
              <option value="call">Ligação</option>
              <option value="email">Email</option>
              <option value="meeting">Reunião</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="note">Nota</option>
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
            <label className="text-sm text-gray-400">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Agendar para</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
