import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { getWhatsAppLink } from '../utils/whatsapp';
import Seo from '../components/seo/Seo';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function ServicePage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const services = useServiceCatalog();
  const service = services.find((item) => item.slug === (slug || location.pathname.replace(/^\//, '')));
  if (!service) return <Navigate to="/solucoes" replace />;

  const related = services.filter((item) => item.category === service.category && item.slug !== service.slug).slice(0, 3);
  const price = service.price ? `${money.format(service.price)}${service.recurring ? '/mês' : ''}` : 'Solicite uma análise';

  return (
    <main className="bg-white text-[#07162B]">
      <Seo title={service.name} description={service.summary} path={`/${service.slug}`} />
      <section className="relative overflow-hidden bg-[#07162B] pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 80% 20%, ${service.accent}, transparent 38%)` }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="mb-5 text-base font-bold uppercase" style={{ color: service.accent }}>{service.eyebrow}</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{service.name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{service.summary}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={service.price ? `/checkout?service=${service.slug}` : `/orcamento?servico=${service.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#1677FF] px-6 text-base font-bold text-white hover:bg-[#0F63D8]">
                {service.price ? 'Contratar serviço' : 'Solicitar orçamento'} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href={getWhatsAppLink('geral')} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-base font-bold hover:bg-white/10">
                <MessageCircle className="h-5 w-5" /> Falar com especialista
              </a>
            </div>
          </div>
          <aside className="border-l-4 bg-white p-7 text-[#07162B] shadow-2xl" style={{ borderColor: service.accent }}>
            <p className="text-base font-semibold text-slate-600">{service.priceLabel}</p>
            <p className="mt-2 text-3xl font-black">{price}</p>
            <p className="mt-4 text-base leading-7 text-slate-600">Escopo e prazo confirmados antes do início. Nenhuma cobrança adicional sem aprovação.</p>
          </aside>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-base font-bold" style={{ color: service.accent }}>Solução completa</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Tecnologia aplicada ao resultado</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">{service.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {service.benefits.map((benefit) => (
              <div key={benefit} className="flex min-h-28 items-start gap-3 border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" style={{ color: service.accent }} />
                <span className="text-base font-bold leading-6">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8FC] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-base font-bold" style={{ color: service.accent }}>Entrega organizada</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">O que está incluído</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Você acompanha cada etapa e sabe o que será entregue.</p>
            </div>
            <ol className="grid gap-3">
              {service.deliverables.map((item, index) => (
                <li key={item} className="flex items-center gap-4 border-b border-slate-200 py-5 text-lg font-bold">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base text-white" style={{ backgroundColor: service.accent }}>{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center"><ShieldCheck className="mx-auto h-9 w-9" style={{ color: service.accent }} /><h2 className="mt-4 text-3xl font-black sm:text-4xl">Dúvidas frequentes</h2></div>
          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {service.faq.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none text-lg font-bold">{item.question}</summary><p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p></details>)}
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="bg-[#07162B] py-16 text-white"><div className="mx-auto max-w-7xl px-5 sm:px-8"><h2 className="text-2xl font-black sm:text-3xl">Soluções relacionadas</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{related.map((item) => <Link key={item.slug} to={`/${item.slug}`} className="group border border-white/15 p-6 hover:border-white/40"><p className="text-lg font-bold">{item.name}</p><p className="mt-2 text-base leading-7 text-slate-300">{item.summary}</p><span className="mt-5 inline-flex items-center gap-2 font-bold" style={{ color: item.accent }}>Conhecer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></section>}
    </main>
  );
}
