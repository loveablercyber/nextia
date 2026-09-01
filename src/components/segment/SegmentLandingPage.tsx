import { useState, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Activity,
  ArrowRight,
  Bot,
  Briefcase,
  Calendar,
  CalendarX,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Filter,
  FolderArchive,
  Globe,
  HardDrive,
  Heart,
  HeartPulse,
  HelpCircle,
  Home,
  Layers,
  Layout,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Percent,
  Phone,
  PhoneIncoming,
  Scale,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  TrendingDown,
  User,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';
import type { SegmentData } from '../../data/segments';
import { SEGMENTS } from '../../data/segments';
import { templates } from '../../data/templates';
import { TemplateIllustration } from '../templates/TemplateIllustration';
import { getWhatsAppLink, trackEvent } from '../../utils/whatsapp';
import { getAllPublishedLocalNicheServices } from '../../data/localNicheServices';

interface SegmentLandingPageProps {
  segment: SegmentData;
}

export default function SegmentLandingPage({ segment }: SegmentLandingPageProps) {
  const formId = useId();
  const [params] = useSearchParams();

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Quiz state
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{
    hasSite?: string;
    whatsappVolume?: string;
    mainGoal?: string;
  }>({});

  // Lead Form State
  const initialCity = params.get('city') || '';
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    city: initialCity,
    service: segment.formServiceOptions[0] || 'Solução Completa',
    message: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/solucoes/${segment.slug}`;

  // Icon resolver helper
  const getIcon = (name: string, className = 'w-5 h-5') => {
    const map: Record<string, React.ReactNode> = {
      'message-square': <MessageSquare className={className} />,
      'folder-archive': <FolderArchive className={className} />,
      globe: <Globe className={className} />,
      filter: <Filter className={className} />,
      layers: <Layers className={className} />,
      'shield-alert': <ShieldAlert className={className} />,
      bot: <Bot className={className} />,
      'hard-drive': <HardDrive className={className} />,
      cpu: <Cpu className={className} />,
      search: <Search className={className} />,
      'shield-check': <ShieldCheck className={className} />,
      layout: <Layout className={className} />,
      'user-check': <UserCheck className={className} />,
      'file-check': <FileCheck className={className} />,
      clock: <Clock className={className} />,
      percent: <Percent className={className} />,
      'file-text': <FileText className={className} />,
      users: <Users className={className} />,
      utensils: <Utensils className={className} />,
      'message-circle': <MessageCircle className={className} />,
      smartphone: <Smartphone className={className} />,
      'check-circle-2': <CheckCircle2 className={className} />,
      wifi: <Wifi className={className} />,
      camera: <Camera className={className} />,
      scale: <Scale className={className} />,
      'help-circle': <HelpCircle className={className} />,
      shield: <Shield className={className} />,
      lock: <Lock className={className} />,
      calendar: <Calendar className={className} />,
      'calendar-x': <CalendarX className={className} />,
      'phone-incoming': <PhoneIncoming className={className} />,
      'heart-pulse': <HeartPulse className={className} />,
      sparkles: <Sparkles className={className} />,
      home: <Home className={className} />,
      heart: <Heart className={className} />,
      'shopping-bag': <ShoppingBag className={className} />,
      phone: <Phone className={className} />,
      'dollar-sign': <DollarSign className={className} />,
      'user-plus': <UserPlus className={className} />,
      activity: <Activity className={className} />,
      store: <Store className={className} />,
      'trending-down': <TrendingDown className={className} />,
      'shopping-cart': <ShoppingCart className={className} />,
      'credit-card': <CreditCard className={className} />,
      package: <Package className={className} />,
      briefcase: <Briefcase className={className} />,
      user: <User className={className} />,
      zap: <Zap className={className} />,
    };
    return map[name] || <Sparkles className={className} />;
  };

  // Find matching templates
  const matchingTemplates = templates.filter((tpl) => segment.templateSlugs.includes(tpl.slug));

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setFormError('Por favor, preencha nome, e-mail e WhatsApp.');
      return;
    }

    setFormSubmitting(true);
    trackEvent('lead_segment_form_submit', {
      segment: segment.slug,
      service: formData.service,
    });

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: formData.service,
          segment: segment.slug,
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.whatsapp,
          company: formData.company || undefined,
          city: formData.city || undefined,
          notes: formData.message || undefined,
          source: 'organic_segment_landing',
          landing_page: `/solucoes/${segment.slug}`,
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          utm_term: params.get('utm_term') || undefined,
          utm_content: params.get('utm_content') || undefined,
        }),
      });

      if (response.ok) {
        setFormSuccess(true);
        trackEvent('lead_segment_form_success', { segment: segment.slug });
      } else {
        const data = await response.json();
        setFormError(data.error || 'Não foi possível enviar a solicitação. Tente novamente ou use o WhatsApp.');
      }
    } catch {
      setFormError('Ocorreu um erro de conexão. Por favor, tente novamente ou fale pelo WhatsApp.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Schema.org JSON-LD definitions
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
    serviceType: `Tecnologia e Soluções Digitais para ${segment.name}`,
    name: `${segment.h1} | Nextia`,
    description: segment.metaDescription,
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: 'Nextia',
      url: baseUrl,
      telephone: '+5514996405496',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
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
        name: 'Soluções por Segmento',
        item: `${baseUrl}/solucoes`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: segment.name,
        item: canonicalUrl,
      },
    ],
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: segment.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{segment.seoTitle}</title>
        <meta name="description" content={segment.metaDescription} />
        <meta name="keywords" content={segment.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={segment.seoTitle} />
        <meta property="og:description" content={segment.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaService)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFaq)}</script>
      </Helmet>

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#07162B]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 sm:hidden flex items-center justify-between gap-2 shadow-2xl">
        <a
          href={getWhatsAppLink('geral', segment.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16A36A] py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95"
        >
          <Phone className="w-3.5 h-3.5" /> WhatsApp
        </a>
        <a
          href={`#${formId}-form`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1677FF] py-2.5 px-3 text-xs font-bold text-white shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5" /> Pedir Proposta
        </a>
      </div>

      <main className="bg-[#07162B] text-white min-h-screen">
        {/* Breadcrumb Section */}
        <section className="pt-24 pb-4 border-b border-white/5 bg-[#050E1C]" aria-label="Navegação estrutural">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <Link to="/" className="hover:text-white transition-colors">Início</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link to="/solucoes" className="hover:text-white transition-colors">Soluções</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold">{segment.name}</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className={`relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 bg-gradient-to-b ${segment.colorTheme.bgGradient} border-b border-white/5`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide" style={{ borderColor: `${segment.colorTheme.primary}40`, backgroundColor: `${segment.colorTheme.primary}15`, color: segment.colorTheme.accent }}>
                  <Sparkles className="w-4 h-4" />
                  {segment.badge}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  {segment.h1}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {segment.heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a
                    href={`#${formId}-form`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-white shadow-xl transition-all hover:opacity-95 hover:scale-[1.02]"
                    style={{ backgroundColor: segment.colorTheme.primary }}
                  >
                    {segment.heroCtaPrimary} <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href={getWhatsAppLink('geral', segment.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-6 py-4 text-base font-bold text-white border border-white/10 transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#16A36A]" /> Falar no WhatsApp
                  </a>
                </div>

                <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
                    <span>Sem fidelidade abusiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
                    <span>Estrutura modular</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
                    <span>Suporte técnico contínuo</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ecossistema {segment.name}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Zap className="w-3 h-3" /> Nextia 360
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {segment.nextia360Pillars.slice(0, 4).map((pillar, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${segment.colorTheme.primary}25`, color: segment.colorTheme.accent }}>
                          {getIcon(pillar.iconName, 'w-4 h-4')}
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-white">{pillar.title}</h2>
                          <p className="text-xs text-slate-300 leading-snug">{pillar.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href="#solucoes-detalhadas"
                      className="text-xs font-semibold hover:underline inline-flex items-center gap-1"
                      style={{ color: segment.colorTheme.accent }}
                    >
                      Ver todos os recursos para {segment.pluralName.toLowerCase()} <ChevronDown className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Before & After Section */}
        {segment.beforeAfter && segment.beforeAfter.length > 0 && (
          <section className="py-16 bg-[#050E1C] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: segment.colorTheme.accent }}>
                  Transformação Operacional
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {segment.beforeAfterTitle}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {segment.beforeAfter.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-white/10 pb-2">
                      {item.topic}
                    </span>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <span>✕</span> Sem a Nextia:
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.before}</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-white/5">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <span>✓</span> Com a Nextia:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{item.after}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Problems Section */}
        <section className="py-16 sm:py-20 bg-[#07162B] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-2">
                Dores do Setor
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                {segment.problemsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {segment.problemsSubtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {segment.problems.map((problem, idx) => (
                <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 hover:border-red-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                    {getIcon(problem.iconName, 'w-5 h-5')}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Solutions Section */}
        <section id="solucoes-detalhadas" className="py-16 sm:py-24 bg-[#050E1C] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: segment.colorTheme.accent }}>
                Soluções Modulares
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                {segment.solutionsTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {segment.solutionsSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {segment.solutions.map((sol, idx) => (
                <div key={idx} className="rounded-2xl bg-[#0A1628] border border-white/10 p-7 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${segment.colorTheme.primary}20`, color: segment.colorTheme.accent }}>
                        {getIcon(sol.iconName, 'w-6 h-6')}
                      </div>
                      {sol.badge && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{ borderColor: `${segment.colorTheme.primary}40`, backgroundColor: `${segment.colorTheme.primary}10`, color: segment.colorTheme.accent }}>
                          {sol.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">{sol.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">{sol.description}</p>

                    <ul className="space-y-2.5 mb-8">
                      {sol.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <a
                      href={`#${formId}-form`}
                      onClick={() => setFormData((prev) => ({ ...prev, service: sol.title }))}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold hover:underline"
                      style={{ color: segment.colorTheme.accent }}
                    >
                      Solicitar esta solução <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nextia 360 Ecosystem Section */}
        <section className="py-16 sm:py-24 bg-[#07162B] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-emerald-400">
                Visão Integrada
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                {segment.nextia360Title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {segment.nextia360Subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {segment.nextia360Pillars.map((pillar, idx) => (
                <div key={idx} className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 hover:bg-white/[0.04] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                    {getIcon(pillar.iconName, 'w-5 h-5')}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 text-center max-w-3xl mx-auto">
              <p className="text-sm sm:text-base text-slate-200 mb-4 font-medium">
                Centralize site, WhatsApp, automação e infraestrutura de TI em um único parceiro estratégico de tecnologia.
              </p>
              <a
                href={`#${formId}-form`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1677FF] hover:bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all"
              >
                Conhecer a solução completa para {segment.pluralName.toLowerCase()} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Visual Customer Journey Workflow */}
        <section className="py-16 sm:py-20 bg-[#050E1C] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: segment.colorTheme.accent }}>
                Fluxo de Atendimento
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                {segment.workflowTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {segment.workflowSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4 relative">
              {segment.workflow.map((item, idx) => (
                <div key={idx} className="rounded-xl bg-[#0A1628] border border-white/10 p-5 flex flex-col justify-between space-y-3 relative">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-bold flex items-center justify-center text-slate-300">
                        {item.step}
                      </span>
                      <div className="text-slate-400">
                        {getIcon(item.iconName, 'w-4 h-4')}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Models Section */}
        {matchingTemplates.length > 0 && (
          <section className="py-16 sm:py-24 bg-[#07162B] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-blue-400">
                  Modelos Prontos
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                  Modelos de Sites para {segment.pluralName}
                </h2>
                <p className="text-sm text-slate-300">
                  Estruturas testadas e otimizadas para conversão, prontas para serem personalizadas com as cores e fotos do seu negócio.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingTemplates.map((tpl) => (
                  <div key={tpl.id} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all">
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <TemplateIllustration category={tpl.category} slug={tpl.slug} coverImage={tpl.coverImage} />
                      </div>
                      <div className="p-6 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{tpl.category}</span>
                        <h3 className="text-lg font-bold text-white">{tpl.name}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">{tpl.description}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center gap-3">
                      <Link
                        to={`/demo/${tpl.slug}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-bold text-white border border-white/10 transition-colors"
                      >
                        Ver Demonstração
                      </Link>
                      <Link
                        to={`/modelos/${tpl.slug}?segment=${segment.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1677FF] hover:bg-[#1D4ED8] py-2.5 text-xs font-bold text-white shadow-md transition-colors"
                      >
                        Quero este modelo
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Security & Compliance Section (if applicable) */}
        {segment.securitySection && (
          <section className="py-14 bg-[#050E1C] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 mx-auto space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">{segment.securitySection.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-300">{segment.securitySection.description}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
                  {segment.securitySection.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEO & Search Section */}
        <section className="py-14 bg-[#07162B] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-[#0B1A2F] border border-blue-500/20 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Search className="w-4 h-4" /> Presença nas Buscas
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{segment.seoSection.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{segment.seoSection.description}</p>
              
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Exemplos de buscas do seu público:</span>
                <div className="flex flex-wrap gap-2">
                  {segment.seoSection.searchExamples.map((ex, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-blue-400" /> "{ex}"
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Quick Diagnostic Quiz */}
        <section className="py-16 sm:py-20 bg-[#050E1C] border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Diagnóstico Rápido
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Descubra a estrutura ideal para sua {segment.name.toLowerCase()}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8">
              Responda a 3 perguntas simples para receber nossa recomendação de tecnologia.
            </p>

            <div className="bg-[#0A1628] border border-white/10 rounded-2xl p-6 sm:p-8 text-left shadow-xl">
              {quizStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">1. Sua empresa já possui um site profissional em funcionamento?</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {['Não, precisamos criar um', 'Sim, mas está desatualizado', 'Sim, temos e é recente'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, hasSite: opt }));
                          setQuizStep(1);
                        }}
                        className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-slate-200 hover:bg-white/10 hover:border-white/20 text-left font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">2. Como é o volume de mensagens de clientes no seu WhatsApp?</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {['Alto, com perguntas repetidas', 'Médio, queremos organizar', 'Baixo, queremos mais contatos'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, whatsappVolume: opt }));
                          setQuizStep(2);
                        }}
                        className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-slate-200 hover:bg-white/10 hover:border-white/20 text-left font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">3. Qual é o objetivo principal da sua empresa nos próximos 6 meses?</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {['Atrair novos clientes', 'Automatizar atendimento', 'Solução completa (Nextia 360)'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, mainGoal: opt }));
                          setQuizStep(3);
                        }}
                        className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-slate-200 hover:bg-white/10 hover:border-white/20 text-left font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 3 && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Diagnóstico concluído!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Com base no seu perfil ({quizAnswers.hasSite}, volume {quizAnswers.whatsappVolume} e foco em {quizAnswers.mainGoal}), recomendamos nossa estrutura de <strong>Site + Atendimento WhatsApp</strong>.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={`#${formId}-form`}
                      onClick={() => setFormData((prev) => ({ ...prev, message: `Diagnóstico: Site (${quizAnswers.hasSite}), WhatsApp (${quizAnswers.whatsappVolume}), Foco (${quizAnswers.mainGoal})` }))}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#1D4ED8]"
                    >
                      Solicitar Proposta Recomendada
                    </a>
                    <button
                      type="button"
                      onClick={() => setQuizStep(0)}
                      className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      Refazer teste
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-16 sm:py-24 bg-[#07162B] border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: segment.colorTheme.accent }}>
                Tire suas Dúvidas
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Perguntas Frequentes sobre Soluções para {segment.pluralName}
              </h2>
            </div>

            <div className="space-y-3">
              {segment.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-white hover:bg-white/[0.02] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Capture Form Section */}
        <section id={`${formId}-form`} className="py-16 sm:py-24 bg-[#050E1C] border-b border-white/5 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: segment.colorTheme.accent }}>
                  Contato Comercial
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  Sua {segment.name.toLowerCase()} pode trabalhar com uma estrutura digital mais organizada
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Conte o que você deseja melhorar e a equipe da Nextia ajuda a identificar quais soluções fazem mais sentido para sua operação.
                </p>

                <div className="space-y-3 text-xs sm:text-sm text-slate-300 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>WhatsApp: (14) 99640-5496</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>CNPJ: 57.285.901/0001-94</span>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-[#0A1628] border border-white/10 p-6 sm:p-8 shadow-2xl">
                  {formSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Solicitação enviada com sucesso!</h3>
                      <p className="text-sm text-slate-300 max-w-md mx-auto">
                        Recebemos sua mensagem para o segmento de <strong>{segment.name}</strong>. Nossa equipe entrará em contato via WhatsApp/e-mail com uma proposta detalhada.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setFormSuccess(false); setFormData({ name: '', company: '', whatsapp: '', email: '', city: initialCity, service: segment.formServiceOptions[0], message: '' }); }}
                        className="text-xs font-semibold text-blue-400 hover:underline pt-2"
                      >
                        Enviar outra mensagem
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <h3 className="text-lg font-bold text-white mb-4">Solicitar Análise e Orçamento</h3>

                      {formError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                          {formError}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Carlos Silva"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa / Escritório</label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder={`Ex: ${segment.name} Exemplo`}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp com DDD *</label>
                          <input
                            type="tel"
                            required
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            placeholder="(14) 99999-9999"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Profissional *</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@empresa.com.br"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade / Estado</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Ex: Bauru - SP"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Solução de Maior Interesse</label>
                          <select
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[#07162B] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            {segment.formServiceOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Mensagem ou Detalhes (Opcional)</label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Conte um pouco sobre sua operação e necessidades atuais..."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold text-white shadow-xl transition-all hover:opacity-95 disabled:opacity-50"
                        style={{ backgroundColor: segment.colorTheme.primary }}
                      >
                        {formSubmitting ? 'Enviando...' : `Solicitar proposta para ${segment.name}`} <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Segments and City Links */}
        <section className="py-14 bg-[#07162B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Related Segments */}
            {segment.relatedSegments && segment.relatedSegments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Outras Soluções por Segmento
                </h3>
                <div className="flex flex-wrap gap-2">
                  {segment.relatedSegments.map((relSlug) => {
                    const rel = SEGMENTS[relSlug];
                    if (!rel) return null;
                    return (
                      <Link
                        key={relSlug}
                        to={`/solucoes/${relSlug}`}
                        className="text-xs px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{rel.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </Link>
                    );
                  })}
                  <Link
                    to="/solucoes"
                    className="text-xs px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold transition-colors inline-flex items-center gap-1"
                  >
                    Ver todos os segmentos <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* City Regional Links */}
            {segment.cityLinks && segment.cityLinks.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Atendimento Regional
                </h3>
                <div className="flex flex-wrap gap-3">
                  {segment.cityLinks.map((city, idx) => (
                    <Link
                      key={idx}
                      to={`/${city.citySlug}`}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>{city.label}</span>
                    </Link>
                  ))}
                </div>
                {/* Etapa 4: Niche service pages for this segment */}
                {(() => {
                  const nichePages = getAllPublishedLocalNicheServices().filter(
                    (n) => n.segmentSlug === segment.slug
                  );
                  if (nichePages.length === 0) return null;
                  return (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {nichePages.map((niche, nIdx) => (
                        <Link
                          key={nIdx}
                          to={`/${niche.citySlug}/${niche.segmentSlug}/${niche.serviceSlug}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-semibold transition-colors"
                        >
                          {niche.serviceName} em {niche.cityName}
                        </Link>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
