// ─── Quote Configuration ───────────────────────────────────────────────────
// All prices and configuration are defined here so they can be
// migrated to the admin panel (Supabase) in the future without changing code.

export type ProjectType =
  | 'landing-page'
  | 'site-institucional'
  | 'loja-virtual'
  | 'catalogo'
  | 'agendamento'
  | 'sistema-web'
  | 'portal-clientes'
  | 'personalizado';

export type SegmentType =
  | 'restaurante'
  | 'salao'
  | 'barbearia'
  | 'loja'
  | 'clinica'
  | 'contabilidade'
  | 'imobiliaria'
  | 'oficina'
  | 'outro';

export type BudgetRange = 'ate-500' | '500-1500' | '1500-3000' | '3000-plus' | 'indefinido';
export type UrgencyType = 'urgente' | 'normal' | 'sem-prazo';

export interface ProjectTypeOption {
  id: ProjectType;
  label: string;
  description: string;
  emoji: string;
  baseActivation: number;
  baseMonthly: number;
  estimatedDays: [number, number]; // [min, max]
}

export interface SegmentOption {
  id: SegmentType;
  label: string;
  emoji: string;
  multiplier: number; // price multiplier for complexity
}

export interface StructureFeature {
  id: string;
  label: string;
  description: string;
  emoji: string;
  addActivation: number;
  addMonthly: number;
  addDays: number;
}

export const projectTypes: ProjectTypeOption[] = [
  {
    id: 'landing-page',
    label: 'Landing Page',
    description: 'Página única focada em conversão',
    emoji: '🎯',
    baseActivation: 497,
    baseMonthly: 59,
    estimatedDays: [3, 5],
  },
  {
    id: 'site-institucional',
    label: 'Site Institucional',
    description: 'Site completo para sua empresa',
    emoji: '🏢',
    baseActivation: 797,
    baseMonthly: 79,
    estimatedDays: [5, 10],
  },
  {
    id: 'loja-virtual',
    label: 'Loja Virtual',
    description: 'E-commerce para vender online',
    emoji: '🛒',
    baseActivation: 1497,
    baseMonthly: 129,
    estimatedDays: [15, 25],
  },
  {
    id: 'catalogo',
    label: 'Catálogo de Produtos',
    description: 'Exiba seus produtos com elegância',
    emoji: '📋',
    baseActivation: 697,
    baseMonthly: 89,
    estimatedDays: [5, 10],
  },
  {
    id: 'agendamento',
    label: 'Site com Agendamento',
    description: 'Receba agendamentos online',
    emoji: '📅',
    baseActivation: 997,
    baseMonthly: 99,
    estimatedDays: [7, 14],
  },
  {
    id: 'sistema-web',
    label: 'Sistema Web',
    description: 'Sistema personalizado para sua operação',
    emoji: '⚙️',
    baseActivation: 3997,
    baseMonthly: 199,
    estimatedDays: [30, 60],
  },
  {
    id: 'portal-clientes',
    label: 'Portal de Clientes',
    description: 'Área exclusiva para seus clientes',
    emoji: '🔐',
    baseActivation: 2497,
    baseMonthly: 149,
    estimatedDays: [20, 40],
  },
  {
    id: 'personalizado',
    label: 'Projeto Personalizado',
    description: 'Algo único, sob medida para você',
    emoji: '✨',
    baseActivation: 0,
    baseMonthly: 0,
    estimatedDays: [0, 0],
  },
];

export const segments: SegmentOption[] = [
  { id: 'restaurante', label: 'Restaurante', emoji: '🍽️', multiplier: 1.1 },
  { id: 'salao', label: 'Salão de Beleza', emoji: '💇', multiplier: 1.0 },
  { id: 'barbearia', label: 'Barbearia', emoji: '✂️', multiplier: 1.0 },
  { id: 'loja', label: 'Loja / Varejo', emoji: '🛍️', multiplier: 1.15 },
  { id: 'clinica', label: 'Clínica / Saúde', emoji: '🏥', multiplier: 1.1 },
  { id: 'contabilidade', label: 'Contabilidade', emoji: '📊', multiplier: 1.0 },
  { id: 'imobiliaria', label: 'Imobiliária', emoji: '🏠', multiplier: 1.2 },
  { id: 'oficina', label: 'Oficina Mecânica', emoji: '🔧', multiplier: 0.95 },
  { id: 'outro', label: 'Outro segmento', emoji: '💼', multiplier: 1.0 },
];

export const structureFeatures: StructureFeature[] = [
  { id: 'blog', label: 'Blog / Artigos', description: 'Publique conteúdos para atrair clientes', emoji: '✍️', addActivation: 200, addMonthly: 10, addDays: 2 },
  { id: 'catalogo', label: 'Catálogo / Cardápio', description: 'Exiba seus produtos ou cardápio', emoji: '📋', addActivation: 300, addMonthly: 15, addDays: 2 },
  { id: 'agendamento', label: 'Agendamento online', description: 'Receba agendamentos automaticamente', emoji: '📅', addActivation: 400, addMonthly: 20, addDays: 3 },
  { id: 'area-cliente', label: 'Área do cliente', description: 'Login e área restrita para clientes', emoji: '🔐', addActivation: 600, addMonthly: 30, addDays: 5 },
  { id: 'whatsapp', label: 'Integração WhatsApp', description: 'Botão e links diretos para WhatsApp', emoji: '💬', addActivation: 0, addMonthly: 0, addDays: 0 },
  { id: 'pagamento', label: 'Integração de pagamento', description: 'Receba pagamentos online', emoji: '💳', addActivation: 500, addMonthly: 25, addDays: 5 },
  { id: 'formularios', label: 'Formulários avançados', description: 'Formulários personalizados e inteligentes', emoji: '📝', addActivation: 200, addMonthly: 10, addDays: 2 },
  { id: 'seo', label: 'SEO avançado', description: 'Otimização para aparecer no Google', emoji: '🔍', addActivation: 300, addMonthly: 15, addDays: 2 },
  { id: 'dominio-hospedagem', label: 'Domínio + Hospedagem', description: 'Registro de domínio personalizado', emoji: '🌐', addActivation: 50, addMonthly: 0, addDays: 0 },
  { id: 'integracoes', label: 'Integrações externas', description: 'CRM, Google Analytics, RD Station etc.', emoji: '🔗', addActivation: 400, addMonthly: 20, addDays: 3 },
];

export const pageOptions = [
  { value: 1, label: '1 página (Landing page)' },
  { value: 3, label: '3 a 5 páginas' },
  { value: 6, label: '6 a 10 páginas' },
  { value: 11, label: 'Mais de 10 páginas' },
];

export const budgetRanges: { id: BudgetRange; label: string; emoji: string }[] = [
  { id: 'ate-500', label: 'Até R$ 500', emoji: '💡' },
  { id: '500-1500', label: 'R$ 500 a R$ 1.500', emoji: '📊' },
  { id: '1500-3000', label: 'R$ 1.500 a R$ 3.000', emoji: '🚀' },
  { id: '3000-plus', label: 'Acima de R$ 3.000', emoji: '💎' },
  { id: 'indefinido', label: 'Ainda não sei', emoji: '🤔' },
];

export const urgencyOptions: { id: UrgencyType; label: string; description: string; emoji: string; multiplier: number }[] = [
  { id: 'urgente', label: 'Urgente', description: 'Preciso em menos de 2 semanas', emoji: '⚡', multiplier: 1.3 },
  { id: 'normal', label: 'Normal', description: 'Prazo padrão de 2 a 4 semanas', emoji: '📆', multiplier: 1.0 },
  { id: 'sem-prazo', label: 'Sem pressa', description: 'Sem prazo definido', emoji: '🕰️', multiplier: 0.95 },
];
