import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Ticket {
  id: string;
  subject: string;
  status: 'aberto' | 'respondido' | 'fechado';
  created_at: string;
  resolved_at?: string;
}

export default function ClientSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/support/list-tickets', {
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

  const getStatusBadge = (status: Ticket['status']) => {
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
            Resolvido
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE9]" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-950 text-sm mb-1">Meus Chamados de Suporte</h3>
            <p className="text-gray-400 text-xs">
              Acompanhe seu histórico de atendimentos e tire dúvidas com nosso suporte.
            </p>
          </div>
          <Link to="/contato">
            <Button variant="gradient" size="sm">
              <HelpCircle className="w-4 h-4" />
              Novo Chamado
            </Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-gray-500 mb-1">Nenhum chamado aberto</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
              Você não possui nenhum chamado de suporte ativo. Se precisar de assistência, clique no botão para abrir um.
            </p>
            <Link to="/contato">
              <Button variant="outline" size="sm">Abrir chamado de suporte</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5B4FE9] transition-colors">
                    {t.subject}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
                    <span>ID: #{t.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>Criado em: {new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                    {t.resolved_at && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-semibold">
                          Resolvido em: {new Date(t.resolved_at).toLocaleDateString('pt-BR')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {getStatusBadge(t.status)}
                  <Link to={`/suporte/ticket/${t.id}`}>
                    <button className="w-8 h-8 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
