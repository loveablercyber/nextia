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
  mimeType?: string;
  visibility?: ProjectVisibility;
}

export type ProjectVisibility = 'internal' | 'client' | 'both';

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  task_kind: 'internal' | 'client_action';
  visibility: ProjectVisibility;
  due_at?: string;
  priority: 'low' | 'normal' | 'high';
  version: number;
}

export interface DeliverableApproval {
  id: string;
  deliverable_id: string;
  deliverable_version_id: string;
  actor_user_id: string;
  result: 'approved' | 'changes_requested';
  comment?: string;
  created_at: string;
}

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'superseded';
  visibility: ProjectVisibility;
  current_version: number;
  version_id?: string;
  file_id?: string;
  external_url?: string;
  version_notes?: string;
  submitted_at?: string;
  approvals: DeliverableApproval[];
}

export interface ProjectComment {
  id: string;
  project_id: string;
  deliverable_id?: string;
  task_id?: string;
  author_user_id: string;
  author_name: string;
  body: string;
  visibility: ProjectVisibility;
  created_at: string;
}

export interface ProjectEvent {
  id: string;
  event_type: string;
  summary: string;
  actor_name?: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export interface ProjectPendingAction {
  type: 'briefing' | 'task' | 'deliverable';
  id: string;
  title: string;
  dueAt?: string;
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

export interface ProjectBriefing {
  submitted: boolean;
  submittedAt?: string;
  businessName: string;
  segment: string;
  description: string;
  targetAudience: string;
  slogan?: string;
  hasLogo: 'sim' | 'nao';
  colorPreference: string;
  visualStyle: string;
  referenceUrls?: string;
  pages: string[];
  mainServices: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  businessHours?: string;
  additionalNotes?: string;
  paymentGateways?: string;
  shippingMethods?: string;
  productsCount?: string;
  productCategories?: string;
}

export interface Project {
  id: string;
  version: number;
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
  briefing?: ProjectBriefing;
  serviceSlug?: string;
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  responsibleName?: string;
  responsibleUserId?: string;
  nextStage?: string;
  pendingCount?: number;
  updatedAt?: string;
}

// MOCK_PROJECTS has been removed

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
