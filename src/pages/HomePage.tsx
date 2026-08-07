import { Link } from 'react-router-dom';
import {
  Monitor, Cpu, Wrench, ShieldCheck, ArrowRight, CheckCircle,
  HelpCircle, MessageSquare, Zap, Clock, Shield, Award
} from 'lucide-react';
import { getWhatsAppLink, trackEvent } from '../utils/whatsapp';

export default function HomePage() {
  const serviceCards = [
    {
      id: 'sites',
      title: 'Sites Profissionais',
      subtitle: 'Para vender e apresentar sua empresa.',
      icon: Monitor,
      color: '#2086FF',
      bgColor: 'bg-[#2086FF]/10',
      borderColor: 'border-[#2086FF]/30',
      badgeColor: 'bg-[#2086FF] text-white',
      badgeText: 'Presença Digital',
      services: [
        'Sites Institucionais',
        'Landing Pages de Alta Conversão',
        'Catálogo Digital / Loja Virtual',
        'Integração com WhatsApp & CRM',
        'Otimização SEO para o Google'
      ],
      primaryCta: 'Solicitar site',
      secondaryCta: 'Conhecer soluções',
      primaryLink: getWhatsAppLink('sites'),
      secondaryLink: '/sites-prontos',
      type: 'sites'
    },
    {
      id: 'automacao',
      title: 'Automação & IA',
      subtitle: 'Para economizar tempo e automatizar processos.',
      icon: Cpu,
      color: '#7C5CFF',
      bgColor: 'bg-[#7C5CFF]/10',
      borderColor: 'border-[#7C5CFF]/30',
      badgeColor: 'bg-[#7C5CFF] text-white',
      badgeText: 'Inteligência',
      services: [
        'Chatbots Inteligentes',
        'Atendimento Automatizado no WhatsApp',
        'Sistemas Personalizados',
        'Formulários & Triagem de Leads',
        'Automação Comercial e Administrativa'
      ],
      primaryCta: 'Solicitar automação',
      secondaryCta: 'Conhecer soluções',
      primaryLink: getWhatsAppLink('automacao'),
      secondaryLink: '/automacao-ia',
      type: 'automacao'
    },
    {
      id: 'techcare',
      title: 'Suporte de TI (TechCare)',
      subtitle: 'Para resolver problemas e evitar que sua empresa pare.',
      icon: Wrench,
      color: '#FF9D2E',
      bgColor: 'bg-[#FF9D2E]/10',
      borderColor: 'border-[#FF9D2E]/30',
      badgeColor: 'bg-[#FF9D2E] text-white',
      badgeText: 'Suporte & Gestão',
      services: [
        'Manutenção de Computadores & Notebooks',
        'Formatação, Otimização & Upgrade SSD',
        'Suporte Remoto & Presencial em Bauru',
        'Backup Corporativo Automático',
        'Planos Mensais de TI Preventivo'
      ],
      primaryCta: 'Solicitar suporte',
      secondaryCta: 'Ver planos de TI',
      primaryLink: getWhatsAppLink('suporte'),
      secondaryLink: '/techcare',
      type: 'suporte'
    },
    {
      id: 'redes-seguranca',
      title: 'Redes & Segurança',
      subtitle: 'Para manter sua empresa conectada e protegida.',
      icon: ShieldCheck,
      color: '#21C77A',
      bgColor: 'bg-[#21C77A]/10',
      borderColor: 'border-[#21C77A]/30',
      badgeColor: 'bg-[#21C77A] text-white',
      badgeText: 'Infraestrutura',
      services: [
        'Wi-Fi Empresarial Estável e Sem Quedas',
        'Cabeamento Estruturado & Organização de Rack',
        'Câmeras de Segurança (CFTV/IP)',
        'Monitoramento & Acesso Remoto no Celular',
        'Diagnóstico e Proteção de Rede'
      ],
      primaryCta: 'Solicitar visita',
      secondaryCta: 'Conhecer soluções',
      primaryLink: getWhatsAppLink('redes'),
      secondaryLink: '/redes-wifi',
      type: 'redes'
    }
  ];

  const faqs = [
    {
      q: 'A Nextia atende empresas e residências?',
      a: 'Sim! Atendemos tanto empresas (com planos mensais de TI, redes e automação) quanto profissionais autônomos e residências para atendimentos pontuais de suporte e instalação de câmeras.'
    },
    {
      q: 'O atendimento pode ser realizado de forma remota?',
      a: 'Com certeza. Para problemas de software, configurações, remoção de vírus e otimização de sistema, realizamos o suporte remoto com total segurança e agilidade para clientes de qualquer localidade.'
    },
    {
      q: 'A Nextia atende presencialmente em Bauru?',
      a: 'Sim, Bauru é nossa sede principal para atendimentos presenciais regulares de suporte de TI, redes e instalação de câmeras. Para cidades vizinhas, o atendimento presencial é realizado sob consulta de disponibilidade e deslocamento.'
    },
    {
      q: 'Como funciona a visita técnica em Bauru?',
      a: 'Nosso valor de visita técnica em Bauru para diagnóstico presencial é de R$ 100. Havendo execução imediata de serviço até 90 minutos, o valor passa para a partir de R$ 180.'
    },
    {
      q: 'Existe plano mensal de TI para empresas?',
      a: 'Sim! Nosso programa Nextia TechCare oferece planos empresariais a partir de R$ 590/mês, cobrindo equipamentos, horas de suporte técnico, preventiva e backups para sua empresa não parar.'
    },
    {
      q: 'Peças e equipamentos estão incluídos nos valores dos serviços?',
      a: 'Não. Os valores dos serviços cobrem a mão de obra técnica especializada. Peças para substituição (como SSDs, memória), roteadores, licenças ou câmeras são orçados separadamente.'
    },
    {
      q: 'Como funciona o serviço de backup corporativo?',
      a: 'Oferecemos rotinas de backup automatizado e criptografado para garantir que os dados vitais da sua empresa estejam protegidos contra perda, falhas de disco ou ransomware.'
    },
    {
      q: 'Vocês realizam instalação e manutenção de câmeras de segurança?',
      a: 'Sim, projetos completos de CFTV e câmeras IP com acesso remoto pelo celular, organização de cabeamento e configuração de gravação.'
    },
    {
      q: 'Como melhorar o Wi-Fi da minha empresa que vive caindo?',
      a: 'Fazemos uma análise de cobertura no local, instalando Access Points estratégicos e roteadores adequados para suportar múltiplos dispositivos simultâneos sem lentidão.'
    },
    {
      q: 'Vocês criam sites profissionais para qualquer segmento?',
      a: 'Sim! Desenvolvemos sites institucionais, landing pages e lojas virtuais otimizadas para o Google e preparadas para converter visitantes em clientes no WhatsApp.'
    },
    {
      q: 'A Nextia trabalha com automação e IA no WhatsApp?',
      a: 'Sim. Criamos atendentes virtuais inteligentes no WhatsApp que respondem dúvidas frequentes, qualificam leads e realizam agendamentos 24 horas por dia.'
    },
    {
      q: 'Como solicitar atendimento ou orçamento?',
      a: 'Você pode clicar em qualquer botão de atendimento para falar diretamente com nosso WhatsApp ou preencher o formulário no final da página.'
    }
  ];

  return (
    <div className="bg-[#07111F] text-white">
      {/* 1. HERO SECTION (5-second rule clarity) */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-b from-[#07111F] via-[#0B1625] to-[#07111F]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#2086FF] via-[#7C5CFF] to-[#FF9D2E] rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-blue-300">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Tecnologia Completa para Empresas e Profissionais
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
              A tecnologia que sua empresa precisa,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2086FF] via-[#36B7FF] to-[#21C77A]">
                em um só lugar.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#AAB6C5] leading-relaxed mb-10 max-w-3xl mx-auto font-normal">
              Sites, sistemas, automação, suporte de TI, redes, câmeras e segurança para empresas e profissionais funcionarem e crescerem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <a
                href={getWhatsAppLink('geral')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('click_whatsapp', { origem: 'hero' })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2086FF] to-[#7C5CFF] text-white px-8 py-4 rounded-xl font-bold text-base hover:opacity-95 shadow-lg shadow-[#2086FF]/25 transition-all"
              >
                Solicitar orçamento
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#solucoes-principais"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
              >
                Conhecer soluções
              </a>
            </div>

            {/* Micro badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-white/10 text-xs text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#2086FF]" />
                <span>Atendimento Bauru & Região</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#7C5CFF]" />
                <span>Suporte Remoto & Presencial</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#FF9D2E]" />
                <span>Planos Mensais sem Pegadinha</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#21C77A]" />
                <span>Empresa Única e Integrada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CARDS DE SERVIÇOS - MENU VISUAL PRINCIPAL */}
      <section id="solucoes-principais" className="py-20 bg-[#0B1625] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              O que sua empresa precisa resolver agora?
            </h2>
            <p className="text-[#AAB6C5] text-base max-w-2xl mx-auto">
              Selecione a área de interesse para obter suporte imediato ou solicitar uma proposta comercial personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-[#101C2C] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" style={{ color: card.color }} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${card.badgeColor}`}>
                        {card.badgeText}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#AAB6C5] mb-6 leading-relaxed">
                      {card.subtitle}
                    </p>

                    <ul className="space-y-2.5 mb-8 border-t border-white/5 pt-5">
                      {card.services.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: card.color }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/5">
                    <a
                      href={card.primaryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('card_service_click', { servico: card.id })}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white py-3 rounded-xl transition-all shadow-md"
                      style={{ backgroundColor: card.color }}
                    >
                      {card.primaryCta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    <Link
                      to={card.secondaryLink}
                      className="w-full inline-flex items-center justify-center text-xs font-medium text-gray-400 hover:text-white py-2 transition-colors"
                    >
                      {card.secondaryCta} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DIFERENCIAIS DA NEXTIA */}
      <section className="py-20 bg-[#07111F] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#2086FF] font-bold text-xs uppercase tracking-widest block mb-2">
                Por que escolher a Nextia?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
                Centralize a TI da sua empresa com quem realmente entende do assunto.
              </h2>
              <p className="text-[#AAB6C5] text-sm leading-relaxed mb-8">
                Chega de contratar uma empresa para o site, um técnico autônomo para o computador e outra pessoa para as câmeras. A Nextia reúne todas as soluções em uma gestão única, ágil e transparente.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#101C2C] border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#2086FF]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#2086FF]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Atendimento Local & Agilidade</h4>
                    <p className="text-gray-400 text-xs mt-1">Presencial em Bauru e suporte remoto imediato para qualquer lugar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#101C2C] border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#7C5CFF]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#7C5CFF]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Planos Recorrentes Preventivos</h4>
                    <p className="text-gray-400 text-xs mt-1">Manutenção contínua que evita surpresas e paralisações no seu trabalho.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#101C2C] border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#FF9D2E]/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-[#FF9D2E]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Transparência Comercial Total</h4>
                    <p className="text-gray-400 text-xs mt-1">Regras claras, orçamentos detalhados sem taxas ocultas ou termos ilimitados irrealistas.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-4">
                Precisa de atendimento agora?
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Fale com nossa equipe técnica para solicitar um diagnóstico, orçamento de site, suporte para computadores ou avaliação de rede.
              </p>

              <a
                href={getWhatsAppLink('geral')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#21C77A] text-white font-bold py-3.5 rounded-xl hover:bg-[#1bb06b] transition-colors shadow-lg shadow-[#21C77A]/20 text-sm mb-4"
              >
                <MessageSquare className="w-4 h-4" />
                Falar com a equipe no WhatsApp
              </a>

              <p className="text-[11px] text-center text-gray-500">
                Atendimento presencial em Bauru-SP • Suporte remoto Brasil
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREVIEW DOS PLANOS TECHCARE */}
      <section className="py-20 bg-[#0B1625]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#FF9D2E] font-bold text-xs uppercase tracking-widest block mb-2">
              Nextia TechCare
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Planos Mensais de TI para Empresas
            </h2>
            <p className="text-[#AAB6C5] text-sm max-w-xl mx-auto">
              Garanta manutenção preventiva, suporte prioritário e backups contínuos para os computadores da sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Essencial */}
            <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">TechCare Essencial</h3>
                <div className="text-2xl font-black text-[#FF9D2E] mb-4">
                  R$ 590 <span className="text-xs text-gray-400 font-normal">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">✓ Até 3 equipamentos cobertos</li>
                  <li className="flex items-center gap-2">✓ Até 3 horas mensais de suporte</li>
                  <li className="flex items-center gap-2">✓ Atendimento remoto prioritário</li>
                  <li className="flex items-center gap-2">✓ Verificação básica de backup</li>
                </ul>
              </div>
              <a
                href={getWhatsAppLink('planoMensal', 'Olá! Gostaria de contratar o plano TechCare Essencial.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-white/20 transition-colors"
              >
                Quero o Essencial
              </a>
            </div>

            {/* Profissional */}
            <div className="bg-[#101C2C] border-2 border-[#FF9D2E] rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-[#FF9D2E]/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF9D2E] text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full">
                Mais Recomendado
              </span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">TechCare Profissional</h3>
                <div className="text-3xl font-black text-[#FF9D2E] mb-4">
                  R$ 850 <span className="text-xs text-gray-400 font-normal">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">✓ Até 5 equipamentos cobertos</li>
                  <li className="flex items-center gap-2">✓ Até 5 horas mensais de suporte</li>
                  <li className="flex items-center gap-2">✓ Atendimento remoto e presencial</li>
                  <li className="flex items-center gap-2">✓ Manutenção preventiva & Wi-Fi</li>
                  <li className="flex items-center gap-2">✓ Suporte para impressoras</li>
                </ul>
              </div>
              <a
                href={getWhatsAppLink('planoMensal', 'Olá! Gostaria de contratar o plano TechCare Profissional.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#FF9D2E] text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:bg-[#e08924] transition-colors"
              >
                Quero o Profissional
              </a>
            </div>

            {/* Empresa */}
            <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">TechCare Empresa</h3>
                <div className="text-2xl font-black text-[#FF9D2E] mb-4">
                  R$ 1.200 <span className="text-xs text-gray-400 font-normal">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                  <li className="flex items-center gap-2">✓ Até 10 equipamentos cobertos</li>
                  <li className="flex items-center gap-2">✓ Até 10 horas mensais de suporte</li>
                  <li className="flex items-center gap-2">✓ Suporte presencial & remoto</li>
                  <li className="flex items-center gap-2">✓ Inventário técnico de ativos</li>
                  <li className="flex items-center gap-2">✓ SLA prioritário de atendimento</li>
                </ul>
              </div>
              <a
                href={getWhatsAppLink('planoMensal', 'Olá! Gostaria de falar com especialista sobre o plano TechCare Empresa.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-white/20 transition-colors"
              >
                Falar com Especialista
              </a>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/techcare" className="text-xs text-gray-400 hover:text-white underline">
              Ver todos os detalhes e regras contratuais do TechCare →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 bg-[#07111F] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-gray-400 text-sm">
              Tire suas dúvidas sobre nossos serviços de tecnologia, suporte e prazos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#101C2C] border border-white/5 rounded-xl p-5">
                <h4 className="text-white font-bold text-sm mb-2 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2086FF] flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-[#2086FF]/20 via-[#7C5CFF]/20 to-[#21C77A]/20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pronto para organizar a tecnologia da sua empresa?
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-8">
            Fale conosco agora mesmo no WhatsApp para tirar dúvidas ou solicitar uma visita técnica sem compromisso em Bauru.
          </p>

          <a
            href={getWhatsAppLink('geral')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('click_whatsapp', { origem: 'cta_final' })}
            className="inline-flex items-center gap-2 bg-[#21C77A] text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-[#1bb06b] shadow-xl shadow-[#21C77A]/20 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Falar pelo WhatsApp Agora
          </a>
        </div>
      </section>
    </div>
  );
}
