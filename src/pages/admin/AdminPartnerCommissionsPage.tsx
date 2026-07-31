import { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Clock, CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import type { Commission, WithdrawalRequest } from '../../types/partner';

export default function AdminPartnerCommissionsPage() {
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('nextia_session_token='))?.split('=')[1] 
      || localStorage.getItem('nextia_token');
  };

  const fetchCommissions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/partner-commissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/partner-withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchCommissions(), fetchWithdrawals()]).finally(() => setLoading(false));
  }, []);

  const handleUpdateWithdrawal = async (id: string, status: 'pago' | 'rejeitado') => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/update-withdrawal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchWithdrawals(); // Refresh withdrawals
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
      case 'aprovado':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
      case 'confirmado':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'rejeitado':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> {status}</span>;
      default:
        return null;
    }
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commissionValue), 0);
  const paidCommissions = withdrawals.filter(w => w.status === 'pago').reduce((sum, w) => sum + Number(w.amount), 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pendente').reduce((sum, c) => sum + Number(c.commissionValue), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pendente').reduce((sum, w) => sum + Number(w.amount), 0);
  const pendingWithdrawalCount = withdrawals.filter(w => w.status === 'pendente').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comissões de Parceiros</h1>
        <p className="text-sm text-gray-500">Gerencie comissões e solicitações de saque.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Comissões Geradas</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Comissões Pagas</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {paidCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Comissões Pendentes</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {pendingCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Saques Solicitados</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ {pendingWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'commissions'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Histórico de Comissões
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'withdrawals'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Solicitações de Saque
              {pendingWithdrawalCount > 0 && (
                <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{pendingWithdrawalCount}</span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando dados...</div>
          ) : activeTab === 'commissions' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Parceiro</th>
                  <th className="px-6 py-4 font-medium">Cliente / Plano</th>
                  <th className="px-6 py-4 font-medium">Valor Mensal</th>
                  <th className="px-6 py-4 font-medium">Comissão</th>
                  <th className="px-6 py-4 font-medium">Período</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions.filter(c => c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || (c as any).partnerName?.toLowerCase().includes(searchTerm.toLowerCase())).map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{(comm as any).partnerName || comm.partnerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{comm.clientName}</p>
                      <p className="text-sm text-gray-500">{comm.plan}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      R$ {Number(comm.monthlyFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        R$ {Number(comm.commissionValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{comm.period}</td>
                    <td className="px-6 py-4">{getStatusBadge(comm.status)}</td>
                  </tr>
                ))}
                {commissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma comissão encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Parceiro</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Chave PIX</th>
                  <th className="px-6 py-4 font-medium">Data Solicitação</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.filter(w => (w as any).partnerName?.toLowerCase().includes(searchTerm.toLowerCase())).map((wd) => (
                  <tr key={wd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{(wd as any).partnerName || wd.partnerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        R$ {Number(wd.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{wd.pixKey}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(wd.requestedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(wd.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {wd.status === 'pendente' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateWithdrawal(wd.id, 'pago')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Aprovar Pagamento">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateWithdrawal(wd.id, 'rejeitado')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Rejeitar">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Processado</span>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma solicitação de saque encontrada.</td>
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
