import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Search, AlertCircle, Trash2, Bot, Save, PauseCircle, PlayCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../config/permissions';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'aberto' | 'respondido' | 'fechado';
  created_at: string;
  resolved_at?: string;
  user_id?: string;
  assigned_technician_id?: string;
  priority?: string;
  ai_paused?: boolean;
  ai_auto_reply_count?: number;
  ai_last_decision?: string;
}

interface Technician { id: string; name: string; email: string; }
interface Candidate { id:string; name:string; eligible:boolean; score:number; reasons:string[]; failures:string[]; active_tickets:number; max_simultaneous_tickets:number; }
interface SupportAiSettings { mode:'off'|'draft'|'auto'; confidence_threshold:number|string; max_auto_replies:number; business_hours_only:boolean; business_hours_start:string; business_hours_end:string; timezone:string; }

export default function AdminSupportPage() {
  const { user } = useAuth();
  const canManageSupport = hasPermission(user, 'support.manage');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [recommendations,setRecommendations]=useState<Record<string,Candidate[]>>({});
  const [aiSettings,setAiSettings]=useState<SupportAiSettings|null>(null);
  const [globalAiEnabled,setGlobalAiEnabled]=useState(false);
  const [savingAi,setSavingAi]=useState(false);
  const [notice,setNotice]=useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aberto' | 'respondido' | 'fechado'>('todos');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const [response, settingsResponse] = await Promise.all([
        fetch('/api/admin/list-support-tickets', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/admin/support-ai/settings', { credentials: 'include', cache: 'no-store' }),
      ]);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao carregar chamados');
      }

      const data = await response.json();
      setTickets(data.tickets);
      setTechnicians(data.technicians || []);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setAiSettings(settingsData.settings);
        setGlobalAiEnabled(settingsData.globalAiEnabled === true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao carregar os chamados.');
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId: string, technicianId: string, priority: string) => {
    const response = await fetch('/api/admin/assign-support-ticket', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId, technicianId: technicianId || null, priority }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Falha ao atribuir chamado.'); return; }
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, ...data.ticket } : ticket));
  };
  const loadRecommendations=async(ticketId:string)=>{const response=await fetch(`/api/admin/ticket-assignment-options?ticketId=${ticketId}`,{credentials:'include'});const data=await response.json();if(!response.ok){setError(data.error);return;}setRecommendations(current=>({...current,[ticketId]:data.candidates}));};

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    let result = statusFilter === 'todos' ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term) ||
          t.message.toLowerCase().includes(term) ||
          (t.company && t.company.toLowerCase().includes(term))
      );
    }

    return result;
  }, [tickets, statusFilter, searchTerm]);

  const handleUpdateStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      const response = await fetch('/api/admin/update-ticket-status', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId, status: newStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar status');
      }

      // Update locally
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: newStatus, resolved_at: newStatus === 'fechado' ? new Date().toISOString() : undefined }
            : t
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao atualizar status.');
    }
  };

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    if (!confirm(`Remover permanentemente o ticket "${ticket.subject}"?`)) return;
    const response = await fetch('/api/admin/support-ticket/delete', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId: ticket.id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Falha ao remover ticket.'); return; }
    setTickets((current) => current.filter((item) => item.id !== ticket.id));
  };

  const saveAiSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!aiSettings) return;
    setSavingAi(true);setError(null);setNotice('');
    try {
      const response=await fetch('/api/admin/support-ai/settings/update',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:aiSettings.mode,confidenceThreshold:Number(aiSettings.confidence_threshold),maxAutoReplies:Number(aiSettings.max_auto_replies),businessHoursOnly:aiSettings.business_hours_only,businessHoursStart:String(aiSettings.business_hours_start).slice(0,5),businessHoursEnd:String(aiSettings.business_hours_end).slice(0,5)})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Falha ao salvar configurações.');setAiSettings(data.settings);setNotice('Configuração da IA de suporte salva.');
    }catch(requestError){setError(requestError instanceof Error?requestError.message:'Falha ao salvar configurações.')}finally{setSavingAi(false)}
  };

  const toggleTicketAi = async (ticket: SupportTicket) => {
    const response=await fetch('/api/admin/support-ticket/ai-pause',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticketId:ticket.id,paused:!ticket.ai_paused})});
    const data=await response.json();if(!response.ok){setError(data.error||'Falha ao alterar a IA do chamado.');return}setTickets(current=>current.map(item=>item.id===ticket.id?{...item,...data.ticket}:item));
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'aberto':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full">
            <Clock className="w-3 h-3" />
            Aberto
          </span>
        );
      case 'respondido':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Respondido
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-full">
            Fechado
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-sm text-red-600 font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{notice}</p>}

      {aiSettings && (
        <form onSubmit={saveAiSettings} className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex gap-3"><span className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Bot className="h-6 w-6" /></span><div><h3 className="font-black text-slate-950">IA no atendimento de suporte</h3><p className="mt-1 max-w-2xl text-sm text-slate-600">Controle respostas automáticas e rascunhos. Chamados de risco, baixa confiança ou que pedem revisão humana nunca recebem resposta automática.</p></div></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${globalAiEnabled?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>IA global: {globalAiEnabled?'ligada':'desligada'}</span>
          </div>
          {!globalAiEnabled && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><b>Atenção:</b> ative primeiro “IA” em Automações → Controles globais. Esta configuração sozinha não ignora o bloqueio global.</p>}
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-bold text-slate-800">Modo<select disabled={!canManageSupport} value={aiSettings.mode} onChange={event=>setAiSettings({...aiSettings,mode:event.target.value as SupportAiSettings['mode']})} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"><option value="off">Desativada</option><option value="draft">Somente rascunho</option><option value="auto">Resposta automática</option></select></label>
            <label className="text-sm font-bold text-slate-800">Confiança mínima<select disabled={!canManageSupport} value={Number(aiSettings.confidence_threshold)} onChange={event=>setAiSettings({...aiSettings,confidence_threshold:Number(event.target.value)})} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"><option value={0.5}>50%</option><option value={0.65}>65%</option><option value={0.75}>75% (recomendado)</option><option value={0.85}>85%</option><option value={0.95}>95%</option></select></label>
            <label className="text-sm font-bold text-slate-800">Máximo por chamado<input disabled={!canManageSupport} type="number" min={1} max={20} value={aiSettings.max_auto_replies} onChange={event=>setAiSettings({...aiSettings,max_auto_replies:Number(event.target.value)})} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal" /></label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-800"><input disabled={!canManageSupport} type="checkbox" checked={aiSettings.business_hours_only} onChange={event=>setAiSettings({...aiSettings,business_hours_only:event.target.checked})} className="h-4 w-4" />Somente em horário comercial</label>
          </div>
          {aiSettings.business_hours_only && <div className="mt-4 flex flex-wrap gap-4"><label className="text-sm font-bold text-slate-800">Início<input disabled={!canManageSupport} type="time" value={String(aiSettings.business_hours_start).slice(0,5)} onChange={event=>setAiSettings({...aiSettings,business_hours_start:event.target.value})} className="ml-2 rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-bold text-slate-800">Fim<input disabled={!canManageSupport} type="time" value={String(aiSettings.business_hours_end).slice(0,5)} onChange={event=>setAiSettings({...aiSettings,business_hours_end:event.target.value})} className="ml-2 rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><span className="self-center text-xs text-slate-500">Segunda a sexta · America/Sao_Paulo</span></div>}
          {canManageSupport && <div className="mt-5 flex justify-end"><button disabled={savingAi} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-60"><Save className="h-4 w-4" />{savingAi?'Salvando...':'Salvar configuração'}</button></div>}
        </form>
      )}

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-950 text-sm mb-1">Tickets de Suporte Geral</h3>
            <p className="text-gray-400 text-xs">
              Monitore chamados abertos através do formulário de contato por clientes ou visitantes.
            </p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, assunto..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase flex-shrink-0">Filtrar:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-950 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
            >
              <option value="todos">Todos</option>
              <option value="aberto">Abertos</option>
              <option value="respondido">Respondidos</option>
              <option value="fechado">Fechados</option>
            </select>
          </div>
        </div>

        {/* List of tickets */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-gray-500">Nenhum ticket encontrado</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Não há chamados de suporte correspondentes aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl transition-all space-y-4 hover:border-pink-200"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900">{t.subject}</h4>
                    <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                      Por: {t.name} ({t.company || 'Visitante'})
                    </span>
                    <span className="text-[10px] bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {t.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(t.status)}
                    {t.ai_paused && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">IA pausada</span>}
                    <Link to={`/suporte/ticket/${t.id}`}>
                      <Button variant="secondary" size="sm">
                        Abrir Chat
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                    {canManageSupport && aiSettings?.mode==='auto' && <button type="button" onClick={()=>void toggleTicketAi(t)} className={`inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold ${t.ai_paused?'border-emerald-200 text-emerald-700':'border-amber-200 text-amber-700'}`} title={t.ai_paused?'Retomar respostas automáticas':'Pausar respostas automáticas'}>{t.ai_paused?<PlayCircle className="h-3.5 w-3.5"/>:<PauseCircle className="h-3.5 w-3.5"/>}{t.ai_paused?'Retomar IA':'Pausar IA'}</button>}
                    {canManageSupport && <button onClick={() => handleDeleteTicket(t)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600" title="Remover ticket"><Trash2 className="h-3.5 w-3.5"/>Remover</button>}
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-gray-500 leading-relaxed bg-white p-3.5 border border-gray-100 rounded-2xl max-h-24 overflow-hidden text-ellipsis line-clamp-2">
                  {t.message}
                </p>

                {/* Footer status picker */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] text-gray-400">
                  <div className="space-x-4">
                    <span>Aberto em: {new Date(t.created_at).toLocaleString('pt-BR')}</span>
                    <span>Respostas da IA: {t.ai_auto_reply_count || 0}{t.ai_last_decision ? ` · ${t.ai_last_decision}` : ''}</span>
                    {t.resolved_at && (
                      <span className="text-green-600 font-semibold">
                        Fechado em: {new Date(t.resolved_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {canManageSupport && <div className="flex items-center gap-2">
                    <select value={t.priority || 'normal'} onChange={(e) => assignTicket(t.id, t.assigned_technician_id || '', e.target.value)} className="min-h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs" aria-label="Prioridade"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select>
                    <select value={t.assigned_technician_id || ''} onChange={(e) => assignTicket(t.id, e.target.value, t.priority || 'normal')} className="min-h-9 max-w-44 rounded-lg border border-gray-200 bg-white px-2 text-xs" aria-label="Técnico responsável"><option value="">Sem técnico</option>{technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.name || technician.email}</option>)}</select><button onClick={()=>loadRecommendations(t.id)} className="min-h-9 rounded-lg border border-[#1677FF] px-3 text-xs font-bold text-[#1677FF]">Ver recomendação</button>
                    {recommendations[t.id]&&<div className="mt-3 w-full space-y-2">{recommendations[t.id].map((candidate,index)=><div key={candidate.id} className={`rounded-lg border p-3 text-xs ${candidate.eligible?'border-green-200 bg-green-50':'border-slate-200 bg-slate-50'}`}><div className="flex justify-between"><b>{index===0&&candidate.eligible?'Recomendado: ':''}{candidate.name}</b><span className="font-black">Score {candidate.score}</span></div><p className="mt-1 text-green-700">{candidate.reasons.join(' · ')}</p>{candidate.failures.length>0&&<p className="mt-1 text-red-600">Inelegível: {candidate.failures.join(' · ')}</p>}<p className="mt-1 text-slate-500">Carga: {candidate.active_tickets}/{candidate.max_simultaneous_tickets}</p></div>)}</div>}
                    <span className="font-semibold text-gray-700">Mudar status:</span>
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateStatus(t.id, e.target.value as any)}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-750 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="respondido">Respondido</option>
                      <option value="fechado">Fechado</option>
                    </select>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
