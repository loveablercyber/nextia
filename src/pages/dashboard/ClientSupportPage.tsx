import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, ChevronRight, Clock, HelpCircle,
  Loader2, MessageSquare, Plus, Send, X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { requestJson } from '../../lib/appData';

interface Ticket {
  id: string;
  subject: string;
  status: 'aberto' | 'respondido' | 'fechado';
  created_at: string;
  resolved_at?: string;
  latest_message_at?: string;
  latest_sender_role?: string;
  unread_messages: number;
}

interface TicketListResponse { tickets: Ticket[] }
interface CreateTicketResponse { ticketId: string }

export default function ClientSupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestJson<TicketListResponse>('/api/support/list-tickets');
      setTickets(data.tickets || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ocorreu um erro ao carregar os chamados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchTickets(); }, [fetchTickets]);

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      const result = await requestJson<CreateTicketResponse>('/api/support/create-ticket', {
        method: 'POST',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          company: user.company,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });
      navigate(`/painel/suporte/${result.ticketId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível abrir o chamado.');
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status: Ticket['status']) => {
    if (status === 'aberto') return <span className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600"><Clock className="h-3 w-3" />Aberto</span>;
    if (status === 'respondido') return <span className="flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 className="h-3 w-3" />Respondido</span>;
    return <span className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[10px] font-bold text-gray-500">Resolvido</span>;
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#5B4FE9]" /></div>;

  const unreadTotal = tickets.reduce((total, ticket) => total + Number(ticket.unread_messages || 0), 0);

  return <div className="space-y-6">
    {error && <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600"><AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span></div>}

    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
        <div><div className="flex items-center gap-2"><h2 className="text-lg font-black text-gray-950">Central de suporte</h2>{unreadTotal > 0 && <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-black text-white">{unreadTotal} nova{unreadTotal > 1 ? 's' : ''}</span>}</div><p className="mt-1 text-xs text-gray-500">Abra, acompanhe e responda seus chamados sem sair do painel.</p></div>
        <Button variant="gradient" size="sm" onClick={() => setShowForm((current) => !current)}><span className="inline-flex items-center gap-2">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? 'Cancelar' : 'Novo chamado'}</span></Button>
      </div>

      {showForm && <form onSubmit={createTicket} className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
        <div className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-violet-600" /><h3 className="font-black text-slate-950">Como podemos ajudar?</h3></div>
        <div className="mt-4 grid gap-4"><label className="text-xs font-bold text-slate-700">Assunto<input required minLength={3} maxLength={300} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Ex.: Preciso alterar uma informação no site" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label><label className="text-xs font-bold text-slate-700">Detalhes<textarea required minLength={5} maxLength={10000} rows={5} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Descreva o que aconteceu, o resultado esperado e qualquer informação importante." className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label></div>
        <div className="mt-4 flex justify-end"><button disabled={creating} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-black text-white disabled:opacity-60">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{creating ? 'Abrindo chamado...' : 'Enviar ao suporte'}</button></div>
      </form>}

      {tickets.length === 0 ? <div className="py-14 text-center text-gray-400"><MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-semibold text-gray-500">Nenhum chamado registrado</p><p className="mx-auto mt-1 max-w-sm text-xs">Quando precisar de ajuda, abra o chamado diretamente nesta página.</p></div> : <div className="divide-y divide-gray-100">{tickets.map((ticket) => <Link key={ticket.id} to={`/painel/suporte/${ticket.id}`} className={`group flex items-center justify-between gap-4 py-4 first:pt-5 last:pb-0 ${ticket.unread_messages > 0 ? 'bg-violet-50/40 px-3' : ''}`}>
        <div className="min-w-0 space-y-1"><div className="flex items-center gap-2"><h3 className="truncate text-sm font-bold text-gray-900 transition group-hover:text-[#5B4FE9]">{ticket.subject}</h3>{ticket.unread_messages > 0 && <span className="shrink-0 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-black text-white">NOVA RESPOSTA</span>}</div><div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400"><span>#{ticket.id.slice(0, 8)}</span><span>•</span><span>Atualizado em {new Date(ticket.latest_message_at || ticket.created_at).toLocaleString('pt-BR')}</span>{ticket.unread_messages > 0 && <span className="font-bold text-violet-600">• {ticket.unread_messages} não lida{ticket.unread_messages > 1 ? 's' : ''}</span>}</div></div>
        <div className="flex shrink-0 items-center gap-3">{statusBadge(ticket.status)}<span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition group-hover:border-violet-200 group-hover:text-violet-600"><ChevronRight className="h-4 w-4" /></span></div>
      </Link>)}</div>}
    </section>
  </div>;
}
