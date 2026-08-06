import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Activity, TrendingUp, Search, Filter, 
  CheckCircle2, XCircle, Eye, AlertCircle, X
} from 'lucide-react';
import type { Partner } from '../../types/partner';
import { PARTNER_LEVELS } from '../../types/partner';

export default function AdminPartnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
    const timer = window.setTimeout(() => void fetchPartners(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: 'ativo' | 'pendente' | 'suspenso' | 'recusado',
    reason = '',
  ) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/update-partner', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, reason })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível atualizar a conta.');
      await fetchPartners();
      setShowDetails(false);
      setSelectedPartner(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Erro inesperado ao atualizar a conta.');
    } finally {
      setUpdatingId(null);
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
      case 'recusado': return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Recusado</span>;
      default: return null;
    }
  };

  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.status === 'ativo').length;
  const totalWithdrawalsPaid = partners.reduce((sum, p) => sum + Number(p.paidWithdrawals || 0), 0);
  const totalCommission = partners.reduce((sum, p) => sum + Number(p.totalCommission), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
          <p className="text-sm text-gray-500">Gerencie o programa de afiliados e parceiros.</p>
        </div>
      </div>

      {actionError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {actionError}
        </div>
      )}

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
          <h3 className="text-2xl font-bold text-gray-900">R$ {totalWithdrawalsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
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
              <option value="recusado">Recusados</option>
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
                              disabled={updatingId === partner.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                              title="Aprovar">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {partner.status === 'pendente' && (
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setRejectionReason('');
                                setShowDetails(true);
                              }}
                              disabled={updatingId === partner.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Analisar recusa">
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          {partner.status === 'ativo' && (
                            <button 
                              onClick={() => handleUpdateStatus(partner.id, 'suspenso')}
                              disabled={updatingId === partner.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Suspender">
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          {partner.status === 'suspenso' && (
                            <button 
                              onClick={() => handleUpdateStatus(partner.id, 'ativo')}
                              disabled={updatingId === partner.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                              title="Reativar">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedPartner(partner);
                              setRejectionReason('');
                              setShowDetails(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Ver Detalhes">
                            <Eye className="w-5 h-5" />
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

      {showDetails && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Detalhes do Parceiro</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nome</p>
                  <p className="text-white font-medium">{selectedPartner.name || 'Sem nome'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-white font-medium">{selectedPartner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">WhatsApp</p>
                  <p className="text-white font-medium">{selectedPartner.whatsapp || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CPF/CNPJ</p>
                  <p className="text-white font-medium">{selectedPartner.cpfCnpj || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chave PIX</p>
                  <p className="text-white font-medium">{selectedPartner.pixKey || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Código de Indicação</p>
                  <p className="text-white font-medium">{selectedPartner.referralCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nível</p>
                  <div className="flex items-center gap-2">
                    <span style={{ color: (PARTNER_LEVELS[selectedPartner.level] || PARTNER_LEVELS.bronze).color }} className="font-medium flex items-center gap-1">
                      {(PARTNER_LEVELS[selectedPartner.level] || PARTNER_LEVELS.bronze).icon} {(PARTNER_LEVELS[selectedPartner.level] || PARTNER_LEVELS.bronze).label}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="capitalize text-white font-medium">{selectedPartner.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data de Cadastro</p>
                  <p className="text-white font-medium">{new Date(selectedPartner.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedPartner.decisionReason && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Motivo da decisão</p>
                    <p className="text-white font-medium whitespace-pre-wrap">{selectedPartner.decisionReason}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Desempenho</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Total Indicações</p>
                    <p className="text-2xl font-bold text-white">{selectedPartner.totalReferrals || 0}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Indicações Ativas</p>
                    <p className="text-2xl font-bold text-white">{selectedPartner.activeReferrals || 0}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Comissão Total</p>
                    <p className="text-2xl font-bold text-[#D4A853]">
                      R$ {Number(selectedPartner.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Indicações vinculadas</h3>
                {selectedPartner.referrals && selectedPartner.referrals.length > 0 ? (
                  <div className="overflow-x-auto border border-white/10">
                    <table className="w-full min-w-[540px] text-left text-xs">
                      <thead className="bg-white/5 text-gray-400 uppercase">
                        <tr><th className="px-3 py-2">Cliente</th><th className="px-3 py-2">Plano</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Comissão</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedPartner.referrals.map((referral) => (
                          <tr key={referral.id}>
                            <td className="px-3 py-2"><div className="text-white">{referral.clientName}</div><div className="text-gray-500">{referral.clientCompany || 'Sem empresa'}</div></td>
                            <td className="px-3 py-2 text-gray-300">{referral.plan || '-'}</td>
                            <td className="px-3 py-2 capitalize text-gray-300">{referral.status}</td>
                            <td className="px-3 py-2 text-right text-[#D4A853]">R$ {Number(referral.commissionGenerated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-sm text-gray-500">Nenhuma indicação vinculada.</p>}
              </div>
              {selectedPartner.status === 'pendente' && (
                <div className="border-t border-white/10 pt-6">
                  <label htmlFor="partner-rejection-reason" className="block text-sm text-gray-300 mb-2">
                    Motivo da recusa
                  </label>
                  <textarea
                    id="partner-rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Informe o motivo para recusar esta conta."
                    className="w-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
              {selectedPartner.status === 'pendente' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedPartner.id, 'ativo');
                  }}
                  disabled={updatingId === selectedPartner.id}
                  className="px-4 py-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Aprovar
                </button>
              )}
              {selectedPartner.status === 'pendente' && (
                <button
                  onClick={() => handleUpdateStatus(selectedPartner.id, 'recusado', rejectionReason)}
                  disabled={updatingId === selectedPartner.id || rejectionReason.trim().length < 3}
                  className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Recusar
                </button>
              )}
              {selectedPartner.status === 'ativo' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedPartner.id, 'suspenso');
                  }}
                  disabled={updatingId === selectedPartner.id}
                  className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Suspender
                </button>
              )}
              {selectedPartner.status === 'suspenso' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedPartner.id, 'ativo');
                  }}
                  disabled={updatingId === selectedPartner.id}
                  className="px-4 py-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Reativar
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
