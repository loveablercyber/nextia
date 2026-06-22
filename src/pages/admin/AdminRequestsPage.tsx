import {
  MessageSquare
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { requestStatusConfig } from '../../types/project';

export default function AdminRequestsPage() {
  const { projects, loading, updateRequestStatus } = useAdmin();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Flatten all tickets
  const tickets = projects.flatMap(p => p.changeRequests.map(r => ({ ...r, project: p })));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-2">Solicitações de alteração dos clientes</h3>
        <p className="text-gray-400 text-xs mb-5">
          Responda a chamados, gerencie prioridades e atualize o status dos pedidos de alteração em aberto.
        </p>

        {tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum chamado aberto por clientes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => {
              const statusInfo = requestStatusConfig[t.status];
              return (
                <div
                  key={t.id}
                  className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl transition-all space-y-4"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-gray-900">{t.title}</h4>
                      <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                        Cliente: {t.project.name}
                      </span>
                      <span className="text-[10px] bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {t.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(t.priority)}`}>
                        Prioridade {t.priority}
                      </span>
                    </div>

                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Body description */}
                  <p className="text-xs text-gray-500 leading-relaxed bg-white p-3.5 border border-gray-100 rounded-2xl">
                    {t.description}
                  </p>

                  {/* Actions & Dates footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] text-gray-400">
                    <div className="space-x-4">
                      <span>Criado em: {new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                      {t.resolvedAt && (
                        <span className="text-green-600 font-semibold">
                          Resolvido em: {new Date(t.resolvedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Mudar status:</span>
                      <select
                        value={t.status}
                        onChange={e => updateRequestStatus(t.project.id, t.id, e.target.value as any)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em-andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
