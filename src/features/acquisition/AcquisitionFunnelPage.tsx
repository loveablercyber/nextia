import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Eye, KeyRound, Loader2, Monitor, Palette, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import type { ComponentProps } from 'react';
import Seo from '../../components/seo/Seo';
import { captureAttribution, getAttribution } from '../../lib/leadAttribution';
import { plans } from '../../data/plans';
import PreviewSite, { type AcquisitionPreview, type PreviewPage } from './PreviewSite';
import { createPreviewContent, segmentOptions, segmentPresets, type PreviewContent } from './acquisitionPresets';

const CAMPAIGN = 'site-inteligente';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const commercialPlans = plans.filter((plan) => plan.id !== 'custom');

type FunnelSession = { sessionKey: string; accessToken: string; expiresAt: string; variant: { code: string; content?: Record<string, string> } };
type Addon = { code: string; name: string; description?: string; amount_cents: number; billing_cycle: 'one_time' | 'monthly' };
type Quote = { activationTotalCents: number; monthlyTotalCents: number; selectedPlanId: string; planName: string; addons: Addon[] };
type DemoResult = { demoUrl: string; expiresAt: string; dashboardUrl: string; email: string; temporaryPassword?: string; accountCreated: boolean; planName: string; activationTotalCents: number; monthlyTotalCents: number };

function funnelHeaders(session: FunnelSession) { return { 'Content-Type': 'application/json', 'X-Funnel-Token': session.accessToken }; }
async function responseJson(response: Response) { const data = await response.json(); if (!response.ok) { const value = new Error(data.error || 'Não foi possível continuar.') as Error & { code?: string }; value.code = data.code; throw value; } return data; }
function Link(props: ComponentProps<typeof RouterLink>) { return <RouterLink {...props} reloadDocument={props.reloadDocument || props.to === '/painel'} />; }

export default function AcquisitionFunnelPage() {
  const [session, setSession] = useState<FunnelSession | null>(null);
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [goal, setGoal] = useState('receber-contatos');
  const [color, setColor] = useState('#1677ff');
  const [preview, setPreview] = useState<AcquisitionPreview | null>(null);
  const [previewPage, setPreviewPage] = useState<PreviewPage>('inicio');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', consent: false, terms: false });
  const [demo, setDemo] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    captureAttribution();
    const stored = sessionStorage.getItem(`nextia.funnel.${CAMPAIGN}`);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as FunnelSession;
      setSession(parsed); setVariant(parsed.variant.content || {});
      fetch(`/api/acquisition/sessions/${parsed.sessionKey}`, { headers: funnelHeaders(parsed), cache: 'no-store' }).then(responseJson).then((data) => {
        if (data.preview) {
          const preset=segmentPresets[data.preview.segment_slug] || segmentPresets['prestadores-de-servicos'];
          const rawServices=Array.isArray(data.preview.content?.services)?data.preview.content.services:[];
          const restored={...data.preview,content:{...preset.content,...data.preview.content,services:rawServices.map((item:unknown,index:number)=>typeof item==='string'?{title:item,description:preset.content.services[index]?.description||''}:item)}} as AcquisitionPreview;
          setPreview(restored); setSegment(data.preview.segment_slug); setBusinessName(data.preview.business_name); setColor(data.preview.theme?.primaryColor || preset.accent); setStep(3);
        }
        if (data.session?.selectedPlanId) setSelectedPlan(data.session.selectedPlanId);
      }).catch(() => sessionStorage.removeItem(`nextia.funnel.${CAMPAIGN}`));
    } catch { sessionStorage.removeItem(`nextia.funnel.${CAMPAIGN}`); }
  }, []);

  const chosenSegment = useMemo(() => segmentOptions.find(([slug]) => slug === segment), [segment]);
  const chosenPlan = commercialPlans.find((plan) => plan.id === selectedPlan) || commercialPlans[1];

  async function start() {
    setLoading(true); setError('');
    try {
      let current = session;
      if (!current) {
        current = await responseJson(await fetch('/api/acquisition/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignSlug: CAMPAIGN, attribution: getAttribution(), path: window.location.pathname }) })) as FunnelSession;
        sessionStorage.setItem(`nextia.funnel.${CAMPAIGN}`, JSON.stringify(current)); setSession(current); setVariant(current.variant.content || {});
      }
      setStep(1); await sendEvent(current, 'configurator_started', 'configurator_started');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao iniciar.'); } finally { setLoading(false); }
  }

  async function saveStep(next: number) {
    if (!session) return;
    setLoading(true); setError('');
    try {
      if (next === 2 && !segment) throw new Error('Escolha o tipo de negócio.');
      if (next === 3) {
        if (businessName.trim().length < 2) throw new Error('Informe o nome do negócio.');
        const preset = segmentPresets[segment];
        const content = preview?.content || createPreviewContent(segment, businessName);
        const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/preview`, { method: preview ? 'PATCH' : 'POST', headers: funnelHeaders(session), body: JSON.stringify({ segmentSlug: segment, templateSlug: preset.templateSlug, businessName, theme: { primaryColor: color || preset.accent }, content }) }));
        setPreview(data.preview); setColor(data.preview.theme.primaryColor); setPreviewPage('inicio');
      } else {
        await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}`, { method: 'PATCH', headers: funnelHeaders(session), body: JSON.stringify({ currentStep: next === 1 ? 'segment' : 'configuration', configuration: { segmentSlug: segment, businessName, goal, primaryColor: color } }) }));
        if (next === 2) { setColor(segmentPresets[segment]?.accent || '#1677ff'); await sendEvent(session, 'segment_selected', `segment:${segment}`, { segment }); }
      }
      setStep(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao salvar.'); } finally { setLoading(false); }
  }

  async function updatePreview() {
    if (!session || !preview) return;
    setLoading(true); setError('');
    try {
      const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/preview`, { method: 'PATCH', headers: funnelHeaders(session), body: JSON.stringify({ segmentSlug: segment, templateSlug: segmentPresets[segment].templateSlug, businessName, theme: { primaryColor: color }, content: preview.content }) }));
      setPreview(data.preview);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao atualizar.'); } finally { setLoading(false); }
  }

  function updateContent<K extends keyof PreviewContent>(key: K, value: PreviewContent[K]) {
    if (!preview) return;
    setPreview({ ...preview, content: { ...preview.content, [key]: value } });
  }

  async function openPricing() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const addonData = await responseJson(await fetch(`/api/catalog/addons?service=sites-prontos&segment=${encodeURIComponent(segment)}`, { cache: 'no-store' }));
      setAddons((addonData.addons || []).filter((item: Addon) => item.code !== 'domain-registration')); setStep(4);
      await sendEvent(session, 'preview_viewed', 'preview_viewed', { device, segment });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar os planos.'); } finally { setLoading(false); }
  }

  async function calculatePrice() {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/pricing`, { method: 'POST', headers: funnelHeaders(session), body: JSON.stringify({ planId: selectedPlan, addonCodes: selectedAddons }) }));
      setQuote(data); setStep(5);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao calcular.'); } finally { setLoading(false); }
  }

  async function createDemo() {
    if (!session) return;
    if (!contact.terms) { setError('Aceite os termos para criar a conta e a demonstração.'); return; }
    setLoading(true); setError('');
    try {
      const data = await responseJson(await fetch(`/api/acquisition/sessions/${session.sessionKey}/demo-account`, { method: 'POST', headers: funnelHeaders(session), body: JSON.stringify({ name: contact.name, email: contact.email, phone: contact.phone, consentRecovery: contact.consent, acceptedTerms: contact.terms }) }));
      sessionStorage.setItem(`nextia.funnel.token.${session.sessionKey}`, session.accessToken); setDemo(data); setStep(6);
    } catch (cause) {
      const typed = cause as Error & { code?: string };
      setError(typed.code === 'ACCOUNT_EXISTS' ? `${typed.message} Entre na sua conta e retorne a esta prévia.` : typed.message || 'Falha ao criar a demonstração.');
    } finally { setLoading(false); }
  }

  async function sendEvent(current: FunnelSession, name: string, eventKey?: string, properties: Record<string, unknown> = {}) {
    await fetch(`/api/acquisition/sessions/${current.sessionKey}/events`, { method: 'POST', headers: funnelHeaders(current), body: JSON.stringify({ name, eventKey, properties }) }).catch(() => undefined);
  }

  return <main className="min-h-screen bg-[#f5f8fc] text-[#08152d]">
    <Seo title="Crie uma prévia do seu site | Nextia" description="Veja uma prévia personalizada e navegável do site do seu negócio antes de contratar." noindex={false} />
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link to="/" className="text-2xl font-black tracking-tight text-[#10234a]">Nextia</Link><span className="flex items-center gap-2 text-sm font-semibold text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-600"/> Prévia privada e sem compromisso</span></div></header>
    {step === 0 ? <Landing variant={variant} loading={loading} error={error} onStart={start} /> : <section className="mx-auto max-w-7xl px-4 py-8 md:px-5 md:py-10">
      {step < 6 && <div className="mb-8 flex items-center gap-3">{step>1&&<button onClick={()=>setStep(step-1)} className="rounded-xl border border-slate-200 bg-white p-3" aria-label="Voltar"><ChevronLeft className="h-5 w-5"/></button>}<div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#1677ff] transition-all" style={{width:`${Math.min(100,(step/5)*100)}%`}}/></div><span className="text-sm font-bold text-slate-500">{Math.min(step,5)} de 5</span></div>}
      {error&&<div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}{error.includes('Entre na sua conta')&&<Link to="/login" className="ml-2 underline">Entrar</Link>}</div>}
      {step===1&&<Panel title="Qual é o seu tipo de negócio?" subtitle="Cada opção usa estrutura, imagem, linguagem e recursos próprios — não apenas uma troca de texto."><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{segmentOptions.map(([slug,name,description])=><button key={slug} onClick={()=>setSegment(slug)} className={`rounded-2xl border p-5 text-left transition ${segment===slug?'border-blue-500 bg-blue-50 ring-2 ring-blue-100':'border-slate-200 bg-white hover:border-blue-300'}`}><strong className="block text-lg">{name}</strong><span className="mt-2 block text-sm text-slate-500">{description}</span></button>)}</div><Action onClick={()=>saveStep(2)} loading={loading}>Continuar</Action></Panel>}
      {step===2&&<Panel title={`Vamos personalizar para ${chosenSegment?.[1] || 'seu negócio'}`} subtitle="Estas informações iniciam o modelo. Na próxima etapa você poderá editar seções, serviços, contato e agenda."><div className="grid gap-5 md:grid-cols-2"><Field label="Nome do negócio"><input value={businessName} onChange={e=>setBusinessName(e.target.value)} maxLength={100} placeholder="Ex.: Horizonte Contabilidade" className="input"/></Field><Field label="Principal objetivo"><select value={goal} onChange={e=>setGoal(e.target.value)} className="input"><option value="receber-contatos">Receber mais contatos</option><option value="vender-servicos">Vender serviços</option><option value="agendar">Gerar agendamentos ou reservas</option><option value="autoridade">Construir autoridade</option></select></Field><Field label="Cor principal"><div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white p-2"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg"/><span className="font-mono text-sm font-bold uppercase">{color}</span></div></Field></div><Action onClick={()=>saveStep(3)} loading={loading}>Gerar minha prévia</Action></Panel>}
      {step===3&&preview&&<div><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-600">Modelo {segmentPresets[segment].name}</p><h2 className="mt-2 text-3xl font-black">Personalize e navegue pela experiência</h2></div><div className="flex rounded-xl border border-slate-200 bg-white p-1"><button onClick={()=>setDevice('desktop')} className={`rounded-lg p-3 ${device==='desktop'?'bg-slate-100 text-blue-600':''}`} aria-label="Desktop"><Monitor className="h-5 w-5"/></button><button onClick={()=>setDevice('mobile')} className={`rounded-lg p-3 ${device==='mobile'?'bg-slate-100 text-blue-600':''}`} aria-label="Celular"><Smartphone className="h-5 w-5"/></button></div></div><div className="grid gap-6 xl:grid-cols-[360px_1fr]"><Editor preview={preview} color={color} loading={loading} onColor={setColor} onContent={updateContent} onSave={updatePreview}/><div className={`mx-auto w-full overflow-hidden rounded-[1.6rem] border-[10px] border-[#15223b] bg-white shadow-2xl transition-all ${device==='mobile'?'max-w-[390px]':'max-w-none'}`}><div className="flex gap-1 overflow-x-auto border-b bg-slate-50 p-2 text-[11px] font-bold">{(['inicio','servicos','agendamento','contato'] as PreviewPage[]).map(item=><button key={item} onClick={()=>setPreviewPage(item)} className={`shrink-0 rounded-lg px-3 py-2 capitalize ${previewPage===item?'bg-white text-blue-700 shadow-sm':'text-slate-500'}`}>{item==='agendamento'?segmentPresets[segment].bookingLabel:item}</button>)}</div><PreviewSite preview={preview} page={previewPage} onPage={setPreviewPage} device={device}/></div></div><Action onClick={openPricing} loading={loading}>Gostei, escolher plano</Action></div>}
      {step===4&&<Panel title="Escolha o plano pelo que seu negócio precisa" subtitle="Agora cada valor tem uma entrega clara. O preço de ativação cria o site; a mensalidade mantém hospedagem, suporte e evolução."><div className="grid gap-4 lg:grid-cols-3">{commercialPlans.map(plan=><button key={plan.id} onClick={()=>setSelectedPlan(plan.id)} className={`relative rounded-3xl border p-6 text-left transition ${selectedPlan===plan.id?'border-blue-500 bg-blue-50 ring-2 ring-blue-100':'border-slate-200 bg-white hover:border-blue-300'}`}>{plan.badge&&<span className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase text-white">{plan.badge}</span>}<strong className="block text-xl">{plan.name}</strong><p className="mt-2 min-h-10 text-sm text-slate-500">{plan.subtitle}</p><strong className="mt-5 block text-3xl">{money.format(plan.activationFee)}</strong><span className="text-xs font-semibold text-slate-500">ativação + {money.format(plan.price)}/mês</span><ul className="mt-5 space-y-2">{plan.features.slice(0,6).map(feature=><li key={feature} className="flex gap-2 text-xs text-slate-600"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"/>{feature}</li>)}</ul></button>)}</div>{addons.length>0&&<div className="mt-9"><h3 className="text-lg font-black">Recursos opcionais para {chosenSegment?.[1]}</h3><p className="mt-1 text-sm text-slate-500">A lista foi filtrada para o seu segmento. Você poderá incluir ou remover itens antes do pagamento.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{addons.map(addon=><label key={addon.code} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${selectedAddons.includes(addon.code)?'border-blue-500 bg-blue-50':'border-slate-200 bg-white'}`}><input type="checkbox" className="mt-1 h-4 w-4" checked={selectedAddons.includes(addon.code)} onChange={()=>setSelectedAddons(current=>current.includes(addon.code)?current.filter(code=>code!==addon.code):[...current,addon.code])}/><span className="flex-1"><strong className="block">{addon.name}</strong>{addon.description&&<span className="mt-1 block text-sm text-slate-500">{addon.description}</span>}<strong className="mt-2 block text-sm text-blue-700">{money.format(addon.amount_cents/100)}{addon.billing_cycle==='monthly'?'/mês':' uma vez'}</strong></span></label>)}</div></div>}<div className="mt-7 rounded-2xl bg-slate-950 p-5 text-white"><span className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">Resumo do plano</span><strong className="mt-2 block text-xl">{chosenPlan.name}: {money.format(chosenPlan.activationFee)} de ativação + {money.format(chosenPlan.price)}/mês</strong></div><Action onClick={calculatePrice} loading={loading}>Continuar com {chosenPlan.name}</Action></Panel>}
      {step===5&&<Panel title="Crie sua demonstração por 7 dias" subtitle="Revise o pedido, crie seu acesso ao painel e continue depois com domínio, e-mail, opcionais e pagamento."><div className="grid gap-6 lg:grid-cols-[1fr_.85fr]"><div className="grid gap-4 sm:grid-cols-2"><Field label="Seu nome"><input className="input" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})}/></Field><Field label="E-mail de acesso"><input className="input" type="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})}/></Field><Field label="WhatsApp"><input className="input" inputMode="tel" value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})}/></Field></div><OrderSummary segment={segment} plan={chosenPlan} quote={quote} selected={selectedAddons}/></div><label className="mt-6 flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><input type="checkbox" checked={contact.terms} onChange={e=>setContact({...contact,terms:e.target.checked})} className="mt-1 h-4 w-4"/><span>Concordo com os <Link to="/termos" target="_blank" className="font-bold text-blue-700 underline">Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" className="font-bold text-blue-700 underline">Política de Privacidade</Link> para criar minha conta e manter esta demonstração por 7 dias.</span></label><label className="mt-3 flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><input type="checkbox" checked={contact.consent} onChange={e=>setContact({...contact,consent:e.target.checked})} className="mt-1 h-4 w-4"/><span>Quero receber orientação da Nextia sobre esta prévia. Esta autorização é opcional e pode ser revogada.</span></label><Action onClick={createDemo} loading={loading}>Criar conta e abrir demonstração</Action></Panel>}
      {step===6&&demo&&<Panel title="Sua demonstração está pronta" subtitle={`O modelo ficará ativo até ${new Date(demo.expiresAt).toLocaleDateString('pt-BR')}. Nenhum pagamento foi realizado.`}><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"><Eye className="h-5 w-5"/></span><h3 className="mt-4 text-xl font-black">Demonstração navegável</h3><p className="mt-2 text-sm leading-6 text-emerald-900">Abra o site que você personalizou. Ele ficará salvo no painel durante o período de teste.</p><a href={demo.demoUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white">Abrir demonstração</a></div><div className="rounded-3xl border border-blue-200 bg-blue-50 p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><KeyRound className="h-5 w-5"/></span><h3 className="mt-4 text-xl font-black">Acesso ao painel</h3><p className="mt-3 text-sm"><strong>E-mail:</strong> {demo.email}</p>{demo.temporaryPassword?<><p className="mt-2 text-sm"><strong>Senha temporária:</strong> <code className="rounded bg-white px-2 py-1 font-bold">{demo.temporaryPassword}</code></p><p className="mt-3 text-xs leading-5 text-blue-800">Copie a senha agora. Por segurança, ela só é exibida nesta tela e deverá ser alterada no painel.</p></>:<p className="mt-3 text-sm text-blue-900">Sua conta existente foi vinculada à demonstração.</p>}<Link to={demo.dashboardUrl} className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white">Entrar no meu painel</Link></div></div><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"><strong>{demo.planName}</strong><span className="mt-1 block text-sm text-slate-600">{money.format(demo.activationTotalCents/100)} de ativação + {money.format(demo.monthlyTotalCents/100)}/mês. Domínio e pagamento serão confirmados por você no painel.</span></div></Panel>}
    </section>}
  </main>;
}

function Landing({variant,loading,error,onStart}:{variant:Record<string,string>;loading:boolean;error:string;onStart:()=>void}) { return <section className="relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(22,119,255,.18),transparent_34%)]"/><div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_.95fr]"><div><span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles className="mr-2 h-4 w-4"/>{variant.eyebrow || 'Seu negócio merece ser visto'}</span><h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.04] tracking-[-.04em] md:text-7xl">Veja seu futuro site <span className="text-[#1677ff]">antes de contratar.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Escolha seu segmento, personalize conteúdo e explore um site com WhatsApp, localização e agendamento. Você não precisa se cadastrar para começar e não paga para testar.</p><button onClick={onStart} disabled={loading} className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-2xl bg-[#1677ff] px-7 text-base font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:opacity-60">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:null}{variant.cta || 'Criar minha prévia grátis'}<ArrowRight className="h-5 w-5"/></button><div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-600">{['Modelos por segmento','Demonstração por 7 dias','Edite antes de decidir'].map(item=><span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600"/>{item}</span>)}</div>{error&&<p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}</div><div className="rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-slate-900/10"><img src="/images/templates/restaurante-premium.webp" alt="Exemplo de site profissional" className="h-[460px] w-full rounded-[1.4rem] object-cover"/><div className="-mt-24 relative mx-5 rounded-2xl border border-white/20 bg-slate-950/85 p-6 text-white backdrop-blur"><span className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">Experiência completa</span><strong className="mt-2 block text-2xl">Conteúdo, agenda e conversão no mesmo site.</strong></div></div></div></section>; }

function Editor({preview,color,loading,onColor,onContent,onSave}:{preview:AcquisitionPreview;color:string;loading:boolean;onColor:(value:string)=>void;onContent:<K extends keyof PreviewContent>(key:K,value:PreviewContent[K])=>void;onSave:()=>void}) { return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-4"><h3 className="flex items-center gap-2 font-black"><Palette className="h-5 w-5 text-blue-600"/>Editar conteúdo</h3><p className="mt-2 text-xs leading-5 text-slate-500">Altere a mensagem, serviços, contato e chamadas do seu futuro site.</p><details open className="mt-5"><summary className="cursor-pointer font-bold">Marca e apresentação</summary><Field label="Cor principal"><input type="color" value={color} onChange={e=>onColor(e.target.value)} className="h-11 w-full cursor-pointer rounded-lg"/></Field><Field label="Frase de destaque"><input value={preview.content.eyebrow} onChange={e=>onContent('eyebrow',e.target.value)} maxLength={80} className="input"/></Field><Field label="Título principal"><textarea value={preview.content.headline} onChange={e=>onContent('headline',e.target.value)} maxLength={140} className="input min-h-24"/></Field><Field label="Descrição"><textarea value={preview.content.description} onChange={e=>onContent('description',e.target.value)} maxLength={320} className="input min-h-28"/></Field><Field label="Texto do botão"><input value={preview.content.cta} onChange={e=>onContent('cta',e.target.value)} maxLength={50} className="input"/></Field></details><details className="mt-5 border-t pt-4"><summary className="cursor-pointer font-bold">Sobre e diferenciais</summary><Field label="Título da seção"><input value={preview.content.aboutTitle} onChange={e=>onContent('aboutTitle',e.target.value)} className="input"/></Field><Field label="Texto sobre o negócio"><textarea value={preview.content.aboutText} onChange={e=>onContent('aboutText',e.target.value)} className="input min-h-24"/></Field></details><details className="mt-5 border-t pt-4"><summary className="cursor-pointer font-bold">Serviços exibidos</summary>{preview.content.services.map((service,index)=><div key={index} className="mt-4 rounded-xl bg-slate-50 p-3"><input value={service.title} onChange={e=>onContent('services',preview.content.services.map((item,i)=>i===index?{...item,title:e.target.value}:item))} className="input"/><textarea value={service.description} onChange={e=>onContent('services',preview.content.services.map((item,i)=>i===index?{...item,description:e.target.value}:item))} className="input mt-2 min-h-20"/></div>)}</details><details className="mt-5 border-t pt-4"><summary className="cursor-pointer font-bold">Agenda e contato</summary><Field label="Título do agendamento"><input value={preview.content.bookingTitle} onChange={e=>onContent('bookingTitle',e.target.value)} className="input"/></Field><Field label="WhatsApp"><input value={preview.content.phone} onChange={e=>{onContent('phone',e.target.value);onContent('whatsapp',e.target.value)}} className="input"/></Field><Field label="Endereço / região"><input value={preview.content.address} onChange={e=>onContent('address',e.target.value)} className="input"/></Field></details><button onClick={onSave} disabled={loading} className="mt-5 w-full rounded-xl border border-blue-300 px-4 py-3 font-bold text-blue-700 disabled:opacity-50">{loading?'Salvando…':'Salvar alterações'}</button></aside>; }

function OrderSummary({segment,plan,quote,selected}:{segment:string;plan:(typeof commercialPlans)[number];quote:Quote|null;selected:string[]}) { return <div className="rounded-3xl bg-slate-950 p-6 text-white"><span className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">Resumo da solicitação</span><h3 className="mt-3 text-2xl font-black">{segmentPresets[segment]?.name} · {plan.name}</h3><ul className="mt-5 space-y-3 text-sm text-slate-300"><li className="flex justify-between gap-4"><span>Modelo personalizado</span><strong className="text-white">Incluído</strong></li><li className="flex justify-between gap-4"><span>Demonstração</span><strong className="text-white">7 dias grátis</strong></li><li className="flex justify-between gap-4"><span>Opcionais escolhidos</span><strong className="text-white">{selected.length}</strong></li><li className="flex justify-between gap-4 border-t border-white/10 pt-3"><span>Ativação</span><strong className="text-white">{money.format((quote?.activationTotalCents ?? plan.activationFee*100)/100)}</strong></li><li className="flex justify-between gap-4"><span>Mensalidade</span><strong className="text-white">{money.format((quote?.monthlyTotalCents ?? plan.price*100)/100)}/mês</strong></li></ul><p className="mt-5 text-xs leading-5 text-slate-400">Você verá estes dados no painel antes de configurar domínio e pagamento.</p></div>; }
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { return <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-10"><h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1><p className="mt-3 max-w-3xl text-slate-600">{subtitle}</p><div className="mt-8">{children}</div></div>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="mt-5 block text-sm font-bold text-slate-700">{label}<div className="mt-2">{children}</div></label>; }
function Action({onClick,loading,children}:{onClick:()=>void;loading:boolean;children:React.ReactNode}) { return <button onClick={onClick} disabled={loading} className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-xl bg-[#1677ff] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60">{loading?<Loader2 className="h-5 w-5 animate-spin"/>:null}{children}<ArrowRight className="h-5 w-5"/></button>; }
