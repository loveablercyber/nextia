import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';

interface Order { id: string; item_name: string; amount_cents: number; recurring: boolean; status: string; checkout_url: string | null; created_at: string; }
interface Contract { id: string; plan_name: string; monthly_amount_cents: number; activation_amount_cents: number; status: string; activation_checkout_url: string | null; subscription_checkout_url: string | null; created_at: string; }
const labels: Record<string, string> = { pending: 'Criado', payment_pending: 'Aguardando pagamento', paid: 'Pago', active: 'Ativo', failed: 'Falhou', cancelled: 'Cancelado' };
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(['/api/commerce/orders', '/api/commerce/plan-contracts'].map(async (url) => {
      const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    })).then(([orderData, contractData]) => {
      setOrders(orderData.orders);
      setContracts(contractData.contracts);
    }).catch((err) => setError(err.message || 'Falha ao carregar pedidos.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-3 text-base text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Carregando pedidos...</div>;
  const empty = orders.length === 0 && contracts.length === 0;

  return <div className="space-y-6">
    <header><h2 className="text-2xl font-black text-slate-900">Meus pedidos</h2><p className="mt-2 text-base text-slate-600">Contratações avulsas e assinaturas iniciadas no site.</p></header>
    {error && <div className="border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
    {contracts.length > 0 && <section className="border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">Planos digitais</h3><div className="mt-4 grid gap-4 lg:grid-cols-2">{contracts.map((contract) => {
      const actionUrl = contract.status === 'activation_pending' ? contract.activation_checkout_url : contract.status === 'subscription_pending' ? contract.subscription_checkout_url : null;
      return <article key={contract.id} className="border border-slate-200 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-lg font-black">{contract.plan_name}</p><p className="mt-1 text-base text-slate-500">Ativação {money.format(contract.activation_amount_cents / 100)} · Mensalidade {money.format(contract.monthly_amount_cents / 100)}</p></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${contract.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{contract.status === 'activation_pending' ? 'Aguardando ativação' : contract.status === 'subscription_pending' ? 'Autorizar mensalidade' : labels[contract.status] || contract.status}</span></div>{actionUrl && <a href={actionUrl} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded bg-[#1677FF] px-4 font-bold text-white"><CreditCard className="h-4 w-4" />{contract.status === 'activation_pending' ? 'Pagar ativação' : 'Autorizar assinatura'}<ExternalLink className="h-4 w-4" /></a>}</article>;
    })}</div></section>}
    {empty ? <div className="flex min-h-64 flex-col items-center justify-center border border-slate-200 bg-white text-center"><ShoppingBag className="h-10 w-10 text-slate-300" /><h3 className="mt-4 text-lg font-bold">Nenhum pedido encontrado</h3><p className="mt-2 text-base text-slate-500">As novas contratações aparecerão aqui.</p></div> : orders.length > 0 && <div className="overflow-x-auto border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-sm uppercase text-slate-500"><tr><th className="p-4">Serviço</th><th className="p-4">Data</th><th className="p-4">Valor</th><th className="p-4">Status</th><th className="p-4 text-right">Ação</th></tr></thead><tbody className="divide-y divide-slate-200">{orders.map((order) => <tr key={order.id}><td className="p-4"><p className="font-bold text-slate-900">{order.item_name}</p><p className="text-sm text-slate-500">{order.recurring ? 'Assinatura mensal' : 'Serviço avulso'}</p></td><td className="p-4 text-base text-slate-600">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td><td className="p-4 font-bold">{money.format(order.amount_cents / 100)}{order.recurring && '/mês'}</td><td className="p-4"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${['paid','active'].includes(order.status) ? 'bg-green-50 text-green-700' : order.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{labels[order.status] || order.status}</span></td><td className="p-4 text-right">{order.status === 'payment_pending' && order.checkout_url ? <a href={order.checkout_url} className="inline-flex min-h-11 items-center gap-2 rounded bg-[#1677FF] px-4 font-bold text-white"><CreditCard className="h-4 w-4" /> Pagar <ExternalLink className="h-4 w-4" /></a> : <span className="text-sm text-slate-400">Sem ação</span>}</td></tr>)}</tbody></table></div>}
  </div>;
}
