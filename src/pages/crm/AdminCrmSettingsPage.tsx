import { useState, useEffect } from 'react';
import { Database, Zap, Settings, Info } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_default: boolean;
  stages: Array<{
    id: string;
    name: string;
    slug: string;
    position: number;
    color: string;
    is_won: boolean;
    is_lost: boolean;
  }>;
}

interface LostReason {
  id: string;
  code: string;
  label: string;
  description: string;
  sort_order: number;
}

export default function AdminCrmSettingsPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [lostReasons, setLostReasons] = useState<LostReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pipRes, reasonsRes] = await Promise.all([
          fetch('/api/admin/crm/pipelines'),
          fetch('/api/admin/crm/lost-reasons')
        ]);
        if (!pipRes.ok || !reasonsRes.ok) throw new Error('Erro ao carregar');
        const pipData = await pipRes.json();
        const reasonsData = await reasonsRes.json();
        setPipelines(pipData.pipelines);
        setLostReasons(reasonsData.reasons);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Falha ao carregar configuracoes.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-white text-center py-12">Carregando configurações...</div>;
  if (error) return <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações do CRM</h2>
        <p className="text-gray-400 mt-1">Gerencie pipelines, estágios e motivos de perda</p>
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Sobre o CRM Nextia</h3>
        </div>
        <div className="text-sm text-gray-400 space-y-2">
          <p>O CRM da Nextia foi desenvolvido para centralizar leads, oportunidades, propostas e todo o ciclo comercial da plataforma.</p>
          <p>Funcionalidades implementadas:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Gestão de leads com sugestão de possíveis duplicidades, sem mesclagem automática</li>
            <li>Pipeline comercial com múltiplos estágios e histórico de movimentação</li>
            <li>Oportunidades vinculadas a leads</li>
            <li>Atividades e follow-ups com agendamento</li>
            <li>Propostas versionadas, valores calculados no servidor e vínculo com o checkout existente</li>
            <li>Dashboard com métricas em tempo real</li>
            <li>Integração com formulários e origens de leads</li>
            <li>Preservação de contexto (UTMs, first touch, last touch)</li>
          </ul>
        </div>
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Pipelines Configurados</h3>
        </div>
        {pipelines.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum pipeline configurado</p>
        ) : (
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <div key={pipeline.id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{pipeline.name}</h4>
                    {pipeline.is_default && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-2">Padrão</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{pipeline.stages.length} estágios</span>
                </div>
                {pipeline.description && (
                  <p className="text-sm text-gray-400 mb-3">{pipeline.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {pipeline.stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: stage.color + '20', border: `1px solid ${stage.color}` }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-white">{stage.name}</span>
                      {stage.is_won && <span className="text-xs text-emerald-400">(Ganho)</span>}
                      {stage.is_lost && <span className="text-xs text-red-400">(Perdido)</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Motivos de Perda</h3>
        </div>
        {lostReasons.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum motivo configurado</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lostReasons.map((reason) => (
              <div key={reason.id} className="bg-gray-900 rounded-xl p-3">
                <div className="text-white font-medium">{reason.label}</div>
                {reason.description && (
                  <div className="text-sm text-gray-400 mt-1">{reason.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Próximas Funcionalidades</h3>
        </div>
        <div className="text-sm text-gray-400 space-y-2">
          <p>Funcionalidades planejadas para as próximas etapas:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Automação avançada de follow-ups e notificações</li>
            <li>Integração com WhatsApp e Evolution API</li>
            <li>Lead scoring avançado com IA</li>
            <li>Importação e exportação de leads (CSV/Excel)</li>
            <li>Relatórios avançados por cidade, segmento e origem</li>
            <li>Integração oficial com WhatsApp para envio dentro do CRM</li>
            <li>Webhooks públicos para integrações externas</li>
            <li>Automações com n8n</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
