import { Link } from 'react-router-dom';
import { BriefcaseBusiness, ChevronRight, CircleAlert, Loader2 } from 'lucide-react';
import { useServiceEngagements } from '../../context/ServiceEngagementContext';

const statusLabels: Record<string, string> = {
  awaiting_payment: 'Aguardando pagamento',
  awaiting_onboarding: 'Aguardando onboarding',
  awaiting_briefing: 'Aguardando briefing',
  in_progress: 'Em andamento',
  awaiting_customer: 'Aguardando cliente',
  active: 'Ativo',
  completed: 'Concluído',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
};

export default function ServicesPage() {
  const { engagements, loading } = useServiceEngagements();

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Carregando serviços...</div>;
  }

  if (engagements.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <CircleAlert className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">Nenhum serviço contratado</h2>
        <p className="mt-2 text-sm text-slate-600">Quando uma contratação for confirmada, ela aparecerá aqui com suas ferramentas e etapas.</p>
        <Link to="/solucoes" className="mt-5 inline-flex rounded-xl bg-[#5B4FE9] px-5 py-3 text-sm font-bold text-white">Conhecer soluções</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Serviços em acompanhamento</h2>
        <p className="mt-1 text-sm text-slate-600">Escolha a contratação para acessar projeto, briefing, arquivos e financeiro sem misturar informações.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {engagements.map((engagement) => (
          <Link
            key={engagement.id}
            to={`/painel/servicos/${engagement.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#5B4FE9]/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5B4FE9]/10 text-[#5B4FE9]"><BriefcaseBusiness className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">{engagement.service_name_snapshot}</h3>
                  <p className="truncate text-sm text-slate-600">{engagement.template_name_snapshot || engagement.segment_name_snapshot || engagement.plan_name_snapshot || 'Serviço personalizado'}</p>
                  <p className="mt-2 text-xs font-semibold text-[#5B4FE9]">{engagement.public_code}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#5B4FE9]" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{statusLabels[engagement.status] || engagement.status}</span>
              {engagement.plan_name_snapshot ? <span className="text-slate-500">Plano {engagement.plan_name_snapshot}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
