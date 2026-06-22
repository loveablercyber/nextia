import { useState } from 'react';
import {
  Globe, Sliders
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { statusConfig } from '../../types/project';
import Button from '../../components/ui/Button';

export default function AdminProjectsPage() {
  const { projects, loading, updateProjectProgress, updateProjectStatus } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(0);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  const handleEditProgress = (id: string, currentVal: number) => {
    setEditingId(id);
    setSliderVal(currentVal);
  };

  const handleSaveProgress = async (id: string) => {
    await updateProjectProgress(id, sliderVal);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-950 text-sm mb-2">Gerenciar projetos de clientes</h3>
        <p className="text-gray-400 text-xs mb-5">
          Atualize a porcentagem de desenvolvimento dos sites, altere os status das etapas e acompanhe domínios configurados.
        </p>

        <div className="space-y-6">
          {projects.map((p) => {
            const currentStatus = statusConfig[p.status];
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Meta details */}
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}
                    >
                      {currentStatus.label}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Plano: <strong>Nextia {p.plan}</strong></span>
                    {p.domain && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        {p.domain}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress controls */}
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-500">Progresso do projeto</span>
                    <span className="text-pink-600 font-bold">{isEditing ? sliderVal : p.progressPercent}%</span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={sliderVal}
                        onChange={e => setSliderVal(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                      />
                      <Button variant="gradient" size="sm" onClick={() => handleSaveProgress(p.id)}>
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-[#7c3aed] rounded-full transition-all duration-300"
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>
                      <button
                        onClick={() => handleEditProgress(p.id, p.progressPercent)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Ajustar progresso"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status dropdown selector */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={p.status}
                    onChange={e => updateProjectStatus(p.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="aguardando-briefing">Aguardando Briefing</option>
                    <option value="em-desenvolvimento">Em Desenvolvimento</option>
                    <option value="em-revisao">Em Revisão</option>
                    <option value="aguardando-aprovacao">Aguardando Aprovação</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="publicado">🌐 Publicado</option>
                    <option value="em-manutencao">Em Manutenção</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
