import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Order {
  id: string;
  item_name: string;
  amount_cents: number;
  recurring: boolean;
  status: string;
  checkout_url: string | null;
  created_at: string;
  total_cents?: number;
  service_name_snapshot?: string;
  plan_name_snapshot?: string;
  template_name_snapshot?: string;
  domain_fqdn?: string;
  engagement_id?: string;
  items?: Array<{ kind: string; code: string; name: string; amountCents: number; billingCycle: string }>;
}

interface Contract {
  id: string;
  plan_name: string;
  monthly_amount_cents: number;
  activation_amount_cents: number;
  status: string;
  activation_checkout_url: string | null;
  subscription_checkout_url: string | null;
  created_at: string;
}

const labels: Record<string, string> = {
  pending: 'Criado',
  payment_pending: 'Aguardando pagamento',
  paid: 'Pago',
  active: 'Ativo',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrdersPage() {
  const [params] = useSearchParams();
  const showSuccessBanner = params.get('success') === '1';

  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(
      ['/api/commerce/orders', '/api/commerce/plan-contracts'].map(async (url) => {
        const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
      }),
    )
      .then(([orderData, contractData]) => {
        setOrders(orderData.orders || []);
        setContracts(contractData.contracts || []);
      })
      .catch((err) => setError(err.message || 'Falha ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-base text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-[#1677FF]" /> Carregando pedidos...
      </div>
    );
  }

  const empty = orders.length === 0 && contracts.length === 0;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-slate-900">Meus pedidos e faturas</h2>
        <p className="mt-1 text-base text-slate-600">Contratações realizadas, status do serviço e faturas para pagamento.</p>
      </header>

      {showSuccessBanner && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg">Pedido registrado com sucesso!</h3>
            <p className="mt-1 text-sm text-emerald-800">
              Sua contratação foi gravada em nosso sistema. Clique no botão <strong>"Pagar"</strong> na tabela abaixo para concluir o pagamento via Pix ou cartão pelo Mercado Pago quando desejar.
            </p>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-semibold">{error}</div>}

      {contracts.length > 0 && (
        <section className="border border-slate-200 bg-white p-6 rounded-3xl">
          <h3 className="text-lg font-black text-slate-900">Planos e Assinaturas Digitais</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {contracts.map((contract) => {
              const actionUrl =
                contract.status === 'activation_pending'
                  ? contract.activation_checkout_url
                  : contract.status === 'subscription_pending'
                    ? contract.subscription_checkout_url
                    : null;
              return (
                <article key={contract.id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-slate-900">Plano {contract.plan_name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Ativação {money.format(contract.activation_amount_cents / 100)} · Mensalidade {money.format(contract.monthly_amount_cents / 100)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {contract.status === 'activation_pending'
                        ? 'Aguardando ativação'
                        : contract.status === 'subscription_pending'
                          ? 'Autorizar mensalidade'
                          : labels[contract.status] || contract.status}
                    </span>
                  </div>
                  {actionUrl && (
                    <a
                      href={actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1677FF] px-5 font-bold text-white shadow-sm hover:bg-blue-600"
                    >
                      <CreditCard className="h-4 w-4" />
                      {contract.status === 'activation_pending' ? 'Pagar taxa de ativação' : 'Autorizar mensalidade'}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {empty ? (
        <div className="flex min-h-64 flex-col items-center justify-center border border-slate-200 bg-white rounded-3xl p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-800">Nenhum pedido encontrado</h3>
          <p className="mt-1 text-sm text-slate-500">Seus pedidos e serviços contratados aparecerão listados aqui.</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 bg-white rounded-3xl shadow-sm">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4">Serviço / Projeto</th>
                <th className="p-4">Data</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{order.service_name_snapshot || order.item_name}</p>
                    <p className="text-xs text-slate-500">
                      {[order.template_name_snapshot, order.plan_name_snapshot, order.domain_fqdn].filter(Boolean).join(' · ') || (order.recurring ? 'Assinatura mensal' : 'Serviço avulso')}
                    </p>
                    {order.items && order.items.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-500">
                        {order.items.filter((item) => item.amountCents > 0).map((item) => (
                          <li key={`${item.billingCycle}-${item.code}`}>{item.name} — {money.format(item.amountCents / 100)}{item.billingCycle === 'monthly' ? '/mês' : ''}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-slate-900">
                    {money.format((order.total_cents ?? order.amount_cents) / 100)}
                    {order.recurring && '/mês'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        ['paid', 'active'].includes(order.status)
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {labels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'payment_pending' && order.checkout_url ? (
                      <a
                        href={order.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1677FF] px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-600"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Pagar com Pix / Cartão <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Sem ação pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
