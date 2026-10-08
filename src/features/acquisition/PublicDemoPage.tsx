import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock3, Loader2 } from 'lucide-react';
import Seo from '../../components/seo/Seo';
import PreviewSite, { type AcquisitionPreview, type PreviewPage } from './PreviewSite';

export default function PublicDemoPage() {
  const { shareKey = '' } = useParams();
  const [preview, setPreview] = useState<AcquisitionPreview | null>(null);
  const [page, setPage] = useState<PreviewPage>('inicio');
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/acquisition/demos/${encodeURIComponent(shareKey)}`, { cache: 'no-store' })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Demonstração indisponível.'); return data; })
      .then((data) => setPreview(data.preview))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Demonstração indisponível.'));
  }, [shareKey]);
  useEffect(() => { const onResize=()=>setMobile(window.innerWidth<640); window.addEventListener('resize',onResize); return ()=>window.removeEventListener('resize',onResize); },[]);

  if (error) return <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-white"><Seo title="Demonstração indisponível" description="Esta demonstração não está mais disponível." noindex/><div className="max-w-lg text-center"><h1 className="text-3xl font-black">Demonstração indisponível</h1><p className="mt-3 text-slate-300">{error}</p><Link to="/crie-seu-site" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold">Criar uma nova prévia</Link></div></main>;
  if (!preview) return <main className="grid min-h-screen place-items-center bg-slate-950 text-white"><Loader2 className="h-8 w-8 animate-spin"/></main>;

  return <main className="min-h-screen bg-slate-100">
    <Seo title={`${preview.business_name} | Demonstração`} description="Demonstração temporária de site criada na Nextia." noindex />
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-5 py-3 text-white"><Link to="/" className="font-black">Nextia</Link><span className="flex items-center gap-2 text-xs text-slate-300"><Clock3 className="h-4 w-4"/>Demonstração ativa até {preview.expires_at ? new Date(preview.expires_at).toLocaleDateString('pt-BR') : '7 dias'}</span><Link to="/painel/demonstracao" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold">Gerenciar no painel</Link></div>
    <PreviewSite preview={preview} page={page} onPage={setPage} device={mobile?'mobile':'desktop'}/>
  </main>;
}
