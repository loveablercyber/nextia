// ─── Project & Dashboard Types ─────────────────────────────────────────────

export type ProjectStatus =
  | 'aguardando-briefing'
  | 'em-desenvolvimento'
  | 'em-revisao'
  | 'aguardando-aprovacao'
  | 'aprovado'
  | 'publicado'
  | 'em-manutencao';

export type RequestStatus = 'aberto' | 'em-andamento' | 'concluido' | 'cancelado';
export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pendente' | 'em-andamento' | 'concluido';
  completedAt?: string;
  estimatedAt?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document' | 'video' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: 'baixa' | 'normal' | 'alta';
  createdAt: string;
  resolvedAt?: string;
  category: string;
}

export interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: PaymentStatus;
  type: 'ativacao' | 'mensalidade';
  invoiceUrl?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  template?: string;
  segment: string;
  status: ProjectStatus;
  plan: 'Start' | 'Pro' | 'Business' | 'Personalizado';
  siteUrl?: string;
  previewUrl?: string;
  domain?: string;
  monthlyFee: number;
  activationFee: number;
  startedAt: string;
  estimatedDelivery: string;
  publishedAt?: string;
  progressPercent: number;
  milestones: ProjectMilestone[];
  files: ProjectFile[];
  changeRequests: ChangeRequest[];
  payments: Payment[];
  requestsRemaining: number;
  requestsTotal: number;
}

// ─── Mock Project Data ─────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    userId: 'usr-001',
    name: 'Restaurante Sabor & Arte',
    template: 'Restaurante Premium',
    segment: 'Restaurante',
    status: 'em-revisao',
    plan: 'Pro',
    previewUrl: 'https://preview.nextia.com.br/sabor-arte',
    domain: 'restaurantesaborarte.com.br',
    monthlyFee: 79,
    activationFee: 497,
    startedAt: '2026-06-10T09:00:00Z',
    estimatedDelivery: '2026-06-24T18:00:00Z',
    progressPercent: 75,
    requestsRemaining: 3,
    requestsTotal: 5,
    milestones: [
      {
        id: 'm1',
        title: 'Briefing recebido',
        description: 'Formulário de briefing preenchido e arquivos enviados.',
        status: 'concluido',
        completedAt: '2026-06-11T14:00:00Z',
      },
      {
        id: 'm2',
        title: 'Design aprovado',
        description: 'Wireframes e paleta de cores aprovados pelo cliente.',
        status: 'concluido',
        completedAt: '2026-06-14T11:00:00Z',
      },
      {
        id: 'm3',
        title: 'Desenvolvimento',
        description: 'Construção do site com base no design aprovado.',
        status: 'concluido',
        completedAt: '2026-06-20T18:00:00Z',
      },
      {
        id: 'm4',
        title: 'Revisão do cliente',
        description: 'Site enviado para revisão. Aguardando aprovação ou ajustes.',
        status: 'em-andamento',
        estimatedAt: '2026-06-24T18:00:00Z',
      },
      {
        id: 'm5',
        title: 'Publicação',
        description: 'Publicação do site no domínio contratado.',
        status: 'pendente',
        estimatedAt: '2026-06-26T12:00:00Z',
      },
    ],
    files: [
      { id: 'f1', name: 'logo-restaurante.png', size: '245 KB', type: 'image', uploadedAt: '2026-06-11T10:00:00Z', uploadedBy: 'João Silva', url: '#' },
      { id: 'f2', name: 'fotos-ambiente.zip', size: '18.4 MB', type: 'other', uploadedAt: '2026-06-11T10:15:00Z', uploadedBy: 'João Silva', url: '#' },
      { id: 'f3', name: 'cardapio-atualizado.pdf', size: '1.2 MB', type: 'document', uploadedAt: '2026-06-12T09:30:00Z', uploadedBy: 'João Silva', url: '#' },
    ],
    changeRequests: [
      {
        id: 'cr1',
        title: 'Ajustar cor do botão "Reservar"',
        description: 'O botão de reserva está vermelho, mas gostaríamos que fosse no tom dourado do nosso logo.',
        status: 'concluido',
        priority: 'normal',
        createdAt: '2026-06-15T10:00:00Z',
        resolvedAt: '2026-06-15T16:00:00Z',
        category: 'Design',
      },
      {
        id: 'cr2',
        title: 'Adicionar link do Instagram',
        description: 'Adicionar o link @restaurantesaborarte no rodapé e na seção de redes sociais.',
        status: 'em-andamento',
        priority: 'baixa',
        createdAt: '2026-06-20T14:00:00Z',
        category: 'Conteúdo',
      },
    ],
    payments: [
      {
        id: 'pay-001',
        description: 'Taxa de ativação — Plano Pro',
        amount: 497,
        dueDate: '2026-06-10T00:00:00Z',
        paidAt: '2026-06-10T14:33:00Z',
        status: 'pago',
        type: 'ativacao',
        invoiceUrl: '#',
      },
      {
        id: 'pay-002',
        description: 'Mensalidade — Junho/2026',
        amount: 79,
        dueDate: '2026-06-10T00:00:00Z',
        paidAt: '2026-06-10T14:33:00Z',
        status: 'pago',
        type: 'mensalidade',
        invoiceUrl: '#',
      },
      {
        id: 'pay-003',
        description: 'Mensalidade — Julho/2026',
        amount: 79,
        dueDate: '2026-07-10T00:00:00Z',
        status: 'pendente',
        type: 'mensalidade',
      },
    ],
  },
];

export const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  'aguardando-briefing': { label: 'Aguardando briefing', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  'em-desenvolvimento': { label: 'Em desenvolvimento', color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
  'em-revisao':         { label: 'Em revisão', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
  'aguardando-aprovacao': { label: 'Aguardando aprovação', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  'aprovado':           { label: 'Aprovado', color: '#059669', bg: '#f0fdf4', dot: '#10b981' },
  'publicado':          { label: '🌐 Publicado', color: '#059669', bg: '#f0fdf4', dot: '#10b981' },
  'em-manutencao':      { label: 'Em manutenção', color: '#6b7280', bg: '#f9fafb', dot: '#9ca3af' },
};

export const requestStatusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  'aberto':       { label: 'Aberto', color: '#2563eb', bg: '#eff6ff' },
  'em-andamento': { label: 'Em andamento', color: '#d97706', bg: '#fffbeb' },
  'concluido':    { label: 'Concluído', color: '#059669', bg: '#f0fdf4' },
  'cancelado':    { label: 'Cancelado', color: '#6b7280', bg: '#f9fafb' },
};
