import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe,
  Link2,
  MapPin,
  MessageCircle,
  Palette,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import BioPhoneMockup, { type BioDemoProfile } from '../components/bio/BioPhoneMockup';
import {
  NEXTIA_BIO_FAQ,
  NEXTIA_BIO_FEATURES,
  NEXTIA_BIO_OPTIONALS,
  NEXTIA_BIO_PLANS,
  type NextiaBioPlan,
} from '../data/nextiaBio';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const FEATURE_ICONS = {
  UserCheck,
  MessageCircle,
  Share2,
  Link2,
  ShoppingBag,
  MapPin,
  Palette,
  QrCode,
  Smartphone,
} as const;

const DOMAIN_EXTENSIONS = ['.com.br', '.com', '.net.br', '.online', '.store'] as const;

const HERO_NEXTIA_DEMO: BioDemoProfile = {
  initials: 'NX',
  brand: 'Nextia Tecnologia',
  subtitle: 'Sites, Lojas Virtuais, Nextia Bio & Automação com IA',
  bioUrl: 'https://bio.nextia.dev.br',
  gradient: 'from-[#0F2A56] to-[#1677FF]',
  whatsappHref: 'https://wa.me/5511999999999',
  ctaLabel: 'Falar com a Nextia no WhatsApp',
  phone: '(11) 99999-9999',
  email: 'contato@nextia.dev.br',
  address: 'Atendimento em todo o Brasil · 100% online',
  hours: 'Seg–Sex · 08h às 18h',
  socials: ['@nextia.dev.br', 'LinkedIn', 'YouTube'],
  galleryColors: ['bg-[#1677FF]', 'bg-[#0F2A56]', 'bg-cyan-600'],
  items: [
    { id: 'bio-start', title: 'Nextia Bio Start', price: 59 },
    { id: 'bio-pro', title: 'Nextia Bio Pro', price: 99 },
  ],
  links: ['Conhecer Nextia Bio', 'Ver modelos de sites', 'Solicitar orçamento'],
  chatbotGreeting: 'Olá! Sou o assistente da Nextia. Posso ajudar você a escolher seu plano ideal?',
};

const SEGMENT_DEMOS: BioDemoProfile[] = [
  {
    segment: 'Estética & Beleza',
    initials: 'SB',
    brand: 'Studio Bella Forma',
    subtitle: 'Estética & Bem-estar · Atendimento com hora marcada',
    bioUrl: 'https://bio.nextia.dev.br/studiobellaforma',
    gradient: 'from-[#0F2A56] to-[#1677FF]',
    whatsappHref: 'https://wa.me/5511999999999',
    ctaLabel: 'Agendar pelo WhatsApp',
    phone: '(11) 98888-1122',
    email: 'contato@studiobellaforma.com.br',
    address: 'Av. Paulista, 1200 · São Paulo/SP',
    hours: 'Seg–Sáb · 09h às 19h',
    socials: ['@studiobellaforma', 'Facebook', 'TikTok'],
    galleryColors: ['bg-rose-500', 'bg-pink-600', 'bg-fuchsia-600'],
    items: [
      { id: 'limpeza', title: 'Limpeza de Pele', price: 140 },
      { id: 'spa', title: 'Combo Spa', price: 220 },
    ],
    links: ['Agendar horário online', 'Ver localização no mapa'],
    chatbotGreeting: 'Olá! Quer verificar os horários disponíveis para hoje no Studio?',
  },
  {
    segment: 'Gastronomia & Delivery',
    initials: 'BR',
    brand: 'Bistrô da Praça',
    subtitle: 'Cardápio artesanal · Delivery e reservas',
    bioUrl: 'https://bio.nextia.dev.br/bistrodapraca',
    gradient: 'from-slate-900 to-amber-600',
    whatsappHref: 'https://wa.me/5511999999999',
    ctaLabel: 'Pedir no WhatsApp',
    phone: '(11) 97777-3344',
    email: 'pedidos@bistrodapraca.com.br',
    address: 'Rua das Flores, 450 · Centro',
    hours: 'Ter–Dom · 11h às 23h',
    socials: ['@bistrodapraca', 'iFood', 'Instagram'],
    galleryColors: ['bg-amber-600', 'bg-orange-600', 'bg-red-600'],
    items: [
      { id: 'executivo', title: 'Prato Executivo', price: 38.9 },
      { id: 'familia', title: 'Combo Família', price: 89 },
    ],
    links: ['Ver cardápio completo', 'Reservar mesa'],
    chatbotGreeting: 'Bem-vindo ao Bistrô! Deseja fazer um pedido para entrega ou reservar mesa?',
  },
  {
    segment: 'Saúde & Serviços',
    initials: 'CV',
    brand: 'Clínica Vida Plena',
    subtitle: 'Fisioterapia & Pilates · Avaliação personalizada',
    bioUrl: 'https://bio.nextia.dev.br/clinicavidaplena',
    gradient: 'from-emerald-900 to-teal-600',
    whatsappHref: 'https://wa.me/5511999999999',
    ctaLabel: 'Falar com a recepção',
    phone: '(11) 96666-5566',
    email: 'recepcao@clinicavidaplena.com.br',
    address: 'Rua da Saúde, 88 · Sala 302',
    hours: 'Seg–Sex · 07h às 20h',
    socials: ['@clinicavidaplena', 'LinkedIn'],
    galleryColors: ['bg-emerald-600', 'bg-teal-600', 'bg-cyan-700'],
    items: [
      { id: 'avaliacao', title: 'Avaliação Postural', price: 120 },
      { id: 'pilates', title: 'Plano Mensal Pilates', price: 290 },
    ],
    links: ['Conhecer especialidades', 'Como chegar na clínica'],
    chatbotGreeting: 'Olá! Posso ajudar a agendar sua avaliação ou tirar dúvidas sobre convênios?',
  },
];

function normalizeDomainInput(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9.-]/g, '');
}

export default function NextiaBioPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanId, setSelectedPlanId] = useState<NextiaBioPlan['id']>('pro');
  const [selectedOptionals, setSelectedOptionals] = useState<string[]>([]);
  const [domainQuery, setDomainQuery] = useState('');
  const [subdomainSlug, setSubdomainSlug] = useState('');
  const [domainExtension, setDomainExtension] = useState<(typeof DOMAIN_EXTENSIONS)[number]>('.com.br');
  const [domainMode, setDomainMode] = useState<'subdomain' | 'register' | 'connect'>('subdomain');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'available' | 'invalid'>('idle');
  const [checkedDomain, setCheckedDomain] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedPlan = useMemo(
    () => NEXTIA_BIO_PLANS.find((plan) => plan.id === selectedPlanId) ?? NEXTIA_BIO_PLANS[1],
    [selectedPlanId]
  );

  const toggleOptional = (code: string) => {
    setSelectedOptionals((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const handleCheckDomain = () => {
    const cleaned = normalizeDomainInput(domainQuery);
    if (!cleaned || cleaned.length < 2) {
      setDomainStatus('invalid');
      setCheckedDomain('');
      return;
    }
    const fullDomain = cleaned.includes('.') ? cleaned : `${cleaned}${domainExtension}`;
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(fullDomain)) {
      setDomainStatus('invalid');
      setCheckedDomain('');
      return;
    }
    setCheckedDomain(fullDomain);
    setDomainStatus('available');
    if (domainMode === 'register' && !selectedOptionals.includes('domain-registration')) {
      setSelectedOptionals((prev) => [...prev, 'domain-registration']);
    }
  };

  const activeOptionals = useMemo(
    () =>
      NEXTIA_BIO_OPTIONALS.filter(
        (opt) => selectedOptionals.includes(opt.code) && opt.compatiblePlans.includes(selectedPlan.id)
      ),
    [selectedOptionals, selectedPlan.id]
  );

  const planMonthlyPrice =
    billingCycle === 'annual' ? selectedPlan.annualMonthlyPrice : selectedPlan.monthlyPrice;

  const monthlyAddonsTotal = activeOptionals
    .filter((opt) => opt.billingType === 'monthly')
    .reduce((sum, opt) => sum + opt.price, 0);

  const oneTimeAddonsTotal = activeOptionals
    .filter((opt) => opt.billingType === 'one_time' || opt.billingType === 'annual')
    .reduce((sum, opt) => sum + opt.price, 0);

  const handleProceedToCheckout = (planIdOverride?: NextiaBioPlan['id']) => {
    const targetPlanId = planIdOverride ?? selectedPlan.id;
    const targetPlan = NEXTIA_BIO_PLANS.find((p) => p.id === targetPlanId) ?? selectedPlan;
    const compatibleCodes = selectedOptionals.filter((code) => {
      const opt = NEXTIA_BIO_OPTIONALS.find((item) => item.code === code);
      return opt ? opt.compatiblePlans.includes(targetPlan.id) : false;
    });

    const query = new URLSearchParams({
      service: 'nextia-bio',
      plan: targetPlan.id,
      billing: billingCycle,
    });
    if (compatibleCodes.length > 0) {
      query.set('options', compatibleCodes.join(','));
    }
    if (checkedDomain && targetPlan.limits.customDomain && domainMode !== 'subdomain') {
      query.set('domain', checkedDomain);
      query.set('domainMode', domainMode);
    }
    navigate(`/checkout?${query.toString()}`);
  };

  return (
    <div className="bg-white text-slate-900">
      <Seo
        title="Nextia Bio — Sua página profissional de presença digital"
        description="Seu negócio merece mais do que um link. Crie sua página profissional com o Nextia Bio, divulgue produtos e serviços e receba clientes pelo WhatsApp."
        path="/nextia-bio"
      />

      {/* SEÇÃO 1 — HERO / APRESENTAÇÃO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF3FF] via-white to-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1677FF]/20 bg-white px-4 py-1.5 text-sm font-semibold text-[#1677FF] shadow-xs">
              <Sparkles className="h-4 w-4" />
              Nextia Bio · Presença digital profissional
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Seu negócio merece mais do que um link.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Crie sua página profissional com o Nextia Bio. Apresente seu negócio, divulgue seus
              serviços, conecte suas redes sociais e transforme visitantes em oportunidades de venda.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#planos"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1677FF] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#1677FF]/25 transition hover:bg-[#0F5FD6]"
              >
                Quero meu Nextia Bio
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-slate-800 transition hover:border-[#1677FF] hover:text-[#1677FF]"
              >
                Conhecer os planos
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                'Fácil de compartilhar',
                'Personalizável',
                'Ideal para negócios',
                'Acesso pelo celular',
              ].map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#1677FF]" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup realista de smartphone - Nextia em produção */}
          <div className="lg:col-span-5">
            <BioPhoneMockup profile={HERO_NEXTIA_DEMO} />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 — COMO FUNCIONA */}
      <section id="como-funciona" className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1677FF]">
              Simples e rápido
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Como funciona o Nextia Bio
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Em três etapas você coloca sua presença digital profissional no ar.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Escolha seu plano',
                description:
                  'Selecione o plano Start, Pro ou Premium de acordo com o momento do seu negócio e adicione opcionais se desejar.',
              },
              {
                step: '02',
                title: 'Personalize sua página',
                description:
                  'Configure suas informações comerciais, foto ou logotipo, identidade visual, links e catálogo de produtos ou serviços.',
              },
              {
                step: '03',
                title: 'Compartilhe e receba clientes',
                description:
                  'Divulgue seu link ou QR Code nas redes sociais, WhatsApp e materiais impressos para transformar visitas em contatos.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition hover:border-[#1677FF]/40 hover:shadow-md"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FF] text-base font-black text-[#1677FF]">
                  {item.step}
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-slate-900">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — FUNCIONALIDADES */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1677FF]">
              Recursos pensados para conversão
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Tudo o que seu negócio precisa em um só lugar
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NEXTIA_BIO_FEATURES.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon];
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-[#1677FF]/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#1677FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3.5 — MODELOS DE DEMONSTRAÇÃO POR SEGMENTO */}
      <section className="border-t border-slate-100 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1677FF]">
              Exemplos reais por segmento
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Veja o Nextia Bio funcionando no celular
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Três modelos de demonstração para segmentos importantes, prontos para apresentar seu negócio e converter visitantes.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {SEGMENT_DEMOS.map((demo) => (
              <div key={demo.segment} className="flex flex-col items-center">
                <span className="mb-4 inline-flex items-center rounded-full bg-[#EAF3FF] px-3.5 py-1 text-xs font-bold text-[#1677FF]">
                  {demo.segment}
                </span>
                <BioPhoneMockup profile={demo} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — PLANOS DE ASSINATURA */}
      <section id="planos" className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1677FF]">
              Planos de assinatura
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Escolha o plano ideal para o seu negócio
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Valores transparentes e contratação integrada ao checkout oficial da Nextia.
            </p>

            {/* Seletor Mensal / Anual */}
            <div className="mt-6 inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1677FF] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cobrança mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  billingCycle === 'annual'
                    ? 'bg-[#1677FF] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plano anual <span className="ml-1 text-xs opacity-90">(economize até 17%)</span>
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {NEXTIA_BIO_PLANS.map((plan) => {
              const price = billingCycle === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm transition ${
                    plan.highlight
                      ? 'border-[#1677FF] ring-2 ring-[#1677FF]/20'
                      : isSelected
                        ? 'border-slate-900'
                        : 'border-slate-200'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 right-6 rounded-full bg-[#1677FF] px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">{plan.tagline}</p>

                  <div className="mt-6 border-y border-slate-100 py-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">
                        {money.format(price)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">/mês</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Taxa de ativação: {money.format(plan.activationFee)}
                    </p>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1677FF]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 grid gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleProceedToCheckout(plan.id)}
                      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                        plan.highlight
                          ? 'bg-[#1677FF] text-white hover:bg-[#0F5FD6]'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {plan.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        document.getElementById('opcionais')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:border-[#1677FF] hover:text-[#1677FF]"
                    >
                      {isSelected ? 'Selecionado para personalizar' : 'Personalizar com opcionais'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabela comparativa */}
          <div className="mt-14 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-900">Comparativo de recursos</th>
                  {NEXTIA_BIO_PLANS.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 font-extrabold text-slate-900">
                      {plan.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-700">Links personalizados</td>
                  {NEXTIA_BIO_PLANS.map((p) => (
                    <td key={p.id} className="px-6 py-3.5 text-slate-600">{p.limits.links}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-700">Catálogo de produtos e serviços</td>
                  {NEXTIA_BIO_PLANS.map((p) => (
                    <td key={p.id} className="px-6 py-3.5 text-slate-600">{p.limits.products}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-700">Seções de conteúdo</td>
                  {NEXTIA_BIO_PLANS.map((p) => (
                    <td key={p.id} className="px-6 py-3.5 text-slate-600">{p.limits.sections}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-700">Domínio próprio (opcional)</td>
                  {NEXTIA_BIO_PLANS.map((p) => (
                    <td key={p.id} className="px-6 py-3.5">
                      {p.limits.customDomain ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 — OPCIONAIS E SERVIÇOS ADICIONAIS */}
      <section id="opcionais" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1677FF]">
              Complementos sob medida
            </span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Personalize seu Nextia Bio com recursos adicionais.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Plano selecionado: <strong>{selectedPlan.name}</strong>. Adicione apenas os opcionais que fazem sentido para o seu momento.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {/* Opcional 1: Domínio personalizado com busca */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#1677FF]" />
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Domínio personalizado
                      </h3>
                      <span className="rounded-full bg-[#EAF3FF] px-2.5 py-0.5 text-xs font-bold text-[#1677FF]">
                        Mais escolhido
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">
                      Você pode usar gratuitamente o subdomínio da Nextia (ex: suaempresa.nextia.dev.br) ou contratar/apontar um domínio próprio (ex: www.suaempresa.com.br) usando o sistema oficial da Nextia.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      {domainMode === 'subdomain' ? 'Grátis' : money.format(NEXTIA_BIO_OPTIONALS[0].price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {domainMode === 'subdomain' ? 'subdomínio Nextia' : 'pagamento anual'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setDomainMode('subdomain');
                        setSelectedOptionals((prev) => prev.filter((item) => item !== 'domain-registration'));
                      }}
                      className={`rounded-lg px-3 py-1.5 ${
                        domainMode === 'subdomain'
                          ? 'bg-[#1677FF] text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Subdomínio Nextia (Grátis)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDomainMode('register')}
                      disabled={!selectedPlan.limits.customDomain}
                      className={`rounded-lg px-3 py-1.5 ${
                        domainMode === 'register'
                          ? 'bg-[#1677FF] text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      } ${!selectedPlan.limits.customDomain ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      Registrar domínio próprio
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDomainMode('connect');
                        setSelectedOptionals((prev) => prev.filter((item) => item !== 'domain-registration'));
                      }}
                      disabled={!selectedPlan.limits.customDomain}
                      className={`rounded-lg px-3 py-1.5 ${
                        domainMode === 'connect'
                          ? 'bg-[#1677FF] text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      } ${!selectedPlan.limits.customDomain ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      Já tenho domínio (apontar)
                    </button>
                  </div>

                  {domainMode === 'subdomain' ? (
                    <div className="space-y-2">
                      <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-[#1677FF]">
                        <input
                          type="text"
                          value={subdomainSlug}
                          onChange={(e) => setSubdomainSlug(normalizeDomainInput(e.target.value).replace(/\./g, ''))}
                          placeholder="nomedasuaempresa"
                          aria-label="Nome da empresa no subdomínio Nextia"
                          className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                        />
                        <span className="border-l border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-bold text-slate-700">
                          .nextia.dev.br
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-700">
                        Subdomínio grátis da Nextia selecionado por padrão (sem custo adicional):{' '}
                        <strong>https://{subdomainSlug || 'suaempresa'}.nextia.dev.br</strong>.{' '}
                        {!selectedPlan.limits.customDomain && 'Para usar domínio próprio, selecione o Plano Pro ou Premium.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={domainQuery}
                          onChange={(e) => setDomainQuery(e.target.value)}
                          placeholder="Digite o nome da sua empresa"
                          aria-label="Pesquisar domínio"
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#1677FF] focus:outline-none"
                        />
                        <select
                          value={domainExtension}
                          onChange={(e) =>
                            setDomainExtension(e.target.value as (typeof DOMAIN_EXTENSIONS)[number])
                          }
                          aria-label="Extensão do domínio"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold"
                        >
                          {DOMAIN_EXTENSIONS.map((ext) => (
                            <option key={ext} value={ext}>
                              {ext}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleCheckDomain}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                        >
                          <Search className="h-4 w-4" />
                          Consultar
                        </button>
                      </div>

                      {domainStatus === 'available' && checkedDomain && (
                        <p className="text-xs font-semibold text-emerald-700">
                          Domínio <strong>{checkedDomain}</strong> selecionado para{' '}
                          {domainMode === 'register' ? 'registro' : 'apontamento'} no checkout.
                        </p>
                      )}
                      {domainStatus === 'invalid' && (
                        <p className="text-xs font-semibold text-rose-600">
                          Informe um nome de domínio válido (mínimo 2 caracteres).
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Demais opcionais */}
              {NEXTIA_BIO_OPTIONALS.slice(1).map((opt) => {
                const compatible = opt.compatiblePlans.includes(selectedPlan.id);
                const checked = selectedOptionals.includes(opt.code);
                return (
                  <label
                    key={opt.code}
                    className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-6 shadow-xs transition ${
                      !compatible
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                        : checked
                          ? 'border-[#1677FF] bg-[#EAF3FF]/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        disabled={!compatible}
                        checked={checked && compatible}
                        onChange={() => toggleOptional(opt.code)}
                        className="mt-1 h-4 w-4 accent-[#1677FF]"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900">{opt.name}</span>
                          {opt.badge && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{opt.description}</p>
                        {!compatible && (
                          <p className="mt-1 text-xs font-semibold text-amber-700">
                            Disponível nos planos Pro e Premium.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-slate-900">{money.format(opt.price)}</p>
                      <p className="text-xs text-slate-500">{opt.billingLabel}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Resumo da contratação */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  <ShieldCheck className="h-4 w-4" />
                  Resumo da contratação
                </div>
                <h3 className="mt-2 text-2xl font-black">{selectedPlan.name}</h3>
                <p className="text-xs text-slate-300">
                  Ciclo {billingCycle === 'annual' ? 'anual' : 'mensal'} · Checkout oficial Nextia
                </p>

                <div className="mt-6 space-y-3 border-y border-slate-700 py-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Assinatura do plano</span>
                    <strong>{money.format(planMonthlyPrice)}/mês</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Taxa de ativação</span>
                    <strong>{money.format(selectedPlan.activationFee)}</strong>
                  </div>
                  {activeOptionals.map((opt) => (
                    <div key={opt.code} className="flex justify-between text-xs text-cyan-100">
                      <span>{opt.name}</span>
                      <strong>{money.format(opt.price)}</strong>
                    </div>
                  ))}
                  {checkedDomain && selectedPlan.limits.customDomain && domainMode !== 'subdomain' && (
                    <div className="flex justify-between text-xs text-emerald-300">
                      <span>Domínio: {checkedDomain}</span>
                      <span>{domainMode === 'register' ? 'Registro' : 'Apontamento'}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total mensal estimado</span>
                    <strong className="text-lg text-white">
                      {money.format(planMonthlyPrice + monthlyAddonsTotal)}/mês
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Ativação + itens avulsos</span>
                    <span>{money.format(selectedPlan.activationFee + oneTimeAddonsTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProceedToCheckout()}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0F5FD6]"
                >
                  Continuar para contratação
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — FAQ */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Perguntas frequentes
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Tire suas dúvidas sobre planos, domínio, personalização e contratação.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {NEXTIA_BIO_FAQ.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-bold text-slate-900"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition ${
                        isOpen ? 'rotate-180 text-[#1677FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 py-4 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#0F2A56] py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-black sm:text-4xl">
            Comece hoje a construir sua presença digital.
          </h2>
          <p className="mt-4 text-base text-blue-100">
            Escolha seu plano no Nextia Bio e tenha uma página profissional pronta para converter visitantes em clientes.
          </p>
          <a
            href="#planos"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1677FF] px-7 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#35B7FF]"
          >
            Escolher meu plano
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
