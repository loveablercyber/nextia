import { useState, useRef } from 'react';
import {
  Database, ShieldCheck, UploadCloud, Download, CheckCircle2,
  AlertTriangle, RefreshCw, Server, HardDrive, Lock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNotification } from '../../context/NotificationContext';

export default function AdminBackupPage() {
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingExport, setLoadingExport] = useState<'database' | 'full' | null>(null);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [backupPreview, setBackupPreview] = useState<any | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{
    success?: boolean;
    message?: string;
    counts?: any;
  } | null>(null);

  // Export handler
  const handleExportBackup = async (mode: 'database' | 'full') => {
    setLoadingExport(mode);
    try {
      const response = await fetch('/api/admin/backup/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao gerar arquivo de backup.');
      }

      const data = await response.json();

      // Trigger browser download
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `nextia-${mode}-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification(
        'Backup concluído!',
        `O arquivo nextia-${mode}-backup-${dateStr}.json foi gerado com sucesso.`,
        'info'
      );
    } catch (err: any) {
      addNotification(
        'Falha no backup',
        err.message || 'Não foi possível exportar os dados.',
        'request'
      );
    } finally {
      setLoadingExport(null);
    }
  };

  // File selection for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreStatus(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.meta && parsed.tables) {
            setBackupPreview(parsed);
            setConfirmModalOpen(true);
          } else {
            alert('Arquivo de backup inválido. Certifique-se de selecionar um backup exportado pelo Nextia 2.0.');
          }
        } catch {
          alert('Erro ao ler o arquivo JSON selecionado.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Perform Restore
  const handlePerformRestore = async () => {
    if (!backupPreview) return;

    setLoadingRestore(true);
    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupPreview }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.error || 'Erro ao realizar a restauração dos dados.');
      }

      // If local storage project state backup exists, sync with browser
      if (backupPreview.tables?.projects && Array.isArray(backupPreview.tables.projects)) {
        try {
          localStorage.setItem('nextia_projects_state', JSON.stringify(backupPreview.tables.projects));
        } catch (e) {
          console.log('Local storage sync optional:', e);
        }
      }

      setRestoreStatus({
        success: true,
        message: resData.message || 'Sistema restaurado com sucesso!',
        counts: resData.restoredCounts,
      });

      addNotification(
        'Restauração Concluída!',
        'O banco de dados e os dados do sistema foram atualizados com sucesso.',
        'info'
      );
    } catch (err: any) {
      setRestoreStatus({
        success: false,
        message: err.message || 'Erro durante o processo de restauração.',
      });
    } finally {
      setLoadingRestore(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" /> Ferramenta Administrativa de Backup
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Backup & Restauração do Sistema
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Exporte os dados completos do PostgreSQL ou o estado completo do site para cópias de segurança. Você também pode carregar arquivos de backup prévios para restaurar a base de dados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl flex-shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL Criptografado</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Backup Options & Restore */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Backup Apenas Banco de Dados */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5B4FE9] flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#5B4FE9] uppercase tracking-wider block mb-1">
                PostgreSQL SQL / JSON
              </span>
              <h2 className="text-lg font-bold text-gray-900">Backup Apenas do Banco de Dados</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Exporta todas as tabelas relacionais da base de dados PostgreSQL (`profiles`, `local_auth_users`, `projects`, `payments`, `support_tickets`). Ideal para manutenção rápida.
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1.5 text-gray-600 border border-gray-100">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tabela de Perfis e Clientes
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Usuários e Hashes de Senha
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Faturas e Chamados de Suporte
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExportBackup('database')}
            disabled={loadingExport !== null}
            className="w-full bg-[#5B4FE9] hover:bg-[#4F46E5] flex items-center justify-center gap-2 py-3 shadow-md"
          >
            {loadingExport === 'database' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Baixar Backup do Banco (JSON)
          </Button>
        </div>

        {/* Card 2: Backup Completo (Fullback) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                Fullback Completo
              </span>
              <h2 className="text-lg font-bold text-gray-900">Backup Completo (Sistema + Banco)</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Gera o pacote completo com todas as tabelas do PostgreSQL, estruturas de projetos, anexos, briefings salvos e estados de configuração do sistema.
              </p>
            </div>

            <div className="bg-purple-50/50 p-3.5 rounded-2xl text-xs space-y-1.5 text-purple-950 border border-purple-100">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Todas as Tabelas do Banco
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Respostas de Briefings do Cliente
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Estados e Ativações dos Projetos
              </div>
            </div>
          </div>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => handleExportBackup('full')}
            disabled={loadingExport !== null}
            className="w-full flex items-center justify-center gap-2 py-3 shadow-md"
          >
            {loadingExport === 'full' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Gerar Fullback Completo
          </Button>
        </div>
      </div>

      {/* Restore Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
              <UploadCloud className="w-4 h-4" /> Restaurar Base de Dados & Sistema
            </div>
            <h2 className="text-xl font-bold text-gray-900">Restaurar a partir de Backup (.json)</h2>
            <p className="text-gray-500 text-xs mt-1">
              Selecione um arquivo de backup exportado anteriormente para reverter registros ou migrar dados.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {restoreStatus && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              restoreStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {restoreStatus.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-bold text-sm mb-1">{restoreStatus.message}</div>
              {restoreStatus.counts && (
                <div className="space-y-0.5 text-emerald-700 font-medium">
                  <p>• Perfis restaurados: {restoreStatus.counts.profiles}</p>
                  <p>• Tickets de suporte restaurados: {restoreStatus.counts.tickets}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-[#5B4FE9] bg-gray-50/50 hover:bg-indigo-50/20 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
            <UploadCloud className="w-6 h-6 text-[#5B4FE9]" />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">Clique para selecionar o arquivo de backup</div>
            <div className="text-xs text-gray-400 mt-1">Formato suportado: .JSON (Backup Nextia 2.0)</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && backupPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Confirmar Restauração?</h3>
                <p className="text-xs text-gray-500">Esta ação irá atualizar os dados no PostgreSQL.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-1.5 text-gray-700">
              <p><strong>Backup de:</strong> {backupPreview.meta?.timestamp ? new Date(backupPreview.meta.timestamp).toLocaleString('pt-BR') : 'Sem data'}</p>
              <p><strong>Modo:</strong> <span className="capitalize font-semibold">{backupPreview.meta?.mode || 'database'}</span></p>
              <p><strong>Perfis a restaurar:</strong> {backupPreview.counts?.profiles || backupPreview.tables?.profiles?.length || 0}</p>
              <p><strong>Projetos no backup:</strong> {backupPreview.counts?.projects || backupPreview.tables?.projects?.length || 0}</p>
              <p><strong>Tickets de suporte:</strong> {backupPreview.counts?.tickets || backupPreview.tables?.support_tickets?.length || 0}</p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmModalOpen(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handlePerformRestore}
                disabled={loadingRestore}
                className="bg-amber-600 hover:bg-amber-700 border-none flex items-center gap-2"
              >
                {loadingRestore ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmar Restauração
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
