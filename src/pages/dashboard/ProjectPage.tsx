import { Link } from 'react-router-dom';
import {
  ExternalLink, Shield, Globe, Cpu, CreditCard
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Button from '../../components/ui/Button';

export default function ProjectPage() {
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
      <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
        <Globe className="w-12 h-12 text-[#5B4FE9] mx-auto opacity-80" />
        <h2 className="text-xl font-bold text-gray-900">Seu projeto está pronto para iniciar</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Para que nossa equipe comece a configuração da sua loja ou site profissional, envie as informações básicas do seu negócio no briefing.
        </p>
        <Link to="/painel/briefing" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5B4FE9] px-6 text-sm font-bold text-white shadow-md hover:bg-[#4F46E5]">
          Preencher briefing do projeto →
        </Link>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-400 block mb-1">Acompanhamento do site</span>
          <h2 className="text-2xl font-black text-gray-900">{project.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          {project.previewUrl && (
            <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="md">
                Ver site de testes
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
          {project.siteUrl && (
            <a href={project.siteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="gradient" size="md">
                Visitar site ativo
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Domain & Hosting details */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 space-y-6">
          <div>
            <h3 className="font-bold text-gray-950 text-sm mb-4">Informações técnicas</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#5B4FE9]" />
                <div>
                  <span className="text-gray-400 text-xs block mb-0.5">Domínio principal</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {project.domain || 'Aguardando definição'}
                  </span>
                  {project.domain && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold block mt-1 w-max">
                      DNS Configurado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <span className="text-gray-400 text-xs block mb-0.5">Status do SSL (HTTPS)</span>
                  <span className="text-sm font-semibold text-gray-700">Ativo</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Criptografia de 256 bits</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <Cpu className="w-5 h-5 text-[#7c3aed]" />
                <div>
                  <span className="text-gray-400 text-xs block mb-0.5">Hospedagem</span>
                  <span className="text-sm font-semibold text-gray-700">Inclusa (Nextia Cloud)</span>
                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold block mt-1 w-max">
                    Ultra rápida ⚡
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-gray-400 text-xs block mb-0.5">Plano contratado</span>
                  <span className="text-sm font-semibold text-gray-700">Nextia {project.plan}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Mensalidade: R$ {project.monthlyFee.toLocaleString('pt-BR')}/mês
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Configuration Instructions (visible if domain exists but site is not yet published) */}
          {project.status !== 'publicado' && project.domain && (
            <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-2xl p-5">
              <h4 className="font-bold text-gray-900 text-sm mb-2">Instruções para apontamento do domínio</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Se você já comprou o domínio <strong>{project.domain}</strong> em provedores como Registro.br ou GoDaddy, aponte a zona DNS para os servidores da Nextia para que possamos publicar o seu site:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex bg-white/70 p-2.5 rounded-xl border border-gray-100">
                  <span className="w-16 font-bold text-gray-500">Tipo A:</span>
                  <span className="font-mono text-gray-700 flex-1">@</span>
                  <span className="font-mono text-[#5B4FE9] font-semibold">185.199.108.153</span>
                </div>
                <div className="flex bg-white/70 p-2.5 rounded-xl border border-gray-100">
                  <span className="w-16 font-bold text-gray-500">CNAME:</span>
                  <span className="font-mono text-gray-700 flex-1">www</span>
                  <span className="font-mono text-[#5B4FE9] font-semibold">cname.nextia.com.br</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                💡 Se tiver dúvidas de como fazer o apontamento DNS, entre em contato pelo nosso chat de suporte e nós fazemos isso para você.
              </p>
            </div>
          )}
        </div>

        {/* Milestone Detail Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Cronograma detalhado</h3>
          
          <div className="relative border-l border-gray-100 ml-2 space-y-6">
            {project.milestones.map((m) => {
              const isCompleted = m.status === 'concluido';
              const isCurrent = m.status === 'em-andamento';

              return (
                <div key={m.id} className="relative pl-6">
                  <div
                    className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                      isCompleted ? 'bg-[#5B4FE9]' : isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-gray-100'
                    }`}
                  />
                  <div>
                    <h4 className={`text-xs font-bold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{m.description}</p>
                    {m.completedAt && (
                      <span className="text-[9px] font-medium text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        Concluído em: {formatDate(m.completedAt)}
                      </span>
                    )}
                    {m.estimatedAt && !m.completedAt && (
                      <span className="text-[9px] font-medium text-gray-400 mt-1 inline-block">
                        Estimado para: {formatDate(m.estimatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
