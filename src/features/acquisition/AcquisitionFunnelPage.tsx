import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Loader2, Monitor, Palette, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { captureAttribution, getAttribution } from '../../lib/leadAttribution';

const CAMPAIGN = 'site-inteligente';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const segments = [
  ['contabilidade', 'Contabilidade', 'Confiança, documentos e atendimento'],
  ['advocacia', 'Advocacia', 'Autoridade e contato responsável'],
  ['clinicas', 'Clínicas', 'Serviços, equipe e agendamento'],
  ['restaurantes', 'Restaurantes', 'Cardápio, reservas e WhatsApp'],
  ['saloes-de-beleza', 'Beleza', 'Portfólio, serviços e agenda'],
  ['prestadores-de-servicos', 'Serviços', 'Trabalhos, regiões e orçamento'],
  ['lojas', 'Comércio', 'Produtos, atendimento e localização'],
] as const;
const segmentCopy: Record<string, string[]> = {
  contabilidade: ['Abertura de empresas', 'Contabilidade mensal', 'Consultoria tributária'], advocacia: ['Áreas de atuação', 'Atendimento consultivo', 'Conteúdos jurídicos'], clinicas: ['Especialidades', 'Equipe profissional', 'Agendamento'], restaurantes: ['Cardápio digital', 'Reservas', 'Pedidos pelo WhatsApp'], 'saloes-de-beleza': ['Serviços premium', 'Resultados reais', 'Agendamento online'], 'prestadores-de-servicos': ['Serviços realizados', 'Portfólio', 'Pedido de orçamento'], lojas: ['Produtos em destaque', 'Novidades', 'Atendimento rápido'],
};

type FunnelSession = { sessionKey: string; accessToken: string; expiresAt: string; variant: { code: string; content?: Record<string, string> } };
type Preview = { segment_slug: string; template_slug: string; business_name: string; theme: { primaryColor?: string }; content: { headline: string; description: string; cta: string; services: string[] }; revision: number };
type Pricing = { minimum_cents: number; maximum_cents?: number; suggested_cents: number; suggestions?: number[] };
type Addon = { code: string; name: string; description?: string; amount_cents: number; billing_cycle: 'one_time' | 'monthly' };

function funnelHeaders(session: FunnelSession) { return { 'Content-Type': 'application/json', 'X-Funnel-Token': session.accessToken }; }
async function responseJson(response: Response) { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível continuar.'); return data; }

export default function AcquisitionFunnelPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<FunnelSession | null>(null);
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [goal, setGoal] = useState('receber-contatos');
  const [color, setColor] = useState('#1677ff');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewPage, setPreviewPage] = useState<'inicio' | 'servicos' | 'contato'>('inicio');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [amount, setAmount] = useState(49700);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quote, setQuote] = useState<{ activationTotalCents: number; monthlyTotalCents: number } | null>(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', consent: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    captureAttribution();
    const stored = sessionStorage.getItem(`nextia.funnel.${CAMPAIGN}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FunnelSession;
        setSession(parsed); setVariant(parsed.variant.content || {});
        fetch(`/api/acquisition/sessions/${parsed.sessionKey}`, { headers: funnelHeaders(parsed), cache: 'no-store' })
          .then(responseJson).then((data) => {
            if (data.preview) { setPreview(data.preview); setSegment(data.preview.segment_slug); setBusinessName(data.preview.business_name); setColor(data.preview.theme?.primaryColor || '#1677ff'); setStep(3); }
            if (data.pricing) { setPricing(data.pricing); setAmount(data.session.selectedAmountCents || data.pricing.suggested_cents); }
          }).catch(() => sessionStorage.removeItem(`nextia.funnel.${CAMPAIGN}`));
      } catch { sessionStorage.removeItem(`nextia.funnel.${CAMPAIGN}`); }
    }
  }, []);

  const chosenSegment = useMemo(() => segments.find(([slug]) => slug === segment), [segment]);

  async function start() {
    setLoading(true); setError('');
    try {
      let current = session;
      if (!current) {
        const response = await fetch('/api/acquisition/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignSlug: CAMPAIGN, attribution: getAttribution(), path: window.location.pathname }) });
        current = await responseJson(response) as FunnelSession;
        sessionStorage.setItem(`nextia.funnel.${CAMPAIGN}`, JSON.stringify(current)); setSession(current); setVariant(current.variant.content || {});
      }
      setStep(1);
      await event(current, 'configurator_started', 'configurator_started');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao iniciar.'); } finally { setLoading(false); }
  }

  async function saveStep(next: number) {
    if (!session) return;
    setLoading(true); setError('');
    try {
      if (next === 2 && !segment) throw new Error('Escolha o tipo de negócio.');
      if (next === 3) {
        if (businessName.trim().length < 2) throw new Error('Informe o nome do negócio.');
        const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/preview`, { method: preview ? 'PATCH' : 'POST', headers: funnelHeaders(session), body: JSON.stringify({ segmentSlug: segment, templateSlug: `site-${segment}`, businessName, theme: { primaryColor: color }, content: preview?.content || { services: segmentCopy[segment] || [] } }) }));
        setPreview(data.preview);
      } else {
        await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}`, { method: 'PATCH', headers: funnelHeaders(session), body: JSON.stringify({ currentStep: next === 1 ? 'segment' : 'configuration', configuration: { segmentSlug: segment, businessName, goal, primaryColor: color } }) }));
        if (next === 2) await event(session, 'segment_selected', `segment:${segment}`, { segment });
      }
      setStep(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao salvar.'); } finally { setLoading(false); }
  }

  async function updatePreview() {
    if (!session || !preview) return;
    setLoading(true); setError('');
    try {
      const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/preview`, { method: 'PATCH', headers: funnelHeaders(session), body: JSON.stringify({ segmentSlug: segment, templateSlug: preview.template_slug, businessName, theme: { primaryColor: color }, content: preview.content }) }));
      setPreview(data.preview);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao atualizar.'); } finally { setLoading(false); }
  }

  async function openPricing() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const [campaign,addonData] = await Promise.all([responseJson(await fetch(`/api/acquisition/campaigns/${CAMPAIGN}`, { cache: 'no-store' })),responseJson(await fetch('/api/catalog/addons?service=sites-prontos',{cache:'no-store'}))]);
      setPricing(campaign.campaign.pricing); setAmount(campaign.campaign.pricing.suggested_cents); setStep(4);
      setAddons((addonData.addons||[]).filter((item:Addon)=>item.code!=='domain-registration'));
      await event(session, 'preview_viewed', 'preview_viewed', { device });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar preço.'); } finally { setLoading(false); }
  }

  async function calculatePrice() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/pricing`, { method: 'POST', headers: funnelHeaders(session), body: JSON.stringify({ amountCents: amount, addonCodes: selectedAddons }) }));
      setAmount(data.selectedAmountCents); setQuote(data); setStep(5);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao calcular.'); } finally { setLoading(false); }
  }

  async function identifyAndCheckout() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/contact`, { method: 'POST', headers: funnelHeaders(session), body: JSON.stringify({ name: contact.name, email: contact.email, phone: contact.phone, consentRecovery: contact.consent }) }));
      sessionStorage.setItem(`nextia.funnel.token.${session.sessionKey}`, session.accessToken);
      await event(session, 'checkout_started', 'checkout_started');
      navigate(`/checkout?service=sites-prontos&funnel=${encodeURIComponent(session.sessionKey)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao continuar.'); } finally { setLoading(false); }
  }

  async function event(current: FunnelSession, name: string, eventKey?: string, properties: Record<string, unknown> = {}) {
    await fetch(`/api/acquisition/sessions/${current.sessionKey}/events`, { method: 'POST', headers: funnelHeaders(current), body: JSON.stringify({ name, eventKey, properties }) }).catch(() => undefined);
  }

  return <main className="min-h-screen bg-[#f5f8fc] text-[#08152d]">
    <Seo title="Crie uma prévia do seu site | Nextia" description="Veja uma prévia personalizada e navegável do site do seu negócio antes de contratar." noindex={false} />
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link to="/" className="text-2xl font-black tracking-tight text-[#10234a]">Nextia</Link><span className="flex items-center gap-2 text-sm font-semibold text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-600"/> Prévia privada e sem compromisso</span></div></header>
    {step === 0 ? <section className="relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(22,119,255,.18),transparent_34%)]"/><div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_.95fr]">
      <div><span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles className="mr-2 h-4 w-4"/>{variant.eyebrow || 'Seu negócio merece ser visto'}</span><h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.04] tracking-[-.04em] md:text-7xl">Veja seu futuro site <span className="text-[#1677ff]">antes de contratar.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Escolha seu segmento, conte o essencial e receba uma prévia navegável criada para vender seus serviços. Você não precisa se cadastrar para começar.</p><button onClick={start} disabled={loading} className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#1677ff] px-7 text-base font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:opacity-60">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:null}{variant.cta || 'Criar minha prévia grátis'}<ArrowRight className="h-5 w-5"/></button><div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-600">{['Sem cartão','Resultado em poucos minutos','Edite antes de decidir'].map(item=><span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600"/>{item}</span>)}</div>{error&&<p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}</div>
      <div className="rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-slate-900/10"><div className="rounded-[1.4rem] bg-[#08152d] p-7 text-white"><div className="flex gap-2"><i className="h-3 w-3 rounded-full bg-red-400"/><i className="h-3 w-3 rounded-full bg-amber-400"/><i className="h-3 w-3 rounded-full bg-emerald-400"/></div><div className="py-16 text-center"><p className="text-sm font-bold uppercase tracking-[.24em] text-blue-300">Prévia personalizada</p><h2 className="mx-auto mt-4 max-w-md text-4xl font-black">Seu negócio, com presença de marca.</h2><p className="mx-auto mt-4 max-w-md text-slate-300">Estrutura profissional, conteúdo direcionado e contato pronto para converter.</p></div></div></div>
    </div></section> : <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex items-center gap-3">{step>1&&<button onClick={()=>setStep(step-1)} className="rounded-xl border border-slate-200 bg-white p-3" aria-label="Voltar"><ChevronLeft className="h-5 w-5"/></button>}<div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#1677ff] transition-all" style={{width:`${Math.min(100,(step/5)*100)}%`}}/></div><span className="text-sm font-bold text-slate-500">{Math.min(step,5)} de 5</span></div>
      {error&&<div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {step===1&&<Panel title="Qual é o seu tipo de negócio?" subtitle="Isso define estrutura, linguagem e recursos da prévia."><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{segments.map(([slug,name,description])=><button key={slug} onClick={()=>setSegment(slug)} className={`rounded-2xl border p-5 text-left transition ${segment===slug?'border-blue-500 bg-blue-50 ring-2 ring-blue-100':'border-slate-200 bg-white hover:border-blue-300'}`}><strong className="block text-lg">{name}</strong><span className="mt-2 block text-sm text-slate-500">{description}</span></button>)}</div><Action onClick={()=>saveStep(2)} loading={loading}>Continuar</Action></Panel>}
      {step===2&&<Panel title={`Vamos personalizar para ${chosenSegment?.[1] || 'seu negócio'}`} subtitle="Só o essencial agora. Você poderá editar a prévia depois."><div className="grid gap-5 md:grid-cols-2"><Field label="Nome do negócio"><input value={businessName} onChange={e=>setBusinessName(e.target.value)} maxLength={100} placeholder="Ex.: Contábil Horizonte" className="input"/></Field><Field label="Principal objetivo"><select value={goal} onChange={e=>setGoal(e.target.value)} className="input"><option value="receber-contatos">Receber mais contatos</option><option value="vender-servicos">Vender serviços</option><option value="agendar">Gerar agendamentos</option><option value="autoridade">Construir autoridade</option></select></Field><Field label="Cor principal"><div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white p-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg"/><span className="font-mono text-sm font-bold uppercase">{color}</span></div></Field></div><Action onClick={()=>saveStep(3)} loading={loading}>Gerar minha prévia</Action></Panel>}
      {step===3&&preview&&<div><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">Sua prévia está pronta</p><h2 className="mt-2 text-3xl font-black">Edite, navegue e compare</h2></div><div className="flex rounded-xl border border-slate-200 bg-white p-1"><button onClick={()=>setDevice('desktop')} className={`rounded-lg p-3 ${device==='desktop'?'bg-slate-100 text-blue-600':''}`} aria-label="Desktop"><Monitor className="h-5 w-5"/></button><button onClick={()=>setDevice('mobile')} className={`rounded-lg p-3 ${device==='mobile'?'bg-slate-100 text-blue-600':''}`} aria-label="Celular"><Smartphone className="h-5 w-5"/></button></div></div><div className="grid gap-6 lg:grid-cols-[320px_1fr]"><aside className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="flex items-center gap-2 font-black"><Palette className="h-5 w-5 text-blue-600"/>Editar conteúdo</h3><Field label="Título principal"><textarea value={preview.content.headline} onChange={e=>setPreview({...preview,content:{...preview.content,headline:e.target.value}})} maxLength={120} className="input min-h-24"/></Field><Field label="Descrição"><textarea value={preview.content.description} onChange={e=>setPreview({...preview,content:{...preview.content,description:e.target.value}})} maxLength={280} className="input min-h-28"/></Field><Field label="Texto do botão"><input value={preview.content.cta} onChange={e=>setPreview({...preview,content:{...preview.content,cta:e.target.value}})} maxLength={50} className="input"/></Field><button onClick={updatePreview} disabled={loading} className="mt-5 w-full rounded-xl border border-blue-300 px-4 py-3 font-bold text-blue-700">Salvar alterações</button></aside><div className={`mx-auto w-full overflow-hidden rounded-[1.6rem] border-[10px] border-[#15223b] bg-white shadow-2xl transition-all ${device==='mobile'?'max-w-[390px]':'max-w-none'}`}><PreviewSite preview={preview} page={previewPage} onPage={setPreviewPage}/></div></div><Action onClick={openPricing} loading={loading}>Gostei, ver investimento</Action></div>}
      {step===4&&pricing&&<Panel title="Escolha um investimento responsável" subtitle="O mesmo projeto, com liberdade de escolha dentro do limite sustentável. Não é doação; é o valor de ativação do serviço."><div className="mx-auto max-w-2xl rounded-3xl border border-blue-200 bg-blue-50 p-7"><div className="text-center"><span className="text-sm font-bold text-blue-700">Ativação do seu projeto</span><strong className="mt-2 block text-5xl font-black">{money.format(amount/100)}</strong><span className="mt-2 block text-sm text-slate-600">mínimo {money.format(pricing.minimum_cents/100)}</span></div><input type="range" min={pricing.minimum_cents} max={pricing.maximum_cents||149000} step={1000} value={amount} onChange={e=>setAmount(Number(e.target.value))} className="mt-7 w-full accent-[#1677ff]"/><div className="mt-5 grid grid-cols-3 gap-2">{(pricing.suggestions||[]).map(value=><button key={value} onClick={()=>setAmount(value)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${amount===value?'border-blue-500 bg-white text-blue-700':'border-blue-100 bg-blue-100/40'}`}>{money.format(value/100)}</button>)}</div></div>{addons.length>0&&<div className="mx-auto mt-7 max-w-2xl"><h3 className="text-lg font-black">Recursos opcionais</h3><p className="mt-1 text-sm text-slate-500">Escolha apenas o que faz sentido agora. Você poderá contratar outros recursos depois.</p><div className="mt-4 grid gap-3">{addons.map(addon=><label key={addon.code} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${selectedAddons.includes(addon.code)?'border-blue-500 bg-blue-50':'border-slate-200 bg-white'}`}><input type="checkbox" className="mt-1 h-4 w-4" checked={selectedAddons.includes(addon.code)} onChange={()=>setSelectedAddons(current=>current.includes(addon.code)?current.filter(code=>code!==addon.code):[...current,addon.code])}/><span className="flex-1"><strong className="block">{addon.name}</strong>{addon.description&&<span className="mt-1 block text-sm text-slate-500">{addon.description}</span>}</span><strong className="text-sm text-blue-700">{money.format(addon.amount_cents/100)}{addon.billing_cycle==='monthly'?'/mês':''}</strong></label>)}</div></div>}<Action onClick={calculatePrice} loading={loading}>Continuar com este valor</Action></Panel>}
      {step===5&&<Panel title="Sua prévia fica salva por 7 dias" subtitle="Informe um canal para continuar ao checkout e, se você autorizar, lembrar onde parou."><div className="grid gap-5 md:grid-cols-2"><Field label="Seu nome"><input className="input" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})}/></Field><Field label="E-mail"><input className="input" type="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})}/></Field><Field label="WhatsApp (opcional)"><input className="input" inputMode="tel" value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})}/></Field><div className="rounded-2xl bg-slate-50 p-5"><span className="text-sm text-slate-500">Ativação selecionada</span><strong className="mt-1 block text-2xl">{money.format((quote?.activationTotalCents||amount)/100)}</strong>{quote?.monthlyTotalCents? <span className="text-sm text-slate-600">+ {money.format(quote.monthlyTotalCents/100)}/mês</span>:null}</div></div><label className="mt-6 flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><input type="checkbox" checked={contact.consent} onChange={e=>setContact({...contact,consent:e.target.checked})} className="mt-1 h-4 w-4"/><span>Autorizo a Nextia a salvar esta prévia e entrar em contato sobre este projeto. Posso revogar a autorização a qualquer momento.</span></label><Action onClick={identifyAndCheckout} loading={loading}>Continuar para contratação segura</Action></Panel>}
    </section>}
  </main>;
}

function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { return <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-10"><h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1><p className="mt-3 text-slate-600">{subtitle}</p><div className="mt-8">{children}</div></div>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="mt-5 block text-sm font-bold text-slate-700">{label}<div className="mt-2">{children}</div></label>; }
function Action({onClick,loading,children}:{onClick:()=>void;loading:boolean;children:React.ReactNode}) { return <button onClick={onClick} disabled={loading} className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-xl bg-[#1677ff] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:null}{children}<ArrowRight className="h-5 w-5"/></button>; }
function PreviewSite({preview,page,onPage}:{preview:Preview;page:'inicio'|'servicos'|'contato';onPage:(page:'inicio'|'servicos'|'contato')=>void}) { const primary=preview.theme?.primaryColor||'#1677ff'; return <div className="min-h-[560px] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><strong className="text-lg">{preview.business_name}</strong><nav className="flex gap-1 text-xs font-bold">{(['inicio','servicos','contato'] as const).map(item=><button key={item} onClick={()=>onPage(item)} className="rounded-lg px-3 py-2 capitalize" style={{color:page===item?primary:'#64748b',background:page===item?`${primary}12`:'transparent'}}>{item}</button>)}</nav></div>{page==='inicio'&&<div className="grid min-h-[480px] place-items-center p-7 text-center" style={{background:`linear-gradient(135deg,${primary}12,#fff 60%)`}}><div><span className="text-xs font-black uppercase tracking-[.22em]" style={{color:primary}}>{segments.find(([slug])=>slug===preview.segment_slug)?.[1]}</span><h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black leading-tight">{preview.content.headline}</h2><p className="mx-auto mt-4 max-w-xl text-slate-600">{preview.content.description}</p><button className="mt-7 rounded-xl px-6 py-3 font-bold text-white" style={{background:primary}}>{preview.content.cta}</button></div></div>}{page==='servicos'&&<div className="p-8"><span className="text-sm font-bold" style={{color:primary}}>O que fazemos</span><h2 className="mt-2 text-3xl font-black">Soluções para você</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{preview.content.services.map(item=><div key={item} className="rounded-2xl border border-slate-200 p-5"><i className="block h-9 w-9 rounded-xl" style={{background:`${primary}20`}}/><strong className="mt-5 block">{item}</strong><p className="mt-2 text-sm text-slate-500">Atendimento profissional e pensado para sua necessidade.</p></div>)}</div></div>}{page==='contato'&&<div className="grid min-h-[480px] place-items-center p-8"><div className="w-full max-w-lg rounded-3xl bg-slate-50 p-7"><h2 className="text-3xl font-black">Vamos conversar?</h2><p className="mt-2 text-slate-600">Conte rapidamente o que precisa. A equipe de {preview.business_name} responde você.</p>{['Nome','E-mail ou WhatsApp','Como podemos ajudar?'].map(item=><div key={item} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">{item}</div>)}<button className="mt-5 w-full rounded-xl py-3 font-bold text-white" style={{background:primary}}>Enviar contato</button></div></div>}</div>; }
