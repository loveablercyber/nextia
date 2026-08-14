import { useEffect, useState } from 'react';
import { Layers, Search, RefreshCw, CheckCircle2, Globe } from 'lucide-react';
import { requestJson } from '../../lib/appData';

interface AdminEngagement {
  id: string;
  public_code: string;
  customer_name: string;
  customer_email: string;
  service_slug: string;
  service_name_snapshot: string;
  workflow_key: string;
  status: string;
  fqdn?: string;
  domain_mode?: string;
  registration_fee_cents?: number;
  activation_amount_cents: number;
  created_at: string;
}

export default function AdminEngagementsPage() {
  const [engagements, setEngagements] = useState<AdminEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await requestJson<{ engagements: AdminEngagement[] }>('/api/admin/app/engagements');
      setEngagements(res.engagements || []);
    } catch (err) {
      console.error('Falha ao carregar engajamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = engagements.filter((e) =>
    e.public_code.toLowerCase().includes(search.toLowerCase()) ||
    e.service_name_snapshot.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Central de Serviços Contratados</h1>
          <p className="text-slate-500 text-xs mt-1">Gestão unificada de engajamentos canônicos e contratos ativos.</p>
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
          placeholder="Buscar por código (ENG-...), cliente, serviço ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Carregando serviços...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Nenhum serviço contratado encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Código / Serviço</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Workflow</th>
                  <th className="p-4">Domínio / Taxa</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{e.service_name_snapshot}</div>
                      <div className="font-mono text-[10px] text-[#5B4FE9]">{e.public_code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{e.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{e.customer_email}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono text-[10px]">
                        {e.workflow_key}
                      </span>
                    </td>
                    <td className="p-4">
                      {e.fqdn ? (
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-[#5B4FE9]" /> {e.fqdn}
                          </div>
                          <span className="text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full font-bold">
                            {e.domain_mode === 'register' ? 'Registro (R$ 50,00)' : 'Apontamento (Grátis)'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          e.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[10px]">
                      {new Date(e.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
