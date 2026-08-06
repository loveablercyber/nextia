import type { Project } from '../types/project';

export type DatabaseRecord = Record<string, unknown>;

function records(value: unknown): DatabaseRecord[] {
  return Array.isArray(value) ? value as DatabaseRecord[] : [];
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data as T;
}

export function mapProjectDbToUi(dbProj: DatabaseRecord): Project {
  return {
    id: String(dbProj.id || ''),
    userId: String(dbProj.user_id || ''),
    name: String(dbProj.name || ''),
    template: dbProj.template ? String(dbProj.template) : undefined,
    segment: String(dbProj.segment || ''),
    status: dbProj.status as Project['status'],
    plan: dbProj.plan as Project['plan'],
    siteUrl: dbProj.site_url ? String(dbProj.site_url) : undefined,
    previewUrl: dbProj.preview_url ? String(dbProj.preview_url) : undefined,
    domain: dbProj.domain ? String(dbProj.domain) : undefined,
    monthlyFee: Number(dbProj.monthly_fee || 0),
    activationFee: Number(dbProj.activation_fee || 0),
    startedAt: String(dbProj.started_at || ''),
    estimatedDelivery: String(dbProj.estimated_delivery || ''),
    publishedAt: dbProj.published_at ? String(dbProj.published_at) : undefined,
    progressPercent: Number(dbProj.progress_percent || 0),
    requestsRemaining: Number(dbProj.requests_remaining || 0),
    requestsTotal: Number(dbProj.requests_total || 0),
    briefing: dbProj.briefing as Project['briefing'],
    milestones: records(dbProj.milestones).map((item) => ({
      id: String(item.id || ''),
      title: String(item.title || ''),
      description: String(item.description || ''),
      status: item.status as Project['milestones'][number]['status'],
      completedAt: item.completed_at ? String(item.completed_at) : undefined,
      estimatedAt: item.estimated_at ? String(item.estimated_at) : undefined,
    })),
    files: records(dbProj.files).map((item) => ({
      id: String(item.id || ''),
      name: String(item.name || ''),
      size: String(item.size || ''),
      type: item.type as Project['files'][number]['type'],
      uploadedAt: String(item.uploaded_at || ''),
      uploadedBy: String(item.uploaded_by || ''),
      url: String(item.url || ''),
    })),
    changeRequests: records(dbProj.change_requests).map((item) => ({
      id: String(item.id || ''),
      title: String(item.title || ''),
      description: String(item.description || ''),
      status: item.status as Project['changeRequests'][number]['status'],
      priority: item.priority as Project['changeRequests'][number]['priority'],
      createdAt: String(item.created_at || ''),
      resolvedAt: item.resolved_at ? String(item.resolved_at) : undefined,
      category: String(item.category || ''),
    })),
    payments: records(dbProj.payments).map((item) => ({
      id: String(item.id || ''),
      description: String(item.description || ''),
      amount: Number(item.amount || 0),
      dueDate: String(item.due_date || ''),
      paidAt: item.paid_at ? String(item.paid_at) : undefined,
      status: item.status as Project['payments'][number]['status'],
      type: item.type as Project['payments'][number]['type'],
      invoiceUrl: item.invoice_url ? String(item.invoice_url) : undefined,
    })),
  };
}
