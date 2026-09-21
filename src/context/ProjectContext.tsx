/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  Project, ProjectBriefing, ProjectComment, ProjectDeliverable, ProjectEvent,
  ProjectFile, ProjectPendingAction, ProjectTask,
} from '../types/project';
import { mapProjectDbToUi, requestJson, type DatabaseRecord } from '../lib/appData';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useOptionalServiceEngagements } from './ServiceEngagementContext';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  error: string | null;
  tasks: ProjectTask[];
  deliverables: ProjectDeliverable[];
  comments: ProjectComment[];
  events: ProjectEvent[];
  pendingActions: ProjectPendingAction[];
  refreshProject: () => Promise<void>;
  uploadFile: (file: { name: string; size: string; type: ProjectFile['type']; dataUrl?: string; sizeBytes?: number }) => Promise<void>;
  addChangeRequest: (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => Promise<void>;
  startPayment: (paymentId: string) => Promise<string>;
  saveBriefing: (briefingData: Omit<ProjectBriefing, 'submitted' | 'submittedAt'>) => Promise<void>;
  accessFile: (fileId: string) => Promise<string>;
  completeClientTask: (taskId: string) => Promise<void>;
  reviewDeliverable: (deliverableId: string, result: 'approved' | 'changes_requested', comment?: string) => Promise<void>;
  addComment: (body: string, context?: { deliverableId?: string; taskId?: string }) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const serviceContext = useOptionalServiceEngagements();
  const activeProjectId = serviceContext?.selectedEngagement?.project_id || null;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [pendingActions, setPendingActions] = useState<ProjectPendingAction[]>([]);

  const refreshProject = useCallback(async () => {
    if (!user || !activeProjectId) {
      setProject(null);
      setTasks([]); setDeliverables([]); setComments([]); setEvents([]); setPendingActions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await requestJson<{
        project: DatabaseRecord | null; tasks: ProjectTask[]; deliverables: ProjectDeliverable[];
        comments: ProjectComment[]; events: ProjectEvent[]; pendingActions: ProjectPendingAction[];
        milestones: DatabaseRecord[]; files: DatabaseRecord[]; requests: DatabaseRecord[];
      }>(`/api/app/project/workspace?projectId=${encodeURIComponent(activeProjectId)}`);
      setProject(data.project ? mapProjectDbToUi({
        ...data.project,
        milestones: data.milestones,
        files: data.files,
        change_requests: data.requests,
      }) : null);
      setTasks(data.tasks || []);
      setDeliverables(data.deliverables || []);
      setComments(data.comments || []);
      setEvents(data.events || []);
      setPendingActions(data.pendingActions || []);
    } catch (error) {
      console.error('Error loading project:', error);
      setError(error instanceof Error ? error.message : 'Não foi possível carregar o projeto.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshProject(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshProject]);

  const uploadFile = async (file: { name: string; size: string; type: ProjectFile['type']; dataUrl?: string; sizeBytes?: number }) => {
    if (!project || !user) return;
    await requestJson('/api/app/project/file', {
      method: 'POST',
      body: JSON.stringify({ projectId: project.id, ...file }),
    });
    await refreshProject();
  };

  const accessFile = async (fileId: string) => {
    const data = await requestJson<{ url: string }>(`/api/app/project/file/access?fileId=${encodeURIComponent(fileId)}`);
    return data.url;
  };

  const completeClientTask = async (taskId: string) => {
    await requestJson('/api/app/project/task/complete', { method: 'POST', body: JSON.stringify({ taskId }) });
    await refreshProject();
  };

  const reviewDeliverable = async (deliverableId: string, result: 'approved' | 'changes_requested', comment?: string) => {
    await requestJson('/api/app/project/deliverable/review', {
      method: 'POST', body: JSON.stringify({ deliverableId, result, comment }),
    });
    await refreshProject();
  };

  const addComment = async (body: string, context: { deliverableId?: string; taskId?: string } = {}) => {
    if (!project) return;
    await requestJson('/api/app/project/comment', {
      method: 'POST', body: JSON.stringify({ projectId: project.id, body, ...context }),
    });
    await refreshProject();
  };

  const addChangeRequest = async (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => {
    if (!project || !user) return;
    await requestJson('/api/app/project/change-request', {
      method: 'POST',
      body: JSON.stringify({ projectId: project.id, title, description, category, priority }),
    });
    await refreshProject();
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
    <ProjectContext.Provider value={{
      project, loading, error, tasks, deliverables, comments, events, pendingActions, refreshProject,
      uploadFile, addChangeRequest, startPayment, saveBriefing, accessFile, completeClientTask,
      reviewDeliverable, addComment,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
}

export function useOptionalProject() {
  return useContext(ProjectContext);
}
