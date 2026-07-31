import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { ArrowUpRight, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import type { WithdrawalStatus } from '../../types/partner';

export default function PartnerFinancialPage() {
  const { state, requestWithdrawal } = usePartner();
  const { profile, withdrawals } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState(profile?.pixKey || '');

  if (!profile) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case 'pendente':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"><Clock size={14} /> Pendente</span>;
      case 'aprovado':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20"><CheckCircle size={14} /> Aprovado</span>;
      case 'pago':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><CheckCircle size={14} /> Pago</span>;
      case 'rejeitado':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20"><XCircle size={14} /> Rejeitado</span>;
    }
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount.replace(/\D/g, '')) / 100;
    if (amount >= 50 && amount <= profile.availableBalance) {
      requestWithdrawal(amount);
      setIsModalOpen(false);
      setWithdrawAmount('');
    } else {
      alert('Valor inválido. O mínimo é R$ 50,00 e o máximo é o seu saldo disponível.');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setWithdrawAmount('');
      return;
    }
    const numberValue = parseInt(value) / 100;
    setWithdrawAmount(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Financeiro</h2>
        <p className="text-gray-400">Gerencie seus ganhos e solicite saques.</p>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#111118] to-[#1a1a24] border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden md:col-span-2 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div>
            <p className="text-emerald-400/80 font-medium mb-2 relative">Saldo Disponível para Saque</p>
            <h3 className="text-5xl font-bold text-emerald-400 relative mb-6">{formatCurrency(profile.availableBalance)}</h3>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={profile.availableBalance < 50}
            className="self-start bg-gradient-to-r from-[#D4A853] to-[#F3D085] hover:from-[#e3b965] hover:to-[#fce2a6] text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,168,83,0.3)]"
          >
            Solicitar Saque <ArrowUpRight size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm font-medium mb-1">Saldo Pendente</p>
            <h3 className="text-2xl font-bold text-yellow-400">{formatCurrency(profile.pendingBalance)}</h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Aguardando compensação</p>
          </div>
          
          <div className="bg-[#111118] border border-[#D4A853]/20 rounded-2xl p-6">
            <p className="text-[#D4A853]/80 text-sm font-medium mb-1">Total Recebido</p>
            <h3 className="text-2xl font-bold text-[#D4A853]">{formatCurrency(profile.totalCommission)}</h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> Desde {new Date(profile.createdAt).getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Comissões Futuras e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#111118] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Histórico de Saques</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-300 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Data Solicitação</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Chave PIX</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Processamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">{formatDate(wd.requestedAt)}</td>
                      <td className="px-6 py-4 font-medium text-white">{formatCurrency(wd.amount)}</td>
                      <td className="px-6 py-4 truncate max-w-[150px]" title={wd.pixKey}>{wd.pixKey}</td>
                      <td className="px-6 py-4">{getStatusBadge(wd.status)}</td>
                      <td className="px-6 py-4">{formatDate(wd.processedAt)}</td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">Nenhum saque solicitado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-[#111118] border border-white/10 rounded-3xl p-8 h-fit">
          <h3 className="text-xl font-bold text-white mb-6">Projeção Mensal</h3>
          <p className="text-gray-400 mb-6 text-sm">Com base nas suas indicações ativas atualmente.</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-300">Clientes Ativos</span>
              <span className="font-bold text-white">{profile.activeReferrals}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-300">Faturamento Gerado</span>
              <span className="font-bold text-white">{formatCurrency(profile.activeReferrals * 199)} {/* Avg */}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20">
              <span className="text-[#D4A853] font-medium">Sua Comissão (25%)</span>
              <span className="font-bold text-[#D4A853] text-lg">{formatCurrency(profile.activeReferrals * 199 * 0.25)}</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm">
            <AlertCircle size={20} className="text-blue-400 shrink-0" />
            <p className="text-blue-400/80">Você recebe comissões recorrentes enquanto o cliente mantiver a assinatura ativa.</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Solicitar Saque</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitWithdrawal} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Chave PIX</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Certifique-se que a chave PIX está correta.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Valor (R$)</label>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-all text-2xl font-bold"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Mínimo: R$ 50,00</p>
                  <p className="text-xs text-emerald-400">Disponível: {formatCurrency(profile.availableBalance)}</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#D4A853] to-[#F3D085] hover:from-[#e3b965] hover:to-[#fce2a6] text-black px-6 py-4 rounded-xl font-bold transition-all"
              >
                Confirmar Saque
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
