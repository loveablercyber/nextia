import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Inbox, Loader2, Mail, MessageSquareReply, Phone } from 'lucide-react';

type Site = { id:string;business_name:string };
type Conversation = {
  id:string;public_code:string;channel:string;subject:string;status:string;last_message_at:string;
  contact_name:string;contact_email?:string;contact_phone?:string;last_message?:string;message_count:number;
};
type Message = { id:string;direction:'inbound'|'outbound'|'internal';body:string;delivery_status:string;created_at:string };
type ConversationDetail = Conversation & { contact_email?:string;contact_phone?:string };

async function api<T>(input:string,init?:RequestInit):Promise<T>{
  const response=await fetch(input,{credentials:'include',cache:'no-store',...init,headers:{'Content-Type':'application/json',...(init?.headers||{})}});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Não foi possível concluir a operação.');
  return data;
}

export default function SiteInboxPage(){
  const [site,setSite]=useState<Site|null|undefined>(undefined);
  const [conversations,setConversations]=useState<Conversation[]>([]);
  const [selected,setSelected]=useState<ConversationDetail|null>(null);
  const [messages,setMessages]=useState<Message[]>([]);
  const [reply,setReply]=useState('');
  const [loadingConversation,setLoadingConversation]=useState(false);
  const [sending,setSending]=useState(false);
  const [notice,setNotice]=useState('');

  useEffect(()=>{
    api<{sites:Site[]}>('/api/sites/me').then(async data=>{
      const current=data.sites?.[0]||null;setSite(current);
      if(current){const inbox=await api<{conversations:Conversation[]}>(`/api/sites/${current.id}/conversations`);setConversations(inbox.conversations||[]);}
    }).catch(cause=>{setNotice(cause instanceof Error?cause.message:'Não foi possível carregar as mensagens.');setSite(null);});
  },[]);

  async function openConversation(conversation:Conversation){
    if(!site)return;
    setLoadingConversation(true);setNotice('');
    try{const data=await api<{conversation:ConversationDetail;messages:Message[]}>(`/api/sites/${site.id}/conversations/${conversation.id}`);setSelected(data.conversation);setMessages(data.messages);}
    catch(cause){setNotice(cause instanceof Error?cause.message:'Não foi possível abrir a conversa.');}
    finally{setLoadingConversation(false);}
  }

  async function sendReply(event:FormEvent){
    event.preventDefault();if(!site||!selected||!reply.trim())return;
    setSending(true);setNotice('');
    try{
      const data=await api<{message:Message;delivery:{notice:string}}>(`/api/sites/${site.id}/conversations/${selected.id}/messages`,{method:'POST',body:JSON.stringify({message:reply})});
      setMessages(current=>[...current,data.message]);setReply('');setNotice(data.delivery.notice);
      setConversations(current=>current.map(item=>item.id===selected.id?{...item,status:'pending',last_message:data.message.body,last_message_at:data.message.created_at,message_count:Number(item.message_count)+1}:item));
    }catch(cause){setNotice(cause instanceof Error?cause.message:'Não foi possível registrar a resposta.');}
    finally{setSending(false);}
  }

  async function resolveConversation(){
    if(!site||!selected)return;
    try{
      await api(`/api/sites/${site.id}/conversations/${selected.id}`,{method:'PATCH',body:JSON.stringify({status:'resolved'})});
      setSelected({...selected,status:'resolved'});setConversations(current=>current.map(item=>item.id===selected.id?{...item,status:'resolved'}:item));setNotice('Conversa marcada como resolvida.');
    }catch(cause){setNotice(cause instanceof Error?cause.message:'Não foi possível atualizar a conversa.');}
  }

  if(site===undefined)return <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600"/></div>;
  if(!site)return <Empty title="Nenhum site disponível" text="Crie sua demonstração para começar a receber contatos pelo site."/>;

  return <div className="space-y-5">
    <section className="rounded-3xl border border-gray-100 bg-white p-6"><span className="text-xs font-black uppercase tracking-[.16em] text-indigo-600">Atendimento do site</span><h1 className="mt-2 text-2xl font-black">Mensagens de {site.business_name}</h1><p className="mt-1 text-sm text-gray-500">Contatos enviados pelo formulário público aparecem aqui, isolados nesta empresa.</p></section>
    <section className="grid min-h-[560px] overflow-hidden rounded-3xl border border-gray-100 bg-white lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-gray-100 lg:border-b-0 lg:border-r"><div className="border-b border-gray-100 p-4 text-sm font-black">Conversas ({conversations.length})</div>{conversations.length===0?<div className="p-8 text-center text-sm text-gray-400"><Inbox className="mx-auto mb-3 h-7 w-7"/>Nenhuma mensagem recebida.</div>:<div className="max-h-[650px] overflow-y-auto">{conversations.map(item=><button key={item.id} onClick={()=>openConversation(item)} className={`w-full border-b border-gray-50 p-4 text-left transition ${selected?.id===item.id?'bg-indigo-50':'hover:bg-gray-50'}`}><div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-gray-900">{item.contact_name}</strong><Status value={item.status}/></div><div className="mt-1 truncate text-xs font-semibold text-gray-500">{item.subject}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">{item.last_message}</p><time className="mt-2 block text-[10px] text-gray-400">{new Date(item.last_message_at).toLocaleString('pt-BR')}</time></button>)}</div>}</aside>
      <div className="flex min-w-0 flex-col">{loadingConversation?<div className="grid flex-1 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600"/></div>:!selected?<div className="grid flex-1 place-items-center p-8 text-center"><div><MessageSquareReply className="mx-auto h-10 w-10 text-gray-200"/><h2 className="mt-3 font-black text-gray-700">Selecione uma conversa</h2><p className="mt-1 text-sm text-gray-400">Veja o histórico e registre uma resposta.</p></div></div>:<><header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-5"><div><div className="flex items-center gap-2"><h2 className="font-black">{selected.contact_name}</h2><Status value={selected.status}/></div><div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">{selected.contact_email&&<span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5"/>{selected.contact_email}</span>}{selected.contact_phone&&<span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5"/>{selected.contact_phone}</span>}</div></div>{selected.status!=='resolved'&&<button onClick={resolveConversation} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Resolver</button>}</header><div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-5">{messages.map(message=><div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.direction==='outbound'?'ml-auto bg-indigo-600 text-white':'bg-white text-gray-700'}`}><p className="whitespace-pre-wrap leading-6">{message.body}</p><span className={`mt-2 block text-[10px] ${message.direction==='outbound'?'text-indigo-200':'text-gray-400'}`}>{new Date(message.created_at).toLocaleString('pt-BR')} · {message.delivery_status}</span></div>)}</div><form onSubmit={sendReply} className="border-t border-gray-100 p-4"><textarea value={reply} onChange={event=>setReply(event.target.value)} maxLength={4000} placeholder="Escreva sua resposta…" className="min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-indigo-400"/><div className="mt-2 flex items-center justify-between gap-3"><p className="text-[10px] text-gray-400">A entrega externa depende da configuração de e-mail ou WhatsApp.</p><button disabled={sending||!reply.trim()} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{sending?'Registrando…':'Registrar resposta'}</button></div></form></>}</div>
    </section>{notice&&<p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">{notice}</p>}
  </div>;
}

function Status({value}:{value:string}){const colors=value==='resolved'?'bg-emerald-50 text-emerald-700':value==='pending'?'bg-amber-50 text-amber-700':'bg-indigo-50 text-indigo-700';return <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${colors}`}>{value}</span>;}
function Empty({title,text}:{title:string;text:string}){return <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center"><Inbox className="mx-auto h-8 w-8 text-gray-300"/><h1 className="mt-3 text-xl font-black">{title}</h1><p className="mt-2 text-sm text-gray-500">{text}</p></div>;}
