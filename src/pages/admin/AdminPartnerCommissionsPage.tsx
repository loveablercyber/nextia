import { useState } from 'react';
import { 
  DollarSign, CreditCard, Clock, CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import type { Commission, WithdrawalRequest } from '../../types/partner';

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'com-001', partnerId: 'rk-001', referralId: 'ref-001', clientName: 'Ana Costa',
    plan: 'Premium', monthlyFee: 299, commissionValue: 74.75, status: 'confirmado',
    period: '2026-07', createdAt: '2026-07-15T10:05:00Z',
  },
  {
    id: 'com-002', partnerId: 'partner-001', referralId: 'ref-002', clientName: 'Carlos Silva',
    plan: 'Basic', monthlyFee: 99, commissionValue: 24.75, status: 'pago',
    period: '2026-06', createdAt: '2026-06-20T09:05:00Z',
  },
  {
    id: 'com-003', partnerId: 'rk-002', referralId: 'ref-003', clientName: 'Mariana Oliveira',
    plan: 'Pro', monthlyFee: 199, commissionValue: 49.75, status: 'pendente',
    period: '2026-07', createdAt: '2026-07-28T10:05:00Z',
  },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wd-001', partnerId: 'rk-001', amount: 1500, pixKey: 'thiago@pix',
    status: 'pendente', requestedAt: '2026-07-28T14:30:00Z', processedAt: null
  },
  {
    id: 'wd-002', partnerId: 'partner-001', amount: 450, pixKey: 'lucas@example.com',
    status: 'pago', requestedAt: '2026-07-10T09:15:00Z', processedAt: '2026-07-11T10:00:00Z'
  },
  {
    id: 'wd-003', partnerId: 'rk-003', amount: 800, pixKey: 'marcos@pix',
    status: 'rejeitado', requestedAt: '2026-07-20T11:20:00Z', processedAt: '2026-07-21T09:00:00Z'
  }
];

export default function AdminPartnerCommissionsPage() {
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions');
  const [searchTerm, setSearchTerm] = useState('');

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
          <h3 className="text-2xl font-bold text-gray-900">R$ 145.200</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Comissões Pagas</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ 112.500</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Comissões Pendentes</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ 32.700</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Saques Solicitados</p>
          <h3 className="text-2xl font-bold text-gray-900">R$ 4.500</h3>
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
              <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">2</span>
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
          {activeTab === 'commissions' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Parceiro (ID)</th>
                  <th className="px-6 py-4 font-medium">Cliente / Plano</th>
                  <th className="px-6 py-4 font-medium">Valor Mensal</th>
                  <th className="px-6 py-4 font-medium">Comissão</th>
                  <th className="px-6 py-4 font-medium">Período</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {MOCK_COMMISSIONS.map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{comm.partnerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{comm.clientName}</p>
                      <p className="text-sm text-gray-500">{comm.plan}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      R$ {comm.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        R$ {comm.commissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{comm.period}</td>
                    <td className="px-6 py-4">{getStatusBadge(comm.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Parceiro (ID)</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Chave PIX</th>
                  <th className="px-6 py-4 font-medium">Data Solicitação</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {MOCK_WITHDRAWALS.map((wd) => (
                  <tr key={wd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{wd.partnerId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        R$ {wd.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Aprovar Pagamento">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rejeitar">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Processado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
