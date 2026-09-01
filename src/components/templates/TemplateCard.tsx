import { Check, ExternalLink, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getTemplateServiceSlug, type Template } from '../../data/templates';
import { getTemplateMetadata } from '../../data/templateMetadata';
import { trackEvent } from '../../utils/whatsapp';
import Badge from '../ui/Badge';
import { TemplateIllustration } from './TemplateIllustration';

export default function TemplateCard({ template }: { template: Template }) {
  const location = useLocation();
  const metadata = getTemplateMetadata(template);
  const detailParams = new URLSearchParams(location.search);
  const detailUrl = `/modelos/${template.slug}${detailParams.size ? `?${detailParams}` : ''}`;
  const checkoutParams = new URLSearchParams(detailParams);
  checkoutParams.set('service', getTemplateServiceSlug(template));
  checkoutParams.set('template', template.slug);
  checkoutParams.set('plano', template.recommendedPlan.toLowerCase());
  checkoutParams.set('source_page', 'template');

  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(30,27,75,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(91,79,233,.16)]">
    <Link to={detailUrl} aria-label={`Ver detalhes do modelo ${template.name}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
      <TemplateIllustration category={template.categorySlug} slug={template.slug} coverImage={template.coverImage} />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#5B4FE9] shadow">Modelo disponível</span>
      <span className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-center gap-2 rounded-xl bg-[#11132B]/90 py-3 text-sm font-extrabold text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100"><Eye className="h-4 w-4" /> Ver detalhes</span>
    </Link>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap gap-2"><Badge variant="primary" size="sm">{template.category}</Badge><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{metadata.style}</span></div>
      <h2 className="mt-3 text-xl font-black text-slate-950">{template.name}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{template.shortDescription}</p>
      <div className="mt-4 flex flex-wrap gap-2">{metadata.tags.slice(0, 4).map(tag => <span key={tag} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600">{tag}</span>)}</div>
      <ul className="mt-5 flex-1 space-y-2">{template.features.slice(0, 3).map(feature => <li key={feature} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {template.demoUrl && template.demoUrl !== '#' && <Link to={template.demoUrl} onClick={() => trackEvent('open_template_demo', { template_id: template.slug, segment: template.categorySlug, type: metadata.type })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#5B4FE9]/30 text-sm font-extrabold text-[#5145D7]"><ExternalLink className="h-4 w-4" /> Demo</Link>}
        <Link to={detailUrl} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 text-sm font-extrabold text-slate-800">Ver detalhes</Link>
      </div>
      <Link to={`/cadastro?${checkoutParams}`} onClick={() => trackEvent('select_template', { template_id: template.slug, segment: template.categorySlug, type: metadata.type })} className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#5B4FE9] to-[#7C3AED] px-4 text-sm font-black text-white shadow-lg shadow-violet-200">Quero este modelo</Link>
    </div>
  </article>;
}
