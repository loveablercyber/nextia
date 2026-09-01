export interface OptionalFeature {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  oneTimePrice: number;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  price: number;
  activationFee: number;
  featured: boolean;
  badge?: string;
  features: string[];
  pages: string[];
  recommendedPlan: string;
  estimatedDays: number;
  demoUrl: string;
  testimonials: Testimonial[];
  optionalFeatures?: OptionalFeature[];
  previewDesktop?: string;
  previewMobile?: string;
}

export interface Testimonial {
  name: string;
  company: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

// Depoimentos só podem ser associados após autorização e aprovação formal.
// A coleção permanece vazia enquanto não houver registros reais verificáveis.
const testimonials: Testimonial[] = [];

// Recurso Opcionais (Addons) Específicos por Segmento
export const RESTAURANTE_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-chatbot', name: 'Chatbot de Atendimento 24/7', description: 'Atendimento automatizado inteligente integrado ao WhatsApp.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-reservas', name: 'Calendário de Reservas Avançado', description: 'Evite overbooking com confirmação automática de mesas.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-delivery', name: 'Painel de Pedidos & Delivery', description: 'Receba e gerencie pedidos com status em tempo real.', monthlyPrice: 89, oneTimePrice: 0 },
  { id: 'opt-pdv', name: 'Integração com Caixa (PDV) / iFood', description: 'Sincronize vendas, estoque e sistemas de caixa.', monthlyPrice: 99, oneTimePrice: 0 },
  { id: 'opt-fidelidade', name: 'Programa de Fidelidade & Cashback', description: 'Acumulação de pontos e cupons para clientes recorrentes.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-idiomas', name: 'Multi-idioma (Inglês / Espanhol)', description: 'Tradução completa do cardápio e site para estrangeiros.', monthlyPrice: 0, oneTimePrice: 199 },
  { id: 'opt-fotos', name: 'Fotografia Profissional de Pratos', description: 'Fotos profissionais de pratos em altíssima resolução.', monthlyPrice: 0, oneTimePrice: 299 },
];

export const SALAO_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-agendamento-salao', name: 'Agendamento Online Inteligente', description: 'Escolha de profissional, serviço e horário com confirmação.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-lembrete-whatsapp', name: 'Lembretes Automáticos WhatsApp', description: 'Reduza faltas e atrasos enviando lembretes automatizados.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-fidelidade-salao', name: 'Clube de Fidelidade & Cashback', description: 'Recompense clientes assíduos com pontos e descontos.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-galeria-trabalhos', name: 'Galeria Interativa de Resultados', description: 'Exiba transformações, cortes e estilos atualizados.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-fotos-salao', name: 'Fotografia Profissional do Salão', description: 'Sessão de fotos do ambiente e equipe profissional.', monthlyPrice: 0, oneTimePrice: 299 },
];

export const SERVICOS_PROFISSIONAIS_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-portal-cliente', name: 'Portal do Cliente Exclusivo', description: 'Área do cliente para acompanhamento de solicitações e prazos.', monthlyPrice: 59, oneTimePrice: 0 },
  { id: 'opt-consulta-processual', name: 'Consulta Processual & Notificações', description: 'Atualização e alertas de andamentos para clientes e processos.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-assinatura-digital', name: 'Assinatura Digital de Contratos', description: 'Assinatura eletrônica com validade jurídica sem burocracia.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-upload-seguro', name: 'Upload Seguro de Documentos', description: 'Envio de arquivos com criptografia e organização por pasta.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-agendamento-consultas', name: 'Agendamento de Consultas Online', description: 'Agenda sincronizada para marcação direta de reuniões.', monthlyPrice: 29, oneTimePrice: 0 },
];

export const LOJA_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-checkout-integrado', name: 'Checkout Integrado (Cartão & Pix)', description: 'Receba pagamentos direto no site via Mercado Pago ou Pagar.me.', monthlyPrice: 79, oneTimePrice: 0 },
  { id: 'opt-calculo-frete', name: 'Cálculo Automático de Frete', description: 'Cotação em tempo real com Correios e Melhor Envio.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-cupons-whatsapp', name: 'Disparo de Cupons WhatsApp', description: 'Campanhas de marketing automatizadas para novos cupons.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-estoque-real', name: 'Gestão de Estoque em Tempo Real', description: 'Controle de variações (cor, tamanho) e baixa automática.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-moedas-idiomas', name: 'Multi-idioma & Moedas', description: 'Adaptação do catálogo para vendas internacionais.', monthlyPrice: 0, oneTimePrice: 199 },
];

export const CLINICA_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-agendamento-clinica', name: 'Agendamento Online de Consultas', description: 'Marcação rápida por especialidade e profissional.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-prontuario-eletronico', name: 'Prontuário Eletrônico Simplificado', description: 'Histórico de tratamentos e anamnese em ambiente seguro.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-teleconsulta', name: 'Módulo de Teleconsulta em Vídeo', description: 'Atendimento à distância com sala virtual criptografada.', monthlyPrice: 69, oneTimePrice: 0 },
  { id: 'opt-area-paciente', name: 'Área do Paciente', description: 'Acesso a orientações pós-procedimento, exames e dados.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-receitas-digitais', name: 'Receitas & Atestados Digitais', description: 'Emissão e assinatura de receitas com QR Code.', monthlyPrice: 29, oneTimePrice: 0 },
];

export const CONTABILIDADE_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-portal-contabil', name: 'Portal do Cliente Contábil', description: 'Envio mensal de guias de impostos, folhas e relatórios.', monthlyPrice: 59, oneTimePrice: 0 },
  { id: 'opt-armazenamento-xml', name: 'Armazenamento & Gestão de XML', description: 'Guarda e consulta automatizada de NFe/NFSe.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-assinatura-contabil', name: 'Assinatura Digital de Documentos', description: 'Assinatura ágil de balanços, declarações e contratos.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-upload-contabil', name: 'Upload Seguro de Documentos', description: 'Recebimento de extratos bancários e notas dos clientes.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-integracao-dominio', name: 'Integração Domínio / Alterdata', description: 'Sincronização com os principais ERPs contábeis do mercado.', monthlyPrice: 89, oneTimePrice: 0 },
  { id: 'opt-area-restrita-contabil', name: 'Área Restrita para Clientes', description: 'Painel protegido por senha com histórico fiscal.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-backup-nuvem', name: 'Backup de Documentos na Nuvem', description: 'Cópia de segurança diária criptografada.', monthlyPrice: 29, oneTimePrice: 0 },
];

export const IMOBILIARIA_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-portal-imobiliaria', name: 'Portal do Inquilino & Proprietário', description: 'Emissão de 2ª via de boleto, extratos de repasse e IR.', monthlyPrice: 69, oneTimePrice: 0 },
  { id: 'opt-busca-geolocalizacao', name: 'Busca Avançada por Mapa & Bairro', description: 'Filtro geográfico dinâmico para busca de imóveis.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-simulador-financiamento', name: 'Simulador de Financiamento', description: 'Calculadora de parcelas com taxas atualizadas dos bancos.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-tour-360', name: 'Tour Virtual 360° de Imóveis', description: 'Integração para visualização tridimensional imersiva.', monthlyPrice: 0, oneTimePrice: 299 },
  { id: 'opt-integracao-portais', name: 'Integração com Portais (Zap/VivaReal)', description: 'Publicação automática do catálogo de imóveis.', monthlyPrice: 89, oneTimePrice: 0 },
];

export const OFICINA_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-agendamento-oficina', name: 'Agendamento de Revisão Online', description: 'Escolha de data e horário para serviços preventivos.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-orcamento-whatsapp', name: 'Orçamento Rápido via WhatsApp', description: 'Envio simplificado de cotação de peças e mão de obra.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-acompanhamento-os', name: 'Acompanhamento de Ordem de Serviço', description: 'Status do reparo do veículo visível pelo cliente.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-historico-veiculo', name: 'Histórico do Veículo do Cliente', description: 'Registro digital de trocas de óleo, peças e revisões.', monthlyPrice: 29, oneTimePrice: 0 },
];

export const IMOBILIARIA_PREMIUM_OPTIONAL_FEATURES: OptionalFeature[] = [
  { id: 'opt-portal-corretor', name: 'Portal do Corretor & Equipe', description: 'Painel exclusivo de gestão de corretores e divisão de leads.', monthlyPrice: 69, oneTimePrice: 0 },
  { id: 'opt-crm-imobiliario', name: 'CRM Imobiliário Integrado', description: 'Funil de vendas, acompanhamento de clientes e histórico de visitas.', monthlyPrice: 99, oneTimePrice: 0 },
  { id: 'opt-tour-360-premium', name: 'Tour Virtual 360° Matterport / VR', description: 'Suporte a tours imersivos tridimensionais e realidade virtual.', monthlyPrice: 0, oneTimePrice: 299 },
  { id: 'opt-zap-vivareal', name: 'Integração Zap Imóveis & Viva Real', description: 'Sincronização automática de anúncios com o portal OLX/Zap.', monthlyPrice: 89, oneTimePrice: 0 },
  { id: 'opt-olx-imoveis', name: 'Integração OLX & Portais Nacionais', description: 'Publicação de catálogo nos principais portais do Brasil.', monthlyPrice: 49, oneTimePrice: 0 },
  { id: 'opt-captacao-auto', name: 'Captação Automática de Leads', description: 'Formulário "Anuncie Seu Imóvel" com notificação instantânea.', monthlyPrice: 59, oneTimePrice: 0 },
  { id: 'opt-avaliacao-online', name: 'Avaliação Online de Imóveis por IA', description: 'Estimativa de valor de mercado baseada em m² e região.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-simulador-avancado', name: 'Simulador de Financiamento Avançado', description: 'Calculadora em tempo real de parcelas Caixa, Itaú e Bradesco.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-assinatura-propostas', name: 'Assinatura Digital de Propostas', description: 'Envio e validação eletrônica de propostas de compra e aluguel.', monthlyPrice: 39, oneTimePrice: 0 },
  { id: 'opt-area-cliente-proprietario', name: 'Área do Cliente & Proprietário', description: 'Extratos de repasse de aluguel, 2ª via de boleto e relatórios.', monthlyPrice: 69, oneTimePrice: 0 },
  { id: 'opt-comparador-favoritos', name: 'Comparador de Imóveis & Favoritos', description: 'Permite ao cliente salvar e comparar características de imóveis.', monthlyPrice: 19, oneTimePrice: 0 },
  { id: 'opt-alertas-imoveis', name: 'Alertas Automáticos no WhatsApp', description: 'Notificações automáticas quando novos imóveis do perfil entram.', monthlyPrice: 29, oneTimePrice: 0 },
  { id: 'opt-rd-meta-google', name: 'Integração RD Station & Meta Ads', description: 'Rastreamento avançado de pixels e conversões de anúncios.', monthlyPrice: 79, oneTimePrice: 0 },
  { id: 'opt-chatbot-imobiliario', name: 'Chatbot Imobiliário 24/7', description: 'Atendimento e qualificação automática de clientes via WhatsApp.', monthlyPrice: 49, oneTimePrice: 0 },
];

export const templates: Template[] = [
  {
    id: "1",
    slug: "restaurante-premium",
    name: "Restaurante Premium",
    category: "Restaurante",
    categorySlug: "restaurante",
    description:
      "Template completo para restaurantes com cardápio digital, reservas online e galeria de fotos. Ideal para atrair mais clientes e aumentar as reservas pelo site.",
    shortDescription: "Cardápio digital, reservas e galeria de fotos.",
    coverImage: "/images/templates/restaurante-premium.webp",
    price: 79,
    activationFee: 197,
    featured: true,
    badge: "Mais vendido",
    features: [
      "Cardápio digital interativo",
      "Reservas online",
      "Galeria de fotos profissional",
      "WhatsApp integrado",
      "Mapa do Google Maps",
      "Horário de funcionamento",
      "SSL gratuito",
      "Design responsivo",
      "Formulário de contato",
      "SEO básico incluído",
    ],
    pages: [
      "Página inicial",
      "Cardápio completo",
      "Reservas",
      "Galeria",
      "Sobre nós",
      "Contato",
    ],
    recommendedPlan: "Pro",
    estimatedDays: 5,
    demoUrl: "/demo/restaurante-premium",
    testimonials,
    optionalFeatures: RESTAURANTE_OPTIONAL_FEATURES,
  },
  {
    id: "2",
    slug: "salao-elegance",
    name: "Salão Elegance",
    category: "Salão & Barbearia",
    categorySlug: "salao-barbearia",
    description:
      "Template moderno para salões de beleza e barbearias com agendamento online, portfólio de serviços e integração com redes sociais. Conquiste mais clientes com uma presença digital incrível.",
    shortDescription: "Agendamento online, portfólio e redes sociais.",
    coverImage: "/images/templates/salao-elegance.webp",
    price: 69,
    activationFee: 197,
    featured: true,
    badge: "Novo",
    features: [
      "Agendamento online",
      "Portfólio de serviços",
      "Galeria de trabalhos",
      "WhatsApp integrado",
      "Instagram integrado",
      "Lista de preços",
      "Equipe e profissionais",
      "SSL gratuito",
      "Design responsivo",
      "Formulário de contato",
    ],
    pages: [
      "Página inicial",
      "Serviços e preços",
      "Agendamento",
      "Portfólio",
      "Equipe",
      "Contato",
    ],
    recommendedPlan: "Pro",
    estimatedDays: 5,
    demoUrl: "/demo/salao-elegance",
    testimonials,
    optionalFeatures: SALAO_OPTIONAL_FEATURES,
  },
  {
    id: "3",
    slug: "servicos-profissionais",
    name: "Serviços Profissionais",
    category: "Prestador de Serviços",
    categorySlug: "prestador-servicos",
    description:
      "Template elegante para prestadores de serviços, consultores e profissionais liberais. Apresente seus serviços, conquiste autoridade e gere mais leads qualificados.",
    shortDescription: "Apresentação de serviços, portfólio e geração de leads.",
    coverImage: "/images/templates/servicos-profissionais.webp",
    price: 59,
    activationFee: 197,
    featured: true,
    features: [
      "Apresentação de serviços",
      "Portfólio de projetos",
      "Formulário de orçamento",
      "WhatsApp integrado",
      "Depoimentos de clientes",
      "Sobre o profissional",
      "SSL gratuito",
      "Design responsivo",
      "SEO básico incluído",
      "Google Analytics",
    ],
    pages: [
      "Página inicial",
      "Serviços",
      "Portfólio",
      "Sobre",
      "Depoimentos",
      "Contato / Orçamento",
    ],
    recommendedPlan: "Start",
    estimatedDays: 4,
    demoUrl: "/demo/servicos-profissionais",
    testimonials,
    optionalFeatures: SERVICOS_PROFISSIONAIS_OPTIONAL_FEATURES,
  },
  {
    id: "4",
    slug: "loja-catalogo",
    name: "Loja & Catálogo",
    category: "Loja e Catálogo",
    categorySlug: "loja-catalogo",
    description:
      "Template para lojas e negócios que querem exibir seus produtos com elegância. Catálogo digital com filtros, fotos e integração com WhatsApp para vendas.",
    shortDescription: "Catálogo de produtos com WhatsApp e filtros.",
    coverImage: "/images/templates/loja-catalogo.webp",
    price: 89,
    activationFee: 247,
    featured: false,
    features: [
      "Catálogo de produtos",
      "Filtro por categoria",
      "Fotos em alta qualidade",
      "WhatsApp para vendas",
      "Carrinho de contato",
      "SSL gratuito",
      "Design responsivo",
    ],
    pages: ["Página inicial", "Catálogo", "Produto", "Sobre", "Contato"],
    recommendedPlan: "Business",
    estimatedDays: 6,
    demoUrl: "/demo/loja-catalogo",
    testimonials,
    optionalFeatures: LOJA_OPTIONAL_FEATURES,
  },
  {
    id: "5",
    slug: "clinica-estetica",
    name: "Clínica & Estética",
    category: "Clínica e Estética",
    categorySlug: "clinica-estetica",
    description:
      "Template sofisticado para clínicas, consultórios e centros de estética. Transmita confiança e profissionalismo, com agendamento e apresentação de tratamentos.",
    shortDescription: "Agendamento, tratamentos e credibilidade médica.",
    coverImage: "/images/templates/clinica-estetica.webp",
    price: 89,
    activationFee: 247,
    featured: false,
    features: [
      "Agendamento online",
      "Apresentação de tratamentos",
      "Equipe profissional",
      "Galeria de resultados",
      "WhatsApp integrado",
      "SSL gratuito",
      "Design responsivo",
    ],
    pages: [
      "Página inicial",
      "Tratamentos",
      "Equipe",
      "Resultados",
      "Agendamento",
      "Contato",
    ],
    recommendedPlan: "Pro",
    estimatedDays: 6,
    demoUrl: "/demo/clinica-estetica",
    testimonials,
    optionalFeatures: CLINICA_OPTIONAL_FEATURES,
  },
  {
    id: "6",
    slug: "contabilidade",
    name: "Escritório Contábil",
    category: "Contabilidade",
    categorySlug: "contabilidade",
    description:
      "Template sério e profissional para contadores e escritórios contábeis. Mostre sua expertise, gere confiança e atraia novos clientes empresariais.",
    shortDescription: "Credibilidade e geração de leads para contadores.",
    coverImage: "/images/templates/contabilidade.webp",
    price: 69,
    activationFee: 197,
    featured: false,
    features: [
      "Apresentação de serviços contábeis",
      "Formulário de orçamento",
      "Depoimentos de clientes",
      "Blog / Artigos",
      "WhatsApp integrado",
      "SSL gratuito",
    ],
    pages: [
      "Página inicial",
      "Serviços",
      "Sobre",
      "Blog",
      "Contato",
    ],
    recommendedPlan: "Start",
    estimatedDays: 4,
    demoUrl: "/demo/contabilidade",
    testimonials,
    optionalFeatures: CONTABILIDADE_OPTIONAL_FEATURES,
  },
  {
    id: "7",
    slug: "imobiliaria",
    name: "Imobiliária",
    category: "Imobiliária",
    categorySlug: "imobiliaria",
    description:
      "Template completo para imobiliárias com listagem de imóveis, filtros de busca e formulários de contato. Profissionalize sua captação e vendas.",
    shortDescription: "Listagem de imóveis, filtros e captação de leads.",
    coverImage: "/images/templates/imobiliaria.webp",
    price: 129,
    activationFee: 297,
    featured: false,
    features: [
      "Listagem de imóveis",
      "Filtro por tipo e localização",
      "Fotos em destaque",
      "Formulário de interesse",
      "WhatsApp integrado",
      "Mapa integrado",
      "SSL gratuito",
    ],
    pages: ["Página inicial", "Imóveis", "Imóvel individual", "Sobre", "Contato"],
    recommendedPlan: "Business",
    estimatedDays: 7,
    demoUrl: "/demo/imobiliaria",
    testimonials,
    optionalFeatures: IMOBILIARIA_OPTIONAL_FEATURES,
  },
  {
    id: "8",
    slug: "oficina-mecanica",
    name: "Oficina Mecânica",
    category: "Oficina Mecânica",
    categorySlug: "oficina-mecanica",
    description:
      "Template direto ao ponto para oficinas mecânicas e auto centers. Apresente seus serviços, facilite o contato pelo WhatsApp e conquiste mais clientes.",
    shortDescription: "Serviços, orçamento rápido e WhatsApp.",
    coverImage: "/images/templates/oficina-mecanica.webp",
    price: 59,
    activationFee: 197,
    featured: false,
    features: [
      "Apresentação de serviços",
      "Formulário de orçamento",
      "WhatsApp integrado",
      "Localização e horários",
      "SSL gratuito",
      "Design responsivo",
    ],
    pages: ["Página inicial", "Serviços", "Orçamento", "Localização", "Contato"],
    recommendedPlan: "Start",
    estimatedDays: 3,
    demoUrl: "/demo/oficina-mecanica",
    testimonials,
    optionalFeatures: OFICINA_OPTIONAL_FEATURES,
  },
  {
    id: "9",
    slug: "imobiliaria-premium",
    name: "Imobiliária Premium",
    category: "Imobiliária",
    categorySlug: "imobiliaria",
    description:
      "Plataforma completa e sofisticada para imobiliárias de alto padrão, construtoras e corretoras. Busca avançada por geolocalização, simulador de financiamento, tour virtual 360°, agendamento de visitas e captação de leads de altíssimo valor.",
    shortDescription: "Plataforma de alto padrão com busca avançada, simulador e tour 360°.",
    coverImage: "/images/templates/imobiliaria-premium.webp",
    price: 149,
    activationFee: 397,
    featured: true,
    badge: "Alto Padrão",
    features: [
      "Busca avançada multicritério",
      "Galeria em alta definição com Lightbox",
      "Tour Virtual 360° & Matterport",
      "Simulador de Financiamento em tempo real",
      "Agendamento online de visitas",
      "Formulário 'Anuncie Seu Imóvel'",
      "Cards de Corretores com CRECI e WhatsApp",
      "Filtros por bairros nobres e categorias",
      "Página de detalhes com mapa interativo",
      "SEO técnico avançado com Schema.org",
      "SSL e hospedagem de alto desempenho",
    ],
    pages: [
      "Página inicial",
      "Catálogo de Imóveis",
      "Detalhes do Imóvel",
      "Anuncie seu Imóvel",
      "Simulador de Financiamento",
      "Corretores",
      "Blog Imobiliário",
      "Contato",
    ],
    recommendedPlan: "Business",
    estimatedDays: 5,
    demoUrl: "/demo/imobiliaria-premium",
    testimonials,
    optionalFeatures: IMOBILIARIA_PREMIUM_OPTIONAL_FEATURES,
  },
  {
    id: "10",
    slug: "loja-moda-premium",
    name: "Loja Moda & Acessórios",
    category: "Loja Virtual",
    categorySlug: "loja-virtual",
    description:
      "E-commerce de moda completo com lookbook interativo, provador virtual, cálculo automático de frete e checkout transparente via Mercado Pago.",
    shortDescription: "E-commerce de moda com lookbook e checkout integrado.",
    coverImage: "/images/templates/loja-moda-premium.webp",
    price: 99,
    activationFee: 247,
    featured: true,
    badge: "Populares E-commerce",
    features: [
      "Loja virtual completa de moda",
      "Grade de tamanhos e cores",
      "Checkout integrado (Pix & Cartão)",
      "Cálculo automático de frete (Correios/Melhor Envio)",
      "Gestão de estoque em tempo real",
      "Cupom de desconto e promoções",
      "Integração com Instagram Shopping",
      "SSL gratuito e hospedagem cloud",
    ],
    pages: ["Página inicial", "Coleções", "Produto", "Carrinho", "Checkout", "Sobre", "Contato"],
    recommendedPlan: "Pro",
    estimatedDays: 5,
    demoUrl: "/demo/loja-moda-premium",
    testimonials,
    optionalFeatures: LOJA_OPTIONAL_FEATURES,
  },
  {
    id: "11",
    slug: "loja-gourmet",
    name: "Loja Gourmet & Alimentos",
    category: "Loja Virtual",
    categorySlug: "loja-virtual",
    description:
      "Catálogo virtual para produtos alimentícios, doces finos, bebidas e cestas gourmet com pedidos pelo WhatsApp e pagamento por Pix automático.",
    shortDescription: "Catálogo alimentício com WhatsApp e Pix automático.",
    coverImage: "/images/templates/loja-gourmet.webp",
    price: 59,
    activationFee: 197,
    featured: true,
    badge: "Iniciante E-commerce",
    features: [
      "Catálogo digital responsivo",
      "Cálculo de taxa por raio/bairro",
      "Disparo direto no WhatsApp",
      "Chave Pix automática no pedido",
      "Fotos e variações por peso/tamanho",
      "Design ultra-rápido para celular",
    ],
    pages: ["Página inicial", "Cardápio/Produtos", "Carrinho", "Contato"],
    recommendedPlan: "Start",
    estimatedDays: 4,
    demoUrl: "/demo/loja-gourmet",
    testimonials,
    optionalFeatures: LOJA_OPTIONAL_FEATURES,
  },
  {
    id: "12",
    slug: "loja-tech-store",
    name: "Loja Tech & Eletrônicos",
    category: "Loja Virtual",
    categorySlug: "loja-virtual",
    description:
      "Loja virtual robusta para eletrônicos, informática e variedades com ficha técnica avançada, busca com auto-complete e múltiplos gateways de pagamento.",
    shortDescription: "Loja virtual de eletrônicos com busca rápida e variados gateways.",
    coverImage: "/images/templates/loja-tech-store.webp",
    price: 159,
    activationFee: 297,
    featured: true,
    badge: "Alta Performance",
    features: [
      "Plataforma e-commerce corporativa",
      "Ficha técnica detalhada por especificação",
      "Gateways múltiplos (Mercado Pago, PagSeguro, Stripe)",
      "Recuperação de carrinho abandonado",
      "Disparo de cupons no WhatsApp",
      "Relatórios de vendas e estoque",
    ],
    pages: ["Página inicial", "Catálogo Tech", "Produto Detalhado", "Carrinho", "Checkout", "Suporte & Garantia"],
    recommendedPlan: "Business",
    estimatedDays: 7,
    demoUrl: "/demo/loja-tech-store",
    testimonials,
    optionalFeatures: LOJA_OPTIONAL_FEATURES,
  },
];

export const templateCategories = [
  { label: "Todos", slug: "todos" },
  { label: "Loja Virtual", slug: "loja-virtual" },
  { label: "Restaurante", slug: "restaurante" },
  { label: "Salão & Barbearia", slug: "salao-barbearia" },
  { label: "Prestador de Serviços", slug: "prestador-servicos" },
  { label: "Loja e Catálogo", slug: "loja-catalogo" },
  { label: "Clínica e Estética", slug: "clinica-estetica" },
  { label: "Contabilidade", slug: "contabilidade" },
  { label: "Imobiliária", slug: "imobiliaria" },
  { label: "Oficina Mecânica", slug: "oficina-mecanica" },
];

// Coleção mestre com todos os recursos opcionais do sistema (para buscas por id)
export const ALL_OPTIONAL_FEATURES: OptionalFeature[] = [
  ...RESTAURANTE_OPTIONAL_FEATURES,
  ...SALAO_OPTIONAL_FEATURES,
  ...SERVICOS_PROFISSIONAIS_OPTIONAL_FEATURES,
  ...LOJA_OPTIONAL_FEATURES,
  ...CLINICA_OPTIONAL_FEATURES,
  ...CONTABILIDADE_OPTIONAL_FEATURES,
  ...IMOBILIARIA_OPTIONAL_FEATURES,
  ...OFICINA_OPTIONAL_FEATURES,
  ...IMOBILIARIA_PREMIUM_OPTIONAL_FEATURES,
];

// Alias para compatibilidade com chamadas legado
export const OPTIONAL_FEATURES: OptionalFeature[] = ALL_OPTIONAL_FEATURES;

/**
 * Retorna os recursos opcionais específicos do template informado.
 */
export function getTemplateOptionalFeatures(template?: Template): OptionalFeature[] {
  if (!template) return RESTAURANTE_OPTIONAL_FEATURES;
  return template.optionalFeatures || RESTAURANTE_OPTIONAL_FEATURES;
}

/** Identifica o produto comercial correto sem confundir sites prontos com lojas virtuais. */
export function getTemplateServiceSlug(template?: Template): 'sites-prontos' | 'lojas-virtuais' {
  return template?.categorySlug === 'loja-virtual' ? 'lojas-virtuais' : 'sites-prontos';
}
