export interface LocalServiceBenefit {
  title: string;
  description: string;
  iconName: 'zap' | 'smartphone' | 'search' | 'message-circle' | 'gauge' | 'target' | 'shield-check' | 'cpu' | 'clock' | 'lock' | 'database' | 'headphones' | 'shopping-bag' | string;
}

export interface LocalServiceModality {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  recommendedFor: string;
}

export interface LocalServiceProblemSolution {
  title: string;
  subtitle: string;
  problemList: { title: string; desc: string }[];
  solutionList: { title: string; desc: string }[];
}

export interface LocalServiceFaq {
  question: string;
  answer: string;
}

export interface RelatedLocalService {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface LocalServiceData {
  citySlug: string;
  cityName: string;
  state: string;
  serviceSlug: string;
  serviceCategoryName: string;
  status: 'published' | 'draft';
  leadSource: string;
  formServiceValue: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaServiceType: string;
  hero: {
    badge: string;
    h1: string;
    h1Highlight: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryAnchor: string;
    ctaSecondaryText: string;
    ctaSecondaryAnchor: string;
    whatsappMessage: string;
    highlights: string[];
  };
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: LocalServiceBenefit[];
  problemSolution: LocalServiceProblemSolution;
  modalitiesTitle: string;
  modalitiesSubtitle: string;
  modalities: LocalServiceModality[];
  segmentsTitle: string;
  segmentsSubtitle: string;
  segments: { name: string; desc: string; icon: string }[];
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorks: { step: string; title: string; desc: string }[];
  differentialsTitle: string;
  differentialsSubtitle: string;
  differentials: { title: string; desc: string; iconName: string }[];
  nextia360Title: string;
  nextia360Subtitle: string;
  nextia360Text: string;
  localContextTitle: string;
  localContextSubtitle: string;
  localContextText1: string;
  localContextText2: string;
  localContextPoints: string[];
  relatedServicesTitle: string;
  relatedServicesSubtitle: string;
  relatedServices: RelatedLocalService[];
  faqs: LocalServiceFaq[];
  finalCta: {
    title: string;
    subtitle: string;
    primaryCta: string;
    whatsappCta: string;
  };
}

export const LOCAL_SERVICES_DATA: Record<string, LocalServiceData> = {
  // =========================================================================
  // 1. BAURU — CRIAÇÃO DE SITES
  // =========================================================================
  'bauru/criacao-de-sites': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'criacao-de-sites',
    serviceCategoryName: 'Criação de Sites',
    status: 'published',
    leadSource: 'pagina_bauru_criacao_de_sites',
    formServiceValue: 'Criação de Site',
    metaTitle: 'Criação de Sites em Bauru | Sites Profissionais | Nextia',
    metaDescription: 'Criação de sites profissionais em Bauru com design responsivo, SEO, velocidade e WhatsApp integrado. Solicite seu orçamento com a Nextia.',
    keywords: [
      'criação de sites em Bauru',
      'criação de site Bauru',
      'desenvolvimento de sites Bauru',
      'empresa de criação de sites Bauru',
      'agência de sites Bauru',
      'web design Bauru',
      'site profissional Bauru',
      'site para empresa Bauru',
      'landing page Bauru',
      'site institucional Bauru',
      'site responsivo Bauru',
      'site otimizado para Google Bauru',
    ],
    schemaServiceType: 'WebSiteDevelopment',
    hero: {
      badge: 'Criação de Sites Profissionais em Bauru/SP',
      h1: 'Criação de Sites em Bauru para Empresas que ',
      h1Highlight: 'Querem Crescer e Vender Mais',
      subtitle: 'A Nextia cria sites profissionais, rápidos e preparados para transformar visitantes em oportunidades reais de negócio para empresas de Bauru e região.',
      ctaPrimaryText: 'Solicitar orçamento',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver modelos de sites',
      ctaSecondaryAnchor: '#modelos-sites',
      whatsappMessage: 'Olá! Encontrei a Nextia pesquisando criação de sites em Bauru e gostaria de receber mais informações.',
      highlights: [
        'Design moderno e 100% responsivo para smartphones',
        'Estrutura preparada para indexação e busca no Google',
        'Botões estratégicos de WhatsApp e formulários de alta conversão',
        'Hospedagem rápida com certificado SSL e suporte contínuo',
      ],
    },
    benefitsTitle: 'Vantagens Reais do Seu Novo Site Profissional',
    benefitsSubtitle: 'Cada detalhe é planejado para transmitir credibilidade e gerar contatos comerciais em Bauru:',
    benefits: [
      {
        title: 'Design Profissional & Exclusivo',
        description: 'Layout moderno alinhado à identidade visual da sua marca para destacar seu negócio da concorrência local.',
        iconName: 'target',
      },
      {
        title: '100% Responsivo no Celular',
        description: 'Navegação fluida e perfeita em smartphones, tablets e computadores, onde mais de 80% dos clientes acessam.',
        iconName: 'smartphone',
      },
      {
        title: 'Otimização Técnica de SEO',
        description: 'Código semântico e meta tags estruturadas para facilitar que o Google encontre e indexe sua empresa em Bauru.',
        iconName: 'search',
      },
      {
        title: 'WhatsApp Integrado com Agilidade',
        description: 'Botões de contato flutuantes e chamadas de ação que direcionam o visitante diretamente para sua equipe comercial.',
        iconName: 'message-circle',
      },
      {
        title: 'Alta Performance & Velocidade',
        description: 'Carregamento instantâneo seguindo as diretrizes de Core Web Vitals para reter visitantes e diminuir taxa de rejeição.',
        iconName: 'gauge',
      },
      {
        title: 'Estrutura Focada em Conversão',
        description: 'Hierarquia de conteúdo planejada para conduzir o visitante até a solicitação de orçamento ou pedido.',
        iconName: 'zap',
      },
    ],
    problemSolution: {
      title: 'Seu site atual está ajudando ou atrapalhando sua empresa em Bauru?',
      subtitle: 'Identifique os sintomas mais comuns de uma presença digital defasada e veja a solução que a Nextia entrega:',
      problemList: [
        {
          title: 'Empresa sem site próprio ou dependente só de redes sociais',
          desc: 'Perda de clientes que pesquisam no Google por serviços em Bauru e não encontram uma página institucional confiável.',
        },
        {
          title: 'Site antigo, lento ou quebrado no celular',
          desc: 'Visitantes desistem da navegação antes mesmo de carregar as informações ou visualizar o catálogo de serviços.',
        },
        {
          title: 'Falta de botões claros de contato e formulários',
          desc: 'Visitantes encontram o site, mas não sabem como solicitar orçamento rapidamente ou chamar no WhatsApp.',
        },
        {
          title: 'Site invisível nos mecanismos de busca',
          desc: 'Páginas construídas sem cuidados básicos de SEO, meta tags ou dados estruturados para a região de Bauru.',
        },
      ],
      solutionList: [
        {
          title: 'Presença digital com autoridade e domínio próprio',
          desc: 'Página institucional moderna com seu endereço .com.br, e-mails profissionais e apresentação impecável dos seus serviços.',
        },
        {
          title: 'Velocidade extrema e navegação mobile impecável',
          desc: 'Desenvolvido com tecnologias modernas (React e HTML semântico) para abrir em menos de 2 segundos no celular.',
        },
        {
          title: 'Canais de conversão diretos para o WhatsApp',
          desc: 'Gatilhos de conversão e formulários que encaminham os dados do lead diretamente para o seu time de atendimento.',
        },
        {
          title: 'Estrutura técnica pronta para buscas em Bauru',
          desc: 'Títulos, cabeçalhos, sitemap e Schema.org configurados para potencializar a relevância local da sua empresa.',
        },
      ],
    },
    modalitiesTitle: 'Formatos de Sites Desenvolvidos para Empresas de Bauru',
    modalitiesSubtitle: 'Escolha a estrutura mais adequada para a estratégia e o momento do seu negócio:',
    modalities: [
      {
        title: 'Site Institucional Completo',
        tagline: 'Credibilidade e apresentação completa da empresa',
        description: 'Ideal para apresentar história, corpo técnico, diferenciais, portfólio de serviços, depoimentos e dados de contato com páginas dedicadas.',
        features: ['Páginas institucionais (Quem Somos, Serviços, Contato)', 'Galeria de fotos e portfólio', 'Formulários de orçamento e mapa'],
        recommendedFor: 'Empresas consolidadas, indústrias, clínicas e escritórios contábeis e jurídicos em Bauru.',
      },
      {
        title: 'Landing Page de Alta Conversão',
        tagline: 'Foco total em uma oferta específica ou campanha',
        description: 'Página única desenhada com narrativa persuasiva para direcionar o tráfego de Google Ads, Meta Ads ou campanhas locais para uma única ação de contato.',
        features: ['Página única estratégica', 'Gatilhos mentais e benefícios diretos', 'Máxima velocidade para campanhas pagas'],
        recommendedFor: 'Lançamentos, captação de matrículas, promoções de serviços e prestadores autônomos.',
      },
      {
        title: 'Site com Catálogo de Produtos & Orçamento',
        tagline: 'Vitrine digital organizada com orçamento rápido',
        description: 'Exiba seus produtos categorizados com fotos e especificações técnicas, permitindo que o cliente monte uma lista e finalize no WhatsApp.',
        features: ['Catálogo por categorias', 'Filtros de busca rápida', 'Botão "Orçar no WhatsApp"'],
        recommendedFor: 'Distribuidores, lojas de móveis, materiais de construção e comércio atacadista.',
      },
      {
        title: 'Site Integrado à Automação & IA',
        tagline: 'Atendimento inteligente 24 horas por dia',
        description: 'Seu site conectado ao robô de atendimento com IA no WhatsApp, agendamento de horários e integração com ferramentas internas.',
        features: ['Integração com IA no WhatsApp', 'Agendamento online de reuniões', 'Conexão com CRM e e-mails'],
        recommendedFor: 'Empresas com alto volume de contatos diários que buscam agilidade na triagem.',
      },
    ],
    segmentsTitle: 'Sites Especializados por Segmento em Bauru',
    segmentsSubtitle: 'Estruturas personalizadas para as necessidades de cada área de atuação:',
    segments: [
      { name: 'Contabilidades & Escritórios', desc: 'Portais de serviços e captação de novos clientes PJ em Bauru.', icon: '📊' },
      { name: 'Clínicas & Consultórios Médicos', desc: 'Apresentação de especialidades e marcação facilitada de consultas.', icon: '🏥' },
      { name: 'Dentistas & Odontologia', desc: 'Galeria de tratamentos, tecnologia clínica e agendamento WhatsApp.', icon: '🦷' },
      { name: 'Advocacia & Jurídico', desc: 'Posicionamento sóbrio e autoridade para escritórios de advocacia.', icon: '⚖️' },
      { name: 'Imobiliárias & Corretores', desc: 'Catálogo de imóveis com filtros por bairros de Bauru.', icon: '🏠' },
      { name: 'Restaurantes & Gastronomia', desc: 'Cardápios digitais interativos e reservas de mesas.', icon: '🍽️' },
      { name: 'Oficinas & Auto Centers', desc: 'Orçamentos rápidos de manutenção e serviços automotivos.', icon: '🔧' },
      { name: 'Indústrias & Empresas B2B', desc: 'Apresentação técnica de produtos para cotações corporativas.', icon: '🏭' },
    ],
    howItWorksTitle: 'Como Funciona a Criação do Seu Site na Nextia',
    howItWorksSubtitle: 'Um processo transparente e sem burocracia do planejamento até a publicação:',
    howItWorks: [
      { step: '01', title: 'Alinhamento & Briefing', desc: 'Conversamos sobre os objetivos da sua empresa em Bauru, público-alvo, referências visuais e serviços a destacar.' },
      { step: '02', title: 'Estruturação & Conteúdo', desc: 'Organizamos a arquitetura de informação, textos persuasivos, imagens e chamadas de ação.' },
      { step: '03', title: 'Desenvolvimento Técnico', desc: 'Construção do site com código veloz, responsividade total, segurança SSL e integração com WhatsApp.' },
      { step: '04', title: 'Apresentação & Ajustes', desc: 'Você navega na versão de demonstração e ajustamos detalhes de acordo com o escopo contratado.' },
      { step: '05', title: 'Publicação & Suporte', desc: 'Colocamos seu site no ar no seu domínio oficial e fornecemos orientações e suporte contínuo.' },
    ],
    differentialsTitle: 'Mais do que Apenas um Site: Um Ecossistema Completo',
    differentialsSubtitle: 'A Nextia conecta seu site a todas as outras ferramentas que sua empresa precisa em Bauru:',
    differentials: [
      { title: 'Conexão com WhatsApp & IA', desc: 'Integre o site a atendentes virtuais que respondem clientes 24 horas por dia.', iconName: 'bot' },
      { title: 'Suporte de TI & TechCare', desc: 'Conte com apoio técnico para seus computadores, redes e rotinas de backup.', iconName: 'headphones' },
      { title: 'Evolução para Loja Virtual', desc: 'Adicione catálogo com vendas por PIX e cartão quando seu negócio desejar expandir.', iconName: 'shopping-bag' },
      { title: 'Sistemas Web Sob Medida', desc: 'Conecte seu site a painéis administrativos e portais de clientes personalizados.', iconName: 'database' },
    ],
    nextia360Title: 'Seu Site Pode Ser o Começo de uma Estrutura Digital Completa',
    nextia360Subtitle: 'Conheça o conceito Nextia 360 para empresas em Bauru',
    nextia360Text: 'Com a Nextia, sua empresa não fica presa a fornecedores isolados. Você pode começar por um site profissional e futuramente conectar automações, inteligência artificial, suporte de TI e sistemas internos em um único parceiro de tecnologia.',
    localContextTitle: 'Desenvolvimento de Sites para o Mercado de Bauru/SP',
    localContextSubtitle: 'Atendimento próximo, comunicação ágil e foco no interior paulista.',
    localContextText1: 'Bauru possui um mercado consumidor exigente e competitivo. Empresas que investem em sites rápidos, profissionais e fáceis de navegar no smartphone ganham vantagem direta sobre concorrentes que ainda dependem apenas de cadastros antigos ou perfis de redes sociais.',
    localContextText2: 'A Nextia atende empresários, comércios e prestadores de serviços de Bauru com contratos claros, notas fiscais sob o CNPJ oficial 57.285.901/0001-94 e suporte direto pelo WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Atendimento consultivo direto pelo WhatsApp oficial: (14) 99640-5496',
      'Projetos desenvolvidos com rigor técnico, segurança e estabilidade',
      'Empresa formalizada sob o CNPJ 57.285.901/0001-94',
      'Suporte técnico e acompanhamento contínuo após a entrega',
    ],
    relatedServicesTitle: 'Você Também Pode Precisar em Bauru',
    relatedServicesSubtitle: 'Soluções complementares para impulsionar a tecnologia da sua empresa:',
    relatedServices: [
      { name: 'Loja Virtual & E-commerce', slug: 'loja-virtual', description: 'Venda produtos online com catálogo integrado e pagamento por PIX.', icon: '🛍️' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático inteligente 24 horas por dia no WhatsApp.', icon: '🤖' },
      { name: 'Suporte de TI & TechCare', slug: 'suporte-ti', description: 'Manutenção preventiva, suporte remoto e segurança de dados.', icon: '🛡️' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Elimine tarefas manuais e conecte ferramentas com workflows.', icon: '⚡' },
    ],
    faqs: [
      {
        question: 'Quanto custa criar um site profissional em Bauru?',
        answer: 'O valor varia conforme a estrutura do projeto: se é uma landing page focada em conversão, um site institucional completo com várias páginas ou um projeto com integrações complexas. Na Nextia, oferecemos opções acessíveis com modelos prontos para personalização e planos que incluem hospedagem, SSL e suporte contínuo. Solicite um orçamento sem compromisso para receber uma proposta detalhada.',
      },
      {
        question: 'Quanto tempo leva para o meu site ficar pronto?',
        answer: 'O prazo médio varia de acordo com a complexidade do projeto e a velocidade no envio dos materiais (textos, fotos e dados da empresa). Para modelos prontos personalizáveis, o prazo costuma ser de poucos dias úteis. Projetos 100% sob medida são alinhados em cronograma transparente antes do início.',
      },
      {
        question: 'O site funciona perfeitamente em celulares e smartphones?',
        answer: 'Sim, 100%. Todos os nossos sites são construídos com abordagem Mobile First e design responsivo, garantindo leitura agradável, botões acessíveis e carregamento rápido em qualquer tamanho de tela.',
      },
      {
        question: 'Meu site vai aparecer nas buscas do Google em Bauru?',
        answer: 'Desenvolvemos o site com todas as boas práticas de SEO técnico recomendadas pelo Google: código semântico, meta tags otimizadas, sitemap XML e dados estruturados Schema.org. Isso cria a base ideal para que o Google indexe sua empresa para termos locais em Bauru. Nenhuma agência séria pode garantir primeira posição fixa, mas entregamos a melhor estrutura técnica para seu posicionamento.',
      },
      {
        question: 'É possível colocar botão direto para o WhatsApp da minha equipe?',
        answer: 'Sim! Inserimos botões de WhatsApp flutuantes e chamadas de ação ao longo do site com mensagens pré-formatadas, facilitando para que o cliente entre em contato com apenas um clique.',
      },
      {
        question: 'Vocês também criam lojas virtuais em Bauru?',
        answer: 'Sim. Criamos lojas virtuais completas com catálogo de produtos, cálculo de frete, pagamento seguro via PIX e cartão, e notificações automáticas de novos pedidos no WhatsApp.',
      },
      {
        question: 'Posso escolher um modelo visual pronto para personalizar?',
        answer: 'Com certeza. Contamos com um catálogo de modelos profissionais em diversos segmentos (restaurantes, contabilidade, clínicas, estética, serviços, imobiliárias). Nós adaptamos as cores, logotipo, fotos e textos para a sua marca.',
      },
      {
        question: 'A Nextia oferece manutenção e suporte contínuo para o site?',
        answer: 'Sim. Nossos planos incluem hospedagem rápida, certificado de segurança SSL, monitoramento e suporte contínuo para que sua empresa não precise se preocupar com aspectos técnicos.',
      },
      {
        question: 'A Nextia atende empresas de Bauru e região?',
        answer: 'Sim! Atendemos ativamente empresas de Bauru, Jaú, Lençóis Paulista, Agudos, Botucatu e de todo o interior de São Paulo com comunicação ágil e direta pelo WhatsApp e videoconferência.',
      },
    ],
    finalCta: {
      title: 'Vamos criar o novo site profissional da sua empresa em Bauru?',
      subtitle: 'Fale com a equipe da Nextia e descubra qual modelo ou solução combina melhor com os objetivos do seu negócio.',
      primaryCta: 'Solicitar orçamento gratuito',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 2. BAURU — LOJA VIRTUAL
  // =========================================================================
  'bauru/loja-virtual': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'loja-virtual',
    serviceCategoryName: 'Loja Virtual & E-commerce',
    status: 'published',
    leadSource: 'pagina_bauru_loja_virtual',
    formServiceValue: 'Loja Virtual',
    metaTitle: 'Criação de Loja Virtual em Bauru | E-commerce com PIX | Nextia',
    metaDescription: 'Criação de lojas virtuais em Bauru com catálogo de produtos, pagamentos via PIX e cartão, cálculo de frete e integração WhatsApp. Conheça a Nextia.',
    keywords: [
      'criação de loja virtual em Bauru',
      'loja virtual Bauru',
      'e-commerce Bauru',
      'criar loja virtual Bauru',
      'loja online Bauru',
      'catálogo digital Bauru',
      'vendas online Bauru',
      'loja virtual com PIX Bauru',
    ],
    schemaServiceType: 'StoreDevelopment',
    hero: {
      badge: 'Criação de E-commerce & Lojas Virtuais em Bauru/SP',
      h1: 'Criação de Loja Virtual em Bauru para ',
      h1Highlight: 'Vender Online 24 Horas por Dia',
      subtitle: 'Venda seus produtos na internet com uma loja virtual profissional, rápida, com checkout transparente via PIX e cartão, cálculo de frete e pedidos organizados no WhatsApp.',
      ctaPrimaryText: 'Solicitar orçamento de loja',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver demonstração de loja',
      ctaSecondaryAnchor: '#modelos-sites',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre criação de loja virtual em Bauru para minha empresa.',
      highlights: [
        'Checkout transparente com pagamento instantâneo por PIX',
        'Cálculo automático de frete pelos Correios e transportadoras',
        'Painel simples para cadastro de produtos, fotos e variações',
        'Notificação instantânea de novas vendas no WhatsApp',
      ],
    },
    benefitsTitle: 'Recursos Essenciais para Sua Loja Virtual Vender Mais',
    benefitsSubtitle: 'Uma plataforma completa para o comércio de Bauru expandir suas vendas:',
    benefits: [
      { title: 'Checkout Transparente com PIX', description: 'Receba pagamentos com confirmação em segundos via PIX e parcelamento no cartão.', iconName: 'zap' },
      { title: 'Catálogo Fácil & Organizado', description: 'Fotos em alta qualidade, filtros por categoria, busca rápida e variações de tamanho e cor.', iconName: 'shopping-bag' },
      { title: 'Cálculo de Frete Dinâmico', description: 'Integração para cotação em tempo real com Correios, Melhor Envio ou entrega local.', iconName: 'gauge' },
      { title: 'Pedidos no WhatsApp', description: 'Possibilidade de finalizar pedidos diretamente no WhatsApp da sua loja com lista pronta.', iconName: 'message-circle' },
      { title: 'Segurança com Certificado SSL', description: 'Ambiente seguro e criptografado para proteger os dados e transações dos clientes.', iconName: 'shield-check' },
      { title: 'Design 100% Responsivo', description: 'Experiência de compra otimizada para quem compra pelo smartphone sem complicações.', iconName: 'smartphone' },
    ],
    problemSolution: {
      title: 'Sua empresa em Bauru ainda depende apenas do balcão ou de mensagens manuais?',
      subtitle: 'Compare as dificuldades de vender sem plataforma própria com a praticidade de uma loja Nextia:',
      problemList: [
        { title: 'Envio manual de fotos e preços no WhatsApp', desc: 'Perda de tempo repetindo descrições de produtos e calculando frete no chat.' },
        { title: 'Vendas perdidas fora do horário de atendimento', desc: 'Clientes interessados à noite ou nos fins de semana não conseguem comprar.' },
        { title: 'Cobrança manual e conferência de comprovantes', desc: 'Dificuldade para controlar quem pagou e riscos de comprovantes falsos.' },
      ],
      solutionList: [
        { title: 'Catálogo online autoexplicativo', desc: 'O cliente consulta fotos, medidas, estoques e preços de forma autônoma.' },
        { title: 'Vendas funcionando 24/7 de forma automática', desc: 'Seu e-commerce recebe o pedido e processa o pagamento a qualquer hora.' },
        { title: 'Confirmação automática de pagamento', desc: 'Sistema aprova o PIX ou cartão na hora e avisa seu time para separar o envio.' },
      ],
    },
    modalitiesTitle: 'Modelos de Lojas Virtuais em Bauru',
    modalitiesSubtitle: 'Adaptadas para varejo físico, atacado ou vendas digitais:',
    modalities: [
      {
        title: 'Loja Virtual Completa com Carrinho & Pagamento',
        tagline: 'Vendas automatizadas de ponta a ponta',
        description: 'Plataforma completa com carrinho de compras, cálculo de frete, pagamento com PIX/cartão e painel de pedidos.',
        features: ['Checkout integrado', 'Cálculo de frete em tempo real', 'Gestão de estoque e pedidos'],
        recommendedFor: 'Lojas de roupas, calçados, eletrônicos, cosméticos e varejo em geral.',
      },
      {
        title: 'Catálogo Digital com Pedido no WhatsApp',
        tagline: 'Ideal para atendimento consultivo ou entregas locais',
        description: 'Vitrine digital onde o cliente escolhe os produtos, monta a sacola e envia o pedido pronto para o seu WhatsApp.',
        features: ['Cardápio/Catálogo digital', 'Sem taxas por venda', 'Agilidade no atendimento local'],
        recommendedFor: 'Distribuidores locais, papelarias, restaurantes, mercados e delivery em Bauru.',
      },
    ],
    segmentsTitle: 'Segmentos de E-commerce Atendidos em Bauru',
    segmentsSubtitle: 'Estruturas personalizadas para produtos físicos e digitais:',
    segments: [
      { name: 'Moda & Vestuário', desc: 'Roupas, calçados e acessórios com grade de tamanhos.', icon: '👗' },
      { name: 'Alimentos & Gastronomia', desc: 'Produtos artesanais, docerias e delivery em Bauru.', icon: '🍫' },
      { name: 'Cosméticos & Beleza', desc: 'Produtos de estética, maquiagem e cuidados pessoais.', icon: '💄' },
      { name: 'Casa, Móveis & Decoração', desc: 'Móveis planejados, artigos de decoração e utilidades.', icon: '🛋️' },
      { name: 'Materiais & Construção', desc: 'Ferramentas, hidráulica, elétrica e acabamentos.', icon: '🔨' },
      { name: 'Pet Shop & Acessórios', desc: 'Rações, brinquedos e produtos para animais de estimação.', icon: '🐾' },
    ],
    howItWorksTitle: 'Como Criamos Sua Loja Virtual em Bauru',
    howItWorksSubtitle: 'Do cadastro dos primeiros produtos até a primeira venda:',
    howItWorks: [
      { step: '01', title: 'Definição do Catálogo', desc: 'Planejamos as categorias, formas de entrega e meios de pagamento.' },
      { step: '02', title: 'Design & Configuração', desc: 'Personalizamos o visual com a identidade da sua marca e configuramos os gateways.' },
      { step: '03', title: 'Cadastro Inicial & Testes', desc: 'Testamos todo o fluxo de compra, cálculo de frete e confirmação de PIX.' },
      { step: '04', title: 'Treinamento & Lançamento', desc: 'Ensinamos sua equipe a gerenciar pedidos e colocamos a loja no ar.' },
    ],
    differentialsTitle: 'Por Que Criar Sua Loja com a Nextia?',
    differentialsSubtitle: 'Diferenciais para vender com estabilidade e suporte próximo:',
    differentials: [
      { title: 'Sem Taxas Abusivas por Venda', desc: 'Você fica com 100% do valor das suas vendas, pagando apenas as taxas do gateway de pagamento.', iconName: 'shield-check' },
      { title: 'Conexão com WhatsApp', desc: 'Seus clientes podem tirar dúvidas e receber atualizações do pedido com facilidade.', iconName: 'message-circle' },
      { title: 'Loja Própria e Independente', desc: 'Sua marca com domínio próprio, sem ficar refém das regras de marketplaces.', iconName: 'lock' },
    ],
    nextia360Title: 'Conecte Sua Loja ao Ecossistema Nextia 360',
    nextia360Subtitle: 'Vendas, automações e suporte de TI integrados',
    nextia360Text: 'Sua loja virtual pode ser integrada a robôs de WhatsApp com IA para responder dúvidas sobre pedidos, além de contar com suporte técnico corporativo para seus computadores e rotinas de backup.',
    localContextTitle: 'E-commerce e Vendas Online para Empresas de Bauru',
    localContextSubtitle: 'Atenda o consumidor de Bauru e envie para todo o Brasil.',
    localContextText1: 'Comerciantes de Bauru podem utilizar uma loja virtual tanto para atender clientes da cidade com entrega expressa (motoboy/retirada) quanto para expandir vendas para todo o território nacional.',
    localContextText2: 'A Nextia apoia empresas locais com contratos formais (CNPJ 57.285.901/0001-94) e canal direto de atendimento pelo WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Configuração de frete flexível (Correios, transportadoras ou entrega local)',
      'Checkout transparente com PIX e cartão de crédito',
      'Suporte direto por WhatsApp para tirar dúvidas de configuração',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Bauru',
    relatedServicesSubtitle: 'Potencialize sua loja virtual com outras soluções Nextia:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites institucionais para fortalecer a autoridade da sua marca.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático inteligente e pós-venda no WhatsApp.', icon: '🤖' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Integração de pedidos com emissão de notas e planilhas.', icon: '⚡' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Segurança e suporte contínuo para seus computadores.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'Quanto custa criar uma loja virtual em Bauru?', answer: 'O investimento depende da quantidade de produtos e recursos adicionais (como cálculo de frete avançado, variações de produto ou integração com ERPs). Fale conosco para receber uma proposta exata para sua loja.' },
      { question: 'A Nextia cobra porcentagem sobre as minhas vendas?', answer: 'Não! A Nextia não cobra comissões sobre suas vendas. O lucro das suas vendas é 100% seu, aplicando-se apenas as tarifas normais do intermediador de pagamento que você escolher (como Mercado Pago ou PagBank).' },
      { question: 'Como funciona o cálculo de frete para entrega em Bauru e no Brasil?', answer: 'Configuramos integração automática com os Correios e Melhor Envio para entregas nacionais, além de opções personalizadas para entrega via motoboy ou retirada no balcão em Bauru.' },
      { question: 'Consigo cadastrar e alterar produtos facilmente?', answer: 'Sim. Você terá acesso a um painel simples e intuitivo para adicionar fotos, alterar preços, gerenciar estoques e criar cupons de desconto sem depender de conhecimentos técnicos.' },
      { question: 'A loja aceita pagamento por PIX e cartão de crédito?', answer: 'Sim. Configuramos checkout transparente com pagamento instantâneo por PIX (com QR Code gerado na hora) e cartão de crédito com parcelamento.' },
    ],
    finalCta: {
      title: 'Pronto para começar a vender online em Bauru?',
      subtitle: 'Solicite uma proposta e tenha sua loja virtual completa funcionando com máxima agilidade e segurança.',
      primaryCta: 'Solicitar orçamento de loja virtual',
      whatsappCta: 'Conversar no WhatsApp',
    },
  },

  // =========================================================================
  // 3. BAURU — WHATSAPP COM IA
  // =========================================================================
  'bauru/whatsapp-ia': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'whatsapp-ia',
    serviceCategoryName: 'WhatsApp com Inteligência Artificial',
    status: 'published',
    leadSource: 'pagina_bauru_whatsapp_ia',
    formServiceValue: 'WhatsApp com IA',
    metaTitle: 'WhatsApp com IA em Bauru | Atendimento Automático 24/7 | Nextia',
    metaDescription: 'Automação de WhatsApp com Inteligência Artificial para empresas em Bauru. Atendimento inteligente 24/7, triagem e qualificação de clientes. Conheça a Nextia.',
    keywords: [
      'WhatsApp com IA Bauru',
      'chatbot WhatsApp Bauru',
      'atendimento automático WhatsApp Bauru',
      'automação WhatsApp Bauru',
      'inteligência artificial WhatsApp Bauru',
      'robô WhatsApp Bauru',
    ],
    schemaServiceType: 'SoftwareApplication',
    hero: {
      badge: 'Atendimento Inteligente & Chatbots com IA em Bauru/SP',
      h1: 'WhatsApp com Inteligência Artificial em Bauru para ',
      h1Highlight: 'Atender e Vender 24 Horas',
      subtitle: 'Automatize o atendimento da sua empresa no WhatsApp com inteligência artificial treinada para responder dúvidas, qualificar clientes e agilizar vendas a qualquer hora do dia ou da noite.',
      ctaPrimaryText: 'Automatizar meu WhatsApp',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver como funciona',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre automação e IA para WhatsApp em Bauru para minha empresa.',
      highlights: [
        'Respostas instantâneas e humanizadas 24 horas por dia',
        'Treinamento com as informações exclusivas da sua empresa',
        'Pausa individual da IA por conversa para atendimento humano',
        'Triagem automática de contatos e agendamentos',
      ],
    },
    benefitsTitle: 'Por Que Sua Empresa em Bauru Precisa de IA no WhatsApp?',
    benefitsSubtitle: 'Benefícios diretos para a satisfação dos clientes e produtividade da equipe:',
    benefits: [
      { title: 'Atendimento Instantâneo 24/7', description: 'Nenhum cliente fica esperando. Respostas imediatas mesmo à noite, feriados e fins de semana.', iconName: 'clock' },
      { title: 'Pausa Individual por Conversa', description: 'O atendente humano pode assumir qualquer conversa sem precisar desligar a IA para os outros clientes.', iconName: 'user' as any },
      { title: 'Qualificação Automática de Leads', description: 'A IA identifica o interesse do cliente antes de transferir para a equipe certa.', iconName: 'target' },
      { title: 'Redução de Tarefas Repetitivas', description: 'Elimine horas gastas respondendo as mesmas perguntas sobre horários, cardápios, endereços e preços.', iconName: 'cpu' },
      { title: 'Respostas Humanizadas e Claras', description: 'Linguagem natural e contextualizada, muito superior aos menus numéricos engessados.', iconName: 'message-circle' },
      { title: 'Histórico & Painel de Conversas', description: 'Acompanhe todas as interações e métricas de atendimento em um painel organizado.', iconName: 'database' },
    ],
    problemSolution: {
      title: 'Sua empresa em Bauru perde vendas pela demora no WhatsApp?',
      subtitle: 'Veja como a inteligência artificial soluciona os principais gargalos de atendimento:',
      problemList: [
        { title: 'Mensagens acumuladas fora do horário comercial', desc: 'Clientes mandam mensagem à noite e, quando a equipe responde de manhã, já compraram do concorrente.' },
        { title: 'Atendentes sobrecarregados com dúvidas básicas', desc: 'Tempo precioso de vendas sendo gasto respondendo localização, horário e tabela de preços.' },
        { title: 'Menus robóticos chatos que irritam o cliente', desc: 'Sistemas antigos com "digite 1 para X, digite 2 para Y" que afastam os usuários.' },
      ],
      solutionList: [
        { title: 'Atendimento imediato a qualquer segundo', desc: 'O cliente recebe atenção instantânea, aumentando a taxa de conversão e encantamento.' },
        { title: 'IA responde o básico e filtra os clientes quentes', desc: 'Sua equipe só entra em ação para negociar e fechar com contatos já qualificados.' },
        { title: 'Conversa fluida como um atendente de verdade', desc: 'A inteligência artificial compreende mensagens em texto ou áudio e responde com naturalidade.' },
      ],
    },
    modalitiesTitle: 'Recursos do WhatsApp com IA da Nextia',
    modalitiesSubtitle: 'Personalizado para o fluxo de atendimento da sua empresa em Bauru:',
    modalities: [
      {
        title: 'Assistente de Vendas & Triagem',
        tagline: 'Qualificação automática e direcionamento comercial',
        description: 'Apresenta produtos e serviços, coleta dados de contato do cliente e encaminha para o vendedor responsável com o resumo da conversa.',
        features: ['Coleta de nome, e-mail e interesse', 'Transferência para departamento correto', 'Resumo prévio do lead'],
        recommendedFor: 'Imobiliárias, consultorias, prestadores de serviços e empresas B2B.',
      },
      {
        title: 'Atendente de Dúvidas Frequentes & Cardápio',
        tagline: 'Informações imediatas sobre cardápios, horários e tabelas',
        description: 'Treinado com toda a base de informações do seu estabelecimento para responder dúvidas sobre produtos, entregas e agendamentos.',
        features: ['Envio de cardápio digital', 'Respostas sobre taxas de entrega e horários', 'Agendamento de reservas'],
        recommendedFor: 'Restaurantes, clínicas, dentistas, oficinas e comércios em Bauru.',
      },
    ],
    segmentsTitle: 'Quem Utiliza WhatsApp com IA em Bauru?',
    segmentsSubtitle: 'Solução adaptada para múltiplos segmentos no interior paulista:',
    segments: [
      { name: 'Clínicas & Consultórios', desc: 'Triagem de especialidades e orientações de agendamento.', icon: '🏥' },
      { name: 'Restaurantes & Pizzarias', desc: 'Cardápio digital e dúvidas de horário sem fila de espera.', icon: '🍕' },
      { name: 'Imobiliárias & Corretores', desc: 'Filtro inicial de perfil de imóvel (compra/aluguel) e localização.', icon: '🏠' },
      { name: 'Escritórios de Advocacia', desc: 'Triagem inicial de áreas de atuação e agendamento de consultas.', icon: '⚖️' },
      { name: 'Lojas & E-commerce', desc: 'Informações sobre status de pedidos, produtos e frete.', icon: '🛍️' },
      { name: 'Oficinas Mecânicas', desc: 'Agendamento de revisões e informações sobre serviços.', icon: '🔧' },
    ],
    howItWorksTitle: 'Como Implementamos a IA no seu WhatsApp',
    howItWorksSubtitle: 'Etapas de configuração e treinamento especializado:',
    howItWorks: [
      { step: '01', title: 'Coleta de Informações', desc: 'Reunimos seus dados de serviços, preços, horários, localização e principais dúvidas.' },
      { step: '02', title: 'Treinamento da Inteligência Artificial', desc: 'Alimentamos o modelo com o tom de voz e as regras de negócio da sua empresa.' },
      { step: '03', title: 'Testes de Validação', desc: 'Simulamos dezenas de cenários reais para garantir respostas precisas e seguras.' },
      { step: '04', title: 'Ativação & Acompanhamento', desc: 'Conectamos ao seu número de WhatsApp e fornecemos suporte contínuo.' },
    ],
    differentialsTitle: 'Diferenciais da Automação Nextia',
    differentialsSubtitle: 'Tecnologia de ponta com controle humano total:',
    differentials: [
      { title: 'Controle Manual com Pausa da IA', desc: 'O atendente humano pode assumir uma conversa a qualquer momento pausando a IA apenas naquele cliente.', iconName: 'user' as any },
      { title: 'Sem Travamentos', desc: 'Infraestrutura em nuvem de alta disponibilidade para responder sem lentidão.', iconName: 'zap' },
      { title: 'Suporte Técnico Local', desc: 'Ajustes e atualizações de informações com suporte direto da equipe Nextia.', iconName: 'headphones' },
    ],
    nextia360Title: 'Conecte o WhatsApp com IA ao Seu Site e Sistemas',
    nextia360Subtitle: 'Nextia 360: Atendimento e vendas unificados',
    nextia360Text: 'O robô de WhatsApp pode receber contatos vindos diretamente do formulário do seu site profissional, alimentar seu sistema interno e manter histórico de interações com máxima segurança.',
    localContextTitle: 'Atendimento Automatizado para Empresas de Bauru/SP',
    localContextSubtitle: 'Modernize a comunicação da sua empresa com inteligência artificial.',
    localContextText1: 'Em Bauru, onde a agilidade no atendimento é decisiva para fechar negócios, empresas que respondem em segundos pelo WhatsApp ganham a preferência do consumidor.',
    localContextText2: 'A Nextia realiza a implantação completa com suporte técnico direto sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Configuração personalizada no seu número oficial de WhatsApp',
      'Treinamento da IA para a realidade de Bauru e seus clientes',
      'Suporte técnico e consultoria contínua para melhoria das respostas',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Bauru',
    relatedServicesSubtitle: 'Combine o WhatsApp com IA com outras soluções da Nextia:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites com botões estratégicos que direcionam tráfego para a IA.', icon: '🌐' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Integrações de dados entre WhatsApp, planilhas e CRMs.', icon: '⚡' },
      { name: 'Sistemas Web', slug: 'desenvolvimento-de-sistemas', description: 'Sistemas personalizados para controle de pedidos e clientes.', icon: '💻' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte e segurança para os computadores da sua empresa.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'A IA substitui totalmente os atendentes humanos da minha empresa?', answer: 'Não. O objetivo principal da IA é atuar na primeira linha de atendimento: responder dúvidas frequentes instantaneamente, filtrar curiosos e qualificar clientes. Quando o cliente solicita uma negociação específica ou atendimento humano, a IA transfere a conversa com o histórico completo.' },
      { question: 'O atendente humano pode assumir uma conversa sem desligar a IA?', answer: 'Sim! Com o recurso de pausa individual por conversa, seu atendente pode entrar no chat e conversar livremente. A IA permanecerá pausada apenas para aquele cliente e continuará atendendo os demais normalmente.' },
      { question: 'Preciso trocar meu número atual de WhatsApp?', answer: 'Não. A integração pode ser realizada no número oficial de atendimento que sua empresa já utiliza em Bauru.' },
      { question: 'A IA sabe responder sobre preços e detalhes dos meus serviços?', answer: 'Sim. Nós treinamos a inteligência artificial com a base de dados, catálogo, tabela de preços e regras de atendimento que você definir.' },
    ],
    finalCta: {
      title: 'Pronto para ter atendimento inteligente 24/7 no seu WhatsApp em Bauru?',
      subtitle: 'Fale com a Nextia e veja como a inteligência artificial pode economizar horas da sua equipe e aumentar suas vendas.',
      primaryCta: 'Solicitar proposta de automação',
      whatsappCta: 'Falar com especialista no WhatsApp',
    },
  },

  // =========================================================================
  // 4. BAURU — SUPORTE DE TI
  // =========================================================================
  'bauru/suporte-ti': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'suporte-ti',
    serviceCategoryName: 'Suporte de TI & TechCare',
    status: 'published',
    leadSource: 'pagina_bauru_suporte_ti',
    formServiceValue: 'Suporte de TI',
    metaTitle: 'Suporte de TI em Bauru | Suporte Técnico Empresarial | Nextia TechCare',
    metaDescription: 'Suporte de TI corporativo em Bauru. Manutenção de computadores, suporte remoto rápido, redes Wi-Fi e backup seguro para empresas. Fale com a Nextia.',
    keywords: [
      'suporte de TI em Bauru',
      'suporte técnico Bauru',
      'TI para empresas Bauru',
      'suporte remoto Bauru',
      'manutenção de computadores Bauru',
      'técnico de informática Bauru',
      'redes e wifi Bauru',
      'backup em nuvem Bauru',
    ],
    schemaServiceType: 'TechnicalSupport',
    hero: {
      badge: 'Suporte de TI Corporativo & Nextia TechCare em Bauru/SP',
      h1: 'Suporte de TI em Bauru para sua ',
      h1Highlight: 'Empresa Nunca Parar',
      subtitle: 'Atendimento técnico remoto ágil, manutenção preventiva, gestão de redes Wi-Fi e rotinas de backup seguro para manter a operação da sua empresa em Bauru segura e produtiva.',
      ctaPrimaryText: 'Solicitar suporte de TI',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Conhecer planos TechCare',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de informações sobre suporte de TI em Bauru para minha empresa.',
      highlights: [
        'Atendimento remoto ágil para resolução rápida de chamados',
        'Manutenção preventiva para evitar lentidão e travamentos',
        'Configuração e proteção de redes locais e Wi-Fi',
        'Rotinas de backup automatizado e seguro na nuvem',
      ],
    },
    benefitsTitle: 'Tranquilidade e Estabilidade para a TI da sua Empresa',
    benefitsSubtitle: 'Benefícios de contar com uma equipe técnica dedicada em Bauru:',
    benefits: [
      { title: 'Resolução Rápida de Chamados', description: 'Suporte remoto imediato para destravar impressoras, e-mails, acessos e problemas do dia a dia.', iconName: 'zap' },
      { title: 'Prevenção Contra Paradas', description: 'Manutenção preventiva periódica para identificar falhas antes que causem prejuízos.', iconName: 'shield-check' },
      { title: 'Backup Seguro e Criptografado', description: 'Cópias automáticas dos seus arquivos cruciais em nuvem para proteção contra perdas e ataques.', iconName: 'lock' },
      { title: 'Gestão de Redes & Wi-Fi', description: 'Roteadores configurados para velocidade, estabilidade e separação entre rede corporativa e de visitantes.', iconName: 'gauge' },
      { title: 'Controle de Custos', description: 'Planos mensais com valor fixo e previsível, sem surpresas no orçamento de TI.', iconName: 'target' },
      { title: 'Histórico & Acompanhamento', description: 'Registro organizado de todos os chamados e manutenções efetuadas nos seus equipamentos.', iconName: 'database' },
    ],
    problemSolution: {
      title: 'Problemas recorrentes de TI estão prejudicando sua empresa em Bauru?',
      subtitle: 'Veja como o suporte estruturado da Nextia transforma o ambiente técnico da sua empresa:',
      problemList: [
        { title: 'Computadores lentos e travando constantemente', desc: 'Funcionários perdem horas produtivas esperando programas abrirem ou reiniciando máquinas.' },
        { title: 'Ausência de backup e risco de perda de arquivos', desc: 'Documentos fiscais, contratos e planilhas armazenados sem cópia segura de recuperação.' },
        { title: 'Rede Wi-Fi oscilando e caindo', desc: 'Conexão instável que interrompe chamadas, emissão de notas e transações no caixa.' },
      ],
      solutionList: [
        { title: 'Otimização e manutenção preventiva regular', desc: 'Máquinas limpas, atualizadas e configuradas para máxima velocidade e estabilidade.' },
        { title: 'Rotinas automáticas de backup em nuvem', desc: 'Seus dados protegidos com cópias automáticas criptografadas e fáceis de restaurar.' },
        { title: 'Rede corporativa estável e segura', desc: 'Estruturação de rede para suportar todos os dispositivos sem quedas de conexão.' },
      ],
    },
    modalitiesTitle: 'Modalidades de Suporte de TI em Bauru',
    modalitiesSubtitle: 'Planos e atendimentos flexíveis para a demanda da sua empresa:',
    modalities: [
      {
        title: 'Nextia TechCare Mensal (Plano Corporativo)',
        tagline: 'Apoio técnico contínuo e preventivo',
        description: 'Plano com suporte remoto ilimitado para chamados do dia a dia, manutenção preventiva, monitoramento de backups e suporte a redes.',
        features: ['Chamados remotos com atendimento ágil', 'Rotinas de backup configuradas', 'Manutenção preventiva periódica', 'Histórico completo de atendimentos'],
        recommendedFor: 'Escritórios, clínicas, contabilidades, lojas e empresas em Bauru com 2 ou mais computadores.',
      },
      {
        title: 'Atendimento Técnico Avulso / Sob Demanda',
        tagline: 'Resolução pontual de problemas específicos',
        description: 'Diagnóstico e reparo para situações urgentes, formatação, remoção de vírus, instalação de redes ou configuração de novos computadores.',
        features: ['Diagnóstico técnico prévio', 'Configuração de novos equipamentos', 'Sem mensalidade obrigatória'],
        recommendedFor: 'Empresas ou profissionais liberais com demandas pontuais de suporte.',
      },
    ],
    segmentsTitle: 'Empresas em Bauru Atendidas pelo Suporte de TI Nextia',
    segmentsSubtitle: 'Suporte especializado para diversos setores:',
    segments: [
      { name: 'Escritórios Contábeis', desc: 'Garantia de computadores rápidos para fechamentos fiscais e prazos.', icon: '📊' },
      { name: 'Clínicas & Consultórios', desc: 'Estabilidade para prontuários eletrônicos e computadores de atendimento.', icon: '🏥' },
      { name: 'Escritórios de Advocacia', desc: 'Segurança absoluta de documentos, certificados digitais e backups.', icon: '⚖️' },
      { name: 'Comércio & Varejo', desc: 'Operação ininterrupta de caixas, impressoras térmicas e Wi-Fi.', icon: '🛍️' },
      { name: 'Empresas de Engenharia & Arquitetura', desc: 'Desempenho para softwares pesados e backup de projetos volumosos.', icon: '📐' },
      { name: 'Distribuidores & Logística', desc: 'Estabilidade para emissão de notas e comunicação entre setores.', icon: '🚚' },
    ],
    howItWorksTitle: 'Como Funciona o Atendimento do Suporte Nextia TechCare',
    howItWorksSubtitle: 'Do chamado à solução com agilidade e registro:',
    howItWorks: [
      { step: '01', title: 'Abertura do Chamado', desc: 'Sua equipe aciona o suporte diretamente via WhatsApp ou painel de tickets.' },
      { step: '02', title: 'Diagnóstico Imediato', desc: 'O técnico avalia a solicitação e inicia o atendimento remoto seguro.' },
      { step: '03', title: 'Resolução do Problema', desc: 'Correção do erro, teste com o usuário e orientações preventivas.' },
      { step: '04', title: 'Registro & Prevenção', desc: 'O chamado é documentado no histórico da sua empresa para acompanhamento.' },
    ],
    differentialsTitle: 'Por Que Escolher a Nextia para a TI da sua Empresa?',
    differentialsSubtitle: 'Compromisso com atendimento ágil e segurança:',
    differentials: [
      { title: 'Atendimento Rápido e Sem Burocracia', desc: 'Canal direto para falar com técnicos qualificados que resolvem sem enrolação.', iconName: 'zap' },
      { title: 'Equipe Especializada em Negócios', desc: 'Entendemos o impacto de uma parada técnica na sua empresa e priorizamos o que é urgente.', iconName: 'target' },
      { title: 'Ecossistema 360 Integrado', desc: 'Mesma empresa que cuida da sua TI também desenvolve seu site, sistemas e automações.', iconName: 'shield-check' },
    ],
    nextia360Title: 'TI, Sites e Sistemas em um Único Parceiro em Bauru',
    nextia360Subtitle: 'Nextia 360: Infraestrutura e Tecnologia',
    nextia360Text: 'Centralize seu suporte de informática, hospedagem de site, sistemas em nuvem e automações de WhatsApp com a Nextia, economizando tempo de gestão e facilitando o suporte da sua empresa.',
    localContextTitle: 'Suporte de TI para Empresas de Bauru e Região',
    localContextSubtitle: 'Atendimento técnico remoto e preventivo no interior de São Paulo.',
    localContextText1: 'A Nextia presta suporte técnico a empresas de Bauru com foco na estabilidade operacional dos seus computadores e na proteção dos dados empresariais.',
    localContextText2: 'Trabalhamos com total transparência sob o CNPJ 57.285.901/0001-94 e canal direto pelo WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Suporte remoto ágil para resolução rápida de problemas do dia a dia',
      'Configuração de backups automatizados em nuvem',
      'Consultoria para escolha e aquisição de novos equipamentos',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Bauru',
    relatedServicesSubtitle: 'Conecte seu suporte de TI com outras soluções digitais:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites profissionais rápidos e com hospedagem segura.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático no WhatsApp da sua empresa.', icon: '🤖' },
      { name: 'Sistemas Sob Medida', slug: 'desenvolvimento-de-sistemas', description: 'Softwares personalizados para gestão interna.', icon: '💻' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Workflows automáticos para eliminar tarefas manuais.', icon: '⚡' },
    ],
    faqs: [
      { question: 'Como funciona o suporte de TI remoto para empresas em Bauru?', answer: 'Através de softwares seguros de acesso remoto com autorização do usuário, nosso técnico acessa a máquina para diagnosticar e solucionar falhas em minutos, sem necessidade de deslocamento físico para a maioria dos problemas.' },
      { question: 'Vocês realizam manutenção em computadores e notebooks?', answer: 'Sim. Realizamos formatação, otimização de sistema operacional, remoção de vírus, limpeza preventiva e diagnóstico de hardware.' },
      { question: 'Como o plano mensal TechCare pode ajudar minha empresa?', answer: 'O TechCare oferece atendimento contínuo com valor fixo mensal previsível, suporte remoto prioritário e rotinas de backup, evitando que pequenos problemas virem prejuízos grandes.' },
      { question: 'A Nextia atende empresas de Bauru/SP?', answer: 'Sim, atendemos empresas de Bauru e região através de suporte remoto ágil e atendimento corporativo.' },
    ],
    finalCta: {
      title: 'Proteja a operação de TI da sua empresa em Bauru',
      subtitle: 'Fale com a equipe Nextia e conheça os planos de suporte técnico e manutenção TechCare para o seu negócio.',
      primaryCta: 'Solicitar proposta de suporte de TI',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 5. BAURU — AUTOMAÇÃO
  // =========================================================================
  'bauru/automacao': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'automacao',
    serviceCategoryName: 'Automação Empresarial',
    status: 'published',
    leadSource: 'pagina_bauru_automacao',
    formServiceValue: 'Automação Empresarial',
    metaTitle: 'Automação Empresarial em Bauru | Automação de Processos | Nextia',
    metaDescription: 'Automação de processos empresariais em Bauru. Conecte ferramentas, elimine retrabalho manual e aumente a produtividade com a Nextia.',
    keywords: [
      'automação empresarial Bauru',
      'automação de processos Bauru',
      'automação para empresas Bauru',
      'integração de sistemas Bauru',
      'workflows automatizados Bauru',
      'eliminar tarefas manuais Bauru',
    ],
    schemaServiceType: 'BusinessAutomation',
    hero: {
      badge: 'Automação de Processos Empresariais em Bauru/SP',
      h1: 'Automação Empresarial em Bauru para ',
      h1Highlight: 'Eliminar Tarefas Repetitivas',
      subtitle: 'Conecte seu site, WhatsApp, e-mails, planilhas e sistemas de gestão para que suas tarefas operacionais aconteçam de forma automática, rápida e sem erros manuais.',
      ctaPrimaryText: 'Automatizar minha empresa',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver exemplos práticos',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre automação de processos para minha empresa em Bauru.',
      highlights: [
        'Integração entre formulários, CRM, e-mails e planilhas',
        'Disparo automático de mensagens de status e lembretes',
        'Redução drástica de erros operacionais e retrabalho',
        'Mais tempo para sua equipe focar em vendas e estratégia',
      ],
    },
    benefitsTitle: 'Por Que Automatizar Processos na Sua Empresa?',
    benefitsSubtitle: 'Benefícios diretos em agilidade, economia e redução de falhas:',
    benefits: [
      { title: 'Eliminação de Tarefas Manuais', description: 'Pare de copiar e colar informações entre planilhas, sistemas e conversas de WhatsApp.', iconName: 'cpu' },
      { title: 'Velocidade na Operação', description: 'Processos que demoravam horas ou dias passam a ser executados em poucos segundos de forma automática.', iconName: 'zap' },
      { title: 'Zero Erro de Digitação', description: 'Dados padronizados e validados automaticamente, garantindo relatórios e cadastros precisos.', iconName: 'shield-check' },
      { title: 'Notificações Automáticas', description: 'Seu cliente e sua equipe recebem alertas imediatos no WhatsApp e e-mail a cada etapa do processo.', iconName: 'message-circle' },
      { title: 'Integração de Ferramentas', description: 'Faça suas ferramentas separadas conversarem entre si por meio de APIs seguras.', iconName: 'database' },
      { title: 'Redução de Custos Operacionais', description: 'Sua equipe produz muito mais sem necessidade de contratações apenas para trabalho burocrático.', iconName: 'target' },
    ],
    problemSolution: {
      title: 'Sua equipe em Bauru passa o dia fazendo trabalho manual repetitivo?',
      subtitle: 'Veja o contraste entre um processo manual desgastante e um fluxo 100% automatizado:',
      problemList: [
        { title: 'Redigitação de dados de clientes em várias planilhas', desc: 'Informações duplicadas, desencontradas e erros frequentes no preenchimento.' },
        { title: 'Demora para enviar confirmações e propostas', desc: 'Propostas comerciais demorando horas para serem geradas e enviadas ao cliente.' },
        { title: 'Esquecimento de follow-up com clientes interessados', desc: 'Contatos que demonstraram interesse no site sendo esquecidos por falta de alerta automático.' },
      ],
      solutionList: [
        { title: 'Sincronização instantânea de cadastros', desc: 'O cliente preenche o formulário e os dados entram automaticamente no CRM e nas planilhas.' },
        { title: 'Geração automática de propostas e contratos', desc: 'Documentos montados em segundos com os dados preenchidos e enviados para assinatura.' },
        { title: 'Alertas automáticos para o time de vendas', desc: 'Notificações instantâneas no WhatsApp avisando sobre novos leads para abordagem imediata.' },
      ],
    },
    modalitiesTitle: 'Exemplos de Automações para Empresas de Bauru',
    modalitiesSubtitle: 'Soluções práticas desenhadas para a sua rotina:',
    modalities: [
      {
        title: 'Automação Comercial & Captação de Leads',
        tagline: 'Do formulário do site direto para o vendedor',
        description: 'Quando um cliente solicita orçamento no site, o lead é registrado no CRM, um alerta é enviado no WhatsApp do vendedor e um e-mail de boas-vindas vai para o cliente.',
        features: ['Integração com CRM e planilhas', 'Alerta em tempo real para o time comercial', 'Resposta imediata para o cliente'],
        recommendedFor: 'Imobiliárias, consultorias, prestadores de serviços e empresas com equipe de vendas.',
      },
      {
        title: 'Automação de Notificações & Pós-Venda',
        tagline: 'Lembretes e avisos automáticos no WhatsApp',
        description: 'Envio automático de lembretes de consultas, avisos de vencimento, atualizações de status de pedidos e pesquisas de satisfação.',
        features: ['Redução de faltas em agendamentos', 'Avisos de cobrança e vencimento', 'Disparo programado no WhatsApp'],
        recommendedFor: 'Clínicas, consultórios, salões, academias e comércios em Bauru.',
      },
    ],
    segmentsTitle: 'Setores que se Beneficiam da Automação em Bauru',
    segmentsSubtitle: 'Tecnologia aplicada a negócios de todos os portes:',
    segments: [
      { name: 'Clínicas & Saúde', desc: 'Lembretes automáticos de consultas e envio de orientações.', icon: '🏥' },
      { name: 'Escritórios Contábeis', desc: 'Avisos de vencimento de guias e recebimento de documentos.', icon: '📊' },
      { name: 'Imobiliárias', desc: 'Distribuição automática de leads para corretores e avisos de visitas.', icon: '🏠' },
      { name: 'Prestadores de Serviços', desc: 'Geração de orçamentos e acompanhamento de ordens de serviço.', icon: '⚡' },
      { name: 'Comércio & E-commerce', desc: 'Atualização de status de entrega e mensagens pós-venda.', icon: '🛍️' },
      { name: 'Indústrias B2B', desc: 'Encaminhamento de cotações para representantes comerciais.', icon: '🏭' },
    ],
    howItWorksTitle: 'Como Implementamos Automações na Sua Empresa',
    howItWorksSubtitle: 'Mapeamento e execução sob medida:',
    howItWorks: [
      { step: '01', title: 'Mapeamento do Processo', desc: 'Analisamos quais tarefas manuais consomem mais tempo da sua equipe em Bauru.' },
      { step: '02', title: 'Desenho do Workflow', desc: 'Desenhamos o fluxo lógico conectando as ferramentas necessárias.' },
      { step: '03', title: 'Configuração & Integração', desc: 'Implementamos as conexões por APIs e configuramos as regras automáticas.' },
      { step: '04', title: 'Validação & Acompanhamento', desc: 'Testamos todas as condições e colocamos o fluxo em produção com suporte contínuo.' },
    ],
    differentialsTitle: 'Vantagens da Automação Nextia',
    differentialsSubtitle: 'Soluções pensadas para a realidade do seu negócio:',
    differentials: [
      { title: 'Integrações sem Burocracia', desc: 'Conectamos suas ferramentas atuais sem necessidade de trocar de sistema.', iconName: 'zap' },
      { title: 'Segurança de Dados', desc: 'Tráfego seguro com criptografia e respeito às normas de proteção de dados.', iconName: 'lock' },
      { title: 'Evolução Contínua', desc: 'Adicione novas etapas e regras de automação conforme seu negócio cresce.', iconName: 'refresh-cw' as any },
    ],
    nextia360Title: 'Automação Integrada na Estrutura Nextia 360',
    nextia360Subtitle: 'Conecte site, IA, sistemas e atendimento',
    nextia360Text: 'Com a Nextia 360, sua automação funciona em perfeita sintonia com seu site profissional, WhatsApp com IA e sistemas de gestão em nuvem.',
    localContextTitle: 'Automação de Processos para Empresas de Bauru/SP',
    localContextSubtitle: 'Mais produtividade para empresas do interior paulista.',
    localContextText1: 'Em um mercado cada vez mais dinâmico em Bauru, empresas que automatizam tarefas repetitivas conseguem atender mais rápido, cometer menos falhas e focar no atendimento estratégico.',
    localContextText2: 'A Nextia atende negócios de Bauru com suporte técnico direto sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Mapeamento consultivo dos gargalos da sua operação',
      'Configuração rápida de integrações e fluxos no WhatsApp e e-mail',
      'Acompanhamento e suporte técnico contínuo para sua equipe',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Bauru',
    relatedServicesSubtitle: 'Combine automações com outras soluções Nextia:',
    relatedServices: [
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático inteligente no WhatsApp.', icon: '🤖' },
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites com formulários integrados a fluxos automáticos.', icon: '🌐' },
      { name: 'Sistemas Sob Medida', slug: 'desenvolvimento-de-sistemas', description: 'Sistemas web personalizados para centralizar dados.', icon: '💻' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte técnico contínuo para seus computadores.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'O que pode ser automatizado na minha empresa em Bauru?', answer: 'Praticamente qualquer tarefa repetitiva: envio de lembretes no WhatsApp, cadastramento de leads vindos do site em planilhas/CRMs, disparo de propostas, avisos de vencimento de boletos e notificações internas de novos pedidos.' },
      { question: 'Preciso trocar os sistemas que minha empresa já usa?', answer: 'Geralmente não. Nós conectamos as ferramentas que você já utiliza (como WhatsApp, Google Sheets, e-mails e CRMs) através de APIs de integração seguras.' },
      { question: 'Quanto tempo leva para implementar uma automação?', answer: 'Fluxos simples de notificações e captura de leads podem ser implementados em poucos dias. Processos mais complexos têm prazos alinhados previamente.' },
    ],
    finalCta: {
      title: 'Pronto para eliminar o retrabalho manual na sua empresa em Bauru?',
      subtitle: 'Converse com a Nextia e descubra como automatizar seus fluxos de atendimento e processos com facilidade.',
      primaryCta: 'Solicitar proposta de automação',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 6. BAURU — DESENVOLVIMENTO DE SISTEMAS
  // =========================================================================
  'bauru/desenvolvimento-de-sistemas': {
    citySlug: 'bauru',
    cityName: 'Bauru',
    state: 'SP',
    serviceSlug: 'desenvolvimento-de-sistemas',
    serviceCategoryName: 'Desenvolvimento de Sistemas Web',
    status: 'published',
    leadSource: 'pagina_bauru_desenvolvimento_de_sistemas',
    formServiceValue: 'Sistema Sob Medida',
    metaTitle: 'Desenvolvimento de Sistemas em Bauru | Software Sob Medida | Nextia',
    metaDescription: 'Desenvolvimento de sistemas web e softwares sob medida para empresas em Bauru. Painéis de gestão, área do cliente e dashboards. Fale com a Nextia.',
    keywords: [
      'desenvolvimento de sistemas Bauru',
      'software personalizado Bauru',
      'sistemas empresariais Bauru',
      'desenvolvimento de software Bauru',
      'sistema web sob medida Bauru',
      'programador em Bauru',
      'empresa de software Bauru',
    ],
    schemaServiceType: 'SoftwareDevelopment',
    hero: {
      badge: 'Software Sob Medida & Sistemas Web em Bauru/SP',
      h1: 'Desenvolvimento de Sistemas em Bauru para ',
      h1Highlight: 'Processos Exclusivos da sua Empresa',
      subtitle: 'Desenvolvemos sistemas web, portais de clientes, painéis administrativos e dashboards personalizados para substituir planilhas complexas e centralizar a gestão da sua empresa em Bauru.',
      ctaPrimaryText: 'Solicitar proposta de sistema',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Conhecer possibilidades',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre desenvolvimento de sistemas e software sob medida em Bauru.',
      highlights: [
        'Software 100% web acessível com segurança de qualquer dispositivo',
        'Telas, fluxos e regras modeladas para o seu modelo de negócio',
        'Dashboards e relatórios gerenciais com dados em tempo real',
        'Banco de dados em nuvem com rotinas de backup e segurança',
      ],
    },
    benefitsTitle: 'Vantagens de um Sistema Desenvolvido Sob Medida',
    benefitsSubtitle: 'Sua empresa com a ferramenta exata que a operação precisa:',
    benefits: [
      { title: 'Adequação Perfeita à sua Rotina', description: 'O sistema se molda aos seus processos, e não sua equipe tendo que se adaptar a softwares genéricos.', iconName: 'target' },
      { title: 'Acesso Seguro em Nuvem', description: 'Acesse de qualquer computador, tablet ou celular com controle de login e níveis de permissão.', iconName: 'lock' },
      { title: 'Substituição de Planilhas', description: 'Fim das planilhas corrompidas ou descentralizadas. Informações seguras em banco de dados relacional.', iconName: 'database' },
      { title: 'Dashboards & Métricas em Tempo Real', description: 'Visão clara dos principais indicadores de vendas, atendimento e finanças em gráficos objetivos.', iconName: 'gauge' },
      { title: 'Integração com Outras Ferramentas', description: 'Conexão via APIs com gateways de pagamento, WhatsApp, notas fiscais e ferramentas externas.', iconName: 'cpu' },
      { title: 'Propriedade & Escalabilidade', description: 'Possibilidade de adicionar novos módulos, relatórios e telas conforme sua empresa evolui.', iconName: 'zap' },
    ],
    problemSolution: {
      title: 'Softwares prontos de mercado não atendem com perfeição o seu negócio?',
      subtitle: 'Entenda quando o desenvolvimento sob medida é o melhor investimento:',
      problemList: [
        { title: 'Planilhas gigantescas difíceis de controlar', desc: 'Várias pessoas editando arquivos simultaneamente, gerando erros e perda de histórico.' },
        { title: 'Sistemas genéricos com mensalidades caras e cheios de funções inúteis', desc: 'Pagar caro por ferramentas engessadas que não resolvem o seu fluxo específico.' },
        { title: 'Falta de uma área do cliente moderna', desc: 'Clientes ligando e mandando e-mails constantes para saber status de serviços ou segunda via de documentos.' },
      ],
      solutionList: [
        { title: 'Banco de dados centralizado e protegido', desc: 'Dados organizados em nuvem com permissões de acesso e histórico completo de alterações.' },
        { title: 'Telas enxutas e focadas no que realmente importa', desc: 'Interface intuitiva, rápida e desenvolvida especificamente para a rotina da sua equipe.' },
        { title: 'Portal do Cliente com autoatendimento', desc: 'Área segura onde seu cliente consulta status, emite relatórios e faz downloads sozinho.' },
      ],
    },
    modalitiesTitle: 'Tipos de Sistemas Desenvolvidos pela Nextia',
    modalitiesSubtitle: 'Soluções corporativas para diversas necessidades em Bauru:',
    modalities: [
      {
        title: 'Painéis Administrativos & Gestão Interna',
        tagline: 'Controle operacional completo para sua equipe',
        description: 'Sistemas para controle de pedidos, contratos, ordens de serviço, agendamentos, clientes e relatórios operacionais.',
        features: ['Gestão de cadastros e permissões', 'Emissão de relatórios e exportação', 'Controle de prazos e etapas'],
        recommendedFor: 'Prestadores de serviços, distribuidoras, consultorias e indústrias em Bauru.',
      },
      {
        title: 'Portais do Cliente & Área Restrita',
        tagline: 'Autoatendimento moderno para seus clientes',
        description: 'Ambiente seguro protegido por senha onde seus clientes acessam documentos, acompanham andamentos e realizam solicitações.',
        features: ['Login seguro por usuário', 'Upload e download de documentos', 'Notificações automáticas por e-mail/WhatsApp'],
        recommendedFor: 'Escritórios de contabilidade, advocacia, imobiliárias e clínicas em Bauru.',
      },
    ],
    segmentsTitle: 'Setores que Demandam Sistemas Personalizados em Bauru',
    segmentsSubtitle: 'Softwares construídos para áreas específicas:',
    segments: [
      { name: 'Contabilidade & Financeiro', desc: 'Portal para tráfego seguro de guias e extratos de clientes.', icon: '📊' },
      { name: 'Clínicas & Especialidades', desc: 'Histórico de atendimentos e gestão de agendamentos.', icon: '🏥' },
      { name: 'Imobiliárias & Loteadoras', desc: 'Gestão de propostas, contratos e repasses a proprietários.', icon: '🏠' },
      { name: 'Prestadores de Serviços Técnicos', desc: 'Acompanhamento digital de ordens de serviço e laudos.', icon: '🔧' },
      { name: 'Empresas B2B & Atacadistas', desc: 'Portal de cotações e pedidos exclusivos para representantes.', icon: '🏭' },
      { name: 'Educação & Treinamentos', desc: 'Ambiente de alunos, materiais didáticos e certificados.', icon: '🎓' },
    ],
    howItWorksTitle: 'Como Desenvolvemos Seu Sistema Sob Medida',
    howItWorksSubtitle: 'Metodologia ágil e transparente em todas as etapas:',
    howItWorks: [
      { step: '01', title: 'Levantamento de Requisitos', desc: 'Mapeamos cada regra de negócio, campos necessários, permissões e fluxos de telas.' },
      { step: '02', title: 'Prototipação & Design UI/UX', desc: 'Desenhamos a interface para validação visual antes da codificação.' },
      { step: '03', title: 'Desenvolvimento Full-Stack', desc: 'Construção do frontend, backend e banco de dados com tecnologias seguras e modernas.' },
      { step: '04', title: 'Testes & Homologação', desc: 'Sua equipe testa em ambiente fechado para validação das regras e funcionalidades.' },
      { step: '05', title: 'Publicação & Treinamento', desc: 'Lançamento em ambiente de produção com suporte técnico e evolução garantida.' },
    ],
    differentialsTitle: 'Diferenciais do Desenvolvimento Nextia',
    differentialsSubtitle: 'Tecnologia de ponta com código robusto:',
    differentials: [
      { title: 'Tecnologias Modernas & Estáveis', desc: 'Desenvolvemos com React, Node.js e PostgreSQL para máxima velocidade e confiabilidade.', iconName: 'code' as any },
      { title: 'Interface Intuitiva e Limpa', desc: 'Design pensado para que qualquer colaborador aprenda a usar em poucos minutos.', iconName: 'zap' },
      { title: 'Atendimento e Suporte Próximo', desc: 'Comunicação direta com a equipe de engenharia para ajustes e evolução.', iconName: 'headphones' },
    ],
    nextia360Title: 'Sistemas Conectados ao Ecossistema Nextia 360',
    nextia360Subtitle: 'Software, site, WhatsApp e suporte integrados',
    nextia360Text: 'Seu sistema sob medida pode receber dados vindos do seu site profissional, disparar mensagens automáticas pelo WhatsApp com IA e rodar em infraestrutura monitorada pela equipe Nextia.',
    localContextTitle: 'Desenvolvimento de Softwares em Bauru/SP',
    localContextSubtitle: 'Soluções tecnológicas para o crescimento empresarial local.',
    localContextText1: 'Empresas de Bauru que buscam profissionalizar sua governança interna encontram no software sob medida a chave para ganhar eficiência e reduzir custos de retrabalho.',
    localContextText2: 'A Nextia oferece consultoria técnica especializada com contratos transparentes (CNPJ 57.285.901/0001-94) e WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Levantamento técnico consultivo no formato que melhor se adapta à sua empresa',
      'Construção com foco em usabilidade e segurança de dados',
      'Suporte técnico e manutenção contínua após a entrega',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Bauru',
    relatedServicesSubtitle: 'Complemente seu sistema com outras soluções Nextia:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites institucionais integrados ao seu sistema.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Disparos e atendimento automatizado no WhatsApp.', icon: '🤖' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Conexão de dados com planilhas e softwares externos.', icon: '⚡' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte de TI e rotinas de backup para seus computadores.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'Quanto custa desenvolver um sistema sob medida em Bauru?', answer: 'O investimento depende do escopo, quantidade de telas, complexidade das regras de negócio e integrações necessárias. Nós realizamos uma reunião de diagnóstico prévia para apresentar uma proposta clara com prazos e valores definidos.' },
      { question: 'O sistema fica hospedado onde?', answer: 'Os sistemas são hospedados em servidores de nuvem de alta confiabilidade com certificado de segurança SSL e rotinas diárias de backup.' },
      { question: 'É possível acessar o sistema pelo celular?', answer: 'Sim. Todas as interfaces são desenvolvidas com design responsivo, permitindo acesso de qualquer computador, tablet ou smartphone com navegador web.' },
      { question: 'A Nextia dá suporte e treinamento após a entrega?', answer: 'Sim. Realizamos o treinamento inicial da sua equipe e fornecemos suporte técnico contínuo para dúvidas e evolução do software.' },
    ],
    finalCta: {
      title: 'Pronto para criar o sistema sob medida da sua empresa em Bauru?',
      subtitle: 'Agende uma conversa com a Nextia e receba uma avaliação técnica personalizada para seu projeto.',
      primaryCta: 'Solicitar proposta de sistema',
      whatsappCta: 'Falar com especialista no WhatsApp',
    },
  },

  // =========================================================================
  // 7. MARÍLIA — CRIAÇÃO DE SITES
  // =========================================================================
  'marilia/criacao-de-sites': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'criacao-de-sites',
    serviceCategoryName: 'Criação de Sites',
    status: 'published',
    leadSource: 'pagina_marilia_criacao_de_sites',
    formServiceValue: 'Criação de Site',
    metaTitle: 'Criação de Sites em Marília | Sites Profissionais | Nextia',
    metaDescription: 'Criação de sites modernos e responsivos em Marília com SEO, WhatsApp integrado e alta velocidade. Solicite seu orçamento com a Nextia.',
    keywords: [
      'criação de sites em Marília',
      'criação de sites Marília',
      'desenvolvimento de sites Marília',
      'empresa de criação de sites Marília',
      'agência de sites Marília',
      'web design Marília',
      'site profissional Marília',
      'site para empresa Marília',
      'landing page Marília',
      'site institucional Marília',
      'SEO Marília',
      'desenvolvimento web Marília',
    ],
    schemaServiceType: 'WebSiteDevelopment',
    hero: {
      badge: 'Criação de Sites Profissionais em Marília/SP',
      h1: 'Criação de Sites em Marília para Empresas que ',
      h1Highlight: 'Buscam Autoridade e Vendas',
      subtitle: 'Desenvolvemos sites corporativos modernos, ultra-rápidos e estruturados para transformar visitantes em clientes qualificados para sua empresa em Marília.',
      ctaPrimaryText: 'Solicitar orçamento',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver modelos de sites',
      ctaSecondaryAnchor: '#modelos-sites',
      whatsappMessage: 'Olá! Encontrei a Nextia pesquisando criação de sites em Marília e gostaria de receber mais informações.',
      highlights: [
        'Design profissional alinhado ao seu segmento em Marília',
        'Carregamento veloz e adaptado para todos os celulares',
        'Estrutura preparada para indexação no Google',
        'Botões estratégicos de WhatsApp e formulários de contato',
      ],
    },
    benefitsTitle: 'Vantagens do Site Profissional da Sua Empresa em Marília',
    benefitsSubtitle: 'Recursos modernos para fortalecer a presença digital da sua marca:',
    benefits: [
      { title: 'Design Moderno e Responsivo', description: 'Experiência impecável em smartphones e computadores para valorizar sua empresa.', iconName: 'smartphone' },
      { title: 'SEO Técnico & Relevância', description: 'Estrutura semântica e dados estruturados para apoiar o posicionamento no Google em Marília.', iconName: 'search' },
      { title: 'WhatsApp Direto', description: 'Botões que facilitam contatos rápidos de clientes interessados com mensagens pré-configuradas.', iconName: 'message-circle' },
      { title: 'Hospedagem Rápida e Segura', description: 'Servidores de alto desempenho com certificado SSL gratuito incluído.', iconName: 'shield-check' },
      { title: 'Foco em Geração de Contatos', description: 'Páginas estruturadas para transformar visitas em conversas no WhatsApp e formulários.', iconName: 'target' },
      { title: 'Evolução Contínua', description: 'Possibilidade de adicionar lojas virtuais, automações e suporte quando desejar.', iconName: 'zap' },
    ],
    problemSolution: {
      title: 'Sua empresa em Marília ainda perde oportunidades por não ter um site moderno?',
      subtitle: 'Veja a diferença entre depender apenas de redes sociais e ter uma presença digital sólida:',
      problemList: [
        { title: 'Falta de autoridade quando o cliente pesquisa no Google', desc: 'Perder negócios para concorrentes que possuem sites profissionais bem estruturados.' },
        { title: 'Site lento ou desformatado no celular', desc: 'Visitantes que abandonam a página rapidamente por lentidão ou dificuldade de leitura.' },
        { title: 'Dependência exclusiva de redes sociais', desc: 'Perfis no Instagram não posicionam no Google para quem pesquisa serviços urgentes em Marília.' },
      ],
      solutionList: [
        { title: 'Página institucional própria e profissional', desc: 'Sua marca com endereço próprio .com.br transmitindo segurança e credibilidade imediata.' },
        { title: 'Carregamento instantâneo em qualquer celular', desc: 'Desenvolvimento leve e responsivo para garantir ótima experiência de navegação.' },
        { title: 'Presença no Google onde as pessoas pesquisam para comprar', desc: 'Estrutura técnica otimizada para capturar buscas comerciais no mercado de Marília.' },
      ],
    },
    modalitiesTitle: 'Formatos de Sites em Marília',
    modalitiesSubtitle: 'Modelos adequados para cada necessidade empresarial:',
    modalities: [
      {
        title: 'Site Institucional Corporativo',
        tagline: 'Autoridade e apresentação completa da empresa',
        description: 'Apresentação detalhada de serviços, sobre nós, diferenciais, fotos da equipe e canais de atendimento.',
        features: ['Páginas institucionais completas', 'Design responsivo', 'Formulários e WhatsApp'],
        recommendedFor: 'Indústrias, clínicas, escritórios, consultorias e empresas em Marília.',
      },
      {
        title: 'Landing Page de Alta Conversão',
        tagline: 'Foco direto em captação de contatos e anúncios',
        description: 'Página única desenvolvida para campanhas de Google Ads e redes sociais, com objetivo claro de conversão.',
        features: ['Página única estratégica', 'Gatilhos de ação rápidos', 'Carregamento ultra-veloz'],
        recommendedFor: 'Captação de leads, lançamentos, cursos e serviços específicos.',
      },
    ],
    segmentsTitle: 'Segmentos Atendidos em Marília',
    segmentsSubtitle: 'Sites desenhados para áreas comerciais e industriais de destaque:',
    segments: [
      { name: 'Indústrias & Distribuidores', desc: 'Catálogos institucionais e captação de clientes B2B.', icon: '🏭' },
      { name: 'Clínicas & Consultórios', desc: 'Apresentação de especialidades médicas e agendamentos.', icon: '🏥' },
      { name: 'Contabilidade & Finanças', desc: 'Credibilidade e captação de empresas clientes.', icon: '📊' },
      { name: 'Advocacia & Jurídico', desc: 'Posicionamento ético e apresentação de áreas de atuação.', icon: '⚖️' },
      { name: 'Imobiliárias & Loteamentos', desc: 'Catálogo de imóveis e loteamentos em Marília.', icon: '🏠' },
      { name: 'Restaurantes & Gastronomia', desc: 'Cardápios digitais interativos e reservas.', icon: '🍽️' },
    ],
    howItWorksTitle: 'Como Criamos o Site da Sua Empresa em Marília',
    howItWorksSubtitle: 'Processo ágil e transparente:',
    howItWorks: [
      { step: '01', title: 'Briefing Inicial', desc: 'Coletamos as informações da sua empresa e seus objetivos comerciais.' },
      { step: '02', title: 'Estruturação & Layout', desc: 'Montamos a arquitetura de conteúdo e personalizamos o visual.' },
      { step: '03', title: 'Desenvolvimento & Testes', desc: 'Programação rápida com testes de responsividade e SEO.' },
      { step: '04', title: 'Publicação & Suporte', desc: 'Seu site no ar com acompanhamento contínuo da Nextia.' },
    ],
    differentialsTitle: 'Diferenciais Nextia em Marília',
    differentialsSubtitle: 'Tecnologia moderna e atendimento dedicado:',
    differentials: [
      { title: 'Soluções Integradas em Tecnologia', desc: 'Sites, WhatsApp com IA, automação e suporte de TI em um só parceiro.', iconName: 'layers' as any },
      { title: 'Foco em Vendas e Conversão', desc: 'Páginas estruturadas para transformar visitantes em contatos reais.', iconName: 'target' },
      { title: 'Código Veloz e Seguro', desc: 'Construção com tecnologias consagradas para máxima estabilidade.', iconName: 'zap' },
    ],
    nextia360Title: 'Nextia 360: Sua Empresa Conectada em Marília',
    nextia360Subtitle: 'Mais do que apenas um site profissional',
    nextia360Text: 'Comece com um site de alto impacto e conecte novas soluções como WhatsApp com IA, sistemas de gestão e suporte técnico TechCare à medida que sua empresa expande em Marília.',
    localContextTitle: 'Criação de Sites para Empresas de Marília/SP',
    localContextSubtitle: 'Fortaleça sua presença digital no Centro-Oeste Paulista.',
    localContextText1: 'Com economia vibrante nos setores industrial, comercial e de serviços, Marília exige das empresas uma presença digital profissional que transmita solidez e facilidade de contato.',
    localContextText2: 'A Nextia atende empresários de Marília com contratos formais (CNPJ 57.285.901/0001-94) e atendimento ágil pelo WhatsApp (14) 99640-5496.',
    localContextPoints: [
      'Atendimento direto pelo WhatsApp oficial: (14) 99640-5496',
      'Projetos desenvolvidos com rigor técnico e foco em usabilidade',
      'Suporte técnico contínuo para seu site e e-mails corporativos',
    ],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Soluções complementares para sua empresa:',
    relatedServices: [
      { name: 'Loja Virtual', slug: 'loja-virtual', description: 'Venda seus produtos online com catálogo e PIX.', icon: '🛍️' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automatizado 24/7 no WhatsApp.', icon: '🤖' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte técnico contínuo para computadores e redes.', icon: '🛡️' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Elimine tarefas manuais com workflows automáticos.', icon: '⚡' },
    ],
    faqs: [
      { question: 'Quanto custa criar um site profissional em Marília?', answer: 'O valor varia conforme a complexidade e quantidade de páginas. Oferecemos opções acessíveis com modelos prontos para personalização e planos de manutenção completos com hospedagem e SSL. Solicite um orçamento sem compromisso.' },
      { question: 'A Nextia atende empresas de Marília/SP?', answer: 'Sim! Atendemos ativamente indústrias, comércios, clínicas e prestadores de serviços de Marília através de atendimento digitalizado e ágil pelo WhatsApp.' },
      { question: 'O site funciona bem em celulares?', answer: 'Sim, todos os sites possuem design 100% responsivo para abrir com velocidade e clareza em smartphones.' },
      { question: 'Posso integrar com o WhatsApp da minha empresa?', answer: 'Com certeza. Inserimos botões estratégicos de WhatsApp com mensagens pré-definidas para facilitar o contato imediato do cliente.' },
    ],
    finalCta: {
      title: 'Pronto para criar o site profissional da sua empresa em Marília?',
      subtitle: 'Fale com a Nextia e receba uma proposta personalizada para colocar seu novo site no ar.',
      primaryCta: 'Solicitar orçamento gratuito',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 8. MARÍLIA — LOJA VIRTUAL
  // =========================================================================
  'marilia/loja-virtual': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'loja-virtual',
    serviceCategoryName: 'Loja Virtual & E-commerce',
    status: 'published',
    leadSource: 'pagina_marilia_loja_virtual',
    formServiceValue: 'Loja Virtual',
    metaTitle: 'Criação de Loja Virtual em Marília | E-commerce com PIX | Nextia',
    metaDescription: 'Criação de lojas virtuais em Marília com catálogo de produtos, cálculo de frete, pagamento por PIX e integração WhatsApp. Fale com a Nextia.',
    keywords: ['criação de loja virtual em Marília', 'loja virtual Marília', 'e-commerce Marília', 'criar loja online Marília', 'vendas online Marília'],
    schemaServiceType: 'StoreDevelopment',
    hero: {
      badge: 'Criação de E-commerce & Lojas Virtuais em Marília/SP',
      h1: 'Criação de Loja Virtual em Marília para ',
      h1Highlight: 'Vender Seus Produtos Online',
      subtitle: 'Tenha uma loja virtual completa, veloz e fácil de gerenciar com checkout transparente por PIX e cartão, cálculo de frete e integração direta com WhatsApp.',
      ctaPrimaryText: 'Solicitar orçamento de loja',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver demonstração',
      ctaSecondaryAnchor: '#modelos-sites',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre criação de loja virtual em Marília.',
      highlights: ['Checkout com PIX instantâneo e cartão', 'Cálculo dinâmico de frete nacional e local', 'Painel fácil para gerenciar produtos e estoque', 'Notificações de pedidos no WhatsApp'],
    },
    benefitsTitle: 'Vantagens da Loja Virtual Nextia em Marília',
    benefitsSubtitle: 'Tecnologia desenvolvida para facilitar compras e aumentar suas vendas:',
    benefits: [
      { title: 'Checkout sem Redirecionamento', description: 'O cliente conclui a compra de forma rápida com PIX e cartão de crédito.', iconName: 'zap' },
      { title: 'Catálogo por Categorias', description: 'Fotos em alta qualidade, filtros rápidos e variações de produtos.', iconName: 'shopping-bag' },
      { title: 'Cálculo de Frete', description: 'Integração para cotação em tempo real com Correios e transportadoras.', iconName: 'gauge' },
      { title: 'Pedidos no WhatsApp', description: 'Opção de receber pedidos organizados diretamente no WhatsApp da loja.', iconName: 'message-circle' },
      { title: 'Hospedagem & Segurança SSL', description: 'Ambiente seguro e criptografado para proteger compras.', iconName: 'shield-check' },
      { title: 'Totalmente Responsivo', description: 'Experiência de compra otimizada para quem compra no celular.', iconName: 'smartphone' },
    ],
    problemSolution: {
      title: 'Dificuldade para vender produtos fora da loja física em Marília?',
      subtitle: 'Veja como o e-commerce próprio automatiza suas vendas:',
      problemList: [
        { title: 'Atendimento manual demorado no WhatsApp', desc: 'Passar o dia respondendo se tem tamanho, cor e preço.' },
        { title: 'Vendas limitadas ao horário comercial', desc: 'Perda de clientes que preferem comprar à noite ou fins de semana.' },
      ],
      solutionList: [
        { title: 'Catálogo online autônomo', desc: 'O cliente pesquisa, escolhe os produtos e fecha o pedido sozinho.' },
        { title: 'Recebimento automático 24/7', desc: 'Vendas acontecendo e pagamentos sendo confirmados a qualquer hora.' },
      ],
    },
    modalitiesTitle: 'Modelos de E-commerce em Marília',
    modalitiesSubtitle: 'Estruturas para produtos físicos e serviços:',
    modalities: [
      {
        title: 'Loja Virtual Completa',
        tagline: 'Com carrinho, frete e checkout integrado',
        description: 'Plataforma para receber pagamentos por PIX e cartão com gestão de estoque.',
        features: ['Checkout integrado', 'Cálculo de frete', 'Gestão de estoque'],
        recommendedFor: 'Varejo em geral, moda, cosméticos e utilidades em Marília.',
      },
    ],
    segmentsTitle: 'Segmentos de Lojas Virtuais em Marília',
    segmentsSubtitle: 'Soluções personalizadas para o varejo local:',
    segments: [
      { name: 'Moda & Roupas', desc: 'Catálogo com grade de cores e tamanhos.', icon: '👗' },
      { name: 'Alimentos & Docerias', desc: 'Produtos artesanais e delivery em Marília.', icon: '🍫' },
      { name: 'Cosméticos & Estética', desc: 'Vendas de cosméticos e produtos de beleza.', icon: '💄' },
      { name: 'Móveis & Decoração', desc: 'Vitrine digital com fotos em alta resolução.', icon: '🛋️' },
    ],
    howItWorksTitle: 'Como Criamos Sua Loja em Marília',
    howItWorksSubtitle: 'Passo a passo transparente:',
    howItWorks: [
      { step: '01', title: 'Planejamento', desc: 'Definimos categorias, formas de pagamento e frete.' },
      { step: '02', title: 'Configuração', desc: 'Montamos a loja com sua identidade visual.' },
      { step: '03', title: 'Testes', desc: 'Testamos todo o fluxo de compras e PIX.' },
      { step: '04', title: 'Lançamento', desc: 'Sua loja no ar com treinamento para sua equipe.' },
    ],
    differentialsTitle: 'Por Que a Nextia em Marília?',
    differentialsSubtitle: 'Vantagens exclusivas:',
    differentials: [
      { title: 'Sem comissões sobre suas vendas', desc: 'Todo o lucro das vendas permanece com sua empresa.', iconName: 'shield-check' },
      { title: 'Suporte local no interior de SP', desc: 'Atendimento ágil pelo WhatsApp para dúvidas.', iconName: 'message-circle' },
    ],
    nextia360Title: 'Nextia 360: Loja e Tecnologia Conectadas',
    nextia360Subtitle: 'Estrutura completa para empresas em Marília',
    nextia360Text: 'Conecte sua loja virtual a robôs de atendimento no WhatsApp com IA e conte com suporte técnico especializado para sua operação.',
    localContextTitle: 'E-commerce para Empresas de Marília/SP',
    localContextSubtitle: 'Venda para Marília e todo o Brasil.',
    localContextText1: 'Empresas de Marília podem expandir seu faturamento além do ponto físico através de uma loja virtual própria, moderna e confiável.',
    localContextText2: 'Atendimento transparente com emissão de notas sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: ['Frete flexível para todo o Brasil', 'Pagamentos por PIX e cartão', 'Suporte direto no WhatsApp'],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Soluções complementares:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites institucionais para autoridade da marca.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático e pós-venda no WhatsApp.', icon: '🤖' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Integrações de pedidos com planilhas e CRMs.', icon: '⚡' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte técnico para computadores e redes.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'Quanto custa criar uma loja virtual em Marília?', answer: 'O valor varia conforme a quantidade de produtos e recursos. Solicite um orçamento para receber uma proposta exata.' },
      { question: 'A Nextia cobra porcentagem sobre as vendas?', answer: 'Não. Não cobramos nenhuma taxa ou comissão sobre suas vendas.' },
    ],
    finalCta: {
      title: 'Pronto para vender online em Marília?',
      subtitle: 'Fale com a Nextia e tenha sua loja virtual pronta para receber pedidos.',
      primaryCta: 'Solicitar orçamento de loja virtual',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 9. MARÍLIA — WHATSAPP COM IA
  // =========================================================================
  'marilia/whatsapp-ia': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'whatsapp-ia',
    serviceCategoryName: 'WhatsApp com Inteligência Artificial',
    status: 'published',
    leadSource: 'pagina_marilia_whatsapp_ia',
    formServiceValue: 'WhatsApp com IA',
    metaTitle: 'WhatsApp com IA em Marília | Atendimento Automático 24/7 | Nextia',
    metaDescription: 'Automação de atendimento no WhatsApp com Inteligência Artificial em Marília. Respostas inteligentes 24/7 e triagem de clientes. Conheça a Nextia.',
    keywords: ['WhatsApp com IA Marília', 'chatbot WhatsApp Marília', 'atendimento automático WhatsApp Marília', 'automação WhatsApp Marília', 'robô WhatsApp Marília'],
    schemaServiceType: 'SoftwareApplication',
    hero: {
      badge: 'Atendimento Automático com IA em Marília/SP',
      h1: 'WhatsApp com Inteligência Artificial em Marília para ',
      h1Highlight: 'Atender Clientes Instantaneamente',
      subtitle: 'Automatize seu WhatsApp com inteligência artificial treinada para responder dúvidas sobre seus serviços, qualificar clientes e agilizar vendas 24 horas por dia.',
      ctaPrimaryText: 'Automatizar meu WhatsApp',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Como funciona',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre automação e IA para WhatsApp em Marília.',
      highlights: ['Atendimento 24/7 humanizado e veloz', 'Treinado com os dados da sua empresa', 'Pausa individual da IA por conversa para humanos', 'Qualificação automática de contatos'],
    },
    benefitsTitle: 'Vantagens do WhatsApp com IA para sua Empresa em Marília',
    benefitsSubtitle: 'Ganhe tempo e não perca vendas por demora no atendimento:',
    benefits: [
      { title: 'Respostas 24 Horas por Dia', description: 'Atendimento instantâneo a qualquer hora do dia ou da noite.', iconName: 'clock' },
      { title: 'Pausa Individual da IA', description: 'O atendente humano pode assumir um chat sem desligar a IA para os outros.', iconName: 'user' as any },
      { title: 'Qualificação de Clientes', description: 'A IA filtra quem realmente tem interesse e passa contatos quentes para sua equipe.', iconName: 'target' },
      { title: 'Linguagem Natural', description: 'Conversa fluida e humanizada, muito superior a menus numéricos engessados.', iconName: 'message-circle' },
      { title: 'Histórico Completo', description: 'Painel com todas as conversas e relatórios de atendimento organizados.', iconName: 'database' },
      { title: 'Redução de Tarefas Repetitivas', description: 'Elimine horas gastas respondendo as mesmas perguntas todos os dias.', iconName: 'cpu' },
    ],
    problemSolution: {
      title: 'Mensagens acumuladas no WhatsApp da sua empresa em Marília?',
      subtitle: 'Veja como a inteligência artificial transforma seu atendimento:',
      problemList: [
        { title: 'Clientes esperando horas por uma resposta simples', desc: 'Perda de clientes para concorrentes por falta de resposta imediata.' },
        { title: 'Equipe gastando tempo com dúvidas básicas', desc: 'Horas perdidas informando endereço, horário e cardápios repetidamente.' },
      ],
      solutionList: [
        { title: 'Primeira resposta em poucos segundos', desc: 'O cliente é atendido na hora, aumentando o interesse e a conversão.' },
        { title: 'Equipe focada apenas em fechar vendas', desc: 'Sua equipe assume os atendimentos já filtrados e qualificados.' },
      ],
    },
    modalitiesTitle: 'Recursos do WhatsApp com IA',
    modalitiesSubtitle: 'Adaptado para sua empresa em Marília:',
    modalities: [
      {
        title: 'Assistente Comercial & Qualificação',
        tagline: 'Filtragem automática de leads',
        description: 'Coleta dados do cliente e encaminha para o vendedor com resumo.',
        features: ['Coleta de nome e interesse', 'Transferência para humanos', 'Resumo prévio do lead'],
        recommendedFor: 'Imobiliárias, consultorias, clínicas e empresas de serviços em Marília.',
      },
    ],
    segmentsTitle: 'Segmentos Atendidos em Marília',
    segmentsSubtitle: 'Aplicações para diversos negócios:',
    segments: [
      { name: 'Clínicas & Consultórios', desc: 'Agendamento e dúvidas frequentes.', icon: '🏥' },
      { name: 'Restaurantes & Gastronomia', desc: 'Cardápio e pedidos sem espera.', icon: '🍽️' },
      { name: 'Imobiliárias', desc: 'Triagem de perfil de imóveis.', icon: '🏠' },
      { name: 'Escritórios de Advocacia', desc: 'Atendimento inicial e triagem.', icon: '⚖️' },
    ],
    howItWorksTitle: 'Como Configuramos a IA no seu WhatsApp',
    howItWorksSubtitle: 'Etapas claras de implantação:',
    howItWorks: [
      { step: '01', title: 'Coleta de Dados', desc: 'Reunimos as informações de produtos, serviços e horários.' },
      { step: '02', title: 'Treinamento da IA', desc: 'Alimentamos o modelo com suas regras de atendimento.' },
      { step: '03', title: 'Testes', desc: 'Validamos as respostas em cenários práticos.' },
      { step: '04', title: 'Ativação', desc: 'Conectamos ao seu número de WhatsApp com suporte contínuo.' },
    ],
    differentialsTitle: 'Diferenciais Nextia',
    differentialsSubtitle: 'Controle e segurança:',
    differentials: [
      { title: 'Pausa Individual por Chat', desc: 'Atendentes humanos assumem quando necessário sem afetar outros clientes.', iconName: 'user' as any },
      { title: 'Suporte Técnico Local', desc: 'Atendimento direto com a equipe Nextia no interior de SP.', iconName: 'headphones' },
    ],
    nextia360Title: 'Nextia 360: Atendimento Integrado',
    nextia360Subtitle: 'WhatsApp com IA conectado ao seu site',
    nextia360Text: 'Conecte seu WhatsApp com IA ao seu site profissional e receba leads com triagem automática instantânea.',
    localContextTitle: 'Atendimento Inteligente em Marília/SP',
    localContextSubtitle: 'Modernize o canal de vendas mais importante da sua empresa.',
    localContextText1: 'Em Marília, responder com rapidez no WhatsApp é essencial para conquistar clientes e aumentar a conversão.',
    localContextText2: 'A Nextia realiza a implantação completa sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: ['Configuração no seu número atual', 'Treinamento específico com seus dados', 'Suporte contínuo'],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Conecte com outras soluções:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites profissionais que geram contatos para a IA.', icon: '🌐' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Integrações de dados com CRMs e planilhas.', icon: '⚡' },
      { name: 'Sistemas Sob Medida', slug: 'desenvolvimento-de-sistemas', description: 'Sistemas personalizados para gestão.', icon: '💻' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Segurança e suporte para computadores.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'A IA substitui meus atendentes humanos?', answer: 'Não. A IA atua na primeira resposta rápida e triagem, passando para humanos quando necessário.' },
      { question: 'Preciso mudar de número de WhatsApp?', answer: 'Não. Configuramos no número que sua empresa já utiliza.' },
    ],
    finalCta: {
      title: 'Pronto para automatizar seu WhatsApp em Marília?',
      subtitle: 'Fale com a Nextia e veja como a IA pode acelerar suas vendas.',
      primaryCta: 'Solicitar proposta de automação',
      whatsappCta: 'Conversar no WhatsApp',
    },
  },

  // =========================================================================
  // 10. MARÍLIA — SUPORTE DE TI
  // =========================================================================
  'marilia/suporte-ti': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'suporte-ti',
    serviceCategoryName: 'Suporte de TI & TechCare',
    status: 'published',
    leadSource: 'pagina_marilia_suporte_ti',
    formServiceValue: 'Suporte de TI',
    metaTitle: 'Suporte de TI em Marília | Suporte Técnico Empresarial | Nextia',
    metaDescription: 'Suporte de TI corporativo em Marília. Suporte remoto ágil, manutenção preventiva de computadores, redes e backup para empresas. Fale com a Nextia.',
    keywords: ['suporte de TI em Marília', 'suporte técnico Marília', 'TI para empresas Marília', 'suporte remoto Marília', 'manutenção de computadores Marília'],
    schemaServiceType: 'TechnicalSupport',
    hero: {
      badge: 'Suporte de TI Corporativo em Marília/SP',
      h1: 'Suporte de TI em Marília para a ',
      h1Highlight: 'Estabilidade da sua Empresa',
      subtitle: 'Suporte técnico remoto rápido, manutenção preventiva em computadores, redes Wi-Fi e rotinas de backup seguro para empresas em Marília.',
      ctaPrimaryText: 'Solicitar suporte de TI',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Conhecer planos',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de informações sobre suporte de TI em Marília para minha empresa.',
      highlights: ['Atendimento remoto ágil para chamados', 'Manutenção preventiva periódica', 'Configuração de redes e Wi-Fi estável', 'Backups automáticos em nuvem'],
    },
    benefitsTitle: 'Benefícios do Suporte de TI Nextia TechCare em Marília',
    benefitsSubtitle: 'Segurança e agilidade para seu ambiente de trabalho:',
    benefits: [
      { title: 'Resolução Ágil de Problemas', description: 'Suporte remoto rápido para resolver travamentos, e-mails e impressoras.', iconName: 'zap' },
      { title: 'Manutenção Preventiva', description: 'Rotinas para evitar que falhas paralisem o trabalho dos colaboradores.', iconName: 'shield-check' },
      { title: 'Backup Seguro em Nuvem', description: 'Proteção contra perda de arquivos fiscais, contratos e planilhas.', iconName: 'lock' },
      { title: 'Gestão de Redes', description: 'Configuração de roteadores para Wi-Fi rápido e estável.', iconName: 'gauge' },
      { title: 'Previsibilidade Financeira', description: 'Planos mensais sem custos surpresa de manutenção.', iconName: 'target' },
      { title: 'Histórico de Chamados', description: 'Controle de todos os atendimentos prestados nos seus computadores.', iconName: 'database' },
    ],
    problemSolution: {
      title: 'Computadores lentos e falhas de rede na sua empresa em Marília?',
      subtitle: 'Veja como o suporte estruturado soluciona os problemas:',
      problemList: [
        { title: 'Lentidão frequente que atrasa a equipe', desc: 'Perda de tempo esperando programas abrirem ou reiniciando máquinas.' },
        { title: 'Arquivos importantes sem cópia de segurança', desc: 'Risco de perder documentos por falha no disco ou ataque de vírus.' },
      ],
      solutionList: [
        { title: 'Computadores otimizados e atualizados', desc: 'Máquinas configuradas para velocidade e estabilidade contínua.' },
        { title: 'Backup automático e criptografado', desc: 'Cópias diárias salvas em nuvem para recuperação rápida.' },
      ],
    },
    modalitiesTitle: 'Planos de Suporte em Marília',
    modalitiesSubtitle: 'Modalidades adaptadas à sua empresa:',
    modalities: [
      {
        title: 'Plano Mensal Nextia TechCare',
        tagline: 'Apoio técnico preventivo e contínuo',
        description: 'Suporte remoto ilimitado para chamados, manutenção e backups regulares.',
        features: ['Chamados remotos rápidos', 'Backup em nuvem configurado', 'Manutenção preventiva'],
        recommendedFor: 'Escritórios, clínicas, comércios e empresas em Marília com 2 ou mais computadores.',
      },
    ],
    segmentsTitle: 'Setores Atendidos em Marília',
    segmentsSubtitle: 'Suporte corporativo para diversas áreas:',
    segments: [
      { name: 'Escritórios de Contabilidade', desc: 'Estabilidade para entregas de obrigações fiscais.', icon: '📊' },
      { name: 'Clínicas & Consultórios', desc: 'Segurança para prontuários e computadores de atendimento.', icon: '🏥' },
      { name: 'Advocacia', desc: 'Proteção de documentos e certificados digitais.', icon: '⚖️' },
      { name: 'Comércio & Varejo', desc: 'Operação de caixas e rede Wi-Fi sem interrupções.', icon: '🛍️' },
    ],
    howItWorksTitle: 'Como Funciona o Atendimento',
    howItWorksSubtitle: 'Do chamado à solução rápida:',
    howItWorks: [
      { step: '01', title: 'Abertura do Chamado', desc: 'Envio de mensagem direta no WhatsApp ou painel.' },
      { step: '02', title: 'Atendimento Remoto', desc: 'O técnico acessa com segurança e resolve o problema.' },
      { step: '03', title: 'Conclusão e Registro', desc: 'Teste com o usuário e documentação no histórico.' },
    ],
    differentialsTitle: 'Diferenciais Nextia',
    differentialsSubtitle: 'Atendimento técnico profissional:',
    differentials: [
      { title: 'Sem Burocracia', desc: 'Canal direto para falar com quem resolve o problema.', iconName: 'zap' },
      { title: 'Empresa Formalizada', desc: 'Contratos claros e notas sob o CNPJ 57.285.901/0001-94.', iconName: 'shield-check' },
    ],
    nextia360Title: 'Nextia 360: TI e Soluções Digitais Unificadas',
    nextia360Subtitle: 'Infraestrutura completa para sua empresa em Marília',
    nextia360Text: 'Centralize seu suporte de informática, site institucional e automações com a Nextia, economizando tempo e facilitando o gerenciamento.',
    localContextTitle: 'Suporte Técnico de TI em Marília/SP',
    localContextSubtitle: 'Atendimento remoto ágil no interior de São Paulo.',
    localContextText1: 'A Nextia apoia empresas de Marília com suporte de informática voltado para estabilidade e segurança de dados.',
    localContextText2: 'Atendimento direto pelo WhatsApp oficial (14) 99640-5496.',
    localContextPoints: ['Suporte remoto ágil', 'Configuração de backups em nuvem', 'Consultoria técnica para equipamentos'],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Conecte com outras soluções:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites profissionais rápidos e seguros.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático inteligente.', icon: '🤖' },
      { name: 'Sistemas Sob Medida', slug: 'desenvolvimento-de-sistemas', description: 'Softwares para gestão de processos.', icon: '💻' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Elimine tarefas manuais com workflows.', icon: '⚡' },
    ],
    faqs: [
      { question: 'Como funciona o suporte remoto para empresas em Marília?', answer: 'Através de ferramentas seguras de acesso remoto autorizado pelo usuário, diagnosticamos e resolvemos a maioria das falhas em minutos.' },
      { question: 'Vocês atendem empresas em Marília/SP?', answer: 'Sim, atendemos ativamente empresas de Marília e região através de suporte remoto e planos corporativos.' },
    ],
    finalCta: {
      title: 'Garanta estabilidade para os computadores da sua empresa em Marília',
      subtitle: 'Fale com a Nextia e conheça nossos planos de suporte de TI TechCare.',
      primaryCta: 'Solicitar proposta de suporte de TI',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 11. MARÍLIA — AUTOMAÇÃO
  // =========================================================================
  'marilia/automacao': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'automacao',
    serviceCategoryName: 'Automação Empresarial',
    status: 'published',
    leadSource: 'pagina_marilia_automacao',
    formServiceValue: 'Automação Empresarial',
    metaTitle: 'Automação Empresarial em Marília | Automação de Processos | Nextia',
    metaDescription: 'Automação de processos e fluxos empresariais em Marília. Elimine tarefas manuais, conecte ferramentas e ganhe produtividade com a Nextia.',
    keywords: ['automação empresarial Marília', 'automação de processos Marília', 'automação para empresas Marília', 'integração de sistemas Marília', 'workflows Marília'],
    schemaServiceType: 'BusinessAutomation',
    hero: {
      badge: 'Automação de Processos Empresariais em Marília/SP',
      h1: 'Automação Empresarial em Marília para ',
      h1Highlight: 'Ganhar Agilidade e Reduzir Erros',
      subtitle: 'Conecte formulários, WhatsApp, planilhas e e-mails para que tarefas operacionais repetitivas aconteçam automaticamente na sua empresa em Marília.',
      ctaPrimaryText: 'Automatizar minha empresa',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Ver possibilidades',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre automação de processos para minha empresa em Marília.',
      highlights: ['Integração automática entre formulários e CRMs', 'Notificações e lembretes automáticos no WhatsApp', 'Redução de tempo e retrabalho manual', 'Mais produtividade para a equipe'],
    },
    benefitsTitle: 'Benefícios da Automação de Processos em Marília',
    benefitsSubtitle: 'Mais eficiência para sua operação:',
    benefits: [
      { title: 'Eliminação de Tarefas Manuais', description: 'Pare de copiar dados entre sistemas e planilhas.', iconName: 'cpu' },
      { title: 'Velocidade de Resposta', description: 'Processos executados em segundos de forma automática.', iconName: 'zap' },
      { title: 'Zero Erros Manuais', description: 'Informações padronizadas sem falhas de digitação.', iconName: 'shield-check' },
      { title: 'Notificações Imediatas', description: 'Alertas no WhatsApp a cada etapa do processo.', iconName: 'message-circle' },
    ],
    problemSolution: {
      title: 'Sua empresa em Marília perde tempo com tarefas repetitivas?',
      subtitle: 'Veja o impacto da automação:',
      problemList: [
        { title: 'Digitação manual de contatos em planilhas', desc: 'Erros e atrasos no encaminhamento para os vendedores.' },
        { title: 'Esquecimento de avisos e lembretes de clientes', desc: 'Faltas em agendamentos por falta de aviso prévio.' },
      ],
      solutionList: [
        { title: 'Cadastros sincronizados automaticamente', desc: 'Dados do site entram direto no CRM sem intervenção humana.' },
        { title: 'Lembretes automáticos no WhatsApp', desc: 'Mensagens automáticas que reduzem faltas e cancelamentos.' },
      ],
    },
    modalitiesTitle: 'Aplicações Práticas de Automação',
    modalitiesSubtitle: 'Para diversas áreas da sua empresa em Marília:',
    modalities: [
      {
        title: 'Automação Comercial & Leads',
        tagline: 'Do site direto para o vendedor',
        description: 'O lead entra no site, vai para o CRM e o vendedor recebe aviso no WhatsApp.',
        features: ['Integração com CRM', 'Aviso em tempo real no WhatsApp'],
        recommendedFor: 'Empresas comerciais, imobiliárias e prestadores de serviços em Marília.',
      },
    ],
    segmentsTitle: 'Setores Atendidos em Marília',
    segmentsSubtitle: 'Automações para indústrias, comércio e serviços:',
    segments: [
      { name: 'Clínicas & Saúde', desc: 'Confirmação automática de consultas.', icon: '🏥' },
      { name: 'Escritórios Contábeis', desc: 'Avisos de vencimento de obrigações.', icon: '📊' },
      { name: 'Imobiliárias', desc: 'Distribuição automática de clientes para corretores.', icon: '🏠' },
    ],
    howItWorksTitle: 'Como Implementamos Automações',
    howItWorksSubtitle: 'Mapeamento e configuração:',
    howItWorks: [
      { step: '01', title: 'Diagnóstico', desc: 'Identificamos as tarefas manuais mais demoradas.' },
      { step: '02', title: 'Construção do Fluxo', desc: 'Conectamos as ferramentas por integrações seguras.' },
      { step: '03', title: 'Ativação e Suporte', desc: 'Validação e acompanhamento contínuo.' },
    ],
    differentialsTitle: 'Vantagens Nextia',
    differentialsSubtitle: 'Soluções sob medida:',
    differentials: [
      { title: 'Integrações sem trocar de sistema', desc: 'Conectamos as ferramentas que você já usa.', iconName: 'zap' },
      { title: 'Suporte próximo no interior de SP', desc: 'Atendimento direto pelo WhatsApp.', iconName: 'message-circle' },
    ],
    nextia360Title: 'Nextia 360: Automação Integrada',
    nextia360Subtitle: 'Sua empresa automatizada de ponta a ponta',
    nextia360Text: 'Integre seu site, robôs de WhatsApp e sistemas internos para operar com máxima agilidade e sem retrabalho.',
    localContextTitle: 'Automação de Processos em Marília/SP',
    localContextSubtitle: 'Mais produtividade para negócios locais.',
    localContextText1: 'Empresas de Marília que automatizam processos conseguem atender mais clientes sem aumentar custos com tarefas burocráticas.',
    localContextText2: 'Atendimento formalizado sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: ['Mapeamento dos gargalos da sua operação', 'Configuração ágil de integrações', 'Suporte contínuo'],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Combine automações com outras soluções:',
    relatedServices: [
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento automático inteligente no WhatsApp.', icon: '🤖' },
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites com formulários integrados a fluxos.', icon: '🌐' },
      { name: 'Sistemas Sob Medida', slug: 'desenvolvimento-de-sistemas', description: 'Sistemas web personalizados.', icon: '💻' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte técnico contínuo para computadores.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'O que posso automatizar na minha empresa em Marília?', answer: 'Envio de lembretes no WhatsApp, cadastros de leads em planilhas/CRMs, alertas para vendedores e avisos de cobrança.' },
      { question: 'Preciso trocar meus sistemas atuais?', answer: 'Não. Nós conectamos as ferramentas que você já utiliza através de integrações.' },
    ],
    finalCta: {
      title: 'Pronto para automatizar processos na sua empresa em Marília?',
      subtitle: 'Fale com a Nextia e receba uma recomendação sob medida para seu negócio.',
      primaryCta: 'Solicitar proposta de automação',
      whatsappCta: 'Falar no WhatsApp',
    },
  },

  // =========================================================================
  // 12. MARÍLIA — DESENVOLVIMENTO DE SISTEMAS
  // =========================================================================
  'marilia/desenvolvimento-de-sistemas': {
    citySlug: 'marilia',
    cityName: 'Marília',
    state: 'SP',
    serviceSlug: 'desenvolvimento-de-sistemas',
    serviceCategoryName: 'Desenvolvimento de Sistemas Web',
    status: 'published',
    leadSource: 'pagina_marilia_desenvolvimento_de_sistemas',
    formServiceValue: 'Sistema Sob Medida',
    metaTitle: 'Desenvolvimento de Sistemas em Marília | Software Sob Medida | Nextia',
    metaDescription: 'Desenvolvimento de sistemas web e softwares personalizados para empresas em Marília. Painéis administrativos, portais de clientes e dashboards. Fale com a Nextia.',
    keywords: ['desenvolvimento de sistemas Marília', 'software personalizado Marília', 'sistemas empresariais Marília', 'desenvolvimento de software Marília', 'sistema web Marília'],
    schemaServiceType: 'SoftwareDevelopment',
    hero: {
      badge: 'Sistemas Web & Software Sob Medida em Marília/SP',
      h1: 'Desenvolvimento de Sistemas em Marília para ',
      h1Highlight: 'Centralizar a Gestão da sua Empresa',
      subtitle: 'Desenvolvemos sistemas web sob medida, portais de clientes e painéis de controle para organizar processos e substituir planilhas complexas na sua empresa em Marília.',
      ctaPrimaryText: 'Solicitar proposta de sistema',
      ctaPrimaryAnchor: '#formulario-orcamento',
      ctaSecondaryText: 'Como funciona',
      ctaSecondaryAnchor: '#como-funciona',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre desenvolvimento de sistemas e software sob medida em Marília.',
      highlights: ['Sistema 100% web acessível com segurança de qualquer lugar', 'Modelado para o fluxo exato da sua equipe', 'Dashboards e relatórios em tempo real', 'Banco de dados em nuvem com backup automático'],
    },
    benefitsTitle: 'Vantagens do Software Sob Medida em Marília',
    benefitsSubtitle: 'Ferramenta exata para o crescimento da sua empresa:',
    benefits: [
      { title: 'Adequação Exata ao seu Processo', description: 'Sistema desenhado para a realidade da sua operação em Marília.', iconName: 'target' },
      { title: 'Acesso Seguro em Nuvem', description: 'Acesse de qualquer computador ou celular com controle de permissões.', iconName: 'lock' },
      { title: 'Substituição de Planilhas', description: 'Dados centralizados e protegidos em banco de dados relacional.', iconName: 'database' },
      { title: 'Dashboards em Tempo Real', description: 'Acompanhamento claro dos principais indicadores da empresa.', iconName: 'gauge' },
      { title: 'Integração com APIs', description: 'Conexão com pagamentos, WhatsApp e ferramentas externas.', iconName: 'cpu' },
      { title: 'Escalabilidade', description: 'Adicione novos módulos conforme sua empresa expande.', iconName: 'zap' },
    ],
    problemSolution: {
      title: 'Planilhas confusas e sistemas engessados na sua empresa em Marília?',
      subtitle: 'Veja como um sistema web personalizado soluciona a gestão:',
      problemList: [
        { title: 'Planilhas manuais descentralizadas', desc: 'Informações perdidas e risco de alterações indevidas sem histórico.' },
        { title: 'Softwares prontos que não atendem sua regra de negócio', desc: 'Pagar mensalidades caras por sistemas que não resolvem o fluxo da sua empresa.' },
      ],
      solutionList: [
        { title: 'Dados centralizados com login e permissão', desc: 'Controle exato de quem pode visualizar e editar cada informação.' },
        { title: 'Telas limpas e focadas na sua rotina', desc: 'Software rápido e sem complexidades desnecessárias.' },
      ],
    },
    modalitiesTitle: 'Formatos de Sistemas Desenvolvidos',
    modalitiesSubtitle: 'Soluções corporativas para empresas de Marília:',
    modalities: [
      {
        title: 'Painéis Administrativos & Gestão Interna',
        tagline: 'Controle operacional completo',
        description: 'Sistemas para controle de pedidos, contratos, ordens de serviço e relatórios.',
        features: ['Gestão de cadastros e permissões', 'Relatórios personalizados', 'Controle de etapas'],
        recommendedFor: 'Indústrias, distribuidoras, prestadores de serviços e empresas em Marília.',
      },
      {
        title: 'Portais do Cliente',
        tagline: 'Área segura para seus clientes',
        description: 'Ambiente onde seus clientes consultam documentos, relatórios e status de serviços.',
        features: ['Login seguro', 'Download de documentos', 'Notificações automáticas'],
        recommendedFor: 'Escritórios contábeis, advocacia e imobiliárias em Marília.',
      },
    ],
    segmentsTitle: 'Segmentos Atendidos em Marília',
    segmentsSubtitle: 'Softwares para áreas com processos específicos:',
    segments: [
      { name: 'Indústrias & Distribuidores', desc: 'Portais B2B para pedidos e cotações.', icon: '🏭' },
      { name: 'Contabilidades & Escritórios', desc: 'Portal para tráfego seguro de guias e relatórios.', icon: '📊' },
      { name: 'Clínicas & Especialidades', desc: 'Gestão de atendimentos e históricos.', icon: '🏥' },
      { name: 'Imobiliárias', desc: 'Gestão de propostas e contratos.', icon: '🏠' },
    ],
    howItWorksTitle: 'Como Criamos Seu Sistema Sob Medida',
    howItWorksSubtitle: 'Processo ágil e transparente:',
    howItWorks: [
      { step: '01', title: 'Levantamento', desc: 'Mapeamos cada regra de negócio e fluxo de telas.' },
      { step: '02', title: 'Design & Protótipo', desc: 'Desenhamos a interface para validação prévia.' },
      { step: '03', title: 'Desenvolvimento', desc: 'Construção com tecnologias seguras e modernas.' },
      { step: '04', title: 'Testes & Publicação', desc: 'Validação com sua equipe e lançamento com suporte.' },
    ],
    differentialsTitle: 'Diferenciais Nextia',
    differentialsSubtitle: 'Engenharia de software de alto padrão:',
    differentials: [
      { title: 'Tecnologias Modernas', desc: 'Desenvolvido com React, Node.js e PostgreSQL.', iconName: 'code' as any },
      { title: 'Suporte Próximo', desc: 'Comunicação direta com a equipe de engenharia.', iconName: 'headphones' },
    ],
    nextia360Title: 'Nextia 360: Sistemas e Infraestrutura',
    nextia360Subtitle: 'Gestão conectada ao seu site e WhatsApp',
    nextia360Text: 'Integre seu sistema sob medida ao seu site profissional e aos robôs de atendimento no WhatsApp com suporte da Nextia.',
    localContextTitle: 'Desenvolvimento de Softwares em Marília/SP',
    localContextSubtitle: 'Tecnologia sob medida para empresas do interior paulista.',
    localContextText1: 'Empresas de Marília que buscam eficiência operacional encontram no software personalizado a solução ideal para organizar processos e crescer.',
    localContextText2: 'Contratos formais com emissão de notas fiscais sob o CNPJ 57.285.901/0001-94 e WhatsApp (14) 99640-5496.',
    localContextPoints: ['Levantamento consultivo detalhado', 'Foco em usabilidade e segurança', 'Suporte técnico contínuo'],
    relatedServicesTitle: 'Serviços Relacionados em Marília',
    relatedServicesSubtitle: 'Soluções complementares:',
    relatedServices: [
      { name: 'Criação de Sites', slug: 'criacao-de-sites', description: 'Sites institucionais integrados ao seu sistema.', icon: '🌐' },
      { name: 'WhatsApp com IA', slug: 'whatsapp-ia', description: 'Atendimento e disparos automáticos no WhatsApp.', icon: '🤖' },
      { name: 'Automação Empresarial', slug: 'automacao', description: 'Conexão de dados com ferramentas externas.', icon: '⚡' },
      { name: 'Suporte de TI', slug: 'suporte-ti', description: 'Suporte técnico para computadores e redes.', icon: '🛡️' },
    ],
    faqs: [
      { question: 'Quanto custa desenvolver um sistema sob medida em Marília?', answer: 'O investimento depende do escopo e funcionalidades necessárias. Realizamos um diagnóstico prévio para apresentar uma proposta transparente com prazos e valores.' },
      { question: 'O sistema pode ser acessado pelo celular?', answer: 'Sim. Todas as interfaces são 100% responsivas para acesso no celular, tablet e computador.' },
    ],
    finalCta: {
      title: 'Pronto para criar o sistema sob medida da sua empresa em Marília?',
      subtitle: 'Fale com a Nextia e receba uma avaliação técnica personalizada para seu projeto.',
      primaryCta: 'Solicitar proposta de sistema',
      whatsappCta: 'Falar no WhatsApp',
    },
  },
};

const SERVICE_ALIASES: Record<string, string> = {
  'criacao-de-sites': 'criacao-de-sites',
  'criacao-de-site': 'criacao-de-sites',
  'criacao-sites': 'criacao-de-sites',
  'criacaodesites': 'criacao-de-sites',
  'sites': 'criacao-de-sites',
  'site': 'criacao-de-sites',
  'loja-virtual': 'loja-virtual',
  'lojas-virtuais': 'loja-virtual',
  'lojavirtual': 'loja-virtual',
  'ecommerce': 'loja-virtual',
  'e-commerce': 'loja-virtual',
  'whatsapp-ia': 'whatsapp-ia',
  'ia-whatsapp': 'whatsapp-ia',
  'whatsappia': 'whatsapp-ia',
  'automacao-whatsapp': 'whatsapp-ia',
  'suporte-ti': 'suporte-ti',
  'suporte': 'suporte-ti',
  'suporteti': 'suporte-ti',
  'techcare': 'suporte-ti',
  'automacao': 'automacao',
  'automacao-empresarial': 'automacao',
  'automacao-ia': 'automacao',
  'desenvolvimento-de-sistemas': 'desenvolvimento-de-sistemas',
  'desenvolvimento-sistemas': 'desenvolvimento-de-sistemas',
  'desenvolvimentodesistemas': 'desenvolvimento-de-sistemas',
  'sistemas': 'desenvolvimento-de-sistemas',
  'software': 'desenvolvimento-de-sistemas',
};

export function getLocalServiceData(citySlug: string, serviceSlug: string): LocalServiceData | null {
  const normalizedCity = String(citySlug || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  let normalizedService = String(serviceSlug || '').toLowerCase().trim().replace(/_/g, '-');
  normalizedService = SERVICE_ALIASES[normalizedService] || normalizedService;

  const key = `${normalizedCity}/${normalizedService}`;
  return LOCAL_SERVICES_DATA[key] || null;
}

export function getAllPublishedLocalServices(): LocalServiceData[] {
  return Object.values(LOCAL_SERVICES_DATA).filter((item) => item.status === 'published');
}
