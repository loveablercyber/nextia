import { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ReferralStatus } from '../../types/partner';

export default function PartnerReferralsPage() {
  const { state } = usePartner();
  const { referrals } = state;
  const [filter, setFilter] = useState<ReferralStatus | 'todos'>('todos');
  const [search, setSearch] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesFilter = filter === 'todos' || ref.status === filter;
    const matchesSearch = ref.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          ref.clientCompany.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'ativo':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><CheckCircle size={14} /> Ativo</span>;
      case 'pendente':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"><Clock size={14} /> Pendente</span>;
      case 'cancelado':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20"><XCircle size={14} /> Cancelado</span>;
      case 'inadimplente':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400/10 text-orange-400 border border-orange-400/20"><AlertCircle size={14} /> Inadimplente</span>;
    }
  };

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'ativo').length;
  const totalMonthlyCommission = referrals
    .filter(r => r.status === 'ativo')
    .reduce((sum, r) => sum + r.commissionGenerated, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Minhas Indicações</h2>
        <p className="text-gray-400">Acompanhe o status e os ganhos dos clientes que você indicou.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Indicações</p>
          <h3 className="text-3xl font-bold text-white">{totalReferrals}</h3>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Clientes Ativos</p>
          <h3 className="text-3xl font-bold text-emerald-400">{activeReferrals}</h3>
        </div>
        <div className="bg-[#111118] border border-[#D4A853]/30 rounded-2xl p-6">
          <p className="text-[#D4A853]/80 text-sm font-medium mb-1">Comissão Mensal Total</p>
          <h3 className="text-3xl font-bold text-[#D4A853]">{formatCurrency(totalMonthlyCommission)}</h3>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#111118] p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap gap-2">
          {(['todos', 'ativo', 'pendente', 'cancelado', 'inadimplente'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar indicação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-[#D4A853]/50 transition-all"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#111118] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-300 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Nome da Empresa / Cliente</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Data Cadastro</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valor Mensalidade</th>
                <th className="px-6 py-4">Comissão Gerada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReferrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{ref.clientCompany}</p>
                    <p className="text-xs">{ref.clientName}</p>
                  </td>
                  <td className="px-6 py-4">{ref.plan}</td>
                  <td className="px-6 py-4">{formatDate(ref.startDate)}</td>
                  <td className="px-6 py-4">{getStatusBadge(ref.status)}</td>
                  <td className="px-6 py-4">{formatCurrency(ref.monthlyFee)}</td>
                  <td className="px-6 py-4 font-medium text-[#D4A853]">{formatCurrency(ref.commissionGenerated)}</td>
                </tr>
              ))}
              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">Nenhuma indicação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredReferrals.map((ref) => (
          <div key={ref.id} className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white text-lg">{ref.clientCompany}</p>
                <p className="text-gray-400 text-sm">{ref.clientName}</p>
              </div>
              {getStatusBadge(ref.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Plano</p>
                <p className="text-gray-300">{ref.plan}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Data</p>
                <p className="text-gray-300">{formatDate(ref.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Mensalidade</p>
                <p className="text-gray-300">{formatCurrency(ref.monthlyFee)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Comissão</p>
                <p className="text-[#D4A853] font-bold">{formatCurrency(ref.commissionGenerated)}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredReferrals.length === 0 && (
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 text-center text-gray-400">
            Nenhuma indicação encontrada.
          </div>
        )}
      </div>
    </div>
  );
};
