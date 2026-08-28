export interface LocalNicheProblemItem {
  title: string;
  description: string;
  iconName: string;
}

export interface LocalNicheFeatureItem {
  title: string;
  description: string;
  iconName: string;
}

export interface LocalNicheEcosystemPillar {
  title: string;
  description: string;
  iconName: string;
  linkSlug?: string;
}

export interface LocalNicheJourneyStep {
  label: string;
  description: string;
}

export interface LocalNicheFaq {
  question: string;
  answer: string;
}

export interface LocalNicheRelatedPage {
  label: string;
  path: string;
}

export interface LocalNicheServiceData {
  // Identification
  citySlug: string;
  cityName: string;
  state: string;
  segmentSlug: string;
  segmentName: string;
  serviceSlug: string;
  serviceName: string;
  status: 'published' | 'draft' | 'review' | 'archived';
  publicationReason: 'search_demand' | 'sales_strategy' | 'ads_campaign' | 'organic_opportunity' | 'lead_demand';

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    schemaServiceType: string;
  };

  // Lead Tracking
  leadSource: string;
  formServiceValue: string;

  // Hero
  hero: {
    badge: string;
    h1: string;
    h1Highlight: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    whatsappMessage: string;
    highlights: string[];
  };

  // Problems
  problems: {
    title: string;
    subtitle: string;
    items: LocalNicheProblemItem[];
  };

  // Solution
  solution: {
    title: string;
    subtitle: string;
    features: LocalNicheFeatureItem[];
  };

  // Ecosystem Nextia 360
  ecosystem: {
    title: string;
    subtitle: string;
    pillars: LocalNicheEcosystemPillar[];
  };

  // Local Context
  localContext: {
    title: string;
    paragraphs: string[];
    points: string[];
  };

  // Journey
  journey: {
    title: string;
    steps: LocalNicheJourneyStep[];
  };

  // FAQ
  faqs: LocalNicheFaq[];

  // Related Pages
  relatedPages: {
    cityPage: string;
    cityServicePage: string;
    segmentPage: string;
    relatedNichePages: LocalNicheRelatedPage[];
  };

  // Template slugs that match this segment (from templates.ts)
  templateSlugs: string[];

  // Form Defaults
  formDefaults: {
    city: string;
    segment: string;
    service: string;
    goalOptions: string[];
  };
}

export const LOCAL_NICHE_SERVICES: Record<string, LocalNicheServiceData> = {
  // ============================================================================
  // BAURU - CONTABILIDADE - CRIAÇÃO DE SITES
  // ============================================================================
  'bauru/contabilidade/criacao-de-sites': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'contabilidade',
    segmentName: 'Contabilidade',
    serviceSlug: 'criacao-de-sites',
    serviceName: 'Criação de Sites',
    status: 'published',
    publicationReason: 'search_demand',
    seo: {
      title: 'Criação de Sites para Contabilidade em Bauru | Nextia',
      description: 'Desenvolvimento de sites profissionais para escritórios contábeis em Bauru. Apresente seus serviços, capte leads e transmita credibilidade digital.',
      keywords: ['sites para contabilidade', 'escritório de contabilidade bauru', 'site profissional contábil', 'agência web bauru', 'criar site contador'],
      schemaServiceType: 'WebDesign'
    },
    leadSource: 'local_niche_bauru_contabilidade_sites',
    formServiceValue: 'criacao-de-sites',
    hero: {
      badge: 'Solução Web Especializada',
      h1: 'Criação de Sites para Contabilidades em Bauru',
      h1Highlight: 'Contabilidades em Bauru',
      subtitle: 'Transforme o site do seu escritório contábil em uma ferramenta de atração de clientes. Apresentação clara de serviços, integração com WhatsApp e estrutura pensada para captar leads e fortalecer sua marca.',
      ctaPrimaryText: 'Quero um Site Profissional',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Ver Funcionalidades',
      whatsappMessage: 'Olá! Sou um escritório de contabilidade em Bauru e tenho interesse na criação de um site profissional com a Nextia.',
      highlights: ['Apresentação de Serviços', 'Captação de Leads', 'Integração WhatsApp', 'Credibilidade Digital']
    },
    problems: {
      title: 'Desafios do Setor Contábil na Internet',
      subtitle: 'Identificamos as principais barreiras que impedem os escritórios de crescerem digitalmente e atraírem novos clientes corporativos.',
      items: [
        {
          title: 'Escritório Sem Site',
          description: 'A ausência de um domínio próprio passa falta de credibilidade para empresas que buscam um parceiro contábil seguro e confiável.',
          iconName: 'GlobeX'
        },
        {
          title: 'Site Antigo ou Desatualizado',
          description: 'Plataformas lentas, sem adaptação para celulares e com design obsoleto afastam potenciais clientes em segundos.',
          iconName: 'Smartphone'
        },
        {
          title: 'Serviços Pouco Explicados',
          description: 'Falta de clareza nas páginas sobre as áreas de atuação: fiscal, departamento pessoal, contábil e consultoria empresarial.',
          iconName: 'FileText'
        },
        {
          title: 'Dificuldade em Buscas Locais',
          description: 'Empresas da região procuram por contadores na internet e acabam encontrando apenas a concorrência.',
          iconName: 'MapPin'
        },
        {
          title: 'Falta de Ferramentas de Captação',
          description: 'Visitantes navegam pelas páginas mas não encontram botões claros de contato, WhatsApp ou formulários para solicitar propostas.',
          iconName: 'UserMinus'
        }
      ]
    },
    solution: {
      title: 'A Solução Ideal para Contadores',
      subtitle: 'Desenvolvemos sites focados na jornada de decisão do empresário, facilitando o contato e demonstrando a expertise do seu escritório.',
      features: [
        {
          title: 'Serviços Contábeis Organizados',
          description: 'Páginas estruturadas para detalhar cada área do seu escritório, desde abertura de empresas até BPO Financeiro.',
          iconName: 'Briefcase'
        },
        {
          title: 'WhatsApp Integrado',
          description: 'Botões flutuantes e links rápidos para iniciar conversas diretas e agilizar o atendimento de novos leads.',
          iconName: 'MessageSquare'
        },
        {
          title: 'Captação de Leads Otimizada',
          description: 'Formulários estratégicos para solicitação de orçamentos, focados em capturar os dados essenciais das empresas.',
          iconName: 'Target'
        },
        {
          title: 'Otimização para Buscas (SEO)',
          description: 'Estrutura técnica para ajudar seu escritório a aparecer organicamente quando pesquisam por contabilidade local.',
          iconName: 'Search'
        },
        {
          title: 'Design Responsivo',
          description: 'Experiência perfeita em smartphones, tablets ou computadores, garantindo usabilidade para todos os perfis.',
          iconName: 'MonitorSmartphone'
        }
      ]
    },
    ecosystem: {
      title: 'Ecossistema Nextia 360',
      subtitle: 'Evolua a tecnologia do seu escritório em etapas, começando pela presença e avançando para automação inteligente.',
      pillars: [
        {
          title: 'Site Institucional',
          description: 'A base da sua presença digital, onde todas as campanhas e visitantes chegam primeiro.',
          iconName: 'Layout'
        },
        {
          title: 'Atendimento via WhatsApp',
          description: 'Agilidade na comunicação com clientes atuais e novos leads gerados.',
          iconName: 'MessageCircle'
        },
        {
          title: 'Inteligência Artificial',
          description: 'Triagem de demandas rotineiras, aliviando o fluxo da equipe de recepção.',
          iconName: 'Bot',
          linkSlug: '/bauru/contabilidade/whatsapp-ia'
        },
        {
          title: 'Automação Interna',
          description: 'Integração de dados do site direto para suas ferramentas de gestão de tarefas.',
          iconName: 'Cpu',
          linkSlug: '/bauru/contabilidade/automacao'
        }
      ]
    },
    localContext: {
      title: 'O Cenário para Escritórios em Bauru',
      paragraphs: [
        'A cidade conta com um setor empresarial dinâmico, do comércio de rua ao parque industrial, além do forte ecossistema de serviços e tecnologia. Para que o seu escritório se destaque nesse ambiente competitivo, é necessário mais do que indicações boca a boca.',
        'Um posicionamento profissional online aproxima sua equipe dos empreendedores locais que buscam trocar de contador ou abrir um novo CNPJ. Desenvolvemos seu site pensando na linguagem comercial que transmite confiança e segurança.'
      ],
      points: [
        'Atração de empresas em fase de abertura',
        'Demonstração de especialidade setorial',
        'Facilidade para o empresário solicitar orçamentos',
        'Canal institucional de credibilidade contábil'
      ]
    },
    journey: {
      title: 'A Jornada do Cliente',
      steps: [
        {
          label: 'Pesquisa',
          description: 'O empresário local busca no Google por soluções contábeis e encontra sua página estruturada.'
        },
        {
          label: 'Descoberta',
          description: 'Acessa o site e navega com facilidade pelo celular, lendo sobre seus serviços e especialidades.'
        },
        {
          label: 'Confiança',
          description: 'Avalia a apresentação institucional da equipe e percebe a segurança transmitida pelo design.'
        },
        {
          label: 'Contato',
          description: 'Clica no botão de WhatsApp ou preenche o formulário para solicitar uma proposta contábil.'
        }
      ]
    },
    faqs: [
      {
        question: 'Por que um escritório contábil precisa de um site hoje em dia?',
        answer: 'Para transmitir credibilidade e segurança a novos clientes, que invariavelmente pesquisam a empresa na internet antes de fechar um contrato. O site é o seu cartão de visitas digital.'
      },
      {
        question: 'Posso incluir uma "Área do Cliente" ou links de sistemas parceiros no site?',
        answer: 'Sim! Podemos estruturar o site com links diretos para plataformas de gestão, emissão de notas ou envio de documentos que você já utiliza com seus clientes.'
      },
      {
        question: 'O site pode ter um blog para artigos sobre impostos e legislação?',
        answer: 'Com certeza. Inserir um blog é uma ótima estratégia para esclarecer dúvidas frequentes de empresários, o que ajuda também no posicionamento orgânico da página nas buscas.'
      },
      {
        question: 'Vocês realizam o registro do domínio para a minha contabilidade?',
        answer: 'Sim, auxiliamos no processo de escolha e registro de domínios adequados, como .com.br ou outras extensões recomendadas para escritórios, caso você ainda não possua.'
      },
      {
        question: 'Como os clientes entram em contato a partir do site?',
        answer: 'Incluímos formulários estratégicos para envio de e-mails, além de botões rápidos de WhatsApp, facilitando a escolha do usuário sobre o canal preferido de comunicação.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/criacao-de-sites',
      segmentPage: '/solucoes/contabilidade',
      relatedNichePages: [
        { label: 'Automação para Contabilidade em Bauru', path: '/bauru/contabilidade/automacao' },
        { label: 'WhatsApp com IA para Contabilidade em Bauru', path: '/bauru/contabilidade/whatsapp-ia' },
        { label: 'Sites para Clínicas em Bauru', path: '/bauru/clinicas/criacao-de-sites' }
      ]
    },
    templateSlugs: ['contabilidade'],
    formDefaults: {
      city: 'Bauru',
      segment: 'Contabilidade',
      service: 'Criação de Sites',
      goalOptions: [
        'Aumentar captação de clientes corporativos',
        'Modernizar a apresentação do escritório',
        'Divulgar novos serviços consultivos',
        'Integrar blog para compartilhar artigos fiscais',
        'Outros objetivos de presença digital'
      ]
    }
  },

  // ============================================================================
  // BAURU - CONTABILIDADE - WHATSAPP IA
  // ============================================================================
  'bauru/contabilidade/whatsapp-ia': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'contabilidade',
    segmentName: 'Contabilidade',
    serviceSlug: 'whatsapp-ia',
    serviceName: 'WhatsApp com IA',
    status: 'published',
    publicationReason: 'sales_strategy',
    seo: {
      title: 'WhatsApp com IA para Contabilidade em Bauru | Nextia',
      description: 'Automatize a triagem e atendimento do seu escritório contábil em Bauru com Inteligência Artificial no WhatsApp. Organização e agilidade sem perder a humanização.',
      keywords: ['whatsapp ia contabilidade', 'atendimento automatizado contador', 'chatbot contábil bauru', 'triagem whatsapp escritório', 'ia para contabilidade'],
      schemaServiceType: 'SoftwareApplication'
    },
    leadSource: 'local_niche_bauru_contabilidade_whatsappia',
    formServiceValue: 'whatsapp-ia',
    hero: {
      badge: 'Atendimento Inteligente',
      h1: 'WhatsApp com IA para Contabilidades em Bauru',
      h1Highlight: 'Contabilidades em Bauru',
      subtitle: 'Pare de misturar demandas urgentes com dúvidas simples no WhatsApp do escritório. Use Inteligência Artificial para fazer triagem, coletar informações iniciais e encaminhar o cliente ao departamento correto.',
      ctaPrimaryText: 'Automatizar Meu Atendimento',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Entender a Triagem',
      whatsappMessage: 'Olá! Sou um contador em Bauru e quero entender como o WhatsApp com IA da Nextia pode organizar o atendimento do meu escritório.',
      highlights: ['Triagem de Departamentos', 'Filtro de Clientes vs Leads', 'Encaminhamento Humano', 'Sem Decisões Fiscais Automáticas']
    },
    problems: {
      title: 'A Desorganização no WhatsApp Contábil',
      subtitle: 'Quando a comunicação centraliza em um único canal sem inteligência, o atendimento se torna um gargalo para o crescimento.',
      items: [
        {
          title: 'Excesso de Mensagens Repetitivas',
          description: 'O time passa horas respondendo dúvidas básicas sobre horários de funcionamento, envio de guias e links já disponíveis.',
          iconName: 'MessageSquareWarning'
        },
        {
          title: 'Mistura de Assuntos Urgentes',
          description: 'Aviso de vencimento de imposto concorre no mesmo chat com uma dúvida trabalhista trivial ou pedido comercial.',
          iconName: 'ListOrdered'
        },
        {
          title: 'Perda de Leads',
          description: 'Novas empresas pedindo orçamento acabam ignoradas temporariamente enquanto a equipe resolve problemas complexos de clientes antigos.',
          iconName: 'UserMinus'
        },
        {
          title: 'Demora para Responder',
          description: 'Falta de respostas imediatas, mesmo em horários comerciais de pico, prejudica a percepção de qualidade do escritório.',
          iconName: 'Clock'
        }
      ]
    },
    solution: {
      title: 'Triagem Inteligente e Organização',
      subtitle: 'A IA não faz o trabalho do contador, ela prepara o terreno para que a sua equipe atenda apenas o que importa.',
      features: [
        {
          title: 'Triagem e Identificação',
          description: 'O bot entende se a pessoa quer o setor fiscal, pessoal ou se é um interessado em fechar contrato.',
          iconName: 'Filter'
        },
        {
          title: 'Coleta de Informações Prévias',
          description: 'Antes de passar para o humano, a IA pede o CNPJ e qual o motivo do contato, agilizando o entendimento.',
          iconName: 'ClipboardList'
        },
        {
          title: 'Respostas a FAQs',
          description: 'Configuração de respostas automáticas seguras sobre horários, localização e links para portal do cliente.',
          iconName: 'HelpCircle'
        },
        {
          title: 'Pausa Estratégica da IA',
          description: 'A qualquer momento em que o assunto exija a análise técnica do contador, a IA para de interagir e transfere o chat.',
          iconName: 'PauseCircle'
        },
        {
          title: 'Controle de Horários',
          description: 'Avisos amigáveis fora do horário comercial, coletando a demanda para a equipe tratar no dia seguinte.',
          iconName: 'Calendar'
        }
      ]
    },
    ecosystem: {
      title: 'Próximos Passos de Evolução',
      subtitle: 'Com o canal de comunicação resolvido, o que mais pode ser otimizado no seu ecossistema digital?',
      pillars: [
        {
          title: 'Atendimento Escalável',
          description: 'Sua base para lidar com centenas de mensagens mensais sem perder a linha.',
          iconName: 'MessageCircle'
        },
        {
          title: 'Automação de Tarefas',
          description: 'Integração para que a IA alimente seu sistema de gestão de demandas.',
          iconName: 'Cpu',
          linkSlug: '/bauru/contabilidade/automacao'
        },
        {
          title: 'Nova Presença Digital',
          description: 'Reformulação do site para atrair ainda mais visitantes para seu novo fluxo de atendimento.',
          iconName: 'Layout',
          linkSlug: '/bauru/contabilidade/criacao-de-sites'
        }
      ]
    },
    localContext: {
      title: 'Organizando a Rotina Contábil em Bauru',
      paragraphs: [
        'Com as mudanças frequentes na legislação e os prazos apertados do calendário fiscal brasileiro, o tempo do contador e de seus analistas vale muito. Perder esse tempo com triagem de WhatsApp afeta a produtividade.',
        'Escritórios na nossa região que implantam inteligência no atendimento conseguem separar o "joio do trigo", direcionando rapidamente um potencial cliente para o departamento comercial e um envio de folha para o setor de RH.'
      ],
      points: [
        'Aumento da capacidade de resposta comercial',
        'Blindagem do time técnico contra interrupções',
        'Padronização no tom de voz inicial do escritório',
        'Segurança por não emitir opiniões contábeis'
      ]
    },
    journey: {
      title: 'Como a IA Funciona na Prática',
      steps: [
        {
          label: 'Recebimento',
          description: 'O cliente manda uma mensagem; a IA responde instantaneamente de forma cortês.'
        },
        {
          label: 'Compreensão',
          description: 'A IA interpreta a necessidade (ex: "preciso da guia de FGTS").'
        },
        {
          label: 'Encaminhamento',
          description: 'Ela informa que está acionando o setor Pessoal e notifica a equipe responsável.'
        },
        {
          label: 'Assunção Humana',
          description: 'O analista visualiza o contexto completo e continua o atendimento no momento adequado.'
        }
      ]
    },
    faqs: [
      {
        question: 'A Inteligência Artificial vai passar orientação fiscal errada para o cliente?',
        answer: 'Não. Nossa configuração de IA para contabilidades tem instruções rígidas de não emitir pareceres fiscais, jurídicos ou contábeis. Seu foco é apenas em triagem e dúvidas administrativas do escritório.'
      },
      {
        question: 'A IA sabe quando é um lead novo ou um cliente atual?',
        answer: 'Sim, ela pode ser configurada para perguntar no início do contato e seguir fluxos de atendimento diferentes dependendo da resposta.'
      },
      {
        question: 'E se o cliente ficar irritado querendo falar com um humano?',
        answer: 'A IA identifica o tom da conversa e solicitações explícitas de atendimento humano, transferindo o chat imediatamente e pausando a automação.'
      },
      {
        question: 'Quanto tempo demora para implementar?',
        answer: 'A estruturação dos fluxos, prompts de atendimento e testes iniciais costuma ser mapeada e implantada de forma rápida, dependendo da complexidade das regras de negócio do escritório.'
      },
      {
        question: 'Meus funcionários conseguem operar o mesmo número de WhatsApp junto com a IA?',
        answer: 'Sim! A IA cuida do acolhimento inicial e do filtro e, quando necessário, passa a conversa para os seus atendentes operarem no mesmo número por meio de painel próprio.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/whatsapp-ia',
      segmentPage: '/solucoes/contabilidade',
      relatedNichePages: [
        { label: 'Criação de Sites para Contabilidade', path: '/bauru/contabilidade/criacao-de-sites' },
        { label: 'Automação para Contabilidade', path: '/bauru/contabilidade/automacao' }
      ]
    },
    templateSlugs: [],
    formDefaults: {
      city: 'Bauru',
      segment: 'Contabilidade',
      service: 'WhatsApp com IA',
      goalOptions: [
        'Triagem de novos clientes',
        'Respostas automáticas de dúvidas',
        'Organização de mensagens da equipe',
        'Outro objetivo'
      ]
    }
  },

  // ============================================================================
  // BAURU - CONTABILIDADE - AUTOMAÇÃO
  // ============================================================================
  'bauru/contabilidade/automacao': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'contabilidade',
    segmentName: 'Contabilidade',
    serviceSlug: 'automacao',
    serviceName: 'Automação Empresarial',
    status: 'published',
    publicationReason: 'sales_strategy',
    seo: {
      title: 'Automação Empresarial para Contabilidade em Bauru | Nextia',
      description: 'Elimine processos manuais no seu escritório de contabilidade em Bauru. Conecte ferramentas, automatize fluxos de entrada e aumente a produtividade da equipe.',
      keywords: ['automação contabilidade bauru', 'integração de sistemas contábeis', 'fluxo de processos contador', 'gestão de tarefas escritório', 'automação de atendimento contábil'],
      schemaServiceType: 'SoftwareApplication'
    },
    leadSource: 'local_niche_bauru_contabilidade_automacao',
    formServiceValue: 'automacao',
    hero: {
      badge: 'Produtividade e Integração',
      h1: 'Automação para Contabilidades em Bauru',
      h1Highlight: 'Contabilidades em Bauru',
      subtitle: 'Conecte as pontas do seu negócio digital. Desde o momento que um cliente preenche um formulário no site até a criação da tarefa para a equipe de admissão ou comercial, tudo sem copiar e colar.',
      ctaPrimaryText: 'Descobrir Oportunidades',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Ver Fluxos Comuns',
      whatsappMessage: 'Olá! Sou de uma contabilidade em Bauru e quero conhecer as soluções de automação da Nextia.',
      highlights: ['Integração Formulário > Sistema', 'Gestão de Tarefas', 'Notificações Internas', 'Fim do Retrabalho']
    },
    problems: {
      title: 'Os Gargalos Operacionais do Escritório',
      subtitle: 'Muito tempo gasto em tarefas repetitivas significa menos tempo para atuar de forma consultiva junto aos empresários.',
      items: [
        {
          title: 'Processos Manuais Repetitivos',
          description: 'A equipe perde horas apenas copiando dados de planilhas ou e-mails para cadastros em outros sistemas.',
          iconName: 'Copy'
        },
        {
          title: 'Falta de Integração',
          description: 'O site não fala com o CRM de vendas, que não fala com a agenda da diretoria.',
          iconName: 'Unlink'
        },
        {
          title: 'Perda de Prazos ou Oportunidades',
          description: 'Um e-mail de um novo interessado fica perdido na caixa de entrada até alguém lembrar de retornar.',
          iconName: 'CalendarX'
        },
        {
          title: 'Acompanhamento Dificultado',
          description: 'Difícil saber em qual etapa está o processo de abertura daquela empresa solicitada na semana passada.',
          iconName: 'EyeOff'
        }
      ]
    },
    solution: {
      title: 'Fluxos Conectados e Inteligentes',
      subtitle: 'Nossas soluções de automação usam ferramentas de conexão (via webhooks e APIs) para orquestrar os dados perfeitamente.',
      features: [
        {
          title: 'Formulários Integrados',
          description: 'Os dados digitados pelo cliente no site caem automaticamente nas ferramentas de gestão da equipe.',
          iconName: 'FormInput'
        },
        {
          title: 'Notificações Automáticas',
          description: 'Disparos no WhatsApp ou e-mail interno sempre que uma etapa importante precisa de atenção imediata.',
          iconName: 'BellRing'
        },
        {
          title: 'Criação de Tarefas',
          description: 'Aprovação comercial gera automaticamente cards de atividades nos quadros do departamento responsável.',
          iconName: 'CheckSquare'
        },
        {
          title: 'Fluxos de Follow-up',
          description: 'Lembretes automáticos para a equipe de vendas retornar o contato para orçamentos pendentes.',
          iconName: 'RefreshCcw'
        },
        {
          title: 'Conexão de Ecossistema',
          description: 'Unificação da presença web, atendimento e gestão em uma lógica integrada de dados.',
          iconName: 'Network'
        }
      ]
    },
    ecosystem: {
      title: 'Visão Completa de Integração',
      subtitle: 'A automação é o cérebro que conecta todos os pontos da sua presença.',
      pillars: [
        {
          title: 'Automação de Fluxos',
          description: 'Redução de trabalhos braçais através de regras de sistemas.',
          iconName: 'Cpu'
        },
        {
          title: 'Site Inteligente',
          description: 'A porta de entrada de dados que alimenta suas novas automações.',
          iconName: 'Layout',
          linkSlug: '/bauru/contabilidade/criacao-de-sites'
        },
        {
          title: 'Comunicação Ágil',
          description: 'IA no WhatsApp atuando em conjunto com suas regras de negócios.',
          iconName: 'MessageSquare',
          linkSlug: '/bauru/contabilidade/whatsapp-ia'
        }
      ]
    },
    localContext: {
      title: 'Ganhando Escala em Bauru',
      paragraphs: [
        'A concorrência entre escritórios de contabilidade tem exigido preços competitivos e serviços mais eficientes. Não é sustentável manter profissionais qualificados apenas digitando dados.',
        'A automatização de rotinas de contato e fluxos administrativos permite que a sua equipe técnica se dedique à análise tributária e estratégica dos clientes locais.'
      ],
      points: [
        'Redução do custo operacional de atendimento primário',
        'Controle centralizado dos contatos que chegam',
        'Prevenção contra esquecimento de leads comerciais',
        'Experiência mais rápida para o cliente'
      ]
    },
    journey: {
      title: 'O Fluxo de um Novo Lead Automatizado',
      steps: [
        {
          label: 'Captura',
          description: 'O empresário preenche o cadastro no site para solicitar proposta.'
        },
        {
          label: 'Distribuição',
          description: 'O sistema lê os dados e adiciona o card de negociação no funil do time comercial.'
        },
        {
          label: 'Alerta',
          description: 'Um aviso imediato chega no Slack ou WhatsApp da liderança.'
        },
        {
          label: 'Execução',
          description: 'Após o fechamento, o contrato digital assinado gera as tarefas de onboarding no setor societário.'
        }
      ]
    },
    faqs: [
      {
        question: 'Vocês automatizam envios de guias e obrigações dentro do meu software contábil?',
        answer: 'O escopo da nossa automação foca nas etapas de marketing, atendimento (CRM, WhatsApp, site) e gestão de tarefas. O processamento fiscal interno continua sendo feito pelas ferramentas específicas de ERP contábil que você já usa.'
      },
      {
        question: 'Quais ferramentas vocês conseguem integrar?',
        answer: 'Trabalhamos com centenas de ferramentas com suporte a API ou webhooks (Zapier, Make), conectando CRMs, ferramentas de disparo de e-mail, gerenciadores de tarefas (Trello, ClickUp) e planilhas.'
      },
      {
        question: 'É necessário conhecimento de programação da minha equipe?',
        answer: 'Não. Nós mapeamos as regras, construímos a estrutura de automação e entregamos o fluxo operando em segundo plano. Vocês apenas continuam trabalhando.'
      },
      {
        question: 'E se o fluxo falhar ou um sistema mudar?',
        answer: 'Toda arquitetura de automação exige monitoramento e eventuais ajustes. Estruturamos os sistemas com tratamento de erros para que avisos sejam emitidos se algo sair do normal.'
      },
      {
        question: 'A automação consegue enviar e-mails de cobrança em massa?',
        answer: 'Pode, mas não é nosso foco principal. Atuamos fortemente para integrar processos de vendas, triagem inicial de clientes e conexão entre a plataforma web e a gestão da equipe.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/automacao',
      segmentPage: '/solucoes/contabilidade',
      relatedNichePages: [
        { label: 'Criação de Sites para Contabilidade', path: '/bauru/contabilidade/criacao-de-sites' },
        { label: 'WhatsApp com IA para Contabilidade', path: '/bauru/contabilidade/whatsapp-ia' }
      ]
    },
    templateSlugs: [],
    formDefaults: {
      city: 'Bauru',
      segment: 'Contabilidade',
      service: 'Automação',
      goalOptions: [
        'Conectar site com ferramentas internas',
        'Automatizar entrada de novos leads',
        'Reduzir digitação de dados repetitivos',
        'Melhorar alertas e notificações',
        'Integrar múltiplos sistemas'
      ]
    }
  },

  // ============================================================================
  // BAURU - PIZZARIAS - CRIAÇÃO DE SITES
  // ============================================================================
  'bauru/pizzarias/criacao-de-sites': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'pizzarias',
    segmentName: 'Pizzarias',
    serviceSlug: 'criacao-de-sites',
    serviceName: 'Criação de Sites',
    status: 'published',
    publicationReason: 'search_demand',
    seo: {
      title: 'Criação de Sites para Pizzarias em Bauru | Nextia',
      description: 'Tenha o site da sua pizzaria em Bauru com cardápio digital, informações de entrega, horários e integração direta com WhatsApp para pedidos sem taxas.',
      keywords: ['sites para pizzaria bauru', 'cardápio digital pizzaria', 'site de restaurante bauru', 'criar site para delivery', 'vender pizza pelo whatsapp'],
      schemaServiceType: 'WebDesign'
    },
    leadSource: 'local_niche_bauru_pizzarias_sites',
    formServiceValue: 'criacao-de-sites',
    hero: {
      badge: 'Presença Digital para Delivery',
      h1: 'Criação de Sites para Pizzarias em Bauru',
      h1Highlight: 'Pizzarias em Bauru',
      subtitle: 'Reduza a dependência exclusiva de aplicativos de terceiros. Com um site próprio e cardápio bem estruturado, você atrai clientes, destaca seus diferenciais e direciona pedidos diretos para o seu canal de vendas.',
      ctaPrimaryText: 'Quero um Site para Minha Pizzaria',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Ver Diferenciais',
      whatsappMessage: 'Olá! Tenho uma pizzaria em Bauru e gostaria de orçar a criação de um site com a Nextia.',
      highlights: ['Cardápio Digital Fixo', 'Direcionamento para WhatsApp', 'Informações de Localização', 'Gestão de Presença']
    },
    problems: {
      title: 'O Problema de Ficar Apenas nos Apps',
      subtitle: 'Muitos estabelecimentos esquecem que boa parte dos clientes pesquisa por opções diretamente no Google.',
      items: [
        {
          title: 'Sem Endereço Próprio na Web',
          description: 'A pizzaria depende 100% de marketplaces, pagando altas taxas por pedidos de clientes que já são fiéis.',
          iconName: 'Store'
        },
        {
          title: 'Cardápio Difícil de Visualizar',
          description: 'Enviar PDFs pesados ou fotos mal recortadas no WhatsApp gera uma péssima experiência de compra.',
          iconName: 'ImageOff'
        },
        {
          title: 'Desinformação de Horários e Taxas',
          description: 'Clientes perdem tempo perguntando se estão abertos, bairros atendidos e formas de pagamento aceitas.',
          iconName: 'Clock'
        },
        {
          title: 'Falta de Espaço para Promoções',
          description: 'Dificuldade em dar destaque claro aos combos e dias promocionais que chamam atenção e fecham a venda.',
          iconName: 'Tag'
        },
        {
          title: 'Experiência Ruim no Celular',
          description: 'Quem tenta achar informações no Google encontra resultados confusos de avaliações em vez de um link oficial agradável.',
          iconName: 'Smartphone'
        }
      ]
    },
    solution: {
      title: 'O Site Focado no Apetite e na Praticidade',
      subtitle: 'Criamos páginas limpas, responsivas e voltadas para conduzir o cliente do interesse até o clique no botão de pedir.',
      features: [
        {
          title: 'Cardápio Interativo Web',
          description: 'Sabores, ingredientes, fotos atrativas e preços estruturados diretamente na página.',
          iconName: 'Menu'
        },
        {
          title: 'WhatsApp Estratégico',
          description: 'Botões que já abrem a conversa no aplicativo, facilitando a finalização do pedido direto com a loja.',
          iconName: 'MessageCircle'
        },
        {
          title: 'Informações Claras',
          description: 'Blocos bem visíveis sobre áreas de entrega, horários de funcionamento e meios de pagamento.',
          iconName: 'Info'
        },
        {
          title: 'Destaque para Promoções',
          description: 'Uma área especial na página inicial para divulgar a oferta do dia ou o combo mais vantajoso.',
          iconName: 'Star'
        },
        {
          title: 'Layout 100% Mobile',
          description: 'Desenvolvido para brilhar no celular, tela onde 90% dos pedidos de delivery acontecem.',
          iconName: 'Smartphone'
        }
      ]
    },
    ecosystem: {
      title: 'Evolua a Tecnologia do Delivery',
      subtitle: 'Além do site, preparamos sua infraestrutura para receber maior volume de contatos.',
      pillars: [
        {
          title: 'A Vitrine Online',
          description: 'Seu site próprio com cardápio sempre disponível e fácil de compartilhar.',
          iconName: 'Layout'
        },
        {
          title: 'Inteligência Artificial',
          description: 'Agilize o envio de informações de taxas e horários via WhatsApp automatizado.',
          iconName: 'Bot',
          linkSlug: '/bauru/pizzarias/whatsapp-ia'
        }
      ]
    },
    localContext: {
      title: 'O Mercado de Pizzarias Bauruense',
      paragraphs: [
        'Bauru tem uma tradição fortíssima de consumo de pizzas em diversos bairros, da zona sul à região central. Contudo, a guerra por atenção nos aplicativos nunca foi tão acirrada.',
        'Ter um ambiente virtual próprio não substitui o iFood, mas cria uma ponte direta para fidelizar o cliente. Um usuário pesquisa "Pizzaria perto de mim" no Google, encontra seu site rápido, vê o cardápio e clica para pedir no seu WhatsApp, escapando das comissões abusivas.'
      ],
      points: [
        'Aumento da margem de lucro por pedido direto',
        'Facilidade para o boca a boca digital (compartilhar o link)',
        'Controle total da apresentação da marca',
        'Transparência com áreas de cobertura e taxas locais'
      ]
    },
    journey: {
      title: 'O Caminho da Fome até a Entrega',
      steps: [
        {
          label: 'Desejo',
          description: 'Cliente pesquisa por opções e encontra o site estruturado da sua pizzaria.'
        },
        {
          label: 'Decisão',
          description: 'Navega facilmente pelos sabores e verifica fotos e ingredientes na versão celular.'
        },
        {
          label: 'Ação',
          description: 'Clica em "Pedir pelo WhatsApp" e inicia o contato rápido com a equipe de atendimento.'
        },
        {
          label: 'Entrega',
          description: 'A equipe finaliza o pedido e despacha com agilidade.'
        }
      ]
    },
    faqs: [
      {
        question: 'O site tem um sistema próprio para fechar a compra e passar cartão online?',
        answer: 'Nossos sites institucionais para pizzarias focam na vitrine digital e direcionamento estratégico para o WhatsApp, onde a compra é concluída, garantindo agilidade e baixo custo de implementação.'
      },
      {
        question: 'Posso integrar os links do iFood ou Rappi na página?',
        answer: 'Claro. É comum termos um botão principal para o pedido via WhatsApp (próprio) e opções secundárias para quem faz questão de usar os aplicativos de entrega parceiros.'
      },
      {
        question: 'Consigo atualizar o cardápio com facilidade?',
        answer: 'Sim, na construção do projeto entregamos formas facilitadas ou oferecemos pacotes de suporte e manutenção para manter os valores e novos sabores sempre em dia.'
      },
      {
        question: 'Eu preciso ter fotos profissionais das pizzas?',
        answer: 'É extremamente recomendado, mas caso não possua no início, conseguimos desenvolver a página com um design tipográfico forte e uso inteligente da sua identidade visual até que as fotos reais sejam produzidas.'
      },
      {
        question: 'O site ajuda a aparecer mais no Google para a cidade de Bauru?',
        answer: 'Com certeza. Ao utilizar técnicas de SEO local e registrar a empresa adequadamente, a criação da página aumenta bastante as chances de aparecer bem nas buscas orgânicas da região.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/criacao-de-sites',
      segmentPage: '/solucoes/pizzarias',
      relatedNichePages: [
        { label: 'WhatsApp com IA para Pizzarias em Bauru', path: '/bauru/pizzarias/whatsapp-ia' }
      ]
    },
    templateSlugs: ['restaurante-premium'],
    formDefaults: {
      city: 'Bauru',
      segment: 'Pizzarias',
      service: 'Criação de Sites',
      goalOptions: [
        'Criar cardápio digital oficial',
        'Incentivar pedidos diretos via WhatsApp',
        'Melhorar apresentação nas buscas do Google',
        'Aumentar vendas de combos específicos',
        'Facilitar a experiência mobile dos clientes'
      ]
    }
  },

  // ============================================================================
  // BAURU - PIZZARIAS - WHATSAPP IA
  // ============================================================================
  'bauru/pizzarias/whatsapp-ia': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'pizzarias',
    segmentName: 'Pizzarias',
    serviceSlug: 'whatsapp-ia',
    serviceName: 'WhatsApp com IA',
    status: 'published',
    publicationReason: 'organic_opportunity',
    seo: {
      title: 'WhatsApp com IA para Pizzarias em Bauru | Nextia',
      description: 'Atenda clientes da sua pizzaria em Bauru rapidamente em horários de pico. IA para responder horários, enviar cardápio e agilizar pedidos no WhatsApp.',
      keywords: ['whatsapp ia pizzaria', 'chatbot pizzaria bauru', 'automação whatsapp delivery', 'atendimento automático restaurante', 'ia para delivery'],
      schemaServiceType: 'SoftwareApplication'
    },
    leadSource: 'local_niche_bauru_pizzarias_whatsappia',
    formServiceValue: 'whatsapp-ia',
    hero: {
      badge: 'Solução para Dias de Pico',
      h1: 'WhatsApp com IA para Pizzarias em Bauru',
      h1Highlight: 'Pizzarias em Bauru',
      subtitle: 'Sexta-feira à noite e o WhatsApp não para? Automatize respostas sobre taxa de entrega, áreas atendidas e cardápio, permitindo que a equipe foque apenas em registrar os pedidos reais.',
      ctaPrimaryText: 'Conhecer IA para Delivery',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Como Funciona',
      whatsappMessage: 'Olá! Sou dono de pizzaria em Bauru e quero saber como a IA da Nextia pode agilizar meu WhatsApp nos dias movimentados.',
      highlights: ['Envio Automático de Cardápio', 'Informações de Horários', 'Suporte a Dúvidas Comuns', 'Pausa Inteligente no Pedido']
    },
    problems: {
      title: 'Os Desafios do Atendimento Via Chat',
      subtitle: 'Quando a demanda cresce, a demora em responder no WhatsApp custa clientes para o concorrente.',
      items: [
        {
          title: 'Avalanche em Horários de Pico',
          description: 'Entre 19h e 21h, a equipe não dá conta de responder dezenas de mensagens simultâneas pedindo cardápio.',
          iconName: 'TrendingUp'
        },
        {
          title: 'Perguntas Repetitivas',
          description: 'Perda de tempo vital respondendo repetidamente se aceitam vale-refeição, pix, ou valor da entrega em determinado bairro.',
          iconName: 'HelpCircle'
        },
        {
          title: 'Perda de Pedidos por Lentidão',
          description: 'O cliente tem fome, e se a pizzaria demora 15 minutos para mandar o cardápio, ele acaba pedindo em outro lugar.',
          iconName: 'Clock'
        },
        {
          title: 'Dificuldade de Escalar Atendimento',
          description: 'Contratar mais atendentes fixos apenas para os horários de maior fluxo muitas vezes inviabiliza a operação.',
          iconName: 'Users'
        }
      ]
    },
    solution: {
      title: 'A Inteligência Preparando a Venda',
      subtitle: 'A IA assume as dúvidas repetitivas de forma natural, garantindo que o cliente chegue pronto para fazer o pedido.',
      features: [
        {
          title: 'Apresentação Imediata',
          description: 'Envio automático e instantâneo do link do cardápio logo na saudação inicial.',
          iconName: 'Zap'
        },
        {
          title: 'Esclarecimento de Dúvidas',
          description: 'A IA é treinada para responder sobre áreas de entrega, horários e formas de pagamento da casa.',
          iconName: 'MessageSquare'
        },
        {
          title: 'Triagem de Problemas',
          description: 'Se o contato é para reclamar de atraso ou resolver um equívoco, alerta imediatamente o gerente.',
          iconName: 'AlertTriangle'
        },
        {
          title: 'Coleta de Endereço',
          description: 'Pode ser configurada para perguntar rua e bairro logo no início da conversa, antecipando informações.',
          iconName: 'MapPin'
        },
        {
          title: 'Pausa para Atendimento Humano',
          description: 'Quando o cliente começa a listar os sabores, a IA transfere sem atrito para o atendente humano concluir a venda.',
          iconName: 'UserCheck'
        }
      ]
    },
    ecosystem: {
      title: 'Operação Completa de Vendas',
      subtitle: 'Para um delivery saudável, a estrutura importa tanto quanto o sabor.',
      pillars: [
        {
          title: 'Comunicação Rápida',
          description: 'A IA cuida da recepção e não deixa ninguém esperando.',
          iconName: 'Bot'
        },
        {
          title: 'Base Centralizada',
          description: 'O site garante que o cliente sempre encontre a pizzaria no Google.',
          iconName: 'Layout',
          linkSlug: '/bauru/pizzarias/criacao-de-sites'
        }
      ]
    },
    localContext: {
      title: 'O Dinamismo Noturno da Cidade',
      paragraphs: [
        'Gerenciar pedidos no balcão, despachar entregadores para a Falcão, Vila Universitária ou Mary Dota e ainda teclar no celular é um desafio conhecido pelos donos de delivery bauruenses.',
        'A implantação de uma recepção com Inteligência Artificial corta pela metade o tempo que o atendente leva na etapa de dúvidas iniciais, focando o humano estritamente em garantir que a meia calabresa e meia muçarela saiam perfeitas e rápidas.'
      ],
      points: [
        'Respostas em segundos aos finais de semana',
        'Fim da digitação de textos imensos em dias cheios',
        'Triagem de endereços para otimizar rota do entregador',
        'Imagem de atendimento moderno e organizado'
      ]
    },
    journey: {
      title: 'A Dinâmica de um Atendimento Misto',
      steps: [
        {
          label: 'O Olá',
          description: 'Cliente manda mensagem; IA responde em 1 segundo e envia link do cardápio.'
        },
        {
          label: 'A Dúvida',
          description: 'Cliente pergunta: "Entrega na Vila Aviação?". A IA responde "Sim, a taxa é X, deseja pedir?"'
        },
        {
          label: 'A Transição',
          description: 'Cliente diz "Vou querer uma portuguesa". A IA avisa a equipe e encerra o modo automático.'
        },
        {
          label: 'A Venda',
          description: 'Atendente finaliza confirmando endereço e valor total em instantes.'
        }
      ]
    },
    faqs: [
      {
        question: 'A IA consegue registrar todo o pedido sozinha no sistema de comandas?',
        answer: 'Nossa abordagem inicial para pizzarias foca no pré-atendimento (envio de cardápio, tira-dúvidas) e passa para o humano finalizar. Não prometemos integrações diretas de cardápios com IA transacionais complexas sem análise prévia de compatibilidade do seu sistema.'
      },
      {
        question: 'A IA inventa promoções que não existem?',
        answer: 'Não. Ela recebe as "regras da casa" durante a implantação e não foge desse escopo. Se você não tiver promoção de borda grátis, ela saberá negar educadamente.'
      },
      {
        question: 'Meus clientes vão achar robótico demais?',
        answer: 'Hoje a tecnologia permite tons de voz muito amigáveis. Além disso, os clientes preferem receber o cardápio em 1 segundo de forma "robótica" do que esperar 20 minutos por um humano ocupado.'
      },
      {
        question: 'Funciona para contatos simultâneos?',
        answer: 'Sim, a IA consegue atender 10, 50 ou 100 clientes ao mesmo tempo que chegarem sexta-feira às 20h, mandando as informações básicas a todos de forma imediata.'
      },
      {
        question: 'A IA trabalha com áudios?',
        answer: 'Dependendo do pacote e configurações avançadas, a ferramenta pode transcrever áudios enviados pelos clientes para que a equipe não perca tempo ouvindo mensagens longas em meio ao barulho da cozinha.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/whatsapp-ia',
      segmentPage: '/solucoes/pizzarias',
      relatedNichePages: [
        { label: 'Criação de Sites para Pizzarias em Bauru', path: '/bauru/pizzarias/criacao-de-sites' }
      ]
    },
    templateSlugs: [],
    formDefaults: {
      city: 'Bauru',
      segment: 'Pizzarias',
      service: 'WhatsApp com IA',
      goalOptions: [
        'Atendimento instantâneo em picos de horário',
        'Automatizar envio de cardápio digital',
        'Organizar dúvidas de horários e taxa de entrega',
        'Impedir perda de pedidos por demora no retorno'
      ]
    }
  },

  // ============================================================================
  // BAURU - CLÍNICAS - CRIAÇÃO DE SITES
  // ============================================================================
  'bauru/clinicas/criacao-de-sites': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'clinicas',
    segmentName: 'Clínicas Médicas e Estéticas',
    serviceSlug: 'criacao-de-sites',
    serviceName: 'Criação de Sites',
    status: 'published',
    publicationReason: 'search_demand',
    seo: {
      title: 'Criação de Sites para Clínicas em Bauru | Nextia',
      description: 'Desenvolvimento de sites profissionais para clínicas médicas e estéticas em Bauru. Mostre especialidades, corpo clínico e facilite agendamentos via WhatsApp.',
      keywords: ['sites para clínicas médicas bauru', 'site de clínica de estética', 'agência de criação de site médico', 'marketing em saúde bauru', 'site corpo clínico'],
      schemaServiceType: 'WebDesign'
    },
    leadSource: 'local_niche_bauru_clinicas_sites',
    formServiceValue: 'criacao-de-sites',
    hero: {
      badge: 'Presença Digital em Saúde',
      h1: 'Criação de Sites para Clínicas em Bauru',
      h1Highlight: 'Clínicas em Bauru',
      subtitle: 'Transmita confiança, apresente o corpo clínico e facilite a vida dos seus pacientes. Um site desenvolvido para o setor de saúde que respeita normas éticas e direciona buscas locais para a recepção da sua clínica.',
      ctaPrimaryText: 'Ter um Site para a Clínica',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Como Estruturamos',
      whatsappMessage: 'Olá! Administro uma clínica em Bauru e gostaria de orçar a criação de um site com a Nextia.',
      highlights: ['Apresentação de Especialidades', 'Corpo Clínico Detalhado', 'Direcionamento para Agendamento', 'Design Focado em Confiança']
    },
    problems: {
      title: 'A Dificuldade de Ser Encontrado na Saúde',
      subtitle: 'A jornada do paciente inicia no Google. Se a clínica não apresenta autoridade lá, perde a oportunidade de acolher.',
      items: [
        {
          title: 'Clínica sem Identidade Online',
          description: 'Pacientes tentam validar o endereço ou conhecer o local antes da primeira consulta, mas não encontram site algum.',
          iconName: 'UserX'
        },
        {
          title: 'Especialidades Ocultas',
          description: 'O paciente precisa ligar para descobrir se o local atende neurologia ou possui exame de ultrassom.',
          iconName: 'SearchX'
        },
        {
          title: 'Falta de Facilidade no Agendamento',
          description: 'A ausência de links claros para o WhatsApp ou central de atendimento frustra quem quer marcar uma consulta rapidamente.',
          iconName: 'PhoneOff'
        },
        {
          title: 'Dúvidas Sobre Convênios',
          description: 'A equipe de recepção perde horas respondendo se aceita Unimed, Bradesco ou outros planos locais.',
          iconName: 'ShieldAlert'
        },
        {
          title: 'Estética Antiga',
          description: 'Design da década passada em sites de saúde passa uma imagem de falta de inovação e cuidado aos olhos do usuário.',
          iconName: 'AlertOctagon'
        }
      ]
    },
    solution: {
      title: 'O Espaço Virtual da Sua Clínica',
      subtitle: 'Estruturamos páginas que equilibram informação clara, elegância visual e direcionamento prático para agendamentos.',
      features: [
        {
          title: 'Catálogo de Especialidades',
          description: 'Áreas dedicadas para explicar cada procedimento, exame ou atendimento realizado.',
          iconName: 'Heart'
        },
        {
          title: 'Página do Corpo Clínico',
          description: 'Apresentação dos profissionais, currículo e CRM, aumentando a autoridade técnica da clínica.',
          iconName: 'Users'
        },
        {
          title: 'Acessibilidade de Contato',
          description: 'Botões fixos de WhatsApp para falar direto com o agendamento em poucos cliques.',
          iconName: 'MessageCircle'
        },
        {
          title: 'Informações Essenciais',
          description: 'Áreas de destaque para convênios atendidos, horário de funcionamento e localização com mapa.',
          iconName: 'MapPin'
        },
        {
          title: 'Design Limpo e Responsivo',
          description: 'Cores que transmitem calma e saúde, com navegação impecável pelo celular.',
          iconName: 'Smartphone'
        }
      ]
    },
    ecosystem: {
      title: 'Soluções 360 para a Saúde',
      subtitle: 'Fortaleça todo o fluxo de pacientes.',
      pillars: [
        {
          title: 'Presença e Confiança',
          description: 'O site para demonstrar as instalações e capacitação da equipe.',
          iconName: 'Layout'
        },
        {
          title: 'Automação na Recepção',
          description: 'Melhorias em como o WhatsApp gerencia os retornos de agenda.',
          iconName: 'Cpu'
        }
      ]
    },
    localContext: {
      title: 'Referência Médica na Região',
      paragraphs: [
        'Bauru atua como um grande polo de saúde, recebendo pacientes de diversas cidades do interior paulista para consultas e procedimentos específicos. Para atrair esse público, é fundamental que a clínica seja bem referenciada digitalmente.',
        'Desenvolvemos estruturas respeitando sempre a privacidade e diretrizes do setor, com o objetivo claro de conectar quem precisa de cuidado com a especialidade do seu corpo clínico de forma rápida e segura.'
      ],
      points: [
        'Visibilidade para pacientes de Bauru e região',
        'Centralização de todas as informações vitais',
        'Valorização do investimento na infraestrutura da clínica',
        'Auxílio prático ao processo de marcação'
      ]
    },
    journey: {
      title: 'O Paciente Encontrando Sua Clínica',
      steps: [
        {
          label: 'A Necessidade',
          description: 'Paciente procura por "Dermatologista em Bauru" ou descobre o nome da sua clínica via indicação.'
        },
        {
          label: 'A Validação',
          description: 'Entra no site, vê fotos da fachada, sala de espera agradável e confere o perfil do médico.'
        },
        {
          label: 'A Decisão',
          description: 'Visualiza que a clínica atende o seu convênio ou verifica as condições particulares.'
        },
        {
          label: 'O Agendamento',
          description: 'Com confiança estabelecida, clica no botão de agendamento e é direcionado para a secretária.'
        }
      ]
    },
    faqs: [
      {
        question: 'O site terá marcação de consulta automática sem passar pela secretária?',
        answer: 'Por padrão focamos em direcionar o contato via WhatsApp para que a equipe de recepção faça o acolhimento e confirmação, pois marcações na saúde costumam exigir triagem de exames e encaixes. Porém, podemos colocar links para ferramentas externas se você já as utilizar (ex: Doctoralia).'
      },
      {
        question: 'O site vai receitar procedimentos e atuar como um médico online?',
        answer: 'De forma alguma. As informações de saúde são apenas orientativas institucionais e o site jamais substitui diagnósticos, seguindo todas as orientações éticas.'
      },
      {
        question: 'É possível incluir uma galeria de fotos da clínica?',
        answer: 'Sim! Destacar a estrutura, salas de espera confortáveis e consultórios modernos é essencial para construir a imagem de qualidade da clínica.'
      },
      {
        question: 'Como divulgar as regras de convênios, que mudam frequentemente?',
        answer: 'Criamos áreas no site fáceis de gerenciar, focando na lista de logotipos dos principais planos aceitos e um aviso para confirmar elegibilidade específica no atendimento.'
      },
      {
        question: 'As páginas são otimizadas para as buscas regionais?',
        answer: 'Sim, aplicamos otimização local (SEO) visando que sua clínica ganhe relevância quando pesquisam por especialidades médicas na cidade.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/criacao-de-sites',
      segmentPage: '/solucoes/clinicas',
      relatedNichePages: []
    },
    templateSlugs: ['clinica-estetica'],
    formDefaults: {
      city: 'Bauru',
      segment: 'Clínicas',
      service: 'Criação de Sites',
      goalOptions: [
        'Apresentar corpo clínico e especialidades',
        'Facilitar agendamentos via WhatsApp',
        'Mostrar estrutura e equipamentos do local',
        'Esclarecer dúvidas sobre convênios e planos',
        'Ganhar credibilidade e ranqueamento local'
      ]
    }
  },

  // ============================================================================
  // BAURU - IMOBILIÁRIAS - CRIAÇÃO DE SITES
  // ============================================================================
  'bauru/imobiliarias/criacao-de-sites': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    segmentSlug: 'imobiliarias',
    segmentName: 'Imobiliárias',
    serviceSlug: 'criacao-de-sites',
    serviceName: 'Criação de Sites',
    status: 'published',
    publicationReason: 'search_demand',
    seo: {
      title: 'Criação de Sites para Imobiliárias em Bauru | Nextia',
      description: 'Crie um site profissional para sua imobiliária em Bauru com catálogo de imóveis, busca avançada, painel para corretores e forte captação de leads.',
      keywords: ['sites para imobiliárias bauru', 'sistema imobiliário', 'vitrine de imóveis online', 'site para corretor de imóveis', 'agência criação site imobiliária'],
      schemaServiceType: 'WebDesign'
    },
    leadSource: 'local_niche_bauru_imobiliarias_sites',
    formServiceValue: 'criacao-de-sites',
    hero: {
      badge: 'Solução Imobiliária Completa',
      h1: 'Criação de Sites para Imobiliárias em Bauru',
      h1Highlight: 'Imobiliárias em Bauru',
      subtitle: 'Mais do que uma vitrine bonita: uma máquina de vendas e captação de imóveis. Ofereça busca inteligente por bairros de Bauru, destaque seus lançamentos e capture contatos com assertividade.',
      ctaPrimaryText: 'Apresentar Meu Portfólio',
      ctaPrimaryLink: '#contato',
      ctaSecondaryText: 'Ver Ferramentas do Site',
      whatsappMessage: 'Olá! Sou de uma imobiliária em Bauru e quero conhecer os sites para imobiliárias da Nextia.',
      highlights: ['Busca com Filtros Avançados', 'Páginas Detalhadas por Imóvel', 'Painel de Corretores', 'Captação Integrada']
    },
    problems: {
      title: 'Os Obstáculos da Venda de Imóveis Online',
      subtitle: 'Quando o catálogo é bagunçado e os leads escapam por falhas na comunicação, a imobiliária perde dinheiro.',
      items: [
        {
          title: 'Imóveis Mal Apresentados',
          description: 'A falta de um ambiente centralizado faz com que os imóveis fiquem espalhados em PDFs ou anúncios soltos que expiram.',
          iconName: 'ImageOff'
        },
        {
          title: 'Sem Vitrine Própria',
          description: 'Dependência perigosa de portais terceiros muito caros, sem um canal forte para trabalhar a marca da própria imobiliária.',
          iconName: 'Store'
        },
        {
          title: 'Leads Perdidos no WhatsApp Pessoal',
          description: 'Os clientes chamam o corretor e não entram na base da imobiliária, dificultando o acompanhamento comercial.',
          iconName: 'UsersX'
        },
        {
          title: 'Dificuldade de Filtrar',
          description: 'Clientes querem buscar "Apartamento 3 quartos Vila Aviação", mas o site atual não possui busca por bairros ou filtros funcionais.',
          iconName: 'FilterX'
        },
        {
          title: 'Informações Incompletas',
          description: 'Páginas que não mostram claramente valor do condomínio, IPTU e características chaves do imóvel.',
          iconName: 'FileMinus'
        }
      ]
    },
    solution: {
      title: 'A Sua Vitrine Exclusiva',
      subtitle: 'Estruturamos portais imobiliários que oferecem a melhor experiência de busca para o cliente e forte poder de gestão para o corretor.',
      features: [
        {
          title: 'Catálogo de Imóveis',
          description: 'Listagem elegante com separação clara entre venda, locação e lançamentos.',
          iconName: 'Home'
        },
        {
          title: 'Busca Inteligente e Filtros',
          description: 'Ferramenta para o cliente pesquisar por finalidade, tipo, cidade, bairro, preço, dormitórios e vagas.',
          iconName: 'Search'
        },
        {
          title: 'Página Individual Rica',
          description: 'Galeria de fotos otimizada, vídeo, descrição completa, mapa de localização e valores discriminados.',
          iconName: 'FileText'
        },
        {
          title: 'Captura de Leads no Imóvel',
          description: 'Formulários em cada página de imóvel com a referência enviada automaticamente ao corretor.',
          iconName: 'Target'
        },
        {
          title: 'WhatsApp com Contexto',
          description: 'Quando o cliente clica para falar no WhatsApp de dentro do site, a mensagem já informa qual o código do imóvel.',
          iconName: 'MessageSquare'
        }
      ]
    },
    ecosystem: {
      title: 'Evoluindo a Jornada Imobiliária',
      subtitle: 'Conecte sua vitrine aos processos internos e melhore a eficiência de vendas.',
      pillars: [
        {
          title: 'Vitrine Profissional',
          description: 'Seu catálogo web que fortalece a marca local.',
          iconName: 'Layout'
        },
        {
          title: 'Automação de Leads',
          description: 'Direcionamento inteligente do site para o CRM de corretores.',
          iconName: 'Cpu',
          linkSlug: '/bauru/automacao'
        }
      ]
    },
    localContext: {
      title: 'O Mercado Imobiliário em Bauru',
      paragraphs: [
        'Bauru vive um forte ritmo de expansão imobiliária, tanto no mercado de alto padrão em condomínios da zona sul, quanto nos loteamentos e edifícios universitários e verticais de novos bairros.',
        'Atender esse público cada vez mais exigente requer velocidade. Seu novo site permite que investidores ou famílias encontrem os lançamentos, verifiquem plantas e acionem seus corretores antes de irem para a concorrência.'
      ],
      points: [
        'Destaque para lançamentos da construção civil local',
        'Valorização visual de condomínios fechados da região',
        'Facilidade para proprietários cadastrarem seus imóveis na pauta',
        'Ferramenta robusta para atuação dos corretores'
      ]
    },
    journey: {
      title: 'A Busca Pela Casa Nova',
      steps: [
        {
          label: 'A Procura',
          description: 'O cliente pesquisa no Google, encontra seu site e utiliza os filtros focando em bairros da sua preferência.'
        },
        {
          label: 'A Análise',
          description: 'Ele navega confortavelmente pelas fotos no celular de um apartamento que se encaixa no orçamento.'
        },
        {
          label: 'O Interesse',
          description: 'O imóvel agradou. O cliente preenche o formulário ou clica no botão do WhatsApp.'
        },
        {
          label: 'O Atendimento',
          description: 'O corretor recebe a notificação já sabendo exatamente qual o código da unidade para agir rapidamente.'
        }
      ]
    },
    faqs: [
      {
        question: 'O site integra com portais como Zap e Viva Real?',
        answer: 'Nossos projetos podem ter arquitetura para integração de dados desde que a imobiliária possua os CRMs ou integradores (como Vista ou sistemas similares) que façam essa ponte e forneçam APIs para tal.'
      },
      {
        question: 'A imobiliária terá painel para atualizar os imóveis?',
        answer: 'Sim, o site inclui um painel gerencial ou integração para que vocês adicionem novas casas, alterem fotos, preços ou mudem o status para vendido/alugado rapidamente.'
      },
      {
        question: 'É possível separar a visão de venda, locação e lançamentos na planta?',
        answer: 'Com certeza. Estruturamos abas e categorias diferentes para que o consumidor encontre exatamente a finalidade imobiliária que busca.'
      },
      {
        question: 'Posso ter uma página para captar novos imóveis?',
        answer: 'Sim. Incluímos formulários específicos "Anuncie seu imóvel" para proprietários enviarem dados e fotos, virando leads para o departamento de angariação.'
      },
      {
        question: 'O cliente precisa criar conta para ver o valor?',
        answer: 'Por padrão deixamos tudo acessível para gerar o maior número de leads. O objetivo é remover o atrito e fazer com que ele contate o corretor pela facilidade e clareza da informação.'
      }
    ],
    relatedPages: {
      cityPage: '/bauru',
      cityServicePage: '/bauru/criacao-de-sites',
      segmentPage: '/solucoes/imobiliarias',
      relatedNichePages: []
    },
    templateSlugs: ['imobiliaria', 'imobiliaria-premium'],
    formDefaults: {
      city: 'Bauru',
      segment: 'Imobiliárias',
      service: 'Criação de Sites',
      goalOptions: [
        'Profissionalizar o catálogo online',
        'Facilitar a busca por filtros e bairros',
        'Reduzir dependência de portais de terceiros',
        'Integrar contatos direto para os corretores',
        'Destaque para novos lançamentos imobiliários'
      ]
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const PUBLISHED_LOCAL_NICHE_SLUGS = Object.keys(LOCAL_NICHE_SERVICES).filter(
  (slug) => LOCAL_NICHE_SERVICES[slug].status === 'published'
);

export function getLocalNicheServiceData(
  citySlug: string,
  segmentSlug: string,
  serviceSlug: string
): LocalNicheServiceData | null {
  const normalizedCity = String(citySlug || '').toLowerCase().trim();
  const normalizedSegment = String(segmentSlug || '').toLowerCase().trim();
  const normalizedService = String(serviceSlug || '').toLowerCase().trim();
  const key = `${normalizedCity}/${normalizedSegment}/${normalizedService}`;
  return LOCAL_NICHE_SERVICES[key] || null;
}

export function getAllPublishedLocalNicheServices(): LocalNicheServiceData[] {
  return Object.values(LOCAL_NICHE_SERVICES).filter((item) => item.status === 'published');
}
