import { useEffect, useState } from 'react';
import { Loader2, Monitor, Save, Smartphone } from 'lucide-react';
import PreviewSite, { type AcquisitionPreview, type PreviewPage } from '../../features/acquisition/PreviewSite';
import { createPreviewContent, segmentOptions, segmentPresets, type PreviewContent } from '../../features/acquisition/acquisitionPresets';

type Site = AcquisitionPreview & { id:string;content_revision:number;lifecycle_status:string;selected_plan_id:string;public_key:string };

export default function SiteEditorPage() {
  const [site,setSite]=useState<Site|null|undefined>(undefined);
  const [page,setPage]=useState<PreviewPage>('inicio');
  const [device,setDevice]=useState<'desktop'|'mobile'>('desktop');
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    fetch('/api/sites/me',{credentials:'include',cache:'no-store'})
      .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível carregar o site.');return data;})
      .then(data=>setSite(data.sites?.[0]||null))
      .catch(cause=>{setMessage(cause instanceof Error?cause.message:'Não foi possível carregar o site.');setSite(null);});
  },[]);

  function updateContent<K extends keyof PreviewContent>(key:K,value:PreviewContent[K]) {
    setSite(current=>current?{...current,content:{...current.content,[key]:value}}:current);
  }

  async function save(){
    if(!site)return;
    setSaving(true);setMessage('');
    try{
      const response=await fetch(`/api/sites/${site.id}/content`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:site.content,theme:site.theme,businessName:site.business_name,revision:site.content_revision})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Não foi possível salvar o site.');
      setSite(current=>current?{...current,content_revision:data.revision,revision:data.revision}:current);
      setMessage('Alterações salvas no site.');
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Não foi possível salvar o site.');}
    finally{setSaving(false);}
  }

  async function changeSegment(nextSegment:string){
    if(!site||nextSegment===site.segment_slug)return;
    const preset=segmentPresets[nextSegment];
    if(!window.confirm(`Trocar para ${preset.name}? O conteúdo específico de ${segmentPresets[site.segment_slug]?.name||'seu segmento atual'} será substituído. Nome, telefone e endereço poderão ser editados novamente.`))return;
    setSaving(true);setMessage('');
    const content=createPreviewContent(nextSegment,site.business_name);
    try{
      const response=await fetch(`/api/sites/${site.id}/change-segment`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({segmentSlug:nextSegment,templateSlug:preset.templateSlug,replaceContent:true,content,theme:{primaryColor:preset.accent}})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Não foi possível trocar o segmento.');
      setSite(current=>current?{...current,segment_slug:nextSegment,template_slug:preset.templateSlug,content,theme:{primaryColor:preset.accent},content_revision:data.revision,revision:data.revision}:current);
      setPage('inicio');setMessage(`Site atualizado para ${preset.name}.`);
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Não foi possível trocar o segmento.');}
    finally{setSaving(false);}
  }

  if(site===undefined)return <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600"/></div>;
  if(!site)return <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center"><h1 className="text-xl font-black">Nenhum site disponível</h1><p className="mt-2 text-sm text-gray-500">Crie uma demonstração para começar a editar seu site.</p><a href="/crie-seu-site" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Criar site</a>{message&&<p className="mt-3 text-xs text-red-600">{message}</p>}</div>;

  return <div className="space-y-5">
    <section className="rounded-3xl border border-gray-100 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-indigo-600">Editor do site</span><h1 className="mt-2 text-2xl font-black">{site.business_name}</h1><p className="mt-1 text-xs text-gray-500">{site.lifecycle_status==='active'?'Site em produção':'Demonstração Nextia Pro'} · revisão {site.content_revision}</p></div><div className="flex gap-2"><button onClick={()=>setDevice('desktop')} aria-label="Visualização desktop" className={`rounded-xl p-3 ${device==='desktop'?'bg-indigo-50 text-indigo-700':'bg-gray-50 text-gray-400'}`}><Monitor className="h-5 w-5"/></button><button onClick={()=>setDevice('mobile')} aria-label="Visualização celular" className={`rounded-xl p-3 ${device==='mobile'?'bg-indigo-50 text-indigo-700':'bg-gray-50 text-gray-400'}`}><Smartphone className="h-5 w-5"/></button></div></div></section>
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="h-fit space-y-5 rounded-3xl border border-gray-100 bg-white p-5 xl:sticky xl:top-4">
        <Field label="Segmento"><select value={site.segment_slug} onChange={event=>changeSegment(event.target.value)} disabled={saving} className="input">{segmentOptions.map(([slug,name])=><option key={slug} value={slug}>{name}</option>)}</select></Field>
        <Field label="Nome do negócio"><input value={site.business_name} onChange={event=>setSite({...site,business_name:event.target.value})} className="input"/></Field>
        <Field label="Cor principal"><input type="color" value={site.theme?.primaryColor||segmentPresets[site.segment_slug].accent} onChange={event=>setSite({...site,theme:{...site.theme,primaryColor:event.target.value}})} className="h-12 w-full rounded-xl border border-gray-200 p-1"/></Field>
        <Field label="Título principal"><textarea value={site.content.headline} onChange={event=>updateContent('headline',event.target.value)} className="input min-h-24"/></Field>
        <Field label="Descrição"><textarea value={site.content.description} onChange={event=>updateContent('description',event.target.value)} className="input min-h-24"/></Field>
        <Field label="Texto do botão"><input value={site.content.cta} onChange={event=>updateContent('cta',event.target.value)} className="input"/></Field>
        <details><summary className="cursor-pointer text-sm font-black">Serviços e destaques</summary>{site.content.services.map((service,index)=><div key={index} className="mt-3 rounded-xl bg-gray-50 p-3"><input value={service.title} onChange={event=>updateContent('services',site.content.services.map((item,itemIndex)=>itemIndex===index?{...item,title:event.target.value}:item))} className="input"/><textarea value={service.description} onChange={event=>updateContent('services',site.content.services.map((item,itemIndex)=>itemIndex===index?{...item,description:event.target.value}:item))} className="input mt-2 min-h-20"/></div>)}</details>
        <Field label="WhatsApp"><input value={site.content.phone} onChange={event=>{updateContent('phone',event.target.value);updateContent('whatsapp',event.target.value);}} className="input"/></Field>
        <Field label="Endereço"><input value={site.content.address} onChange={event=>updateContent('address',event.target.value)} className="input"/></Field>
        <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}Salvar alterações</button>
        {message&&<p className="text-xs font-semibold text-gray-600">{message}</p>}
      </aside>
      <section className={`mx-auto w-full overflow-hidden rounded-[1.8rem] border-[10px] border-slate-900 bg-white shadow-xl ${device==='mobile'?'max-w-[390px]':''}`}><div className="flex gap-1 overflow-x-auto border-b bg-slate-50 p-2">{(['inicio','servicos','agendamento','contato'] as PreviewPage[]).map(item=><button key={item} onClick={()=>setPage(item)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold capitalize ${page===item?'bg-white text-indigo-700 shadow-sm':'text-gray-500'}`}>{item}</button>)}</div><PreviewSite preview={site} page={page} onPage={setPage} device={device}/></section>
    </div>
  </div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-xs font-bold text-gray-700">{label}<span className="mt-2 block">{children}</span></label>;}
