import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles, CheckCircle, Star, Clock, Code, LayoutDashboard, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function CustomProjectPage() {
  useEffect(() => {
    document.title = 'Projeto Personalizado — Nextia';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#1E1B4B] to-[#2d1b69] pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B4FE9]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" size="md" className="mb-4">Projeto Personalizado</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                Precisa de algo{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  exclusivo?
                </span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Sites personalizados, sistemas web, portais de clientes e integrações sob medida. Do design ao deploy, cuidamos de tudo.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/orcamento">
                  <Button variant="gradient" size="xl">
                    <Sparkles className="w-5 h-5" />
                    Montar meu orçamento
                  </Button>
                </Link>
                <a href="https://wa.me/5514996405496" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10">
                    <MessageCircle className="w-5 h-5" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            {/* Project types visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe, title: 'Site Institucional', desc: 'Presença digital completa para sua empresa', color: '#5B4FE9', bg: 'rgba(91,79,233,0.15)' },
                { icon: LayoutDashboard, title: 'Landing Page', desc: 'Páginas de alta conversão para campanhas', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
                { icon: Code, title: 'Sistema Web', desc: 'Sistemas personalizados para sua operação', color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
                { icon: Star, title: 'Portal de Clientes', desc: 'Área exclusiva para seus clientes', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="rounded-2xl p-4 border border-white/10 backdrop-blur-sm"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-7 h-7 mb-3" style={{ color }} />
                  <div className="text-white font-bold text-sm mb-1">{title}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" size="md" className="mb-4">O que oferecemos</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
              Projetos 100% personalizados para o seu negócio
            </h2>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, title: 'Briefing detalhado', desc: 'Levantamento completo de requisitos e expectativas do projeto.' },
                { icon: CheckCircle, title: 'Design exclusivo', desc: 'Interface criada do zero, alinhada à identidade da sua marca.' },
                { icon: CheckCircle, title: 'Desenvolvimento profissional', desc: 'Código limpo, escalável e pronto para crescer com seu negócio.' },
                { icon: CheckCircle, title: 'Integrações', desc: 'APIs, sistemas de pagamento, CRMs e outros sistemas.' },
                { icon: CheckCircle, title: 'Manutenção mensal', desc: 'Suporte pós-entrega com plano de manutenção opcional.' },
                { icon: CheckCircle, title: 'Treinamento', desc: 'Orientamos sua equipe para administrar o sistema.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-[#5B4FE9] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{title}</span>
                    <span className="text-gray-500 text-sm"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project types list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Tipos de projetos</h3>
            <div className="space-y-3">
              {[
                { type: 'Landing Page', range: 'R$ 800 – R$ 2.000', days: '5-10 dias' },
                { type: 'Site Institucional', range: 'R$ 1.500 – R$ 5.000', days: '10-20 dias' },
                { type: 'E-commerce básico', range: 'R$ 3.000 – R$ 8.000', days: '20-40 dias' },
                { type: 'Portal de clientes', range: 'R$ 5.000 – R$ 15.000', days: '30-60 dias' },
                { type: 'Sistema web', range: 'R$ 8.000 – R$ 30.000+', days: 'A definir' },
                { type: 'App mobile', range: 'Consulte-nos', days: 'A definir' },
              ].map(({ type, range, days }) => (
                <div key={type} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{type}</div>
                    <div className="text-xs text-[#5B4FE9]">{range}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {days}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">*Estimativas. O valor final depende da complexidade definida no briefing.</p>
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Como funciona um projeto personalizado</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Orçamento', desc: 'Preencha o formulário e receba uma estimativa' },
              { step: '2', title: 'Reunião', desc: 'Alinhamento de expectativas e escopo detalhado' },
              { step: '3', title: 'Proposta', desc: 'Proposta formal com prazo, escopo e valor' },
              { step: '4', title: 'Desenvolvimento', desc: 'Criação com acompanhamento e aprovações' },
              { step: '5', title: 'Entrega', desc: 'Publicação, treinamento e suporte inicial' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white font-black text-lg mx-auto mb-3">
                  {step}
                </div>
                <div className="font-bold text-gray-900 text-sm mb-1">{title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] rounded-3xl p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Vamos começar seu projeto?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Monte seu orçamento em minutos ou fale diretamente com nossa equipe pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orcamento">
              <Button variant="white" size="xl">
                <Sparkles className="w-5 h-5 text-[#5B4FE9]" />
                Montar meu orçamento
              </Button>
            </Link>
            <a href="https://wa.me/5514996405496" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
