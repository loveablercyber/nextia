export interface SegmentProblem {
  title: string;
  description: string;
  iconName: string;
}

export interface SegmentSolution {
  title: string;
  description: string;
  badge?: string;
  features: string[];
  iconName: string;
  relatedServiceSlug?: string;
}

export interface SegmentWorkflowStep {
  step: number;
  title: string;
  description: string;
  iconName: string;
}

export interface SegmentBeforeAfter {
  before: string;
  after: string;
  topic: string;
}

export interface SegmentFaq {
  question: string;
  answer: string;
}

export interface SegmentData {
  id: string;
  slug: string;
  name: string;
  pluralName: string;
  category: 'Financeiro & Jurídico' | 'Saúde & Bem-Estar' | 'Alimentação & Gastronomia' | 'Imobiliário' | 'Varejo & Comércio' | 'Serviços & Profissionais';
  status: 'published' | 'draft';
  badge: string;
  h1: string;
  heroSubtitle: string;
  tagline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroVisualBadge: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    bgGradient: string;
    badgeBg: string;
  };
  problemsTitle: string;
  problemsSubtitle: string;
  problems: SegmentProblem[];
  solutionsTitle: string;
  solutionsSubtitle: string;
  solutions: SegmentSolution[];
  nextia360Title: string;
  nextia360Subtitle: string;
  nextia360Pillars: {
    title: string;
    description: string;
    iconName: string;
  }[];
  workflowTitle: string;
  workflowSubtitle: string;
  workflow: SegmentWorkflowStep[];
  beforeAfterTitle: string;
  beforeAfter: SegmentBeforeAfter[];
  securitySection?: {
    title: string;
    description: string;
    items: string[];
  };
  seoSection: {
    title: string;
    description: string;
    searchExamples: string[];
  };
  templateSlugs: string[];
  faqs: SegmentFaq[];
  formServiceOptions: string[];
  whatsappMessage: string;
  relatedSegments: string[];
  cityLinks: {
    cityName: string;
    citySlug: string;
    label: string;
  }[];
}

export const SEGMENTS: Record<string, SegmentData> = {
  contabilidade: {
    id: 'seg-contabilidade',
    slug: 'contabilidade',
    name: 'Contabilidade',
    pluralName: 'Escritórios Contábeis',
    category: 'Financeiro & Jurídico',
    status: 'published',
    badge: 'Soluções Digitais para Contabilidade',
    h1: 'Tecnologia para Contabilidades Atenderem Melhor e Automatizarem Mais',
    heroSubtitle: 'Sites profissionais, automação de rotinas, WhatsApp com IA, organização de documentos e soluções digitais para modernizar escritórios contábeis.',
    tagline: 'Estrutura digital completa para escritórios de contabilidade que desejam eficiência operacional e autoridade no mercado.',
    heroCtaPrimary: 'Quero modernizar minha contabilidade',
    heroCtaSecondary: 'Ver soluções para contabilidade',
    heroVisualBadge: 'Ecossistema Contábil Integrado',
    seoTitle: 'Tecnologia para Contabilidade: Sites, WhatsApp com IA e Automação | Nextia',
    metaDescription: 'Sites profissionais, automação de processos, WhatsApp com IA e área do cliente para escritórios contábeis. Centralize sua tecnologia com a Nextia.',
    keywords: [
      'site para contabilidade',
      'site para contador',
      'criação de site para contabilidade',
      'sistema para escritório contábil',
      'automação para contabilidade',
      'WhatsApp para contabilidade',
      'chatbot para escritório contábil',
      'tecnologia para contabilidade',
      'site para escritório contábil',
      'soluções digitais para contadores',
      'automação de escritório contábil',
    ],
    colorTheme: {
      primary: '#1677FF',
      secondary: '#0B1E38',
      accent: '#35B7FF',
      bgGradient: 'from-[#07162B] via-[#0B1E38] to-[#122A4E]',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    problemsTitle: 'Sua contabilidade ainda enfrenta situações como essas?',
    problemsSubtitle: 'Escritórios contábeis lidam com alto volume de demandas repetitivas que sobrecarregam a equipe quando os canais digitais não estão integrados.',
    problems: [
      {
        title: 'Excesso de mensagens repetitivas',
        description: 'Clientes solicitando guias, certidões e holerites pelo WhatsApp o dia todo, interrompendo tarefas técnicas da equipe.',
        iconName: 'message-square',
      },
      {
        title: 'Documentos e arquivos espalhados',
        description: 'Comprovantes, extratos e arquivos enviados por múltiplos canais (WhatsApp, e-mail, pen drive) sem centralização segura.',
        iconName: 'folder-archive',
      },
      {
        title: 'Site antigo ou mero cartão de visitas',
        description: 'Um site institucional desatualizado que não transmite a real capacidade do escritório e não gera novas oportunidades de clientes.',
        iconName: 'globe',
      },
      {
        title: 'Dificuldade na triagem de novos contatos',
        description: 'Leads que entram sem informações básicas (regime tributário, faturamento, número de sócios), exigindo triagem manual demorada.',
        iconName: 'filter',
      },
      {
        title: 'Sistemas desconectados entre si',
        description: 'Ferramentas de comunicação, atendimento e armazenamento que não conversam, gerando retrabalho na rotina do escritório.',
        iconName: 'layers',
      },
      {
        title: 'Pouca diferenciação frente à concorrência',
        description: 'Dificuldade em demonstrar modernidade e agilidade para clientes PJ que buscam uma contabilidade consultiva e digital.',
        iconName: 'shield-alert',
      },
    ],
    solutionsTitle: 'Uma estrutura digital pensada para escritórios contábeis',
    solutionsSubtitle: 'A Nextia desenvolve e integra as ferramentas que seu escritório precisa para operar com produtividade, organização e atendimento rápido.',
    solutions: [
      {
        title: 'Site Profissional para Contabilidade',
        description: 'Apresentação institucional completa com serviços contábeis, tributários, trabalhistas e societários, páginas por nicho atendido e formulários de captação.',
        badge: 'Presença & Credibilidade',
        features: [
          'Apresentação clara dos serviços e diferenciais',
          'Formulário inteligente para solicitação de proposta',
          'Páginas otimizadas para busca no Google (SEO contábil)',
          'Botão direto e contextual para o WhatsApp',
          'Design 100% responsivo e alta velocidade de carregamento',
        ],
        iconName: 'globe',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'WhatsApp com IA para Triagem e Dúvidas Frequentes',
        description: 'Atendimento automatizado que identifica o assunto do cliente, responde dúvidas frequentes pré-configuradas e encaminha para o setor responsável.',
        badge: 'Atendimento Ágil',
        features: [
          'Identificação do tipo de solicitação (Fiscal, DP, Contábil, Legal)',
          'Coleta inicial de dados do cliente ou prospect',
          'Transferência transparente para atendimento humano',
          'Pausa individual da automação por conversa quando necessário',
          'Configuração segura sem respostas de cunho tributário sensível',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
      {
        title: 'Armazenamento e Organização de Documentos',
        description: 'Estrutura segura para recebimento e guarda de arquivos enviados por clientes (extratos, comprovantes, notas e XMLs).',
        badge: 'Organização Operacional',
        features: [
          'Envio criptografado de arquivos pesados',
          'Histórico e associação direta por cliente',
          'Controle de acesso e permissões individuais',
          'Backup diário e redundância em nuvem',
        ],
        iconName: 'hard-drive',
        relatedServiceSlug: 'backup',
      },
      {
        title: 'Automação de Rotinas e Notificações',
        description: 'Integração de formulários do site com canais de notificação interna e disparo de lembretes para clientes.',
        badge: 'Produtividade',
        features: [
          'Notificação imediata no WhatsApp/e-mail para novos contatos',
          'Disparo de avisos de vencimento e entrega de guias',
          'Integração com CRMs e ferramentas de atendimento',
          'Redução drástica de processos manuais repetitivos',
        ],
        iconName: 'cpu',
        relatedServiceSlug: 'automacao-ia',
      },
    ],
    nextia360Title: 'Nextia 360 para Contabilidades',
    nextia360Subtitle: 'Em vez de contratar ferramentas isoladas de vários fornecedores, sua contabilidade centraliza a infraestrutura tecnológica com a Nextia.',
    nextia360Pillars: [
      { title: 'Site Profissional', description: 'Autoridade e captação de clientes empresariais no Google.', iconName: 'globe' },
      { title: 'WhatsApp com IA', description: 'Triagem rápida e respostas para dúvidas frequentes da rotina.', iconName: 'bot' },
      { title: 'Armazenamento em Nuvem', description: 'Organização segura de documentos e arquivos contábeis.', iconName: 'hard-drive' },
      { title: 'Automação de Processos', description: 'Conexão entre formulários, notificações e rotinas internas.', iconName: 'cpu' },
      { title: 'SEO Especializado', description: 'Visibilidade para termos contábeis e buscas da sua região.', iconName: 'search' },
      { title: 'Suporte de TI & Redes', description: 'Computadores rápidos, rede Wi-Fi estável e proteção da infraestrutura.', iconName: 'shield-check' },
    ],
    workflowTitle: 'Como funciona a jornada digital da sua contabilidade',
    workflowSubtitle: 'Da primeira pesquisa no Google até o atendimento contínuo do cliente, cada etapa é estruturada com tecnologia.',
    workflow: [
      {
        step: 1,
        title: 'Empresa pesquisa no Google',
        description: 'O empresário busca por "escritório de contabilidade", "abertura de empresa" ou "contador na cidade" e encontra seu site.',
        iconName: 'search',
      },
      {
        step: 2,
        title: 'Acesso e entendimento dos serviços',
        description: 'O visitante navega pelo site da sua contabilidade, conhece as especialidades do escritório e solicita uma proposta.',
        iconName: 'layout',
      },
      {
        step: 3,
        title: 'Triagem inteligente no WhatsApp',
        description: 'O WhatsApp identifica o regime tributário, faturamento estimado e necessidade inicial (abertura, troca de contador ou consultoria).',
        iconName: 'bot',
      },
      {
        step: 4,
        title: 'Atendimento humano especializado',
        description: 'O sócio ou consultor contábil recebe o contato qualificado com todos os dados prontos para fechar o contrato.',
        iconName: 'user-check',
      },
      {
        step: 5,
        title: 'Organização e envio de documentos',
        description: 'O cliente envia arquivos e comprovantes em ambiente seguro e organizado, mantendo a rotina do escritório sob controle.',
        iconName: 'file-check',
      },
    ],
    beforeAfterTitle: 'Comparativo: A rotina da sua contabilidade com a Nextia',
    beforeAfter: [
      {
        topic: 'Atendimento Inicial',
        before: 'WhatsApp pessoal cheio de mensagens repetidas sem triagem de assunto.',
        after: 'Canal oficial com triagem por setor e direcionamento automático dos clientes.',
      },
      {
        topic: 'Captação de Novos Clientes',
        before: 'Dependência exclusiva de indicação boca a boca com site defasado.',
        after: 'Site moderno, otimizado para o Google e com formulário estruturado de proposta.',
      },
      {
        topic: 'Gestão de Arquivos',
        before: 'Comprovantes e extratos perdidos em conversas de chat e e-mails soltos.',
        after: 'Estrutura organizada e armazenamento com backup diário e controle.',
      },
      {
        topic: 'Infraestrutura Tecnológica',
        before: 'Sistemas lentos, quedas de internet e vários fornecedores desconectados.',
        after: 'Parceiro único para site, IA, automação, suporte de TI e segurança de dados.',
      },
    ],
    securitySection: {
      title: 'Segurança, Privacidade e Boas Práticas',
      description: 'Escritórios contábeis lidam diariamente com informações fiscais, bancárias e dados sensíveis de empresas e sócios. Desenvolvemos com conformidade e rigor.',
      items: [
        'Criptografia HTTPS/SSL em todas as páginas e formulários',
        'Boas práticas de proteção de dados alinhadas à LGPD',
        'Controle de acesso por permissões e autenticação segura',
        'Rotinas de backup automatizado para arquivos e bancos de dados',
        'Isolamento de redes Wi-Fi entre equipe interna e visitantes',
      ],
    },
    seoSection: {
      title: 'SEO e Presença no Google para Contabilidades',
      description: 'Sua presença digital é configurada para que empresários e profissionais da sua área de atuação encontrem seu escritório ao pesquisar por serviços contábeis.',
      searchExamples: [
        'escritório de contabilidade na região',
        'abertura de empresa e planejamento tributário',
        'troca de contador para empresas do Simples / Lucro Presumido',
        'contabilidade para médicos e clínicas',
        'serviços de assessoria fiscal e trabalhista',
      ],
    },
    templateSlugs: ['contabilidade', 'servicos-profissionais'],
    faqs: [
      {
        question: 'A Nextia cria sites exclusivos para escritórios de contabilidade?',
        answer: 'Sim. Desenvolvemos sites profissionais estruturados especificamente para contabilidades, com apresentação detalhada de serviços fiscais, societários, contábeis e de departamento pessoal, além de páginas por segmento atendido e formulários para captação de clientes.',
      },
      {
        question: 'Como o WhatsApp com IA pode ajudar meu escritório contábil?',
        answer: 'A automação pode realizar a triagem inicial do contato, identificar se a pessoa é cliente ativo ou novo prospect, coletar dados iniciais (regime, número de funcionários) e direcionar para o departamento correto (Fiscal, DP, Contábil, Legal). Para conversas complexas, o atendimento humano assume a qualquer momento.',
      },
      {
        question: 'A IA vai responder perguntas tributárias ou fiscais sensíveis sozinha?',
        answer: 'Não. A inteligência artificial é configurada com limites estritos para realizar triagem, tirar dúvidas de funcionamento e coletar informações. Questões fiscais, tributárias ou com exigência técnica são sempre direcionadas para os profissionais do seu escritório.',
      },
      {
        question: 'Como funciona o armazenamento seguro de documentos e XML?',
        answer: 'Disponibilizamos estrutura de armazenamento em nuvem com criptografia e backup automatizado, permitindo que os arquivos enviados pelos seus clientes fiquem organizados e associados à respectiva empresa sem depender de chats soltos.',
      },
      {
        question: 'Posso contratar somente a criação do site inicialmente?',
        answer: 'Sim. A estrutura da Nextia é modular: você pode iniciar com o site profissional e posteriormente adicionar o WhatsApp com IA, automações, armazenamento ou suporte de TI conforme o crescimento do seu escritório.',
      },
      {
        question: 'O site é otimizado para o Google (SEO)?',
        answer: 'Sim. Aplicamos boas práticas completas de SEO técnico (Schema.org, Open Graph, meta tags otimizadas, sitemap XML, alta velocidade no PageSpeed e responsividade mobile) para potencializar o posicionamento do seu escritório nas buscas locais.',
      },
      {
        question: 'Vocês atendem escritórios contábeis de outras cidades e estados?',
        answer: 'Sim. Atendemos escritórios de contabilidade em todo o Brasil para soluções digitais como sites, automação de WhatsApp com IA, sistemas e armazenamento em nuvem. Serviços presenciais de infraestrutura de TI e cabeamento atendem prioritariamente o interior de São Paulo.',
      },
      {
        question: 'Existe fidelidade ou contrato de longo prazo obrigatório?',
        answer: 'Nossos planos de manutenção e hospedagem são mensais e transparentes, sem multas rescisórias abusivas. Você mantém o controle da sua presença digital.',
      },
    ],
    formServiceOptions: [
      'Site Profissional para Contabilidade',
      'WhatsApp com IA para Atendimento e Triagem',
      'Organização de Documentos e Armazenamento',
      'Automação de Rotinas e Notificações',
      'Nextia 360 (Solução Completa)',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para escritórios de contabilidade e gostaria de conhecer as opções para meu escritório.',
    relatedSegments: ['advocacia', 'clinicas', 'imobiliarias', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Contabilidades em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Contabilidades em Marília / SP' },
    ],
  },

  pizzarias: {
    id: 'seg-pizzarias',
    slug: 'pizzarias',
    name: 'Pizzarias',
    pluralName: 'Pizzarias & Delivery',
    category: 'Alimentação & Gastronomia',
    status: 'published',
    badge: 'Soluções Digitais para Pizzarias & Delivery',
    h1: 'Tecnologia para Pizzarias Venderem Mais com Cardápio Próprio e WhatsApp',
    heroSubtitle: 'Cardápios digitais interativos, pedidos automáticos no WhatsApp, divulgação de sabores e promoções sem depender exclusivamente de taxas de marketplace.',
    tagline: 'Estrutura completa para pizzarias aumentarem os pedidos diretos, fidelizarem clientes e acelerarem o atendimento do balcão e delivery.',
    heroCtaPrimary: 'Quero modernizar minha pizzaria',
    heroCtaSecondary: 'Ver soluções para pizzarias',
    heroVisualBadge: 'Pedidos Diretos & Cardápio Próprio',
    seoTitle: 'Tecnologia para Pizzarias: Cardápio Digital e Pedidos no WhatsApp | Nextia',
    metaDescription: 'Cardápio digital interativo, automação de pedidos pelo WhatsApp e site para pizzarias e delivery. Reduza taxas e atenda mais rápido com a Nextia.',
    keywords: [
      'site para pizzaria',
      'cardápio digital para pizzaria',
      'sistema de pedidos para pizzaria',
      'WhatsApp para pizzaria',
      'cardápio online para delivery',
      'automação de pedidos de pizza',
      'site com cardápio para pizzaria',
    ],
    colorTheme: {
      primary: '#FF6B00',
      secondary: '#1A0E05',
      accent: '#FFA34D',
      bgGradient: 'from-[#1A0E05] via-[#2D1606] to-[#120803]',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    problemsTitle: 'Sua pizzaria enfrenta desafios como estes na rotina de pedidos?',
    problemsSubtitle: 'No horário de pico, a lentidão no atendimento e as altas taxas de aplicativos reduzem a margem de lucro e frustram clientes com fome.',
    problems: [
      {
        title: 'Atendimento manual lento no WhatsApp',
        description: 'Várias mensagens simultâneas na sexta e no sábado à noite, com clientes esperando minutos para receber o cardápio e fechar o pedido.',
        iconName: 'clock',
      },
      {
        title: 'Altas taxas de comissão em marketplaces',
        description: 'De 15% a 27% do faturamento de cada pizza fica retido em aplicativos terceiros, corroendo a lucratividade do seu negócio.',
        iconName: 'percent',
      },
      {
        title: 'Cardápio em foto ilegível no chat',
        description: 'Enviar fotos pesadas de cardápio que o cliente tem dificuldade para ler no celular, gerando dúvidas sobre sabores e bordas.',
        iconName: 'file-text',
      },
      {
        title: 'Falta de cadastro próprio de clientes',
        description: 'Sem histórico de quem pede com frequência para disparar promoções, ofertas de dias fracos e cupons de fidelidade.',
        iconName: 'users',
      },
    ],
    solutionsTitle: 'Soluções pensadas para a velocidade do delivery de pizza',
    solutionsSubtitle: 'Aumente as vendas diretas e ofereça uma experiência de pedido moderna e sem atritos para seus clientes.',
    solutions: [
      {
        title: 'Cardápio Digital Interativo',
        description: 'Cardápio moderno, rápido e fácil de navegar no celular, com divisão por tamanhos, massas, bordas recheadas e combos.',
        badge: 'Cardápio Próprio',
        features: [
          'Fotos em alta definição de pizzas e bebidas',
          'Seleção de sabores meio a meio e adicionais',
          'Cálculo automático do valor e taxa de entrega',
          'Carregamento instantâneo no celular do cliente',
        ],
        iconName: 'utensils',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Automação de Atendimento no WhatsApp',
        description: 'Atendimento imediato que envia o link do cardápio, responde horários de funcionamento e tira dúvidas dos clientes 24h por dia.',
        badge: 'Zero Fila de Espera',
        features: [
          'Resposta automática instantânea nos horários de pico',
          'Envio do link do cardápio digital em 1 segundo',
          'Informações sobre taxa de entrega, formas de pagamento e localização',
          'Transição direta para atendimento humano quando solicitado',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
      {
        title: 'Site Institucional e Localização',
        description: 'Página profissional da pizzaria para fortalecer sua marca, exibir o salão, fotos do forno e atrair clientes que buscam no Google.',
        badge: 'Visibilidade Local',
        features: [
          'Página otimizada para "pizzaria perto de mim" e "delivery de pizza"',
          'Mapa integrado com endereço do salão e área de entrega',
          'Horários de funcionamento sempre atualizados',
          'Botão para reservas de mesa e pedidos diretos',
        ],
        iconName: 'globe',
        relatedServiceSlug: 'sites-prontos',
      },
    ],
    nextia360Title: 'Nextia 360 para Pizzarias',
    nextia360Subtitle: 'Uma operação gastronômica moderna combina atendimento ágil, presença digital forte e infraestrutura de rede estável no salão.',
    nextia360Pillars: [
      { title: 'Cardápio Digital', description: 'Visual impecável de pizzas, bordas e bebidas.', iconName: 'utensils' },
      { title: 'WhatsApp Ágil', description: 'Envio automático de cardápio e triagem de pedidos.', iconName: 'bot' },
      { title: 'Site Local', description: 'Visibilidade máxima nas buscas do Google na sua cidade.', iconName: 'search' },
      { title: 'Wi-Fi para Clientes', description: 'Rede sem fio rápida para os clientes do salão sem travar o caixa.', iconName: 'wifi' },
      { title: 'Câmeras de Segurança', description: 'Monitoramento do forno, estoque e salão de atendimento.', iconName: 'camera' },
    ],
    workflowTitle: 'Como seu cliente pede uma pizza com a Nextia',
    workflowSubtitle: 'Uma jornada rápida que transforma contatos no WhatsApp em pedidos fechados em menos de 2 minutos.',
    workflow: [
      {
        step: 1,
        title: 'Cliente chama no WhatsApp',
        description: 'O cliente envia mensagem querendo ver o cardápio ou fazer um pedido de pizza.',
        iconName: 'message-circle',
      },
      {
        step: 2,
        title: 'Cardápio enviado em segundos',
        description: 'A automação envia o link do cardápio digital interativo com fotos e sabores.',
        iconName: 'smartphone',
      },
      {
        step: 3,
        title: 'Escolha de sabores e bordas',
        description: 'O cliente monta sua pizza (meio a meio, borda recheada, refrigerante) com valores calculados.',
        iconName: 'utensils',
      },
      {
        step: 4,
        title: 'Pedido chega estruturado',
        description: 'A equipe da pizzaria recebe o pedido pronto para produção, com endereço e forma de pagamento.',
        iconName: 'check-circle-2',
      },
    ],
    beforeAfterTitle: 'Comparativo: Sua pizzaria antes e depois da Nextia',
    beforeAfter: [
      {
        topic: 'Taxas de Delivery',
        before: 'Margem de lucro corroída por comissões altas em apps de terceiros.',
        after: 'Canal próprio de pedidos sem cobrança de comissão percentual por pizza.',
      },
      {
        topic: 'Tempo de Atendimento',
        before: 'Clientes esperando minutos para receber o cardápio na sexta à noite.',
        after: 'Resposta em menos de 3 segundos com cardápio interativo e atualizado.',
      },
      {
        topic: 'Apresentação do Cardápio',
        before: 'Fotos de cardápio cortadas e mensagens longas de texto difíceis de ler.',
        after: 'Cardápio visual moderno com fotos, descrições e opção de personalizar.',
      },
    ],
    seoSection: {
      title: 'Presença no Google para Pizzarias e Delivery',
      description: 'Estruturamos seu site para que clientes que buscam por pizzas na sua cidade e bairro encontrem seu negócio diretamente.',
      searchExamples: [
        'pizzaria delivery na cidade',
        'melhor pizza de fermentação natural',
        'pizzaria com salão e espaço família',
        'pedir pizza pelo WhatsApp',
      ],
    },
    templateSlugs: ['restaurante-premium'],
    faqs: [
      {
        question: 'A Nextia cobra comissão ou porcentagem por cada pizza vendida?',
        answer: 'Não. Não cobramos comissões sobre suas vendas. Nossos planos são mensais com valor fixo para manutenção da sua estrutura digital.',
      },
      {
        question: 'O cardápio digital funciona bem no celular dos clientes?',
        answer: 'Sim. Nossos cardápios são desenvolvidos com tecnologia mobile-first, sendo ultrarrápidos e intuitivos mesmo em conexões 4G.',
      },
      {
        question: 'Posso alterar preços, sabores e promoções quando quiser?',
        answer: 'Sim. Você conta com facilidade para atualizar o cardápio ou solicitar ajustes rápidos para nossa equipe de suporte.',
      },
      {
        question: 'O cliente precisa baixar algum aplicativo para ver o cardápio?',
        answer: 'Não. O cardápio abre instantaneamente no navegador do celular através do link enviado no WhatsApp, sem downloads.',
      },
    ],
    formServiceOptions: [
      'Cardápio Digital para Pizzaria',
      'Automação de Pedidos no WhatsApp',
      'Site Profissional para Pizzaria',
      'Nextia 360 para Alimentação',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para pizzarias e delivery e gostaria de mais informações para minha pizzaria.',
    relatedSegments: ['restaurantes', 'lojas', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Pizzarias em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Pizzarias em Marília / SP' },
    ],
  },

  advocacia: {
    id: 'seg-advocacia',
    slug: 'advocacia',
    name: 'Advocacia',
    pluralName: 'Escritórios de Advocacia',
    category: 'Financeiro & Jurídico',
    status: 'published',
    badge: 'Presença Digital Ética para Advocacia',
    h1: 'Tecnologia e Presença Digital para Escritórios de Advocacia',
    heroSubtitle: 'Sites sofisticados, apresentação ética de áreas de atuação, agendamento de consultas e automação de triagem em estrita conformidade com o Código de Ética da OAB.',
    tagline: 'Posicione seu escritório de advocacia com autoridade, sobriedade e agilidade no primeiro atendimento de clientes.',
    heroCtaPrimary: 'Quero modernizar meu escritório jurídico',
    heroCtaSecondary: 'Ver soluções para advocacia',
    heroVisualBadge: 'Conformidade Ética OAB & Autoridade',
    seoTitle: 'Tecnologia para Advocacia: Sites e Presença Digital para Advogados | Nextia',
    metaDescription: 'Sites sofisticados para escritórios de advocacia, apresentação de áreas de atuação e triagem de clientes em conformidade com as normas da OAB.',
    keywords: [
      'site para advogado',
      'site para escritório de advocacia',
      'criação de site para advogados',
      'marketing jurídico ético',
      'presença digital advocacia',
      'site jurídico profissional',
    ],
    colorTheme: {
      primary: '#9E7A3B',
      secondary: '#0C121E',
      accent: '#D4AF37',
      bgGradient: 'from-[#0A0E17] via-[#101827] to-[#151F32]',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    problemsTitle: 'Desafios comuns na presença digital de escritórios de advocacia',
    problemsSubtitle: 'A advocacia moderna exige comunicação de autoridade que respeite integralmente os preceitos éticos e acolha o cliente com profissionalismo.',
    problems: [
      {
        title: 'Falta de clareza nas áreas de atuação',
        description: 'Potenciais clientes com dúvidas jurídicas têm dificuldade de saber se o escritório atende especificamente seu tipo de demanda.',
        iconName: 'scale',
      },
      {
        title: 'Primeiro contato sem triagem estruturada',
        description: 'Mensagens no WhatsApp sem informações básicas da causa, demandando tempo dos advogados para coletar dados preliminares.',
        iconName: 'help-circle',
      },
      {
        title: 'Sites genéricos ou com estética defasada',
        description: 'Páginas que não refletem a sofisticação, seriedade e reputação técnica conquistada pelo escritório no mercado.',
        iconName: 'globe',
      },
      {
        title: 'Receio de infração às normas da OAB',
        description: 'Dúvidas sobre como criar uma presença digital informativa e relevante sem incorrer em mercantilização ou captação indevida.',
        iconName: 'shield',
      },
    ],
    solutionsTitle: 'Estrutura pensada para a sobriedade da advocacia',
    solutionsSubtitle: 'Desenvolvemos soluções digitais informativas, elegantes e focadas em transmitir confiança.',
    solutions: [
      {
        title: 'Site Institucional de Alto Padrão',
        description: 'Apresentação detalhada da banca, corpo jurídico, artigos informativos e divisão clara das especialidades (Cível, Trabalhista, Tributário, Família, Empresarial).',
        badge: 'Autoridade Jurídica',
        features: [
          'Design sóbrio e elegante alinhado à identidade da banca',
          'Páginas dedicadas para cada área de atuação jurídica',
          'Área de artigos e publicações informativas para autoridade',
          'Formulário discreto para agendamento de consultas preliminares',
        ],
        iconName: 'scale',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Triagem Inicial no WhatsApp',
        description: 'Canal de atendimento que identifica o assunto da consulta, solicita dados preliminares e agenda o horário com o advogado responsável.',
        badge: 'Atendimento Organizado',
        features: [
          'Coleta do nome, cidade e área do direito de interesse',
          'Apresentação de horários e procedimentos de atendimento',
          'Encaminhamento direto para o advogado da área',
          'Comunicação polida e livre de promessas de resultado',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
      {
        title: 'Segurança da Informação e Privacidade',
        description: 'Proteção de documentos e sigilo profissional garantidos por infraestrutura moderna e criptografia.',
        badge: 'Sigilo Profissional',
        features: [
          'Criptografia HTTPS/SSL em todas as páginas',
          'Armazenamento seguro de procurações e documentos',
          'Backups corporativos em nuvem para arquivos do escritório',
        ],
        iconName: 'lock',
        relatedServiceSlug: 'backup',
      },
    ],
    nextia360Title: 'Nextia 360 para Advocacia',
    nextia360Subtitle: 'Infraestrutura completa de tecnologia para apoiar a rotina do escritório e a segurança do sigilo profissional.',
    nextia360Pillars: [
      { title: 'Site Institucional', description: 'Autoridade e apresentação clara da banca e áreas de atuação.', iconName: 'scale' },
      { title: 'Triagem no WhatsApp', description: 'Identificação prévia do tipo de causa e agendamento.', iconName: 'bot' },
      { title: 'Backup em Nuvem', description: 'Guarda segura e inviolável de peças, contratos e documentos.', iconName: 'hard-drive' },
      { title: 'Suporte de TI & Redes', description: 'Computadores rápidos e rede Wi-Fi protegida para o escritório.', iconName: 'shield-check' },
    ],
    workflowTitle: 'Fluxo ético de atendimento jurídico',
    workflowSubtitle: 'Uma jornada informativa que conecta o cliente ao advogado com respeito e organização.',
    workflow: [
      {
        step: 1,
        title: 'Pesquisa informativa no Google',
        description: 'O cliente pesquisa por artigos informativos ou especialidades jurídicas na sua região.',
        iconName: 'search',
      },
      {
        step: 2,
        title: 'Acesso ao site do escritório',
        description: 'O visitante conhece a qualificação técnica dos sócios, áreas de atuação e localização do escritório.',
        iconName: 'layout',
      },
      {
        step: 3,
        title: 'Solicitação de agendamento',
        description: 'O cliente entra em contato pelo formulário ou WhatsApp informando a área de direito de seu interesse.',
        iconName: 'calendar',
      },
      {
        step: 4,
        title: 'Consulta com o advogado',
        description: 'O profissional recebe a demanda organizada com dados preliminares para a consulta inicial.',
        iconName: 'user-check',
      },
    ],
    beforeAfterTitle: 'Comparativo: A presença digital do seu escritório',
    beforeAfter: [
      {
        topic: 'Presença Online',
        before: 'Site desatualizado sem informação sobre as áreas de atuação da banca.',
        after: 'Site sofisticado, com publicações informativas e divisão clara de especialidades.',
      },
      {
        topic: 'Primeiro Contato',
        before: 'Advogados interrompendo prazos para atender contatos sem triagem.',
        after: 'Canal de atendimento que coleta dados preliminares e agenda a consulta.',
      },
    ],
    securitySection: {
      title: 'Compromisso com as Normas da OAB e Sigilo Profissional',
      description: 'Todas as soluções para o segmento jurídico são desenvolvidas respeitando estritamente o Provimento 205/2021 do Conselho Federal da OAB e as diretrizes do Código de Ética e Disciplina.',
      items: [
        'Caráter meramente informativo e de esclarecimento técnico',
        'Proibição de promessas de resultado ou garantia de êxito',
        'Linguagem polida, séria e compatível com a dignidade da advocacia',
        'Sigilo de comunicações e proteção integral de dados do cliente',
      ],
    },
    seoSection: {
      title: 'SEO e Visibilidade Ética para Advogados',
      description: 'Otimizamos a estrutura do seu site para buscas informativas relacionadas às especialidades do escritório.',
      searchExamples: [
        'escritório de advocacia empresarial',
        'advogado especialista em direito de família',
        'assessoria jurídica para contratos civis',
        'advocacia tributária na região',
      ],
    },
    templateSlugs: ['servicos-profissionais'],
    faqs: [
      {
        question: 'O site para advogados respeita o Código de Ética da OAB?',
        answer: 'Sim, integralmente. Todo o layout, textos e chamadas são elaborados com caráter informativo, sem mercantilização, promessas de resultado ou captação indevida, em total conformidade com o Provimento 205/2021 da OAB.',
      },
      {
        question: 'É possível incluir uma área de artigos e notícias jurídicas?',
        answer: 'Sim. Estruturamos uma seção de artigos informativos para que os advogados da banca possam publicar análises e esclarecimentos, fortalecendo a autoridade técnica do escritório.',
      },
      {
        question: 'Como funciona o agendamento de consultas pelo site?',
        answer: 'O visitante pode preencher um formulário discreto ou clicar no botão de WhatsApp escolhendo a área jurídica de interesse. O escritório recebe os dados para confirmar a data e o formato da consulta.',
      },
    ],
    formServiceOptions: [
      'Site Institucional para Escritório de Advocacia',
      'Canal de Atendimento e Triagem no WhatsApp',
      'Nextia 360 para Escritórios Jurídicos',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para escritórios de advocacia e gostaria de conhecer as opções para meu escritório.',
    relatedSegments: ['contabilidade', 'clinicas', 'imobiliarias', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Advocacia em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Advocacia em Marília / SP' },
    ],
  },

  clinicas: {
    id: 'seg-clinicas',
    slug: 'clinicas',
    name: 'Clínicas',
    pluralName: 'Clínicas & Consultórios',
    category: 'Saúde & Bem-Estar',
    status: 'published',
    badge: 'Soluções Digitais para Clínicas Médicas & Consultórios',
    h1: 'Tecnologia para Clínicas e Consultórios Médicos Atenderem Melhor',
    heroSubtitle: 'Sites profissionais com apresentação do corpo clínico, especialidades, agendamento de consultas, confirmação automática no WhatsApp e conformidade de privacidade.',
    tagline: 'Modernize a comunicação da sua clínica, reduza faltas em consultas e ofereça uma experiência de acolhimento e credibilidade desde o primeiro contato.',
    heroCtaPrimary: 'Quero modernizar minha clínica',
    heroCtaSecondary: 'Ver soluções para clínicas',
    heroVisualBadge: 'Acolhimento, Credibilidade & Agendamento',
    seoTitle: 'Tecnologia para Clínicas e Consultórios: Sites e Agendamento | Nextia',
    metaDescription: 'Sites profissionais para clínicas médicas, agendamento online, triagem e confirmação de consultas no WhatsApp. Tecnologia em saúde com a Nextia.',
    keywords: [
      'site para clínica médica',
      'site para consultório médico',
      'agendamento online para clínicas',
      'WhatsApp para clínicas',
      'confirmação de consultas WhatsApp',
      'site de saúde profissional',
    ],
    colorTheme: {
      primary: '#0D9488',
      secondary: '#042F2E',
      accent: '#2DD4BF',
      bgGradient: 'from-[#042F2E] via-[#0F4744] to-[#083330]',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    },
    problemsTitle: 'Sua clínica enfrenta dificuldades como essas na recepção?',
    problemsSubtitle: 'A gestão da agenda médica exige agilidade para responder pacientes e evitar horários vagos por faltas não avisadas.',
    problems: [
      {
        title: 'Alto índice de faltas e no-show',
        description: 'Pacientes que esquecem da consulta ou não avisam cancelamento com antecedência, gerando horários ociosos para os médicos.',
        iconName: 'calendar-x',
      },
      {
        title: 'Recepção sobrecarregada ao telefone e WhatsApp',
        description: 'Recepcionistas ocupadas respondendo dúvidas básicas sobre convênios, localização e preparo de exames enquanto pacientes aguardam na recepção.',
        iconName: 'phone-incoming',
      },
      {
        title: 'Dificuldade de encontrar os especialistas',
        description: 'Pacientes que não encontram informações claras sobre as especialidades médicas atendidas, tratamentos e convênios aceitos.',
        iconName: 'user-check',
      },
    ],
    solutionsTitle: 'Soluções pensadas para o acolhimento na saúde',
    solutionsSubtitle: 'Tecnologia que apoia sua equipe de recepção e melhora a experiência dos pacientes.',
    solutions: [
      {
        title: 'Site Institucional para Clínicas',
        description: 'Apresentação completa das especialidades, corpo clínico com CRM/RQE, convênios atendidos, localização e orientações de preparo para exames.',
        badge: 'Credibilidade Médica',
        features: [
          'Páginas dedicadas para cada especialidade médica',
          'Apresentação do corpo clínico e qualificações',
          'Lista clara de convênios atendidos e formas de pagamento',
          'Mapa de localização com estacionamento e acessibilidade',
        ],
        iconName: 'heart-pulse',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Automação de Confirmação no WhatsApp',
        description: 'Disparo de lembretes e confirmação de presença automática antes da consulta, liberando horários cancelados com antecedência.',
        badge: 'Redução de Faltas',
        features: [
          'Lembrete automático 24h a 48h antes da consulta',
          'Botões rápidos para o paciente confirmar ou reagendar',
          'Envio de orientações prévias e preparo de exames',
          'Triagem e dúvidas frequentes sobre convênios e horários',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Clínicas',
    nextia360Subtitle: 'Infraestrutura completa para a recepção, consultórios e segurança dos dados da clínica.',
    nextia360Pillars: [
      { title: 'Site Médico', description: 'Apresentação de especialidades, corpo clínico e convênios.', iconName: 'heart-pulse' },
      { title: 'Lembretes WhatsApp', description: 'Confirmação automática de consultas para reduzir faltas.', iconName: 'bot' },
      { title: 'Wi-Fi na Recepção', description: 'Rede sem fio segura e isolada para os pacientes na espera.', iconName: 'wifi' },
      { title: 'Backup Seguro', description: 'Cópia diária e proteção de arquivos administrativos da clínica.', iconName: 'hard-drive' },
    ],
    workflowTitle: 'Jornada de agendamento do paciente',
    workflowSubtitle: 'Da busca pelo especialista até a confirmação da consulta na agenda.',
    workflow: [
      {
        step: 1,
        title: 'Paciente pesquisa especialista',
        description: 'O paciente busca por médicos da especialidade na sua cidade e encontra o site da clínica.',
        iconName: 'search',
      },
      {
        step: 2,
        title: 'Conhece o médico e convênios',
        description: 'Ele confere o corpo clínico, tratamentos e convênios aceitos no site.',
        iconName: 'user',
      },
      {
        step: 3,
        title: 'Solicita agendamento',
        description: 'Inicia o contato pelo site ou WhatsApp para escolher o melhor dia e horário.',
        iconName: 'calendar',
      },
      {
        step: 4,
        title: 'Confirmação automática',
        description: 'Próximo à data, o paciente recebe o lembrete no WhatsApp com as orientações de chegada.',
        iconName: 'check-circle-2',
      },
    ],
    beforeAfterTitle: 'Comparativo: A rotina da sua clínica',
    beforeAfter: [
      {
        topic: 'Confirmação de Consultas',
        before: 'Recepcionista ligando uma por uma para dezenas de pacientes todo dia.',
        after: 'Lembretes automáticos no WhatsApp com confirmação em um toque.',
      },
      {
        topic: 'Informações de Convênios',
        before: 'Telefone ocupado para responder se a clínica aceita determinado plano.',
        after: 'Site claro e completo com todos os convênios e especialidades visíveis.',
      },
    ],
    securitySection: {
      title: 'Privacidade e Ética Médica (CFM e LGPD)',
      description: 'Desenvolvimento alinhado às resoluções do Conselho Federal de Medicina sobre publicidade médica e às normas de proteção de dados de saúde da LGPD.',
      items: [
        'Exibição obrigatória de CRM e RQE dos profissionais',
        'Comunicação informativa sem promessa de cura ou resultados',
        'Sigilo médico e proteção de dados de saúde',
        'Uso ético de ferramentas de comunicação sem diagnóstico por IA',
      ],
    },
    seoSection: {
      title: 'SEO e Visibilidade para Clínicas e Consultórios',
      description: 'Posicione sua clínica para buscas locais de especialidades e exames.',
      searchExamples: [
        'clínica médica de especialidades na cidade',
        'consultório de dermatologia e estética',
        'cardiologista convênio na região',
        'clínica de ortopedia e fisioterapia',
      ],
    },
    templateSlugs: ['clinica-estetica'],
    faqs: [
      {
        question: 'A IA faz diagnósticos ou orientações médicas?',
        answer: 'Não. A automação é estritamente administrativa para agendamento de consultas, envio de lembretes, endereços, horários e orientações básicas de preparo. Não realiza diagnóstico médico.',
      },
      {
        question: 'O site exibe o CRM dos médicos?',
        answer: 'Sim. Em total conformidade com as normas do CFM, todos os médicos contam com apresentação de nome, CRM e RQE correspondente.',
      },
      {
        question: 'Posso incluir a lista completa de convênios atendidos?',
        answer: 'Sim. Organizamos uma seção clara com todos os planos de saúde e convênios aceitos na clínica, facilitando a consulta dos pacientes e reduzindo dúvidas na recepção.',
      },
    ],
    formServiceOptions: [
      'Site Profissional para Clínica Médica',
      'Confirmação Automática de Consultas no WhatsApp',
      'Nextia 360 para Clínicas',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para clínicas médicas e consultórios e gostaria de mais informações.',
    relatedSegments: ['dentistas', 'contabilidade', 'advocacia', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Clínicas em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Clínicas em Marília / SP' },
    ],
  },

  dentistas: {
    id: 'seg-dentistas',
    slug: 'dentistas',
    name: 'Dentistas',
    pluralName: 'Consultórios Odontológicos',
    category: 'Saúde & Bem-Estar',
    status: 'published',
    badge: 'Soluções Digitais para Dentistas & Odontologia',
    h1: 'Tecnologia para Dentistas e Clínicas Odontológicas Atraírem Pacientes',
    heroSubtitle: 'Sites profissionais com apresentação de tratamentos (implantes, ortodontia, prótese, estética), agendamento online e confirmação no WhatsApp.',
    tagline: 'Valorize seu consultório odontológico com uma presença digital profissional que transmite segurança e facilita o agendamento de avaliações.',
    heroCtaPrimary: 'Quero modernizar meu consultório',
    heroCtaSecondary: 'Ver soluções para dentistas',
    heroVisualBadge: 'Odontologia Moderna & Agendamento',
    seoTitle: 'Tecnologia para Dentistas: Sites e Presença Digital Odontológica | Nextia',
    metaDescription: 'Sites profissionais para dentistas e clínicas odontológicas, agendamento de avaliações e confirmação de consultas no WhatsApp.',
    keywords: [
      'site para dentista',
      'site para clínica odontológica',
      'agendamento online dentista',
      'WhatsApp para consultório odontológico',
      'marketing odontológico ético',
    ],
    colorTheme: {
      primary: '#0284C7',
      secondary: '#082F49',
      accent: '#38BDF8',
      bgGradient: 'from-[#082F49] via-[#0C4A6E] to-[#07273C]',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    },
    problemsTitle: 'Dificuldades comuns na gestão de pacientes do consultório',
    problemsSubtitle: 'A rotina no mocho exige foco no atendimento clínico, enquanto a recepção precisa de ferramentas automáticas para gerenciar a agenda.',
    problems: [
      {
        title: 'Faltas em procedimentos longos',
        description: 'Pacientes que faltam a sessões de implantes ou manutenções ortodônticas, gerando grandes intervalos ociosos na cadeira.',
        iconName: 'calendar-x',
      },
      {
        title: 'Dúvidas repetitivas sobre tratamentos',
        description: 'Pacientes com dúvidas sobre quais tratamentos o consultório realiza (invisalign, clareamento, lentes, próteses).',
        iconName: 'help-circle',
      },
      {
        title: 'Dificuldade de ser encontrado no Google',
        description: 'Pacientes novos na cidade que buscam por "dentista perto de mim" e encontram apenas a concorrência.',
        iconName: 'search',
      },
    ],
    solutionsTitle: 'Soluções para consultórios odontológicos modernos',
    solutionsSubtitle: 'Apresente seus tratamentos com elegância e simplifique a marcação de avaliações.',
    solutions: [
      {
        title: 'Site Odontológico de Alta Conversão',
        description: 'Apresentação detalhada das especialidades odontológicas, fotos do espaço, diferenciais de conforto e botão direto de agendamento.',
        badge: 'Presença Odontológica',
        features: [
          'Páginas explicativas de tratamentos (Implantodontia, Ortodontia, Estética)',
          'Apresentação dos cirurgiões-dentistas com número de CRO',
          'Formulário simples para marcação de avaliação inicial',
          'Design moderno, limpo e acolhedor',
        ],
        iconName: 'sparkles',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Confirmação Automática de Consultas',
        description: 'Lembretes automáticos no WhatsApp para os pacientes confirmarem a presença antes de cada consulta.',
        badge: 'Agenda Cheia',
        features: [
          'Disparo de lembrete com antecedência configurável',
          'Confirmação rápida com botão Sim / Reagendar',
          'Orientações pós-procedimento automatizadas',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Odontologia',
    nextia360Subtitle: 'Estrutura completa de tecnologia para o consultório e para o atendimento dos pacientes.',
    nextia360Pillars: [
      { title: 'Site Odontológico', description: 'Apresentação de tratamentos e credenciais do CRO.', iconName: 'sparkles' },
      { title: 'Lembretes no WhatsApp', description: 'Confirmação automática de consultas e manutenções.', iconName: 'bot' },
      { title: 'Wi-Fi na Sala de Espera', description: 'Internet rápida para pacientes enquanto aguardam.', iconName: 'wifi' },
      { title: 'Backup de Prontuários', description: 'Cópia de segurança diária de fichas e radiografias digitais.', iconName: 'hard-drive' },
    ],
    workflowTitle: 'Como seu novo paciente agenda uma avaliação',
    workflowSubtitle: 'Um caminho simples da pesquisa inicial até a cadeira do consultório.',
    workflow: [
      { step: 1, title: 'Busca por dentista no Google', description: 'O paciente busca por procedimentos como "implante dentário" ou "ortodontia na cidade".', iconName: 'search' },
      { step: 2, title: 'Conhece o consultório', description: 'Acessa o site, confere o espaço, as especialidades e a qualificação do dentista.', iconName: 'layout' },
      { step: 3, title: 'Agenda a avaliação', description: 'Clica no botão de WhatsApp e marca o horário conveniente.', iconName: 'calendar' },
      { step: 4, title: 'Lembrete automático', description: 'Recebe a confirmação no WhatsApp com o endereço e mapa do consultório.', iconName: 'check-circle-2' },
    ],
    beforeAfterTitle: 'Comparativo: A rotina do seu consultório',
    beforeAfter: [
      {
        topic: 'Agendamento de Avaliações',
        before: 'Pacientes sem saber quais tratamentos são realizados no consultório.',
        after: 'Site claro com todas as especialidades explicadas de forma didática e ética.',
      },
      {
        topic: 'Presença no Dia da Consulta',
        before: 'Faltas frequentes em horários de procedimentos longos.',
        after: 'Confirmação automática enviada 24h antes pelo WhatsApp.',
      },
    ],
    seoSection: {
      title: 'SEO Local para Consultórios Odontológicos',
      description: 'Seja encontrado por pessoas do seu bairro e cidade que procuram dentistas especializados.',
      searchExamples: [
        'dentista para implantes na cidade',
        'consultório odontológico no centro',
        'ortodontista aparelho transparente',
        'dentista infantil e odontopediatria',
      ],
    },
    templateSlugs: ['clinica-estetica'],
    faqs: [
      {
        question: 'O site para dentistas respeita o Código de Ética do CFO/CRO?',
        answer: 'Sim. Todas as páginas são elaboradas em conformidade com as resoluções do Conselho Federal de Odontologia, com número de inscrição do CRO visível, linguagem ética e sem promessas ilusórias de resultado.',
      },
      {
        question: 'Posso colocar fotos do consultório e da equipe?',
        answer: 'Sim. Fotos reais do espaço físico, equipamentos e equipe profissional ajudam muito a transmitir acolhimento e tranquilidade para pacientes que têm receio de ir ao dentista.',
      },
      {
        question: 'O site permite que o paciente envie dúvidas prévias pelo WhatsApp?',
        answer: 'Sim. O paciente pode iniciar a conversa diretamente no WhatsApp do consultório e enviar imagens ou dúvidas preliminares para agilizar a marcação da consulta presencial.',
      },
    ],
    formServiceOptions: [
      'Site Profissional para Dentista',
      'Confirmação de Consultas no WhatsApp',
      'Nextia 360 para Odontologia',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para consultórios odontológicos e gostaria de mais informações.',
    relatedSegments: ['clinicas', 'contabilidade', 'advocacia', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Dentistas em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Dentistas em Marília / SP' },
    ],
  },

  imobiliarias: {
    id: 'seg-imobiliarias',
    slug: 'imobiliarias',
    name: 'Imobiliárias',
    pluralName: 'Imobiliárias & Corretores',
    category: 'Imobiliário',
    status: 'published',
    badge: 'Tecnologia Imobiliária de Alta Performance',
    h1: 'Tecnologia para Imobiliárias e Corretores Venderem e Alugarem Mais',
    heroSubtitle: 'Sites modernos com catálogo de imóveis, busca com filtros inteligentes, captação automática de proprietários e atendimento com WhatsApp integrado.',
    tagline: 'Destaque seus imóveis, organize os leads recebidos e profissionalize a presença digital da sua imobiliária.',
    heroCtaPrimary: 'Quero modernizar minha imobiliária',
    heroCtaSecondary: 'Ver soluções para imobiliárias',
    heroVisualBadge: 'Catálogo de Imóveis & Captação',
    seoTitle: 'Tecnologia para Imobiliárias: Sites e Catálogo de Imóveis | Nextia',
    metaDescription: 'Sites profissionais para imobiliárias e corretores, catálogo de imóveis com filtros de busca e integração com WhatsApp. Conheça a Nextia.',
    keywords: [
      'site para imobiliária',
      'site para corretor de imóveis',
      'catálogo de imóveis online',
      'sistema para imobiliária',
      'site de imóveis com busca',
      'plataforma imobiliária',
    ],
    colorTheme: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#60A5FA',
      bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0A101D]',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
    problemsTitle: 'Dores frequentes na rotina digital de imobiliárias',
    problemsSubtitle: 'A concorrência no mercado imobiliário exige velocidade no primeiro atendimento ao lead e facilidade na busca de imóveis.',
    problems: [
      {
        title: 'Leads de portais que demoram para ser atendidos',
        description: 'Compradores e locatários perdem o interesse quando o corretor demora horas para responder o primeiro contato.',
        iconName: 'clock',
      },
      {
        title: 'Site antigo difícil de navegar no celular',
        description: 'Fotos pesadas, filtros confusos e falta de mapa de localização afastam potenciais compradores.',
        iconName: 'smartphone',
      },
      {
        title: 'Dificuldade de captar proprietários',
        description: 'Falta de uma página estruturada para proprietários cadastrarem seus imóveis para venda ou locação diretamente.',
        iconName: 'home',
      },
    ],
    solutionsTitle: 'Soluções desenvolvidas para o mercado imobiliário',
    solutionsSubtitle: 'Apresente seus imóveis com o padrão visual que eles merecem e converta visitantes em visitas agendadas.',
    solutions: [
      {
        title: 'Site Imobiliário com Busca Avançada',
        description: 'Catálogo completo de imóveis para venda e locação, com filtros por tipo, bairro, faixa de preço, número de quartos e vagas.',
        badge: 'Catálogo Completo',
        features: [
          'Galeria de fotos em alta resolução com visualizador rápido',
          'Ficha detalhada com características do imóvel e condomínio',
          'Formulário "Anuncie seu Imóvel" para captação de proprietários',
          'Exibição do CRECI e perfil de corretores da equipe',
        ],
        iconName: 'home',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'WhatsApp com IA para Triagem Imobiliária',
        description: 'Qualificação inicial do lead com perguntas sobre o tipo de imóvel procurado, bairro desejado e orçamento estimado.',
        badge: 'Qualificação Ágil',
        features: [
          'Identificação se o cliente busca comprar, alugar ou anunciar',
          'Envio rápido dos links dos imóveis disponíveis no perfil',
          'Transferência direta para o corretor responsável pelo plantão',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Imobiliárias',
    nextia360Subtitle: 'Tecnologia que conecta os canais de divulgação, o plantão de corretores e a infraestrutura do escritório.',
    nextia360Pillars: [
      { title: 'Catálogo Imobiliário', description: 'Fotos em alta definição e busca rápida por bairros.', iconName: 'home' },
      { title: 'WhatsApp Inteligente', description: 'Triagem de interesse e distribuição para corretores.', iconName: 'bot' },
      { title: 'SEO de Imóveis', description: 'Visibilidade para termos de compra e aluguel na sua cidade.', iconName: 'search' },
      { title: 'Backup de Contratos', description: 'Armazenamento seguro de matrículas, vistorias e contratos.', iconName: 'hard-drive' },
    ],
    workflowTitle: 'Jornada do comprador de imóvel',
    workflowSubtitle: 'Da busca na internet até a visita agendada com o corretor.',
    workflow: [
      { step: 1, title: 'Busca por imóveis na cidade', description: 'O comprador pesquisa "apartamento para comprar no bairro X" e acessa seu site.', iconName: 'search' },
      { step: 2, title: 'Navegação pelas fotos e detalhes', description: 'Confere as fotos, metragem, valor de condomínio e localização.', iconName: 'layout' },
      { step: 3, title: 'Contato com o corretor', description: 'Clica no botão de WhatsApp vinculado àquele imóvel específico.', iconName: 'message-circle' },
      { step: 4, title: 'Visita agendada', description: 'O corretor recebe o link exato do imóvel que o cliente tem interesse para agendar a visita.', iconName: 'calendar' },
    ],
    beforeAfterTitle: 'Comparativo: Sua imobiliária com a Nextia',
    beforeAfter: [
      {
        topic: 'Apresentação de Imóveis',
        before: 'Site pesado, com fotos pequenas e sem facilidade para filtrar no celular.',
        after: 'Catálogo responsivo, fotos em alta definição e botão direto para o corretor.',
      },
      {
        topic: 'Captação de Proprietários',
        before: 'Apenas captação ativa por telefone sem formulário no site.',
        after: 'Página exclusiva "Anuncie seu Imóvel" com captação 24h por dia.',
      },
    ],
    seoSection: {
      title: 'SEO para Imobiliárias e Corretores',
      description: 'Otimizamos a estrutura para pesquisas de compra e locação nos principais bairros.',
      searchExamples: [
        'imobiliária com casas para alugar na cidade',
        'apartamento 3 quartos à venda no centro',
        'terreno em condomínio fechado',
        'imobiliária para anunciar meu imóvel',
      ],
    },
    templateSlugs: ['imobiliaria', 'imobiliaria-premium'],
    faqs: [
      {
        question: 'O site imobiliário funciona bem em celulares?',
        answer: 'Sim, 100% responsivo. Mais de 80% das buscas por imóveis ocorrem pelo celular, por isso nossas páginas são otimizadas para carregamento rápido e navegação fluida em telas pequenas.',
      },
      {
        question: 'Posso cadastrar quantos imóveis quiser?',
        answer: 'Sim. A estrutura permite organizar seu catálogo completo com categorias de venda, locação, residencial, comercial e lançamentos.',
      },
    ],
    formServiceOptions: [
      'Site Imobiliário com Catálogo de Imóveis',
      'WhatsApp com IA para Qualificação de Leads',
      'Nextia 360 para Imobiliárias',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para imobiliárias e corretores e gostaria de mais informações.',
    relatedSegments: ['advocacia', 'contabilidade', 'lojas', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Imobiliárias em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Imobiliárias em Marília / SP' },
    ],
  },

  'pet-shops': {
    id: 'seg-pet-shops',
    slug: 'pet-shops',
    name: 'Pet Shops',
    pluralName: 'Pet Shops & Clínicas Veterinárias',
    category: 'Saúde & Bem-Estar',
    status: 'published',
    badge: 'Soluções Digitais para Pet Shops & Veterinárias',
    h1: 'Tecnologia para Pet Shops e Veterinárias Facilitarem Agendamentos e Vendas',
    heroSubtitle: 'Sites modernos com agendamento de banho e tosa, apresentação de serviços veterinários, catálogo de rações e acessórios, e lembretes automáticos no WhatsApp.',
    tagline: 'Fidelize tutores e organize a agenda de serviços do seu pet shop com atendimento ágil e presença digital encantadora.',
    heroCtaPrimary: 'Quero modernizar meu pet shop',
    heroCtaSecondary: 'Ver soluções para pet shops',
    heroVisualBadge: 'Agendamento Pet & Fidelidade',
    seoTitle: 'Tecnologia para Pet Shops: Agendamento de Banho e Tosa e Vendas | Nextia',
    metaDescription: 'Sites para pet shops e clínicas veterinárias, agendamento de banho e tosa e catálogo de produtos com atendimento no WhatsApp. Conheça a Nextia.',
    keywords: [
      'site para pet shop',
      'agendamento banho e tosa WhatsApp',
      'site para clínica veterinária',
      'catálogo online para pet shop',
      'WhatsApp para pet shop',
    ],
    colorTheme: {
      primary: '#10B981',
      secondary: '#064E3B',
      accent: '#34D399',
      bgGradient: 'from-[#064E3B] via-[#0B624B] to-[#043327]',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    problemsTitle: 'Desafios do dia a dia na gestão do pet shop',
    problemsSubtitle: 'Cuidar dos animais exige atenção integral, enquanto a recepção precisa responder mensagens e controlar os horários de banho e tosa.',
    problems: [
      {
        title: 'Horários vagos por esquecimento dos tutores',
        description: 'Clientes que marcam banho e tosa mas esquecem de levar o pet no horário marcado.',
        iconName: 'calendar-x',
      },
      {
        title: 'Mensagens acumuladas no WhatsApp sobre valores',
        description: 'Dezenas de pessoas perguntando valores por porte de cachorro, serviços de táxi pet e vacinas disponíveis.',
        iconName: 'message-circle',
      },
      {
        title: 'Falta de canal próprio para exibir produtos',
        description: 'Dificuldade de mostrar rações especiais, medicamentos e brinquedos para clientes comprarem com entrega local.',
        iconName: 'shopping-bag',
      },
    ],
    solutionsTitle: 'Soluções feitas para a rotina de quem ama animais',
    solutionsSubtitle: 'Organize sua agenda e venda mais produtos e serviços para os tutores da sua região.',
    solutions: [
      {
        title: 'Site para Pet Shop & Veterinária',
        description: 'Apresentação dos serviços de banho, tosa, consultas veterinárias, especialidades, vacinas e catálogo dos principais produtos.',
        badge: 'Presença Amigável',
        features: [
          'Tabela clara de serviços por porte e tipo de pelo',
          'Apresentação do espaço físico e equipe de veterinários e tosadores',
          'Botão direto para solicitação de horários pelo WhatsApp',
          'Informações sobre táxi pet e área de entrega de ração',
        ],
        iconName: 'heart',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Lembretes e Agendamento no WhatsApp',
        description: 'Envio automático de lembretes do horário do banho e tosa e avisos periódicos de vacinação ou compra recorrente de ração.',
        badge: 'Fidelização de Tutores',
        features: [
          'Lembrete automático para o tutor não esquecer o horário',
          'Avisos de "Pet pronto para retirada"',
          'Respostas automáticas para dúvidas sobre vacinas e funcionamento',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Pet Shops',
    nextia360Subtitle: 'A união entre comunicação ágil com os tutores e estrutura de rede estável na loja.',
    nextia360Pillars: [
      { title: 'Site do Pet Shop', description: 'Apresentação de banho & tosa, veterinária e produtos.', iconName: 'heart' },
      { title: 'WhatsApp Automático', description: 'Lembretes de horários e aviso de pet pronto.', iconName: 'bot' },
      { title: 'Catálogo de Produtos', description: 'Divulgação de rações e acessórios para entrega rápida.', iconName: 'shopping-bag' },
      { title: 'Câmeras de Segurança', description: 'Monitoramento da área de estética animal e loja.', iconName: 'camera' },
    ],
    workflowTitle: 'Como o tutor agenda o banho do pet',
    workflowSubtitle: 'Um processo rápido que garante a pontualidade e reduz o estresse da recepção.',
    workflow: [
      { step: 1, title: 'Tutor busca pet shop na região', description: 'Encontra o site com fotos dos serviços e depoimentos de outros tutores.', iconName: 'search' },
      { step: 2, title: 'Escolhe o serviço', description: 'Confere os pacotes de banho, tosa higiênica e hidratação.', iconName: 'layout' },
      { step: 3, title: 'Agenda no WhatsApp', description: 'Escolhe o dia e horário mais conveniente para o animal.', iconName: 'calendar' },
      { step: 4, title: 'Lembrete e retirada', description: 'Recebe o lembrete no dia e o aviso de que o pet está pronto e cheiroso.', iconName: 'check-circle-2' },
    ],
    beforeAfterTitle: 'Comparativo: Seu pet shop com a Nextia',
    beforeAfter: [
      {
        topic: 'Gestão da Agenda',
        before: 'Tutores esquecendo o horário do banho e tosa, gerando horários vagos.',
        after: 'Lembretes automáticos no WhatsApp que mantêm a agenda pontual.',
      },
      {
        topic: 'Venda de Rações e Produtos',
        before: 'Depender apenas de quem entra fisicamente na loja.',
        after: 'Catálogo online compartilhado facilmente no WhatsApp para entrega rápida.',
      },
    ],
    seoSection: {
      title: 'SEO Local para Pet Shops e Veterinárias',
      description: 'Conquiste tutores que procuram cuidados para seus animais no seu bairro.',
      searchExamples: [
        'pet shop banho e tosa perto de mim',
        'clínica veterinária 24 horas na cidade',
        'entrega de ração a domicílio',
        'estética canina e tosa na tesoura',
      ],
    },
    templateSlugs: ['servicos-profissionais', 'loja-catalogo'],
    faqs: [
      {
        question: 'Posso usar o site tanto para banho e tosa quanto para clínica veterinária?',
        answer: 'Sim! Estruturamos seções dedicadas para os serviços de estética animal (banho, tosa, hidratação) e para os serviços de saúde (consultas veterinárias, vacinas e exames).',
      },
      {
        question: 'Como os clientes recebem o lembrete do banho e tosa?',
        answer: 'A mensagem de confirmação é enviada de forma automática pelo WhatsApp do pet shop 24h antes do horário marcado, permitindo que o tutor confirme com um clique ou avise sobre reagendamentos.',
      },
      {
        question: 'Posso vender rações e produtos diretamente pelo site?',
        answer: 'Sim. Você pode utilizar tanto um catálogo integrado ao WhatsApp para pedidos locais quanto uma loja virtual completa com cálculo de frete e pagamento por Pix.',
      },
    ],
    formServiceOptions: [
      'Site para Pet Shop / Banho & Tosa',
      'Lembretes e Agendamento no WhatsApp',
      'Catálogo Online de Produtos Pet',
      'Nextia 360 para Pet Shops',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para pet shops e veterinárias e gostaria de mais informações.',
    relatedSegments: ['clinicas', 'lojas', 'pizzarias', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Pet Shops em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Pet Shops em Marília / SP' },
    ],
  },

  restaurantes: {
    id: 'seg-restaurantes',
    slug: 'restaurantes',
    name: 'Restaurantes',
    pluralName: 'Restaurantes & Bares',
    category: 'Alimentação & Gastronomia',
    status: 'published',
    badge: 'Soluções Digitais para Gastronomia',
    h1: 'Tecnologia para Restaurantes e Bares Atraírem Mais Clientes',
    heroSubtitle: 'Cardápio digital com fotos profissionais, reservas de mesa online, divulgação de pratos do dia, eventos e atendimento automatizado no WhatsApp.',
    tagline: 'Encante seus clientes antes mesmo da primeira garfada com uma presença digital atraente e sem atritos.',
    heroCtaPrimary: 'Quero modernizar meu restaurante',
    heroCtaSecondary: 'Ver soluções para restaurantes',
    heroVisualBadge: 'Cardápio Digital & Reservas',
    seoTitle: 'Tecnologia para Restaurantes: Cardápio Digital e Reservas | Nextia',
    metaDescription: 'Sites para restaurantes e bares, cardápio digital responsivo, reservas online e atendimento pelo WhatsApp. Soluções para gastronomia com a Nextia.',
    keywords: [
      'site para restaurante',
      'cardápio digital para restaurante',
      'reservas de mesa online',
      'WhatsApp para restaurante',
      'site para bar e gastronomia',
    ],
    colorTheme: {
      primary: '#DC2626',
      secondary: '#1C0A0A',
      accent: '#F87171',
      bgGradient: 'from-[#1C0A0A] via-[#2D1212] to-[#140606]',
      badgeBg: 'bg-red-500/10 text-red-300 border-red-500/20',
    },
    problemsTitle: 'Dificuldades frequentes no atendimento de restaurantes e bares',
    problemsSubtitle: 'Clientes buscam facilidade para ver o cardápio, saber a carta de vinhos e reservar mesas sem burocracia.',
    problems: [
      {
        title: 'Cardápio desatualizado nas redes sociais',
        description: 'Fotos antigas de cardápio com preços errados que geram reclamações no momento da conta.',
        iconName: 'file-text',
      },
      {
        title: 'Telefone tocando sem parar para reservas',
        description: 'Garçons e maîtres interrompendo o atendimento das mesas para anotar reservas em papel.',
        iconName: 'phone',
      },
      {
        title: 'Dificuldade de atrair turistas e novos clientes',
        description: 'Pessoas de fora da cidade que buscam onde comer no Google e não encontram fotos do ambiente e pratos.',
        iconName: 'search',
      },
    ],
    solutionsTitle: 'Soluções que valorizam a experiência gastronômica',
    solutionsSubtitle: 'Tecnologia visual e rápida que destaca a qualidade da sua cozinha.',
    solutions: [
      {
        title: 'Site Gastronômico com Cardápio Interativo',
        description: 'Apresentação dos pratos com fotos profissionais, ingredientes, carta de bebidas, sobremesas e história da casa.',
        badge: 'Experiência Visual',
        features: [
          'Divisão por entradas, pratos principais, sobremesas e drinks',
          'Indicação de pratos vegetarianos, sem glúten ou sem lactose',
          'Galeria de fotos do salão, varanda e eventos',
          'Formulário para reservas de mesa e eventos corporativos',
        ],
        iconName: 'utensils',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'WhatsApp com IA para Informações Rápidas',
        description: 'Atendimento instantâneo com envio do cardápio, horários de abertura, couvert artístico e localização da casa.',
        badge: 'Atendimento Ágil',
        features: [
          'Envio do link do cardápio em segundos no WhatsApp',
          'Informações sobre taxa de rolha, música ao vivo e estacionamento',
          'Direcionamento de solicitações de eventos para a gerência',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Gastronomia',
    nextia360Subtitle: 'Do salão à cozinha, estrutura completa de tecnologia para seu restaurante operar sem interrupções.',
    nextia360Pillars: [
      { title: 'Cardápio Digital', description: 'Visual impecável dos pratos com preços sempre atualizados.', iconName: 'utensils' },
      { title: 'WhatsApp Ágil', description: 'Envio automático de cardápio e horários para os clientes.', iconName: 'bot' },
      { title: 'Wi-Fi para Clientes', description: 'Rede sem fio rápida para os clientes sem travar a maquininha.', iconName: 'wifi' },
      { title: 'Câmeras no Salão & Caixa', description: 'Monitoramento contínuo para segurança de clientes e equipe.', iconName: 'camera' },
    ],
    workflowTitle: 'Como o cliente descobre e reserva no seu restaurante',
    workflowSubtitle: 'Uma jornada rápida que converte pesquisa no Google em clientes no salão.',
    workflow: [
      { step: 1, title: 'Pesquisa gastronômica no Google', description: 'O cliente pesquisa "restaurante para jantar na cidade" e encontra seu site.', iconName: 'search' },
      { step: 2, title: 'Vê os pratos e ambiente', description: 'Navega pelo cardápio digital e confere fotos dos pratos e drinks.', iconName: 'layout' },
      { step: 3, title: 'Solicita reserva de mesa', description: 'Envia mensagem pelo WhatsApp para reservar para casal ou grupo.', iconName: 'calendar' },
      { step: 4, title: 'Confirmação e visita', description: 'Recebe a confirmação com o endereço e orientações de estacionamento.', iconName: 'check-circle-2' },
    ],
    beforeAfterTitle: 'Comparativo: Seu restaurante com a Nextia',
    beforeAfter: [
      {
        topic: 'Atualização do Cardápio',
        before: 'Gastar com impressão cara de cardápio físico a cada mudança de preço.',
        after: 'Cardápio digital atualizado em tempo real sem custo de reimpressão.',
      },
      {
        topic: 'Gestão de Reservas',
        before: 'Caderno de papel com risco de rasuras e reservas duplicadas.',
        after: 'Canal estruturado no WhatsApp com registro organizado de solicitações.',
      },
    ],
    seoSection: {
      title: 'SEO e Visibilidade para Bares e Restaurantes',
      description: 'Destaque seu restaurante nas pesquisas gastronômicas da sua cidade.',
      searchExamples: [
        'melhores restaurantes para jantar na cidade',
        'restaurante italiano com carta de vinhos',
        'barzinho com música ao vivo e porções',
        'almoço executivo no centro',
      ],
    },
    templateSlugs: ['restaurante-premium'],
    faqs: [
      {
        question: 'O cardápio pode ser acessado por QR Code nas mesas do salão?',
        answer: 'Sim! Geramos QR Codes exclusivos para você imprimir e colocar nas mesas, permitindo que os clientes acessem o cardápio digital diretamente pelo celular.',
      },
      {
        question: 'Como funciona a solicitação de reservas de mesa pelo site?',
        answer: 'O visitante preenche a quantidade de pessoas, data e horário desejados pelo site ou clica no WhatsApp, permitindo que a equipe confirme a mesa sem confusão.',
      },
      {
        question: 'Posso atualizar pratos executivos e pratos do dia rapidamente?',
        answer: 'Sim. Você conta com facilidade para alterar itens, sobremesas e bebidas do cardápio digital sem custos com novas impressões de cardápio.',
      },
    ],
    formServiceOptions: [
      'Site com Cardápio Digital para Restaurante',
      'Automação de Reservas e Atendimento no WhatsApp',
      'Nextia 360 para Restaurantes',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para restaurantes e bares e gostaria de mais informações.',
    relatedSegments: ['pizzarias', 'pet-shops', 'lojas', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Restaurantes em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Restaurantes em Marília / SP' },
    ],
  },

  academias: {
    id: 'seg-academias',
    slug: 'academias',
    name: 'Academias',
    pluralName: 'Academias & Studios',
    category: 'Saúde & Bem-Estar',
    status: 'published',
    badge: 'Soluções Digitais para Academias & Studios',
    h1: 'Tecnologia para Academias, Studios e Crossfit Atraírem e Reterem Alunos',
    heroSubtitle: 'Sites modernos com apresentação de planos, grade de aulas e horários, agendamento de aula experimental e atendimento rápido pelo WhatsApp.',
    tagline: 'Transforme visitantes em novos alunos matriculados com uma presença digital enérgica e atendimento sem espera.',
    heroCtaPrimary: 'Quero modernizar minha academia',
    heroCtaSecondary: 'Ver soluções para academias',
    heroVisualBadge: 'Planos, Grade de Aulas & Matrícula',
    seoTitle: 'Tecnologia para Academias: Sites, Grade de Aulas e Matrículas | Nextia',
    metaDescription: 'Sites para academias, studios de pilates e centros de treino, grade de horários, apresentação de planos e captação de alunos no WhatsApp.',
    keywords: [
      'site para academia',
      'site para studio de pilates',
      'grade de aulas online academia',
      'WhatsApp para academia',
      'captação de alunos academia',
    ],
    colorTheme: {
      primary: '#EAB308',
      secondary: '#1C1917',
      accent: '#FDE047',
      bgGradient: 'from-[#1C1917] via-[#292524] to-[#12100E]',
      badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    },
    problemsTitle: 'Dificuldades na captação e atendimento de alunos',
    problemsSubtitle: 'Muitos interessados desistem de se matricular quando não encontram horários e valores com clareza.',
    problems: [
      {
        title: 'Mensagens repetidas perguntando valores dos planos',
        description: 'Recepcionistas respondendo dezenas de vezes sobre planos mensais, trimestrais e taxa de matrícula.',
        iconName: 'dollar-sign',
      },
      {
        title: 'Dúvidas constantes sobre a grade de horários',
        description: 'Alunos perguntando os horários de spinning, yoga, musculação ou crossfit que mudam com frequência.',
        iconName: 'clock',
      },
      {
        title: 'Falta de agendamento de aula experimental',
        description: 'Perda de leads que gostariam de agendar uma aula teste antes de fechar a matrícula.',
        iconName: 'user-plus',
      },
    ],
    solutionsTitle: 'Soluções para acelerar as matrículas da sua academia',
    solutionsSubtitle: 'Apresente a infraestrutura do seu espaço e converta contatos em alunos frequentes.',
    solutions: [
      {
        title: 'Site para Academia com Grade e Planos',
        description: 'Apresentação dos planos, fotos dos equipamentos, modalidades oferecidas, perfil dos professores e botão para aula experimental.',
        badge: 'Captação de Alunos',
        features: [
          'Grade de horários das aulas sempre atualizada',
          'Comparativo claro entre planos mensais, semestrais e anuais',
          'Formulário simples para agendamento de aula experimental gratuita',
          'Fotos dos ambientes, vestiários e aparelhos',
        ],
        iconName: 'activity',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'WhatsApp com IA para Dúvidas e Planos',
        description: 'Atendimento automático que envia os planos, horários de funcionamento e agenda a primeira visita do aluno.',
        badge: 'Atendimento Rápido',
        features: [
          'Envio imediato da tabela de planos e benefícios',
          'Informações sobre modalidades e horários de pico',
          'Encaminhamento direto para a equipe de consultores de vendas',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Academias',
    nextia360Subtitle: 'Tecnologia que conecta a atração de novos alunos e a infraestrutura de treino no salão.',
    nextia360Pillars: [
      { title: 'Site da Academia', description: 'Apresentação de modalidades, professores e planos.', iconName: 'activity' },
      { title: 'WhatsApp Ágil', description: 'Tabela de planos e agendamento de aula experimental.', iconName: 'bot' },
      { title: 'Wi-Fi de Alta Capacidade', description: 'Internet rápida para centenas de alunos treinarem ouvindo música.', iconName: 'wifi' },
      { title: 'Câmeras de Segurança', description: 'Monitoramento dos salões de treino e estacionamento.', iconName: 'camera' },
    ],
    workflowTitle: 'Jornada do novo aluno',
    workflowSubtitle: 'Da busca por uma academia até o primeiro treino.',
    workflow: [
      { step: 1, title: 'Busca por academia no bairro', description: 'O interessado busca por "academia perto de mim" e acessa o site.', iconName: 'search' },
      { step: 2, title: 'Vê a estrutura e horários', description: 'Confere as fotos dos aparelhos, professores e a grade de aulas.', iconName: 'layout' },
      { step: 3, title: 'Agenda aula experimental', description: 'Clica no botão de WhatsApp para marcar seu primeiro treino gratuito.', iconName: 'calendar' },
      { step: 4, title: 'Matrícula confirmada', description: 'Visita o espaço e fecha o plano com o consultor.', iconName: 'check-circle-2' },
    ],
    beforeAfterTitle: 'Comparativo: Sua academia com a Nextia',
    beforeAfter: [
      {
        topic: 'Atendimento de Interessados',
        before: 'Recepção demorando para responder mensagens sobre preços.',
        after: 'Tabela de planos e agendamento de aula experimental enviados em segundos.',
      },
      {
        topic: 'Divulgação de Aulas',
        before: 'Grade de aulas em papel afixada na parede com horários desatualizados.',
        after: 'Grade digital acessível a qualquer momento pelo celular do aluno.',
      },
    ],
    seoSection: {
      title: 'SEO e Visibilidade para Academias e Studios',
      description: 'Atraia moradores do seu bairro que querem começar a treinar.',
      searchExamples: [
        'academia de musculação no bairro',
        'studio de pilates com fisioterapeuta',
        'box de crossfit para iniciantes',
        'academia com natação e lutas',
      ],
    },
    templateSlugs: ['servicos-profissionais'],
    faqs: [
      {
        question: 'O site permite que os alunos vejam os horários das aulas pelo celular?',
        answer: 'Sim. A grade de aulas é 100% responsiva e de fácil leitura em qualquer smartphone, facilitando a consulta dos alunos a qualquer momento.',
      },
      {
        question: 'Como funciona o agendamento de aula experimental pelo site?',
        answer: 'O visitante escolhe a modalidade de interesse (musculação, pilates, crossfit) e clica no botão direto para o WhatsApp da recepção já com as informações pré-preenchidas.',
      },
      {
        question: 'Posso exibir fotos dos professores e da infraestrutura de treino?',
        answer: 'Sim! Apresentar fotos dos aparelhos, vestiários, salas climatizadas e o perfil dos professores aumenta significativamente a confiança dos novos alunos para fechar a matrícula.',
      },
    ],
    formServiceOptions: [
      'Site Profissional para Academia / Studio',
      'Atendimento e Aula Experimental no WhatsApp',
      'Nextia 360 para Academias',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para academias e studios e gostaria de mais informações.',
    relatedSegments: ['clinicas', 'lojas', 'prestadores-de-servicos', 'pet-shops'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Academias em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Academias em Marília / SP' },
    ],
  },

  lojas: {
    id: 'seg-lojas',
    slug: 'lojas',
    name: 'Lojas',
    pluralName: 'Lojas & Comércio',
    category: 'Varejo & Comércio',
    status: 'published',
    badge: 'Soluções Digitais para Lojas & Comércio',
    h1: 'Tecnologia para Lojas Físicas e Virtuais Venderem Mais Todos os Dias',
    heroSubtitle: 'Lojas virtuais completas com cálculo de frete, pagamento por Pix e cartão, catálogo digital de produtos e atendimento integrado no WhatsApp.',
    tagline: 'Leve seus produtos para a internet com uma plataforma de e-commerce própria, rápida e sem intermediários.',
    heroCtaPrimary: 'Quero criar minha loja virtual',
    heroCtaSecondary: 'Ver soluções para lojas',
    heroVisualBadge: 'E-commerce Próprio & Pagamento Integrado',
    seoTitle: 'Tecnologia para Lojas e E-commerce: Lojas Virtuais e Catálogo | Nextia',
    metaDescription: 'Criação de lojas virtuais, catálogo de produtos, cálculo de frete e checkout transparente com Pix e cartão. Venda online com a Nextia.',
    keywords: [
      'loja virtual para comércio',
      'criação de loja virtual',
      'e-commerce próprio para lojas',
      'catálogo digital de produtos',
      'vendas online no WhatsApp',
    ],
    colorTheme: {
      primary: '#8B5CF6',
      secondary: '#1E1B4B',
      accent: '#A78BFA',
      bgGradient: 'from-[#1E1B4B] via-[#2E1065] to-[#130E30]',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    },
    problemsTitle: 'Desafios do comércio tradicional na transição para o digital',
    problemsSubtitle: 'Vender apenas no balcão físico limita o crescimento e perde clientes que preferem comprar online.',
    problems: [
      {
        title: 'Dependência de vendas apenas na loja física',
        description: 'Faturamento parado quando a loja física fecha ou em dias de chuva e baixo movimento de pedestres.',
        iconName: 'store',
      },
      {
        title: 'Atendimento manual demorado no chat',
        description: 'Vendedores passando horas tirando fotos de produtos, calculando frete na mão e cobrando comprovante de Pix.',
        iconName: 'clock',
      },
      {
        title: 'Perda de clientes para grandes marketplaces',
        description: 'Clientes da sua cidade comprando pela internet de concorrentes por falta de um canal de compra online na sua loja.',
        iconName: 'trending-down',
      },
    ],
    solutionsTitle: 'Soluções para o varejo vender 24 horas por dia',
    solutionsSubtitle: 'Uma loja virtual completa e prática para seus clientes comprarem com segurança.',
    solutions: [
      {
        title: 'Loja Virtual Completa (E-commerce)',
        description: 'Plataforma própria com grade de tamanhos/cores, carrinho de compras, cálculo automático de frete e checkout transparente.',
        badge: 'Vendas 24/7',
        features: [
          'Pagamento transparente com Pix automático e cartão de crédito',
          'Cálculo automático de frete com Correios e transportadoras',
          'Gestão simples de produtos, estoque e variações',
          'Design moderno otimizado para celulares',
        ],
        iconName: 'shopping-cart',
        relatedServiceSlug: 'lojas-virtuais',
      },
      {
        title: 'Catálogo Digital Integrado ao WhatsApp',
        description: 'Para lojas que preferem finalizar a venda no atendimento humanizado com link direto do produto.',
        badge: 'Venda Consultiva',
        features: [
          'Catálogo de produtos com fotos em alta qualidade e filtros',
          'Botão "Comprar pelo WhatsApp" em cada item',
          'Envio da sacola de compras diretamente para a conversa',
        ],
        iconName: 'shopping-bag',
        relatedServiceSlug: 'sites-prontos',
      },
    ],
    nextia360Title: 'Nextia 360 para Varejo e Lojas',
    nextia360Subtitle: 'Da loja virtual ao ponto de venda físico, tecnologia completa para o comércio.',
    nextia360Pillars: [
      { title: 'Loja Virtual', description: 'Vendas automáticas 24h com Pix e frete integrado.', iconName: 'shopping-cart' },
      { title: 'Catálogo no WhatsApp', description: 'Envio rápido de links de produtos no atendimento.', iconName: 'bot' },
      { title: 'Wi-Fi para Clientes & Caixa', description: 'Rede estável para as maquininhas e clientes da loja.', iconName: 'wifi' },
      { title: 'CFTV & Câmeras', description: 'Monitoramento da loja, vitrine e estoque.', iconName: 'camera' },
    ],
    workflowTitle: 'Como seu cliente compra na sua loja online',
    workflowSubtitle: 'Uma experiência de compra segura e fluida em poucos cliques.',
    workflow: [
      { step: 1, title: 'Cliente encontra seu produto', description: 'Pesquisa no Google ou clica em um anúncio e acessa sua loja.', iconName: 'search' },
      { step: 2, title: 'Escolhe variações', description: 'Seleciona o tamanho, cor e calcula o frete para seu CEP.', iconName: 'layout' },
      { step: 3, title: 'Paga com segurança', description: 'Finaliza o pedido com Pix automático com aprovação em 2 segundos ou cartão.', iconName: 'credit-card' },
      { step: 4, title: 'Você envia o pedido', description: 'O painel registra a venda e você despacha o produto para entrega.', iconName: 'package' },
    ],
    beforeAfterTitle: 'Comparativo: Sua loja antes e depois da Nextia',
    beforeAfter: [
      {
        topic: 'Horário de Vendas',
        before: 'Vendas acontecendo apenas enquanto a porta física está aberta.',
        after: 'Loja virtual vendendo produtos 24 horas por dia, 7 dias por semana.',
      },
      {
        topic: 'Pagamento e Frete',
        before: 'Vendedor calculando frete manualmente e conferindo comprovante de Pix.',
        after: 'Cálculo automático de frete e Pix aprovado na hora pelo sistema.',
      },
    ],
    seoSection: {
      title: 'SEO para Lojas Virtuais e Comércio Local',
      description: 'Destaque seus produtos nas pesquisas do Google para compradores da sua região e de todo o Brasil.',
      searchExamples: [
        'loja de roupas femininas online',
        'loja de calçados e acessórios na cidade',
        'loja de eletrônicos e informática com entrega rápida',
        'comprar presentes online com entrega no mesmo dia',
      ],
    },
    templateSlugs: ['loja-moda-premium', 'loja-gourmet', 'loja-tech-store', 'loja-catalogo'],
    faqs: [
      {
        question: 'Como recebo os pagamentos das vendas online?',
        answer: 'A loja virtual integra diretamente com gateways seguros como o Mercado Pago, permitindo receber por Pix instantâneo ou cartão de crédito com repasse direto para sua conta bancária.',
      },
      {
        question: 'O cálculo de frete dos Correios é automático?',
        answer: 'Sim. O cliente digita o CEP e a loja calcula instantaneamente o prazo e valor das opções de entrega (Sedex, PAC ou transportadoras parceiras).',
      },
    ],
    formServiceOptions: [
      'Loja Virtual Completa (E-commerce)',
      'Catálogo Digital com WhatsApp',
      'Nextia 360 para Varejo e Comércio',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para lojas e e-commerce e gostaria de mais informações para minha loja.',
    relatedSegments: ['pizzarias', 'restaurantes', 'pet-shops', 'prestadores-de-servicos'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Lojas e E-commerce em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Lojas e E-commerce em Marília / SP' },
    ],
  },

  'prestadores-de-servicos': {
    id: 'seg-prestadores-de-servicos',
    slug: 'prestadores-de-servicos',
    name: 'Prestadores de Serviços',
    pluralName: 'Prestadores de Serviços & Autônomos',
    category: 'Serviços & Profissionais',
    status: 'published',
    badge: 'Soluções Digitais para Prestadores de Serviços',
    h1: 'Tecnologia para Prestadores de Serviços Conquistarem Mais Clientes',
    heroSubtitle: 'Sites profissionais com portfólio de trabalhos, solicitação rápida de orçamento, apresentação de serviços e botão direto para o WhatsApp.',
    tagline: 'Profissionalize sua apresentação comercial, transmita credibilidade e receba pedidos de orçamento qualificados todos os dias.',
    heroCtaPrimary: 'Quero meu site de serviços',
    heroCtaSecondary: 'Ver soluções para prestadores',
    heroVisualBadge: 'Portfólio, Orçamentos & WhatsApp',
    seoTitle: 'Tecnologia para Prestadores de Serviços: Sites e Orçamentos | Nextia',
    metaDescription: 'Criação de sites profissionais para prestadores de serviços, consultores e técnicos, com portfólio de trabalhos e solicitação de orçamento.',
    keywords: [
      'site para prestador de serviços',
      'site para eletricista',
      'site para encanador',
      'site para instalador',
      'site para consultor',
      'site para técnico',
      'orçamento rápido no WhatsApp',
    ],
    colorTheme: {
      primary: '#2563FF',
      secondary: '#0F172A',
      accent: '#60A5FA',
      bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0A101D]',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
    problemsTitle: 'Desafios na captação de clientes para prestadores de serviços',
    problemsSubtitle: 'Depender apenas de indicações ocasionais impede o crescimento previsível dos seus atendimentos.',
    problems: [
      {
        title: 'Dificuldade em demonstrar credibilidade',
        description: 'Clientes com receio de contratar serviços por falta de uma página profissional com fotos de trabalhos anteriores e dados da empresa.',
        iconName: 'shield-alert',
      },
      {
        title: 'Pedidos de orçamento sem detalhes da necessidade',
        description: 'Mensagens genéricas que exigem muitas perguntas para entender o tipo de serviço, local e prazo.',
        iconName: 'help-circle',
      },
      {
        title: 'Invisibilidade nas buscas locais do Google',
        description: 'Pessoas procurando por técnicos e instaladores na sua cidade e contratando quem aparece nos primeiros resultados.',
        iconName: 'search',
      },
    ],
    solutionsTitle: 'Soluções feitas para valorizar seu trabalho técnico',
    solutionsSubtitle: 'Apresente suas especialidades com autoridade e receba contatos prontos para fechar orçamento.',
    solutions: [
      {
        title: 'Site Profissional para Serviços',
        description: 'Apresentação clara dos serviços prestados, fotos de antes e depois de obras/projetos, regiões atendidas e formulário de orçamento.',
        badge: 'Credibilidade Comercial',
        features: [
          'Galeria de fotos com portfólio de trabalhos realizados',
          'Formulário direcionado para coleta de dados do orçamento',
          'Botão de chamada rápida para o WhatsApp',
          'Otimização completa para buscas no Google (SEO local)',
        ],
        iconName: 'briefcase',
        relatedServiceSlug: 'sites-prontos',
      },
      {
        title: 'Atendimento Rápido no WhatsApp',
        description: 'Canal configurado para enviar mensagens de apresentação, tirar dúvidas frequentes e registrar solicitações de vistoria.',
        badge: 'Contato Imediato',
        features: [
          'Mensagem personalizada informando a área e o serviço',
          'Disparo rápido de orçamentos e termos de serviço',
          'Centralização das conversas em canal profissional',
        ],
        iconName: 'bot',
        relatedServiceSlug: 'automacao-whatsapp',
      },
    ],
    nextia360Title: 'Nextia 360 para Prestadores de Serviços',
    nextia360Subtitle: 'Sua presença digital completa para atrair e fechar novos contratos de serviços.',
    nextia360Pillars: [
      { title: 'Site Profissional', description: 'Portfólio de trabalhos realizados e serviços oferecidos.', iconName: 'briefcase' },
      { title: 'WhatsApp Ágil', description: 'Solicitação de orçamentos e agendamento de vistorias.', iconName: 'bot' },
      { title: 'SEO Local', description: 'Apareça para quem pesquisa por seus serviços na sua cidade.', iconName: 'search' },
      { title: 'Suporte de TI', description: 'Estrutura técnica para seu negócio operar sem travar.', iconName: 'shield-check' },
    ],
    workflowTitle: 'Como o cliente contrata seu serviço',
    workflowSubtitle: 'Um fluxo simples que transforma a necessidade em um orçamento aprovado.',
    workflow: [
      { step: 1, title: 'Busca por serviço na cidade', description: 'O cliente pesquisa "instalação de ar condicionado", "eletricista" ou "consultor" no Google.', iconName: 'search' },
      { step: 2, title: 'Vê seus trabalhos anteriores', description: 'Acessa o site, confere fotos de projetos anteriores e a qualidade do serviço.', iconName: 'layout' },
      { step: 3, title: 'Pede um orçamento', description: 'Preenche o formulário ou clica no WhatsApp já informando a cidade e o serviço.', iconName: 'message-circle' },
      { step: 4, title: 'Orçamento fechado', description: 'Você envia a proposta técnica e agenda a execução.', iconName: 'check-circle-2' },
    ],
    beforeAfterTitle: 'Comparativo: Seu negócio de serviços com a Nextia',
    beforeAfter: [
      {
        topic: 'Apresentação Comercial',
        before: 'Passar o número de telefone em cartão de papel sem fotos de trabalhos.',
        after: 'Site profissional com fotos reais de projetos, depoimentos e autoridade.',
      },
      {
        topic: 'Captação de Contratos',
        before: 'Esperar indicações sem previsibilidade de faturamento.',
        after: 'Presença no Google gerando novos pedidos de orçamento toda semana.',
      },
    ],
    seoSection: {
      title: 'SEO Local para Prestadores de Serviços',
      description: 'Conquiste clientes da sua cidade que buscam por profissionais qualificados.',
      searchExamples: [
        'eletricista residencial e industrial na cidade',
        'empresa de pintura e reformas prediais',
        'instalação e manutenção de ar-condicionado',
        'consultoria empresarial para pequenas empresas',
      ],
    },
    templateSlugs: ['servicos-profissionais', 'oficina-mecanica'],
    faqs: [
      {
        question: 'O site serve para profissionais autônomos ou apenas empresas?',
        answer: 'Serve tanto para profissionais liberais e autônomos quanto para empresas e equipes de prestação de serviços. A estrutura é personalizada para o seu tamanho de negócio.',
      },
      {
        question: 'Posso colocar fotos de antes e depois dos meus serviços?',
        answer: 'Sim! Uma galeria de fotos com portfólio de trabalhos realizados é uma das melhores ferramentas para convencer o cliente a contratar seu serviço.',
      },
      {
        question: 'O site ajuda a receber pedidos de orçamento no WhatsApp?',
        answer: 'Sim. Inserimos botões de contato estratégico com mensagens pré-formatadas para que o cliente informe o tipo de serviço e a cidade, agilizando seu orçamento.',
      },
    ],
    formServiceOptions: [
      'Site Profissional para Prestador de Serviços',
      'Canal de Orçamentos no WhatsApp',
      'Nextia 360 para Serviços',
      'Outro / Quero conversar',
    ],
    whatsappMessage: 'Olá! Vi as soluções da Nextia para prestadores de serviços e gostaria de um orçamento para criar meu site.',
    relatedSegments: ['contabilidade', 'advocacia', 'lojas', 'clinicas'],
    cityLinks: [
      { cityName: 'Bauru', citySlug: 'bauru', label: 'Prestadores de Serviços em Bauru / SP' },
      { cityName: 'Marília', citySlug: 'marilia', label: 'Prestadores de Serviços em Marília / SP' },
    ],
  },
};

export const PUBLISHED_SEGMENT_SLUGS = Object.keys(SEGMENTS).filter(
  (slug) => SEGMENTS[slug].status === 'published'
);

export function getSegmentBySlug(slug: string): SegmentData | undefined {
  return SEGMENTS[slug];
}

export const SEGMENT_CATEGORIES = [
  'Todos',
  'Financeiro & Jurídico',
  'Saúde & Bem-Estar',
  'Alimentação & Gastronomia',
  'Imobiliário',
  'Varejo & Comércio',
  'Serviços & Profissionais',
] as const;
