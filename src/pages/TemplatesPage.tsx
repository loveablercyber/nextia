import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import TemplateCard from '../components/templates/TemplateCard';
import { templates } from '../data/templates';
import { getTemplateMetadata, isPublishedTemplate } from '../data/templateMetadata';
import { trackEvent } from '../utils/whatsapp';

const all = 'todos';

export default function TemplatesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('busca') || '');
  const [segment, setSegment] = useState(params.get('categoria') || all);
  const [type, setType] = useState(params.get('tipo') || all);
  const [style, setStyle] = useState(params.get('estilo') || all);
  const [order, setOrder] = useState(params.get('ordem') || 'destaques');
  const published = useMemo(() => templates.filter(isPublishedTemplate), []);
  const segments = useMemo(() => [...new Map(published.map(item => [item.categorySlug, item.category])).entries()], [published]);
  const types = useMemo(() => [...new Set(published.map(item => getTemplateMetadata(item).type))], [published]);
  const styles = useMemo(() => [...new Set(published.map(item => getTemplateMetadata(item).style))], [published]);

  useEffect(() => { trackEvent('view_template_gallery', { source_page: window.location.pathname }); }, []);

  const filtered = useMemo(() => published.filter(template => {
    const meta = getTemplateMetadata(template);
    const haystack = [template.name, template.category, template.description, ...template.features, ...meta.tags, meta.type, meta.style].join(' ').toLocaleLowerCase('pt-BR');
    return (segment === all || template.categorySlug === segment) && (type === all || meta.type === type) && (style === all || meta.style === style) && haystack.includes(search.trim().toLocaleLowerCase('pt-BR'));
  }).sort((a, b) => order === 'alfabetica' ? a.name.localeCompare(b.name, 'pt-BR') : Number(b.featured) - Number(a.featured)), [published, search, segment, type, style, order]);

  const sync = (next: Record<string, string>) => {
    const updated = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => value && value !== all && value !== 'destaques' ? updated.set(key, value) : updated.delete(key));
    setParams(updated, { replace: true });
  };
  const reset = () => { setSearch(''); setSegment(all); setType(all); setStyle(all); setOrder('destaques'); setParams({}, { replace: true }); };

  return <main className="min-h-screen bg-[#F7F8FC]">
    <Seo title="Modelos de Sites Profissionais | Nextia" description="Veja modelos de sites profissionais para diferentes tipos de negócio e escolha uma base para personalizar seu projeto com a Nextia." path="/modelos" />
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#17133D] to-[#1E1B4B] pb-20 pt-32 text-white">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_75%_35%,#7C5CFF_0,transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8"><p className="text-sm font-black uppercase tracking-[.2em] text-violet-300">Bases profissionais personalizáveis</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Modelos de Sites Profissionais</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Encontre um estilo para seu negócio, visualize a demonstração e personalize o projeto com a Nextia.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#galeria" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-black text-[#352A9B]">Encontrar meu modelo <ArrowRight className="h-5 w-5" /></a><Link to="/projeto-personalizado?source_page=modelos" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 font-black text-white">Quero um projeto personalizado</Link></div></div>
    </section>
    <section id="galeria" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><label className="sr-only" htmlFor="model-search">Buscar modelos</label><input id="model-search" value={search} onChange={event => { setSearch(event.target.value); sync({ busca: event.target.value }); }} placeholder="Buscar por nome, segmento ou funcionalidade" className="min-h-12 w-full rounded-xl border border-slate-300 pl-12 pr-12 text-base outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-violet-100" />{search && <button aria-label="Limpar busca" onClick={() => { setSearch(''); sync({ busca: '' }); }} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="h-5 w-5" /></button>}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-4"><Filter label="Segmento" value={segment} options={segments} onChange={value => { setSegment(value); sync({ categoria: value }); }} /><Filter label="Tipo" value={type} options={types.map(value => [value, value])} onChange={value => { setType(value); sync({ tipo: value }); }} /><Filter label="Estilo" value={style} options={styles.map(value => [value, value])} onChange={value => { setStyle(value); sync({ estilo: value }); }} /><Filter label="Ordenar" value={order} options={[["destaques", "Destaques"], ["alfabetica", "Ordem alfabética"]]} onChange={value => { setOrder(value); sync({ ordem: value }); }} /></div>
      </div>
      <div className="mb-7 mt-8 flex items-center justify-between gap-4"><p className="text-slate-600"><strong className="text-slate-950">{filtered.length}</strong> modelo{filtered.length === 1 ? '' : 's'} publicado{filtered.length === 1 ? '' : 's'}</p><span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><SlidersHorizontal className="h-4 w-4" /> Filtros não criam páginas duplicadas</span></div>
      {filtered.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map(template => <TemplateCard key={template.id} template={template} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="text-2xl font-black">Ainda não há modelos publicados nesta categoria.</h2><p className="mt-3 text-slate-600">Podemos desenvolver uma estrutura específica para sua empresa.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={reset} className="min-h-11 rounded-xl border border-slate-300 px-5 font-bold">Limpar filtros</button><Link to="/projeto-personalizado?source_page=modelos" className="inline-flex min-h-11 items-center rounded-xl bg-[#5B4FE9] px-5 font-bold text-white">Solicitar projeto personalizado</Link></div></div>}
    </section>
    <section className="bg-[#11132B] py-16 text-white"><div className="mx-auto max-w-4xl px-5 text-center"><h2 className="text-3xl font-black">Não encontrou o estilo ideal?</h2><p className="mt-4 text-lg text-slate-300">A Nextia também desenvolve projetos sob medida e soluções integradas com automação, IA e sistemas.</p><Link to="/projeto-personalizado?source_page=modelos" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-white px-6 font-black text-[#352A9B]">Solicitar projeto personalizado</Link></div></section>
  </main>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold text-slate-700">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-medium text-slate-700"><option value={all}>Todos</option>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
