export interface CityFaqItem {
  question: string;
  answer: string;
}

export interface CitySolutionItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  ctaText: string;
  ctaLink: string;
  iconName: 'code' | 'shopping-bag' | 'bot' | 'database' | 'headphones' | 'cpu';
  accentColor: string;
  softBg: string;
  highlightBadge?: string;
}

export interface CitySegmentItem {
  name: string;
  description: string;
  icon: string;
  recommendedSolution: string;
  futurePath?: string;
}

export interface CityData {
  slug: string;
  name: string;
  state: string;
  stateFullName: string;
  region: string;
  areaServed: string;
  leadSource: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  hero: {
    badge: string;
    h1Prefix: string;
    h1Highlight: string;
    h1Suffix: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryAnchor: string;
    whatsappMessage: string;
    highlights: string[];
  };
  overview: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
  };
  problemSolution: {
    title: string;
    subtitle: string;
    problemsTitle: string;
    problems: { title: string; desc: string }[];
    solutionsTitle: string;
    solutions: { title: string; desc: string }[];
  };
  solutions: CitySolutionItem[];
  segmentsTitle: string;
  segmentsSubtitle: string;
  segments: CitySegmentItem[];
  differentialsTitle: string;
  differentialsSubtitle: string;
  differentials: { title: string; description: string; iconName: string }[];
  nextia360: {
    title: string;
    subtitle: string;
    description: string;
    modules: { name: string; desc: string; icon: string }[];
    ctaText: string;
  };
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  localAttendance: {
    title: string;
    subtitle: string;
    description: string;
    points: string[];
    notice: string;
  };
  intermediateCta: {
    title: string;
    subtitle: string;
    primaryCta: string;
    whatsappCta: string;
  };
  templatesTitle: string;
  templatesSubtitle: string;
  faqs: CityFaqItem[];
  finalCta: {
    title: string;
    subtitle: string;
    primaryCta: string;
    whatsappCta: string;
  };
}

export const CITIES_DATA: Record<string, CityData> = {
  bauru: {
    slug: 'bauru',
    name: 'Bauru',
    state: 'SP',
    stateFullName: 'São Paulo',
    region: 'Centro-Oeste Paulista',
    areaServed: 'Bauru, SP, Brasil',
    leadSource: 'pagina_bauru',
    metaTitle: 'Criação de Sites e Tecnologia em Bauru | Nextia',
    metaDescription: 'Criação de sites profissionais, sistemas sob medida, automação, WhatsApp com IA e suporte de TI para empresas de Bauru e região. Fale com a Nextia.',
    keywords: [
      'criação de sites em Bauru',
      'empresa de criação de sites em Bauru',
      'desenvolvimento de sites Bauru',
      'empresa de tecnologia em Bauru',
      'suporte de TI em Bauru',
      'automação empresarial Bauru',
      'WhatsApp com IA Bauru',
      'criação de loja virtual Bauru',
      'desenvolvimento de sistemas Bauru',
      'agência de sites Bauru',
      'programador em Bauru',
      'SEO Bauru',
    ],
    hero: {
      badge: 'Soluções de Tecnologia para Empresas em Bauru e Região',
      h1Prefix: 'Criação de Sites e ',
      h1Highlight: 'Soluções de Tecnologia',
      h1Suffix: ' em Bauru',
      subtitle: 'A Nextia desenvolve sites de alto desempenho, sistemas sob medida, automações com IA e suporte técnico contínuo para empresas de Bauru venderem mais e operarem com máxima eficiência.',
      ctaPrimaryText: 'Solicitar orçamento',
      ctaPrimaryAnchor: '#formulario-orcamento',
      whatsappMessage: 'Olá! Encontrei a Nextia pesquisando soluções de tecnologia em Bauru e gostaria de receber mais informações.',
      highlights: [
        'Sites rápidos com foco em conversão e SEO',
        'Automação inteligente no WhatsApp para vendas e suporte',
        'Sistemas web sob medida e painéis de gestão',
        'Atendimento ágil para empresas de Bauru e região',
      ],
    },
    overview: {
      title: 'Tecnologia Estratégica para o Mercado Corporativo e Comercial de Bauru',
      subtitle: 'Uma infraestrutura digital completa para empresas que buscam credibilidade, captação de clientes e processos ágeis.',
      paragraph1: 'Bauru é um polo econômico, educacional e de serviços do Centro-Oeste Paulista, com um ecossistema empresarial dinâmico nos setores de comércio, saúde, gastronomia, imobiliário e serviços especializados. Para se destacar nesse mercado competitivo, ter uma presença online profissional e ferramentas modernas de atendimento não é apenas um diferencial, mas uma necessidade estratégica.',
      paragraph2: 'A Nextia atua como a parceira tecnológica de empresas em Bauru que precisam modernizar sua presença na internet, automatizar rotinas manuais de atendimento e contar com suporte técnico de confiança, sem complicação e com total previsibilidade de custos.',
    },
    problemSolution: {
      title: 'Sua empresa em Bauru ainda perde oportunidades por gargalos manuais?',
      subtitle: 'Compare o cenário comum de muitas empresas com a transformação que a tecnologia Nextia entrega:',
      problemsTitle: 'Desafios Comuns em Empresas de Bauru',
      problems: [
        {
          title: 'Site ultrapassado ou inexistente',
          desc: 'Empresa perde credibilidade quando clientes pesquisam no Google e encontram sites lentos, desatualizados ou apenas redes sociais.',
        },
        {
          title: 'Demora e perda de clientes no WhatsApp',
          desc: 'Mensagens acumuladas fora do horário comercial, respostas repetitivas e clientes buscando concorrentes por falta de agilidade.',
        },
        {
          title: 'Controles em planilhas e sistemas desconectados',
          desc: 'Dificuldade para gerenciar pedidos, atendimentos, propostas e tarefas operacionais em um ambiente centralizado.',
        },
        {
          title: 'TI instável e falta de apoio técnico',
          desc: 'Problemas recorrentes em computadores, redes e backup que paralisam a equipe e geram riscos de perda de dados.',
        },
      ],
      solutionsTitle: 'A Resposta da Nextia para sua Empresa',
      solutions: [
        {
          title: 'Sites modernos, rápidos e otimizados para o Google',
          desc: 'Projetos desenhados para carregar instantaneamente no celular, transmitir autoridade e converter visitantes em contatos qualificados.',
        },
        {
          title: 'Atendimento inteligente e automatizado 24/7',
          desc: 'Robôs com inteligência artificial treinados com as informações da sua empresa para qualificar leads e transferir para humanos.',
        },
        {
          title: 'Sistemas e dashboards sob medida',
          desc: 'Plataformas web intuitivas para organizar pedidos, contratos, agendamentos e processos específicos do seu modelo de negócio.',
        },
        {
          title: 'Nextia TechCare: Suporte e prevenção contínua',
          desc: 'Suporte remoto ágil, rotinas de backup seguro e manutenção preventiva para sua operação nunca parar.',
        },
      ],
    },
    solutions: [
      {
        id: 'sites',
        title: 'Criação de Sites Profissionais',
        tagline: 'Presença digital impecável e foco em geração de leads',
        description: 'Desenvolvimento de sites institucionais, landing pages e portais de serviços modernos para empresas em Bauru. Projetos responsivos, ultra-rápidos e estruturados para posicionamento no Google.',
        benefits: [
          'Design moderno, responsivo e adaptado para celulares',
          'Otimização avançada de velocidade e SEO on-page',
          'Botões de WhatsApp estratégicos e formulários de conversão',
          'Hospedagem segura e certificado SSL incluídos',
        ],
        ctaText: 'Criar meu site em Bauru',
        ctaLink: '/bauru/criacao-de-sites',
        iconName: 'code',
        accentColor: '#2563FF',
        softBg: '#EEF4FF',
        highlightBadge: 'Mais procurado',
      },
      {
        id: 'lojas-virtuais',
        title: 'Lojas Virtuais & E-commerce',
        tagline: 'Vendas online 24 horas por dia com catálogo integrado',
        description: 'Plataformas de e-commerce completas com catálogo de produtos, cálculo de frete, pagamento transparente via PIX e cartão, e sincronização de pedidos no WhatsApp.',
        benefits: [
          'Checkout transparente com PIX instantâneo e parcelamento',
          'Painel de controle fácil para gestão de produtos e estoque',
          'Integração com Correios, transportadoras e motoboy local',
          'Notificações automáticas de novos pedidos no WhatsApp',
        ],
        ctaText: 'Conhecer loja virtual em Bauru',
        ctaLink: '/bauru/loja-virtual',
        iconName: 'shopping-bag',
        accentColor: '#9147FF',
        softBg: '#F6EFFF',
      },
      {
        id: 'whatsapp-ia',
        title: 'WhatsApp com Inteligência Artificial',
        tagline: 'Atendimento automático inteligente e qualificação de clientes',
        description: 'Transforme o WhatsApp da sua empresa em Bauru em uma máquina de vendas e triagem. Respostas imediatas, atendimento 24/7 com IA e encaminhamento inteligente para sua equipe.',
        benefits: [
          'Respostas contextualizadas e humanizadas para dúvidas frequentes',
          'Agendamento automático de consultas, reuniões ou mesas',
          'Qualificação de leads antes de chamar o atendente humano',
          'Histórico e métricas completas de conversas no painel',
        ],
        ctaText: 'Automatizar meu WhatsApp em Bauru',
        ctaLink: '/bauru/whatsapp-ia',
        iconName: 'bot',
        accentColor: '#10B981',
        softBg: '#ECFDF5',
        highlightBadge: 'Inovação',
      },
      {
        id: 'sistemas',
        title: 'Sistemas Web Sob Medida',
        tagline: 'Software sob demanda para processos exclusivos',
        description: 'Desenvolvimento de sistemas personalizados para substituir planilhas complexas, conectar departamentos, criar portais de clientes e centralizar a gestão do seu negócio em Bauru.',
        benefits: [
          'Dashboards com métricas em tempo real',
          'Controle de acessos e níveis de permissão por usuário',
          'Integrações com gateways de pagamento, ERPs e APIs',
          'Acesso seguro de qualquer computador ou smartphone',
        ],
        ctaText: 'Conhecer sistemas em Bauru',
        ctaLink: '/bauru/desenvolvimento-de-sistemas',
        iconName: 'database',
        accentColor: '#6366F1',
        softBg: '#EEF2FF',
      },
      {
        id: 'suporte-ti',
        title: 'Suporte de TI & TechCare',
        tagline: 'Segurança, estabilidade e atendimento técnico para sua empresa',
        description: 'Gestão preventiva de TI para empresas em Bauru. Suporte remoto rápido, manutenção de computadores, suporte a redes locais, e-mails corporativos e rotinas de backup seguro.',
        benefits: [
          'Atendimento remoto ágil para resolução rápida de chamados',
          'Configuração e proteção de redes, Wi-Fi e roteadores',
          'Backups automatizados e criptografados em nuvem',
          'Planos mensais com histórico organizado de chamados',
        ],
        ctaText: 'Solicitar suporte de TI em Bauru',
        ctaLink: '/bauru/suporte-ti',
        iconName: 'headphones',
        accentColor: '#FF7A21',
        softBg: '#FFF2E9',
      },
      {
        id: 'automacao',
        title: 'Automação Empresarial',
        tagline: 'Integre ferramentas e elimine tarefas repetitivas',
        description: 'Conecte seu site, CRM, sistemas de mensagens, e-mails e planilhas para que as informações fluam automaticamente entre seus setores, economizando horas de trabalho.',
        benefits: [
          'Disparos automáticos de notificações e lembretes',
          'Geração automática de propostas e contratos digitais',
          'Integração entre formulários do site e funil de vendas',
          'Redução drástica de erros humanos operacionais',
        ],
        ctaText: 'Automatizar processos em Bauru',
        ctaLink: '/bauru/automacao',
        iconName: 'cpu',
        accentColor: '#13BBD4',
        softBg: '#EAFBFE',
      },
    ],
    segmentsTitle: 'Soluções Digitais Adaptadas para Diversos Segmentos em Bauru',
    segmentsSubtitle: 'Entendemos as particularidades de cada tipo de negócio para criar experiências sob medida:',
    segments: [
      { name: 'Contabilidades & Escritórios', description: 'Portais de clientes, envio de guias e geração de leads para empresas contábeis.', icon: '📊', recommendedSolution: 'Site Institucional + Portal Contábil', futurePath: '/sites' },
      { name: 'Clínicas & Consultórios', description: 'Apresentação de especialidades, agendamento de consultas e atendimento humanizado.', icon: '🏥', recommendedSolution: 'Site Médico + Agendamento WhatsApp', futurePath: '/sites' },
      { name: 'Dentistas & Odontologia', description: 'Transmissão de confiança, portfólio de tratamentos e confirmação automática de horários.', icon: '🦷', recommendedSolution: 'Site para Dentistas + WhatsApp IA', futurePath: '/sites' },
      { name: 'Advocacia & Jurídico', description: 'Sites com sobriedade e autoridade, áreas de atuação e captação ética de contatos.', icon: '⚖️', recommendedSolution: 'Site Institucional Jurídico', futurePath: '/sites' },
      { name: 'Imobiliárias & Corretores', description: 'Catálogo de imóveis com filtros dinâmicos por bairro de Bauru e integração WhatsApp.', icon: '🏠', recommendedSolution: 'Plataforma Imobiliária', futurePath: '/sites' },
      { name: 'Restaurantes & Pizzarias', description: 'Cardápios digitais interativos, pedidos sem taxas abusivas e reservas de mesas.', icon: '🍽️', recommendedSolution: 'Cardápio Digital + Delivery', futurePath: '/sites-prontos' },
      { name: 'Lojas & Varejo Local', description: 'Catálogo virtual com vitrine de produtos e pedidos organizados no balcão ou entrega.', icon: '🛍️', recommendedSolution: 'Loja Virtual com PIX', futurePath: '/lojas-virtuais' },
      { name: 'Salões de Beleza & Barbearias', description: 'Exibição de serviços, galeria de trabalhos e agendamento prático para clientes.', icon: '✂️', recommendedSolution: 'Site com Agendamento Online', futurePath: '/sites-prontos' },
      { name: 'Oficinas Mecânicas & Auto Centers', description: 'Solicitação de orçamentos rápidos de manutenção e acompanhamento de ordens de serviço.', icon: '🔧', recommendedSolution: 'Site de Serviços Automotivos', futurePath: '/sites-prontos' },
      { name: 'Empresas B2B & Indústrias', description: 'Apresentação técnica de produtos industriais, catálogos em PDF e cotações corporativas.', icon: '🏭', recommendedSolution: 'Portal Corporativo B2B', futurePath: '/sites' },
      { name: 'Academias & Studios', description: 'Apresentação de modalidades, grade de aulas e captação de matrículas no WhatsApp.', icon: '💪', recommendedSolution: 'Landing Page de Matrículas', futurePath: '/landing-pages' },
      { name: 'Pet Shops & Veterinárias', description: 'Agendamento de banho e tosa, consultas e exibição de produtos para pets.', icon: '🐾', recommendedSolution: 'Site de Serviços Pet', futurePath: '/sites' },
      { name: 'Prestadores de Serviços', description: 'Páginas comerciais focadas em orçamento rápido para eletricistas, encanadores, consultores e técnicos.', icon: '⚡', recommendedSolution: 'Página de Serviços Profissionais', futurePath: '/sites-prontos' },
      { name: 'Profissionais Liberais', description: 'Presença digital pessoal de alto impacto para arquitetos, psicólogos, nutricionistas e consultores.', icon: '💼', recommendedSolution: 'Site Pessoal de Autoridade', futurePath: '/sites' },
    ],
    differentialsTitle: 'Por que Empresas de Bauru Escolhem a Nextia?',
    differentialsSubtitle: 'Diferenciais concretos construídos para gerar resultados práticos e duradouros:',
    differentials: [
      {
        title: 'Múltiplas Soluções em um Só Parceiro',
        description: 'Você não precisa contratar uma agência para o site, outra empresa para o suporte de TI e um terceiro para o WhatsApp. A Nextia integra tudo em um só lugar.',
        iconName: 'layers',
      },
      {
        title: 'Projetos Sob Medida para a sua Realidade',
        description: 'Não impomos ferramentas genéricas ou complicadas. Analisamos os desafios do seu modelo de negócio em Bauru e entregamos soluções objetivas.',
        iconName: 'sliders',
      },
      {
        title: 'Tecnologia Moderna, Rápida e Segura',
        description: 'Desenvolvemos com código limpo e moderno (React, Node.js, PostgreSQL e Cloud), garantindo carregamento instantâneo e alta segurança.',
        iconName: 'zap',
      },
      {
        title: 'Atendimento Próximo e Direto',
        description: 'Sem burocracias de grandes corporações. Você fala diretamente com especialistas técnicos e comerciais comprometidos com o seu cronograma.',
        iconName: 'message-circle',
      },
      {
        title: 'Foco em Conversão e Vendas Reais',
        description: 'Não criamos apenas páginas bonitas. Estruturamos caminhos de navegação claros para transformar visitantes em contatos no WhatsApp e no e-mail.',
        iconName: 'trending-up',
      },
      {
        title: 'Possibilidade de Evolução Contínua',
        description: 'Sua empresa pode começar com um site profissional ou chatbot e, conforme expandir, adicionar novos módulos de sistema, suporte ou automações.',
        iconName: 'refresh-cw',
      },
    ],
    nextia360: {
      title: 'Nextia 360: Uma Estrutura Digital Completa para sua Empresa',
      subtitle: 'Conecte sua presença online, atendimento, sistemas e suporte em um ecossistema unificado.',
      description: 'O conceito Nextia 360 foi desenhado para empresas que desejam uma solução de ponta a ponta. Você pode começar por um único serviço — como um site novo ou automação de WhatsApp — e ir acoplando novos módulos conforme seu negócio cresce.',
      modules: [
        { name: 'Site Profissional', desc: 'Sua vitrine moderna e indexável no Google', icon: '🌐' },
        { name: 'WhatsApp & IA', desc: 'Atendimento inteligente e qualificação 24/7', icon: '🤖' },
        { name: 'Sistemas Web', desc: 'Gestão e processos organizados em nuvem', icon: '💻' },
        { name: 'Suporte TechCare', desc: 'Segurança, prevenção e apoio técnico', icon: '🛡️' },
        { name: 'Automação & APIs', desc: 'Integrações fluidas sem retrabalho manual', icon: '⚡' },
        { name: 'Hospedagem & SEO', desc: 'Infraestrutura veloz e boas práticas de busca', icon: '🚀' },
      ],
      ctaText: 'Conhecer a estrutura Nextia 360',
    },
    howItWorks: [
      {
        step: '01',
        title: 'Entendimento da Necessidade',
        description: 'Conversamos sobre o seu negócio em Bauru, seus objetivos comerciais, desafios operacionais e público-alvo.',
      },
      {
        step: '02',
        title: 'Análise e Recomendação',
        description: 'Apresentamos a solução mais adequada — seja um site pronto, projeto sob medida, automação de WhatsApp ou suporte de TI.',
      },
      {
        step: '03',
        title: 'Proposta Transparente',
        description: 'Definição clara de escopo, prazos, investimento e cronograma, sem cobranças surpresas ou letras miúdas.',
      },
      {
        step: '04',
        title: 'Desenvolvimento e Configuração',
        description: 'Nossa equipe implementa o projeto seguindo rigorosos padrões de design, responsividade, velocidade e segurança.',
      },
      {
        step: '05',
        title: 'Entrega e Suporte Contínuo',
        description: 'Colocamos sua solução no ar, realizamos as orientações de uso e ficamos à disposição para manutenção e evolução.',
      },
    ],
    localAttendance: {
      title: 'Tecnologia e Atendimento para Empresas de Bauru e Região',
      subtitle: 'Atendimento consultivo e suporte ágil para o interior de São Paulo.',
      description: 'A Nextia atende empresários, gestores e profissionais liberais de Bauru que buscam profissionalizar sua operação. Seja por atendimento remoto ágil ou suporte técnico corporativo, estamos prontos para impulsionar a tecnologia da sua empresa.',
      points: [
        'Atendimento comercial e técnico direto pelo WhatsApp: (14) 99640-5496',
        'Projetos digitais entregues com acompanhamento detalhado em todas as etapas',
        'Contratos transparentes emitidos sob o CNPJ oficial 57.285.901/0001-94',
        'Suporte técnico remoto e consultoria para empresas da região Centro-Oeste Paulista',
      ],
      notice: 'Atendimento digitalizado para agilidade no dia a dia, com suporte técnico especializado e canal direto de comunicação.',
    },
    intermediateCta: {
      title: 'Não tem certeza de qual solução sua empresa em Bauru precisa agora?',
      subtitle: 'Conte resumidamente o que você deseja melhorar na sua empresa (vendas, atendimento ou rotina de TI) e nossos especialistas indicarão o melhor caminho.',
      primaryCta: 'Falar com especialista',
      whatsappCta: 'Chamar no WhatsApp',
    },
    templatesTitle: 'Veja Modelos de Sites Profissionais Prontos para Uso',
    templatesSubtitle: 'Estruturas visuais testadas que personalizamos com a identidade, cores, fotos e textos da sua marca em Bauru:',
    faqs: [
      {
        question: 'Quanto custa criar um site profissional para uma empresa em Bauru?',
        answer: 'O investimento depende do tipo de projeto, quantidade de páginas, integrações desejadas (como agendamentos, pagamentos ou WhatsApp) e se você optará por um modelo pronto personalizável ou um projeto 100% sob medida. Na Nextia, trabalhamos com valores claros a partir de taxas acessíveis e planos de manutenção que incluem hospedagem, suporte contínuo e SSL. Solicite um orçamento sem compromisso para receber uma proposta exata para sua necessidade.',
      },
      {
        question: 'A Nextia atende empresas localizadas em Bauru/SP?',
        answer: 'Sim! Atendemos ativamente empresas, indústrias, comércios e prestadores de serviços de Bauru e de todo o interior paulista. Nosso atendimento comercial e suporte técnico acontecem com máxima agilidade via WhatsApp, reuniões virtuais e chamados no painel, garantindo suporte rápido e direto sem burocracia.',
      },
      {
        question: 'Vocês criam lojas virtuais com integração de pagamentos e WhatsApp em Bauru?',
        answer: 'Sim. Desenvolvemos lojas virtuais completas com catálogo de produtos, cálculo de frete, pagamento seguro e transparente via PIX e cartão de crédito, além de botão direto para atendimento e finalização de compras pelo WhatsApp, ideal para comércios locais e regionais.',
      },
      {
        question: 'É possível integrar o site da minha empresa ao WhatsApp?',
        answer: 'Com certeza. Todos os nossos sites contam com botões flutuantes e chamadas de ação que direcionam o visitante diretamente para o WhatsApp da sua equipe com mensagens pré-configuradas. Além disso, oferecemos soluções avançadas de automação com inteligência artificial para atendimento automático.',
      },
      {
        question: 'A Nextia desenvolve sistemas e softwares empresariais personalizados?',
        answer: 'Sim. Quando sua empresa em Bauru precisa de rotinas que sistemas prontos de prateleira não atendem com perfeição, desenvolvemos plataformas web sob medida, painéis administrativos, portais de clientes e dashboards integrados ao seu banco de dados.',
      },
      {
        question: 'Como funciona o WhatsApp com Inteligência Artificial da Nextia?',
        answer: 'Configuramos um assistente virtual inteligente com a base de conhecimento da sua empresa (serviços, preços, horários, localização, perguntas frequentes). Ele atende os clientes instantaneamente 24 horas por dia, qualifica o interesse e, caso necessário, transfere o atendimento para um colaborador humano da sua equipe.',
      },
      {
        question: 'A Nextia também oferece suporte técnico e manutenção de TI para empresas?',
        answer: 'Sim. Através do Nextia TechCare, fornecemos suporte de TI para computadores, redes Wi-Fi, rotinas de backup em nuvem e suporte técnico remoto contínuo, permitindo que sua equipe trabalhe sem interrupções por falhas de equipamentos ou segurança.',
      },
      {
        question: 'Meu novo site vai aparecer nas buscas do Google em Bauru?',
        answer: 'Nossos sites são construídos seguindo as melhores práticas técnicas de SEO (Search Engine Optimization): código semântico, carregamento rápido, meta tags corretas, sitemap XML e dados estruturados Schema.org. Isso cria a base ideal para que o Google indexe e posicione sua empresa para buscas de clientes em Bauru e região. É importante ressaltar que nenhuma empresa séria pode garantir a primeira posição fixa no Google, mas a Nextia entrega todas as otimizações técnicas recomendadas para maximizar sua visibilidade.',
      },
      {
        question: 'Vocês realizam otimização para SEO Local em Bauru?',
        answer: 'Sim. Estruturamos os textos, títulos, tags de geolocalização e schema markup para associar os serviços da sua empresa à cidade de Bauru/SP, facilitando que pessoas que pesquisem termos como "criação de sites em Bauru" ou "serviços em Bauru" encontrem sua empresa com facilidade.',
      },
    ],
    finalCta: {
      title: 'Sua empresa em Bauru está pronta para usar a tecnologia para crescer?',
      subtitle: 'Fale com a Nextia hoje mesmo e descubra como um site profissional, automação inteligente e suporte de TI de confiança podem transformar a operação e as vendas do seu negócio.',
      primaryCta: 'Solicitar orçamento gratuito',
      whatsappCta: 'Conversar no WhatsApp',
    },
  },

  marilia: {
    slug: 'marilia',
    name: 'Marília',
    state: 'SP',
    stateFullName: 'São Paulo',
    region: 'Centro-Oeste Paulista',
    areaServed: 'Marília, SP, Brasil',
    leadSource: 'pagina_marilia',
    metaTitle: 'Criação de Sites e Soluções de TI em Marília | Nextia',
    metaDescription: 'Criação de sites modernos, sistemas, automação no WhatsApp com IA e suporte de TI para empresas de Marília/SP. Conheça as soluções da Nextia.',
    keywords: [
      'criação de sites em Marília',
      'empresa de criação de sites em Marília',
      'desenvolvimento de sites Marília',
      'empresa de tecnologia Marília',
      'suporte de TI Marília',
      'loja virtual Marília',
      'sistemas empresariais Marília',
      'automação empresarial Marília',
      'WhatsApp com IA Marília',
      'agência web Marília',
      'SEO Marília',
      'desenvolvimento web Marília',
    ],
    hero: {
      badge: 'Presença Digital & Tecnologia para Empresas de Marília e Região',
      h1Prefix: 'Criação de Sites e ',
      h1Highlight: 'Tecnologia Estratégica',
      h1Suffix: ' em Marília',
      subtitle: 'Desenvolvemos sites de alta conversão, lojas virtuais, sistemas corporativos e atendimento automático com IA para empresas de Marília que buscam crescer, vender mais e modernizar suas rotinas.',
      ctaPrimaryText: 'Solicitar orçamento',
      ctaPrimaryAnchor: '#formulario-orcamento',
      whatsappMessage: 'Olá! Vi a página da Nextia para Marília e gostaria de saber mais sobre as soluções de tecnologia para minha empresa.',
      highlights: [
        'Sites corporativos rápidos e adaptados para dispositivos móveis',
        'Atendimento inteligente 24/7 no WhatsApp com IA',
        'Sistemas personalizados e integração de dados',
        'Suporte de TI e segurança para empresas em Marília',
      ],
    },
    overview: {
      title: 'Impulsione a Presença Digital e a Eficiência da sua Empresa em Marília',
      subtitle: 'Tecnologia sólida e soluções completas para o setor de comércio, indústria de alimentos, saúde e prestação de serviços de Marília.',
      paragraph1: 'Marília é reconhecida como um dos principais polos industriais, educacionais e comerciais do interior de São Paulo, destacando-se pela força de suas indústrias, comércio consolidado e forte setor de saúde e tecnologia. Para empresas locais que desejam expandir sua carteira de clientes e otimizar custos operacionais, contar com uma infraestrutura digital robusta é fundamental.',
      paragraph2: 'A Nextia oferece a empresas de Marília soluções integradas de desenvolvimento web, comércio eletrônico, automação de atendimento no WhatsApp e suporte técnico TechCare, garantindo que seu negócio tenha a estabilidade e a modernidade necessárias para se destacar no mercado regional.',
    },
    problemSolution: {
      title: 'Processos manuais e sites desatualizados estão limitando sua empresa em Marília?',
      subtitle: 'Veja como a tecnologia adequada transforma os desafios diários da sua operação em resultados práticos:',
      problemsTitle: 'Obstáculos Operacionais Frequentes',
      problems: [
        {
          title: 'Presença digital fraca ou sem conversão',
          desc: 'Clientes pesquisam por serviços em Marília no celular e encontram páginas lentas ou empresas concorrentes mais bem posicionadas.',
        },
        {
          title: 'Equipe sobrecarregada com mensagens repetidas',
          desc: 'Horas perdidas no WhatsApp respondendo as mesmas dúvidas sobre preços, prazos, cardápios ou endereços.',
        },
        {
          title: 'Falta de integração entre vendas e operação',
          desc: 'Pedidos anotados manualmente, controles descentralizados e riscos de erros na gestão do dia a dia.',
        },
        {
          title: 'Insegurança com computadores e dados',
          desc: 'Ausência de rotinas de backup automático e suporte de TI não estruturado que expõe a empresa a riscos.',
        },
      ],
      solutionsTitle: 'A Solução Nextia para sua Empresa em Marília',
      solutions: [
        {
          title: 'Sites modernos e persuasivos focados em resultados',
          desc: 'Páginas institucionais velozes, com design profissional e botões estratégicos que facilitam a captação direta de clientes.',
        },
        {
          title: 'Automação e robôs inteligentes no WhatsApp',
          desc: 'Atendimento instantâneo 24 horas por dia com respostas personalizadas sobre sua empresa e triagem automática de contatos.',
        },
        {
          title: 'Sistemas e painéis administrativos personalizados',
          desc: 'Controle de processos, pedidos e clientes em um software web acessível de qualquer dispositivo com segurança.',
        },
        {
          title: 'Suporte de TI e proteção TechCare',
          desc: 'Apoio técnico contínuo, manutenção preventiva e rotinas de backup criptografado para proteger seus dados importantes.',
        },
      ],
    },
    solutions: [
      {
        id: 'sites',
        title: 'Criação de Sites em Marília',
        tagline: 'Sites velozes, responsivos e preparados para converter visitantes',
        description: 'Desenvolvemos sites institucionais e páginas comerciais sob medida para empresas e profissionais de Marília. Foco total em usabilidade, velocidade de carregamento e atração de clientes qualificados.',
        benefits: [
          'Design visual exclusivo e alinhado à sua marca',
          'Carregamento ultra-rápido no celular e no computador',
          'Otimização semântica de SEO para buscas em Marília',
          'Integração direta com WhatsApp e formulários de contato',
        ],
        ctaText: 'Criar meu site em Marília',
        ctaLink: '/marilia/criacao-de-sites',
        iconName: 'code',
        accentColor: '#2563FF',
        softBg: '#EEF4FF',
        highlightBadge: 'Destaque',
      },
      {
        id: 'lojas-virtuais',
        title: 'Lojas Virtuais para Empresas de Marília',
        tagline: 'Expanda suas vendas para além do ponto físico',
        description: 'Estruturação de e-commerce com catálogo de produtos intuitivo, checkout transparente com PIX e cartão, cálculo de frete automático e gestão simplificada de pedidos.',
        benefits: [
          'Catálogo organizado com variações de cores e tamanhos',
          'Recebimento seguro com PIX e cartão de crédito',
          'Cálculo dinâmico de frete via Correios e transportadoras',
          'Avisos de novas compras enviados direto no WhatsApp',
        ],
        ctaText: 'Conhecer loja virtual em Marília',
        ctaLink: '/marilia/loja-virtual',
        iconName: 'shopping-bag',
        accentColor: '#9147FF',
        softBg: '#F6EFFF',
      },
      {
        id: 'whatsapp-ia',
        title: 'WhatsApp com IA em Marília',
        tagline: 'Atendimento automatizado que não deixa nenhum cliente esperando',
        description: 'Implantação de agentes com inteligência artificial para o WhatsApp da sua empresa. Atenda dúvidas, envie informações de produtos, agende serviços e qualifique leads 24 horas por dia.',
        benefits: [
          'Respostas automáticas inteligentes treinadas com seus dados',
          'Redução drástica no tempo de primeira resposta ao cliente',
          'Transição transparente e automática para atendentes humanos',
          'Painel de controle com histórico e relatórios de contatos',
        ],
        ctaText: 'Automatizar meu WhatsApp em Marília',
        ctaLink: '/marilia/whatsapp-ia',
        iconName: 'bot',
        accentColor: '#10B981',
        softBg: '#ECFDF5',
        highlightBadge: 'IA 24/7',
      },
      {
        id: 'sistemas',
        title: 'Sistemas Empresariais Personalizados',
        tagline: 'Softwares sob demanda para a rotina da sua empresa',
        description: 'Desenvolvimento de sistemas web sob medida para empresas de Marília que necessitam integrar setores, organizar ordens de serviço, gerenciar cadastros e acompanhar métricas.',
        benefits: [
          'Plataforma 100% web acessível de qualquer lugar',
          'Telas e fluxos desenhados para a realidade da sua equipe',
          'Módulos de relatórios, dashboards e gráficos de desempenho',
          'Segurança de dados e backups programados em nuvem',
        ],
        ctaText: 'Conhecer sistemas em Marília',
        ctaLink: '/marilia/desenvolvimento-de-sistemas',
        iconName: 'database',
        accentColor: '#6366F1',
        softBg: '#EEF2FF',
      },
      {
        id: 'suporte-ti',
        title: 'Suporte de TI & Gestão TechCare',
        tagline: 'Tranquilidade técnica para os computadores e redes da sua empresa',
        description: 'Atendimento técnico remoto e suporte de TI preventivo para empresas de Marília. Resolução ágil de chamados, suporte a redes locais, configuração de e-mails corporativos e segurança.',
        benefits: [
          'Abertura e acompanhamento ágil de chamados técnicos',
          'Manutenção preventiva para evitar paralisações de trabalho',
          'Proteção contra perda de dados com backup automatizado',
          'Planos mensais com previsibilidade de custos',
        ],
        ctaText: 'Solicitar suporte de TI em Marília',
        ctaLink: '/marilia/suporte-ti',
        iconName: 'headphones',
        accentColor: '#FF7A21',
        softBg: '#FFF2E9',
      },
      {
        id: 'automacao',
        title: 'Automação de Processos Empresariais',
        tagline: 'Menos burocracia manual, mais tempo para seu negócio faturar',
        description: 'Conectamos formulários, planilhas, sistemas internos e ferramentas de comunicação para que tarefas repetitivas sejam executadas automaticamente sem intervenção humana.',
        benefits: [
          'Automação no envio de propostas e confirmações',
          'Sincronização de leads captados no site com seu CRM',
          'Alertas automáticos para equipe de vendas e cobrança',
          'Aumento da produtividade geral dos colaboradores',
        ],
        ctaText: 'Automatizar processos em Marília',
        ctaLink: '/marilia/automacao',
        iconName: 'cpu',
        accentColor: '#13BBD4',
        softBg: '#EAFBFE',
      },
    ],
    segmentsTitle: 'Soluções Digitais para Negócios de Destaque em Marília',
    segmentsSubtitle: 'Projetamos ferramentas alinhadas às demandas específicas de cada segmento:',
    segments: [
      { name: 'Indústrias & Distribuidores', description: 'Catálogos industriais, páginas de produtos técnicos e captação de revendedores.', icon: '🏭', recommendedSolution: 'Portal Corporativo B2B', futurePath: '/sites' },
      { name: 'Clínicas & Especialidades Médicas', description: 'Transmissão de autoridade médica, apresentação de corpo clínico e agendamento.', icon: '🏥', recommendedSolution: 'Site de Saúde + Agendamento', futurePath: '/sites' },
      { name: 'Escritórios de Contabilidade', description: 'Páginas profissionais para captação de clientes PJ e envio de documentos.', icon: '📊', recommendedSolution: 'Site Contábil + Portal', futurePath: '/sites' },
      { name: 'Advocacia & Consultoria Jurídica', description: 'Posicionamento ético e sólido para escritórios de advocacia em Marília.', icon: '⚖️', recommendedSolution: 'Site Institucional Jurídico', futurePath: '/sites' },
      { name: 'Restaurantes, Bares & Gastronomia', description: 'Cardápios digitais interativos, pedidos via WhatsApp e reservas online.', icon: '🍽️', recommendedSolution: 'Cardápio Digital + Delivery', futurePath: '/sites-prontos' },
      { name: 'Imobiliárias & Loteadoras', description: 'Catálogo de imóveis e loteamentos em Marília com busca por localização.', icon: '🏠', recommendedSolution: 'Plataforma Imobiliária', futurePath: '/sites' },
      { name: 'Lojas & Comércio Varejista', description: 'Vitrine virtual para aumentar vendas presenciais e receber pedidos no WhatsApp.', icon: '🛍️', recommendedSolution: 'Loja Virtual com PIX', futurePath: '/lojas-virtuais' },
      { name: 'Centros Automotivos & Oficinas', description: 'Apresentação de serviços mecânicos, orçamentos rápidos e agendamento de revisão.', icon: '🔧', recommendedSolution: 'Site de Serviços Automotivos', futurePath: '/sites-prontos' },
      { name: 'Estética & Salões de Beleza', description: 'Apresentação de procedimentos, galeria de fotos e marcação prática de horários.', icon: '✂️', recommendedSolution: 'Site com Agendamento Online', futurePath: '/sites-prontos' },
      { name: 'Academias & Centros de Treinamento', description: 'Planos, horários de aulas e captação automática de novas matrículas.', icon: '💪', recommendedSolution: 'Landing Page de Matrículas', futurePath: '/landing-pages' },
      { name: 'Clínicas Odontológicas', description: 'Página de tratamentos estéticos e dentários com confirmação no WhatsApp.', icon: '🦷', recommendedSolution: 'Site Odontológico', futurePath: '/sites' },
      { name: 'Prestadores de Serviços Técnicos', description: 'Geração de orçamentos rápidos para climatização, redes, reformas e segurança.', icon: '⚡', recommendedSolution: 'Página de Serviços Técnicos', futurePath: '/sites-prontos' },
      { name: 'Pet Shops & Clínicas Veterinárias', description: 'Apresentação de consultas, vacinas, banho e tosa com agendamento online.', icon: '🐾', recommendedSolution: 'Site para Pet Shop', futurePath: '/sites' },
      { name: 'Consultores & Profissionais Liberais', description: 'Páginas pessoais de autoridade para consultores, psicólogos e nutricionistas.', icon: '💼', recommendedSolution: 'Site de Autoridade Pessoal', futurePath: '/sites' },
    ],
    differentialsTitle: 'Por que Escolher a Nextia para sua Empresa em Marília?',
    differentialsSubtitle: 'Compromisso técnico com entregas de alta qualidade, sem falsas promessas:',
    differentials: [
      {
        title: 'Centralização de Soluções de Tecnologia',
        description: 'Reunimos desenvolvimento web, e-commerce, automações de IA e suporte de TI em uma única parceira estratégica.',
        iconName: 'layers',
      },
      {
        title: 'Desenvolvimento com Foco Comercial',
        description: 'Criamos interfaces estruturadas para transformar visitantes em contatos reais no WhatsApp e formulários de orçamento.',
        iconName: 'trending-up',
      },
      {
        title: 'Código Moderno, Seguro e Veloz',
        description: 'Construção com tecnologias consagradas (React, Node.js e Nuvem), proporcionando velocidade extrema e alta estabilidade.',
        iconName: 'zap',
      },
      {
        title: 'Atendimento Próximo no Interior de SP',
        description: 'Comunicação fluida e ágil diretamente com os especialistas responsáveis pela execução do seu projeto.',
        iconName: 'message-circle',
      },
      {
        title: 'Projetos Escaláveis e Flexíveis',
        description: 'Sua empresa pode iniciar com um site profissional e futuramente expandir para lojas virtuais, sistemas ou automações.',
        iconName: 'refresh-cw',
      },
      {
        title: 'Transparência de Custos e Prazos',
        description: 'Contratos claros com escopo detalhado, sem taxas ocultas e com acompanhamento transparente das entregas.',
        iconName: 'shield-check',
      },
    ],
    nextia360: {
      title: 'Nextia 360: Ecossistema Tecnológico Completo em Marília',
      subtitle: 'Conecte todas as frentes digitais da sua empresa em uma única arquitetura integrada.',
      description: 'Com a Nextia 360, sua empresa em Marília conta com uma estrutura onde o site capta o cliente, a inteligência artificial faz a primeira triagem no WhatsApp, o sistema gerencia a entrega e o suporte TechCare garante a estabilidade de toda a operação.',
      modules: [
        { name: 'Site Profissional', desc: 'Presença digital veloz e otimizada para o Google', icon: '🌐' },
        { name: 'Atendimento IA', desc: 'Qualificação e suporte automático 24/7 no WhatsApp', icon: '🤖' },
        { name: 'Sistemas Web', desc: 'Controle de processos em software sob medida', icon: '💻' },
        { name: 'Suporte TechCare', desc: 'Manutenção preventiva e apoio técnico contínuo', icon: '🛡️' },
        { name: 'Automações', desc: 'Integrações inteligentes entre suas ferramentas', icon: '⚡' },
        { name: 'Infraestrutura Cloud', desc: 'Hospedagem segura com certificado SSL', icon: '🚀' },
      ],
      ctaText: 'Descobrir a estrutura Nextia 360',
    },
    howItWorks: [
      {
        step: '01',
        title: 'Diagnóstico Inicial',
        description: 'Entendemos os objetivos e os desafios da sua empresa em Marília através de uma conversa objetiva.',
      },
      {
        step: '02',
        title: 'Definição da Solução',
        description: 'Identificamos o melhor caminho técnico (site pronto, projeto sob medida, automação de WhatsApp ou suporte de TI).',
      },
      {
        step: '03',
        title: 'Proposta Comercial Clara',
        description: 'Apresentamos o investimento, prazos de entrega e escopo detalhado com total transparência.',
      },
      {
        step: '04',
        title: 'Desenvolvimento e Validação',
        description: 'Construção da solução com design moderno, responsividade e validação das funcionalidades com você.',
      },
      {
        step: '05',
        title: 'Publicação e Acompanhamento',
        description: 'Seu projeto entra em produção e passa a contar com nossa estrutura de suporte e evolução contínua.',
      },
    ],
    localAttendance: {
      title: 'Atendimento de Tecnologia para Empresas de Marília e Região',
      subtitle: 'Soluções digitais com suporte técnico e acompanhamento dedicado.',
      description: 'A Nextia apoia empresas e empreendedores de Marília que buscam fortalecer sua autoridade online e automatizar atendimentos. Com comunicação digitalizada e ágil, garantimos suporte próximo em todas as etapas.',
      points: [
        'Atendimento e suporte direto pelo WhatsApp: (14) 99640-5496',
        'Contratação formal com emissão de documentos sob o CNPJ 57.285.901/0001-94',
        'Projetos estruturados para carregar com rapidez e gerar contatos no mercado regional',
        'Suporte técnico remoto especializado e consultoria tecnológica contínua',
      ],
      notice: 'Atendimento digitalizado com canal direto e equipe dedicada para atender as demandas de empresas em Marília/SP.',
    },
    intermediateCta: {
      title: 'Quer saber qual a solução de tecnologia ideal para sua empresa em Marília?',
      subtitle: 'Compartilhe suas prioridades atuais com a equipe da Nextia e receba uma recomendação sob medida para seu momento.',
      primaryCta: 'Falar com especialista',
      whatsappCta: 'Chamar no WhatsApp',
    },
    templatesTitle: 'Modelos de Sites Profissionais Prontos para sua Empresa',
    templatesSubtitle: 'Bases visuais sofisticadas que customizamos com a identidade, serviços e dados da sua empresa em Marília:',
    faqs: [
      {
        question: 'Qual o valor para criar um site profissional em Marília?',
        answer: 'O valor varia conforme a complexidade do projeto, número de páginas e recursos especiais (como catálogo de produtos, agendamento de consultas ou integrações de WhatsApp). Na Nextia, oferecemos opções acessíveis com modelos profissionais prontos para personalização e planos de manutenção que englobam hospedagem segura, SSL e suporte contínuo. Fale conosco para receber uma estimativa sob medida.',
      },
      {
        question: 'A Nextia atende empresas sediadas em Marília/SP?',
        answer: 'Sim, atendemos ativamente empresas, indústrias, clínicas e comércios de Marília e região. Nosso formato de atendimento é digitalizado, ágil e direto pelo WhatsApp, garantindo rapidez nas reuniões de alinhamento, ajustes e suporte técnico contínuo.',
      },
      {
        question: 'Vocês desenvolvem lojas virtuais para o comércio de Marília?',
        answer: 'Sim. Criamos lojas virtuais completas com catálogo de produtos, fotos em alta resolução, cálculo automático de frete via Correios ou transportadoras, além de pagamento seguro via PIX e cartão de crédito com notificações de novos pedidos no WhatsApp.',
      },
      {
        question: 'O site desenvolvido pela Nextia pode ser integrado ao WhatsApp da minha equipe?',
        answer: 'Com certeza. Inserimos botões flutuantes de contato, links rápidos para pedidos e formulários que encaminham os dados do cliente diretamente para o WhatsApp comercial da sua empresa, facilitando o fechamento de orçamentos e vendas.',
      },
      {
        question: 'Vocês constroem sistemas web sob medida para empresas em Marília?',
        answer: 'Sim. Caso sua empresa possua fluxos operacionais específicos que não se adaptam a softwares prontos de mercado, desenvolvemos sistemas sob medida com banco de dados em nuvem, controle de permissões e relatórios gerenciais.',
      },
      {
        question: 'Como funciona a automação do WhatsApp com IA para empresas de Marília?',
        answer: 'Treinamos um robô inteligente com as informações exclusivas da sua empresa (horários, tabela de serviços, localização, dúvidas comuns). O assistente responde instantaneamente a qualquer hora do dia ou da noite, qualifica o cliente e passa o atendimento para a equipe humana quando necessário.',
      },
      {
        question: 'A Nextia presta serviços de suporte de TI e manutenção de computadores?',
        answer: 'Sim. Por meio do Nextia TechCare, fornecemos suporte técnico remoto para resolver problemas em computadores, auxílio na gestão de redes locais e rotinas automáticas de backup em nuvem para proteger os arquivos confidenciais da sua empresa.',
      },
      {
        question: 'O site da minha empresa vai aparecer no Google para buscas em Marília?',
        answer: 'Nossos projetos são estruturados com todas as boas práticas de SEO (Search Engine Optimization) recomendadas pelo Google: carregamento veloz, estrutura semântica, responsividade para smartphones e marcações de dados Schema.org. Isso cria a base técnica para que os mecanismos de busca encontrem e indexem suas páginas. Nenhuma agência séria garante a primeira posição do Google, mas a Nextia fornece a melhor infraestrutura técnica para elevar sua visibilidade orgânica.',
      },
      {
        question: 'Vocês fazem otimização para SEO Local em Marília?',
        answer: 'Sim. Estruturamos os títulos, descrições, cabeçalhos e marcações geográficas da página para reforçar a relevância da sua empresa para pesquisas realizadas por clientes que procuram produtos e serviços em Marília/SP.',
      },
    ],
    finalCta: {
      title: 'Leve a presença digital e a tecnologia da sua empresa em Marília a um novo patamar',
      subtitle: 'Entre em contato com a Nextia e conheça soluções modernas, sob medida e sem burocracia para vender mais e operar com eficiência.',
      primaryCta: 'Solicitar orçamento gratuito',
      whatsappCta: 'Conversar no WhatsApp',
    },
  },
};

export function getCityData(slug: string): CityData | null {
  const normalized = String(slug || '').toLowerCase().trim();
  return CITIES_DATA[normalized] || null;
}

export function getAllCities(): CityData[] {
  return Object.values(CITIES_DATA);
}
