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
    demoUrl: "#",
    testimonials: [testimonials[0], testimonials[3]],
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
    demoUrl: "#",
    testimonials: [testimonials[1], testimonials[3]],
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
    demoUrl: "#",
    testimonials: [testimonials[2], testimonials[0]],
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
    demoUrl: "#",
    testimonials: [testimonials[3]],
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
    demoUrl: "#",
    testimonials: [testimonials[1]],
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
    demoUrl: "#",
    testimonials: [testimonials[2]],
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
    demoUrl: "#",
    testimonials: [testimonials[0]],
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
    demoUrl: "#",
    testimonials: [testimonials[3]],
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
