import { useParams, Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { getSegmentBySlug } from '../data/segments';
import SegmentLandingPage from '../components/segment/SegmentLandingPage';

export default function SegmentPage() {
  const { segmentSlug } = useParams<{ segmentSlug: string }>();
  const segment = segmentSlug ? getSegmentBySlug(segmentSlug) : undefined;

  if (!segment || segment.status !== 'published') {
    return (
      <main className="min-h-[75vh] bg-[#07162B] text-white flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-blue-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Segmento Não Encontrado</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Não encontramos soluções específicas para o termo informado. Conheça todos os segmentos atendidos pela Nextia!
          </p>
          <div className="pt-2">
            <Link
              to="/solucoes"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1677FF] hover:bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all"
            >
              Ver Todas as Soluções <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <SegmentLandingPage segment={segment} />;
}
