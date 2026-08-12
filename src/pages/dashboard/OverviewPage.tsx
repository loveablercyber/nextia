import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ExternalLink, AlertCircle,
  CheckCircle2, ArrowUpRight, ShoppingBag
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { statusConfig } from '../../types/project';
import Button from '../../components/ui/Button';

interface ClientOrder {
  id: string;
  item_name: string;
  amount_cents: number;
  status: string;
  created_at: string;
  checkout_url?: string;
}

interface ClientContract {
  id: string;
  plan_name: string;
  activation_amount_cents: number;
  monthly_amount_cents: number;
  status: string;
  created_at: string;
  activation_checkout_url?: string;
  subscription_checkout_url?: string;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Criado', color: 'text-amber-800', bg: 'bg-amber-100' },
  payment_pending: { label: 'Aguardando Pagamento', color: 'text-amber-800', bg: 'bg-amber-100' },
  activation_pending: { label: 'Ativação Pendente', color: 'text-amber-800', bg: 'bg-amber-100' },
  subscription_pending: { label: 'Assinatura Pendente', color: 'text-blue-800', bg: 'bg-blue-100' },
  paid: { label: 'Pago', color: 'text-emerald-800', bg: 'bg-emerald-100' },
  active: { label: 'Ativo / Em andamento', color: 'text-emerald-800', bg: 'bg-emerald-100' },
  failed: { label: 'Falhou', color: 'text-red-800', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelado', color: 'text-gray-700', bg: 'bg-gray-200' },
};

export default function OverviewPage() {
  const { project, loading } = useProject();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [loadingCommerce, setLoadingCommerce] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/commerce/orders').then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch('/api/commerce/plan-contracts').then((r) => (r.ok ? r.json() : { contracts: [] })),
    ])
      .then(([ordersRes, contractsRes]) => {
        if (Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);
        if (Array.isArray(contractsRes.contracts)) setContracts(contractsRes.contracts);
      })
      .catch(() => {})
      .finally(() => setLoadingCommerce(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE9]" />
      </div>
    );
  }

  const currentStatus = project ? statusConfig[project.status] : null;
  const hasAwaitingAction = project && (project.status === 'em-revisao' || project.status === 'aguardando-briefing');

  // Format dates
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Awaiting Action Banner */}
      {hasAwaitingAction && project && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-pulse">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900 mb-1">
              {project.status === 'em-revisao'
                ? 'Revisão do site disponível!'
                : 'Briefing pendente'}
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed mb-3">
              {project.status === 'em-revisao'
                ? 'Seu site está pronto para revisão. Dê uma olhada na versão de testes e aprove ou solicite alterações.'
                : 'Precisamos que você envie as informações do seu negócio no briefing para iniciarmos a criação do site.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.status === 'em-revisao' ? (
                <>
                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 border-none">
                      Visualizar site de testes
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <Link to="/painel/alteracoes">
                    <Button variant="outline" size="sm" className="border-amber-200 text-amber-800 hover:bg-amber-100/50">
                      Solicitar alterações
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/painel/briefing">
                  <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 border-none">
                    Preencher briefing do site
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Stats and Status (if active project exists) */}
      {project && currentStatus && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Project Header Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#5B4FE9]/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}
                >
                  {currentStatus.label}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Iniciado em: {formatDate(project.startedAt)}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{project.name}</h1>
              <p className="text-xs text-[#5B4FE9] font-bold mb-4">Plano: {project.plan}</p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                  <span>Progresso do desenvolvimento</span>
                  <span>{project.progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B4FE9] to-[#753AFF] rounded-full transition-all duration-500"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Ações rápidas</h3>
            <div className="space-y-2">
              <Link to="/painel/arquivos">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span>📁 Enviar arquivos</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link to="/painel/alteracoes">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span>✏️ Solicitar ajuste</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <a href="https://wa.me/5514996405496" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span>💬 Suporte WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Requested Services Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#5B4FE9]" />
            Serviços e Planos Solicitados ({orders.length + contracts.length})
          </h3>
          <Link to="/painel/pedidos" className="text-xs text-[#5B4FE9] hover:underline font-bold flex items-center gap-1">
            Ver meus pedidos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCommerce ? (
          <p className="text-xs text-gray-400 py-4">Carregando serviços...</p>
        ) : orders.length === 0 && contracts.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-medium">Nenhum serviço solicitado até o momento.</p>
            <Link to="/solucoes" className="mt-2 inline-block text-xs text-[#5B4FE9] font-bold hover:underline">
              Conhecer soluções →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((c) => {
              const st = statusLabels[c.status] || { label: c.status, color: 'text-gray-700', bg: 'bg-gray-100' };
              const checkoutUrl = c.status === 'activation_pending' ? c.activation_checkout_url : c.subscription_checkout_url;
              return (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 truncate">Plano {c.plan_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color} ${st.bg}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency(c.activation_amount_cents)} <span className="text-xs font-normal text-slate-500">ativação</span>
                    </p>
                    {c.monthly_amount_cents > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        + {formatCurrency(c.monthly_amount_cents)}/mês
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">{formatDate(c.created_at)}</span>
                    {checkoutUrl && (c.status === 'activation_pending' || c.status === 'subscription_pending') ? (
                      <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#5B4FE9] hover:underline">
                        Pagar agora <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link to="/painel/pedidos" className="text-slate-600 font-semibold hover:underline">
                        Ver pedido →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {orders.map((o) => {
              const st = statusLabels[o.status] || { label: o.status, color: 'text-gray-700', bg: 'bg-gray-100' };
              return (
                <div key={o.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{o.item_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color} ${st.bg}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(o.amount_cents)}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">{formatDate(o.created_at)}</span>
                    {o.checkout_url && o.status === 'payment_pending' ? (
                      <a href={o.checkout_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#5B4FE9] hover:underline">
                        Pagar agora <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link to="/painel/pedidos" className="text-slate-600 font-semibold hover:underline">
                        Ver pedido →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
