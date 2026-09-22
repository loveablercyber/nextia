export type PortfolioStatus = 'draft' | 'review' | 'published' | 'archived';
export type PortfolioClassification = 'client' | 'internal-product' | 'demo' | 'template';

export interface PortfolioProject {
  id: string;
  slug: string;
  name: string;
  clientName?: string;
  clientVisible: boolean;
  authorized: boolean;
  classification: PortfolioClassification;
  segment: string;
  projectType: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  images: Array<{ src: string; alt: string }>;
  websiteUrl?: string;
  technologies: string[];
  services: string[];
  status: PortfolioStatus;
  featured: boolean;
}

// Projetos só entram aqui depois de existência, conteúdo público e autorização
// serem confirmados pelo cliente.
export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'client-carolsol',
    slug: 'carolsol',
    name: 'CarolSol — ecossistema digital integrado',
    clientName: 'Carol Sol',
    clientVisible: true,
    authorized: true,
    classification: 'client',
    segment: 'Beleza, educação e impacto social',
    projectType: 'Plataforma digital, e-commerce e gestão',
    description: 'Um ecossistema digital completo que conecta a presença institucional da Carol Sol ao salão, à loja Sol Hair Closet, à Invisible Academy, ao Projeto Elo e às áreas de gestão.',
    challenge: 'Reunir negócios e iniciativas com públicos diferentes em uma experiência coerente, segura e simples, sem perder a identidade de cada frente da marca.',
    solution: 'Construção de uma plataforma full-stack responsiva, organizada por módulos e domínios, com identidade compartilhada, conteúdo administrável, comércio eletrônico, educação online, pagamentos e operações internas.',
    results: [
      'Portal institucional responsivo com conteúdo, serviços, contato e experiência otimizada para dispositivos móveis.',
      'Loja Sol Hair Closet com catálogo, busca, coleções, favoritos, carrinho, conta, pedidos e acompanhamento de entrega.',
      'Checkout seguro integrado à SumUp, processamento por webhook e controle transacional de pedidos e estoque.',
      'Invisible Academy com cursos, matrículas, área da aluna, progresso de aulas e certificados verificáveis.',
      'Projeto Elo com cadastros, solicitações, doações, transparência e triagem administrativa.',
      'Conta integrada entre portal, loja, academia e projeto social, além de experiência instalável como PWA.',
    ],
    images: [
      { src: '/images/portfolio/carolsol/universo-carol-sol.jpg', alt: 'Apresentação visual do Universo Carol Sol' },
      { src: '/images/portfolio/carolsol/salao-carol-sol.jpg', alt: 'Ambiente e posicionamento do salão Carol Sol' },
      { src: '/images/portfolio/carolsol/sol-hair-closet.jpg', alt: 'Loja digital Sol Hair Closet integrada ao ecossistema Carol Sol' },
      { src: '/images/portfolio/carolsol/aplicativo-carol-sol.jpg', alt: 'Experiência móvel e aplicativo PWA Carol Sol' },
      { src: '/images/portfolio/carolsol/invisible-academy.jpg', alt: 'Invisible Academy, plataforma de cursos do Universo Carol Sol' },
      { src: '/images/portfolio/carolsol/projeto-elo.jpg', alt: 'Projeto Elo, iniciativa social integrada à plataforma Carol Sol' },
    ],
    websiteUrl: 'https://www.carolsol.com.br',
    technologies: ['React 19', 'TypeScript', 'TanStack Start', 'TanStack Router', 'TanStack Query', 'Tailwind CSS 4', 'Node.js', 'PostgreSQL', 'Zod', 'SumUp API', 'PWA e Service Worker', 'Coolify'],
    services: [
      'Estratégia, arquitetura de informação e experiência responsiva',
      'Desenvolvimento full-stack e modelagem de banco de dados',
      'CMS e painel administrativo com controle de acesso',
      'E-commerce, pagamentos, pedidos, estoque e rastreamento',
      'Plataforma de cursos, matrículas e certificados',
      'Integrações entre módulos, domínios e identidade do usuário',
    ],
    status: 'published',
    featured: true,
  },
];

export const getPublishedPortfolioProjects = () => portfolioProjects.filter((project) => project.status === 'published' && project.authorized && project.images.length > 0);
export const getPortfolioProjectBySlug = (slug?: string) => getPublishedPortfolioProjects().find((project) => project.slug === slug);
