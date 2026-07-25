import { useState, useEffect, useRef } from 'react';
import {
  Database, ShieldCheck, UploadCloud, Download, CheckCircle2,
  AlertTriangle, RefreshCw, Server, HardDrive, Lock, Trash2, RotateCcw, FileArchive
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNotification } from '../../context/NotificationContext';

interface ServerBackupItem {
  filename: string;
  mode: 'full' | 'database';
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

export default function AdminBackupPage() {
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [backups, setBackups] = useState<ServerBackupItem[]>([]);
  const [loadingCreate, setLoadingCreate] = useState<'database' | 'full' | null>(null);
  const [loadingRollback, setLoadingRollback] = useState<string | null>(null);

  const [rollbackModalBackup, setRollbackModalBackup] = useState<ServerBackupItem | null>(null);
  const [customFileBackup, setCustomFileBackup] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  } | null>(null);

  // Fetch hosted backups from server
  const fetchBackupsList = async () => {
    setLoadingList(true);
    try {
      const response = await fetch('/api/admin/backup/list');
      const data = await response.json();
      if (response.ok && Array.isArray(data.backups)) {
        setBackups(data.backups);
      } else {
        setBackups([]);
      }
    } catch (err) {
      console.error('Erro ao listar backups do servidor:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBackupsList();
  }, []);

  // Create new compressed backup on server (No auto-download!)
  const handleCreateBackup = async (mode: 'database' | 'full') => {
    setLoadingCreate(mode);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar backup no servidor.');
      }

      setStatusMessage({
        success: true,
        message: data.message || `Backup ${mode === 'full' ? 'completo' : 'do banco'} gerado e hospedado no servidor!`,
      });

      addNotification(
        'Backup Hospedado!',
        `O arquivo ${data.filename} (${data.size}) foi salvo no servidor com sucesso.`,
        'info'
      );

      // Refresh list
      await fetchBackupsList();
    } catch (err: any) {
      setStatusMessage({
        success: false,
        message: err.message || 'Falha ao criar backup.',
      });
      addNotification(
        'Erro na geração',
        err.message || 'Não foi possível salvar o backup no servidor.',
        'request'
      );
    } finally {
      setLoadingCreate(null);
    }
  };

  // Download a backup file from server when user clicks "Baixar"
  const handleDownloadBackup = (filename: string) => {
    window.location.href = `/api/admin/backup/download?filename=${encodeURIComponent(filename)}`;
  };

  // Direct Rollback from hosted backup
  const handleRollbackBackup = async () => {
    if (!rollbackModalBackup && !customFileBackup) return;

    const targetFilename = rollbackModalBackup?.filename;
    setLoadingRollback(targetFilename || 'custom');
    setStatusMessage(null);

    try {
      const response = await fetch('/api/admin/backup/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          targetFilename ? { filename: targetFilename } : { backup: customFileBackup }
        ),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro durante a operação de rollback.');
      }

      setStatusMessage({
        success: true,
        message: data.message || 'Rollback concluído com sucesso!',
        details: data.restoredCounts,
      });

      addNotification(
        'Rollback Concluído!',
        'A base de dados e os registros do sistema foram revertidos com sucesso.',
        'info'
      );
    } catch (err: any) {
      setStatusMessage({
        success: false,
        message: err.message || 'Falha na restauração dos dados.',
      });
    } finally {
      setLoadingRollback(null);
      setRollbackModalBackup(null);
      setCustomFileBackup(null);
    }
  };

  // Delete backup from server storage
  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Deseja realmente remover o arquivo "${filename}" do servidor?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/backup/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        setBackups((prev) => prev.filter((b) => b.filename !== filename));
        addNotification('Backup Excluído', `O arquivo ${filename} foi removido do disco.`, 'info');
      }
    } catch (err) {
      console.error('Erro ao excluir backup:', err);
    }
  };

  // Custom upload file handler for external json files
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed && parsed.tables) {
            setCustomFileBackup(parsed);
          } else {
            alert('Arquivo de backup inválido.');
          }
        } catch {
          alert('Erro ao ler o arquivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" /> Servidor de Backups Hospedados
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gerenciamento & Rollback de Backups
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Gere cópias de segurança compactadas (`.json.gz`) hospedadas no servidor. Os backups ficam armazenados no painel para você baixar quando desejar ou executar um **Rollback instantâneo**.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex-shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL + Arquivos GZIP</span>
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            statusMessage.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {statusMessage.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">{statusMessage.message}</div>
            {statusMessage.details && (
              <div className="mt-1 space-y-0.5 font-medium text-emerald-700">
                <p>• Perfis restaurados: {statusMessage.details.profiles}</p>
                <p>• Tickets restaurados: {statusMessage.details.tickets}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Action Creation Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Backup Banco de Dados */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5B4FE9] flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#5B4FE9] uppercase tracking-wider block mb-1">
                PostgreSQL (.json.gz)
              </span>
              <h2 className="text-lg font-bold text-gray-900">Gerar Backup do Banco de Dados</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Exporta todas as tabelas do PostgreSQL e salva o arquivo compactado no disco do servidor. Não dispara download automático.
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1 text-gray-600 border border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tabela de Perfis & Clientes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hashes de Autenticação
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Suporte & Faturas
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleCreateBackup('database')}
            disabled={loadingCreate !== null}
            className="w-full bg-[#5B4FE9] hover:bg-[#4F46E5] flex items-center justify-center gap-2 py-3 shadow-md"
          >
            {loadingCreate === 'database' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            Gerar e Hospedar Backup do Banco
          </Button>
        </div>

        {/* Card 2: Fullback Completo do Site */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                Fullback Compactado (.tar.gz)
              </span>
              <h2 className="text-lg font-bold text-gray-900">Gerar Fullback Completo do Site</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Compacta os arquivos do código-fonte do site + toda a base de dados PostgreSQL e grava como snapshot hospedado no painel.
              </p>
            </div>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl text-xs space-y-1 text-purple-950 border border-purple-100">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Código-Fonte do Site & Estruturas
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Banco PostgreSQL Integral
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Briefings e Arquivos de Clientes
              </div>
            </div>
          </div>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => handleCreateBackup('full')}
            disabled={loadingCreate !== null}
            className="w-full flex items-center justify-center gap-2 py-3 shadow-md"
          >
            {loadingCreate === 'full' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Gerar e Hospedar Fullback Completo
          </Button>
        </div>
      </div>

      {/* Hosted Backups Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-[#5B4FE9]" />
              Backups Armazenados no Servidor ({backups.length})
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Lista de arquivos compactados prontos para download sob demanda ou rollback direto no sistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.gz"
              onChange={handleCustomFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Importar Backup Externo
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchBackupsList}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
          </div>
        </div>

        {loadingList ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5B4FE9]" />
            Carregando lista de backups...
          </div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <FileArchive className="w-8 h-8 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-700">Nenhum backup hospedado no momento</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Clique nos botões acima para gerar um backup do banco de dados ou do site completo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Arquivo Hospedado</th>
                  <th className="pb-3 px-3">Tipo</th>
                  <th className="pb-3 px-3">Data & Hora</th>
                  <th className="pb-3 px-3">Tamanho</th>
                  <th className="pb-3 px-3 text-right">Ações no Painel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-gray-50/60 transition-all">
                    <td className="py-4 px-3 font-mono font-medium text-gray-900 truncate max-w-xs">
                      {b.filename}
                    </td>

                    <td className="py-4 px-3">
                      {b.mode === 'full' ? (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full font-bold text-[10px]">
                          Fullback Completo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-indigo-50 text-[#5B4FE9] border border-indigo-200/60 rounded-full font-bold text-[10px]">
                          Banco PostgreSQL
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-gray-500">
                      {new Date(b.createdAt).toLocaleString('pt-BR')}
                    </td>

                    <td className="py-4 px-3 font-semibold text-gray-700">
                      {b.sizeFormatted}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Baixar */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(b.filename)}
                          className="px-2.5 py-1 text-xs flex items-center gap-1 hover:border-[#5B4FE9] hover:text-[#5B4FE9]"
                        >
                          <Download className="w-3.5 h-3.5" /> Baixar
                        </Button>

                        {/* Rollback */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setRollbackModalBackup(b)}
                          className="bg-amber-600 hover:bg-amber-700 border-none px-2.5 py-1 text-xs flex items-center gap-1 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Rollback
                        </Button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDeleteBackup(b.filename)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                          title="Excluir do servidor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rollback Modal */}
      {(rollbackModalBackup || customFileBackup) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Confirmar Rollback?</h3>
                <p className="text-xs text-gray-500">Reverter a base de dados para este snapshot.</p>
              </div>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 text-xs space-y-2 text-amber-950">
              {rollbackModalBackup ? (
                <>
                  <p><strong>Arquivo Snapshot:</strong> {rollbackModalBackup.filename}</p>
                  <p><strong>Tipo:</strong> <span className="capitalize font-semibold">{rollbackModalBackup.mode}</span></p>
                  <p><strong>Tamanho:</strong> {rollbackModalBackup.sizeFormatted}</p>
                </>
              ) : (
                <p><strong>Backup Externo Carregado:</strong> {customFileBackup.meta?.timestamp || 'Custom JSON'}</p>
              )}
              <p className="text-[11px] text-amber-800 leading-relaxed pt-1">
                ⚠️ Esta ação restaurará as tabelas do PostgreSQL e os registros com base no snapshot selecionado.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRollbackModalBackup(null);
                  setCustomFileBackup(null);
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRollbackBackup}
                disabled={loadingRollback !== null}
                className="bg-amber-600 hover:bg-amber-700 border-none flex items-center gap-2 shadow-md"
              >
                {loadingRollback !== null ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Executar Rollback Agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
