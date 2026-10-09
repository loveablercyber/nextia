import { useEffect, useMemo, useState } from 'react';
import { Blocks, ExternalLink, Globe2, Loader2, Mail, Save, Timer, WalletCards } from 'lucide-react';

type Addon = { code:string;name:string;description?:string;amount_cents:number;billing_cycle:string };
type Demo = { business_name:string;segment_slug:string;expires_at:string;active:boolean;demoUrl:string;checkoutUrl:string;plan_name_snapshot:string;activation_amount_cents:number;monthly_amount_cents:number;addons:Addon[];availableAddons:Addon[] };
type SiteModule = { code:string;name:string;description:string;category:string;enabled:boolean|null;source:string|null };
type CustomerSite = { id:string;business_name:string;segment_slug:string;lifecycle_status:string;demo_experience_plan_id:string;selected_plan_id:string;content_revision:number;modules:SiteModule[] };
const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});

export default function DemoProjectPage() {
  const [demo,setDemo]=useState<Demo|null|undefined>(undefined);
  const [site,setSite]=useState<CustomerSite|null>(null);
  const [selected,setSelected]=useState<string[]>([]);
  const [domain,setDomain]=useState('');
  const [domainMode,setDomainMode]=useState<'register'|'connect'>('register');
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    Promise.all([
      fetch('/api/acquisition/my-demo',{credentials:'include',cache:'no-store'}).then(r=>r.ok?r.json():{demo:null}),
      fetch('/api/sites/me',{credentials:'include',cache:'no-store'}).then(r=>r.ok?r.json():{sites:[]}),
    ])
      .then(([demoData,siteData])=>{ const value=demoData.demo||null; setDemo(value); setSelected(value?.addons?.map((item:Addon)=>item.code)||[]); setSite(siteData.sites?.[0]||null); })
      .catch(()=>setDemo(null));
  },[]);

  const checkoutUrl=useMemo(()=>{
    if(!demo) return '#';
    const params=new URLSearchParams(demo.checkoutUrl.split('?')[1]||'');
    if(domain.trim()){ params.set('domain',domain.trim().toLowerCase()); params.set('domainMode',domainMode); }
    return `${demo.checkoutUrl.split('?')[0]}?${params.toString()}`;
  },[demo,domain,domainMode]);

  async function saveOptions(){
    setSaving(true); setMessage('');
    try{
      const response=await fetch('/api/acquisition/my-demo/configuration',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({addonCodes:selected})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Não foi possível salvar os opcionais.');
      setDemo(current=>current?{...current,addons:data.addons,activation_amount_cents:data.activationTotalCents,monthly_amount_cents:data.monthlyTotalCents}:current);
      setMessage('Configuração salva. Os valores do checkout foram atualizados.');
    }catch(cause){ setMessage(cause instanceof Error?cause.message:'Não foi possível salvar os opcionais.'); }
    finally{ setSaving(false); }
  }

  async function toggleModule(module:SiteModule){
    if(!site) return;
    setMessage('');
    const enabled=!module.enabled;
    try{
      const response=await fetch(`/api/sites/${site.id}/modules/${module.code}`,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Não foi possível alterar o módulo.');
      setSite(current=>current?{...current,modules:current.modules.map(item=>item.code===module.code?{...item,enabled}:item)}:current);
      setMessage(`${module.name} ${enabled?'ativado':'desativado'} na demonstração.`);
    }catch(cause){ setMessage(cause instanceof Error?cause.message:'Não foi possível alterar o módulo.'); }
  }

  if(demo===undefined) return <div className="grid min-h-60 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600"/></div>;
  if(!demo) return <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center"><h1 className="text-xl font-black">Nenhuma demonstração vinculada</h1><p className="mt-2 text-sm text-gray-500">Crie uma prévia para experimentar seu modelo antes de contratar.</p><a href="/crie-seu-site" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Criar prévia</a></div>;
  const days=Math.max(0,Math.ceil((new Date(demo.expires_at).getTime()-Date.now())/86400000));

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 to-slate-950 p-6 text-white">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold"><Timer className="h-4 w-4"/>{demo.active?`${days} dia(s) restante(s)`:'Demonstração expirada'}</span>
      <h1 className="mt-4 text-3xl font-black">{demo.business_name}</h1>
      <p className="mt-2 text-sm text-indigo-100">Sua demonstração é temporária. A contratação só acontece depois da sua confirmação e do pagamento.</p>
      <a href={demo.demoUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-700">Abrir site demonstrativo <ExternalLink className="h-4 w-4"/></a>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <Card icon={<WalletCards/>} title="Plano selecionado"><strong>{demo.plan_name_snapshot}</strong><p>{money.format(demo.activation_amount_cents/100)} de ativação</p><p>{money.format(demo.monthly_amount_cents/100)}/mês</p></Card>
      <Card icon={<Globe2/>} title="Domínio e pagamento"><p>Registre um domínio novo ou conecte um domínio que você já possui no checkout.</p></Card>
      <Card icon={<Mail/>} title="Conta e e-mail"><p>Seu acesso já está ativo. Marque “E-mail profissional” nos opcionais para usar o domínio do negócio.</p></Card>
    </section>

    {site&&<section className="rounded-3xl border border-indigo-100 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-indigo-600"><Blocks className="h-4 w-4"/>Site operacional</span><h2 className="mt-2 text-xl font-black">Demonstração completa no Nextia Pro</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">Este já é o seu site. Ao contratar, a mesma instância será publicada, preservando conteúdo e configurações. Durante o teste, os módulos Pro compatíveis com o segmento ficam disponíveis.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Revisão {site.content_revision}</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{site.modules.map(module=><button key={module.code} type="button" onClick={()=>toggleModule(module)} disabled={!demo.active} aria-pressed={Boolean(module.enabled)} className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${module.enabled?'border-indigo-300 bg-indigo-50':'border-gray-200 bg-gray-50'}`}><span className="flex items-center justify-between gap-3"><strong className="text-sm text-gray-950">{module.name}</strong><span className={`h-5 w-9 rounded-full p-0.5 ${module.enabled?'bg-indigo-600':'bg-gray-300'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${module.enabled?'translate-x-4':'translate-x-0'}`}/></span></span><span className="mt-2 block text-xs leading-5 text-gray-500">{module.description}</span><span className="mt-3 block text-[10px] font-black uppercase tracking-wide text-indigo-600">{module.enabled?'Ativo':'Desativado'}</span></button>)}</div>
    </section>}

    <section className="rounded-3xl border border-gray-100 bg-white p-6">
      <h2 className="font-black">Opcionais para {demo.segment_slug.replace(/-/g,' ')}</h2>
      <p className="mt-1 text-xs text-gray-500">Você pode alterar estes itens durante os 7 dias de demonstração.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{demo.availableAddons.map(addon=><label key={addon.code} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${selected.includes(addon.code)?'border-indigo-400 bg-indigo-50':'border-gray-100 bg-gray-50'}`}><input type="checkbox" className="mt-1" checked={selected.includes(addon.code)} onChange={()=>setSelected(current=>current.includes(addon.code)?current.filter(code=>code!==addon.code):[...current,addon.code])}/><span><strong className="text-sm text-gray-900">{addon.name}</strong>{addon.description&&<p className="mt-1 text-xs leading-5 text-gray-500">{addon.description}</p>}<p className="mt-2 text-xs font-bold text-indigo-700">{money.format(addon.amount_cents/100)}{addon.billing_cycle==='monthly'?'/mês':' uma vez'}</p></span></label>)}</div>
      <button onClick={saveOptions} disabled={saving||!demo.active} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}Salvar opcionais</button>
      {message&&<p className="mt-3 text-xs font-semibold text-gray-600">{message}</p>}
    </section>

    <section className="rounded-3xl border border-gray-100 bg-white p-6">
      <h2 className="font-black">Configure o domínio</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]"><label className="text-xs font-bold text-gray-700">Domínio desejado<input value={domain} onChange={event=>setDomain(event.target.value)} placeholder="suaempresa.com.br" className="mt-2 min-h-11 w-full rounded-xl border border-gray-200 px-3"/></label><label className="text-xs font-bold text-gray-700">O que deseja fazer?<select value={domainMode} onChange={event=>setDomainMode(event.target.value as 'register'|'connect')} className="mt-2 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-3"><option value="register">Registrar novo domínio</option><option value="connect">Conectar domínio existente</option></select></label></div>
    </section>

    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-black text-amber-950">Pronto para publicar?</h2><p className="mt-2 text-sm text-amber-800">No próximo passo você revisa o pedido, confirma domínio, opcionais e pagamento. Nada será cobrado sem sua ação.</p><a href={checkoutUrl} className="mt-5 inline-flex rounded-xl bg-amber-700 px-5 py-3 text-sm font-black text-white">Revisar pedido e contratar</a></section>
  </div>;
}

function Card({icon,title,children}:{icon:React.ReactNode;title:string;children:React.ReactNode}) { return <article className="rounded-3xl border border-gray-100 bg-white p-5"><span className="text-indigo-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</span><h2 className="mt-3 text-sm font-black">{title}</h2><div className="mt-2 space-y-1 text-xs leading-5 text-gray-500">{children}</div></article>; }
