import { useState, useEffect } from 'react';
import {
  Database, ShieldCheck, Download, CheckCircle2,
  AlertTriangle, RefreshCw, Server, Trash2, RotateCcw,
  FileArchive, Activity, Copy, Clock, ScrollText, X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNotification } from '../../context/NotificationContext';

interface EnterpriseBackupItem {
  id: string;
  filename: string;
  object_key: string;
  size: number;
  sizeFormatted: string;
  checksum: string | null;
  backup_type: string;
  storage_provider: 'cloudinary' | 'minio';
  storage_account?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'GENERATING_DATABASE' | 'GENERATING_ARCHIVE' | 'CALCULATING_CHECKSUM' | 'UPLOADING_TO_CLOUDINARY' | 'UPLOADING_TO_MINIO' | 'COMPLETED' | 'FAILED' | 'RESTORING' | 'DELETED';
  created_by: string;
  created_at: string;
  updated_at: string;
  error_message?: string | null;
  error_details?: string | null;
}

interface AuditLogItem {
  id: string;
  backup_id: string;
  action: string;
  user_id: string;
  details: string;
  created_at: string;
}

export default function AdminBackupPage() {
  const { addNotification } = useNotification();

  const [loadingList, setLoadingList] = useState(true);
  const [backups, setBackups] = useState<EnterpriseBackupItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'logs'>('backups');

  // Modal States
  const [restoreModalBackup, setRestoreModalBackup] = useState<EnterpriseBackupItem | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [logsModalBackup, setLogsModalBackup] = useState<EnterpriseBackupItem | null>(null);

  // Fetch list of backups and audit logs
  const fetchBackupData = async () => {
    try {
      const response = await fetch('/api/admin/backup/list');
      const data = await response.json();
      if (response.ok) {
        setBackups(data.backups || []);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de backup:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchBackupData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Atualiza o acompanhamento enquanto o servidor executa qualquer etapa do backup.
  useEffect(() => {
    const hasActiveJob = backups.some(
      (b) => ['PENDING', 'PROCESSING', 'GENERATING_DATABASE', 'GENERATING_ARCHIVE', 'CALCULATING_CHECKSUM', 'UPLOADING_TO_CLOUDINARY', 'UPLOADING_TO_MINIO', 'RESTORING'].includes(b.status)
    );

    if (hasActiveJob) {
      const interval = setInterval(fetchBackupData, 4000);
      return () => clearInterval(interval);
    }
  }, [backups]);

  // A API só responde após persistir o resultado ou a falha do backup.
  const handleCreateBackup = async () => {
    setLoadingCreate(true);
    try {
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'full' }),
      });

      const data = await response.json();
      if (!response.ok) {
        const diagnostic = data.details ? ` ${String(data.details).split('\n')[0]}` : '';
        throw new Error(`${data.error || 'Erro ao iniciar backup.'}${diagnostic}`);
      }

      addNotification(
        'Backup Concluído',
        'Arquivo enviado à conta Cloudinary selecionada pela rotação e validado com SHA256.',
        'info'
      );

      await fetchBackupData();
    } catch (err: unknown) {
      addNotification('Erro no Backup', err instanceof Error ? err.message : 'Falha ao iniciar backup.', 'request');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Download via URL assinada da aplicação (15 minutos)
  const handleDownload = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/download?id=${backupId}`);
      const data = await response.json();

      if (!response.ok || !data.downloadUrl) {
        throw new Error(data.error || 'Erro ao gerar presigned URL de download.');
      }

      // Download direto via presigned URL
      window.location.href = data.downloadUrl;

      addNotification(
        'Download Iniciado',
        'URL de download com validade de 15 minutos gerada.',
        'info'
      );
    } catch (err: unknown) {
      addNotification('Erro no Download', err instanceof Error ? err.message : 'Falha ao baixar backup.', 'request');
    }
  };

  // Perform Restore & Atomic Rollback
  const handlePerformRestore = async () => {
    if (!restoreModalBackup) return;
    if (confirmationInput.trim() !== 'RESTAURAR') {
      alert('Por favor, digite exatamente RESTAURAR para confirmar.');
      return;
    }

    setLoadingRestore(true);
    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: restoreModalBackup.id,
          confirmation: 'RESTAURAR',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar restauração.');
      }

      addNotification(
        'Restauração Concluída',
        'A restauração transacional foi concluída e validada.',
        'info'
      );

      setRestoreModalBackup(null);
      setConfirmationInput('');
      await fetchBackupData();
    } catch (err: unknown) {
      addNotification('Erro na Restauração', err instanceof Error ? err.message : 'Falha ao restaurar backup.', 'request');
    } finally {
      setLoadingRestore(false);
    }
  };

  // Delete backup from its original provider and update the database record.
  const handleDeleteBackup = async (backupId: string, filename: string) => {
    if (!confirm(`Deseja realmente excluir o backup "${filename}" do armazenamento e do banco de dados?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/backup/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });

      if (response.ok) {
        addNotification('Backup Excluído', `O backup ${filename} foi removido.`, 'info');
        await fetchBackupData();
      }
    } catch (err) {
      console.error('Erro ao excluir backup:', err);
    }
  };

  // Copy SHA256 Checksum to Clipboard
  const handleCopyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum);
    addNotification('Checksum Copiado', 'SHA256 copiado para a área de transferência.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" /> Backup Corporativo Nextia 2.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gerenciamento de Backups Empresariais
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Backups TAR.GZ com checksum SHA256, rotação entre contas Cloudinary, links de 15 minutos, restauração transacional e retenção automática de 30 arquivos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCreateBackup}
              disabled={loadingCreate}
              className="bg-[#5B4FE9] hover:bg-[#4F46E5] text-white flex items-center justify-center gap-2 py-3 px-5 shadow-lg"
            >
              {loadingCreate ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Gerar Backup Completo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'backups'
                  ? 'bg-indigo-50 text-[#5B4FE9] border border-indigo-200/60'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileArchive className="w-4 h-4" /> Backups Armazenados ({backups.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-indigo-50 text-[#5B4FE9] border border-indigo-200/60'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" /> Logs de Auditoria ({logs.length})
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchBackupData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>

        {/* Tab 1: Backups List */}
        {activeTab === 'backups' && (
          loadingList ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5B4FE9]" />
              Carregando backups do armazenamento e banco de dados...
            </div>
          ) : backups.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <FileArchive className="w-8 h-8 text-gray-300 mx-auto" />
              <div className="text-sm font-bold text-gray-700">Nenhum backup cadastrado</div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Clique no botão "Gerar Backup Completo" para iniciar o empacotamento corporativo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Arquivo (TAR.GZ)</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Data & Hora</th>
                    <th className="pb-3 px-3">Tamanho</th>
                    <th className="pb-3 px-3">SHA256 Checksum</th>
                    <th className="pb-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-all">
                      <td className="py-4 px-3 font-mono font-medium text-gray-900 truncate max-w-xs">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{b.filename}</span>
                        </div>
                        <div className="mt-1 pl-6 text-[9px] font-sans text-gray-400">
                          {b.storage_provider === 'cloudinary' ? `Cloudinary · ${b.storage_account || 'conta não identificada'}` : 'MinIO legado'}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        {b.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> COMPLETED
                          </span>
                        )}
                        {b.status === 'PROCESSING' && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> PROCESSING
                          </span>
                        )}
                        {['GENERATING_DATABASE', 'GENERATING_ARCHIVE', 'CALCULATING_CHECKSUM', 'UPLOADING_TO_CLOUDINARY', 'UPLOADING_TO_MINIO'].includes(b.status) && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> {b.status}
                          </span>
                        )}
                        {b.status === 'PENDING' && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                        {b.status === 'RESTORING' && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 animate-spin" /> RESTORING
                          </span>
                        )}
                        {b.status === 'FAILED' && (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> FAILED
                          </span>
                        )}
                        {b.status === 'DELETED' && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full font-bold text-[10px]">
                            DELETED
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(b.created_at).toLocaleString('pt-BR')}
                      </td>

                      <td className="py-4 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        {b.sizeFormatted}
                      </td>

                      <td className="py-4 px-3 font-mono text-gray-500 max-w-[150px] truncate">
                        {b.checksum ? (
                          <button
                            onClick={() => handleCopyChecksum(b.checksum!)}
                            className="flex items-center gap-1 hover:text-[#5B4FE9] transition-all group"
                            title="Clique para copiar SHA256"
                          >
                            <span className="truncate">{b.checksum.substring(0, 12)}...</span>
                            <Copy className="w-3 h-3 text-gray-400 group-hover:text-[#5B4FE9]" />
                          </button>
                        ) : b.status === 'COMPLETED' ? 'Indisponível' : 'Aguardando'}
                      </td>

                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        {b.status !== 'DELETED' && (
                          <div className="flex items-center justify-end gap-2">
                            {b.status === 'COMPLETED' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(b.id)}
                                  className="px-2.5 py-1 text-xs flex items-center gap-1 hover:border-[#5B4FE9] hover:text-[#5B4FE9]"
                                >
                                  <Download className="w-3.5 h-3.5" /> Baixar
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setRestoreModalBackup(b);
                                    setConfirmationInput('');
                                  }}
                                  className="bg-amber-600 hover:bg-amber-700 border-none px-2.5 py-1 text-xs flex items-center gap-1 shadow-sm"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                                </Button>
                              </>
                            )}

                            <button
                              onClick={() => setLogsModalBackup(b)}
                              className="p-1.5 text-gray-400 hover:text-[#5B4FE9] rounded-lg hover:bg-indigo-50 transition-all"
                              title="Ver logs"
                              aria-label={`Ver logs do backup ${b.filename}`}
                            >
                              <ScrollText className="w-4 h-4" />
                            </button>

                            {/* Excluir */}
                            <button
                              onClick={() => handleDeleteBackup(b.id, b.filename)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                              title="Excluir backup"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Histórico de Auditoria Corporativa
            </div>

            <div className="bg-gray-900 text-gray-200 rounded-2xl p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2 border border-gray-800">
              {logs.length === 0 ? (
                <p className="text-gray-500">Nenhum evento registrado no log de auditoria.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-gray-800/80 pb-2">
                    <span className="text-gray-500 flex-shrink-0">
                      [{new Date(log.created_at).toLocaleString('pt-BR')}]
                    </span>
                    <span className="font-bold text-indigo-400 flex-shrink-0">
                      {log.action}
                    </span>
                    <span className="text-gray-400 flex-shrink-0">({log.user_id}):</span>
                    <span className="text-gray-300 truncate">{log.details}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {logsModalBackup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="backup-logs-title">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="backup-logs-title" className="text-base font-bold text-gray-900">Logs do backup</h3>
                <p className="text-xs text-gray-500 font-mono break-all mt-1">{logsModalBackup.filename}</p>
              </div>
              <button onClick={() => setLogsModalBackup(null)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg" aria-label="Fechar logs">
                <X className="w-4 h-4" />
              </button>
            </div>
            {logsModalBackup.error_message && (
              <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-3 text-xs space-y-1">
                <p className="font-bold">{logsModalBackup.error_message}</p>
                {logsModalBackup.error_details && <pre className="whitespace-pre-wrap break-words text-red-700 max-h-36 overflow-y-auto">{logsModalBackup.error_details}</pre>}
              </div>
            )}
            <div className="bg-gray-950 text-gray-200 rounded-lg p-4 font-mono text-xs overflow-y-auto space-y-2">
              {logs.filter((log) => log.backup_id === logsModalBackup.id).length === 0 ? (
                <p className="text-gray-500">Nenhum evento específico encontrado para este backup.</p>
              ) : logs.filter((log) => log.backup_id === logsModalBackup.id).map((log) => (
                <div key={log.id} className="border-b border-gray-800 pb-2 last:border-0">
                  <span className="text-indigo-300">[{new Date(log.created_at).toLocaleString('pt-BR')}] {log.action}</span>
                  <span className="text-gray-400"> {log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Security Restore Modal */}
      {restoreModalBackup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-up border border-red-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  ATENÇÃO - Restauração Total do Sistema
                </h3>
                <p className="text-xs text-red-600 font-semibold">
                  Esta operação substituirá banco de dados, arquivos e configurações ativas.
                </p>
              </div>
            </div>

            <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200/80 text-xs space-y-2 text-red-950">
              <p className="font-bold">Esta ação substituirá automaticamente:</p>
              <ul className="list-disc list-inside space-y-1 text-red-900 font-medium">
                <li>Banco de dados relacional PostgreSQL atual</li>
                <li>Arquivos persistentes do site e uploads</li>
                <li>Configurações de sistema ativas</li>
              </ul>
              <p className="pt-2 font-bold text-red-700">
                ⚠️ Caso ocorra qualquer falha durante a execução, o Rollback atômico reverterá o estado para a versão segura de emergência.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Digite <span className="text-red-600 font-black">RESTAURAR</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="RESTAURAR"
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 font-mono tracking-widest uppercase font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRestoreModalBackup(null);
                  setConfirmationInput('');
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handlePerformRestore}
                disabled={loadingRestore || confirmationInput.trim() !== 'RESTAURAR'}
                className="bg-red-600 hover:bg-red-700 border-none flex items-center gap-2 py-2.5 px-5 shadow-lg text-white font-bold"
              >
                {loadingRestore ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Confirmar & Restaurar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
