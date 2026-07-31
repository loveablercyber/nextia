import { usePartner } from '../../context/PartnerContext';
import { Clock, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import type { CommissionStatus } from '../../types/partner';

export default function PartnerCommissionsPage() {
  const { state } = usePartner();
  const { commissions, profile } = state;

  if (!profile) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatMonth = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  const getStatusBadge = (status: CommissionStatus) => {
    switch (status) {
      case 'pendente':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"><Clock size={14} /> Pendente</span>;
      case 'confirmado':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20"><CheckCircle size={14} /> Confirmado</span>;
      case 'pago':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><DollarSign size={14} /> Pago</span>;
    }
  };

  const currentMonthCommission = commissions
    .filter(c => c.period === '2026-07')
    .reduce((sum, c) => sum + c.commissionValue, 0);
    
  const pendingCommission = commissions
    .filter(c => c.status === 'pendente' || c.status === 'confirmado')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Histórico de Comissões</h2>
        <p className="text-gray-400">Acompanhe detalhadamente todas as comissões geradas por suas indicações.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Comissão do Mês (Julho)</p>
          <h3 className="text-3xl font-bold text-emerald-400">{formatCurrency(currentMonthCommission)}</h3>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Comissão Pendente</p>
          <h3 className="text-3xl font-bold text-yellow-400">{formatCurrency(pendingCommission)}</h3>
        </div>
        <div className="bg-[#111118] border border-[#D4A853]/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/5 to-transparent pointer-events-none" />
          <p className="text-[#D4A853]/80 text-sm font-medium mb-1 relative">Total Acumulado</p>
          <h3 className="text-3xl font-bold text-[#D4A853] relative">{formatCurrency(profile.totalCommission)}</h3>
        </div>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Lançamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-300 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4">Cliente / Plano</th>
                <th className="px-6 py-4">Valor Mensalidade</th>
                <th className="px-6 py-4">Comissão</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {commissions.map((com) => (
                <tr key={com.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">{formatDate(com.createdAt)}</td>
                  <td className="px-6 py-4 capitalize flex items-center gap-2"><Calendar size={14} className="text-gray-500" /> {formatMonth(com.period)}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{com.clientName}</p>
                    <p className="text-xs">{com.plan}</p>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(com.monthlyFee)}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#D4A853]">{formatCurrency(com.commissionValue)}</p>
                    <p className="text-xs text-gray-500">25% de {formatCurrency(com.monthlyFee)}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(com.status)}</td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">Nenhuma comissão registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
