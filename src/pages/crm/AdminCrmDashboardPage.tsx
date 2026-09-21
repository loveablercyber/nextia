import { useState, useEffect, useCallback } from 'react';
import { Users, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardData {
  leads: {
    byStatus: Record<string, number>;
    newInPeriod: number;
  };
  opportunities: {
    byStage: Array<{ name: string; color: string; count: number; value: number }>;
    won: { count: number; value: number };
    lost: number;
    pipelineValue: number;
  };
  activities: {
    pending: number;
    overdue: number;
    completedInPeriod: number;
  };
  topSources: Array<{ source: string; count: number }>;
  regionalBreakdown: {
    cities: DimensionMetric[];
    segments: DimensionMetric[];
    services: DimensionMetric[];
  };
  period: { days: number; since: string };
}

interface DimensionMetric {
  key: string;
  leads: number;
  conversions: number;
}

export default function AdminCrmDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchDashboard = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/crm/dashboard?days=${days}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const result = await res.json();
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    // A consulta sincroniza o painel com o periodo selecionado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return <div className="text-white text-center py-12">Carregando dashboard CRM...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-300">
        Erro ao carregar: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Comercial</h2>
          <p className="text-gray-400 mt-1">Visão geral do funil comercial da Nextia</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Período:</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={180}>180 dias</option>
            <option value={365}>365 dias</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Zap className="w-5 h-5" />}
          title="Leads Período"
          value={data?.leads.newInPeriod ?? 0}
          sub={`No último ${days} dias`}
          color="bg-indigo-600"
        />
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          title="Oportunidades Abertas"
          value={data?.opportunities.byStage.reduce((s, st) => s + Number(st.count), 0) ?? 0}
          sub={`${formatCurrency(data?.opportunities.pipelineValue ?? 0)} no pipeline`}
          color="bg-blue-600"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Vendas Ganhas"
          value={data?.opportunities.won.count ?? 0}
          sub={`${formatCurrency(data?.opportunities.won.value ?? 0)}`}
          color="bg-emerald-600"
        />
        <KpiCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Follow-ups Atrasados"
          value={data?.activities.overdue ?? 0}
          sub={`${data?.activities.pending ?? 0} pendentes`}
          color={data?.activities.overdue ? "bg-amber-600" : "bg-green-700"}
        />
      </div>

      {data?.leads.byStatus && Object.keys(data.leads.byStatus).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.leads.byStatus).map(([status, count]) => (
            <LeadStatusCard key={status} status={status} count={count} />
          ))}
        </div>
      )}

      {data?.opportunities.byStage && data.opportunities.byStage.length > 0 && (
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline por Estágios</h3>
          <div className="space-y-3">
            {data.opportunities.byStage.map((stage) => (
              <div key={stage.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{stage.name}</span>
                  <span className="text-gray-400">{stage.count} oportunidades ({formatCurrency(Number(stage.value))})</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(100, ((Number(stage.count) / Math.max(1, data.opportunities.byStage.reduce((s, st) => s + Number(st.count), 0))) * 100))}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.topSources && data.topSources.length > 0 && (
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Top Origens</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.topSources.map((src) => (
              <div key={src.source} className="bg-gray-900 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-indigo-400">{src.count}</div>
                <div className="text-xs text-gray-400 mt-1 truncate">{src.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.regionalBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DimensionBreakdown title="Leads por cidade" items={data.regionalBreakdown.cities} />
          <DimensionBreakdown title="Leads por segmento" items={data.regionalBreakdown.segments} />
          <DimensionBreakdown title="Leads por serviço" items={data.regionalBreakdown.services} />
        </div>
      )}
    </div>
  );
}

function DimensionBreakdown({ title, items }: { title: string; items: DimensionMetric[] }) {
  return (
    <section className="bg-[#1a2332] rounded-2xl p-5 border border-gray-800">
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados no período.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const rate = item.leads > 0 ? (item.conversions / item.leads) * 100 : 0;
            return (
              <div key={item.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-300 truncate" title={item.key}>{item.key.replaceAll('-', ' ')}</span>
                <span className="text-gray-400 whitespace-nowrap">{item.leads} leads · {rate.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function KpiCard({ icon, title, value, sub, color }: { icon: React.ReactNode; title: string; value: number | string; sub: string; color: string }) {
  return (
    <div className="bg-[#1a2332] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${color} text-white`}>{icon}</div>
        <span className="text-sm text-gray-400 font-medium">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function LeadStatusCard({ status, count }: { status: string; count: number | string }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: 'Novos', color: 'bg-indigo-600' },
    contact: { label: 'Em Contato', color: 'bg-purple-600' },
    qualified: { label: 'Qualificados', color: 'bg-violet-600' },
    won: { label: 'Ganhos', color: 'bg-emerald-600' },
    lost: { label: 'Perdidos', color: 'bg-red-600' },
    archived: { label: 'Arquivados', color: 'bg-gray-600' },
  };
  const mapped = statusMap[status] || { label: status, color: 'bg-gray-500' };

  return (
    <div className="bg-[#1a2332] rounded-2xl p-4 border border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${mapped.color}`} />
        <span className="text-sm text-gray-400">{mapped.label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{count}</div>
    </div>
  );
}
