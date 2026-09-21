import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CreditCard, Loader2, RefreshCcw, ShieldCheck, TrendingUp } from 'lucide-react';

interface Overview {
  summary: { active: number; past_due: number; cancelled: number; mrr_cents: string | number };
  subscriptions: Array<{ id: string; user_id: string; customer_name: string; customer_email: string; plan_name: string; status: string; monthly_amount_cents: number; next_billing_at?: string }>;
  risks: Array<{ id: string; customer_name: string; plan_name?: string; severity: string; reason: string; next_action?: string; status: string }>;
  suggestions: Array<{ id: string; customer_name: string; current_service_name?: string; suggested_service_name: string; suggestion_type: string; reason: string; status: string; opportunity_id?: string }>;
}

interface CustomerView {
  customer: { name: string; email: string; company?: string };
  services: unknown[];
  subscriptions: unknown[];
  payments: unknown[];
  projects: unknown[];
  support: unknown[];
  activities: unknown[];
  suggestions: unknown[];
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminCustomerSuccessPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerView, setCustomerView] = useState<CustomerView | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const response = await fetch('/api/admin/customer-success/overview?limit=50', { credentials: 'include', cache: 'no-store' }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setData(body); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const mutate = async (url: string, method: 'POST' | 'PATCH', body: object = {}) => {
    setError(''); setMessage('');
    const response = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Falha na operação.');
    await load(); return result;
  };

  const openCustomer = async (customerId: string) => {
    setError('');
    try {
      const response = await fetch(`/api/admin/customer-success/customer?customerId=${encodeURIComponent(customerId)}&limit=25`, { credentials: 'include', cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao abrir cliente.');
      setCustomerView(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao abrir cliente.'); }
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-gray-400"><Loader2 className="h-5 w-5 animate-spin" />Carregando recorrência...</div>;
  if (!data) return <p role="alert" className="rounded-xl bg-red-950/40 p-4 text-red-300">{error || 'Dados indisponíveis.'}</p>;

  return <div className="space-y-6 text-white">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Recorrência e Customer Success</h2><p className="mt-1 text-sm text-gray-400">Dados financeiros vêm do gateway; ações comerciais continuam humanas.</p></div><div className="flex gap-2"><button onClick={async () => { try { const result = await mutate('/api/admin/customer-success/retention/refresh','POST'); setMessage(`${result.created} sinal(is) atualizado(s).`); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha.'); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-700 px-4 text-sm font-bold"><RefreshCcw className="h-4 w-4" />Atualizar riscos</button><button onClick={async () => { try { const result = await mutate('/api/admin/customer-success/expansion/generate','POST'); setMessage(`${result.created} sugestão(ões) criada(s).`); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha.'); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5B4FE9] px-4 text-sm font-bold"><TrendingUp className="h-4 w-4" />Gerar sugestões</button></div></header>
    {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>}{message && <p className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">{message}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[CreditCard,'Assinaturas ativas',data.summary.active],[AlertTriangle,'Pagamento pendente',data.summary.past_due],[ShieldCheck,'Canceladas',data.summary.cancelled],[TrendingUp,'MRR confirmado',money.format(Number(data.summary.mrr_cents || 0)/100)]].map(([Icon,label,value]) => { const Component = Icon as typeof CreditCard; return <div key={String(label)} className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><Component className="h-5 w-5 text-violet-400" /><p className="mt-3 text-xs text-gray-400">{String(label)}</p><strong className="text-2xl">{String(value)}</strong></div>; })}</section>

    <section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"><h3 className="p-5 font-black">Assinaturas</h3><div className="overflow-x-auto"><table className="min-w-[840px] w-full text-sm"><thead className="bg-gray-800 text-left text-xs uppercase text-gray-400"><tr><th className="p-3">Cliente</th><th className="p-3">Plano</th><th className="p-3">Status</th><th className="p-3">Mensalidade</th><th className="p-3">Próxima cobrança</th><th className="p-3">Relacionamento</th></tr></thead><tbody>{data.subscriptions.map((item) => <tr key={item.id} className="border-t border-gray-800"><td className="p-3"><p className="font-bold">{item.customer_name}</p><p className="text-xs text-gray-500">{item.customer_email}</p></td><td className="p-3">{item.plan_name}</td><td className="p-3">{item.status}</td><td className="p-3">{money.format(item.monthly_amount_cents/100)}</td><td className="p-3">{item.next_billing_at ? new Date(item.next_billing_at).toLocaleDateString('pt-BR') : '—'}</td><td className="p-3"><button onClick={() => void openCustomer(item.user_id)} className="min-h-10 rounded-lg border border-violet-700 px-3 text-xs font-bold text-violet-300">Visão 360</button></td></tr>)}</tbody></table></div></section>

    {customerView && <section className="rounded-2xl border border-violet-800 bg-gray-900 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-black">{customerView.customer.name}</h3><p className="text-sm text-gray-400">{customerView.customer.email}{customerView.customer.company ? ` · ${customerView.customer.company}` : ''}</p></div><button onClick={() => setCustomerView(null)} className="min-h-10 rounded-lg border border-gray-700 px-3 text-xs font-bold">Fechar</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Serviços',customerView.services.length],['Assinaturas',customerView.subscriptions.length],['Pagamentos',customerView.payments.length],['Projetos',customerView.projects.length],['Suporte',customerView.support.length],['Atividades',customerView.activities.length],['Expansão',customerView.suggestions.length]].map(([label,value]) => <div key={String(label)} className="rounded-xl bg-gray-950 p-4"><p className="text-xs text-gray-500">{label}</p><strong className="text-xl">{value}</strong></div>)}</div></section>}

    <section className="grid gap-6 xl:grid-cols-2"><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><h3 className="font-black">Clientes em risco</h3><div className="mt-4 space-y-3">{data.risks.map((risk) => <article key={risk.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{risk.customer_name} {risk.plan_name ? `· ${risk.plan_name}` : ''}</p><p className="mt-1 text-sm text-gray-400">{risk.reason}</p><p className="mt-1 text-xs text-gray-500">Próxima ação: {risk.next_action || 'Definir acompanhamento'}</p></div><span className={`h-max rounded-full px-2 py-1 text-xs font-bold ${risk.severity === 'high' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'}`}>{risk.severity}</span></div><div className="mt-3 flex gap-2"><button onClick={() => void mutate('/api/admin/customer-success/retention','PATCH',{ id: risk.id, status: 'acknowledged' })} className="min-h-10 rounded-lg border border-gray-700 px-3 text-xs font-bold">Assumir</button><button onClick={() => void mutate('/api/admin/customer-success/retention','PATCH',{ id: risk.id, status: 'resolved' })} className="min-h-10 rounded-lg bg-emerald-700 px-3 text-xs font-bold">Resolver</button></div></article>)}{data.risks.length === 0 && <p className="text-sm text-gray-500">Nenhum sinal objetivo em aberto.</p>}</div></div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><h3 className="font-black">Oportunidades de expansão</h3><div className="mt-4 space-y-3">{data.suggestions.map((item) => <article key={item.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4"><p className="font-bold">{item.customer_name}</p><p className="text-sm text-violet-300">{item.current_service_name || 'Serviço atual'} → {item.suggested_service_name}</p><p className="mt-1 text-xs text-gray-500">{item.suggestion_type} · {item.reason}</p><div className="mt-3 flex flex-wrap gap-2">{item.status === 'converted_to_opportunity' ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400"><ArrowUpRight className="h-3 w-3" />CRM: {item.opportunity_id}</span> : <><button onClick={() => void mutate('/api/admin/customer-success/expansion','PATCH',{ id: item.id, status: 'reviewed' })} className="min-h-10 rounded-lg border border-gray-700 px-3 text-xs font-bold">Revisar</button><button onClick={() => void mutate('/api/admin/customer-success/expansion','PATCH',{ id: item.id, status: 'dismissed' })} className="min-h-10 rounded-lg border border-gray-700 px-3 text-xs font-bold">Dispensar 90 dias</button><button onClick={() => void mutate('/api/admin/customer-success/expansion','PATCH',{ id: item.id, status: 'converted_to_opportunity' })} className="min-h-10 rounded-lg bg-[#5B4FE9] px-3 text-xs font-bold">Criar oportunidade no CRM</button></>}</div></article>)}{data.suggestions.length === 0 && <p className="text-sm text-gray-500">Nenhuma sugestão aprovada pelas regras configuradas.</p>}</div></div></section>
  </div>;
}
