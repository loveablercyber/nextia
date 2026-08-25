import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Activity,
  ArrowRight,
  Bot,
  Briefcase,
  Globe,
  Heart,
  HeartPulse,
  Home,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react';
import type { SegmentData } from '../data/segments';
import { SEGMENTS, SEGMENT_CATEGORIES } from '../data/segments';
import { getWhatsAppLink } from '../utils/whatsapp';

export default function SolucoesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allSegments = useMemo(() => {
    return Object.values(SEGMENTS).filter((seg) => seg.status === 'published');
  }, []);

  const filteredSegments = useMemo(() => {
    return allSegments.filter((seg) => {
      const matchCategory = selectedCategory === 'Todos' || seg.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        seg.name.toLowerCase().includes(query) ||
        seg.pluralName.toLowerCase().includes(query) ||
        seg.metaDescription.toLowerCase().includes(query) ||
        seg.keywords.some((k) => k.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [allSegments, selectedCategory, searchQuery]);

  const getSegmentIcon = (slug: string) => {
    const map: Record<string, React.ReactNode> = {
      contabilidade: <Briefcase className="w-6 h-6 text-[#1677FF]" />,
      pizzarias: <Utensils className="w-6 h-6 text-[#FF6B00]" />,
      advocacia: <Scale className="w-6 h-6 text-[#D4AF37]" />,
      clinicas: <HeartPulse className="w-6 h-6 text-[#0D9488]" />,
      dentistas: <Sparkles className="w-6 h-6 text-[#0284C7]" />,
      imobiliarias: <Home className="w-6 h-6 text-[#2563EB]" />,
      'pet-shops': <Heart className="w-6 h-6 text-[#10B981]" />,
      restaurantes: <Utensils className="w-6 h-6 text-[#DC2626]" />,
      academias: <Activity className="w-6 h-6 text-[#EAB308]" />,
      lojas: <ShoppingBag className="w-6 h-6 text-[#8B5CF6]" />,
      'prestadores-de-servicos': <Briefcase className="w-6 h-6 text-[#2563FF]" />,
    };
    return map[slug] || <Zap className="w-6 h-6 text-blue-400" />;
  };

  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/solucoes`;

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Soluções Digitais por Segmento | Nextia',
    description: 'Conheça as soluções de tecnologia da Nextia para contabilidade, advocacia, clínicas, pizzarias, imobiliárias, lojas e diversos outros segmentos.',
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: 'Nextia',
      url: baseUrl,
      telephone: '+5514996405496',
    },
  };

  return (
    <>
      <Helmet>
        <title>Soluções por Segmento: Tecnologia para Cada Tipo de Empresa | Nextia</title>
        <meta
          name="description"
          content="Soluções digitais combinadas para contabilidade, advocacia, clínicas, pizzarias, imobiliárias, pet shops e lojas. Centralize sua tecnologia com a Nextia."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Soluções por Segmento: Tecnologia para Cada Tipo de Empresa | Nextia" />
        <meta
          property="og:description"
          content="Sites profissionais, automações de atendimento, WhatsApp com IA e infraestrutura especializada por setor."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      <main className="bg-[#07162B] text-white min-h-screen pt-24 pb-20">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-[#07162B] via-[#0C1B33] to-[#07162B] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2086FF] block mb-3">
                Arquitetura por Segmento
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                Tecnologia Sob Medida para o Seu Mercado
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                Em vez de ferramentas genéricas e desconectadas, a Nextia entrega ecossistemas completos configurados especificamente para as necessidades operacionais do seu setor.
              </p>
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-4 pt-4">
              <div className="relative max-w-xl">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por segmento (ex: contabilidade, pizzaria, clínica, advocacia)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#2086FF] focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SEGMENT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-[#1677FF] text-white shadow-md'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Segments Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-base text-slate-400 mb-4">Nenhum segmento encontrado para sua busca.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('Todos'); setSearchQuery(''); }}
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                Limpar filtros e ver todos os segmentos
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSegments.map((segment: SegmentData) => (
                <Link
                  key={segment.slug}
                  to={`/solucoes/${segment.slug}`}
                  className="group rounded-2xl bg-[#0B1A2F] border border-white/10 p-7 flex flex-col justify-between hover:border-white/20 hover:bg-[#0D203A] transition-all shadow-lg hover:shadow-2xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getSegmentIcon(segment.slug)}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5">
                        {segment.category}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {segment.name}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {segment.heroSubtitle}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Recursos inclusos:
                      </span>
                      {segment.solutions.slice(0, 3).map((sol, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="truncate">{sol.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    <span>Ver soluções para {segment.pluralName.toLowerCase()}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Nextia 360 Strategic Overview */}
        <section className="bg-[#050E1C] border-t border-white/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Conceito Nextia 360
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                Um Único Ecossistema de Tecnologia
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Em vez de contratar uma agência para o site, outra empresa para o WhatsApp, um terceiro para o suporte de computadores e outro para redes, sua empresa centraliza tudo na Nextia.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <Globe className="w-6 h-6 text-blue-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Presença & Captação</h3>
                <p className="text-xs text-slate-400">Sites rápidos e páginas otimizadas para busca no Google.</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <Bot className="w-6 h-6 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Atendimento & IA</h3>
                <p className="text-xs text-slate-400">Automação de WhatsApp e triagem inteligente de contatos.</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Suporte & TI</h3>
                <p className="text-xs text-slate-400">Manutenção de computadores, redes corporativas e Wi-Fi.</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Automação & Dados</h3>
                <p className="text-xs text-slate-400">Integração de ferramentas, backups e rotinas operacionais.</p>
              </div>
            </div>

            {/* Custom Project CTA */}
            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-blue-500/20 text-center max-w-3xl mx-auto space-y-4">
              <h3 className="text-xl font-bold text-white">Não encontrou o seu segmento na lista?</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Desenvolvemos soluções personalizadas para indústrias, distribuidoras, escolas, cursos, oficinas, profissionais liberais e empresas B2B.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/projeto-personalizado"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1677FF] hover:bg-[#1D4ED8] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all"
                >
                  Solicitar Projeto Personalizado <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={getWhatsAppLink('geral', 'Olá! Gostaria de consultar soluções Nextia para o meu segmento.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all"
                >
                  <Phone className="w-4 h-4 text-[#16A36A]" /> Conversar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
