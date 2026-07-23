import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, ProjectFile, ChangeRequest, Payment, ProjectBriefing } from '../types/project';
import { MOCK_PROJECTS } from '../types/project';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { supabase } from '../lib/supabase';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  uploadFile: (file: { name: string; size: string; type: ProjectFile['type'] }) => Promise<void>;
  addChangeRequest: (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => Promise<void>;
  simulatePayment: (paymentId: string) => Promise<void>;
  saveBriefing: (briefingData: Omit<ProjectBriefing, 'submitted' | 'submittedAt'>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'nextia_projects_state';
const isSupabaseEnabled = false;

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

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseProject = async (userId: string) => {
    try {
      // Fetch project belonging to user including milestones, files, requests, payments
      const { data, error } = await supabase
        .from('projects')
        .select('*, milestones(*), files(*), change_requests(*), payments(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project from Supabase:', error);
        return null;
      }

      if (data) {
        return mapProjectDbToUi(data);
      }
    } catch (err) {
      console.error('Unexpected error loading Supabase data:', err);
    }
    return null;
  };

  // Load project
  useEffect(() => {
    if (!user) {
      setProject(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      if (isSupabaseEnabled) {
        // ── Supabase Loader ──
        const p = await fetchSupabaseProject(user.id);
        setProject(p);
      } else {
        // ── LocalStorage Loader ──
        const stored = localStorage.getItem(STORAGE_KEY);
        let projectsList: Project[] = [];

        if (stored) {
          try {
            projectsList = JSON.parse(stored);
          } catch {
            projectsList = MOCK_PROJECTS;
          }
        } else {
          projectsList = MOCK_PROJECTS;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsList));
        }

        let userProj = projectsList.find(p => p.userId === user.id);

        // Se o cliente nao possui um projeto instanciado, cria um novo projeto real com seus dados
        if (!userProj && user.role !== 'admin') {
          const companyName = user.company?.trim() || `Projeto de ${user.name}`;
          const companySlug = (user.company || user.name || 'meusite')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

          userProj = {
            id: `proj-${user.id}`,
            userId: user.id,
            name: companyName,
            template: 'Site Profissional',
            segment: 'Geral',
            status: 'aguardando-briefing',
            plan: 'Pro',
            domain: `${companySlug || 'meusite'}.com.br`,
            monthlyFee: 79,
            activationFee: 497,
            startedAt: user.createdAt || new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            progressPercent: 10,
            requestsRemaining: 5,
            requestsTotal: 5,
            milestones: [
              {
                id: 'm1',
                title: 'Briefing e Materiais',
                description: 'Formulário de briefing preenchido e arquivos enviados pelo cliente.',
                status: 'em-andamento',
                estimatedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'm2',
                title: 'Wireframe e Design',
                description: 'Criação da estrutura do site e paleta de cores para aprovação.',
                status: 'pendente',
                estimatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'm3',
                title: 'Desenvolvimento do Site',
                description: 'Construção das páginas, integração com WhatsApp e formulários.',
                status: 'pendente',
                estimatedAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'm4',
                title: 'Revisão do Cliente',
                description: 'Versão de testes enviada para aprovação do cliente.',
                status: 'pendente',
                estimatedAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'm5',
                title: 'Publicação Oficial',
                description: 'Publicação do site no domínio contratado.',
                status: 'pendente',
                estimatedAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
            files: [],
            changeRequests: [],
            payments: [
              {
                id: `pay-act-${user.id}`,
                description: 'Taxa de ativação — Plano Pro',
                amount: 497,
                dueDate: new Date().toISOString(),
                status: 'pendente',
                type: 'ativacao',
              },
              {
                id: `pay-mon-${user.id}`,
                description: `Mensalidade — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 79,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pendente',
                type: 'mensalidade',
              },
            ],
          };

          projectsList = [userProj, ...projectsList];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsList));
        }

        if (!userProj && user.role === 'admin') {
          userProj = projectsList[0];
        }

        setProject(userProj || null);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  // Helper to save mock list to storage
  const saveProjectStateMock = (updatedProject: Project) => {
    setProject(updatedProject);
    const stored = localStorage.getItem(STORAGE_KEY);
    let projectsList: Project[] = [];
    if (stored) {
      try {
        projectsList = JSON.parse(stored);
      } catch {
        projectsList = MOCK_PROJECTS;
      }
    }
    const newList = projectsList.map(p => p.id === updatedProject.id ? updatedProject : p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  // ── uploadFile ──
  const uploadFile = async (fileData: { name: string; size: string; type: ProjectFile['type'] }) => {
    if (!project || !user) return;

    if (isSupabaseEnabled) {
      // ── Supabase Upload ──
      const dbFile = {
        project_id: project.id,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        uploaded_by: user.name,
        url: '#' // In Phase 6: use supabase.storage.from('briefing').getPublicUrl()
      };

      const { data, error } = await supabase
        .from('files')
        .insert([dbFile])
        .select()
        .single();

      if (error) {
        console.error('Error inserting file in Supabase:', error);
        return;
      }

      if (data) {
        const newFile: ProjectFile = {
          id: data.id,
          name: data.name,
          size: data.size,
          type: data.type as any,
          uploadedAt: data.uploaded_at,
          uploadedBy: data.uploaded_by,
          url: data.url
        };
        setProject(p => p ? { ...p, files: [newFile, ...p.files] } : null);
      }
    } else {
      // ── Mock Upload ──
      await new Promise(r => setTimeout(r, 800));
      const newFile: ProjectFile = {
        id: `file-${Date.now()}`,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.name,
        url: '#',
      };
      const updated = { ...project, files: [newFile, ...project.files] };
      saveProjectStateMock(updated);
    }

    // Trigger Notification
    try {
      await addNotification(
        'Arquivo enviado',
        `O arquivo "${fileData.name}" foi enviado com sucesso para o seu briefing.`,
        'project',
        user.id
      );
      await addNotification(
        'Novo arquivo enviado',
        `O cliente ${user.name} enviou o arquivo "${fileData.name}" para o briefing.`,
        'project',
        'admins'
      );
    } catch (err) {
      console.error('Error triggering notification for uploadFile:', err);
    }
  };

  // ── addChangeRequest ──
  const addChangeRequest = async (
    title: string,
    description: string,
    category: string,
    priority: 'baixa' | 'normal' | 'alta'
  ) => {
    if (!project) return;

    if (isSupabaseEnabled) {
      // ── Supabase Change Request ──
      const dbRequest = {
        project_id: project.id,
        title,
        description,
        status: 'aberto',
        priority,
        category
      };

      const { data, error } = await supabase
        .from('change_requests')
        .insert([dbRequest])
        .select()
        .single();

      if (error) {
        console.error('Error inserting change request in Supabase:', error);
        return;
      }

      if (data) {
        // Also deduct quota in Supabase
        const nextQuota = Math.max(0, project.requestsRemaining - 1);
        await supabase
          .from('projects')
          .update({ requests_remaining: nextQuota })
          .eq('id', project.id);

        const newRequest: ChangeRequest = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status as any,
          priority: data.priority as any,
          createdAt: data.created_at,
          category: data.category
        };

        setProject(p => p ? {
          ...p,
          changeRequests: [newRequest, ...p.changeRequests],
          requestsRemaining: nextQuota
        } : null);
      }
    } else {
      // ── Mock Change Request ──
      await new Promise(r => setTimeout(r, 800));
      const newRequest: ChangeRequest = {
        id: `cr-${Date.now()}`,
        title,
        description,
        status: 'aberto',
        priority,
        createdAt: new Date().toISOString(),
        category,
      };
      const updated = {
        ...project,
        changeRequests: [newRequest, ...project.changeRequests],
        requestsRemaining: Math.max(0, project.requestsRemaining - 1),
      };
      saveProjectStateMock(updated);
    }

    // Trigger Notifications
    try {
      if (user) {
        await addNotification(
          'Solicitação de alteração enviada',
          `Sua solicitação "${title}" foi enviada com sucesso e está em análise.`,
          'request',
          user.id
        );
        await addNotification(
          'Nova solicitação de alteração',
          `O cliente ${user.name} abriu uma nova solicitação: "${title}".`,
          'request',
          'admins'
        );
      }
    } catch (err) {
      console.error('Error triggering notification for addChangeRequest:', err);
    }
  };

  // ── simulatePayment ──
  const simulatePayment = async (paymentId: string) => {
    if (!project || !user) return;

    // Get payment description before update
    const payment = project.payments.find(p => p.id === paymentId);
    const desc = payment ? payment.description : 'Fatura';

    if (isSupabaseEnabled) {
      // ── Supabase Payment Update ──
      const { error } = await supabase
        .from('payments')
        .update({ status: 'pago', paid_at: new Date().toISOString(), invoice_url: '#' })
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment status in Supabase:', error);
        return;
      }

      setProject(p => {
        if (!p) return null;
        const updatedPayments = p.payments.map((pay): Payment => {
          if (pay.id === paymentId) {
            return { ...pay, status: 'pago', paidAt: new Date().toISOString(), invoiceUrl: '#' };
          }
          return pay;
        });
        return { ...p, payments: updatedPayments };
      });
    } else {
      // ── Mock Payment Update ──
      await new Promise(r => setTimeout(r, 1000));
      const updatedPayments = project.payments.map((p): Payment => {
        if (p.id === paymentId) {
          return { ...p, status: 'pago', paidAt: new Date().toISOString(), invoiceUrl: '#' };
        }
        return p;
      });
      const updated = { ...project, payments: updatedPayments };
      saveProjectStateMock(updated);
    }

    // Trigger Notifications
    try {
      await addNotification(
        'Pagamento confirmado',
        `O pagamento da fatura "${desc}" foi processado com sucesso.`,
        'payment',
        user.id
      );
      await addNotification(
        'Pagamento de fatura recebido',
        `O cliente ${user.name} realizou o pagamento da fatura "${desc}".`,
        'payment',
        'admins'
      );
    } catch (err) {
      console.error('Error triggering notification for simulatePayment:', err);
    }
  };

  // ── saveBriefing ──
  const saveBriefing = async (briefingData: Omit<ProjectBriefing, 'submitted' | 'submittedAt'>) => {
    if (!project) return;

    const fullBriefing: ProjectBriefing = {
      ...briefingData,
      submitted: true,
      submittedAt: new Date().toISOString(),
    };

    const updatedMilestones = project.milestones.map((m, idx) => {
      if (idx === 0 || m.id === 'm1' || m.title.toLowerCase().includes('briefing')) {
        return { ...m, status: 'concluido' as const, completedAt: new Date().toISOString() };
      }
      if (idx === 1 || m.id === 'm2') {
        return { ...m, status: 'em-andamento' as const };
      }
      return m;
    });

    const updatedProject: Project = {
      ...project,
      status: 'em-desenvolvimento',
      progressPercent: 35,
      briefing: fullBriefing,
      milestones: updatedMilestones,
    };

    saveProjectStateMock(updatedProject);

    try {
      await addNotification(
        'Briefing enviado com sucesso!',
        'Recebemos as informações do seu site. Nossa equipe iniciará a criação da estrutura visual!',
        'project',
        user?.id || ''
      );
      await addNotification(
        'Novo Briefing Recebido',
        `O cliente ${user?.name || project.name} enviou o briefing do projeto.`,
        'project',
        'admins'
      );
    } catch (err) {
      console.error('Error triggering notification for saveBriefing:', err);
    }
  };

  return (
    <ProjectContext.Provider value={{ project, loading, uploadFile, addChangeRequest, simulatePayment, saveBriefing }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within <ProjectProvider>');
  return ctx;
}
