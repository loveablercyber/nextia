/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Project, ProjectBriefing, ProjectFile } from '../types/project';
import { mapProjectDbToUi, requestJson, type DatabaseRecord } from '../lib/appData';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  uploadFile: (file: { name: string; size: string; type: ProjectFile['type'] }) => Promise<void>;
  addChangeRequest: (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => Promise<void>;
  startPayment: (paymentId: string) => Promise<string>;
  saveBriefing: (briefingData: Omit<ProjectBriefing, 'submitted' | 'submittedAt'>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProject = useCallback(async () => {
    if (!user) {
      setProject(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson<{ project: DatabaseRecord | null }>('/api/app/project');
      setProject(data.project ? mapProjectDbToUi(data.project) : null);
    } catch (error) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshProject(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshProject]);

  const uploadFile = async (file: { name: string; size: string; type: ProjectFile['type'] }) => {
    if (!project || !user) return;
    await requestJson('/api/app/project/file', {
      method: 'POST',
      body: JSON.stringify({ projectId: project.id, ...file }),
    });
    await refreshProject();
    await Promise.all([
      addNotification('Arquivo enviado', `O arquivo "${file.name}" foi registrado no briefing.`, 'project', user.id),
      addNotification('Novo arquivo enviado', `${user.name} enviou o arquivo "${file.name}".`, 'project', 'admins'),
    ]);
  };

  const addChangeRequest = async (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => {
    if (!project || !user) return;
    await requestJson('/api/app/project/change-request', {
      method: 'POST',
      body: JSON.stringify({ projectId: project.id, title, description, category, priority }),
    });
    await refreshProject();
    await Promise.all([
      addNotification('Solicitação enviada', `Sua solicitação "${title}" está em análise.`, 'request', user.id),
      addNotification('Nova solicitação', `${user.name} abriu a solicitação "${title}".`, 'request', 'admins'),
    ]);
  };

  const startPayment = async (paymentId: string) => {
    if (!project || !user) throw new Error('Usuário não autenticado.');
    const data = await requestJson<{ initPoint: string }>('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
    return data.initPoint;
  };

  const saveBriefing = async (briefing: Omit<ProjectBriefing, 'submitted' | 'submittedAt'>) => {
    if (!project || !user) return;
    const data = await requestJson<{ project: DatabaseRecord }>('/api/app/project/briefing', {
      method: 'POST',
      body: JSON.stringify({ projectId: project.id, briefing }),
    });
    setProject(mapProjectDbToUi(data.project));
    await Promise.all([
      addNotification('Briefing enviado', 'Recebemos as informações do seu site.', 'project', user.id),
      addNotification('Novo briefing recebido', `${user.name} enviou o briefing do projeto.`, 'project', 'admins'),
    ]);
  };

  return (
    <ProjectContext.Provider value={{ project, loading, uploadFile, addChangeRequest, startPayment, saveBriefing }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
}
