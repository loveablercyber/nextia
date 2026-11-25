import { Link, useParams, useMatch } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import BioPhoneMockup from '../components/bio/BioPhoneMockup';
import { findBioDemoBySlug } from '../data/nextiaBioDemos';
import { ArrowLeft, Images } from 'lucide-react';

export default function NextiaBioPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const profile = findBioDemoBySlug(slug);

  const isGallery = !!useMatch('/bio/:slug/galeria');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF3FF] via-white to-white">
      <Seo
        title={`${profile.brand} — Nextia Bio`}
        description={profile.subtitle}
        path={profile.bioPath}
      />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          to="/nextia-bio"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1677FF] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Nextia Bio
        </Link>

        {isGallery ? (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Images className="h-5 w-5 text-[#1677FF]" />
              <h1 className="text-2xl font-black text-slate-900">
                Galeria — {profile.brand}
              </h1>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.gallery.map((photo) => (
                <div
                  key={photo.src}
                  className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="px-4 py-2.5">
                    <p className="text-sm font-semibold text-slate-700">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to={profile.bioPath}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F5FD6]"
              >
                Voltar para a página
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">
                Demonstração Nextia Bio
              </span>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{profile.brand}</h1>
            </div>
            <BioPhoneMockup profile={profile} standalone />
            <div className="mt-8 rounded-2xl border border-[#1677FF]/20 bg-[#EAF3FF] p-5 text-center">
              <p className="text-sm font-semibold text-[#1677FF]">
                Gostou dessa apresentação? Crie a sua página com o Nextia Bio.
              </p>
              <Link
                to="/nextia-bio#planos"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F5FD6]"
              >
                Escolher meu plano
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
