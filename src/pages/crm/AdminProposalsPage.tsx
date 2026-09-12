import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, Copy, CreditCard, FileText, Loader2, Plus, Send } from 'lucide-react';

interface Proposal {
  id: string;
  public_code: string;
  title: string;
  opportunity_title: string;
  lead_name: string;
  status: string;
  version_number: number;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  monthly_total_cents: number;
  valid_until: string;
  order_id?: string | null;
  order_status?: string | null;
  payment_status?: string | null;
}

interface OpportunityOption {
  id: string;
  public_code: string;
  title: string;
  lead_name: string;
  service_slug?: string | null;
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function readApiError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}));
  return new Error(typeof data.error === 'string' ? data.error : fallback);
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError('');
    try {
      const [proposalResponse, opportunityResponse] = await Promise.all([
        fetch('/api/admin/crm/proposals', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/admin/crm/opportunities?status=open', { credentials: 'include', cache: 'no-store' }),
      ]);
      if (!proposalResponse.ok) throw await readApiError(proposalResponse, 'Falha ao carregar propostas.');
      if (!opportunityResponse.ok) throw await readApiError(opportunityResponse, 'Falha ao carregar oportunidades.');
      const [proposalData, opportunityData] = await Promise.all([proposalResponse.json(), opportunityResponse.json()]);
      setProposals(Array.isArray(proposalData.proposals) ? proposalData.proposals : []);
      setOpportunities(Array.isArray(opportunityData.opportunities) ? opportunityData.opportunities : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar propostas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // A consulta sincroniza propostas e oportunidades ao abrir a tela.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const runAction = async (proposal: Proposal, action: 'send' | 'accept' | 'checkout') => {
    setBusyId(proposal.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/crm/proposals/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proposal.id }),
      });
      if (!response.ok) throw await readApiError(response, 'Nao foi possivel atualizar a proposta.');
      const data = await response.json();
      if (action === 'checkout' && data.checkoutPath) {
        const checkoutUrl = new URL(data.checkoutPath, window.location.origin).toString();
        await navigator.clipboard.writeText(checkoutUrl);
      }
      await loadData();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Falha ao atualizar proposta.');
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => proposals.reduce<Record<string, number>>((result, proposal) => {
    result[proposal.status] = (result[proposal.status] || 0) + 1;
    return result;
  }, {}), [proposals]);

  if (loading) return <div className="py-12 text-center text-white">Carregando propostas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Propostas comerciais</h2>
          <p className="mt-1 text-gray-400">{proposals.length} propostas · {counts.accepted || 0} aceitas</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Nova proposta
        </button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-800 bg-red-900/20 p-4 text-red-300">{error}</div>}

      {proposals.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#1a2332] py-12 text-center text-gray-400">Nenhuma proposta criada.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#1a2332]">
          <table className="w-full min-w-[920px]">
            <thead className="border-b border-gray-800 bg-gray-900/50 text-left text-xs uppercase text-gray-400">
              <tr><th className="px-5 py-3">Proposta</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Valor</th><th className="px-5 py-3">Validade</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Acoes</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {proposals.map((proposal) => {
                const busy = busyId === proposal.id;
                return (
                  <tr key={proposal.id} className="text-sm text-gray-300">
                    <td className="px-5 py-4"><div className="font-medium text-white">{proposal.title}</div><div className="text-xs text-gray-500">{proposal.public_code} · v{proposal.version_number} · {proposal.opportunity_title}</div></td>
                    <td className="px-5 py-4">{proposal.lead_name || 'Cliente vinculado'}</td>
                    <td className="px-5 py-4"><div className="font-semibold text-indigo-300">{currency.format(Number(proposal.total_cents) / 100)}</div>{Number(proposal.monthly_total_cents) > 0 && <div className="text-xs text-gray-500">+ {currency.format(Number(proposal.monthly_total_cents) / 100)}/mes</div>}</td>
                    <td className="px-5 py-4">{new Date(`${proposal.valid_until}T12:00:00`).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-4"><StatusBadge status={proposal.status} />{proposal.order_id && <div className="mt-1 text-xs text-gray-500">Pedido: {proposal.order_status || proposal.payment_status}</div>}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {proposal.status === 'draft' && <ActionButton disabled={busy} onClick={() => void runAction(proposal, 'send')} icon={<Send className="h-3.5 w-3.5" />} label="Enviar" />}
                        {['sent', 'viewed'].includes(proposal.status) && <ActionButton disabled={busy} onClick={() => void runAction(proposal, 'accept')} icon={<Check className="h-3.5 w-3.5" />} label="Registrar aceite" />}
                        {proposal.status === 'accepted' && !proposal.order_id && <ActionButton disabled={busy} onClick={() => void runAction(proposal, 'checkout')} icon={busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />} label="Copiar checkout" />}
                        {proposal.order_id && <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><CreditCard className="h-3.5 w-3.5" /> Checkout vinculado</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateProposalModal opportunities={opportunities} onClose={() => setShowCreate(false)} onCreated={loadData} />}
    </div>
  );
}

function ActionButton({ disabled, onClick, icon, label }: { disabled: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1 rounded bg-gray-800 px-2.5 py-1.5 text-xs text-white hover:bg-gray-700 disabled:opacity-50">{icon}{label}</button>;
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada', accepted: 'Aceita', rejected: 'Recusada', expired: 'Expirada', cancelled: 'Cancelada' };
  const colors: Record<string, string> = { accepted: 'bg-emerald-900/50 text-emerald-300', sent: 'bg-indigo-900/50 text-indigo-300', viewed: 'bg-blue-900/50 text-blue-300', draft: 'bg-gray-800 text-gray-300', rejected: 'bg-red-900/50 text-red-300', expired: 'bg-amber-900/50 text-amber-300' };
  return <span className={`rounded-full px-2.5 py-1 text-xs ${colors[status] || 'bg-gray-800 text-gray-300'}`}>{labels[status] || status}</span>;
}

function CreateProposalModal({ opportunities, onClose, onCreated }: { opportunities: OpportunityOption[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState(() => ({ opportunityId: opportunities[0]?.id || '', title: '', discount: '0', validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), conditions: '', notes: '' }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/crm/proposals/create', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, discount: Number(form.discount || 0) }),
      });
      if (!response.ok) throw await readApiError(response, 'Falha ao criar proposta.');
      await onCreated();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Falha ao criar proposta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#1a2332] p-6">
        <div className="mb-5 flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-400" /><h3 className="text-xl font-bold text-white">Nova proposta</h3></div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-gray-300">Oportunidade<select required value={form.opportunityId} onChange={(event) => setForm({ ...form, opportunityId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"><option value="">Selecione</option>{opportunities.filter((item) => item.service_slug).map((item) => <option key={item.id} value={item.id}>{item.public_code} · {item.title} · {item.lead_name}</option>)}</select></label>
          <label className="block text-sm text-gray-300">Titulo<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-gray-300">Desconto (R$)<input type="number" min="0" step="0.01" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" /></label>
            <label className="block text-sm text-gray-300">Valida ate<input required type="date" value={form.validUntil} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" /></label>
          </div>
          <label className="block text-sm text-gray-300">Condicoes<textarea rows={3} value={form.conditions} onChange={(event) => setForm({ ...form, conditions: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" /></label>
          {error && <div role="alert" className="text-sm text-red-300">{error}</div>}
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white">Cancelar</button><button disabled={saving || !form.opportunityId} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">{saving ? 'Criando...' : 'Criar proposta'}</button></div>
        </form>
      </div>
    </div>
  );
}
