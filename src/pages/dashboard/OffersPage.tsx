import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bot, Check, Clock, Globe2, Headphones, Loader2, MessageCircle,
  Network, Rocket, ShieldCheck, ShoppingBag, Sparkles, TrendingUp,
} from 'lucide-react';
import { requestJson } from '../../lib/appData';

interface CatalogService {
  slug: string;
  name: string;
  category: string;
  price_cents?: number | null;
  price_label?: string | null;
  recurring: boolean;
}

interface CatalogPlan {
  id: string;
  name: string;
  monthly_amount_cents: number;
  activation_amount_cents: number;
  active: boolean;
}

interface CatalogAddon {
  code: string;
  name: string;
  description?: string;
  amount_cents: number;
  billing_cycle: 'monthly' | 'one_time';
  service_slug?: string | null;
}

interface CustomerOverview {
  services: Array<{ service_slug?: string; status: string }>;
  subscriptions: Array<{ plan_id?: string; service_slug?: string; status: string }>;
  suggestions: Array<{
    id: string;
    suggested_service_slug: string;
    suggested_service_name: string;
    suggestion_type: string;
    reason: string;
  }>;
}

interface PortalOffer {
  id: string;
  title: string;
  description: string;
  badge: string;
  discount_label?: string;
  cta_path: string;
  ends_at?: string;
}

const categoryDetails: Record<string, { label: string; description: string; icon: typeof Globe2; color: string }> = {
  digital: { label: 'Presença digital', description: 'Conquiste mais clientes com uma estrutura digital profissional.', icon: Globe2, color: 'from-blue-600 to-indigo-600' },
  automation: { label: 'Automação e IA', description: 'Atenda, qualifique e acompanhe oportunidades sem perder contatos.', icon: Bot, color: 'from-violet-600 to-fuchsia-600' },
  techcare: { label: 'Suporte contínuo', description: 'Reduza interrupções com acompanhamento técnico especializado.', icon: Headphones, color: 'from-emerald-600 to-teal-600' },
  infrastructure: { label: 'Infraestrutura', description: 'Prepare sua operação para crescer com estabilidade e desempenho.', icon: Network, color: 'from-cyan-600 to-blue-600' },
  security: { label: 'Segurança', description: 'Proteja equipamentos, dados e a continuidade da sua empresa.', icon: ShieldCheck, color: 'from-slate-700 to-slate-950' },
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function priceLabel(service: CatalogService) {
  if (Number(service.price_cents) > 0) return `${money.format(Number(service.price_cents) / 100)}${service.recurring ? '/mês' : ''}`;
  return service.price_label || 'Orçamento personalizado';
}

export default function OffersPage() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [addons, setAddons] = useState<CatalogAddon[]>([]);
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [portalOffers, setPortalOffers] = useState<PortalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      requestJson<{ services: CatalogService[] }>('/api/catalog/services'),
      requestJson<{ plans: CatalogPlan[] }>('/api/catalog/plans'),
      requestJson<{ addons: CatalogAddon[] }>('/api/catalog/addons'),
      requestJson<CustomerOverview>('/api/customer-success/overview?limit=50')
        .catch(() => ({ services: [], subscriptions: [], suggestions: [] })),
      requestJson<{ offers: PortalOffer[] }>('/api/customer-success/offers'),
    ])
      .then(([serviceData, planData, addonData, customerData, offerData]) => {
        if (!active) return;
        setServices(serviceData.services || []);
        setPlans((planData.plans || []).filter((plan) => plan.active !== false));
        setAddons(addonData.addons || []);
        setOverview(customerData);
        setPortalOffers(offerData.offers || []);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as ofertas.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const ownedServices = useMemo(() => new Set([
    ...(overview?.services || []).filter((item) => !['cancelled', 'suspended'].includes(item.status)).map((item) => item.service_slug),
    ...(overview?.subscriptions || []).filter((item) => ['active', 'pending', 'activation_pending', 'subscription_pending'].includes(item.status)).map((item) => item.service_slug),
  ].filter(Boolean)), [overview]);

  const currentPlans = useMemo(() => new Set((overview?.subscriptions || [])
    .filter((item) => ['active', 'pending', 'activation_pending', 'subscription_pending'].includes(item.status))
    .map((item) => item.plan_id).filter(Boolean)), [overview]);

  const suggestionByService = useMemo(() => new Map((overview?.suggestions || [])
    .map((item) => [item.suggested_service_slug, item])), [overview]);

  const recommendedServices = useMemo(() => [...services]
    .filter((service) => !ownedServices.has(service.slug))
    .sort((a, b) => Number(suggestionByService.has(b.slug)) - Number(suggestionByService.has(a.slug))),
  [ownedServices, services, suggestionByService]);

  if (loading) return <div className="flex min-h-72 items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Preparando oportunidades para sua empresa...</div>;

  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111534] via-[#3826a8] to-[#7c3aed] p-7 text-white shadow-xl sm:p-9">
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="relative max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em]"><Sparkles className="h-4 w-4" />Exclusivo para clientes Nextia</span>
        <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Sua estrutura já está pronta. Agora é hora de vender mais.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Adicione automações, novos canais e recursos ao que você já utiliza. As opções abaixo vêm do catálogo ativo e a contratação é confirmada antes de qualquer cobrança.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#recomendacoes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#3826a8]">Ver oportunidades <ArrowRight className="h-4 w-4" /></a>
          <Link to="/painel/suporte" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-black text-white hover:bg-white/10"><MessageCircle className="h-4 w-4" />Falar com a equipe</Link>
        </div>
      </div>
    </section>

    {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

    {portalOffers[0] && <section className="relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-600 to-orange-500 p-6 text-white shadow-lg">
      <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em]">{portalOffers[0].badge}</span><h3 className="mt-3 text-2xl font-black">{portalOffers[0].title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">{portalOffers[0].description}</p><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">{portalOffers[0].discount_label && <span className="rounded-lg bg-yellow-300 px-3 py-1.5 text-orange-950">{portalOffers[0].discount_label}</span>}{portalOffers[0].ends_at && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />Válida até {new Date(portalOffers[0].ends_at).toLocaleString('pt-BR')}</span>}</div></div><Link to={portalOffers[0].cta_path} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-rose-700">Aproveitar condição <ArrowRight className="h-4 w-4" /></Link></div>
    </section>}

    {(overview?.suggestions || []).length > 0 && <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
      <div className="flex items-start gap-3"><span className="rounded-2xl bg-amber-400 p-3 text-amber-950"><TrendingUp className="h-5 w-5" /></span><div><span className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Recomendação personalizada</span><h3 className="mt-1 text-xl font-black text-slate-950">Próximo passo indicado para sua operação</h3><p className="mt-1 text-sm text-slate-700">{overview?.suggestions[0]?.reason}</p></div></div>
    </section>}

    <section id="recomendacoes">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><span className="text-xs font-black uppercase tracking-[.18em] text-violet-600">Expanda sua operação</span><h3 className="mt-1 text-2xl font-black text-slate-950">Serviços recomendados</h3></div><span className="text-xs font-semibold text-slate-500">Você só vê opções que ainda não possui</span></div>
      {recommendedServices.length === 0 ? <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center"><Check className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-2 font-black text-emerald-950">Você já possui todos os serviços disponíveis no catálogo.</p></div> : <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{recommendedServices.slice(0, 9).map((service) => {
        const detail = categoryDetails[service.category] || { label: service.category, description: 'Uma solução Nextia para apoiar o crescimento da sua empresa.', icon: Rocket, color: 'from-indigo-600 to-violet-600' };
        const Icon = detail.icon;
        const suggestion = suggestionByService.get(service.slug);
        return <article key={service.slug} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className={`bg-gradient-to-r ${detail.color} p-5 text-white`}><div className="flex items-start justify-between gap-3"><span className="rounded-2xl bg-white/15 p-3"><Icon className="h-6 w-6" /></span>{suggestion && <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-950">Indicado para você</span>}</div><p className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-white/70">{detail.label}</p><h4 className="mt-1 text-xl font-black">{service.name}</h4></div>
          <div className="flex flex-1 flex-col p-5"><p className="text-sm leading-6 text-slate-600">{suggestion?.reason || detail.description}</p><div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><div><span className="block text-[10px] font-bold uppercase text-slate-400">Investimento</span><strong className="text-sm text-slate-950">{priceLabel(service)}</strong></div><Link to={`/painel/contratar?servico=${encodeURIComponent(service.slug)}&origem=painel-cliente`} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-950 px-4 text-xs font-black text-white">Quero adicionar <ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
        </article>;
      })}</div>}
    </section>

    {plans.length > 0 && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700"><Rocket className="h-5 w-5" /></span><div><h3 className="text-xl font-black text-slate-950">Planos para acelerar seu crescimento</h3><p className="text-sm text-slate-500">Compare valores reais do catálogo e solicite a mudança com confirmação comercial.</p></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => {
        const current = currentPlans.has(plan.id);
        return <article key={plan.id} className={`rounded-2xl border p-5 ${current ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}><div className="flex items-center justify-between gap-2"><h4 className="font-black text-slate-950">{plan.name}</h4>{current && <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">ATUAL</span>}</div><p className="mt-4 text-2xl font-black text-slate-950">{money.format(Number(plan.monthly_amount_cents) / 100)}<span className="text-xs font-semibold text-slate-500">/mês</span></p><p className="mt-1 text-xs text-slate-500">Ativação: {money.format(Number(plan.activation_amount_cents) / 100)}</p>{current ? <span className="mt-5 inline-flex min-h-10 items-center text-xs font-bold text-emerald-700"><Check className="mr-1 h-4 w-4" />Plano contratado</span> : <Link to={`/painel/contratar?plan=${encodeURIComponent(plan.id)}&origem=painel-cliente`} className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-indigo-200 text-xs font-black text-indigo-700 hover:bg-indigo-50">Solicitar este plano</Link>}</article>;
      })}</div>
    </section>}

    {addons.length > 0 && <section><div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-violet-600" /><h3 className="text-xl font-black text-slate-950">Recursos adicionais</h3></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{addons.slice(0, 9).map((addon) => <article key={addon.code} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-slate-900">{addon.name}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{addon.description || 'Recurso complementar para ampliar sua solução.'}</p></div><Sparkles className="h-5 w-5 shrink-0 text-violet-500" /></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><strong className="text-sm">{money.format(Number(addon.amount_cents) / 100)}{addon.billing_cycle === 'monthly' ? '/mês' : ''}</strong><Link to={`/painel/contratar?servico=${encodeURIComponent(addon.service_slug || '')}&addon=${encodeURIComponent(addon.code)}&origem=painel-cliente`} className="text-xs font-black text-violet-700">Adicionar →</Link></div></article>)}</div></section>}
  </div>;
}
