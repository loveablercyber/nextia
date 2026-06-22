import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Star, Zap, Shield, Clock, HeadphonesIcon,
  Monitor, Smartphone, Globe, BarChart3, ChevronRight, Play,
  Sparkles, TrendingUp, Users, Award
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import TemplateCard from '../components/templates/TemplateCard';
import { templates } from '../data/templates';
import { testimonials, stats } from '../data/testimonials';

export default function HomePage() {
  const featuredTemplates = templates.filter(t => t.featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden min-h-screen flex items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5B4FE9]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4338CA]/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">+850 sites ativos no Brasil</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Seu site profissional,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  pronto para vender mais.
                </span>
              </h1>

              <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-xl">
                Escolha um modelo, envie suas informações e tenha uma presença digital profissional com suporte contínuo.
              </p>

              {/* Two main CTAs */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {/* CTA 1: Sites Prontos */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-200 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5B4FE9] flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">Sites Prontos</span>
                  </div>
                  <p className="text-white/65 text-xs mb-4 leading-relaxed">
                    Escolha um modelo profissional para seu negócio e ative sua presença digital.
                  </p>
                  <Link to="/sites-prontos">
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#818cf8] group-hover:text-white transition-colors">
                      Ver sites prontos
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                {/* CTA 2: Projeto Personalizado */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-200 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">Projeto Personalizado</span>
                  </div>
                  <p className="text-white/65 text-xs mb-4 leading-relaxed">
                    Precisa de algo exclusivo? Monte seu orçamento em poucos minutos.
                  </p>
                  <Link to="/orcamento">
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#c4b5fd] group-hover:text-white transition-colors">
                      Criar orçamento
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-5">
                {[
                  { icon: Zap, label: 'Ativação rápida' },
                  { icon: Shield, label: 'Suporte contínuo' },
                  { icon: Monitor, label: 'Sites responsivos' },
                  { icon: CheckCircle, label: 'Sem taxas ocultas' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-white/70 text-xs">
                    <Icon className="w-3.5 h-3.5 text-green-400" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right content - Browser mockup */}
            <div className="animate-fade-in-up delay-200 hidden lg:block">
              <div className="relative">
                {/* Floating cards */}
                <div className="absolute -left-8 top-1/4 animate-float delay-100 z-10">
                  <div className="bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 min-w-[160px]">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Novos clientes</div>
                      <div className="text-sm font-black text-gray-900">+40% este mês</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 bottom-1/4 animate-float delay-300 z-10">
                  <div className="bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 min-w-[150px]">
                    <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center">
                      <Star className="w-4 h-4 text-[#5B4FE9] fill-[#5B4FE9]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Avaliação</div>
                      <div className="text-sm font-black text-gray-900">5.0 ⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                </div>

                {/* Browser mockup */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                  {/* Browser chrome */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      restaurante.nextia.com.br
                    </div>
                  </div>
                  {/* Site preview */}
                  <div className="aspect-video overflow-hidden">
                    <svg viewBox="0 0 640 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="hero-preview" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1a0a00" />
                          <stop offset="100%" stopColor="#3d1a00" />
                        </linearGradient>
                      </defs>
                      <rect width="640" height="360" fill="url(#hero-preview)" />
                      <rect x="0" y="0" width="640" height="48" fill="rgba(0,0,0,0.4)" />
                      <text x="24" y="30" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">🍽️ Sabor & Arte</text>
                      <text x="300" y="30" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily="Inter, sans-serif">Cardápio</text>
                      <text x="380" y="30" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily="Inter, sans-serif">Reservas</text>
                      <text x="460" y="30" fill="rgba(255,255,255,0.7)" fontSize="12" fontFamily="Inter, sans-serif">Galeria</text>
                      <rect x="555" y="16" width="70" height="22" rx="11" fill="#e85d04" />
                      <text x="590" y="31" fill="white" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">Reservar</text>
                      <rect x="0" y="48" width="640" height="180" fill="rgba(0,0,0,0.3)" />
                      <text x="320" y="120" fill="white" fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Sabor e experiência</text>
                      <text x="320" y="155" fill="white" fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">em cada prato</text>
                      <text x="320" y="185" fill="rgba(255,220,150,0.9)" fontSize="14" fontFamily="Inter, sans-serif" textAnchor="middle">Gastronomia exclusiva no coração da cidade</text>
                      <rect x="220" y="205" width="90" height="30" rx="15" fill="#e85d04" />
                      <text x="265" y="224" fill="white" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Ver cardápio</text>
                      <rect x="325" y="205" width="95" height="30" rx="15" fill="transparent" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                      <text x="372" y="224" fill="white" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle">Fazer reserva</text>
                      {[0,1,2,3].map(i => (
                        <g key={i}>
                          <rect x={20 + i*155} y="245" width="140" height="100" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <text x={90 + i*155} y="282" fill="#e85d04" fontSize="26" textAnchor="middle">{['🥩','🍷','🥗','🍮'][i]}</text>
                          <text x={90 + i*155} y="305" fill="white" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">{['Principais','Bebidas','Entradas','Sobremesas'][i]}</text>
                          <text x={90 + i*155} y="322" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle">{['12 opções','Carta especial','8 opções','Chef exclusivo'][i]}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-[#5B4FE9] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section className="section-padding bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" size="md" className="mb-4">Sites prontos para o seu negócio</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Modelos profissionais, modernos e{' '}
              <span className="gradient-text">otimizados para atrair clientes</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Escolha o template ideal para o seu segmento e tenha seu site no ar em até 5 dias úteis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/sites-prontos">
              <Button variant="outline" size="lg">
                Ver todos os modelos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" size="md" className="mb-4">Como funciona</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Do zero ao site no ar em{' '}
              <span className="gradient-text">4 passos simples</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Sem precisar entender de tecnologia. Cuidamos de tudo por você.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Monitor,
                color: '#5B4FE9',
                bg: '#eef2ff',
                title: 'Escolha',
                description: 'Selecione um modelo ou solicite um site personalizado para seu negócio.',
              },
              {
                step: '02',
                icon: Users,
                color: '#7c3aed',
                bg: '#f5f3ff',
                title: 'Envie as informações',
                description: 'Preencha o briefing e envie seus materiais: logo, fotos e textos pelo painel.',
              },
              {
                step: '03',
                icon: Sparkles,
                color: '#2563eb',
                bg: '#eff6ff',
                title: 'Criamos seu site',
                description: 'Nossa equipe monta seu site com qualidade e você acompanha tudo em tempo real.',
              },
              {
                step: '04',
                icon: TrendingUp,
                color: '#059669',
                bg: '#f0fdf4',
                title: 'Publicamos',
                description: 'Seu site vai ao ar pronto para atrair mais clientes com suporte contínuo.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-0 -translate-x-1/2" />
                )}
                <div className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.bg }}
                    >
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-300 mb-1">PASSO {item.step}</div>
                      <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/como-funciona">
              <Button variant="ghost" size="lg">
                Saiba mais detalhes
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plans Preview Section */}
      <section className="section-padding bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="gradient" size="md" className="mb-4">Planos para todos os negócios</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              O plano ideal para você,{' '}
              <span className="gradient-text">sem surpresas</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Escolha o plano ideal e tenha um site profissional com suporte contínuo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Start', price: 59, color: '#64748b', features: ['Site profissional', 'Hospedagem + SSL', 'WhatsApp integrado', '1 solicitação/mês'] },
              { name: 'Pro', price: 99, color: '#5B4FE9', features: ['Tudo do Start', 'Mais páginas + SEO', 'Redes sociais', '2 solicitações/mês'], highlight: true },
              { name: 'Business', price: 159, color: '#7c3aed', features: ['Tudo do Pro', 'Agendamento online', 'Catálogo/Cardápio', '4 solicitações/mês'] },
              { name: 'Personalizado', price: null, color: '#059669', features: ['Escopo sob medida', 'Design exclusivo', 'Funcionalidades únicas', 'Manutenção opcional'] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.highlight
                    ? 'border-[#5B4FE9] shadow-lg shadow-[#5B4FE9]/10 scale-[1.02]'
                    : 'border-gray-100 shadow-sm hover:border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gradient">Mais popular</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-gray-900 font-bold text-lg">{plan.name}</h3>
                  {plan.price ? (
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black" style={{ color: plan.color }}>R$ {plan.price}</span>
                      <span className="text-gray-400 text-sm">/mês</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-black mt-1" style={{ color: plan.color }}>Sob orçamento</div>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/planos">
                  <Button
                    variant={plan.highlight ? 'gradient' : 'outline'}
                    size="sm"
                    fullWidth
                  >
                    {plan.price ? 'Assinar agora' : 'Solicitar orçamento'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/planos">
              <Button variant="ghost" size="lg">
                Comparar todos os planos
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" size="md" className="mb-4">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Negócios que{' '}
              <span className="gradient-text">transformaram sua presença digital</span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-gray-500 text-sm ml-1">4.9 de 5 • +850 avaliações</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.company}</div>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="gray" size="sm">{t.plan}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" size="md" className="mb-4">Por que a Nextia?</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                Tudo que seu negócio precisa em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] to-[#c4b5fd]">
                  uma plataforma
                </span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Zap, title: 'Ativação em até 5 dias', desc: 'Sem esperar meses. Seu site no ar rapidamente.' },
                  { icon: HeadphonesIcon, title: 'Suporte contínuo', desc: 'Equipe dedicada para ajudar sempre que precisar.' },
                  { icon: Smartphone, title: '100% responsivo', desc: 'Funciona perfeitamente em celulares, tablets e desktops.' },
                  { icon: BarChart3, title: 'Resultados mensuráveis', desc: 'Relatórios e analytics para acompanhar seu crescimento.' },
                  { icon: Shield, title: 'Hospedagem + SSL grátis', desc: 'Segurança e disponibilidade incluídas em todos os planos.' },
                  { icon: Award, title: 'Sem contratos longos', desc: 'Planos mensais com contrato mínimo acessível.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[#5B4FE9]/20 border border-[#5B4FE9]/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[#5B4FE9]/30 transition-colors">
                      <Icon className="w-5 h-5 text-[#818cf8]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-0.5">{title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Segment tags */}
            <div className="flex flex-wrap gap-3">
              {[
                '🍽️ Restaurantes', '💇 Salões de beleza', '✂️ Barbearias',
                '🛒 Lojas', '🏥 Clínicas', '📊 Contabilidade',
                '🏠 Imobiliárias', '🔧 Oficinas', '💼 Consultores',
                '🎓 Professores', '🍕 Pizzarias', '🏋️ Academias',
                '📸 Fotógrafos', '🎨 Designers', '💡 Startups',
                '🌿 Paisagismo', '🏗️ Construtoras', '⚖️ Advogados',
              ].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-[#5B4FE9]/20 hover:border-[#5B4FE9]/30 hover:text-white transition-all duration-200 cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section-padding bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <Badge variant="secondary" size="md" className="mb-4">Orçamento automático</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Precisa de algo{' '}
                <span className="gradient-text">exclusivo?</span>
              </h2>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                Monte seu orçamento personalizado em minutos. Responda algumas perguntas e receba uma estimativa detalhada sem compromisso.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '6 etapas rápidas e intuitivas',
                  'Cálculo automático de estimativa',
                  'Proposta enviada por nossa equipe',
                  'Resposta em até 2 horas úteis',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#5B4FE9] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/orcamento">
                <Button variant="gradient" size="xl">
                  <Sparkles className="w-5 h-5" />
                  Montar meu orçamento
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Right — wizard preview mockup */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* fake progress bar */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Etapa 2 de 6</span>
                    <span>33% concluído</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full w-1/3 bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] rounded-full" />
                  </div>
                  <div className="flex justify-between">
                    {['Tipo','Segmento','Estrutura','Identidade','Prazo','Contato'].map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i < 1 ? 'bg-[#5B4FE9] text-white' : i === 1 ? 'border-2 border-[#5B4FE9] text-[#5B4FE9]' : 'border-2 border-gray-100 text-gray-300'
                        }`}>{i < 1 ? '✓' : i+1}</div>
                        <span className={`text-[9px] hidden sm:block ${ i <= 1 ? 'text-[#5B4FE9]' : 'text-gray-300'}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* fake step content */}
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-1">Qual é o segmento do seu negócio?</h3>
                  <p className="text-gray-400 text-xs mb-4">Selecione a opção que mais combina com você</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{e:'🍽️',l:'Restaurante',s:true},{e:'💇',l:'Salão',s:false},{e:'✂️',l:'Barbearia',s:false},{e:'🛍️',l:'Loja',s:false},{e:'🏥',l:'Clínica',s:false},{e:'📊',l:'Contabilidade',s:false}].map(item => (
                      <div key={item.l} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                        item.s ? 'border-[#5B4FE9] bg-[#eef2ff] text-[#5B4FE9]' : 'border-gray-100 text-gray-500'
                      }`}>
                        <span>{item.e}</span><span>{item.l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-300">Voltar</span>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                      Próximo →
                    </div>
                  </div>
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Grátis ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
            </div>
            <div className="relative">
              <Badge variant="primary" size="md" className="mb-4 bg-white/20 text-white border-white/30">
                🚀 Comece hoje
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Pronto para ter seu site profissional?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Junte-se a mais de 850 empresas que já têm uma presença digital profissional com a Nextia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/sites-prontos">
                  <Button variant="white" size="xl">
                    Ver sites prontos
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/orcamento">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                  >
                    Criar orçamento
                  </Button>
                </Link>
              </div>
              <p className="text-white/50 text-xs mt-6">
                Contrato mínimo de 12 meses · Suporte contínuo · Sem taxas ocultas
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
