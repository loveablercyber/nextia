import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MousePointer, FileText, Palette, Rocket,
  CheckCircle, Clock, Headphones, BarChart3,
  ArrowRight, MessageCircle, ChevronDown, Zap, Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = 'Como Funciona — Nextia';
  }, []);

  const steps = [
    {
      number: '01',
      icon: MousePointer,
      color: '#5B4FE9',
      bg: '#eef2ff',
      title: 'Diagnóstico & Estrutura de Autoridade',
      description: 'Explore as estruturas estratégicas validadas por segmento ou solicite um projeto sob medida para posicionar sua empresa com máxima credibilidade.',
      actions: [
        'Análise de modelos por segmento',
        'Avaliação da arquitetura ideal',
        'Escolha da estrutura de autoridade',
        'Seleção do plano de gestão contínua',
      ],
      time: '5 minutos',
    },
    {
      number: '02',
      icon: FileText,
      color: '#7c3aed',
      bg: '#f5f3ff',
      title: 'Envio de Ativos e Diferenciais',
      description: 'Pelo painel do cliente, envie as informações estratégicas da sua empresa: diferenciais de mercado, serviços, credenciais e materiais de marca.',
      actions: [
        'Acesso ao painel do cliente',
        'Preenchimento do briefing de posicionamento',
        'Envio de marca, fotos e credenciais',
        'Definição dos pontos focais de conversão',
      ],
      time: '20 minutos',
    },
    {
      number: '03',
      icon: Palette,
      color: '#2563eb',
      bg: '#eff6ff',
      title: 'Construção da Identidade Digital',
      description: 'Nossa equipe projeta seu ambiente digital aplicando padrões corporativos de autoridade, hierarquia visual e otimização para captação de clientes.',
      actions: [
        'Análise estratégica de ativos enviados',
        'Arquitetura focada em gerar confiança',
        'Otimização para dispositivos móveis',
        'Homologação de segurança e velocidade',
      ],
      time: '3 a 5 dias',
    },
    {
      number: '04',
      icon: Rocket,
      color: '#059669',
      bg: '#f0fdf4',
      title: 'Lançamento & Gestão Contínua',
      description: 'Você valida a prévia do ambiente pelo painel. Após aprovação, sua empresa passa a contar com uma presença ativa 24/7 e suporte especializado.',
      actions: [
        'Validação do ambiente de autoridade',
        'Revisão final de pontos de contato',
        'Publicação do domínio e SSL ativo',
        'Manutenção e melhorias contínuas',
      ],
      time: '1 a 2 dias',
    },
  ];

  const faqs = [
    {
      q: 'Quanto tempo leva para minha empresa ter a presença digital ativa?',
      a: 'O prazo médio é de 4 a 7 dias úteis após o recebimento completo dos materiais e diferenciais no painel. Projetos sob medida são avaliados de acordo com o escopo estratégico.',
    },
    {
      q: 'Como a presença digital ajuda meu negócio a vender mais?',
      a: 'Seu cliente pesquisa sua empresa antes de fechar um negócio. Um ambiente digital profissional transmite credibilidade imediata, elimina dúvidas e faz com que a primeira venda aconteça antes mesmo da conversa.',
    },
    {
      q: 'O que é o briefing de posicionamento?',
      a: 'É um formulário estruturado em nosso painel onde você nos informa os principais diferenciais da sua empresa, serviços oferecidos e como deseja ser percebido pelo seu mercado.',
    },
    {
      q: 'Como funcionam as solicitações e atualizações mensais?',
      a: 'Todos os planos contam com atualizações periódicas incluídas. Você abre uma solicitação pelo painel do cliente e nossa equipe executa as melhorias para manter sua marca sempre relevante.',
    },
    {
      q: 'Vocês cuidam da segurança, hospedagem e domínio?',
      a: 'Sim! Toda a infraestrutura corporativa (hospedagem de alta velocidade, certificado SSL e proteção) é gerenciada por nossa equipe, sem você se preocupar com aspectos técnicos.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" size="md" className="mb-4">Processo Estruturado</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Sua presença digital consolidada em 4 etapas
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sem gargalos técnicos. Nossa equipe cuida de toda a arquitetura para você focar no crescimento da sua empresa.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Step indicator */}
                  <div
                    className="sm:w-24 flex-shrink-0 flex items-center justify-center p-6 sm:p-8"
                    style={{ backgroundColor: step.bg }}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-black mb-2" style={{ color: step.color }}>{step.number}</div>
                      <step.icon className="w-6 h-6 mx-auto" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {step.actions.map((action) => (
                            <li key={action} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {step.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ChevronDown className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* After launch */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Após o lançamento, a gente continua com você
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Headphones, color: '#5B4FE9', bg: '#eef2ff', title: 'Suporte contínuo', desc: 'Equipe disponível para ajudar com qualquer dúvida ou problema.' },
              { icon: BarChart3, color: '#059669', bg: '#f0fdf4', title: 'Relatórios mensais', desc: 'Acompanhe os acessos e o desempenho do seu site.' },
              { icon: Zap, color: '#f59e0b', bg: '#fffbeb', title: 'Alterações mensais', desc: 'Solicite atualizações de conteúdo conforme seu plano.' },
              { icon: Star, color: '#7c3aed', bg: '#f5f3ff', title: 'Melhorias contínuas', desc: 'Nossa equipe sugere melhorias para aumentar seus resultados.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 text-center" style={{ backgroundColor: bg }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="faq">
        <div className="text-center mb-10">
          <Badge variant="primary" size="md" className="mb-4">FAQ</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Perguntas frequentes</h2>
        </div>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Escolha um modelo ou fale com nossa equipe. Seu site profissional pode estar no ar em menos de uma semana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sites-prontos">
              <Button variant="white" size="xl">
                Ver sites prontos
                <ArrowRight className="w-5 h-5" />
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
