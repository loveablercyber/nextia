import { useState } from 'react';
import {
  MessageSquare, Plus, AlertCircle, Clock, CheckCircle2, AlertTriangle, Send, X
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { requestStatusConfig } from '../../types/project';
import Button from '../../components/ui/Button';

export default function ChangeRequestsPage() {
  const { project, addChangeRequest } = useProject();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Conteúdo',
    priority: 'normal' as 'baixa' | 'normal' | 'alta',
  });

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;

    setLoading(true);
    await addChangeRequest(form.title, form.description, form.category, form.priority);
    setForm({ title: '', description: '', category: 'Conteúdo', priority: 'normal' });
    setLoading(false);
    setModalOpen(false);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-[#5B4FE9] bg-[#eef2ff]';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and counter info */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-950 text-sm mb-2">Solicitações de alteração</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Você pode usar seu saldo de alterações para pedir correções em textos, substituição de imagens, troca de banners ou ajustes nas cores do layout.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Novo ciclo inicia no próximo mês</span>
            <Button
              variant="gradient"
              size="sm"
              disabled={project.requestsRemaining === 0}
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nova solicitação
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between items-center text-center">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Alterações disponíveis</span>
          </div>
          <div className="my-2">
            <span className="text-4xl font-black text-gray-900">{project.requestsRemaining}</span>
            <span className="text-gray-300 font-bold text-sm ml-0.5">/ {project.requestsTotal}</span>
          </div>
          <span className="text-[10px] text-gray-400 leading-relaxed">
            {project.requestsRemaining === 0 ? '⚠️ Cota esgotada para este mês' : 'Renovação mensal automática'}
          </span>
        </div>
      </div>

      {/* Requests list */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Histórico de solicitações</h3>

        {project.changeRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Você ainda não enviou solicitações.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.changeRequests.map((r) => {
              const statusInfo = requestStatusConfig[r.status];
              return (
                <div
                  key={r.id}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">{r.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200/60 text-gray-600 font-medium">
                        {r.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityBadgeColor(r.priority)}`}>
                        Prioridade {r.priority}
                      </span>
                    </div>

                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
                  
                  <div className="text-[9px] text-gray-400 mt-3 pt-3 border-t border-gray-100/50 flex justify-between">
                    <span>Enviado em: {new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                    {r.resolvedAt && (
                      <span className="text-green-600 font-semibold">
                        Resolvido em: {new Date(r.resolvedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm">Solicitar alteração</h4>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Título da solicitação
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Trocar telefone no rodapé"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                  >
                    <option value="Conteúdo">Conteúdo (Textos/Links)</option>
                    <option value="Imagens">Imagens / Banners</option>
                    <option value="Design">Layout / Cores</option>
                    <option value="Funcionalidade">Funcionalidade / Erro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Descrição detalhada
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Seja o mais específico possível. Informe exatamente quais textos devem mudar ou onde a imagem deve ser inserida."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-xs resize-none"
                />
              </div>

              {/* Warning note */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-gray-500 leading-relaxed">
                  Solicitações marcadas como <strong>Alta</strong> prioridade são destinadas a correções críticas no site ativo e consomem cota normal.
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" size="sm" loading={loading}>
                  <Send className="w-3.5 h-3.5" />
                  Enviar solicitação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
