import { useState, useEffect, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { LocalNicheServiceData } from '../../data/localNicheServices';
import { templates } from '../../data/templates';
import { TemplateIllustration } from '../templates/TemplateIllustration';
import { getWhatsAppLink, trackEvent } from '../../utils/whatsapp';
import {
  Globe, Search, ShieldCheck, Bot, MessageCircle, MessageSquare,
  Smartphone, Zap, Lock, Layout, UserCheck, FileCheck, Clock, Percent,
  FileText, Users, Utensils, Phone, DollarSign, UserPlus, Activity,
  Store, TrendingDown, ShoppingCart, CreditCard, CheckCircle2, ChevronDown,
  ChevronRight, ArrowRight, Send, Mail, MapPin, Sparkles, Heart, HeartPulse,
  Home, Briefcase, Scale, ShoppingBag, HelpCircle, Calendar, Shield, Cpu,
  Layers, Filter, FolderArchive, ShieldAlert, HardDrive, Camera, Wifi,
  Package, Target, Gauge, Headphones, Database, Code2, AtSign
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Globe, Search, ShieldCheck, Bot, MessageCircle, MessageSquare,
  Smartphone, Zap, Lock, Layout, UserCheck, FileCheck, Clock, Percent,
  FileText, Users, Utensils, Phone, DollarSign, UserPlus, Activity,
  Store, TrendingDown, ShoppingCart, CreditCard, CheckCircle2, ChevronDown,
  ChevronRight, ArrowRight, Send, Mail, MapPin, Sparkles, Heart, HeartPulse,
  Home, Briefcase, Scale, ShoppingBag, HelpCircle, Calendar, Shield, Cpu,
  Layers, Filter, FolderArchive, ShieldAlert, HardDrive, Camera, Wifi,
  Package, Target, Gauge, Headphones, Database, Code2, AtSign
};

function resolveIcon(name: string, className?: string) {
  const Icon = iconMap[name] || CheckCircle2;
  return <Icon className={className} />;
}

export default function LocalNicheServiceLandingPage({ data }: { data: LocalNicheServiceData }) {
  const [searchParams] = useSearchParams();
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const formId = useId();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    goal: data.formDefaults.goalOptions[0] || '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    trackEvent('view_local_niche_service', {
      city: data.citySlug,
      segment: data.segmentSlug,
      service: data.serviceSlug
    });

    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.citySlug, data.segmentSlug, data.serviceSlug]);

  const handleWhatsAppClick = (source: string) => {
    trackEvent('click_whatsapp', {
      city: data.citySlug,
      segment: data.segmentSlug,
      service: data.serviceSlug,
      source
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    trackEvent('lead_form_submit_attempt', { city: data.citySlug, segment: data.segmentSlug, service: data.serviceSlug });

    try {
      const payload = {
        project_type: data.formDefaults.service,
        segment: data.formDefaults.segment,
        contact_name: formData.name,
        contact_email: formData.email,
        contact_phone: formData.whatsapp,
        contact_company: formData.company,
        city: data.formDefaults.city,
        notes: `Origem: ${data.leadSource} | Segmento: ${data.formDefaults.segment} | Serviço: ${data.formDefaults.service} | Objetivo: ${formData.goal} | Mensagem: ${formData.message}`,
        source: 'organic_local_niche',
        landing_page: `/${data.citySlug}/${data.segmentSlug}/${data.serviceSlug}`,
        utm_source: searchParams.get('utm_source') || '',
        utm_medium: searchParams.get('utm_medium') || '',
        utm_campaign: searchParams.get('utm_campaign') || ''
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao enviar formulário');

      setFormStatus('success');
      trackEvent('generate_lead', { city: data.citySlug, segment: data.segmentSlug, service: data.serviceSlug });
      setFormData({ name: '', company: '', whatsapp: '', email: '', goal: data.formDefaults.goalOptions[0] || '', message: '' });
    } catch (error) {
      console.error(error);
      setFormStatus('error');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const currentUrl = `https://nextia.dev.br/${data.citySlug}/${data.segmentSlug}/${data.serviceSlug}`;
  
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nextia",
    "url": "https://nextia.dev.br",
    "logo": "https://nextia.dev.br/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-14-99640-5496",
      "contactType": "customer service",
      "areaServed": "BR",
      "availableLanguage": "Portuguese"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.seo.title,
    "provider": {
      "@type": "Organization",
      "name": "Nextia"
    },
    "areaServed": {
      "@type": "City",
      "name": data.cityName,
      "containedInPlace": {
        "@type": "State",
        "name": data.state
      }
    },
    "serviceType": data.seo.schemaServiceType,
    "description": data.seo.description
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://nextia.dev.br/" },
      { "@type": "ListItem", "position": 2, "name": data.cityName, "item": `https://nextia.dev.br/${data.citySlug}` },
      { "@type": "ListItem", "position": 3, "name": data.segmentName, "item": `https://nextia.dev.br/solucoes/${data.segmentSlug}` },
      { "@type": "ListItem", "position": 4, "name": data.serviceName, "item": currentUrl }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const matchingTemplates = templates.filter(t => data.templateSlugs.includes(t.slug));

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Helmet>
        <title>{data.seo.title}</title>
        <meta name="description" content={data.seo.description} />
        <meta name="keywords" content={data.seo.keywords.join(', ')} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={data.seo.title} />
        <meta property="og:description" content={data.seo.description} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Sticky Mobile CTA Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 md:hidden transition-transform duration-300 flex gap-3 ${
          showStickyCta ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <a 
          href={getWhatsAppLink('geral', data.hero.whatsappMessage)}
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => handleWhatsAppClick('sticky_bar')}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 px-4 text-center text-sm flex items-center justify-center min-h-[44px]"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp
        </a>
        <a 
          href="#formulario"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl py-3 px-4 text-center text-sm flex items-center justify-center min-h-[44px]"
        >
          Orçamento
        </a>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-[#07162B] pt-24 pb-4 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <nav className="flex text-sm text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <Link to={`/${data.citySlug}`} className="hover:text-white transition-colors">{data.cityName}</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <Link to={`/solucoes/${data.segmentSlug}`} className="hover:text-white transition-colors">{data.segmentName}</Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
            <span className="text-slate-200 font-medium">{data.serviceName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#07162B] to-[#0F2847] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-blue-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            {data.hero.badge}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-5xl mx-auto">
            {data.hero.h1.split(data.hero.h1Highlight).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {data.hero.h1Highlight}
                  </span>
                )}
              </span>
            ))}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {data.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a 
              href="#formulario" 
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
            >
              {data.hero.ctaPrimaryText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a 
              href={getWhatsAppLink('geral', data.hero.whatsappMessage)}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleWhatsAppClick('hero')}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-xl transition-all shadow-lg hover:shadow-green-500/25"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {data.hero.ctaSecondaryText}
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-slate-300">
            {data.hero.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-70">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-400" /> <span className="text-sm font-medium">CNPJ Ativo</span></div>
            <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-400" /> <span className="text-sm font-medium">WhatsApp Comercial</span></div>
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" /> <span className="text-sm font-medium">Sem fidelidade</span></div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{data.problems.title}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">{data.problems.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {data.problems.items.map((problem, index) => (
              <div key={index} className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500">
                  {resolveIcon(problem.iconName, "w-6 h-6")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600">{problem.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{data.solution.title}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">{data.solution.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {data.solution.features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {resolveIcon(feature.iconName, "w-24 h-24 text-blue-600")}
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  {resolveIcon(feature.iconName, "w-7 h-7")}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Incluso no plano
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Ecossistema Nextia 360</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{data.ecosystem.title}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">{data.ecosystem.subtitle}</p>
          </div>
          
          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 -translate-y-1/2 -z-10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.ecosystem.pillars.map((pillar, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-purple-300 transition-colors">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-700 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
                    {resolveIcon(pillar.iconName, "w-6 h-6")}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-600">{pillar.description}</p>
                  
                  {pillar.linkSlug && (
                    <Link to={`/solucoes/${pillar.linkSlug}`} className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                      Ver solução <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to={`/solucoes/${data.segmentSlug}`} className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 hover:border-slate-400 rounded-xl font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors min-h-[44px]">
              Conhecer ecossistema completo para {data.segmentName}
            </Link>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">{data.journey.title}</h2>
          
          <div className="space-y-12">
            {data.journey.steps.map((step, index) => (
              <div key={index} className="flex gap-6 md:gap-8 relative">
                {index < data.journey.steps.length - 1 && (
                  <div className="absolute top-12 left-6 bottom-[-3rem] w-px border-l-2 border-dashed border-slate-700"></div>
                )}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl relative z-10 border-4 border-slate-900">
                  {index + 1}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold mb-2 text-slate-100">{step.label}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Context Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{data.localContext.title}</h2>
          </div>
          
          <div className="prose prose-lg prose-slate max-w-none mb-10">
            {data.localContext.paragraphs.map((p, i) => (
              <p key={i} className="text-slate-600">{p}</p>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h3 className="font-bold text-slate-900 mb-6 text-xl">Por que empresas de {data.cityName} escolhem a Nextia:</h3>
            <ul className="space-y-4">
              {data.localContext.points.map((point, index) => (
                <li key={index} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Template Showcase (Optional) */}
      {matchingTemplates.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Modelos otimizados para {data.segmentName}</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">Bases profissionais que podem ser personalizadas para a identidade e as necessidades do seu nicho.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {matchingTemplates.map((template, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-slate-100 p-6 flex items-center justify-center border-b border-slate-200">
                    <TemplateIllustration
                      category={template.categorySlug}
                      slug={template.slug}
                      coverImage={template.coverImage}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{template.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{template.category} • {template.shortDescription}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm">
                        R$ {template.price.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6 flex-1">{template.description}</p>
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Link to={`/demo/${template.slug}`} className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]">
                        Ver modelo
                      </Link>
                      <Link to={`/modelos/${template.slug}?city=${data.citySlug}&segment=${data.segmentSlug}&service=${data.serviceSlug}`} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 min-h-[44px]">
                        Quero este modelo
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead Capture Form Section */}
      <section id="formulario" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Pronto para transformar sua empresa em {data.cityName}?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Preencha o formulário abaixo e receba um orçamento personalizado para a sua necessidade, ou chame agora mesmo no WhatsApp.
            </p>
            
            <div className="space-y-6">
              <a 
                href={getWhatsAppLink('geral', data.hero.whatsappMessage)}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleWhatsAppClick('form_side')}
                className="flex items-center gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Chamar no WhatsApp</h3>
                  <p className="text-slate-600 text-sm mt-1">Resposta em menos de 5 minutos</p>
                </div>
              </a>
              
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">E-mail</h3>
                  <p className="text-slate-600 text-sm mt-1">contato@nextia.dev.br</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h4 className="font-bold text-slate-900 mb-4">Dados da Nextia</h4>
              <p className="text-slate-600 text-sm">CNPJ: 57.285.901/0001-94</p>
              <p className="text-slate-600 text-sm">Atendimento online para todo o Brasil, com foco especial em {data.cityName} e região.</p>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Solicitar orçamento</h3>
              
              {formStatus === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Mensagem enviada com sucesso!</h4>
                  <p className="text-slate-600 mb-6">Nossa equipe entrará em contato em breve para entender melhor sua necessidade.</p>
                  <button onClick={() => setFormStatus('idle')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 min-h-[44px]">
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
                      <input type="text" id={`${formId}-name`} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow" placeholder="Seu nome" />
                    </div>
                    <div>
                      <label htmlFor={`${formId}-company`} className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                      <input type="text" id={`${formId}-company`} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow" placeholder="Nome da empresa (opcional)" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={`${formId}-whatsapp`} className="block text-sm font-medium text-slate-700 mb-1">WhatsApp *</label>
                      <input type="tel" id={`${formId}-whatsapp`} required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow" placeholder="(14) 99999-9999" />
                    </div>
                    <div>
                      <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                      <input type="email" id={`${formId}-email`} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow" placeholder="seu@email.com" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor={`${formId}-goal`} className="block text-sm font-medium text-slate-700 mb-1">Qual o seu principal objetivo? *</label>
                    <select id={`${formId}-goal`} required value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow bg-white">
                      {data.formDefaults.goalOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor={`${formId}-message`} className="block text-sm font-medium text-slate-700 mb-1">Conte um pouco sobre o projeto (opcional)</label>
                    <textarea id={`${formId}-message`} rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-shadow resize-none" placeholder="Detalhes adicionais..."></textarea>
                  </div>
                  
                  {formStatus === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                      Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou nos chame no WhatsApp.
                    </div>
                  )}
                  
                  <button type="submit" disabled={formStatus === 'loading'} className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]">
                    {formStatus === 'loading' ? 'Enviando...' : 'Solicitar orçamento agora'}
                    {!formStatus && <Send className="w-5 h-5 ml-2" />}
                  </button>
                  
                  <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Seus dados estão seguros e não enviamos spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Dúvidas Frequentes</h2>
            <p className="text-lg text-slate-600">Principais perguntas sobre nosso serviço de {data.serviceName} em {data.cityName}.</p>
          </div>
          
          <div className="space-y-4">
            {data.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none min-h-[44px]"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pt-0 text-slate-600">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related Pages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Continue navegando</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Em {data.cityName}
              </h3>
              <ul className="space-y-3">
                <li><Link to={`/${data.citySlug}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors block py-1">Todas as soluções na cidade</Link></li>
                <li><Link to={`/${data.citySlug}/${data.serviceSlug}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors block py-1">{data.serviceName} em {data.cityName}</Link></li>
              </ul>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Para {data.segmentName}
              </h3>
              <ul className="space-y-3">
                <li><Link to={`/solucoes/${data.segmentSlug}`} className="text-sm text-slate-600 hover:text-purple-600 transition-colors block py-1">Estratégia completa</Link></li>
              </ul>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 lg:col-span-2">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Outras soluções
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {data.relatedPages.relatedNichePages.map((page, idx) => (
                  <li key={idx}>
                    <Link to={page.path} className="text-sm text-slate-600 hover:text-emerald-600 transition-colors block py-1 truncate" title={page.label}>
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#07162B] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para dar o próximo passo?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Fale com nossos especialistas e descubra como podemos ajudar a escalar a sua empresa de {data.segmentName} em {data.cityName}.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={getWhatsAppLink('geral', data.hero.whatsappMessage)}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleWhatsAppClick('footer_cta')}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#07162B] bg-[#25D366] hover:bg-[#1EBE5D] rounded-xl transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar no WhatsApp
            </a>
            <a 
              href="#formulario" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-transparent border-2 border-white/20 hover:bg-white/10 rounded-xl transition-colors min-h-[44px]"
            >
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
