import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Download, Eye, EyeOff, FileUp, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import type { MarketingMaterial } from '../../types/partner';

type MaterialCategory = MarketingMaterial['category'];

const categories: Array<{ value: MaterialCategory; label: string }> = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'stories', label: 'Stories' },
  { value: 'reels', label: 'Reels' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'video', label: 'Vídeo' },
  { value: 'pdf', label: 'PDF' },
  { value: 'logo', label: 'Logo' },
];

const emptyForm = {
  id: '',
  title: '',
  description: '',
  category: 'instagram' as MaterialCategory,
  active: true,
  sortOrder: 0,
};

async function responseJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

export default function AdminPartnerMaterialsPage() {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/partner-materials', { credentials: 'include', cache: 'no-store' });
      const data = await responseJson(response);
      setMaterials(data.materials || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar materiais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMaterials(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMaterials]);

  const openCreate = () => {
    setForm(emptyForm);
    setFile(null);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (material: MarketingMaterial) => {
    setForm({
      id: material.id,
      title: material.title,
      description: material.description || '',
      category: material.category,
      active: material.active !== false,
      sortOrder: Number(material.sortOrder || 0),
    });
    setFile(null);
    setError(null);
    setModalOpen(true);
  };

  const saveMaterial = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.id && !file) {
      setError('Selecione o arquivo que será disponibilizado aos parceiros.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (file) {
        payload.fileName = file.name;
        payload.fileData = await readFileAsDataUrl(file);
      }
      const response = await fetch('/api/admin/partner-materials/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await responseJson(response);
      setModalOpen(false);
      await loadMaterials();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Falha ao salvar material.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMaterial = async (material: MarketingMaterial) => {
    try {
      const response = await fetch('/api/admin/partner-materials/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: material.id,
          title: material.title,
          description: material.description,
          category: material.category,
          active: material.active === false,
          sortOrder: material.sortOrder || 0,
        }),
      });
      await responseJson(response);
      await loadMaterials();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Falha ao alterar material.');
    }
  };

  const deleteMaterial = async (material: MarketingMaterial) => {
    if (!confirm(`Excluir permanentemente o material "${material.title}"?`)) return;
    try {
      const response = await fetch('/api/admin/partner-materials/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: material.id }),
      });
      await responseJson(response);
      await loadMaterials();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Falha ao excluir material.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Central de Materiais dos Parceiros</h2>
          <p className="mt-1 text-xs text-gray-500">Os itens ativos aparecem imediatamente em Parceiro &gt; Materiais.</p>
        </div>
        <Button variant="gradient" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo material
        </Button>
      </div>

      {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</div>}

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Arquivo</th>
                <th className="px-5 py-3">Ordem</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center overflow-hidden bg-gray-100">
                        {material.thumbnail ? <img src={material.thumbnail} alt="" className="h-full w-full object-cover" /> : <FolderOpen className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-gray-900">{material.title}</div>
                        <div className="max-w-[320px] truncate text-[10px] text-gray-500">{material.description || 'Sem descrição'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 capitalize text-gray-700">{material.category}</td>
                  <td className="px-5 py-4 font-mono text-[10px] uppercase text-gray-500">{material.fileType} · {material.fileSize}</td>
                  <td className="px-5 py-4 text-gray-700">{material.sortOrder || 0}</td>
                  <td className="px-5 py-4">
                    <span className={material.active !== false ? 'font-bold text-green-700' : 'font-bold text-gray-400'}>
                      {material.active !== false ? 'Ativo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <a href={material.downloadUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Baixar arquivo"><Download className="h-4 w-4" /></a>
                      <button onClick={() => void toggleMaterial(material)} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title={material.active !== false ? 'Ocultar' : 'Publicar'}>{material.active !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      <button onClick={() => openEdit(material)} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Editar"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => void deleteMaterial(material)} className="p-2 text-red-500 hover:bg-red-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && materials.length === 0 && <div className="px-6 py-14 text-center text-sm text-gray-500">Nenhum material cadastrado.</div>}
        {loading && <div className="px-6 py-14 text-center text-sm text-gray-500">Carregando materiais...</div>}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="material-dialog-title">
          <form onSubmit={saveMaterial} className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 id="material-dialog-title" className="font-bold text-gray-950">{form.id ? 'Editar material' : 'Novo material'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              {error && <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Título</label>
                <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Descrição</label>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full resize-none border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Categoria</label>
                  <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as MaterialCategory })} className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-500">
                    {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Ordem</label>
                  <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
                </div>
              </div>
              {!form.id && (
                <label className="flex cursor-pointer items-center gap-3 border border-dashed border-gray-300 bg-gray-50 px-4 py-4 hover:border-pink-400">
                  <FileUp className="h-5 w-5 text-gray-500" />
                  <span className="min-w-0 text-xs text-gray-600">{file ? file.name : 'Selecionar arquivo (máximo 25 MB)'}</span>
                  <input type="file" required className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                </label>
              )}
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Disponível para parceiros
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="gradient" size="sm" loading={saving}>Salvar material</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
