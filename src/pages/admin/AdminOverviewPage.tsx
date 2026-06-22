import { Link } from 'react-router-dom';
import {
  Users, FolderKanban, MessageSquare, CreditCard,
  TrendingUp, AlertTriangle, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { requestStatusConfig } from '../../types/project';
import Button from '../../components/ui/Button';

export default function AdminOverviewPage() {
  const { projects, loading } = useAdmin();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Calculate MRR and Stats
  const activeClients = projects.length;
  const inDevelopment = projects.filter(p => p.status === 'em-desenvolvimento').length;
  const inReview = projects.filter(p => p.status === 'em-revisao' || p.status === 'aguardando-aprovacao').length;
  
  // Calculate MRR: sum of monthly fees for active projects
  const mrr = projects.reduce((sum, p) => sum + (p.monthlyFee || 0), 0);

  // Flatten and filter active tickets/requests
  const allTickets = projects.flatMap(p => p.changeRequests.map(r => ({ ...r, project: p })));
  const openTickets = allTickets.filter(t => t.status === 'aberto' || t.status === 'em-andamento');

  // Format monetary value
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Faturamento MRR', val: formatCurrency(mrr), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Clientes Ativos', val: activeClients, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Em Desenvolvimento', val: inDevelopment, icon: FolderKanban, color: 'text-blue-600 bg-blue-50' },
          { label: 'Em Revisão / Feedback', val: inReview, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-400 text-xs block mb-0.5">{stat.label}</span>
              <span className="text-xl font-black text-gray-950">{stat.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Tickets & Recent projects */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Change Requests */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-600" />
                Chamados pendentes ({openTickets.length})
              </h3>
              <Link to="/admin/chamados" className="text-xs text-pink-600 hover:underline font-bold flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {openTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium">Nenhuma solicitação em aberto!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openTickets.slice(0, 4).map((ticket) => {
                  const statusInfo = requestStatusConfig[ticket.status];
                  return (
                    <div
                      key={ticket.id}
                      className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                            {ticket.title}
                          </span>
                          <span className="text-[10px] bg-gray-200/50 px-2 py-0.5 rounded-full text-gray-600 font-semibold truncate max-w-[120px]">
                            {ticket.project.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[300px] sm:max-w-md">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                        <Link to="/admin/chamados">
                          <Button variant="outline" size="sm">Responder</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices Alert */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-600" />
              Resumo Financeiro
            </h3>

            <div className="space-y-4 my-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-400">Total de faturas pagas</span>
                <span className="text-sm font-bold text-green-600">
                  {projects.flatMap(p => p.payments.filter(y => y.status === 'pago')).length}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-400">Faturas pendentes</span>
                <span className="text-sm font-bold text-amber-600">
                  {projects.flatMap(p => p.payments.filter(y => y.status === 'pendente')).length}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-400">Faturas em atraso</span>
                <span className="text-sm font-bold text-red-500">
                  {projects.flatMap(p => p.payments.filter(y => y.status === 'atrasado')).length}
                </span>
              </div>
            </div>
          </div>

          <Link to="/admin/cobrancas">
            <Button variant="outline" size="sm" className="w-full justify-center">
              Criar nova cobrança
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
