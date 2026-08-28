import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  AtSign,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  Gauge,
  Headphones,
  HelpCircle,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { getLocalServiceData } from '../../data/localServices';
import { templates } from '../../data/templates';
import { TemplateIllustration } from '../templates/TemplateIllustration';
import { getWhatsAppLink, trackEvent } from '../../utils/whatsapp';
import { getLocalNicheServiceData } from '../../data/localNicheServices';

interface LocalServiceLandingPageProps {
  citySlug: string;
  serviceSlug: string;
}

export default function LocalServiceLandingPage({ citySlug, serviceSlug }: LocalServiceLandingPageProps) {
  const serviceData = getLocalServiceData(citySlug, serviceSlug);
  const formId = useId();

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    service: serviceData ? serviceData.formServiceValue : 'Criação de Site',
    message: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 pt-28 pb-16">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black text-[#10152B]">Serviço Local Não Encontrado</h1>
          <p className="mt-3 text-slate-600">
            A combinação de cidade e serviço informada não foi localizada. Conheça todas as soluções da Nextia!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/${citySlug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 hover:bg-slate-200"
            >
              Ver página de {citySlug}
            </Link>
            <Link
              to="/solucoes"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563FF] px-6 py-3 font-bold text-white shadow-md hover:bg-[#1D4ED8]"
            >
              Ver Todas as Soluções <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/${serviceData.citySlug}/${serviceData.serviceSlug}`;
  const cityUrl = `${baseUrl}/${serviceData.citySlug}`;

  // Benefit icons map
  const benefitIcons: Record<string, React.ReactNode> = {
    zap: <Zap className="h-6 w-6 text-[#2563FF]" />,
    smartphone: <Smartphone className="h-6 w-6 text-[#9147FF]" />,
    search: <Search className="h-6 w-6 text-[#10B981]" />,
    'message-circle': <MessageCircle className="h-6 w-6 text-[#FF7A21]" />,
    gauge: <Gauge className="h-6 w-6 text-[#13BBD4]" />,
    target: <Target className="h-6 w-6 text-[#2563FF]" />,
    'shield-check': <ShieldCheck className="h-6 w-6 text-[#10B981]" />,
    cpu: <Cpu className="h-6 w-6 text-[#6366F1]" />,
    clock: <Clock className="h-6 w-6 text-[#FF7A21]" />,
    lock: <Lock className="h-6 w-6 text-[#10B981]" />,
    database: <Database className="h-6 w-6 text-[#6366F1]" />,
    headphones: <Headphones className="h-6 w-6 text-[#FF7A21]" />,
    'shopping-bag': <ShoppingBag className="h-6 w-6 text-[#9147FF]" />,
  };

  // Differential icons map
  const differentialIcons: Record<string, React.ReactNode> = {
    bot: <Bot className="h-6 w-6 text-[#10B981]" />,
    headphones: <Headphones className="h-6 w-6 text-[#FF7A21]" />,
    'shopping-bag': <ShoppingBag className="h-6 w-6 text-[#9147FF]" />,
    database: <Database className="h-6 w-6 text-[#6366F1]" />,
    'shield-check': <ShieldCheck className="h-6 w-6 text-[#10B981]" />,
    'message-circle': <MessageCircle className="h-6 w-6 text-[#2563FF]" />,
    lock: <Lock className="h-6 w-6 text-[#6366F1]" />,
    layers: <Layers className="h-6 w-6 text-[#2563FF]" />,
    target: <Target className="h-6 w-6 text-[#9147FF]" />,
    zap: <Zap className="h-6 w-6 text-[#10B981]" />,
    code: <Code2 className="h-6 w-6 text-[#2563FF]" />,
  };

  // Schema JSON-LD
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nextia',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    telephone: '+5514996405496',
    sameAs: ['https://instagram.com/nextia.dev'],
    taxID: '57.285.901/0001-94',
  };

  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceData.schemaServiceType,
    name: `${serviceData.serviceCategoryName} em ${serviceData.cityName}`,
    description: serviceData.metaDescription,
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: 'Nextia',
      url: baseUrl,
      telephone: '+5514996405496',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${serviceData.cityName}, SP, Brasil`,
    },
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: serviceData.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: serviceData.cityName,
        item: cityUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: serviceData.serviceCategoryName,
        item: canonicalUrl,
      },
    ],
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setFormError('Por favor, preencha nome, e-mail e WhatsApp.');
      return;
    }

    setFormSubmitting(true);
    trackEvent('lead_form_submit_attempt', {
      city: serviceData.citySlug,
      service: serviceData.serviceSlug,
    });

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: formData.service,
          segment: formData.company || `Empresa em ${serviceData.cityName}`,
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.whatsapp,
          contact_company: formData.company,
          city: serviceData.cityName,
          notes: `Origem: ${serviceData.leadSource} | Serviço solicitado: ${formData.service} | Mensagem: ${formData.message || 'Sem mensagem adicional'}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Não foi possível registrar o orçamento.');
      }

      trackEvent('lead_submission', {
        city: serviceData.citySlug,
        service: serviceData.serviceSlug,
      });
      setFormSuccess(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Ocorreu um erro ao enviar sua solicitação. Tente novamente ou chame no WhatsApp.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleWhatsappClick = (source: string) => {
    trackEvent('whatsapp_click', {
      city: serviceData.citySlug,
      service: serviceData.serviceSlug,
      source,
    });
  };

  const isTemplateShowcaseService =
    serviceData.serviceSlug === 'criacao-de-sites' || serviceData.serviceSlug === 'loja-virtual';

  return (
    <main className="bg-white text-[#10152B] selection:bg-[#2563FF]/20 selection:text-[#2563FF]">
      <Helmet>
        <title>{serviceData.metaTitle}</title>
        <meta name="description" content={serviceData.metaDescription} />
        <meta name="keywords" content={serviceData.keywords.join(', ')} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={serviceData.metaTitle} />
        <meta property="og:description" content={serviceData.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Nextia" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={serviceData.metaTitle} />
        <meta name="twitter:description" content={serviceData.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaService)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFaq)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumbs)}</script>
      </Helmet>

      {/* 1. BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-[#FBFBFE] pt-24 pb-3">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap py-1">
            <li>
              <Link to="/" className="hover:text-[#2563FF] transition-colors font-medium">
                Início
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </li>
            <li>
              <Link to={`/${serviceData.citySlug}`} className="hover:text-[#2563FF] transition-colors font-medium">
                {serviceData.cityName}
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </li>
            <li aria-current="page" className="font-bold text-[#10152B]">
              {serviceData.serviceCategoryName}
            </li>
          </ol>
        </div>
      </nav>

      {/* 2. HERO SECTION (5-Second Rule) */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F9FF_55%,#EEF2FF_100%)] pt-8 pb-16 lg:pt-12 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_80%_20%,rgba(117,58,255,.14),transparent_35%),radial-gradient(circle_at_15%_75%,rgba(37,99,255,.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            {/* Local Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2563FF]/20 bg-white/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#2563FF] shadow-sm backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-[#2563FF]" />
              <span>{serviceData.hero.badge}</span>
            </div>

            {/* H1 Principal */}
            <h1 className="text-[32px] sm:text-4xl lg:text-[50px] font-black leading-[1.1] tracking-[-.04em] text-[#10152B]">
              {serviceData.hero.h1}
              <span className="bg-gradient-to-r from-[#2563FF] via-[#753AFF] to-[#9147FF] bg-clip-text text-transparent">
                {serviceData.hero.h1Highlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#4A5568]">
              {serviceData.hero.subtitle}
            </p>

            {/* Primary & WhatsApp CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={serviceData.hero.ctaPrimaryAnchor}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-7 text-base font-black text-white shadow-lg shadow-[#753AFF]/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#753AFF]/30"
              >
                {serviceData.hero.ctaPrimaryText} <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={getWhatsAppLink('geral', serviceData.hero.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleWhatsappClick('hero')}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-[#2563FF]/30 bg-white px-7 text-base font-bold text-[#2563FF] shadow-sm transition-all duration-200 hover:bg-[#F4F8FF] hover:border-[#2563FF]"
              >
                <MessageCircle className="h-5 w-5 text-[#10B981]" />
                Falar pelo WhatsApp
              </a>
            </div>

            <div className="mt-4">
              <a
                href={serviceData.hero.ctaSecondaryAnchor}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#2563FF] transition-colors"
              >
                {serviceData.hero.ctaSecondaryText} <ChevronDown className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Trust Highlights */}
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {serviceData.hero.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Hero Element */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#2563FF]/15 to-[#9147FF]/20 blur-2xl" />
            <div className="relative rounded-3xl border border-white/80 bg-white/70 p-4 sm:p-5 shadow-[0_25px_70px_rgba(37,99,255,.14)] backdrop-blur">
              {isTemplateShowcaseService ? (
                <div className="rounded-2xl bg-[#0B0F19] p-2 sm:p-3 shadow-inner">
                  <div className="overflow-hidden rounded-xl">
                    <TemplateIllustration
                      category={serviceData.serviceSlug === 'loja-virtual' ? 'loja-catalogo' : 'restaurante'}
                      slug={serviceData.serviceSlug === 'loja-virtual' ? 'loja-catalogo' : 'restaurante-premium'}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-[#0B0F19] to-[#1E1B4B] p-6 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">nextia-{serviceData.serviceSlug}</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-3 w-3/4 rounded bg-white/20" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                    <div className="h-3 w-5/6 rounded bg-gradient-to-r from-[#2563FF] to-[#753AFF]" />
                  </div>
                  <div className="mt-8 rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-xs text-slate-300 font-mono">
                      // Status: Operacional em {serviceData.cityName}/SP
                    </p>
                    <p className="text-xs font-bold text-[#10B981] mt-1 font-mono">
                      ✓ Atendimento ativo para empresas locais
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  {serviceData.serviceCategoryName} em {serviceData.cityName}/SP
                </span>
                <span className="text-slate-400">Nextia Oficial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENEFITS SECTION */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Vantagens Principais
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {serviceData.benefitsTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {serviceData.benefitsSubtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceData.benefits.map((b, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-[#FBFBFE] p-6 shadow-sm transition hover:border-[#2563FF]/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                  {benefitIcons[b.iconName] || <Zap className="h-6 w-6 text-[#2563FF]" />}
                </div>
                <h3 className="mt-4 text-lg font-black text-[#10152B]">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROBLEM -> SOLUTION */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#FF7A21]">
              Problema & Solução
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {serviceData.problemSolution.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {serviceData.problemSolution.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Problems */}
            <div className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50/50 to-white p-7 sm:p-9 shadow-sm">
              <h3 className="text-xl font-black text-red-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 text-sm font-bold">✕</span>
                Dores Frequentes em {serviceData.cityName}
              </h3>
              <div className="mt-6 space-y-4">
                {serviceData.problemSolution.problemList.map((prob, pIdx) => (
                  <div key={pIdx} className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm">{prob.title}</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-7 sm:p-9 shadow-sm">
              <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
                A Resposta da Nextia
              </h3>
              <div className="mt-6 space-y-4">
                {serviceData.problemSolution.solutionList.map((sol, sIdx) => (
                  <div key={sIdx} className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm">{sol.title}</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{sol.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SERVICE MODALITIES / FORMATS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#753AFF]">
              Modalidades & Formatos
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {serviceData.modalitiesTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {serviceData.modalitiesSubtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {serviceData.modalities.map((mod, mIdx) => (
              <div
                key={mIdx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-[#FBFBFE] p-7 sm:p-8 shadow-sm transition hover:border-[#2563FF]/40 hover:shadow-md"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563FF] bg-[#EEF2FF] px-3 py-1 rounded-full">
                    {mod.tagline}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-[#10152B]">{mod.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{mod.description}</p>

                  <ul className="mt-5 space-y-2 border-t border-slate-200/80 pt-4">
                    {mod.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
                  <strong>Recomendado para:</strong> {mod.recommendedFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TARGET SEGMENTS */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Segmentos Atendidos
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {serviceData.segmentsTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {serviceData.segmentsSubtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceData.segments.map((seg, sIdx) => {
              // Check if a niche page exists for this segment + current service in this city
              const segSlug = seg.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
              const nicheData = getLocalNicheServiceData(serviceData.citySlug, segSlug, serviceData.serviceSlug);
              const nicheLink = nicheData?.status === 'published' ? `/${serviceData.citySlug}/${nicheData.segmentSlug}/${nicheData.serviceSlug}` : null;

              const card = (
                <div
                  key={sIdx}
                  className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563FF]/30 hover:shadow-md${nicheLink ? ' cursor-pointer' : ''}`}
                >
                  <span className="text-2xl">{seg.icon}</span>
                  <h3 className="mt-2 text-base font-bold text-[#10152B]">{seg.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{seg.desc}</p>
                  {nicheLink && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#2563FF]">
                      Ver solução específica <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              );

              return nicheLink ? <Link key={sIdx} to={nicheLink} className="block">{card}</Link> : card;
            })}
          </div>
        </div>
      </section>

      {/* 7. TEMPLATES SHOWCASE (Only for sites & loja virtual) */}
      {isTemplateShowcaseService && (
        <section id="modelos-sites" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
                Modelos de Alta Conversão
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
                Escolha um Estilo Profissional para Começar em {serviceData.cityName}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                Estruturas visuais testadas que adaptamos com a identidade e os dados da sua empresa:
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {templates.slice(0, 8).map((tpl) => (
                <article
                  key={tpl.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden border-b border-slate-100 bg-[#0B0F19]">
                    <TemplateIllustration category={tpl.categorySlug} slug={tpl.slug} />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#2563FF] uppercase tracking-wider">
                        {tpl.category}
                      </span>
                      <h3 className="mt-1 text-base font-black text-[#10152B]">{tpl.name}</h3>
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{tpl.shortDescription}</p>
                    </div>
                    <div className="mt-5 space-y-2">
                      <Link
                        to={`/demo/${tpl.slug}`}
                        className="flex min-h-10 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        Ver demonstração
                      </Link>
                      <Link
                        to={`/checkout?service=sites-prontos&template=${tpl.slug}&plan=pro`}
                        className="flex min-h-10 w-full items-center justify-center rounded-xl bg-[#2563FF] text-xs font-bold text-white hover:bg-[#1D4ED8] transition-colors"
                      >
                        Quero este modelo
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. HOW IT WORKS */}
      <section id="como-funciona" className="py-20 bg-[#FBFBFE]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#753AFF]">
              Processo de Atendimento
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {serviceData.howItWorksTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {serviceData.howItWorksSubtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {serviceData.howItWorks.map((step, idx) => (
              <article
                key={idx}
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-sm font-black text-[#2563FF]">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base font-black text-[#10152B]">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 flex-1">{step.desc}</p>
                {idx < serviceData.howItWorks.length - 1 && (
                  <ChevronRight className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 hidden h-6 w-6 rounded-full bg-white text-[#2563FF] shadow-sm border border-slate-200 lg:block" />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 9. DIFFERENTIALS & NEXTIA 360 */}
      <section className="bg-[#0B0F19] text-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#35B7FF]">
              Ecossistema Integrado
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black">
              {serviceData.differentialsTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-300">
              {serviceData.differentialsSubtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceData.differentials.map((diff, dIdx) => (
              <div
                key={dIdx}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  {differentialIcons[diff.iconName] || <Zap className="h-6 w-6 text-[#35B7FF]" />}
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{diff.title}</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{diff.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-8 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-white">{serviceData.nextia360Title}</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{serviceData.nextia360Text}</p>
            <div className="mt-6">
              <Link
                to={`/${serviceData.citySlug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#35B7FF] hover:underline"
              >
                Ver todas as soluções da Nextia em {serviceData.cityName} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. LOCAL CONTEXT & OFFICIAL TRANSPARENCY */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_100%)] p-8 sm:p-12 shadow-sm grid gap-8 lg:grid-cols-[1.2fr_.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700 mb-3">
                <MapPin className="h-3.5 w-3.5 text-[#2563FF]" />
                {serviceData.cityName} e Região
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10152B]">
                {serviceData.localContextTitle}
              </h2>
              <div className="mt-4 space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>{serviceData.localContextText1}</p>
                <p>{serviceData.localContextText2}</p>
              </div>

              <ul className="mt-6 space-y-2.5">
                {serviceData.localContextPoints.map((pt, ptIdx) => (
                  <li key={ptIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#10B981]" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-black text-[#10152B]">Canais de Atendimento</h3>
              <div className="mt-5 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#2563FF] shrink-0" />
                  <span>WhatsApp: <strong>(14) 99640-5496</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <AtSign className="h-4 w-4 text-[#E1306C] shrink-0" />
                  <span>Instagram: <strong>@nextia.dev</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>CNPJ: <strong>57.285.901/0001-94</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#753AFF] shrink-0" />
                  <span>Site: <strong>nextia.dev.br</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={getWhatsAppLink('geral', serviceData.hero.whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsappClick('local_context_box')}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] text-xs sm:text-sm font-bold text-white hover:bg-[#059669] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Conversar no WhatsApp Oficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. RELATED SERVICES (CROSS-SELL IN THE SAME CITY) */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Soluções Complementares
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#10152B]">
              {serviceData.relatedServicesTitle}
            </h2>
            <p className="mt-3 text-base text-slate-600">
              {serviceData.relatedServicesSubtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceData.relatedServices.map((rel, rIdx) => (
              <Link
                key={rIdx}
                to={`/${serviceData.citySlug}/${rel.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#2563FF]/40 hover:shadow-md"
              >
                <div>
                  <span className="text-3xl">{rel.icon}</span>
                  <h3 className="mt-3 text-base font-black text-[#10152B] group-hover:text-[#2563FF] transition-colors">
                    {rel.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{rel.description}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563FF]">
                  <span>Saiba mais</span>
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12. LOCAL FAQS (ACCORDION) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Perguntas Frequentes
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              Dúvidas sobre {serviceData.serviceCategoryName} em {serviceData.cityName}
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Respostas diretas sobre contratação, prazos e tecnologia:
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {serviceData.faqs.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-[#10152B] hover:text-[#2563FF] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-[#2563FF] shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#2563FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-[#FAFCFF] px-5 py-4 sm:px-6 sm:py-5">
                      <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. CONTEXTUAL LEAD FORM */}
      <section id="formulario-orcamento" className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-block rounded-full bg-[#2563FF]/10 px-4 py-1 text-xs font-bold text-[#2563FF]">
                Orçamento Direto
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#10152B]">
                Solicitar Proposta de {serviceData.serviceCategoryName} em {serviceData.cityName}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Preencha os dados e receba uma avaliação especializada para seu momento.
              </p>
            </div>

            {formSuccess ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center text-emerald-900">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold">Solicitação Recebida com Sucesso!</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  Obrigado! Nossa equipe técnica e comercial para {serviceData.cityName} já recebeu sua mensagem e responderá em breve.
                </p>
                <div className="mt-6">
                  <a
                    href={getWhatsAppLink('geral', `Olá! Acabei de enviar um formulário no site para ${serviceData.serviceCategoryName} em ${serviceData.cityName} e gostaria de agilizar meu atendimento.`)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsappClick('form_success_button')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#10B981] px-6 text-sm font-bold text-white hover:bg-[#059669]"
                  >
                    <MessageCircle className="h-4 w-4" /> Agilizar Atendimento no WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-8 space-y-5">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${formId}-name`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Seu Nome *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id={`${formId}-name`}
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Roberto Gomes"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`${formId}-company`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nome da Empresa
                    </label>
                    <input
                      id={`${formId}-company`}
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Ex: Minha Empresa"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${formId}-whatsapp`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id={`${formId}-whatsapp`}
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="(14) 99999-9999"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`${formId}-email`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id={`${formId}-email`}
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contato@empresa.com.br"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-service`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Serviço Selecionado
                  </label>
                  <select
                    id={`${formId}-service`}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-900 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                  >
                    <option value="Criação de Site">Criação de Site Profissional</option>
                    <option value="Loja Virtual">Loja Virtual & E-commerce</option>
                    <option value="WhatsApp com IA">WhatsApp com Inteligência Artificial</option>
                    <option value="Sistema Sob Medida">Sistema / Software Sob Medida</option>
                    <option value="Suporte de TI">Suporte de TI & TechCare</option>
                    <option value="Automação Empresarial">Automação Empresarial</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`${formId}-message`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalhes do Projeto (Opcional)
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`Conte brevemente sobre as necessidades da sua empresa em ${serviceData.cityName}...`}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2563FF] focus:outline-none focus:ring-2 focus:ring-[#2563FF]/10"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] text-base font-black text-white shadow-lg shadow-[#753AFF]/20 transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {formSubmitting ? (
                      'Enviando solicitação...'
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Enviar Solicitação para {serviceData.cityName}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" /> Seus dados estão seguros e protegidos. Respeitamos a LGPD.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 14. FINAL CONVERSION BANNER */}
      <section className="bg-gradient-to-br from-[#0B0F19] via-[#10172A] to-[#1E1B4B] py-20 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-[#35B7FF] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Nextia em {serviceData.cityName}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            {serviceData.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {serviceData.finalCta.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row justify-center">
            <a
              href={serviceData.hero.ctaPrimaryAnchor}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-8 text-base font-black text-white shadow-xl shadow-[#753AFF]/30 hover:opacity-90 transition-all"
            >
              {serviceData.finalCta.primaryCta} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={getWhatsAppLink('geral', serviceData.hero.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleWhatsappClick('final_cta')}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 text-base font-bold text-white hover:bg-white/20 transition-all"
            >
              <MessageCircle className="h-5 w-5 text-[#10B981]" />
              {serviceData.finalCta.whatsappCta}
            </a>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span>WhatsApp: <strong>(14) 99640-5496</strong></span>
            <span>•</span>
            <span>Instagram: <strong>@nextia.dev</strong></span>
            <span>•</span>
            <span>CNPJ: <strong>57.285.901/0001-94</strong></span>
            <span>•</span>
            <span>Site: <strong>nextia.dev.br</strong></span>
          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      <aside aria-label="Atendimento no WhatsApp" className="fixed bottom-6 right-6 z-40">
        <a
          href={getWhatsAppLink('geral', serviceData.hero.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          onClick={() => handleWhatsappClick('floating_button')}
          aria-label={`Falar no WhatsApp sobre ${serviceData.serviceCategoryName} em ${serviceData.cityName}`}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#059669] focus:outline-none focus:ring-4 focus:ring-[#10B981]/40"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="sr-only">WhatsApp Nextia {serviceData.cityName}</span>
        </a>
      </aside>
    </main>
  );
}
