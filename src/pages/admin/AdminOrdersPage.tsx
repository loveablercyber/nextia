import { useEffect, useState } from 'react';
import { Loader2, Save, ShoppingBag, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  item_name: string;
  amount_cents: number;
  recurring: boolean;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
}

interface Contract {
  id: string;
  plan_name: string;
  monthly_amount_cents: number;
  activation_amount_cents: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
}

const orderStatuses = [
  ['pending', 'Criado'],
  ['payment_pending', 'Aguardando pagamento'],
  ['paid', 'Pago'],
  ['active', 'Ativo'],
  ['failed', 'Falhou'],
  ['cancelled', 'Cancelado'],
];

const contractStatuses = [
  ['activation_pending', 'Aguardando ativação'],
  ['subscription_pending', 'Aguardando assinatura'],
  ['active', 'Ativo'],
  ['failed', 'Falhou'],
  ['cancelled', 'Cancelado'],
];

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    fetch('/api/admin/commerce/orders', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setOrders(data.orders || []);
        setContracts(data.contracts || []);
      })
      .catch((err) => setError(err.message || 'Falha ao carregar dados comerciais.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const changeOrder = (id: string, status: string) =>
    setOrders((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

  const changeContract = (id: string, status: string) =>
    setContracts((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

  const save = async (kind: 'order' | 'contract', id: string, status: string) => {
    setSaving(id);
    setError('');
    try {
      const response = await fetch(
        kind === 'order' ? '/api/admin/commerce/orders' : '/api/admin/commerce/contracts',
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(kind === 'order' ? { orderId: id, status } : { contractId: id, status }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving('');
    }
  };

  const remove = async (kind: 'order' | 'contract', id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.')) return;
    setDeleting(id);
    setError('');
    try {
      const response = await fetch(
        kind === 'order' ? `/api/admin/commerce/orders/${id}` : `/api/admin/commerce/contracts/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (kind === 'order') {
        setOrders((prev) => prev.filter((item) => item.id !== id));
      } else {
        setContracts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao remover registro.');
    } finally {
      setDeleting('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando pedidos...
      </div>
    );
  }

  const table = (kind: 'order' | 'contract') => {
    const items = kind === 'order' ? orders : contracts;
    const statuses = kind === 'order' ? orderStatuses : contractStatuses;
    if (!items.length) {
      return (
        <div className="flex min-h-40 items-center justify-center border border-slate-200 bg-white text-slate-500">
          Nenhum registro nesta categoria.
        </div>
      );
    }
    return (
      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50 text-sm uppercase text-slate-500">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Item</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Data</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{item.customer_name || 'Cliente'}</p>
                  <p className="text-sm text-slate-500">{item.customer_email}</p>
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {'item_name' in item ? item.item_name : item.plan_name}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {'amount_cents' in item ? (
                    money.format(item.amount_cents / 100)
                  ) : (
                    <>
                      <p>{money.format(item.activation_amount_cents / 100)} ativação</p>
                      <p className="text-sm font-normal text-slate-500">
                        {money.format(item.monthly_amount_cents / 100)}/mês
                      </p>
                    </>
                  )}
                </td>
                <td className="p-4 text-slate-600">{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  <select
                    value={item.status}
                    onChange={(event) =>
                      kind === 'order'
                        ? changeOrder(item.id, event.target.value)
                        : changeContract(item.id, event.target.value)
                    }
                    className="min-h-11 rounded border border-slate-300 px-3 bg-white text-slate-900 font-medium"
                  >
                    {statuses.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => save(kind, item.id, item.status)}
                      disabled={saving === item.id}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded bg-[#1677FF] px-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                      title="Salvar status"
                    >
                      {saving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </button>

                    <button
                      onClick={() => remove(kind, item.id)}
                      disabled={deleting === item.id}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded bg-red-50 border border-red-200 px-3 font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                      title="Remover pedido / fatura"
                    >
                      {deleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-black text-slate-900">Pedidos e assinaturas</h2>
        <p className="mt-2 text-base text-slate-600">
          Acompanhe contratações, altere status ou remova registros quando necessário.
        </p>
      </header>

      {error && <div className="border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">{error}</div>}

      {orders.length === 0 && contracts.length === 0 && (
        <div className="flex min-h-56 flex-col items-center justify-center border border-slate-200 bg-white">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-500">Nenhuma contratação registrada.</p>
        </div>
      )}

      <section>
        <h3 className="mb-4 text-lg font-black text-slate-900">Contratos de planos</h3>
        {table('contract')}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-black text-slate-900">Serviços avulsos e recorrentes</h3>
        {table('order')}
      </section>
    </div>
  );
}
