import { useEffect, useState } from 'react';
import { Check, FileText, Loader2, Save } from 'lucide-react';

interface CatalogRow {
  slug: string; name: string; category: string; price_cents: number | null; price_label: string;
  recurring: boolean; active: boolean; sort_order: number; updated_at: string;
}

const categories: Record<string, string> = { digital: 'Digital', automation: 'Automação', techcare: 'TechCare', infrastructure: 'Infraestrutura', security: 'Segurança' };

export default function AdminCatalogPage() {
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/catalog/services', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar o catálogo.');
      setRows(data.services);
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao carregar catálogo.'); }
    finally { setLoading(false); }
  };
  // Initial remote synchronization; state updates occur after the request settles.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  const change = (slug: string, values: Partial<CatalogRow>) => setRows((current) => current.map((row) => row.slug === slug ? { ...row, ...values } : row));
  const save = async (row: CatalogRow) => {
    setSaving(row.slug); setSaved(null); setError('');
    try {
      const response = await fetch('/api/admin/catalog/services', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: row.slug, priceCents: row.price_cents, priceLabel: row.price_label, recurring: row.recurring, active: row.active, sortOrder: row.sort_order }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar.');
      change(row.slug, data.service); setSaved(row.slug); setTimeout(() => setSaved(null), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao salvar.'); }
    finally { setSaving(null); }
  };

  return <div className="space-y-6">
    <header><h2 className="text-2xl font-black text-slate-900">Catálogo comercial</h2><p className="mt-2 text-base text-slate-600">Controle preços exibidos no site, recorrência, publicação e ordem dos serviços.</p></header>
    {error && <div role="alert" className="border border-red-200 bg-red-50 p-4 text-base font-semibold text-red-700">{error}</div>}
    {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /> Carregando catálogo...</div> : rows.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center border border-slate-200 bg-white text-slate-500"><FileText className="mb-3 h-10 w-10" /><p className="text-base">Nenhum serviço cadastrado.</p></div> :
      <div className="overflow-x-auto border border-slate-200 bg-white"><table className="w-full min-w-[980px] border-collapse text-left"><thead className="bg-slate-50 text-sm uppercase text-slate-500"><tr><th className="p-4">Serviço</th><th className="p-4">Preço</th><th className="p-4">Texto do preço</th><th className="p-4">Recorrente</th><th className="p-4">Publicado</th><th className="p-4">Ordem</th><th className="p-4 text-right">Ação</th></tr></thead><tbody className="divide-y divide-slate-200">{rows.map((row) => <tr key={row.slug} className="text-base"><td className="p-4"><p className="font-bold text-slate-900">{row.name}</p><p className="text-sm text-slate-500">{categories[row.category] || row.category} · /{row.slug}</p></td><td className="p-4"><div className="flex items-center"><span className="rounded-l border border-r-0 border-slate-300 bg-slate-50 px-3 py-2">R$</span><input aria-label={`Preço de ${row.name}`} type="number" min="0" step="0.01" value={row.price_cents === null ? '' : (row.price_cents / 100).toFixed(2)} onChange={(event) => change(row.slug, { price_cents: event.target.value === '' ? null : Math.round(Number(event.target.value) * 100) })} className="w-28 rounded-r border border-slate-300 px-3 py-2" placeholder="Sob consulta" /></div></td><td className="p-4"><input value={row.price_label} onChange={(event) => change(row.slug, { price_label: event.target.value })} className="w-52 rounded border border-slate-300 px-3 py-2" /></td><td className="p-4"><input type="checkbox" checked={row.recurring} onChange={(event) => change(row.slug, { recurring: event.target.checked })} className="h-5 w-5 accent-[#1677FF]" aria-label={`Recorrência de ${row.name}`} /></td><td className="p-4"><input type="checkbox" checked={row.active} onChange={(event) => change(row.slug, { active: event.target.checked })} className="h-5 w-5 accent-[#1677FF]" aria-label={`Publicação de ${row.name}`} /></td><td className="p-4"><input type="number" value={row.sort_order} onChange={(event) => change(row.slug, { sort_order: Number(event.target.value) })} className="w-20 rounded border border-slate-300 px-3 py-2" /></td><td className="p-4 text-right"><button onClick={() => save(row)} disabled={saving === row.slug} className="inline-flex min-h-11 items-center gap-2 rounded bg-[#1677FF] px-4 font-bold text-white disabled:opacity-60">{saving === row.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === row.slug ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved === row.slug ? 'Salvo' : 'Salvar'}</button></td></tr>)}</tbody></table></div>}
  </div>;
}
