import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileCheck2, History, MessageSquare, Plus, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import { requestJson, type DatabaseRecord } from '../../lib/appData';
import type { ProjectComment, ProjectDeliverable, ProjectEvent, ProjectTask } from '../../types/project';

interface AdminWorkspace {
  project: DatabaseRecord & { id: string; name: string; status: string; customer_name: string; customer_email: string; service_name_snapshot?: string; version: number };
  milestones: Array<DatabaseRecord & { id: string; title: string; status: string; position: number }>;
  tasks: ProjectTask[];
  files: Array<DatabaseRecord & { id: string; name: string; mime_type?: string; size?: string; uploaded_at: string }>;
  requests: Array<DatabaseRecord & { id: string; title: string; status: string; description: string }>;
  deliverables: ProjectDeliverable[];
  comments: ProjectComment[];
  events: ProjectEvent[];
}

export default function AdminProjectDetailPage() {
  const { projectId = '' } = useParams();
  const [data, setData] = useState<AdminWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState({ title: '', description: '', taskKind: 'internal', visibility: 'internal', dueAt: '' });
  const [delivery, setDelivery] = useState({ title: '', description: '', externalUrl: '', visibility: 'client' });
  const [comment, setComment] = useState({ body: '', visibility: 'both' });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await requestJson<AdminWorkspace>(`/api/admin/app/project/detail?projectId=${encodeURIComponent(projectId)}`)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao carregar o projeto.'); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="p-10 text-center text-sm text-gray-500">Carregando projeto...</div>;
  if (!data) return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error || 'Projeto não encontrado.'}</div>;

  const { project } = data;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white p-6">
        <div><Link to="/admin/projetos" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#5B4FE9]"><ArrowLeft className="h-3.5 w-3.5" /> Voltar</Link><h2 className="text-xl font-black text-gray-950">{project.name}</h2><p className="mt-1 text-xs text-gray-500">{project.customer_name} · {project.customer_email} · {project.service_name_snapshot || String(project.service_slug || 'Serviço')}</p><p className="mt-1 text-[10px] text-gray-400">Pedido: {String(project.source_order_id || 'não vinculado')} · Proposta: {String(project.crm_proposal_id || 'não vinculada')} · Responsável: {String(project.responsible_user_id || 'não atribuído')}</p></div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{project.status}</span>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-4 text-sm font-bold">Etapas e progresso verificável</h3><div className="space-y-2">{data.milestones.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3"><div><p className="text-xs font-bold text-gray-800">{item.title}</p><p className="text-[10px] text-gray-400">{item.status}</p></div>{item.status !== 'concluido' && <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(async () => { await requestJson('/api/admin/app/project/milestone/status', { method: 'POST', body: JSON.stringify({ milestoneId: item.id, status: 'concluido' }) }); })}>Concluir</Button>}</div>)}</div></section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><Users className="h-4 w-4" /> Tarefas e ações</h3><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void run(async () => { await requestJson('/api/admin/app/project/task', { method: 'POST', body: JSON.stringify({ projectId, ...task, dueAt: task.dueAt || null }) }); setTask({ title: '', description: '', taskKind: 'internal', visibility: 'internal', dueAt: '' }); }); }}><input required value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} placeholder="Título da tarefa" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><textarea value={task.description} onChange={(event) => setTask({ ...task, description: event.target.value })} placeholder="Descrição" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><div className="grid grid-cols-2 gap-2"><select value={task.taskKind} onChange={(event) => { const taskKind = event.target.value; setTask({ ...task, taskKind, visibility: taskKind === 'client_action' ? 'both' : 'internal' }); }} className="rounded-xl border border-gray-200 p-2 text-xs"><option value="internal">Tarefa interna</option><option value="client_action">Ação do cliente</option></select><select value={task.visibility} onChange={(event) => setTask({ ...task, visibility: event.target.value })} className="rounded-xl border border-gray-200 p-2 text-xs"><option value="internal">Interno</option><option value="client">Cliente</option><option value="both">Ambos</option></select></div><input type="datetime-local" value={task.dueAt} onChange={(event) => setTask({ ...task, dueAt: event.target.value })} className="w-full rounded-xl border border-gray-200 p-2 text-xs" /><Button type="submit" size="sm" variant="gradient" loading={busy}><Plus className="h-3.5 w-3.5" /> Criar tarefa</Button></form><div className="mt-4 space-y-2">{data.tasks.map((item) => <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-xs"><div className="flex justify-between"><strong>{item.title}</strong><span>{item.visibility} · {item.status}</span></div></div>)}</div></section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><FileCheck2 className="h-4 w-4" /> Entregas e aprovações</h3><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void run(async () => { await requestJson('/api/admin/app/project/deliverable', { method: 'POST', body: JSON.stringify({ projectId, ...delivery }) }); setDelivery({ title: '', description: '', externalUrl: '', visibility: 'client' }); }); }}><input required value={delivery.title} onChange={(event) => setDelivery({ ...delivery, title: event.target.value })} placeholder="Título da entrega" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><input required type="url" value={delivery.externalUrl} onChange={(event) => setDelivery({ ...delivery, externalUrl: event.target.value })} placeholder="URL HTTPS da entrega" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><textarea value={delivery.description} onChange={(event) => setDelivery({ ...delivery, description: event.target.value })} placeholder="Descrição" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><Button type="submit" size="sm" variant="gradient" loading={busy}>Disponibilizar entrega</Button></form><div className="mt-4 space-y-2">{data.deliverables.map((item) => <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-xs"><strong>{item.title}</strong><p className="mt-1 text-gray-500">v{item.current_version} · {item.status} · {item.approvals.length} decisão(ões)</p></div>)}</div></section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><MessageSquare className="h-4 w-4" /> Comunicação</h3><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void run(async () => { await requestJson('/api/admin/app/project/comment', { method: 'POST', body: JSON.stringify({ projectId, ...comment }) }); setComment({ ...comment, body: '' }); }); }}><textarea required value={comment.body} onChange={(event) => setComment({ ...comment, body: event.target.value })} placeholder="Comentário contextual" className="w-full rounded-xl border border-gray-200 p-3 text-xs" /><select value={comment.visibility} onChange={(event) => setComment({ ...comment, visibility: event.target.value })} className="rounded-xl border border-gray-200 p-2 text-xs"><option value="internal">Somente equipe</option><option value="both">Equipe e cliente</option><option value="client">Cliente</option></select><Button type="submit" size="sm" variant="gradient" loading={busy}>Publicar comentário</Button></form><div className="mt-4 max-h-64 space-y-2 overflow-y-auto">{data.comments.map((item) => <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-xs"><div className="flex justify-between text-[10px] text-gray-400"><strong>{item.author_name}</strong><span>{item.visibility}</span></div><p className="mt-1">{item.body}</p></div>)}</div></section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-3 text-sm font-bold">Arquivos ({data.files.length})</h3>{data.files.map((item) => <p key={item.id} className="border-b border-gray-50 py-2 text-xs">{item.name} <span className="text-gray-400">· {item.size}</span></p>)}</section><section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-3 text-sm font-bold">Solicitações ({data.requests.length})</h3>{data.requests.map((item) => <p key={item.id} className="border-b border-gray-50 py-2 text-xs"><strong>{item.title}</strong> · {item.status}</p>)}</section><section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><History className="h-4 w-4" /> Histórico</h3><div className="max-h-72 space-y-2 overflow-y-auto">{data.events.map((item) => <div key={item.id} className="rounded-xl bg-gray-50 p-2 text-xs"><p>{item.summary}</p><p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleString('pt-BR')}</p></div>)}</div></section></div>
      <section className="rounded-3xl border border-gray-100 bg-white p-6"><h3 className="mb-3 text-sm font-bold">Briefing relacionado</h3>{project.briefing ? <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">{JSON.stringify(project.briefing, null, 2)}</pre> : <p className="text-xs text-gray-400">Briefing ainda não enviado.</p>}</section>
      <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-700"><CheckCircle2 className="mr-2 inline h-4 w-4" />Dados internos permanecem fora das respostas do portal do cliente.</div>
    </div>
  );
}
