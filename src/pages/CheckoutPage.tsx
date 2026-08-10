import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, CreditCard, Loader2, Lock } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useCommercialPlans } from '../hooks/useCommercialPlans';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const services = useServiceCatalog();
  const plans = useCommercialPlans();
  const service = useMemo(() => services.find((item) => item.slug === params.get('service')), [params, services]);
  const plan = useMemo(() => plans.find((item) => item.id === params.get('plan') && item.price > 0), [params, plans]);
  const selection = service ? { id: service.slug, name: service.name, summary: service.summary, price: service.price || 0, activationFee: 0, recurring: service.recurring === true, benefits: service.benefits, path: `/${service.slug}`, kind: 'service' as const }
    : plan ? { id: plan.id, name: plan.name, summary: plan.subtitle, price: plan.price, activationFee: plan.activationFee, recurring: true, benefits: plan.features, path: '/planos', kind: 'plan' as const } : null;
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const returnStatus = params.get('status');

  if (!selection && !returnStatus) return <Navigate to="/solucoes" replace />;
  if (returnStatus) return <main className="min-h-[70vh] bg-[#F4F8FC] px-5 pb-20 pt-32"><Seo title="Status da contratação" description="Acompanhe o status da sua contratação Nextia." noindex /><div className="mx-auto max-w-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Check className="mx-auto h-12 w-12 text-[#1677FF]" /><h1 className="mt-5 text-3xl font-black">Pedido recebido</h1><p className="mt-4 text-lg leading-8 text-slate-600">{returnStatus === 'failure' ? 'O pagamento não foi concluído. Você pode tentar novamente em Meus pedidos.' : 'O Mercado Pago está processando o retorno. O status será atualizado automaticamente.'}</p><Link to="/painel/pedidos" className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-[#1677FF] px-6 text-base font-bold text-white">Acompanhar pedido</Link></div></main>;

  const submit = async () => {
    if (!accepted) { setError('Confirme os termos da contratação para continuar.'); return; }
    setLoading(true); setError('');
    try {
      const endpoint = selection!.kind === 'plan' ? '/api/commerce/plan-contracts' : '/api/commerce/orders';
      const response = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selection!.kind === 'plan' ? { planId: selection!.id } : { serviceSlug: selection!.id, notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar a contratação.');
      window.location.assign(data.checkoutUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao iniciar contratação.'); setLoading(false); }
  };

  return <main className="min-h-screen bg-[#F4F8FC] px-5 pb-20 pt-28 sm:px-8"><Seo title={`Contratar ${selection!.name}`} description={`Checkout seguro para contratar ${selection!.name} com a Nextia.`} path={`/checkout?${selection!.kind}=${selection!.id}`} noindex />
    <div className="mx-auto max-w-5xl"><Link to={selection!.path} className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-slate-600"><ArrowLeft className="h-5 w-5" /> Voltar</Link><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.75fr]">
      <section className="border border-slate-200 bg-white p-6 sm:p-8"><p className="text-base font-bold text-[#1677FF]">Finalizar contratação</p><h1 className="mt-2 text-3xl font-black">{selection!.name}</h1><p className="mt-4 text-lg leading-8 text-slate-600">{selection!.summary}</p>{selection!.kind === 'service' && <div className="mt-8"><label htmlFor="checkout-notes" className="text-base font-bold">Observações para a equipe <span className="font-normal text-slate-500">(opcional)</span></label><textarea id="checkout-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={5} className="mt-2 w-full rounded border border-slate-300 p-4 text-base" placeholder="Informe contexto, prazo ou necessidade específica." /></div>}{selection!.kind === 'plan' && <div className="mt-8 border border-blue-200 bg-blue-50 p-4 text-base leading-7 text-blue-900">A taxa de ativação é paga primeiro. Após a confirmação, o link para autorizar a mensalidade ficará disponível em Meus pedidos.</div>}<label className="mt-6 flex cursor-pointer items-start gap-3"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-5 w-5 accent-[#1677FF]" /><span className="text-base leading-7 text-slate-700">Confirmo que li o escopo padrão e autorizo a criação do pedido. Valores adicionais dependerão de aprovação.</span></label>{error && <div role="alert" className="mt-5 flex gap-2 border border-red-200 bg-red-50 p-4 text-base text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}</section>
      <aside className="h-max border-t-4 border-[#D6A84B] bg-[#07162B] p-6 text-white sm:p-8"><h2 className="text-xl font-black">Resumo</h2><div className="mt-6 border-y border-white/15 py-5">{selection!.activationFee > 0 && <div className="mb-4"><p className="text-base text-slate-300">Taxa de ativação</p><p className="text-2xl font-black">{money.format(selection!.activationFee)}</p></div>}<p className="text-base text-slate-300">{selection!.recurring ? 'Mensalidade' : 'Pagamento único'}</p><p className="mt-2 text-4xl font-black">{money.format(selection!.price)}{selection!.recurring && <span className="text-base font-semibold text-slate-300">/mês</span>}</p></div><ul className="mt-6 space-y-3">{selection!.benefits.slice(0, 4).map((item) => <li key={item} className="flex gap-2 text-base"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#35B7FF]" />{item}</li>)}</ul><button onClick={submit} disabled={loading} className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-5 text-lg font-bold disabled:opacity-60">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}{loading ? 'Preparando pagamento...' : selection!.kind === 'plan' ? 'Pagar ativação' : selection!.recurring ? 'Continuar para assinatura' : 'Continuar para pagamento'}</button><p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-300"><Lock className="h-4 w-4" /> Pagamento processado pelo Mercado Pago</p></aside>
    </div></div>
  </main>;
}
