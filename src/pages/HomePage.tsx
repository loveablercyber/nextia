import { ArrowRight, Bot, Check, ChevronRight, CloudCog, Code2, Headphones, MessageCircle, Network, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/nextia-hero-v2.png';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useCommercialPlans } from '../hooks/useCommercialPlans';
import { getWhatsAppLink } from '../utils/whatsapp';
import Seo from '../components/seo/Seo';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const icons = [Code2, Bot, Headphones, Network, ShieldCheck];
const proof = [
  ['Um único parceiro', 'Projetos digitais, suporte e infraestrutura coordenados pela mesma equipe.'],
  ['Escopo transparente', 'Você aprova preço, prazo e entregáveis antes de qualquer execução.'],
  ['Acompanhamento real', 'Pedidos, arquivos, pagamentos e suporte reunidos no painel do cliente.'],
];

export default function HomePage() {
  const services = useServiceCatalog();
  const plans = useCommercialPlans();
  const highlights = ['sites', 'automacao-ia', 'techcare', 'redes-wifi', 'cameras-seguranca']
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));
  return <main className="bg-white text-[#07162B]">
    <Seo title="Nextia - Tecnologia completa para empresas" description="Sites, automação, suporte de TI, redes, câmeras e backup empresarial com atendimento integrado em Bauru e em todo o Brasil." />
    <section className="relative flex min-h-[720px] items-center overflow-hidden bg-[#07162B] pt-20 text-white">
      <img src={heroImage} alt="Especialista Nextia orientando uma empresa sobre tecnologia, rede e segurança" className="absolute inset-0 h-full w-full object-cover object-[68%_center]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,22,43,.98)_0%,rgba(7,22,43,.92)_38%,rgba(7,22,43,.28)_72%,rgba(7,22,43,.12)_100%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 text-base font-bold text-[#F1CC76]"><Star className="h-5 w-5 fill-current" /> Tecnologia completa para sua empresa</p>
          <h1 className="text-4xl font-black leading-[1.08] sm:text-5xl lg:text-7xl">Tudo o que seu negócio precisa para crescer com tecnologia.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">Sites, automação, suporte de TI, redes, câmeras e backup em uma operação integrada, com atendimento humano e acompanhamento claro.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/solucoes" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-7 text-lg font-bold hover:bg-[#0F63D8]">Conhecer soluções <ArrowRight className="h-5 w-5" /></Link>
            <a href={getWhatsAppLink('geral')} target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/40 bg-[#07162B]/40 px-7 text-lg font-bold backdrop-blur-sm hover:bg-white/10"><MessageCircle className="h-5 w-5" /> Falar com especialista</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-base text-slate-200"><span className="flex items-center gap-2"><Check className="h-5 w-5 text-[#35B7FF]" /> Atendimento em Bauru e região</span><span className="flex items-center gap-2"><Check className="h-5 w-5 text-[#35B7FF]" /> Projetos em todo o Brasil</span></div>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl"><p className="text-base font-bold text-[#1677FF]">Encontre o que precisa</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Cinco frentes, uma só Nextia</h2><p className="mt-4 text-lg leading-8 text-slate-600">Comece por uma necessidade específica ou combine serviços em uma solução completa.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {highlights.map((service, index) => { const Icon = icons[index]; return <Link key={service.slug} to={`/${service.slug}`} className="group flex min-h-72 flex-col border-t-4 bg-white p-6 shadow-[0_10px_35px_rgba(7,22,43,.10)] transition-transform hover:-translate-y-1" style={{ borderColor: service.accent }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ color: service.accent, backgroundColor: service.soft }}><Icon className="h-6 w-6" /></span>
            <h3 className="mt-6 text-xl font-black">{service.name}</h3><p className="mt-3 flex-1 text-base leading-7 text-slate-600">{service.summary}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-base font-bold" style={{ color: service.accent }}>Conhecer <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
          </Link>; })}
        </div>
      </div>
    </section>

    <section className="bg-[#F4F8FC] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-base font-bold text-[#7C5CFF]">Do problema à solução</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Tecnologia sem fornecedores desconectados</h2></div><p className="text-lg leading-8 text-slate-600">A Nextia conecta estratégia digital e operação técnica. Assim, o site, as automações e a infraestrutura evoluem com decisões coerentes e responsabilidade definida.</p></div>
        <div className="mt-12 grid gap-px bg-slate-200 lg:grid-cols-3">{proof.map(([title, text], index) => <article key={title} className="bg-white p-8"><span className="text-4xl font-black text-slate-200">0{index + 1}</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 text-base leading-7 text-slate-600">{text}</p></article>)}</div>
      </div>
    </section>

    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center"><p className="text-base font-bold text-[#1677FF]">Contratação simples</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Serviços com preço de entrada claro</h2><p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Os valores abaixo representam o escopo padrão. Projetos personalizados recebem orçamento antes da execução.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{services.filter((item) => item.price).slice(0, 8).map((service) => <article key={service.slug} className="flex flex-col border border-slate-200 bg-white p-6 shadow-sm"><p className="text-base font-bold" style={{ color: service.accent }}>{service.eyebrow}</p><h3 className="mt-2 text-xl font-black">{service.name}</h3><p className="mt-5 text-base text-slate-500">{service.priceLabel}</p><p className="mt-1 text-3xl font-black">{money.format(service.price!)}{service.recurring && <span className="text-base font-semibold text-slate-500">/mês</span>}</p><Link to={`/${service.slug}`} className="mt-6 inline-flex min-h-11 items-center justify-between border-t border-slate-200 pt-4 text-base font-bold">Ver detalhes <ArrowRight className="h-5 w-5" /></Link></article>)}</div>
      </div>
    </section>

    <section className="bg-[#07162B] py-20 text-white lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-base font-bold text-[#F1CC76]">Planos digitais</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Presença digital que continua evoluindo</h2></div><Link to="/planos" className="inline-flex min-h-12 items-center gap-2 text-lg font-bold text-[#35B7FF]">Comparar todos os planos <ArrowRight className="h-5 w-5" /></Link></div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">{plans.filter((plan) => plan.price > 0).map((plan) => <article key={plan.id} className={`border p-7 ${plan.highlight ? 'border-[#D6A84B] bg-white text-[#07162B]' : 'border-white/20 bg-white/5'}`}><p className="text-xl font-black">{plan.name}</p><p className={`mt-2 text-base leading-7 ${plan.highlight ? 'text-slate-600' : 'text-slate-300'}`}>{plan.subtitle}</p><p className="mt-6 text-4xl font-black">{money.format(plan.price)}<span className="text-base font-semibold opacity-70">/mês</span></p><ul className="mt-6 space-y-3">{plan.features.slice(0, 5).map((feature) => <li key={feature} className="flex gap-2 text-base"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#35B7FF]" />{feature}</li>)}</ul><Link to={`/planos#${plan.id}`} className="mt-8 flex min-h-12 items-center justify-center rounded-lg bg-[#1677FF] px-5 text-base font-bold text-white">{plan.ctaLabel}</Link></article>)}</div>
      </div>
    </section>

    <section className="bg-white py-20 lg:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><CloudCog className="h-10 w-10 text-[#D6A84B]" /><h2 className="mt-5 text-3xl font-black sm:text-4xl">Pronto para organizar a tecnologia da sua empresa?</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Conte o que precisa resolver. A equipe avalia o cenário e indica o caminho mais direto.</p></div><a href={getWhatsAppLink('geral')} target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-7 text-lg font-bold text-white hover:bg-[#0F63D8]">Solicitar atendimento <ArrowRight className="h-5 w-5" /></a></div></section>
  </main>;
}
