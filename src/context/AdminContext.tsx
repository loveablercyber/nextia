import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, ChangeRequest, Payment, ProjectMilestone } from '../types/project';
import { MOCK_PROJECTS } from '../types/project';
import { supabase } from '../lib/supabase';

interface AdminContextValue {
  projects: Project[];
  quotes: any[];
  profiles: any[];
  loading: boolean;
  updateProjectProgress: (projectId: string, progress: number) => Promise<void>;
  updateProjectStatus: (projectId: string, status: Project['status']) => Promise<void>;
  updateRequestStatus: (projectId: string, requestId: string, status: ChangeRequest['status']) => Promise<void>;
  createInvoice: (projectId: string, desc: string, amount: number, type: 'ativacao' | 'mensalidade') => Promise<void>;
  updateQuoteStatus: (quoteId: string, status: 'novo' | 'em-analise' | 'respondido' | 'contratado') => Promise<void>;
  createProject: (projectData: {
    userId: string;
    name: string;
    template: string;
    segment: string;
    plan: 'Start' | 'Pro' | 'Business' | 'Personalizado';
    monthlyFee: number;
    activationFee: number;
    estimatedDelivery: string;
  }) => Promise<Project | null>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const STORAGE_KEY = 'nextia_projects_state';
const isSupabaseEnabled = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Data for Local Fallback
const MOCK_QUOTES = [
  {
    id: 'q-1',
    user_id: 'usr-001',
    project_type: 'Institucional',
    segment: 'Restaurante',
    pages: 5,
    features: ['Contato', 'Galeria', 'Reservas'],
    has_identity: true,
    urgency: 'normal',
    budget_range: 'R$ 1.000 - R$ 3.000',
    contact_name: 'João Silva',
    contact_email: 'joao@restaurante.com.br',
    contact_phone: '(11) 99999-1111',
    contact_company: 'Sabor & Arte',
    estimated_min: 497,
    estimated_max: 697,
    recommended_plan: 'Pro',
    status: 'novo',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'q-2',
    user_id: null,
    project_type: 'Landing Page',
    segment: 'Estética',
    pages: 1,
    features: ['Contato', 'WhatsApp'],
    has_identity: false,
    urgency: 'urgente',
    budget_range: 'Até R$ 1.000',
    contact_name: 'Ana Costa',
    contact_email: 'ana@estetica.com.br',
    contact_phone: '(11) 98888-2222',
    contact_company: 'Ana Estética',
    estimated_min: 297,
    estimated_max: 397,
    recommended_plan: 'Start',
    status: 'em-analise',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_PROFILES = [
  {
    id: 'usr-001',
    name: 'João Silva',
    company: 'Restaurante Sabor & Arte',
    phone: '(11) 99999-1111',
    role: 'client',
    avatar_initials: 'JS',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'usr-002',
    name: 'Admin Nextia',
    company: 'Nextia',
    phone: '(11) 99999-0000',
    role: 'admin',
    avatar_initials: 'AN',
    created_at: '2025-01-01T00:00:00Z'
  }
];

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
    })).sort((a: any, b: any) => new Date(a.estimatedAt || 0).getTime() - new Date(b.estimatedAt || 0).getTime()),
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
  const [quotes, setQuotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data
  const fetchAllData = async () => {
    setLoading(true);
    if (isSupabaseEnabled) {
      try {
        // Fetch projects
        const { data: projData, error: projErr } = await supabase
          .from('projects')
          .select('*, milestones(*), files(*), change_requests(*), payments(*)');

        if (projErr) {
          console.error('Error fetching admin projects:', projErr);
          setProjects([]);
        } else if (projData) {
          setProjects(projData.map(mapProjectDbToUi));
        }

        // Fetch quotes
        const { data: qData, error: qErr } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (qErr) {
          console.error('Error fetching admin quotes:', qErr);
          setQuotes([]);
        } else if (qData) {
          setQuotes(qData);
        }

        // Fetch profiles
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .order('name');

        if (profErr) {
          console.error('Error fetching admin profiles:', profErr);
          setProfiles([]);
        } else if (profData) {
          setProfiles(profData);
        }
      } catch (err) {
        console.error('Unexpected error loading admin data:', err);
      }
    } else {
      // Mock Load All Projects
      const storedProj = localStorage.getItem(STORAGE_KEY);
      if (storedProj) {
        try {
          setProjects(JSON.parse(storedProj));
        } catch {
          setProjects(MOCK_PROJECTS);
        }
      } else {
        setProjects(MOCK_PROJECTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROJECTS));
      }

      // Mock Load Quotes
      const storedQuotes = localStorage.getItem('nextia_quotes_state');
      if (storedQuotes) {
        try {
          setQuotes(JSON.parse(storedQuotes));
        } catch {
          setQuotes(MOCK_QUOTES);
        }
      } else {
        setQuotes(MOCK_QUOTES);
        localStorage.setItem('nextia_quotes_state', JSON.stringify(MOCK_QUOTES));
      }

      // Mock Load Profiles
      const storedProfiles = localStorage.getItem('nextia_profiles_state');
      if (storedProfiles) {
        try {
          setProfiles(JSON.parse(storedProfiles));
        } catch {
          setProfiles(MOCK_PROFILES);
        }
      } else {
        setProfiles(MOCK_PROFILES);
        localStorage.setItem('nextia_profiles_state', JSON.stringify(MOCK_PROFILES));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
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
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5-day due date
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

  // ── updateQuoteStatus ──
  const updateQuoteStatus = async (quoteId: string, status: 'novo' | 'em-analise' | 'respondido' | 'contratado') => {
    if (isSupabaseEnabled) {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating quote status in Supabase:', error);
        return;
      }
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
    } else {
      const updated = quotes.map(q => q.id === quoteId ? { ...q, status } : q);
      setQuotes(updated);
      localStorage.setItem('nextia_quotes_state', JSON.stringify(updated));
    }
  };

  // ── createProject ──
  const createProject = async (projectData: {
    userId: string;
    name: string;
    template: string;
    segment: string;
    plan: 'Start' | 'Pro' | 'Business' | 'Personalizado';
    monthlyFee: number;
    activationFee: number;
    estimatedDelivery: string;
  }): Promise<Project | null> => {
    if (isSupabaseEnabled) {
      try {
        // 1. Insert Project
        const { data: dbProj, error: projError } = await supabase
          .from('projects')
          .insert([{
            user_id: projectData.userId,
            name: projectData.name,
            template: projectData.template,
            segment: projectData.segment,
            plan: projectData.plan,
            monthly_fee: projectData.monthlyFee,
            activation_fee: projectData.activationFee,
            estimated_delivery: projectData.estimatedDelivery,
            status: 'aguardando-briefing',
            progress_percent: 0,
            requests_remaining: 5,
            requests_total: 5
          }])
          .select()
          .single();

        if (projError) {
          console.error('Error creating project in Supabase:', projError);
          return null;
        }

        // 2. Insert Default Milestones
        const defaultMilestones = [
          { title: 'Briefing recebido', description: 'Formulário de briefing preenchido e arquivos enviados.', status: 'pendente', estimated_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Design aprovado', description: 'Wireframes e paleta de cores aprovados pelo cliente.', status: 'pendente', estimated_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Desenvolvimento', description: 'Construção do site com base no design aprovado.', status: 'pendente', estimated_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Revisão do cliente', description: 'Site enviado para revisão. Aguardando aprovação ou ajustes.', status: 'pendente', estimated_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Publicação', description: 'Publicação do site no domínio contratado.', status: 'pendente', estimated_at: projectData.estimatedDelivery }
        ].map(m => ({ ...m, project_id: dbProj.id }));

        const { error: msError } = await supabase
          .from('milestones')
          .insert(defaultMilestones);

        if (msError) console.error('Error creating default milestones:', msError);

        // 3. Insert Activation Invoice if applicable
        if (projectData.activationFee > 0) {
          const { error: payError } = await supabase
            .from('payments')
            .insert([{
              project_id: dbProj.id,
              description: `Taxa de ativação — Plano ${projectData.plan}`,
              amount: projectData.activationFee,
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pendente',
              type: 'ativacao'
            }]);

          if (payError) console.error('Error creating activation invoice:', payError);
        }

        // Reload data to get the nested milestones/payments correctly mapped
        await fetchAllData();
        
        // Find and return the new project
        const freshList = await supabase
          .from('projects')
          .select('*, milestones(*), files(*), change_requests(*), payments(*)')
          .eq('id', dbProj.id)
          .single();

        return freshList.data ? mapProjectDbToUi(freshList.data) : null;
      } catch (err) {
        console.error('Unexpected error in createProject:', err);
        return null;
      }
    } else {
      // Mock Project Creation
      const newProjId = `proj-${Date.now()}`;
      
      const mockMilestones: ProjectMilestone[] = [
        { id: `m1-${Date.now()}`, title: 'Briefing recebido', description: 'Formulário de briefing preenchido e arquivos enviados.', status: 'pendente', estimatedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: `m2-${Date.now()}`, title: 'Design aprovado', description: 'Wireframes e paleta de cores aprovados pelo cliente.', status: 'pendente', estimatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: `m3-${Date.now()}`, title: 'Desenvolvimento', description: 'Construção do site com base no design aprovado.', status: 'pendente', estimatedAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: `m4-${Date.now()}`, title: 'Revisão do cliente', description: 'Site enviado para revisão. Aguardando aprovação ou ajustes.', status: 'pendente', estimatedAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString() },
        { id: `m5-${Date.now()}`, title: 'Publicação', description: 'Publicação do site no domínio contratado.', status: 'pendente', estimatedAt: projectData.estimatedDelivery }
      ];

      const mockPayments: Payment[] = projectData.activationFee > 0 ? [
        {
          id: `pay-${Date.now()}`,
          description: `Taxa de ativação — Plano ${projectData.plan}`,
          amount: projectData.activationFee,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pendente',
          type: 'ativacao'
        }
      ] : [];

      const newProj: Project = {
        id: newProjId,
        userId: projectData.userId,
        name: projectData.name,
        template: projectData.template,
        segment: projectData.segment,
        status: 'aguardando-briefing',
        plan: projectData.plan,
        monthlyFee: projectData.monthlyFee,
        activationFee: projectData.activationFee,
        startedAt: new Date().toISOString(),
        estimatedDelivery: projectData.estimatedDelivery,
        progressPercent: 0,
        requestsRemaining: 5,
        requestsTotal: 5,
        milestones: mockMilestones,
        files: [],
        changeRequests: [],
        payments: mockPayments
      };

      const updatedList = [newProj, ...projects];
      saveProjectsMock(updatedList);
      return newProj;
    }
  };

  return (
    <AdminContext.Provider value={{
      projects,
      quotes,
      profiles,
      loading,
      updateProjectProgress,
      updateProjectStatus,
      updateRequestStatus,
      createInvoice,
      updateQuoteStatus,
      createProject,
      refreshData: fetchAllData
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
}















