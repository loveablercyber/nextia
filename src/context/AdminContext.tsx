/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { mapProjectDbToUi, requestJson, type DatabaseRecord } from '../lib/appData';
import type { ChangeRequest, Payment, Project } from '../types/project';
import type { User } from '../types/auth';
import { useNotification } from './NotificationContext';

interface CreateProjectInput {
  userId: string;
  name: string;
  template: string;
  segment: string;
  plan: 'Start' | 'Pro' | 'Business' | 'Personalizado';
  monthlyFee: number;
  activationFee: number;
  estimatedDelivery: string;
}

interface AdminContextValue {
  projects: Project[];
  quotes: AdminQuote[];
  profiles: User[];
  loading: boolean;
  updateProjectProgress: (projectId: string, progress: number) => Promise<void>;
  updateProjectStatus: (projectId: string, status: Project['status']) => Promise<void>;
  updateRequestStatus: (projectId: string, requestId: string, status: ChangeRequest['status']) => Promise<void>;
  createInvoice: (projectId: string, desc: string, amount: number, type: 'ativacao' | 'mensalidade') => Promise<void>;
  updateQuoteStatus: (quoteId: string, status: 'novo' | 'em-analise' | 'respondido' | 'contratado') => Promise<void>;
  deleteQuote: (quoteId: string) => Promise<boolean>;
  createProject: (projectData: CreateProjectInput) => Promise<Project | null>;
  refreshData: () => Promise<void>;
}

export interface AdminQuote extends DatabaseRecord {
  id: string;
  project_type?: string;
  segment?: string;
  pages: number;
  features?: string[];
  has_identity?: boolean;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_company?: string;
  estimated_min: number;
  estimated_max: number;
  recommended_plan?: string;
  status: 'novo' | 'em-analise' | 'respondido' | 'contratado';
  user_id?: string;
  created_at: string;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [appData, usersData] = await Promise.all([
        requestJson<{ projects: DatabaseRecord[]; quotes: AdminQuote[] }>('/api/admin/app/data'),
        requestJson<{ users: User[] }>('/api/admin/users'),
      ]);
      setProjects(appData.projects.map(mapProjectDbToUi));
      setQuotes(appData.quotes || []);
      setProfiles(usersData.users || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setProjects([]);
      setQuotes([]);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchAllData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchAllData]);

  const updateProjectProgress = async (projectId: string, progress: number) => {
    const project = projects.find((item) => item.id === projectId);
    await requestJson('/api/admin/app/project/progress', {
      method: 'POST', body: JSON.stringify({ projectId, progress }),
    });
    setProjects((current) => current.map((item) => item.id === projectId ? { ...item, progressPercent: progress } : item));
    if (project) await addNotification('Progresso atualizado', `O projeto "${project.name}" atingiu ${progress}%.`, 'project', project.userId);
  };

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    const project = projects.find((item) => item.id === projectId);
    await requestJson('/api/admin/app/project/status', {
      method: 'POST', body: JSON.stringify({ projectId, status }),
    });
    setProjects((current) => current.map((item) => item.id === projectId
      ? { ...item, status, publishedAt: status === 'publicado' ? item.publishedAt || new Date().toISOString() : item.publishedAt }
      : item));
    if (project) await addNotification('Status do projeto alterado', `O projeto "${project.name}" agora está como ${status}.`, 'project', project.userId);
  };

  const updateRequestStatus = async (projectId: string, requestId: string, status: ChangeRequest['status']) => {
    const project = projects.find((item) => item.id === projectId);
    const request = project?.changeRequests.find((item) => item.id === requestId);
    await requestJson('/api/admin/app/request/status', {
      method: 'POST', body: JSON.stringify({ requestId, status }),
    });
    setProjects((current) => current.map((item) => item.id !== projectId ? item : {
      ...item,
      changeRequests: item.changeRequests.map((change) => change.id === requestId
        ? { ...change, status, resolvedAt: status === 'concluido' ? new Date().toISOString() : undefined }
        : change),
    }));
    if (project) await addNotification('Solicitação atualizada', `A solicitação "${request?.title || 'Solicitação'}" agora está como ${status}.`, 'request', project.userId);
  };

  const createInvoice = async (projectId: string, description: string, amount: number, type: Payment['type']) => {
    const project = projects.find((item) => item.id === projectId);
    await requestJson('/api/admin/app/invoice', {
      method: 'POST', body: JSON.stringify({ projectId, description, amount, type }),
    });
    await fetchAllData();
    if (project) await addNotification('Nova fatura', `Uma fatura de R$ ${amount.toFixed(2)} foi gerada para "${project.name}".`, 'payment', project.userId);
  };

  const updateQuoteStatus = async (quoteId: string, status: 'novo' | 'em-analise' | 'respondido' | 'contratado') => {
    await requestJson('/api/admin/app/quote/status', {
      method: 'POST', body: JSON.stringify({ quoteId, status }),
    });
    setQuotes((current) => current.map((quote) => quote.id === quoteId ? { ...quote, status } : quote));
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      await requestJson('/api/admin/app/quote/delete', {
        method: 'POST', body: JSON.stringify({ quoteId }),
      });
      setQuotes((current) => current.filter((quote) => String(quote.id) !== String(quoteId)));
      return true;
    } catch (error) {
      console.error('Error deleting quote:', error);
      return false;
    }
  };

  const createProject = async (projectData: CreateProjectInput) => {
    try {
      const data = await requestJson<{ project: DatabaseRecord }>('/api/admin/app/project', {
        method: 'POST', body: JSON.stringify(projectData),
      });
      const project = mapProjectDbToUi(data.project);
      setProjects((current) => [project, ...current]);
      await addNotification('Novo projeto ativado', `Seu projeto "${project.name}" foi ativado.`, 'project', project.userId);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  return (
    <AdminContext.Provider value={{ projects, quotes, profiles, loading, updateProjectProgress, updateProjectStatus, updateRequestStatus, createInvoice, updateQuoteStatus, deleteQuote, createProject, refreshData: fetchAllData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}
