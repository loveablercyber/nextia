import { Link } from 'react-router-dom';
import {
  ArrowRight, ExternalLink, Calendar, AlertCircle,
  Clock, Zap, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { statusConfig } from '../../types/project';
import Button from '../../components/ui/Button';

export default function OverviewPage() {
  const { project, loading } = useProject();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4FE9]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center max-w-md mx-auto my-12">
        <div className="text-4xl mb-4">📂</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum projeto ativo</h3>
        <p className="text-gray-500 mb-6 text-sm">
          Você ainda não tem um projeto em andamento. Inicie criando um orçamento automático.
        </p>
        <Link to="/orcamento">
          <Button variant="primary">Criar orçamento agora</Button>
        </Link>
      </div>
    );
  }

  const currentStatus = statusConfig[project.status];
  const pendingPayments = project.payments.filter(p => p.status !== 'pago');
  const hasAwaitingAction = project.status === 'em-revisao' || project.status === 'aguardando-briefing';

  // Format dates
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Awaiting Action Banner */}
      {hasAwaitingAction && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-pulse">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900 mb-1">
              {project.status === 'em-revisao'
                ? 'Revisão do site disponível!'
                : 'Briefing pendente'}
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed mb-3">
              {project.status === 'em-revisao'
                ? 'Seu site está pronto para revisão. Dê uma olhada na versão de testes e aprove ou solicite alterações.'
                : 'Precisamos que você envie as informações do seu negócio no briefing para iniciarmos a criação do site.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.status === 'em-revisao' ? (
                <>
                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 border-none">
                      Visualizar site de testes
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <Link to="/painel/alteracoes">
                    <Button variant="outline" size="sm" className="border-amber-200 text-amber-800 hover:bg-amber-100/50">
                      Solicitar alterações
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/painel/arquivos">
                  <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 border-none">
                    Preencher briefing e enviar arquivos
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Stats and Status */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Project Header Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5B4FE9]/5 rounded-bl-full pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentStatus.dot }}
              />
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}
              >
                {currentStatus.label}
              </span>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-1">{project.name}</h2>
            <p className="text-gray-400 text-xs mb-4">
              Plano: <span className="font-bold text-gray-600">Nextia {project.plan}</span>
              {project.domain && ` · Domínio: ${project.domain}`}
            </p>
          </div>

          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-gray-500">Progresso do projeto</span>
                <span className="text-[#5B4FE9]">{project.progressPercent}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] rounded-full transition-all duration-500"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sub details */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-400 block">Iniciado em</span>
                  <span className="font-semibold text-gray-700">{formatDate(project.startedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-400 block">Previsão de entrega</span>
                  <span className="font-semibold text-gray-700">{formatDate(project.estimatedDelivery)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Request Usage Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Ajustes inclusos</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Quantidade de solicitações de alteração restantes em seu ciclo atual.
            </p>
          </div>

          <div className="my-6 text-center">
            <div className="inline-block relative">
              <span className="text-5xl font-black text-gray-900">
                {project.requestsRemaining}
              </span>
              <span className="text-gray-300 text-lg font-bold ml-1">
                / {project.requestsTotal}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Solicitações disponíveis</div>
          </div>

          <Link to="/painel/alteracoes">
            <Button variant="outline" size="sm" className="w-full justify-center">
              Solicitar nova alteração
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Milestones & Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Milestones / Roadmaps */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#5B4FE9]" />
            Etapas do projeto
          </h3>

          <div className="relative border-l border-gray-100 ml-3 space-y-6">
            {project.milestones.map((m) => {
              const isCompleted = m.status === 'concluido';
              const isCurrent = m.status === 'em-andamento';

              return (
                <div key={m.id} className="relative pl-7">
                  {/* Status node */}
                  <div
                    className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                      isCompleted
                        ? 'bg-[#5B4FE9]'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-gray-100'
                    }`}
                  >
                    {isCompleted && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted
                            ? 'text-gray-500 line-through'
                            : isCurrent
                            ? 'text-[#5B4FE9]'
                            : 'text-gray-800'
                        }`}
                      >
                        {m.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Etapa atual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{m.description}</p>
                    {m.completedAt && (
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Concluído em: {formatDate(m.completedAt)}
                      </span>
                    )}
                    {m.estimatedAt && !m.completedAt && (
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Previsão: {formatDate(m.estimatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick Actions & Invoices */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Ações rápidas</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/painel/arquivos">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-2.5">
                    📁 Enviar arquivos do site
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link to="/painel/alteracoes">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-2.5">
                    ✏️ Solicitar ajuste de texto/foto
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-50 transition-all text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-2.5">
                    💬 Falar com suporte técnico
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
              </a>
            </div>
          </div>

          {/* Pending Invoices / Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Financeiro</h3>
            
            {pendingPayments.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Nenhuma fatura pendente</p>
                <Link to="/painel/pagamentos" className="text-[10px] text-[#5B4FE9] hover:underline font-semibold mt-1 block">
                  Ver histórico de pagamentos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">{p.description}</div>
                      <div className="text-[10px] text-red-500 font-semibold mt-0.5">
                        Vence em: {formatDate(p.dueDate)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-gray-800">
                        R$ {p.amount.toLocaleString('pt-BR')}
                      </div>
                      <Link to="/painel/pagamentos" className="text-[10px] text-[#5B4FE9] hover:underline font-bold mt-1 block">
                        Pagar fatura
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
