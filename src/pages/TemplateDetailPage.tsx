import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, CheckCircle, Clock, ChevronRight,
  Monitor, MessageCircle, ExternalLink, Zap, Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { templates, getTemplateOptionalFeatures, getTemplateServiceSlug } from '../data/templates';
import { plans } from '../data/plans';
import { TemplateIllustration } from '../components/templates/TemplateIllustration';

export default function TemplateDetailPage() {
  const { slug } = useParams();
  const template = templates.find(t => t.slug === slug);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    template?.recommendedPlan ? template.recommendedPlan.toLowerCase() : 'pro'
  );

  useEffect(() => {
    if (template) document.title = `${template.name} — Nextia`;
    window.scrollTo(0, 0);
  }, [template]);

  const handleToggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template não encontrado</h2>
          <Link to="/sites-prontos">
            <Button variant="primary">Ver todos os templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  const planColors: Record<string, string> = {
    Start: '#64748b',
    Pro: '#5B4FE9',
    Business: '#7c3aed',
  };

  const templateOptionalFeatures = getTemplateOptionalFeatures(template);

  const selectedPlanObj = plans.find(p => p.id === selectedPlanId) || plans.find(p => p.id === 'pro') || plans[0];
  const basePrice = selectedPlanId === 'pro' && template ? template.price : selectedPlanObj.price;
  const baseActivationFee = selectedPlanId === 'pro' && template ? template.activationFee : selectedPlanObj.activationFee;

  const selectedMonthlyPrice = selectedOptions.reduce((acc, optId) => {
    const opt = templateOptionalFeatures.find(o => o.id === optId);
    return acc + (opt?.monthlyPrice || 0);
  }, 0);

  const selectedOneTimePrice = selectedOptions.reduce((acc, optId) => {
    const opt = templateOptionalFeatures.find(o => o.id === optId);
    return acc + (opt?.oneTimePrice || 0);
  }, 0);

  const totalMonthly = basePrice + selectedMonthlyPrice;
  const totalActivation = baseActivationFee + selectedOneTimePrice;

  const currentFeatures = selectedPlanId === 'pro' && template ? template.features : selectedPlanObj.features;

  const registerParams = new URLSearchParams({
    service: getTemplateServiceSlug(template),
    template: template.slug,
    plano: selectedPlanId,
  });
  if (selectedOptions.length > 0) registerParams.set('options', selectedOptions.join(','));
  const registerUrl = `/cadastro?${registerParams.toString()}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/sites-prontos" className="hover:text-[#5B4FE9] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Sites prontos
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-600">{template.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="primary">{template.category}</Badge>
                {template.badge && <Badge variant="gradient">{template.badge}</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{template.name}</h1>
              <p className="text-gray-600 leading-relaxed mb-6">{template.description}</p>

              {/* Quick info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-[#5B4FE9]">R$ {totalMonthly}</div>
                  <div className="text-xs text-gray-400">/mês</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-gray-900">~{template.estimatedDays}</div>
                  <div className="text-xs text-gray-400">dias para ativar</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-gray-900">{template.pages.length}</div>
                  <div className="text-xs text-gray-400">páginas incluídas</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-gray-500 text-sm">5.0 ({template.testimonials.length} avaliações)</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={registerUrl}>
                  <Button variant="gradient" size="lg">
                    <Zap className="w-4 h-4" />
                    Escolher este modelo
                  </Button>
                </Link>
                {template.demoUrl !== '#' ? (
                  <Link to={template.demoUrl}>
                    <Button variant="outline" size="lg">
                      <ExternalLink className="w-4 h-4" />
                      Ver demonstração
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="lg">
                    <ExternalLink className="w-4 h-4" />
                    Ver demonstração
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Taxa de ativação: R$ {totalActivation} · Plano selecionado: {selectedPlanObj.name}
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              {/* Desktop */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Monitor className="w-4 h-4" />
                  Preview desktop
                </div>
                <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded text-xs text-gray-300 px-2 py-0.5">
                      {template.slug}.nextia.com.br
                    </div>
                  </div>
                  <div className="aspect-[16/10] overflow-hidden">
                    <TemplateIllustration category={template.categorySlug} slug={template.slug} coverImage={template.coverImage} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Recursos incluídos</h2>
                <Badge variant="primary">{selectedPlanObj.name}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recursos Opcionais */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recursos opcionais para {template.category}</h2>
                  <p className="text-xs text-gray-400 mt-1">Personalize seu site adicionando recursos adicionais específicos para seu segmento.</p>
                </div>
                <Badge variant="primary">{selectedOptions.length} selecionado{selectedOptions.length !== 1 ? 's' : ''}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {templateOptionalFeatures.map((opt) => {
                  const isChecked = selectedOptions.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleOption(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-[#5B4FE9] bg-[#5B4FE9]/5 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div onClick
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#5B4FE9] focus:ring-[#5B4FE9] flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">
                          {opt.name}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{opt.description}</p>
                        <div className="text-xs font-bold text-[#5B4FE9] mt-2">
                          {opt.monthlyPrice > 0 ? `+ R$ ${opt.monthlyPrice}/mês` : `+ R$ ${opt.oneTimePrice} taxa única`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Páginas incluídas</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {template.pages.map((page, i) => (
                  <div key={page} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="w-6 h-6 rounded-lg bg-[#eef2ff] text-[#5B4FE9] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 text-sm font-medium">{page}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            {template.testimonials.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">O que os clientes dizem</h2>
                <div className="space-y-4">
                  {template.testimonials.map((t, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 italic">"{t.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
                          {t.avatar}
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold text-xs">{t.name}</div>
                          <div className="text-gray-400 text-xs">{t.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — Pricing card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-xs text-gray-400 mb-2 font-medium">Selecione o plano desejado</div>
                
                {/* Dropdown de Seleção de Plano */}
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold text-sm rounded-xl px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] cursor-pointer"
                >
                  {plans.filter(p => p.id !== 'custom').map((p) => {
                    const price = p.id === 'pro' && template ? template.price : p.price;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {price}/mês {p.id === template.recommendedPlan.toLowerCase() ? '(Recomendado)' : ''}
                      </option>
                    );
                  })}
                </select>

                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
                  style={{
                    backgroundColor: `${planColors[selectedPlanObj.name.replace('Nextia ', '')] || '#5B4FE9'}15`,
                    color: planColors[selectedPlanObj.name.replace('Nextia ', '')] || '#5B4FE9'
                  }}
                >
                  {selectedPlanObj.name} {selectedPlanObj.id === template.recommendedPlan.toLowerCase() ? '• Recomendado' : ''}
                </span>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-gray-900">R$ {totalMonthly}</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">+ R$ {totalActivation} taxa de ativação</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#5B4FE9]" />
                  Ativação em ~{template.estimatedDays} dias úteis
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  Hospedagem + SSL incluídos
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Suporte contínuo
                </div>
              </div>

              <Link to={registerUrl}>
                <Button variant="gradient" size="lg" fullWidth className="mb-3">
                  <Zap className="w-4 h-4" />
                  Escolher este modelo
                </Button>
              </Link>

              <a
                href="https://wa.me/5514996405496"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md" fullWidth>
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Falar no WhatsApp
                </Button>
              </a>

              <p className="text-center text-xs text-gray-400 mt-4">
                Contrato mínimo de 12 meses · Sem taxas ocultas
              </p>
            </div>

            {/* FAQ mini */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Perguntas frequentes</h3>
              <div className="space-y-4">
                {[
                  { q: 'Posso personalizar as cores?', a: 'Sim! Adaptamos as cores do modelo à identidade da sua marca.' },
                  { q: 'Posso trocar de template depois?', a: 'Entre em contato com nosso suporte para avaliar a migração.' },
                  { q: 'E se eu não tiver logo?', a: 'Podemos indicar um designer parceiro para criar sua identidade visual.' },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{q}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related templates */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Outros modelos populares</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates
              .filter(t => t.id !== template.id)
              .slice(0, 3)
              .map(t => (
                <Link
                  key={t.id}
                  to={`/templates/${t.slug}`}
                  className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow group flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#eef2ff] to-[#f5f3ff]">
                    <TemplateIllustration category={t.categorySlug} />
                  </div>
                  <div>
                    <Badge variant="primary" size="sm" className="mb-1">{t.category}</Badge>
                    <div className="font-bold text-gray-900 text-sm group-hover:text-[#5B4FE9] transition-colors">{t.name}</div>
                    <div className="text-xs text-gray-400">A partir de R$ {t.price}/mês</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#5B4FE9] transition-colors" />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
