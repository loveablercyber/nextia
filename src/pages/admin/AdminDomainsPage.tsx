import { useEffect, useState } from 'react';
import { Globe, Search, RefreshCw, Edit3 } from 'lucide-react';
import { requestJson } from '../../lib/appData';

interface AdminDomain {
  id: string;
  engagement_id: string;
  public_code: string;
  service_name_snapshot: string;
  customer_name: string;
  customer_email: string;
  fqdn: string;
  mode: 'register' | 'connect';
  registration_fee_cents: number;
  status: 'pending' | 'verified' | 'registered' | 'error';
  dns_verified_at?: string;
  created_at: string;
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingDomain, setEditingDomain] = useState<AdminDomain | null>(null);
  const [editStatus, setEditStatus] = useState<string>('verified');
  const [editFqdn, setEditFqdn] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await requestJson<{ domains: AdminDomain[] }>('/api/admin/app/domains');
      setDomains(res.domains || []);
    } catch (err) {
      console.error('Falha ao carregar domínios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDomain = async () => {
    if (!editingDomain) return;
    try {
      await requestJson('/api/admin/app/domains', {
        method: 'PATCH',
        body: JSON.stringify({
          domainId: editingDomain.id,
          status: editStatus,
          fqdn: editFqdn,
        }),
      });
      setEditingDomain(null);
      await loadData();
    } catch (err) {
      alert('Falha ao atualizar domínio.');
    }
  };

  const filtered = domains.filter((d) =>
    d.fqdn.toLowerCase().includes(search.toLowerCase()) ||
    d.public_code.toLowerCase().includes(search.toLowerCase()) ||
    d.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Gestor Unificado de Domínios</h1>
          <p className="text-slate-500 text-xs mt-1">Observabilidade e validação de registros oficiais e apontamentos DNS.</p>
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
          placeholder="Buscar por FQDN (seusite.com.br), código de serviço ou cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Carregando domínios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Nenhum domínio cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Domínio (FQDN)</th>
                  <th className="p-4">Modalidade</th>
                  <th className="p-4">Serviço / Cliente</th>
                  <th className="p-4">Taxa Registro</th>
                  <th className="p-4">Status DNS</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#5B4FE9]" /> {d.fqdn}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        d.mode === 'register' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.mode === 'register' ? 'Registro Oficial' : 'Apontamento DNS'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{d.customer_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{d.public_code} — {d.service_name_snapshot}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      R$ {(d.registration_fee_cents / 100).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        d.status === 'verified' || d.status === 'registered' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingDomain(d);
                          setEditStatus(d.status);
                          setEditFqdn(d.fqdn);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition"
                      >
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Editar Status do Domínio</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">FQDN (Domínio):</label>
                <input
                  type="text"
                  value={editFqdn}
                  onChange={(e) => setEditFqdn(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                >
                  <option value="pending">Pendente (Aguardando Registro/Apontamento)</option>
                  <option value="verified">Verificado (DNS Validados)</option>
                  <option value="registered">Registrado (Registro.br Confirmado)</option>
                  <option value="error">Erro (Propagação ou Conflito)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingDomain(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDomain}
                className="px-4 py-2 rounded-xl bg-[#5B4FE9] text-white font-bold text-xs hover:bg-[#4F46E5]"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
