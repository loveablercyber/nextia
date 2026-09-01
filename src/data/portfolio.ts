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
// serem confirmados. CarolSol não é publicada automaticamente.
export const portfolioProjects: PortfolioProject[] = [];

export const getPublishedPortfolioProjects = () => portfolioProjects.filter((project) => project.status === 'published' && project.authorized && project.images.length > 0);
export const getPortfolioProjectBySlug = (slug?: string) => getPublishedPortfolioProjects().find((project) => project.slug === slug);
