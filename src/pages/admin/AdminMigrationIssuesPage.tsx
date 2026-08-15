import { useEffect, useState } from 'react';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { requestJson } from '../../lib/appData';

interface MigrationIssue {
  id: string;
  entity_type: string;
  entity_id: string;
  issue_code: string;
  description: string;
  evidence: any;
  status: 'needs_review' | 'resolved' | 'ignored';
  resolution_notes?: string;
  reviewer_name?: string;
  resolved_at?: string;
  created_at: string;
}

export default function AdminMigrationIssuesPage() {
  const [issues, setIssues] = useState<MigrationIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resolvingIssue, setResolvingIssue] = useState<MigrationIssue | null>(null);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await requestJson<{ issues: MigrationIssue[] }>('/api/admin/app/migration-issues');
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Falha ao carregar ocorrências:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (status: 'resolved' | 'ignored') => {
    if (!resolvingIssue) return;
    try {
      await requestJson('/api/admin/app/migration-issues', {
        method: 'PATCH',
        body: JSON.stringify({
          issueId: resolvingIssue.id,
          status,
          notes,
        }),
      });
      setResolvingIssue(null);
      setNotes('');
      await loadData();
    } catch (err) {
      alert('Falha ao atualizar ocorrência.');
    }
  };

  const filtered = issues.filter((i) =>
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.issue_code.toLowerCase().includes(search.toLowerCase()) ||
    i.entity_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Fila de Integridade de Dados</h1>
          <p className="text-slate-500 text-xs mt-1">Revisão e resolução técnica de divergências de migração e backfill.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código de problema, entidade ou descrição..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Carregando fila de integridade...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Nenhuma divergência registrada. Banco de dados integro!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Código / Entidade</th>
                  <th className="p-4">Descrição da Divergência</th>
                  <th className="p-4">Evidência</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      <div className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {i.issue_code}
                      </div>
                      <div className="text-[10px] text-slate-400">{i.entity_type} ({i.entity_id.substring(0, 8)}...)</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{i.description}</div>
                      {i.resolution_notes && (
                        <div className="text-[10px] text-green-700 bg-green-50 p-1.5 rounded-lg mt-1">
                          Nota: {i.resolution_notes}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {JSON.stringify(i.evidence || {})}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        i.status === 'needs_review' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {i.status === 'needs_review' ? (
                        <button
                          onClick={() => {
                            setResolvingIssue(i);
                            setNotes('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600 transition"
                        >
                          Resolver
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Resolvido por {i.reviewer_name || 'Admin'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Resolver Ocorrência de Migração</h3>
            <p className="text-slate-500 text-xs">{resolvingIssue.description}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nota da Resolução Técnica:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explique o ajuste realizado no banco de dados ou a justificativa..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs h-24 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingIssue(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleResolve('resolved')}
                className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700"
              >
                Marcar como Resolvido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
