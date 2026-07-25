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

const testimonials: Testimonial[] = [
  {
    name: "Carlos Mendes",
    company: "Restaurante Sabor & Arte",
    role: "Proprietário",
    text: "Em menos de 5 dias meu restaurante já tinha um site profissional. As reservas online aumentaram 40% no primeiro mês!",
    avatar: "CM",
    rating: 5,
  },
  {
    name: "Fernanda Oliveira",
    company: "Salão Beleza & Charme",
    role: "Proprietária",
    text: "Minha agenda de agendamentos está sempre cheia agora. O site ficou lindo e os clientes adoraram!",
    avatar: "FO",
    rating: 5,
  },
  {
    name: "Ricardo Alves",
    company: "RA Consultoria Contábil",
    role: "Contador",
    text: "Profissionalismo que meus clientes notam. O site passou credibilidade imediata e já captei 3 novos clientes no primeiro mês.",
    avatar: "RA",
    rating: 5,
  },
  {
    name: "Mariana Costa",
    company: "Studio MC - Estética",
    role: "Esteticista",
    text: "Excelente custo-benefício. Antes eu pagava caro por mês e o suporte era péssimo. Com a Nextia é diferente!",
    avatar: "MC",
    rating: 5,
  },
];

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
    coverImage: "",
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
    testimonials: [testimonials[0], testimonials[3]],
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
    coverImage: "",
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
    testimonials: [testimonials[1], testimonials[3]],
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
    coverImage: "",
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
    testimonials: [testimonials[2], testimonials[0]],
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
    coverImage: "",
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
    testimonials: [testimonials[3]],
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
    coverImage: "",
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
    testimonials: [testimonials[1]],
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
    coverImage: "",
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
    testimonials: [testimonials[2]],
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
    coverImage: "",
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
    testimonials: [testimonials[0]],
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
    coverImage: "",
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
    testimonials: [testimonials[3]],
    optionalFeatures: OFICINA_OPTIONAL_FEATURES,
  },
];

export const templateCategories = [
  { label: "Todos", slug: "todos" },
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
