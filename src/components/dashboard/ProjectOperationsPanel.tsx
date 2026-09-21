import { useState } from 'react';
import { CheckCircle2, Clock3, ExternalLink, FileCheck2, History, MessageSquare, Send } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import Button from '../ui/Button';

function dateTime(value?: string) {
  return value ? new Date(value).toLocaleString('pt-BR') : '';
}

export default function ProjectOperationsPanel() {
  const {
    tasks, deliverables, comments, events, pendingActions,
    completeClientTask, reviewDeliverable, addComment, accessFile,
  } = useProject();
  const [comment, setComment] = useState('');
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key); setError(null);
    try { await action(); } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950"><Clock3 className="h-4 w-4 text-amber-500" /> O que depende de você</h3>
          {pendingActions.length === 0 ? (
            <p className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-700">Nenhuma ação pendente no momento.</p>
          ) : (
            <div className="space-y-2">
              {pendingActions.map((action) => (
                <div key={`${action.type}-${action.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-3">
                  <div><p className="text-xs font-bold text-gray-800">{action.title}</p>{action.dueAt && <p className="mt-1 text-[10px] text-gray-400">Prazo: {dateTime(action.dueAt)}</p>}</div>
                  {action.type === 'task' && <Button size="sm" variant="outline" loading={busy === `task-${action.id}`} onClick={() => run(`task-${action.id}`, () => completeClientTask(action.id))}>Concluir</Button>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950"><CheckCircle2 className="h-4 w-4 text-[#5B4FE9]" /> Ações e etapas visíveis</h3>
          {tasks.length === 0 ? <p className="text-xs text-gray-400">Nenhuma ação foi solicitada.</p> : (
            <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="rounded-2xl bg-gray-50 p-3"><div className="flex justify-between gap-3"><p className="text-xs font-bold text-gray-800">{task.title}</p><span className="text-[10px] font-semibold text-gray-500">{task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em andamento' : 'Pendente'}</span></div>{task.description && <p className="mt-1 text-[11px] text-gray-500">{task.description}</p>}</div>)}</div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950"><FileCheck2 className="h-4 w-4 text-[#5B4FE9]" /> Entregas</h3>
        {deliverables.length === 0 ? <p className="py-6 text-center text-xs text-gray-400">Nenhuma entrega disponível ainda.</p> : (
          <div className="space-y-4">{deliverables.map((item) => (
            <article key={item.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-bold text-gray-900">{item.title}</h4><p className="mt-1 text-xs text-gray-500">{item.description}</p><p className="mt-1 text-[10px] text-gray-400">Versão {item.current_version} · {item.status}</p></div>
                <Button size="sm" variant="outline" onClick={() => run(`open-${item.id}`, async () => { const url = item.file_id ? await accessFile(item.file_id) : item.external_url; if (!url) throw new Error('Conteúdo da entrega indisponível.'); window.open(url, '_blank', 'noopener,noreferrer'); })}><ExternalLink className="h-3.5 w-3.5" /> Visualizar</Button>
              </div>
              {item.status === 'submitted' && <div className="mt-4 border-t border-gray-100 pt-4"><label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor={`review-${item.id}`}>Comentário da revisão</label><textarea id={`review-${item.id}`} rows={2} value={reviewComments[item.id] || ''} onChange={(event) => setReviewComments((current) => ({ ...current, [item.id]: event.target.value }))} className="w-full rounded-xl border border-gray-200 p-3 text-xs" placeholder="Obrigatório ao solicitar ajustes" /><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="gradient" loading={busy === `approve-${item.id}`} onClick={() => run(`approve-${item.id}`, () => reviewDeliverable(item.id, 'approved', reviewComments[item.id]))}>Aprovar versão</Button><Button size="sm" variant="outline" loading={busy === `changes-${item.id}`} onClick={() => run(`changes-${item.id}`, () => reviewDeliverable(item.id, 'changes_requested', reviewComments[item.id]))}>Solicitar ajustes</Button></div></div>}
              {item.approvals.length > 0 && <p className="mt-3 text-[10px] text-gray-400">Última decisão: {item.approvals[0].result === 'approved' ? 'Aprovada' : 'Ajustes solicitados'} em {dateTime(item.approvals[0].created_at)}</p>}
            </article>
          ))}</div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950"><MessageSquare className="h-4 w-4 text-[#5B4FE9]" /> Comentários do projeto</h3>
          <form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!comment.trim()) return; void run('comment', async () => { await addComment(comment); setComment(''); }); }}><label htmlFor="project-comment" className="sr-only">Novo comentário</label><input id="project-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={5000} placeholder="Escreva uma mensagem sobre o projeto" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-xs" /><Button type="submit" size="sm" variant="gradient" loading={busy === 'comment'}><Send className="h-3.5 w-3.5" /> Enviar</Button></form>
          {comments.length === 0 ? <p className="text-xs text-gray-400">Nenhum comentário ainda.</p> : <div className="max-h-72 space-y-3 overflow-y-auto">{comments.map((item) => <div key={item.id} className="rounded-2xl bg-gray-50 p-3"><div className="flex justify-between gap-2 text-[10px] text-gray-400"><strong className="text-gray-600">{item.author_name}</strong><span>{dateTime(item.created_at)}</span></div><p className="mt-1 whitespace-pre-wrap text-xs text-gray-700">{item.body}</p></div>)}</div>}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-950"><History className="h-4 w-4 text-[#5B4FE9]" /> Histórico</h3>
          {events.length === 0 ? <p className="text-xs text-gray-400">As próximas atualizações aparecerão aqui.</p> : <ol className="max-h-80 space-y-3 overflow-y-auto border-l border-gray-100 pl-4">{events.map((event) => <li key={event.id} className="relative"><span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-[#5B4FE9]" /><p className="text-xs font-semibold text-gray-700">{event.summary}</p><p className="mt-0.5 text-[10px] text-gray-400">{event.actor_name ? `${event.actor_name} · ` : ''}{dateTime(event.created_at)}</p></li>)}</ol>}
        </div>
      </section>
    </div>
  );
}
