import { useCallback, useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { automationApi, formatDate } from './api';

type AiRun = { id:string; purpose:string; model_key:string; status:string; latency_ms?:number; tokens_input?:number; tokens_output?:number; created_at:string };
type Overview = { runsToday:{ calls:number; failed:number; tokens:number }; providers:{ enabled:number; total:number } };

export default function AdminAiPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [runs, setRuns] = useState<AiRun[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [summary, history] = await Promise.all([
        automationApi<Overview>('/api/admin/ai/overview'),
        automationApi<{ runs: AiRun[] }>('/api/admin/ai/runs')
      ]);
      setOverview(summary);
      setRuns(history.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const metrics = [
    ['Chamadas hoje', overview?.runsToday.calls],
    ['Falhas', overview?.runsToday.failed],
    ['Tokens', overview?.runsToday.tokens],
    ['Providers ativos', `${overview?.providers.enabled ?? '—'}/${overview?.providers.total ?? '—'}`]
  ];

  return (
    <div className="space-y-6 text-slate-950">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-black"><Bot />Inteligência Artificial</h2>
        <p className="text-slate-600">Governança de providers, modelos, prompts versionados, custo, latência e feedback. Credenciais nunca são exibidas.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">{label}</p>
            <strong className="text-2xl text-slate-950">{value ?? '—'}</strong>
          </div>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 p-4 font-bold">Execuções de IA</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr><th className="p-3">Finalidade</th><th className="p-3">Modelo</th><th className="p-3">Status</th><th className="p-3">Latência</th><th className="p-3">Tokens</th><th className="p-3">Data</th></tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-slate-200 hover:bg-slate-50/70">
                  <td className="p-3">{run.purpose}</td><td className="p-3">{run.model_key}</td><td className="p-3">{run.status}</td><td className="p-3">{run.latency_ms ?? '—'} ms</td><td className="p-3">{(run.tokens_input || 0) + (run.tokens_output || 0)}</td><td className="p-3">{formatDate(run.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {runs.length === 0 && <p className="p-5 text-slate-500">Nenhuma execução registrada.</p>}
      </section>
    </div>
  );
}
