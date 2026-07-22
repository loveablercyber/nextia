import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Zap, MessageCircle, Send, CheckCircle2, Clock, 
  ArrowLeft, AlertTriangle, User, ShieldAlert 
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface Ticket {
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
}

interface Message {
  id: string;
  sender_role: 'client' | 'admin';
  message: string;
  created_at: string;
  sender_name: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/support/get-ticket?id=${id}${token ? `&token=${token}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao carregar chamado');
      }

      const data = await response.json();
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível carregar as informações do chamado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id, token]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !id) return;

    setSending(true);
    try {
      const response = await fetch('/api/support/reply-ticket', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: id,
          message: replyText,
          token: token || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao enviar resposta');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setReplyText('');
      
      // Update ticket status locally to reflect changes
      if (ticket) {
        setTicket({ 
          ...ticket, 
          status: user?.role === 'admin' ? 'respondido' : 'aberto' 
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Aberto
          </span>
        );
      case 'respondido':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-green-600 bg-green-50 border border-green-100 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Respondido
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            Resolvido / Fechado
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE9] mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Carregando detalhes do chamado...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Acesso Negado ou Erro</h2>
          <p className="text-gray-500 text-sm mb-6">
            {error || 'Não foi possível carregar as informações deste chamado de suporte.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button variant="primary" fullWidth>Ir para a página inicial</Button>
            </Link>
            {user ? (
              <Link to="/painel">
                <Button variant="secondary" fullWidth>Ir para o Painel do Cliente</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" fullWidth>Fazer Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-fill parameters for guest registration
  const registrationParams = new URLSearchParams({
    email: ticket.email,
    name: ticket.name,
    company: ticket.company || ''
  }).toString();

  const isGuest = !user;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Guest conversion banner */}
        {isGuest && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#5B4FE9]/10 to-[#7c3aed]/10 border border-[#5B4FE9]/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-gray-900">Acompanhando como visitante</h4>
                <p className="text-xs text-gray-500">
                  Crie sua conta para centralizar seus chamados, projetos e faturas em um só lugar.
                </p>
              </div>
            </div>
            <Link to={`/cadastro?${registrationParams}`} className="w-full sm:w-auto">
              <Button variant="gradient" size="sm" className="shadow-sm">
                Criar minha conta grátis
              </Button>
            </Link>
          </div>
        )}

        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to={user?.role === 'admin' ? '/admin/suporte' : user ? '/painel' : '/'}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a página anterior
          </Link>
        </div>

        {/* Ticket Title & Status Header */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{ticket.subject}</h1>
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-xs text-gray-400">
              Chamado #{ticket.id} • Aberto em {new Date(ticket.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left / Center — Message Chat Area */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex-1 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-gray-900 text-sm mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <MessageCircle className="w-4.5 h-4.5 text-[#5B4FE9]" />
                Histórico de mensagens
              </h3>

              {/* Chat flow list */}
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] mb-6 pr-2">
                {messages.map((msg) => {
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          isAdmin 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'bg-indigo-100 text-indigo-600'
                        }`}
                      >
                        {isAdmin ? 'AD' : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-[10px] text-gray-400 ${
                          isAdmin ? '' : 'justify-end'
                        }`}>
                          <span className="font-semibold text-gray-600">{msg.sender_name}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                              : 'bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] text-white rounded-tr-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply form */}
              {ticket.status !== 'fechado' ? (
                <form onSubmit={handleReplySubmit} className="border-t border-gray-100 pt-4 flex gap-3">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Digite sua resposta..."
                    disabled={sending}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm disabled:opacity-50"
                  />
                  <Button type="submit" variant="gradient" disabled={sending} loading={sending}>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Responder</span>
                  </Button>
                </form>
              ) : (
                <div className="border-t border-gray-100 pt-4 text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 font-semibold">
                    Este chamado foi finalizado e marcado como resolvido.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar — Ticket Info Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 border-b border-gray-100 pb-3">
                Informações do Solicitante
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Nome</span>
                  <span className="font-semibold text-gray-950 block">{ticket.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">E-mail</span>
                  <span className="font-semibold text-gray-950 block break-all">{ticket.email}</span>
                </div>
                {ticket.phone && (
                  <div>
                    <span className="text-gray-400 block mb-1">WhatsApp / Celular</span>
                    <span className="font-semibold text-gray-950 block">{ticket.phone}</span>
                  </div>
                )}
                {ticket.company && (
                  <div>
                    <span className="text-gray-400 block mb-1">Negócio / Empresa</span>
                    <span className="font-semibold text-gray-950 block">{ticket.company}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 border-b border-gray-100 pb-3">
                Status do Chamado
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Status Atual</span>
                  <span className="block mt-1 font-semibold">{ticket.status.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Data de Criação</span>
                  <span className="font-medium text-gray-700 block">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')} às {new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {ticket.resolved_at && (
                  <div>
                    <span className="text-green-600 block mb-0.5 font-bold">Resolvido em</span>
                    <span className="font-semibold text-green-700 block">
                      {new Date(ticket.resolved_at).toLocaleDateString('pt-BR')} às {new Date(ticket.resolved_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
