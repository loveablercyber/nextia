import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Activity, TrendingUp, Search, Filter, 
  MoreVertical, CheckCircle2, XCircle, Eye, AlertCircle
} from 'lucide-react';
import type { Partner } from '../../types/partner';
import { PARTNER_LEVELS } from '../../types/partner';

export default function AdminPartnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/admin/partners', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'ativo' | 'pendente' | 'suspenso') => {
    try {
      const res = await fetch('/api/admin/update-partner', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchPartners(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = (partner.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (partner.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ativo</span>;
      case 'pendente': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pendente</span>;
      case 'suspenso': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Suspenso</span>;
      default: return null;
    }
  };

  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.status === 'ativo').length;
  const totalCommissionsPaid = partners.reduce((sum, p) => sum + (p.totalCommission - p.availableBalance - p.pendingBalance), 0); // Estimate or get real total
  const totalCommission = partners.reduce((sum, p) => sum + Number(p.totalCommission), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
          <p className="text-sm text-gray-500">Gerencie o programa de afiliados e parceiros.</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Total de Parceiros</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalPartners}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Parceiros Ativos</p>
          <h3 className="text-2xl font-bold text-gray-900">{activePartners}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Comissões</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Saques Realizados</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {totalCommissionsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Pendentes</option>
              <option value="suspenso">Suspensos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando parceiros...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Parceiro</th>
                  <th className="px-6 py-4 font-medium">Nível</th>
                  <th className="px-6 py-4 font-medium text-center">Clientes Ativos</th>
                  <th className="px-6 py-4 font-medium">Comissão Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPartners.map((partner) => {
                  const levelInfo = PARTNER_LEVELS[partner.level] || PARTNER_LEVELS.bronze;
                  return (
                    <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                            {(partner.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{partner.name || 'Sem nome'}</p>
                            <p className="text-sm text-gray-500">{partner.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-medium text-sm" style={{ color: levelInfo.color }}>
                          {levelInfo.icon} {levelInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {partner.activeReferrals}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          R$ {Number(partner.totalCommission).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(partner.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {partner.status === 'pendente' && (
                            <button 
                              onClick={() => handleUpdateStatus(partner.id, 'ativo')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                              title="Aprovar">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {partner.status === 'ativo' && (
                            <button 
                              onClick={() => handleUpdateStatus(partner.id, 'suspenso')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Suspender">
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          {partner.status === 'suspenso' && (
                            <button 
                              onClick={() => handleUpdateStatus(partner.id, 'ativo')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                              title="Reativar">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Mais Opções">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPartners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum parceiro encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
