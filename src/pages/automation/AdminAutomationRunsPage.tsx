import { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { automationApi, formatDate } from './api';

type Run = { id:string; automation_name:string; event_type:string; status:string; attempt:number; created_at:string; error_message?:string };
type Dead = { id:string; event_type:string; attempts:number; dead_lettered_at:string; last_error?:string };

interface TableProps {
  title: string;
  columns: string[];
  rows: string[][];
  actions: React.ReactNode[];
}

function Table({ title, columns, rows, actions }: TableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3 className="border-b border-slate-200 p-4 font-bold text-slate-950">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              {columns.map((column) => <th key={column} className="p-3 font-bold">{column}</th>)}
              <th className="p-3 font-bold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="border-t border-slate-200 hover:bg-slate-50/70">
                {row.map((value, cellIndex) => (
                  <td key={`${cellIndex}-${value}`} className={`p-3 ${cellIndex === row.length - 1 ? 'max-w-md text-xs text-red-700' : ''}`}>{value}</td>
                ))}
                <td className="p-3">{actions[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="p-5 text-slate-500">Nenhum registro.</p>}
    </section>
  );
}

export default function AdminAutomationRunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [dead, setDead] = useState<Dead[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [runData, deadData] = await Promise.all([
        automationApi<{ runs: Run[] }>('/api/admin/automation-runs'),
        automationApi<{ events: Dead[] }>('/api/admin/automation-dead-letter')
      ]);
      setRuns(runData.runs);
      setDead(deadData.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const retry = async (path: string) => {
    await automationApi(path, { method: 'POST' });
    await load();
  };

  const retryButton = (path: string, label: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => void retry(path)}
      className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
    >
      <RotateCcw className="h-4 w-4" />
    </button>
  );

  return (
    <div className="space-y-6 text-slate-950">
      <header>
        <h2 className="text-2xl font-black">Execuções e dead-letter</h2>
        <p className="text-slate-600">Histórico operacional, erros correlacionados e reprocessamento manual.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
      <Table
        title="Execuções"
        columns={['Automação', 'Evento', 'Status', 'Tentativa', 'Data', 'Erro']}
        rows={runs.map((run) => [run.automation_name, run.event_type, run.status, `tentativa ${run.attempt}`, formatDate(run.created_at), run.error_message || ''])}
        actions={runs.map((run) => run.status === 'failed' ? retryButton(`/api/admin/automation-runs/${run.id}/retry`, 'Reprocessar execução') : null)}
      />
      <Table
        title={`Dead-letter (${dead.length})`}
        columns={['Evento', 'Tentativas', 'Data', 'Último erro']}
        rows={dead.map((event) => [event.event_type, `${event.attempts} tentativas`, formatDate(event.dead_lettered_at), event.last_error || ''])}
        actions={dead.map((event) => retryButton(`/api/admin/automation-dead-letter/${event.id}/retry`, 'Reprocessar evento'))}
      />
    </div>
  );
}
