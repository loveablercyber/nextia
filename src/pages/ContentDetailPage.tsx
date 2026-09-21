import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import SafeMarkdown from '../components/content/SafeMarkdown';
import { trackEvent } from '../utils/whatsapp';

type Content = { title:string;slug:string;excerpt:string;content_markdown:string;author_name_snapshot:string;pillar:string;topic:string;seo_title:string;seo_description:string;canonical_url:string|null;og_image_url:string|null;indexing_policy:'index'|'noindex';related_paths:string[];related_service_slug:string|null;cta_label:string;cta_path:string;published_at:string;updated_at:string };

export default function ContentDetailPage() {
  const { slug } = useParams();
  const [content,setContent] = useState<Content|null|undefined>(undefined);
  useEffect(() => {
    fetch(`/api/content/${encodeURIComponent(slug || '')}`).then(async (response) => response.ok ? (await response.json()).content : null).then(setContent).catch(() => setContent(null));
  }, [slug]);
  useEffect(() => { if (content) trackEvent('content_view', { content_slug:content.slug, pillar:content.pillar, topic:content.topic }); }, [content]);
  if (content === undefined) return <main className="min-h-[70vh] px-5 pt-32">Carregando conteúdo…</main>;
  if (!content) return <main className="flex min-h-[70vh] items-center justify-center px-5 text-center"><Seo title="Conteúdo não encontrado" description="O conteúdo solicitado não está publicado." path={`/conteudos/${slug || ''}`} noindex /><div><h1 className="text-3xl font-black">Conteúdo não encontrado</h1><p className="mt-3 text-slate-600">O material não existe, está em revisão ou foi arquivado.</p><Link to="/conteudos" className="mt-6 inline-flex rounded-xl bg-[#5B4FE9] px-5 py-3 font-black text-white">Ver conteúdos publicados</Link></div></main>;
  const path = content.canonical_url?.startsWith('/') ? content.canonical_url : `/conteudos/${content.slug}`;
  const cta = `${content.cta_path}${content.cta_path.includes('?') ? '&' : '?'}content=${encodeURIComponent(content.slug)}&source_page=conteudo`;
  const baseUrl = (import.meta.env.VITE_PUBLIC_URL || 'https://nextia.dev.br').replace(/\/$/, '');
  const articleSchema = { '@context':'https://schema.org','@type':'Article',headline:content.title,description:content.excerpt,datePublished:content.published_at,dateModified:content.updated_at,author:{'@type':'Organization',name:content.author_name_snapshot},publisher:{'@type':'Organization',name:'Nextia',url:baseUrl},mainEntityOfPage:`${baseUrl}/conteudos/${content.slug}` };
  const breadcrumbSchema = { '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:baseUrl},{'@type':'ListItem',position:2,name:'Conteúdos',item:`${baseUrl}/conteudos`},{'@type':'ListItem',position:3,name:content.title,item:`${baseUrl}/conteudos/${content.slug}`}] };
  return <main className="min-h-screen bg-white pb-20 pt-28">
    <Seo title={content.seo_title || content.title} description={content.seo_description || content.excerpt} path={path} noindex={content.indexing_policy === 'noindex'} image={content.og_image_url || undefined} type="article" />
    <script type="application/ld+json">{JSON.stringify(articleSchema)}</script><script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    <article className="mx-auto max-w-3xl px-5"><nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><Link to="/">Início</Link><ChevronRight className="h-4 w-4"/><Link to="/conteudos">Conteúdos</Link><ChevronRight className="h-4 w-4"/><span aria-current="page">{content.topic}</span></nav><p className="mt-10 text-sm font-black uppercase tracking-[.18em] text-violet-600">{content.topic}</p><h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{content.title}</h1><p className="mt-6 text-xl leading-8 text-slate-600">{content.excerpt}</p><p className="mt-6 border-b border-slate-200 pb-8 text-sm text-slate-500">Por {content.author_name_snapshot} · atualizado em {new Date(content.updated_at).toLocaleDateString('pt-BR')}</p><div className="py-6 text-lg"><SafeMarkdown content={content.content_markdown}/></div><section className="mt-12 rounded-3xl bg-violet-50 p-7"><h2 className="text-2xl font-black">Próximo passo</h2><p className="mt-3 text-slate-700">Converse com a Nextia sobre como aplicar este tema à realidade da sua empresa.</p><Link to={cta} onClick={() => trackEvent('content_cta_click', { content_slug:content.slug, cta_path:content.cta_path, service_slug:content.related_service_slug })} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#5B4FE9] px-5 font-black text-white">{content.cta_label}<ArrowRight className="h-5 w-5"/></Link></section>{content.related_paths.length > 0 && <section className="mt-12"><h2 className="text-2xl font-black">Conteúdo e soluções relacionadas</h2><ul className="mt-5 grid gap-3">{content.related_paths.map((path) => <li key={path}><Link to={path} className="inline-flex items-center gap-2 font-bold text-[#5145D7]">Acessar página relacionada <ArrowRight className="h-4 w-4"/></Link></li>)}</ul></section>}</article>
  </main>;
}
