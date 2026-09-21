import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, HeartHandshake, Loader2, RefreshCcw, Star } from 'lucide-react';

interface Subscription {
  id: string;
  plan_name: string;
  service_slug?: string;
  status: string;
  billing_cycle: string;
  monthly_amount_cents: number;
  currency: string;
  next_billing_at?: string;
  cancellation_requested_at?: string;
}

interface SubscriptionEvent {
  id: string;
  event_type: string;
  occurred_at: string;
  to_status?: string;
}

interface Overview {
  subscriptions: Subscription[];
  subscriptionEvents: SubscriptionEvent[];
  services: Array<{ id: string; service_name_snapshot: string; status: string }>;
  customerState: 'active' | 'inactive' | 'former';
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const statusLabel: Record<string, string> = { active: 'Ativa', past_due: 'Pagamento pendente', paused: 'Pausada', cancelled: 'Cancelada', pending: 'Pendente', subscription_pending: 'Aguardando autorização', activation_pending: 'Aguardando ativação', expired: 'Expirada', ended: 'Encerrada', failed: 'Falha' };
const reasons = [['price','Preço'],['no_need','Não preciso mais'],['priority_changed','Mudança de prioridade'],['dissatisfaction','Insatisfação'],['technical_issue','Problema técnico'],['competitor','Migrei para outra solução'],['business_closed','Empresa encerrou atividade'],['other','Outro']];

export default function CustomerSuccessPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState('');
  const [reason, setReason] = useState('no_need');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customer-success/overview?limit=50', { credentials: 'include', cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Falha ao carregar pós-venda.');
      setData(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const request = async (url: string, body: object) => {
    setError(''); setMessage('');
    const response = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a solicitação.');
    return result;
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Carregando relacionamento...</div>;
  if (!data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error || 'Dados indisponíveis.'}</p>;

  return <div className="space-y-6">
    <header><h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><HeartHandshake className="text-[#5B4FE9]" />Assinaturas e pós-venda</h2><p className="mt-1 text-sm text-slate-600">Consulte seus dados reais de recorrência e fale com a equipe sem alterar informações financeiras diretamente.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}

    <section className="grid gap-4 lg:grid-cols-2">
      {data.subscriptions.map((subscription) => <article key={subscription.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><h3 className="font-black text-slate-950">{subscription.plan_name}</h3><p className="text-sm text-slate-500">{subscription.service_slug || 'Plano Nextia'} · {subscription.billing_cycle === 'monthly' ? 'mensal' : subscription.billing_cycle}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : subscription.status === 'past_due' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{statusLabel[subscription.status] || subscription.status}</span></div>
        <p className="mt-4 text-xl font-black text-slate-900">{money.format(subscription.monthly_amount_cents / 100)}<span className="text-xs font-medium text-slate-500"> / mês</span></p>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarClock className="h-4 w-4" />Próxima cobrança: {subscription.next_billing_at ? new Date(subscription.next_billing_at).toLocaleDateString('pt-BR') : 'aguardando confirmação do gateway'}</p>
        {subscription.cancellation_requested_at ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">Solicitação de cancelamento em análise desde {new Date(subscription.cancellation_requested_at).toLocaleDateString('pt-BR')}.</p> : ['active','past_due','paused'].includes(subscription.status) ? <button onClick={() => setCancelId(subscription.id)} className="mt-4 min-h-11 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700">Solicitar cancelamento</button> : ['cancelled','paused'].includes(subscription.status) ? <button onClick={async () => { try { await request(`/api/customer-success/subscriptions/${subscription.id}/reactivate`, {}); setMessage('Solicitação de reativação registrada.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha.'); } }} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#5B4FE9]/30 px-4 text-sm font-bold text-[#5B4FE9]"><RefreshCcw className="h-4 w-4" />Solicitar reativação</button> : null}
      </article>)}
      {data.subscriptions.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Nenhuma assinatura recorrente encontrada.</div>}
    </section>

    {cancelId && <form onSubmit={async (event) => { event.preventDefault(); try { await request(`/api/customer-success/subscriptions/${cancelId}/cancel`, { reason, note }); setCancelId(''); setNote(''); setMessage('Solicitação registrada. Nenhuma cobrança foi alterada pelo painel.'); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha.'); } }} className="rounded-2xl border border-red-200 bg-white p-5">
      <h3 className="font-black text-slate-950">Solicitar cancelamento</h3><p className="mt-1 text-sm text-slate-600">A equipe aplicará a política comercial e confirmará a data efetiva. Não há confirmação enganosa nem alteração silenciosa.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><select value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 px-3">{reasons.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><input value={note} onChange={(event) => setNote(event.target.value)} required={reason === 'other'} maxLength={1000} placeholder={reason === 'other' ? 'Descreva o motivo' : 'Observação opcional'} className="min-h-11 rounded-xl border border-slate-300 px-3" /></div>
      <div className="mt-4 flex gap-3"><button className="min-h-11 rounded-xl bg-red-600 px-5 font-bold text-white">Confirmar solicitação</button><button type="button" onClick={() => setCancelId('')} className="min-h-11 rounded-xl border px-5 font-bold">Voltar</button></div>
    </form>}

    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">Histórico da assinatura</h3><div className="mt-4 space-y-3">{data.subscriptionEvents.map((item) => <div key={item.id} className="flex gap-3 border-l-2 border-[#5B4FE9]/30 pl-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[#5B4FE9]" /><div><p className="text-sm font-bold text-slate-800">{item.event_type.replaceAll('.', ' ')}</p><p className="text-xs text-slate-500">{new Date(item.occurred_at).toLocaleString('pt-BR')}</p></div></div>)}{data.subscriptionEvents.length === 0 && <p className="text-sm text-slate-500">Nenhum evento registrado.</p>}</div></div>
      <form onSubmit={async (event) => { event.preventDefault(); try { await request('/api/customer-success/feedback', { rating, comment }); setComment(''); setMessage('Obrigado. Seu feedback foi registrado.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha.'); } }} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="flex items-center gap-2 font-black text-slate-950"><Star className="h-5 w-5 text-amber-500" />Como está sua experiência?</h3><p className="mt-1 text-sm text-slate-600">Registro simples de satisfação, ligado ao pós-venda.</p><select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 px-3">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} estrela{value > 1 ? 's' : ''}</option>)}</select><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Comentário opcional" className="mt-3 min-h-28 w-full rounded-xl border border-slate-300 p-3" /><button className="mt-3 min-h-11 rounded-xl bg-[#5B4FE9] px-5 font-bold text-white">Enviar feedback</button></form>
    </section>
    {data.customerState !== 'active' && <p className="flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-700"><AlertTriangle className="h-4 w-4" />Estado de relacionamento: {data.customerState === 'former' ? 'ex-cliente, com histórico preservado' : 'cliente sem serviço ativo'}.</p>}
  </div>;
}
