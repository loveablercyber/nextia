import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Search, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

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
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aberto' | 'respondido' | 'fechado'>('todos');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/list-support-tickets', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao carregar chamados');
      }

      const data = await response.json();
      setTickets(data.tickets);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao carregar os chamados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = tickets;

    // Filter by status
    if (statusFilter !== 'todos') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term) ||
          t.message.toLowerCase().includes(term) ||
          (t.company && t.company.toLowerCase().includes(term))
      );
    }

    setFilteredTickets(result);
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
                    <Link to={`/suporte/ticket/${t.id}`}>
                      <Button variant="secondary" size="sm">
                        Abrir Chat
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
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
                    {t.resolved_at && (
                      <span className="text-green-600 font-semibold">
                        Fechado em: {new Date(t.resolved_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
