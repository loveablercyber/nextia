import type { Template } from './templates';

export type TemplateStatus = 'draft' | 'review' | 'published' | 'archived';
export type TemplateStyle = 'Moderno' | 'Minimalista' | 'Premium' | 'Corporativo' | 'Criativo' | 'Elegante' | 'Tecnológico';
export type TemplateType = 'Site institucional' | 'Landing Page' | 'Loja Virtual' | 'Catálogo' | 'Sistema' | 'Site + automação';

export interface TemplateMetadata {
  status: TemplateStatus;
  style: TemplateStyle;
  type: TemplateType;
  tags: string[];
  customizationOptions: string[];
  availableAddons: string[];
  createdAt: string;
}

const defaults: TemplateMetadata = {
  status: 'published',
  style: 'Moderno',
  type: 'Site institucional',
  tags: ['Responsivo', 'WhatsApp', 'SEO estrutural'],
  customizationOptions: ['Logotipo', 'Cores', 'Imagens', 'Textos', 'Contatos', 'Serviços', 'Páginas', 'Banners e botões'],
  availableAddons: ['WhatsApp com IA', 'Automação', 'SEO', 'Blog', 'Área do cliente', 'Agendamento', 'Formulários avançados', 'Integrações'],
  createdAt: '2026-08-01',
};

const metadata: Record<string, Partial<TemplateMetadata>> = {
  'restaurante-premium': { style: 'Premium', type: 'Site + automação', tags: ['Cardápio', 'Reservas', 'WhatsApp', 'Responsivo'] },
  'salao-elegance': { style: 'Elegante', type: 'Site + automação', tags: ['Agendamento', 'Portfólio', 'WhatsApp', 'Responsivo'] },
  'servicos-profissionais': { style: 'Corporativo', tags: ['Institucional', 'Portfólio', 'Leads', 'Responsivo'] },
  'loja-catalogo': { style: 'Minimalista', type: 'Catálogo', tags: ['Catálogo', 'Filtros', 'WhatsApp', 'Responsivo'] },
  'clinica-estetica': { style: 'Elegante', type: 'Site + automação', tags: ['Agendamento', 'Equipe', 'Tratamentos', 'Responsivo'] },
  contabilidade: { style: 'Corporativo', tags: ['Institucional', 'Blog', 'WhatsApp', 'SEO estrutural'] },
  imobiliaria: { style: 'Moderno', type: 'Catálogo', tags: ['Imóveis', 'Busca', 'WhatsApp', 'Responsivo'] },
  'oficina-mecanica': { style: 'Tecnológico', type: 'Site + automação', tags: ['Serviços', 'Agendamento', 'WhatsApp', 'Responsivo'] },
  'imobiliaria-premium': { style: 'Premium', type: 'Catálogo', tags: ['Imóveis', 'Busca avançada', 'Leads', 'Responsivo'] },
  'loja-moda-premium': { style: 'Premium', type: 'Loja Virtual', tags: ['E-commerce', 'Produtos', 'Checkout', 'Responsivo'] },
  'loja-gourmet': { style: 'Criativo', type: 'Loja Virtual', tags: ['E-commerce', 'Alimentação', 'Checkout', 'Responsivo'] },
  'loja-tech-store': { style: 'Tecnológico', type: 'Loja Virtual', tags: ['E-commerce', 'Tecnologia', 'Checkout', 'Responsivo'] },
};

export function getTemplateMetadata(template: Template): TemplateMetadata {
  return { ...defaults, ...metadata[template.slug] };
}

export function isPublishedTemplate(template: Template): boolean {
  const data = getTemplateMetadata(template);
  return data.status === 'published' && Boolean(template.coverImage && template.description && template.demoUrl && template.demoUrl !== '#');
}
