import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, HelpCircle,
  ShieldCheck, ShoppingBag, Truck, CreditCard, Lock, Sparkles, Store
} from 'lucide-react';
import Seo from '../components/seo/Seo';
import Button from '../components/ui/Button';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useCommercialPlans } from '../hooks/useCommercialPlans';
import { LOJA_OPTIONAL_FEATURES } from '../data/templates';

interface StoreTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  cover_image: string;
  preview_url: string;
  features: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function LojaVirtualPage() {
  const navigate = useNavigate();
  const services = useServiceCatalog();
  const commercialPlans = useCommercialPlans();

  const storeService = services.find((s) => s.slug === 'lojas-virtuais');
  const baseServicePrice = storeService?.price || 1490;

  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId === 'start') {
      setRecProducts('small');
    } else if (planId === 'pro') {
      setRecProducts('medium');
    } else if (planId === 'business' || planId === 'service-only') {
      setRecProducts('large');
    }
  };

  // Recommendation Wizard state
  const [recProducts, setRecProducts] = useState<string>('medium');
  const [recPayments, setRecPayments] = useState<string>('all');

  useEffect(() => {
    fetch('/api/catalog/store-templates')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
          setSelectedTemplateId(data.templates[0].id);
        }
      })
      .catch(() => {
        // Fallback default
        const fallback: StoreTemplate = {
          id: 'tpl-loja-catalogo',
          slug: 'loja-catalogo',
          name: 'Loja & Catálogo Digital',
          category: 'Loja e Catálogo',
          description: 'Template oficial Nextia para lojas virtuais com catálogo completo, variações de produto, checkout integrado e gestão de pedidos.',
          cover_image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
          preview_url: '/demo/loja-catalogo',
          features: [
            'Catálogo de produtos completo',
            'Checkout transparente Cartão & Pix',
            'Cálculo de frete automatizado',
            'Painel administrativo de pedidos',
            'Design 100% responsivo mobile-first'
          ],
          featured: true,
          active: true,
          sort_order: 10,
        };
        setTemplates([fallback]);
        setSelectedTemplateId(fallback.id);
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  const categories = Array.from(new Set(['todos', ...templates.map((t) => t.category.toLowerCase())]));

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === 'todos') return true;
    return t.category.toLowerCase() === selectedCategory;
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleToggleOption = (id: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceedToCheckout = () => {
    if (!selectedTemplate) return;
    const optionsQuery = selectedOptionIds.length > 0 ? `&options=${selectedOptionIds.join(',')}` : '';
    navigate(`/cadastro?service=lojas-virtuais&template=${selectedTemplate.slug}&plano=${selectedPlanId}${optionsQuery}`);
  };

  const recommendedPlan = (recProducts === 'large' || recPayments === 'custom')
    ? 'business'
    : recProducts === 'medium'
      ? 'pro'
      : 'start';

  return (
    <main className="bg-white text-[#07162B] font-sans">
      <Seo
        title="Loja Virtual & E-commerce — Nextia"
        description="Sua loja virtual pronta para vender online. Escolha um modelo, selecione seu plano e a Nextia cuida de toda a estrutura e configuração."
        path="/lojas-virtuais"
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#07162B] via-[#0F2440] to-[#1E1B4B] pt-28 pb-20 text-white lg:pt-36 lg:pb-28">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_70%_20%,#1677FF,transparent_45%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#35B7FF]" /> LOJA VIRTUAL PROFISSIONAL
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Sua loja virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#35B7FF] to-[#1677FF]">pronta para vender online</span>.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl max-w-2xl">
              Você cuida dos seus produtos. A Nextia prepara sua loja completa com visual profissional, meios de pagamento, frete automatizado e suporte contínuo.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#modelos"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#1677FF] px-8 text-base font-extrabold text-white shadow-lg transition hover:bg-[#0F63D8]"
              >
                Criar minha loja <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#planos"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-base font-extrabold text-white transition hover:bg-white/10"
              >
                Ver planos
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-green-400" /> Escolha o modelo e veja exatamente o que sua loja terá antes de contratar.
            </p>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-medium text-slate-400">sualoja.com.br</span>
                <span className="text-xs text-green-400 font-semibold">SSL Ativo</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={selectedTemplate?.cover_image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop'}
                  alt="Demonstração da Loja Virtual"
                  className="h-full w-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold text-white">{selectedTemplate?.name || 'Modelo Loja Virtual'}</span>
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 font-semibold text-blue-400">Pronto para uso</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">{selectedTemplate?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFÍCIOS IMEDIATOS */}
      <section className="border-b border-slate-100 bg-slate-50 py-6">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6 text-center">
            {[
              { label: 'Loja Responsiva', sub: 'Mobile-first' },
              { label: 'Visual Sob Medida', sub: 'Sua identidade' },
              { label: 'Cartão & Pix', sub: 'Checkout seguro' },
              { label: 'Cálculo de Frete', sub: 'Correios & Envio' },
              { label: 'Gestão Online', sub: 'Painel simplificado' },
              { label: 'Suporte Nextia', sub: 'Acompanhamento' },
            ].map((b) => (
              <div key={b.label} className="p-2">
                <p className="text-sm font-bold text-slate-900">{b.label}</p>
                <p className="text-xs text-slate-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO DE MODELOS REAIS */}
      <section id="modelos" className="py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-extrabold uppercase tracking-wider text-[#1677FF]">Modelos Profissionais</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl text-slate-900">
              Escolha como sua loja vai começar.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Selecione um modelo de base e a Nextia personaliza cores, logo, conteúdo e estrutura para a sua marca.
            </p>
          </div>

          {/* Filtro por categoria */}
          {categories.length > 2 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-[#1677FF] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid de modelos */}
          {loadingTemplates ? (
            <div className="mt-12 text-center text-slate-400">Carregando modelos disponíveis...</div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {filteredTemplates.map((model) => {
                const isSelected = selectedTemplateId === model.id;
                return (
                  <div
                    key={model.id}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'border-[#1677FF] bg-blue-50/20 ring-2 ring-[#1677FF] shadow-xl'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                    }`}
                  >
                    {model.featured && (
                      <div className="absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                        DESTAQUE
                      </div>
                    )}
                    <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                      {model.cover_image && model.cover_image.trim() !== '' ? (
                        <img
                          src={model.cover_image}
                          alt={model.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-slate-800', 'to-slate-900');
                            }
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1E38] to-[#163868] text-white p-4 text-center">
                          <Store className="h-10 w-10 text-[#35B7FF] mb-1 opacity-70" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{model.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">{model.category}</span>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">{model.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{model.description}</p>

                      <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        {model.preview_url ? (
                          <a
                            href={model.preview_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-slate-600 hover:text-[#1677FF] underline"
                          >
                            Ver demonstração
                          </a>
                        ) : <span />}

                        <button
                          onClick={() => setSelectedTemplateId(model.id)}
                          className={`rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                            isSelected
                              ? 'bg-green-600 text-white'
                              : 'bg-[#1677FF] text-white hover:bg-[#0F63D8]'
                          }`}
                        >
                          {isSelected ? 'Modelo selecionado ✓' : 'Usar este modelo'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. RECURSOS COMPROVADOS DA LOJA */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-extrabold uppercase tracking-wider text-[#1677FF]">Recursos Inclusos</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl text-slate-900">
              Tudo o que você precisa para vender online.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Recursos essenciais testados para garantir que sua loja opere sem falhas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShoppingBag,
                title: 'Catálogo de Produtos',
                desc: 'Cadastro de produtos com fotos, variações (tamanho, cor), preços, estoque e categorização organizada.'
              },
              {
                icon: CreditCard,
                title: 'Pagamentos Integrados',
                desc: 'Receba via Pix e Cartão de Crédito com confirmação automática do pedido diretamente no sistema.'
              },
              {
                icon: Truck,
                title: 'Cálculo de Frete Automatizado',
                desc: 'Integração pronta para cotação em tempo real por CEP, opções de retirada local e regras personalizadas.'
              },
              {
                icon: Store,
                title: 'Gestão de Pedidos',
                desc: 'Painel intuitivo para acompanhar pedidos, alterar status de envio e notificar o cliente.'
              },
              {
                icon: ShieldCheck,
                title: 'Segurança & SSL',
                desc: 'Certificado de segurança gratuito e estrutura preparada para proteger dados e pagamentos dos clientes.'
              },
              {
                icon: CheckCircle2,
                title: 'Treinamento de Operação',
                desc: 'Orientação direta para você e sua equipe aprenderem a gerenciar a loja, atualizar produtos e processar vendas.'
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1677FF]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-extrabold uppercase tracking-wider text-[#1677FF]">Passo a Passo</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl text-slate-900">
              Sua loja no ar sem complicação.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-5">
            {[
              { step: '01', title: 'Escolha um modelo', desc: 'Defina a aparência inicial da sua loja virtual.' },
              { step: '02', title: 'Selecione seu plano', desc: 'Escolha os recursos e serviços que atendem sua fase.' },
              { step: '03', title: 'Envie seus dados', desc: 'Logotipo, cores, catálogo inicial e informações da empresa.' },
              { step: '04', title: 'A Nextia configura', desc: 'Personalizamos a estrutura, meios de pagamento e entregas.' },
              { step: '05', title: 'Revise e publique', desc: 'Após a aprovação do resultado, sua loja entra no ar.' },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <span className="text-2xl font-black text-[#1677FF]">{item.step}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PLANOS DA LOJA VIRTUAL */}
      <section id="planos" className="py-20 lg:py-24 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm font-extrabold uppercase tracking-wider text-[#35B7FF]">Planos Transparentes</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl text-white">
              Escolha a oferta ideal para a sua operação.
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
              Valores transparentes e alinhados ao catálogo oficial da plataforma. Sem surpresas ou taxas ocultas.
            </p>

            {/* Comparativo de Diferenciação: Catálogo vs Loja Virtual Completa */}
            <div className="mt-8 mx-auto max-w-3xl rounded-2xl border border-blue-500/30 bg-blue-950/40 p-5 text-left text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white mb-2 text-base">
                <Store className="h-5 w-5 text-[#35B7FF]" /> Catálogo Digital vs. Loja Virtual Completa
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">📖 Site com Catálogo (Vitrine)</span>
                  <p className="text-slate-400 text-xs">Ideal para exibir produtos e enviar o cliente para o WhatsApp para negociar. Não cobra frete ou cartão direto no site.</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/30">
                  <span className="font-bold text-[#35B7FF] block mb-1">🛒 Loja Virtual Completa (E-commerce)</span>
                  <p className="text-slate-300 text-xs">Sua loja 100% automatizada com checkout transparente (Pix & Cartão), cálculo automático de frete Correios/Melhor Envio e gestão de estoque.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Oferta Padrão Serviço (Projeto Avulso) */}
            <div className={`flex flex-col justify-between rounded-2xl border p-6 transition ${
              selectedPlanId === 'service-only' ? 'border-[#35B7FF] bg-slate-800 ring-2 ring-[#35B7FF]' : 'border-slate-800 bg-slate-950'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROJETO AVULSO</span>
                <h3 className="mt-1 text-xl font-bold text-white">Projeto Único</h3>
                <p className="mt-1 text-xs text-slate-400">Desenvolvimento sem mensalidade obrigatória.</p>
                <div className="mt-4">
                  <span className="text-2xl font-black text-white">{money.format(baseServicePrice)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">pagamento único do projeto</span>
                </div>
                <ul className="mt-5 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Modelo configurado</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Meios de pagamento</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Cálculo de frete</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Treinamento inicial</li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('service-only')}
                className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                  selectedPlanId === 'service-only' ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {selectedPlanId === 'service-only' ? 'Selecionado ✓' : 'Selecionar Avulso'}
              </button>
            </div>

            {/* 2. Start, 3. Pro, 4. Business */}
            {commercialPlans.slice(0, 3).map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = plan.id === 'pro';
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition ${
                    isSelected ? 'border-[#35B7FF] bg-slate-800 ring-2 ring-[#35B7FF]' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 right-4 rounded-full bg-[#1677FF] px-2.5 py-0.5 text-[9px] font-bold text-white">
                      MAIS VENDIDO
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#35B7FF]">{plan.name}</span>
                    <h3 className="mt-1 text-xl font-bold text-white">Nextia {plan.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">Ativação + suporte mensal contínuo.</p>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-white">{money.format(plan.price)}</span>
                      <span className="text-xs text-slate-400">/mês</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">+ {money.format(plan.activationFee)} ativação</span>
                    </div>
                    <ul className="mt-5 space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Loja virtual completa</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Hospedagem + SSL grátis</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Suporte contínuo</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-400" /> Backup automático</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                      isSelected ? 'bg-green-600 text-white' : 'bg-[#1677FF] hover:bg-[#0F63D8] text-white'
                    }`}
                  >
                    {isSelected ? 'Selecionado ✓' : `Selecionar ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Opcionais Comprovados */}
          <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-950 p-8">
            <h3 className="text-lg font-bold text-white mb-2">Complementos e Opcionais</h3>
            <p className="text-xs text-slate-400 mb-6">Adicione recursos específicos comprovados à sua contratação:</p>
            <div className="grid gap-4 md:grid-cols-2">
              {LOJA_OPTIONAL_FEATURES.map((opt) => {
                const isChecked = selectedOptionIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start justify-between gap-4 rounded-xl border p-4 cursor-pointer transition select-none ${
                      isChecked ? 'border-[#35B7FF] bg-blue-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleOption(opt.id)}
                        className="mt-1 h-4 w-4 rounded accent-[#1677FF]"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{opt.name}</p>
                        <p className="text-xs text-slate-400">{opt.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#35B7FF] whitespace-nowrap">
                      {opt.monthlyPrice > 0 ? `+R$ ${opt.monthlyPrice}/mês` : `+R$ ${opt.oneTimePrice}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. RECOMENDADOR INTELIGENTE */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1677FF]">Assistente de Escolha</span>
              <h2 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">Não sabe qual plano escolher?</h2>
              <p className="mt-2 text-sm text-slate-600">Responda a duas perguntas e indicamos a melhor estrutura.</p>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Quantos produtos você planeja cadastrar inicialmente?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'small', label: 'Até 50 produtos', plan: 'start' },
                    { id: 'medium', label: '50 a 500 produtos', plan: 'pro' },
                    { id: 'large', label: 'Mais de 500 produtos', plan: 'business' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setRecProducts(item.id);
                        setSelectedPlanId(item.plan);
                      }}
                      className={`rounded-xl border p-3 text-xs font-bold transition ${
                        recProducts === item.id ? 'border-[#1677FF] bg-blue-50 text-[#1677FF]' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Qual o formato de recebimento desejado?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'all', label: 'Pix + Cartão (Padrão)' },
                    { id: 'custom', label: 'Múltiplos Gateways / Personalizado' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setRecPayments(item.id)}
                      className={`rounded-xl border p-3 text-xs font-bold transition ${
                        recPayments === item.id ? 'border-[#1677FF] bg-blue-50 text-[#1677FF]' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
                <p className="text-xs text-slate-500 uppercase font-bold">Recomendação personalizada</p>
                <p className="mt-1 text-xl font-black text-[#1677FF]">
                  {recommendedPlan === 'business' ? 'Projeto Personalizado / Business' : recommendedPlan === 'pro' ? 'Assinatura Nextia Pro' : 'Projeto Avulso / Start'}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {recommendedPlan === 'business'
                    ? 'Ideal para operações com catálogo robusto ou demandas de integrações específicas.'
                    : 'Solução equilibrada com suporte contínuo e estrutura de vendas completa.'}
                </p>
                <button
                  onClick={() => {
                    handleSelectPlan(recommendedPlan);
                    const el = document.getElementById('resumo-final');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#1677FF] hover:underline"
                >
                  Usar esta recomendação →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RESUMO FINAL E CONTRATAÇÃO */}
      <section id="resumo-final" className="py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-8 md:p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white">Resumo da sua Loja Virtual</h3>
            <p className="mt-1 text-xs text-slate-400">Verifique a seleção antes de prosseguir para o checkout seguro.</p>

            <div className="mt-6 space-y-4 border-y border-slate-800 py-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Modelo Selecionado:</span>
                <span className="font-bold text-white">{selectedTemplate?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Plano/Oferta:</span>
                <span className="font-bold text-[#35B7FF]">
                  {selectedPlanId === 'service-only' ? 'Projeto Avulso Padrão' : `Plano ${selectedPlanId.toUpperCase()}`}
                </span>
              </div>
              {selectedOptionIds.length > 0 && (
                <div className="flex justify-between items-start text-sm">
                  <span className="text-slate-400">Opcionais ({selectedOptionIds.length}):</span>
                  <span className="font-semibold text-slate-300 text-right">
                    {selectedOptionIds.map((id) => LOJA_OPTIONAL_FEATURES.find((o) => o.id === id)?.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Inicial de Investimento</p>
                <p className="text-3xl font-black text-white">
                  {money.format(
                    selectedPlanId === 'service-only'
                      ? baseServicePrice
                      : (commercialPlans.find((p) => p.id === selectedPlanId)?.activationFee || 197)
                  )}
                </p>
              </div>

              <Button
                variant="gradient"
                size="lg"
                onClick={handleProceedToCheckout}
              >
                Avançar para o Checkout <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-[#1677FF]" />
            <h2 className="mt-2 text-3xl font-black text-slate-900">Perguntas Frequentes</h2>
          </div>
          <div className="mt-8 space-y-4">
            {[
              { q: 'Quanto tempo leva para a loja ficar pronta?', a: 'Após o envio do logotipo e informações iniciais, a Nextia entrega a primeira versão configurada em até 5 a 10 dias úteis.' },
              { q: 'Preciso ter conhecimento técnico para operar a loja?', a: 'Não. Entregamos a loja pronta com cadastros iniciais e um treinamento guiado para você gerenciar vendas e produtos com facilidade.' },
              { q: 'Como funcionam as taxas dos pagamentos?', a: 'Os valores das vendas vão direto para sua conta no intermediador de pagamentos (como o Mercado Pago), sem intermediação financeira da Nextia nas suas vendas.' },
            ].map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 cursor-pointer">
                <summary className="font-bold text-slate-900 text-lg flex justify-between items-center">
                  {item.q}
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </summary>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
