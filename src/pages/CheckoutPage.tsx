import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, CreditCard, Globe, Loader2, Lock, Sparkles, UserCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useCommercialPlans } from '../hooks/useCommercialPlans';
import { useAuth } from '../context/AuthContext';
import { ALL_OPTIONAL_FEATURES, type OptionalFeature } from '../data/templates';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface StoreDraftData {
  id: string;
  model_id: string;
  model_name?: string;
  model_cover?: string;
  plan_id?: string;
  optional_items?: string[] | string;
  snapshot_monthly_cents: number;
  snapshot_activation_cents: number;
}

const DIGITAL_SLUGS = ['sites', 'sites-prontos', 'landing-pages', 'lojas-virtuais', 'sistemas'];

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const services = useServiceCatalog();
  const plans = useCommercialPlans();

  const draftId = params.get('draft');
  const [draft, setDraft] = useState<StoreDraftData | null>(null);
  const [loadingDraft, setLoadingDraft] = useState<boolean>(Boolean(draftId));

  useEffect(() => {
    if (!draftId) return;
    fetch(`/api/commerce/store-drafts/${draftId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.draft) setDraft(data.draft);
      })
      .catch(() => {})
      .finally(() => setLoadingDraft(false));
  }, [draftId]);

  const service = useMemo(() => services.find((item) => item.slug === params.get('service')), [params, services]);
  const plan = useMemo(() => plans.find((item) => item.id === params.get('plan') && item.price > 0), [params, plans]);

  const selection = useMemo(() => {
    if (draft) {
      let optionIds: string[] = [];
      try {
        if (Array.isArray(draft.optional_items)) {
          optionIds = draft.optional_items;
        } else if (typeof draft.optional_items === 'string') {
          optionIds = JSON.parse(draft.optional_items);
        }
      } catch {
        optionIds = [];
      }

      const selectedOptionals = ALL_OPTIONAL_FEATURES.filter((opt) => optionIds.includes(opt.id));

      return {
        id: draft.id,
        slug: 'lojas-virtuais',
        name: `Loja Virtual — ${draft.model_name || 'Personalizada'}`,
        summary: `Contratação com Modelo ${draft.model_name || 'selecionado'} e configuração completa pela Nextia.`,
        price: draft.snapshot_monthly_cents / 100,
        activationFee: draft.snapshot_activation_cents / 100,
        recurring: draft.snapshot_monthly_cents > 0,
        optionals: selectedOptionals,
        benefits: [
          `Modelo: ${draft.model_name || 'Selecionado'}`,
          'Configuração inicial e personalização',
          'Checkout transparente e pagamentos',
          'Gestão de pedidos e catálogo',
        ],
        path: '/lojas-virtuais',
        kind: 'draft' as const,
      };
    }
    if (service) {
      return {
        id: service.slug,
        slug: service.slug,
        name: service.name,
        summary: service.summary,
        price: service.price || 0,
        activationFee: 0,
        recurring: service.recurring === true,
        optionals: [] as OptionalFeature[],
        benefits: service.benefits,
        path: `/${service.slug}`,
        kind: 'service' as const,
      };
    }
    if (plan) {
      return {
        id: plan.id,
        slug: 'planos',
        name: plan.name,
        summary: plan.subtitle,
        price: plan.price,
        activationFee: plan.activationFee,
        recurring: true,
        optionals: [] as OptionalFeature[],
        benefits: plan.features,
        path: '/planos',
        kind: 'plan' as const,
      };
    }
    return null;
  }, [draft, service, plan]);

  const isDigital = useMemo(() => {
    if (!selection) return false;
    if (selection.kind === 'draft') return true;
    return DIGITAL_SLUGS.includes(selection.slug);
  }, [selection]);

  const [domain, setDomain] = useState('');
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const returnStatus = params.get('status');

  if (loadingDraft) {
    return (
      <main className="min-h-[70vh] bg-[#F4F8FC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1677FF]" />
      </main>
    );
  }

  if (!selection && !returnStatus) return <Navigate to="/solucoes" replace />;
  if (returnStatus) {
    return (
      <main className="min-h-[70vh] bg-[#F4F8FC] px-5 pb-20 pt-32">
        <Seo title="Status da contratação" description="Acompanhe o status da sua contratação Nextia." noindex />
        <div className="mx-auto max-w-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Check className="mx-auto h-12 w-12 text-[#1677FF]" />
          <h1 className="mt-5 text-3xl font-black">Pedido recebido</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {returnStatus === 'failure'
              ? 'O pagamento não foi concluído. Você pode tentar novamente em Meus pedidos.'
              : 'O Mercado Pago está processando o retorno. O status será atualizado automaticamente.'}
          </p>
          <Link to="/painel/pedidos" className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-[#1677FF] px-6 text-base font-bold text-white">
            Acompanhar pedido
          </Link>
        </div>
      </main>
    );
  }

  const submit = async () => {
    if (isDigital && !domain.trim()) {
      setError('Por favor, informe o domínio desejado para a configuração do seu projeto digital.');
      return;
    }
    if (!accepted) {
      setError('Confirme os termos da contratação para continuar.');
      return;
    }

    // Se o usuário não está logado, encaminha para cadastro preservando a URL de checkout
    if (!user) {
      const currentFullUrl = `${location.pathname}${location.search}`;
      navigate(`/cadastro?redirect=${encodeURIComponent(currentFullUrl)}${draftId ? `&draft=${draftId}` : ''}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const endpoint = selection!.kind === 'plan' ? '/api/commerce/plan-contracts' : '/api/commerce/orders';
      const bodyPayload = selection!.kind === 'plan'
        ? { planId: selection!.id, domain: domain.trim() }
        : selection!.kind === 'draft'
          ? { draftId: selection!.id, domain: domain.trim(), notes }
          : { serviceSlug: selection!.id, domain: domain.trim(), notes };

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar a contratação.');
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar contratação.');
      setLoading(false);
    }
  };

  const currentFullUrl = `${location.pathname}${location.search}`;

  return (
    <main className="min-h-screen bg-[#F4F8FC] px-5 pb-20 pt-28 sm:px-8">
      <Seo title={`Contratar ${selection!.name}`} description={`Checkout seguro para contratar ${selection!.name} com a Nextia.`} path={`/checkout?${selection!.kind}=${selection!.id}`} noindex />
      <div className="mx-auto max-w-5xl">
        <Link to={selection!.path} className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-slate-600">
          <ArrowLeft className="h-5 w-5" /> Voltar
        </Link>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.75fr]">
          <section className="border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-base font-bold text-[#1677FF]">Finalizar contratação</p>
            <h1 className="mt-2 text-3xl font-black">{selection!.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{selection!.summary}</p>

            {/* User Login/Registration Banner if unauthenticated */}
            {!user && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Identificação necessária para concluir o pedido</p>
                  <p className="mt-1 text-amber-800">
                    Você ainda não está conectado. Ao avançar, sua conta será criada/autenticada automaticamente para vincular o pedido.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link
                      to={`/cadastro?redirect=${encodeURIComponent(currentFullUrl)}${draftId ? `&draft=${draftId}` : ''}`}
                      className="font-bold text-[#1677FF] hover:underline"
                    >
                      Criar conta →
                    </Link>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(currentFullUrl)}`}
                      className="font-bold text-slate-700 hover:underline"
                    >
                      Já tenho conta (Entrar)
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Items Section if draft has optionals */}
            {selection!.kind === 'draft' && selection!.optionals.length > 0 && (
              <div className="mt-6 rounded-lg border border-[#1677FF]/20 bg-[#EAF3FF]/40 p-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#1677FF]" />
                  Recursos Opcionais Selecionados ({selection!.optionals.length})
                </h3>
                <ul className="mt-3 divide-y divide-slate-200/80">
                  {selection!.optionals.map((opt) => (
                    <li key={opt.id} className="py-2.5 flex justify-between items-center text-sm gap-2">
                      <div>
                        <p className="font-bold text-slate-800">{opt.name}</p>
                        <p className="text-xs text-slate-500">{opt.description}</p>
                      </div>
                      <div className="font-bold text-[#1677FF] text-right whitespace-nowrap ml-3">
                        {opt.monthlyPrice > 0 ? `+ ${money.format(opt.monthlyPrice)}/mês` : `+ ${money.format(opt.oneTimePrice)} taxa única`}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Field for Domain on Digital Services */}
            {isDigital && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <label htmlFor="checkout-domain" className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Globe className="h-5 w-5 text-[#1677FF]" />
                  Domínio para configuração <span className="text-xs text-red-500 font-normal">(obrigatório)</span>
                </label>
                <p className="mt-1 text-sm text-slate-600">
                  Informe o domínio onde seu site ou sistema será hospedado (ex: <code>meusite.com.br</code> ou <code>loja.com.br</code>).
                </p>
                <input
                  id="checkout-domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="ex: meusite.com.br"
                  className="mt-3 w-full rounded border border-slate-300 bg-white p-3 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#1677FF] focus:outline-none"
                />
              </div>
            )}

            {selection!.kind !== 'plan' && (
              <div className="mt-6">
                <label htmlFor="checkout-notes" className="text-base font-bold">
                  Observações para a equipe <span className="font-normal text-slate-500">(opcional)</span>
                </label>
                <textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="mt-2 w-full rounded border border-slate-300 p-4 text-base"
                  placeholder="Informe contexto, prazo ou necessidade específica."
                />
              </div>
            )}

            {selection!.kind === 'plan' && (
              <div className="mt-6 border border-blue-200 bg-blue-50 p-4 text-base leading-7 text-blue-900">
                A taxa de ativação é paga primeiro. Após a confirmação, o link para autorizar a mensalidade ficará disponível em Meus pedidos.
              </div>
            )}

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-5 w-5 accent-[#1677FF]"
              />
              <span className="text-base leading-7 text-slate-700">
                Confirmo que li o escopo padrão e autorizo a criação do pedido. Valores adicionais dependerão de aprovação.
              </span>
            </label>

            {error && (
              <div role="alert" className="mt-5 flex gap-2 border border-red-200 bg-red-50 p-4 text-base text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                {error}
              </div>
            )}
          </section>

          <aside className="h-max border-t-4 border-[#D6A84B] bg-[#07162B] p-6 text-white sm:p-8">
            <h2 className="text-xl font-black">Resumo do Pedido</h2>

            <div className="mt-6 border-y border-white/15 py-5 space-y-4">
              {selection!.activationFee > 0 && (
                <div>
                  <p className="text-sm text-slate-300">Taxa de ativação / Projeto total</p>
                  <p className="text-2xl font-black text-[#D6A84B]">{money.format(selection!.activationFee)}</p>
                </div>
              )}
              {selection!.price > 0 && (
                <div>
                  <p className="text-sm text-slate-300">{selection!.recurring ? 'Mensalidade total' : 'Pagamento único total'}</p>
                  <p className="mt-1 text-3xl font-black">
                    {money.format(selection!.price)}
                    {selection!.recurring && <span className="text-base font-semibold text-slate-300">/mês</span>}
                  </p>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-3">
              {selection!.benefits.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-2 text-base">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#35B7FF]" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={submit}
              disabled={loading}
              className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-5 text-lg font-bold disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
              {loading
                ? 'Preparando pagamento...'
                : !user
                  ? 'Entrar / Cadastrar para pagar'
                  : selection!.kind === 'plan'
                    ? 'Pagar ativação'
                    : selection!.recurring
                      ? 'Continuar para assinatura'
                      : 'Continuar para pagamento'}
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-300">
              <Lock className="h-4 w-4" /> Pagamento processado pelo Mercado Pago
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
