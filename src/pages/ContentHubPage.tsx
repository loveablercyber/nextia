import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { trackEvent } from '../utils/whatsapp';

type ContentCard = { id:string; title:string; slug:string; excerpt:string; author_name_snapshot:string; pillar:string; topic:string; published_at:string };

const pillarNames: Record<string,string> = { 'presenca-digital':'Presença digital', 'automacao-responsavel':'Automação responsável', 'operacao-ti':'Operação e suporte de TI' };

export default function ContentHubPage() {
  const [contents,setContents] = useState<ContentCard[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    trackEvent('organic_landing_view', { page_type:'content_hub', path:window.location.pathname });
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setContents(data.contents || [])).catch(() => setContents([])).finally(() => setLoading(false));
  }, []);
  return <main className="min-h-screen bg-[#F7F8FC] pb-20">
    <Seo title="Conteúdos sobre tecnologia para empresas" description="Guias e conteúdos revisados pela equipe Nextia sobre presença digital, automação responsável e operação de TI." path="/conteudos" />
    <section className="bg-[#11132B] pb-16 pt-32 text-white"><div className="mx-auto max-w-6xl px-5"><p className="text-sm font-black uppercase tracking-[.2em] text-violet-300">Conteúdo revisado por pessoas</p><h1 className="mt-4 max-w-3xl text-4xl font-black sm:text-6xl">Tecnologia explicada para decisões reais</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Conteúdo útil, sem promessas de resultado garantido, conectado às soluções e ao processo comercial existente da Nextia.</p></div></section>
    <section className="mx-auto max-w-6xl px-5 py-14" aria-busy={loading}>{loading ? <p>Carregando conteúdos…</p> : contents.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{contents.map((item) => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"><span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{pillarNames[item.pillar] || item.pillar}</span><h2 className="mt-5 text-2xl font-black"><Link to={`/conteudos/${item.slug}`} className="hover:text-[#5145D7]">{item.title}</Link></h2><p className="mt-3 flex-1 leading-7 text-slate-600">{item.excerpt}</p><p className="mt-5 text-xs text-slate-500">Por {item.author_name_snapshot} · {new Date(item.published_at).toLocaleDateString('pt-BR')}</p><Link to={`/conteudos/${item.slug}`} onClick={() => trackEvent('content_view', { content_slug:item.slug, source_page:'content_hub' })} className="mt-5 inline-flex min-h-11 items-center gap-2 font-black text-[#5145D7]">Ler conteúdo <ArrowRight className="h-4 w-4" /></Link></article>)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><BookOpen className="mx-auto h-10 w-10 text-violet-500"/><h2 className="mt-4 text-2xl font-black">Nenhum conteúdo publicado ainda</h2><p className="mx-auto mt-3 max-w-xl text-slate-600">Rascunhos e materiais em revisão não aparecem aqui. O primeiro conteúdo será exibido somente após aprovação editorial.</p><Link to="/solucoes" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#5B4FE9] px-5 font-bold text-white">Conhecer soluções</Link></div>}</section>
  </main>;
}
