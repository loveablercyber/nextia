import { ArrowRight, Check, ChevronLeft, ExternalLink, Layers3, MessageCircle, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { getPortfolioProjectBySlug } from '../data/portfolio';
import { getWhatsAppLink } from '../utils/whatsapp';

export default function PortfolioDetailPage() {
  const { slug } = useParams();
  const project = getPortfolioProjectBySlug(slug);

  if (!project) return <main className="flex min-h-[70vh] items-center justify-center px-5 text-center"><Seo title="Projeto não publicado" description="O projeto solicitado não está publicado." path={`/portfolio/${slug || ''}`} noindex /><div><h1 className="text-3xl font-black">Projeto não publicado</h1><p className="mt-3 text-slate-600">O projeto não existe ou ainda não possui autorização e conteúdo suficientes.</p><Link to="/" className="mt-6 inline-flex rounded-xl bg-[#5B4FE9] px-5 py-3 font-black text-white">Voltar ao início</Link></div></main>;

  const whatsapp = getWhatsAppLink('orcamento', `Olá! Vi o projeto ${project.name} no portfólio da Nextia e gostaria de solicitar uma solução baseada nas necessidades da minha empresa.`);

  return <main className="min-h-screen bg-[#F7F8FC] text-[#10152B]">
    <Seo title={`${project.clientName || project.name} — Case de projeto | Nextia`} description={project.description} path={`/portfolio/${project.slug}`} />

    <section className="relative overflow-hidden bg-[#11132B] pb-16 pt-28 text-white lg:pb-20 lg:pt-36">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#2563FF]/20 blur-3xl" /><div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#9147FF]/25 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr]">
        <div><Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white"><ChevronLeft className="h-4 w-4" /> Voltar ao início</Link><span className="mt-8 flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300"><Sparkles className="h-4 w-4" /> Case de cliente</span><h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.04em] sm:text-6xl">{project.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{project.description}</p><div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-slate-200"><span className="rounded-full border border-white/15 px-4 py-2">{project.segment}</span><span className="rounded-full border border-white/15 px-4 py-2">{project.projectType}</span></div>{project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-black text-[#4031C8] transition hover:-translate-y-0.5">Visitar CarolSol <ExternalLink className="h-4 w-4" /></a>}</div>
        <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-2 shadow-[0_30px_80px_rgba(0,0,0,.35)]"><img src={project.images[0].src} alt={project.images[0].alt} width="1200" height="900" className="aspect-[4/3] w-full rounded-[24px] object-cover" /></div>
      </div>
    </section>

    <div className="mx-auto max-w-7xl space-y-20 px-5 py-16 sm:px-8 lg:py-20">
      <section><p className="text-sm font-black uppercase tracking-[.2em] text-[#6535D9]">Visão do projeto</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Uma plataforma para conectar todas as frentes da marca.</h2><div className="mt-9 grid gap-6 lg:grid-cols-2"><Block title="O desafio" text={project.challenge} /><Block title="A solução" text={project.solution} /></div></section>

      <section className="grid gap-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9 lg:grid-cols-2 lg:p-12"><div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-[#6535D9]"><Layers3 className="h-6 w-6" /></span><h2 className="mt-5 text-2xl font-black">Estratégia e entregas</h2><p className="mt-2 leading-7 text-slate-600">Da arquitetura da experiência às operações que sustentam o ecossistema.</p><List items={project.services} /></div><div className="rounded-3xl bg-[#F5F3FF] p-6 sm:p-8"><h2 className="text-2xl font-black">Funcionalidades implementadas</h2><List items={project.results} /></div></section>

      <section><div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.2em] text-[#6535D9]">Tecnologia</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ferramentas usadas no projeto</h2><p className="mt-3 text-[17px] leading-7 text-slate-600">Uma base moderna para entregar velocidade, segurança, integração e evolução contínua.</p></div><div className="mt-8 flex flex-wrap gap-3">{project.technologies.map(technology => <span key={technology} className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-black text-[#5145D7] shadow-sm">{technology}</span>)}</div></section>

      <section><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-[.2em] text-[#6535D9]">Galeria</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Um ecossistema, várias experiências</h2></div>{project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-black text-[#5145D7]">Conhecer o projeto online <ArrowRight className="h-4 w-4" /></a>}</div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{project.images.slice(1).map((image, index) => <figure key={image.src} className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${index === 0 ? 'lg:col-span-2' : ''}`}><img src={image.src} alt={image.alt} loading="lazy" width="1200" height="800" className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /></figure>)}</div></section>

      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-6 py-12 text-center text-white sm:px-10"><div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_20%),radial-gradient(circle_at_80%_80%,white,transparent_18%)]" /><div className="relative"><h2 className="text-3xl font-black sm:text-4xl">Quer construir uma experiência digital completa?</h2><p className="mx-auto mt-4 max-w-2xl text-[17px] leading-7 text-white/85">A Nextia pode planejar e desenvolver uma solução alinhada à operação e aos objetivos da sua empresa.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to={`/projeto-personalizado?source_page=portfolio&project=${project.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 font-black text-[#5145D7]">Solicitar projeto semelhante</Link><a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/50 px-6 font-black"><MessageCircle className="h-5 w-5" /> Falar com especialista</a></div></div></section>
    </div>
  </main>;
}

function Block({ title, text }: { title: string; text: string }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><h3 className="text-sm font-black uppercase tracking-[.18em] text-[#5B4FE9]">{title}</h3><p className="mt-4 text-[17px] leading-8 text-slate-700">{text}</p></article>;
}

function List({ items }: { items: string[] }) {
  return <ul className="mt-6 space-y-4">{items.map(item => <li key={item} className="flex gap-3 leading-7 text-slate-700"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3.5 w-3.5 text-emerald-700" /></span>{item}</li>)}</ul>;
}
