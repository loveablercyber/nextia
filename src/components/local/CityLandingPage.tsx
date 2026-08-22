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
  Code2,
  Cpu,
  Database,
  Headphones,
  HelpCircle,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { getCityData } from '../../data/cities';
import { templates } from '../../data/templates';
import { TemplateIllustration } from '../templates/TemplateIllustration';
import { getWhatsAppLink, trackEvent } from '../../utils/whatsapp';

interface CityLandingPageProps {
  citySlug: string;
}

export default function CityLandingPage({ citySlug }: CityLandingPageProps) {
  const city = getCityData(citySlug);
  const formId = useId();

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    service: 'Criação de Site',
    message: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 pt-28 pb-16">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-black text-[#10152B]">Cidade não encontrada</h1>
          <p className="mt-3 text-slate-600">
            A localidade informada ainda não possui página própria. Mas atendemos empresas de todo o interior paulista!
          </p>
          <Link
            to="/solucoes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563FF] px-6 py-3 font-bold text-white shadow-md hover:bg-[#1D4ED8]"
          >
            Conhecer Soluções Nextia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/${city.slug}`;

  // Solution icons map
  const solutionIcons: Record<string, React.ReactNode> = {
    code: <Code2 className="h-6 w-6" />,
    'shopping-bag': <ShoppingBag className="h-6 w-6" />,
    bot: <Bot className="h-6 w-6" />,
    database: <Database className="h-6 w-6" />,
    headphones: <Headphones className="h-6 w-6" />,
    cpu: <Cpu className="h-6 w-6" />,
  };

  // Differential icons map
  const differentialIcons: Record<string, React.ReactNode> = {
    layers: <Layers className="h-6 w-6 text-[#2563FF]" />,
    sliders: <Sliders className="h-6 w-6 text-[#9147FF]" />,
    zap: <Zap className="h-6 w-6 text-[#10B981]" />,
    'message-circle': <MessageCircle className="h-6 w-6 text-[#FF7A21]" />,
    'trending-up': <TrendingUp className="h-6 w-6 text-[#2563FF]" />,
    'refresh-cw': <RefreshCw className="h-6 w-6 text-[#6366F1]" />,
    'shield-check': <ShieldCheck className="h-6 w-6 text-[#10B981]" />,
  };

  // JSON-LD Schemas
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

  const schemaLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `Nextia - Tecnologia e Criação de Sites em ${city.name}`,
    description: city.metaDescription,
    url: canonicalUrl,
    telephone: '+5514996405496',
    priceRange: '$$',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: city.areaServed,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Nextia',
      taxID: '57.285.901/0001-94',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Soluções Nextia em ${city.name}`,
      itemListElement: city.solutions.map((s, idx) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${s.title} em ${city.name}`,
          description: s.description,
        },
        position: idx + 1,
      })),
    },
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: city.faqs.map((faq) => ({
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
        name: city.name,
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
    trackEvent('lead_form_submit_attempt', { city: city.slug, service: formData.service });

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: formData.service,
          segment: formData.company || 'Empresa em ' + city.name,
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.whatsapp,
          contact_company: formData.company,
          city: city.name,
          notes: `Origem: ${city.leadSource} | Serviço solicitado: ${formData.service} | Mensagem: ${formData.message || 'Sem mensagem adicional'}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Não foi possível registrar o orçamento.');
      }

      trackEvent('lead_submission', { city: city.slug, service: formData.service });
      setFormSuccess(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Ocorreu um erro ao enviar sua solicitação. Tente novamente ou chame no WhatsApp.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleWhatsappClick = (source: string) => {
    trackEvent('whatsapp_click', { city: city.slug, source });
  };

  return (
    <main className="bg-white text-[#10152B] selection:bg-[#2563FF]/20 selection:text-[#2563FF]">
      <Helmet>
        <title>{city.metaTitle}</title>
        <meta name="description" content={city.metaDescription} />
        <meta name="keywords" content={city.keywords.join(', ')} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={city.metaTitle} />
        <meta property="og:description" content={city.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={city.metaTitle} />
        <meta name="twitter:description" content={city.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaLocalBusiness)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFaq)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumbs)}</script>
      </Helmet>

      {/* 1. BREADCRUMBS */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-[#FBFBFE] pt-24 pb-3">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
            <li>
              <Link to="/" className="hover:text-[#2563FF] transition-colors flex items-center gap-1 font-medium">
                Início
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </li>
            <li aria-current="page" className="font-bold text-[#10152B]">
              {city.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* 2. HERO SECTION (5-Second Rule) */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F9FF_55%,#EEF2FF_100%)] pt-8 pb-16 lg:pt-12 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_80%_20%,rgba(117,58,255,.14),transparent_35%),radial-gradient(circle_at_15%_75%,rgba(37,99,255,.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2563FF]/20 bg-white/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#2563FF] shadow-sm backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-[#2563FF]" />
              <span>{city.hero.badge}</span>
            </div>

            {/* H1 Principal */}
            <h1 className="text-[34px] sm:text-4xl lg:text-[54px] font-black leading-[1.08] tracking-[-.04em] text-[#10152B]">
              {city.hero.h1Prefix}
              <span className="bg-gradient-to-r from-[#2563FF] via-[#753AFF] to-[#9147FF] bg-clip-text text-transparent">
                {city.hero.h1Highlight}
              </span>
              {city.hero.h1Suffix}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#4A5568]">
              {city.hero.subtitle}
            </p>

            {/* Primary & WhatsApp CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={city.hero.ctaPrimaryAnchor}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-7 text-base font-black text-white shadow-lg shadow-[#753AFF]/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#753AFF]/30"
              >
                {city.hero.ctaPrimaryText} <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={getWhatsAppLink('geral', city.hero.whatsappMessage)}
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
                href="#solucoes"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#2563FF] transition-colors"
              >
                Conhecer todas as soluções em {city.name} <ChevronDown className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* 4 Trust Highlights */}
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {city.hero.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Hero Mockup */}
          <div className="relative mx-auto w-full max-w-[580px]">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#2563FF]/15 to-[#9147FF]/20 blur-2xl" />
            <div className="relative rounded-3xl border border-white/80 bg-white/70 p-4 sm:p-5 shadow-[0_25px_70px_rgba(37,99,255,.14)] backdrop-blur">
              <div className="rounded-2xl bg-[#0B0F19] p-2 sm:p-3 shadow-inner">
                <div className="overflow-hidden rounded-xl">
                  <TemplateIllustration category="restaurante" slug="restaurante-premium" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  Pronto para {city.name}/SP
                </span>
                <span className="text-slate-400">Nextia Tecnologia</span>
              </div>
            </div>

            {/* Floating feature pills */}
            <div className="absolute -left-3 top-12 hidden sm:flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur">
              <Code2 className="h-4 w-4 text-[#2563FF]" />
              <span className="text-xs font-bold text-[#10152B]">Sites Rápidos & SEO</span>
            </div>
            <div className="absolute -right-3 bottom-16 hidden sm:flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur">
              <Bot className="h-4 w-4 text-[#10B981]" />
              <span className="text-xs font-bold text-[#10152B]">WhatsApp com IA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OVERVIEW CONTEXT */}
      <section className="border-y border-slate-100 bg-[#FBFBFE] py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
            {city.overview.subtitle}
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#10152B]">
            {city.overview.title}
          </h2>
          <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed text-[#4A5568] text-left sm:text-center">
            <p>{city.overview.paragraph1}</p>
            <p>{city.overview.paragraph2}</p>
          </div>
        </div>
      </section>

      {/* 4. SOLUTIONS GRID */}
      <section id="solucoes" className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#753AFF]">
              Soluções Especializadas
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[#10152B]">
              Serviços de Tecnologia para Empresas em {city.name}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Do site institucional à automação completa com IA e suporte de TI contínuo para o seu negócio:
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {city.solutions.map((sol) => (
              <article
                key={sol.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-7 shadow-[0_8px_30px_rgba(28,35,72,.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(37,99,255,.10)]"
                style={{ borderColor: sol.accentColor + '40' }}
              >
                {/* Color Accent Bar */}
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, ${sol.accentColor}, #753AFF)` }}
                />

                {sol.highlightBadge && (
                  <span
                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: sol.accentColor }}
                  >
                    {sol.highlightBadge}
                  </span>
                )}

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ color: sol.accentColor, backgroundColor: sol.softBg }}
                >
                  {solutionIcons[sol.iconName] || <Zap className="h-6 w-6" />}
                </div>

                <h3 className="mt-5 text-xl font-black text-[#10152B]">{sol.title}</h3>
                <p className="mt-1 text-xs font-bold" style={{ color: sol.accentColor }}>
                  {sol.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{sol.description}</p>

                <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 flex-1">
                  {sol.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: sol.accentColor }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-2">
                  <Link
                    to={sol.ctaLink}
                    className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: sol.softBg,
                      color: sol.accentColor,
                    }}
                  >
                    {sol.ctaText} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TARGET SEGMENTS ("PARA QUEM É") */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Para Quem É
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {city.segmentsTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {city.segmentsSubtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {city.segments.map((seg, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#2563FF]/40 hover:shadow-md"
              >
                <div>
                  <span className="text-2xl">{seg.icon}</span>
                  <h3 className="mt-2 text-base font-bold text-[#10152B]">{seg.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{seg.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#2563FF] bg-[#EEF4FF] px-2.5 py-1 rounded-md">
                    {seg.recommendedSolution}
                  </span>
                  <Link
                    to={seg.futurePath || '/sites-prontos'}
                    className="text-xs font-bold text-slate-400 hover:text-[#2563FF] transition-colors"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROBLEM -> SOLUTION SECTION */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#FF7A21]">
              Diagnóstico & Solução
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {city.problemSolution.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {city.problemSolution.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Column 1: Problems */}
            <div className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50/50 to-white p-7 sm:p-9 shadow-sm">
              <h3 className="text-xl font-black text-red-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 text-sm font-bold">✕</span>
                {city.problemSolution.problemsTitle}
              </h3>
              <div className="mt-6 space-y-5">
                {city.problemSolution.problems.map((prob, pIdx) => (
                  <div key={pIdx} className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm">{prob.title}</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Nextia Solutions */}
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-7 sm:p-9 shadow-sm">
              <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
                {city.problemSolution.solutionsTitle}
              </h3>
              <div className="mt-6 space-y-5">
                {city.problemSolution.solutions.map((sol, sIdx) => (
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

      {/* 7. DIFFERENTIALS (NO FAKE NUMBERS) */}
      <section className="bg-[#0B0F19] text-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#35B7FF]">
              Por Que Escolher a Nextia
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black">
              {city.differentialsTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-300">
              {city.differentialsSubtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {city.differentials.map((diff, dIdx) => (
              <div
                key={dIdx}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  {differentialIcons[diff.iconName] || <Zap className="h-6 w-6 text-[#35B7FF]" />}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{diff.title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {diff.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. NEXTIA 360 */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl border border-[#2563FF]/20 bg-[linear-gradient(135deg,#FFFFFF_0%,#F6F8FF_100%)] p-8 sm:p-12 shadow-sm">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-block rounded-full bg-[#2563FF]/10 px-4 py-1.5 text-xs font-bold text-[#2563FF]">
                Estrutura Integrada
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#10152B]">
                {city.nextia360.title}
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                {city.nextia360.description}
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {city.nextia360.modules.map((mod, mIdx) => (
                <div
                  key={mIdx}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{mod.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#10152B]">{mod.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href={city.hero.ctaPrimaryAnchor}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#2563FF] px-7 text-sm font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors"
              >
                {city.nextia360.ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. HOW IT WORKS */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#753AFF]">
              Processo de Atendimento
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              Como Funciona a Contratação da Nextia em {city.name}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Etapas claras, transparentes e sem burocracia do início à entrega:
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {city.howItWorks.map((item, hIdx) => (
              <article
                key={hIdx}
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-sm font-black text-[#2563FF]">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-black text-[#10152B]">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 flex-1">{item.description}</p>
                {hIdx < city.howItWorks.length - 1 && (
                  <ChevronRight className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 hidden h-6 w-6 rounded-full bg-white text-[#2563FF] shadow-sm border border-slate-200 lg:block" />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. LOCAL ATTENDANCE & OFFICIAL INFO */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm grid gap-8 lg:grid-cols-[1.2fr_.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700 mb-3">
                <MapPin className="h-3.5 w-3.5 text-[#2563FF]" />
                {city.name} e Região
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10152B]">
                {city.localAttendance.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
                {city.localAttendance.description}
              </p>

              <ul className="mt-6 space-y-3">
                {city.localAttendance.points.map((pt, ptIdx) => (
                  <li key={ptIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#10B981]" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs text-slate-500 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {city.localAttendance.notice}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] p-6 sm:p-8 text-[#10152B]">
              <h3 className="text-lg font-black">Canais Oficiais Nextia</h3>
              <div className="mt-5 space-y-3.5 text-xs sm:text-sm">
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
                  <span>Site oficial: <strong>nextia.dev.br</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/80">
                <a
                  href={getWhatsAppLink('geral', city.hero.whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsappClick('channels_card')}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] text-xs sm:text-sm font-bold text-white hover:bg-[#059669] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp Oficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. INTERMEDIATE CTA */}
      <section className="bg-gradient-to-r from-[#2563FF] to-[#753AFF] py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black">
            {city.intermediateCta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed">
            {city.intermediateCta.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <a
              href={city.hero.ctaPrimaryAnchor}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-black text-[#2563FF] shadow-lg hover:bg-slate-50 transition-colors"
            >
              {city.intermediateCta.primaryCta} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={getWhatsAppLink('geral', city.hero.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleWhatsappClick('intermediate_cta')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 text-sm font-bold text-white hover:bg-white/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#10B981]" />
              {city.intermediateCta.whatsappCta}
            </a>
          </div>
        </div>
      </section>

      {/* 12. TEMPLATES SHOWCASE */}
      <section className="py-20 bg-[#FBFBFE]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Modelos Visuais de Alta Performance
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              {city.templatesTitle}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              {city.templatesSubtitle}
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

          <div className="mt-10 text-center">
            <Link
              to="/sites-prontos"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[#2563FF] hover:underline"
            >
              Ver catálogo completo de sites prontos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 13. LEAD CAPTURE FORM */}
      <section id="formulario-orcamento" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F9FF_100%)] p-8 sm:p-12 shadow-sm">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-block rounded-full bg-[#2563FF]/10 px-4 py-1 text-xs font-bold text-[#2563FF]">
                Orçamento Sem Compromisso
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#10152B]">
                Solicitar Proposta para sua Empresa em {city.name}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Preencha os dados abaixo e nossa equipe entrará em contato com a melhor recomendação para seu momento.
              </p>
            </div>

            {formSuccess ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center text-emerald-900">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-4 text-xl font-bold">Solicitação Recebida com Sucesso!</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  Obrigado pelo contato! Nossa equipe técnica e comercial para {city.name} já recebeu sua solicitação e responderá em breve via WhatsApp e e-mail.
                </p>
                <div className="mt-6">
                  <a
                    href={getWhatsAppLink('geral', `Olá! Acabei de enviar um formulário no site para ${city.name} e gostaria de agilizar meu atendimento.`)}
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
                        placeholder="Ex: Carlos Silva"
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
                      placeholder="Ex: Minha Empresa Ltda"
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
                      E-mail Corporativo *
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
                    Serviço Principal de Interesse
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
                    <option value="Automação Empresarial">Automação de Processos Empresariais</option>
                    <option value="SEO & Otimização">SEO & Otimização de Busca</option>
                    <option value="Outro">Outra Solução Personalizada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`${formId}-message`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detalhes ou Necessidade Específica (Opcional)
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte brevemente sobre o seu negócio e o que gostaria de implementar..."
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
                        <Send className="h-4 w-4" /> Enviar Solicitação para {city.name}
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

      {/* 14. LOCAL FAQS (ACCORDION) */}
      <section className="bg-[#F8F9FD] py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#2563FF]">
              Perguntas Frequentes
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-[#10152B]">
              Dúvidas Frequentes sobre Serviços em {city.name}
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Respostas claras sobre prazos, custos, atendimento e tecnologia:
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {city.faqs.map((faq, fIdx) => {
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
                    className="flex w-full items-center justify-between p-5 text-left text-base sm:text-lg font-bold text-[#10152B] hover:text-[#2563FF] transition-colors"
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

      {/* 15. FINAL CTA */}
      <section className="bg-gradient-to-br from-[#0B0F19] via-[#10172A] to-[#1E1B4B] py-20 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-[#35B7FF] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Nextia em {city.name}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            {city.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {city.finalCta.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row justify-center">
            <a
              href={city.hero.ctaPrimaryAnchor}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-8 text-base font-black text-white shadow-xl shadow-[#753AFF]/30 hover:opacity-90 transition-all"
            >
              {city.finalCta.primaryCta} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={getWhatsAppLink('geral', city.hero.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleWhatsappClick('final_cta')}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 text-base font-bold text-white hover:bg-white/20 transition-all"
            >
              <MessageCircle className="h-5 w-5 text-[#10B981]" />
              {city.finalCta.whatsappCta}
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
          href={getWhatsAppLink('geral', city.hero.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          onClick={() => handleWhatsappClick('floating_button')}
          aria-label={`Falar no WhatsApp com especialista em ${city.name}`}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#059669] focus:outline-none focus:ring-4 focus:ring-[#10B981]/40"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="sr-only">WhatsApp Nextia {city.name}</span>
        </a>
      </aside>
    </main>
  );
}
