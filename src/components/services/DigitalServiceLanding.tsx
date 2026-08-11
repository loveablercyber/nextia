import { ArrowRight, Check, CheckCircle2, MessageCircle, MonitorSmartphone, Rocket, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ServiceOffer } from '../../data/serviceCatalog';
import { templates } from '../../data/templates';
import { TemplateIllustration } from '../templates/TemplateIllustration';
import { getWhatsAppLink } from '../../utils/whatsapp';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const content = {
  sites: {
    badge: 'Sites profissionais',
    title: 'Seu negócio merece um site que transmita confiança e gere oportunidades.',
    intro: 'Planejamento, design, desenvolvimento e publicação em uma solução profissional, rápida e preparada para todos os dispositivos.',
    sectionTitle: 'Tudo o que um site profissional precisa',
    sectionText: 'Uma estrutura completa para apresentar sua empresa, ser encontrada e transformar visitas em contatos.',
    modelSlugs: ['restaurante-premium', 'salao-elegance', 'servicos-profissionais', 'clinica-estetica'],
  },
  'landing-pages': {
    badge: 'Landing pages',
    title: 'Páginas estratégicas para transformar campanhas em novos contatos.',
    intro: 'Landing pages rápidas e objetivas, construídas para apresentar uma oferta, captar leads e medir resultados com clareza.',
    sectionTitle: 'Uma página focada em conversão',
    sectionText: 'Mensagem direta, experiência responsiva e integrações essenciais para suas campanhas digitais.',
    modelSlugs: ['servicos-profissionais', 'clinica-estetica', 'restaurante-premium'],
  },
  'lojas-virtuais': {
    badge: 'Lojas virtuais',
    title: 'Sua operação de vendas online pronta para crescer com segurança.',
    intro: 'Catálogo, checkout, pagamentos e gestão de pedidos em uma experiência profissional para sua marca e seus clientes.',
    sectionTitle: 'Estrutura completa para vender online',
    sectionText: 'Da apresentação dos produtos ao recebimento dos pedidos, com configuração e treinamento para sua equipe.',
    modelSlugs: ['loja-catalogo', 'restaurante-premium'],
  },
} as const;

export function isDigitalShowcase(slug: string): slug is keyof typeof content {
  return slug in content;
}

export default function DigitalServiceLanding({ service }: { service: ServiceOffer }) {
  if (!isDigitalShowcase(service.slug)) return null;
  const page = content[service.slug];
  const models = page.modelSlugs.map((slug) => templates.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const price = service.price ? money.format(service.price) : 'Sob orçamento';

  return <>
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#171342] to-[#1E1B4B] pb-20 pt-32 text-white lg:pt-40">
      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 78% 22%, ${service.accent}, transparent 34%)` }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">
        <div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold"><Sparkles className="h-4 w-4" />{page.badge}</span><h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-[-.04em] sm:text-5xl lg:text-[58px]">{page.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{page.intro}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to={`/orcamento?servico=${service.slug}`} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-7 text-base font-extrabold text-white shadow-lg">Solicitar orçamento <ArrowRight className="h-5 w-5" /></Link><a href={getWhatsAppLink('geral')} target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/30 px-7 text-base font-extrabold hover:bg-white/10"><MessageCircle className="h-5 w-5" /> Falar com especialista</a></div></div>
        <aside className="rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur"><div className="rounded-2xl bg-white p-7 text-[#10152B]"><p className="text-sm font-bold" style={{ color: service.accent }}>{service.priceLabel}</p><p className="mt-2 text-4xl font-black">{price}{service.recurring && <span className="text-base text-slate-500">/mês</span>}</p><p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p><div className="mt-6 space-y-3">{service.benefits.slice(0, 4).map((item) => <p key={item} className="flex items-center gap-2 text-sm font-bold"><Check className="h-4 w-4" style={{ color: service.accent }} />{item}</p>)}</div></div></aside>
      </div>
    </section>

    <section className="bg-[#FAFAFA] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="mx-auto max-w-3xl text-center"><h2 className="text-3xl font-black tracking-tight sm:text-4xl">{page.sectionTitle}</h2><p className="mt-3 text-lg leading-8 text-slate-600">{page.sectionText}</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{service.benefits.map((benefit, index) => { const Icon = [MonitorSmartphone, Search, Rocket, ShieldCheck][index % 4]; return <article key={benefit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ color: service.accent, backgroundColor: service.soft }}><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-xl font-black">{benefit}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Incluído no escopo padrão, com configuração alinhada às necessidades do projeto.</p></article>; })}</div></div></section>

    <section className="py-20"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-extrabold uppercase tracking-widest" style={{ color: service.accent }}>Entrega organizada</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Do planejamento à publicação</h2><p className="mt-4 text-lg leading-8 text-slate-600">Você acompanha cada etapa e valida o trabalho antes da entrega.</p></div><div className="grid gap-4 sm:grid-cols-2">{service.deliverables.map((item, index) => <article key={item} className="rounded-2xl border border-slate-200 p-5"><span className="text-sm font-black" style={{ color: service.accent }}>0{index + 1}</span><h3 className="mt-3 text-lg font-black">{item}</h3><CheckCircle2 className="mt-4 h-5 w-5" style={{ color: service.accent }} /></article>)}</div></div></section>

    {models.length > 0 && <section className="bg-[#FAFAFA] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black sm:text-4xl">Veja algumas bases visuais</h2><p className="mt-2 text-lg text-slate-600">Escolha um modelo e personalizamos o conteúdo para a sua marca.</p></div><Link to="/sites-prontos" className="inline-flex items-center gap-2 font-extrabold text-[#5B4FE9]">Ver catálogo completo <ArrowRight className="h-5 w-5" /></Link></div><div className={`mt-9 grid gap-5 sm:grid-cols-2 ${models.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>{models.map((template) => <article key={template.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="aspect-[16/10]"><TemplateIllustration category={template.categorySlug} slug={template.slug} /></div><div className="p-5"><p className="text-sm font-bold text-[#5B4FE9]">{template.category}</p><h3 className="mt-1 text-xl font-black">{template.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{template.shortDescription}</p><Link to={`/templates/${template.slug}`} className="mt-5 flex min-h-11 items-center justify-center rounded-xl border-2 border-[#5B4FE9] text-sm font-extrabold text-[#5B4FE9] hover:bg-[#5B4FE9] hover:text-white">Ver modelo</Link></div></article>)}</div></div></section>}

    <section className="py-20"><div className="mx-auto max-w-4xl px-5 sm:px-8"><h2 className="text-center text-3xl font-black sm:text-4xl">Dúvidas frequentes</h2><div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">{service.faq.map((item) => <details key={item.question} className="py-5"><summary className="cursor-pointer text-lg font-bold">{item.question}</summary><p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p></details>)}</div></div></section>
  </>;
}
