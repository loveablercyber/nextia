import { useParams, useLocation } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalNicheServiceData } from '../data/localNicheServices';
import LocalNicheServiceLandingPage from '../components/local/LocalNicheServiceLandingPage';

export default function LocalNicheServicePage() {
  const params = useParams<{ citySlug?: string; segmentSlug?: string; serviceSlug?: string }>();
  const location = useLocation();

  // Resolve city slug from params or from pathname (for direct routes like /bauru/:segment/:service)
  let citySlug = params.citySlug || '';
  let segmentSlug = params.segmentSlug || '';
  let serviceSlug = params.serviceSlug || '';

  if (!citySlug) {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length >= 3) {
      citySlug = parts[0];
      segmentSlug = parts[1];
      serviceSlug = parts[2];
    }
  }

  const data = getLocalNicheServiceData(citySlug, segmentSlug, serviceSlug);

  if (!data || data.status !== 'published') {
    return (
      <main className="min-h-[75vh] bg-[#07162B] text-white flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-blue-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Página Não Encontrada</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Não encontramos uma solução específica para esta combinação. Confira todas as nossas soluções!
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {citySlug && (
              <Link
                to={`/${citySlug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3 text-sm font-bold text-white transition-all"
              >
                Ver soluções em {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}
              </Link>
            )}
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

  return <LocalNicheServiceLandingPage data={data} />;
}
