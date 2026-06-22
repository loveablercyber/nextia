import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, ChangeRequest, Payment } from '../types/project';
import { MOCK_PROJECTS } from '../types/project';
import { supabase } from '../lib/supabase';

interface AdminContextValue {
  projects: Project[];
  loading: boolean;
  updateProjectProgress: (projectId: string, progress: number) => Promise<void>;
  updateProjectStatus: (projectId: string, status: Project['status']) => Promise<void>;
  updateRequestStatus: (projectId: string, requestId: string, status: ChangeRequest['status']) => Promise<void>;
  createInvoice: (projectId: string, desc: string, amount: number, type: 'ativacao' | 'mensalidade') => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const STORAGE_KEY = 'nextia_projects_state';
const isSupabaseEnabled = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adapter: Maps database schema (snake_case) to UI models (camelCase)
function mapProjectDbToUi(dbProj: any): Project {
  return {
    id: dbProj.id,
    userId: dbProj.user_id,
    name: dbProj.name,
    template: dbProj.template,
    segment: dbProj.segment,
    status: dbProj.status,
    plan: dbProj.plan,
    siteUrl: dbProj.site_url,
    previewUrl: dbProj.preview_url,
    domain: dbProj.domain,
    monthlyFee: Number(dbProj.monthly_fee || 0),
    activationFee: Number(dbProj.activation_fee || 0),
    startedAt: dbProj.started_at,
    estimatedDelivery: dbProj.estimated_delivery,
    publishedAt: dbProj.published_at,
    progressPercent: Number(dbProj.progress_percent || 0),
    requestsRemaining: Number(dbProj.requests_remaining || 0),
    requestsTotal: Number(dbProj.requests_total || 0),
    milestones: (dbProj.milestones || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      completedAt: m.completed_at,
      estimatedAt: m.estimated_at
    })),
    files: (dbProj.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: f.uploaded_at,
      uploadedBy: f.uploaded_by,
      url: f.url
    })),
    changeRequests: (dbProj.change_requests || []).map((cr: any) => ({
      id: cr.id,
      title: cr.title,
      description: cr.description,
      status: cr.status,
      priority: cr.priority,
      createdAt: cr.created_at,
      resolvedAt: cr.resolved_at,
      category: cr.category
    })),
    payments: (dbProj.payments || []).map((p: any) => ({
      id: p.id,
      description: p.description,
      amount: Number(p.amount || 0),
      dueDate: p.due_date,
      paidAt: p.paid_at,
      status: p.status,
      type: p.type,
      invoiceUrl: p.invoice_url
    }))
  };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all projects
  const fetchAllProjects = async () => {
    setLoading(true);
    if (isSupabaseEnabled) {
      // ── Supabase Load All Projects ──
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, milestones(*), files(*), change_requests(*), payments(*)');

        if (error) {
          console.error('Error fetching admin projects:', error);
          setProjects([]);
        } else if (data) {
          setProjects(data.map(mapProjectDbToUi));
        }
      } catch (err) {
        console.error('Unexpected error loading admin projects:', err);
      }
    } else {
      // ── Mock Load All Projects ──
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setProjects(JSON.parse(stored));
        } catch {
          setProjects(MOCK_PROJECTS);
        }
      } else {
        setProjects(MOCK_PROJECTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROJECTS));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const saveProjectsMock = (list: Project[]) => {
    setProjects(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  // ── updateProjectProgress ──
  const updateProjectProgress = async (projectId: string, progress: number) => {
    if (isSupabaseEnabled) {
      const { error } = await supabase
        .from('projects')
        .update({ progress_percent: progress })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating progress in Supabase:', error);
        return;
      }
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, progressPercent: progress } : p));
    } else {
      const updated = projects.map(p => p.id === projectId ? { ...p, progressPercent: progress } : p);
      saveProjectsMock(updated);
    }
  };

  // ── updateProjectStatus ──
  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    if (isSupabaseEnabled) {
      const dbUpdates: any = { status };
      if (status === 'publicado') {
        dbUpdates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', projectId);

      if (error) {
        console.error('Error updating status in Supabase:', error);
        return;
      }
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, publishedAt: status === 'publicado' ? new Date().toISOString() : p.publishedAt } : p));
    } else {
      const updated = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            status,
            publishedAt: status === 'publicado' ? new Date().toISOString() : p.publishedAt
          };
        }
        return p;
      });
      saveProjectsMock(updated);
    }
  };

  // ── updateRequestStatus ──
  const updateRequestStatus = async (projectId: string, requestId: string, status: ChangeRequest['status']) => {
    if (isSupabaseEnabled) {
      const dbUpdate: any = { status };
      if (status === 'concluido') {
        dbUpdate.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('change_requests')
        .update(dbUpdate)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating change request status in Supabase:', error);
        return;
      }
      
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const requests = p.changeRequests.map(r => r.id === requestId ? { ...r, status, resolvedAt: status === 'concluido' ? new Date().toISOString() : r.resolvedAt } : r);
          return { ...p, changeRequests: requests };
        }
        return p;
      }));
    } else {
      const updated = projects.map(p => {
        if (p.id === projectId) {
          const requests = p.changeRequests.map(r => r.id === requestId ? { ...r, status, resolvedAt: status === 'concluido' ? new Date().toISOString() : r.resolvedAt } : r);
          return { ...p, changeRequests: requests };
        }
        return p;
      });
      saveProjectsMock(updated);
    }
  };

  // ── createInvoice ──
  const createInvoice = async (projectId: string, desc: string, amount: number, type: 'ativacao' | 'mensalidade') => {
    if (isSupabaseEnabled) {
      const dbPayment = {
        project_id: projectId,
        description: desc,
        amount,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Vence em 5 dias
        status: 'pendente',
        type
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([dbPayment])
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice in Supabase:', error);
        return;
      }

      if (data) {
        const newInvoice: Payment = {
          id: data.id,
          description: data.description,
          amount: Number(data.amount),
          dueDate: data.due_date,
          status: 'pendente',
          type: data.type as any
        };
        
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, payments: [newInvoice, ...p.payments] };
          }
          return p;
        }));
      }
    } else {
      const newInvoice: Payment = {
        id: `pay-${Date.now()}`,
        description: desc,
        amount,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente',
        type
      };

      const updated = projects.map(p => {
        if (p.id === projectId) {
          return { ...p, payments: [newInvoice, ...p.payments] };
        }
        return p;
      });
      saveProjectsMock(updated);
    }
  };

  return (
    <AdminContext.Provider value={{ projects, loading, updateProjectProgress, updateProjectStatus, updateRequestStatus, createInvoice }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}
