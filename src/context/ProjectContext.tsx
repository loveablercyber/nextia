import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, ProjectFile, ChangeRequest, Payment } from '../types/project';
import { MOCK_PROJECTS } from '../types/project';
import { useAuth } from './AuthContext';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  uploadFile: (file: { name: string; size: string; type: ProjectFile['type'] }) => Promise<void>;
  addChangeRequest: (title: string, description: string, category: string, priority: 'baixa' | 'normal' | 'alta') => Promise<void>;
  simulatePayment: (paymentId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'nextia_projects_state';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Load project from localStorage or initialize with mock data
  useEffect(() => {
    if (!user) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
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

    // Find project belonging to current user (or fallback/default to proj-001 for demo purposes)
    const userProj = projectsList.find(p => p.userId === user.id) || projectsList[0];
    setProject(userProj || null);
    setLoading(false);
  }, [user]);

  // Helper to save project list back to storage
  const saveProjectState = (updatedProject: Project) => {
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

  // ── uploadFile ─────────────────────────────────────────────────────────────
  // Phase 3: replace with Supabase Storage upload + DB insert
  const uploadFile = async (fileData: { name: string; size: string; type: ProjectFile['type'] }) => {
    if (!project || !user) return;
    
    await new Promise(r => setTimeout(r, 800)); // simulate network delay

    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.name,
      url: '#',
    };

    const updated = {
      ...project,
      files: [newFile, ...project.files],
    };

    saveProjectState(updated);
  };

  // ── addChangeRequest ───────────────────────────────────────────────────────
  // Phase 3: replace with DB insert
  const addChangeRequest = async (
    title: string,
    description: string,
    category: string,
    priority: 'baixa' | 'normal' | 'alta'
  ) => {
    if (!project) return;
    
    await new Promise(r => setTimeout(r, 800)); // simulate network delay

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

    saveProjectState(updated);
  };

  // ── simulatePayment ────────────────────────────────────────────────────────
  // Phase 3: replace with Stripe/Asaas webhook checkout flow
  const simulatePayment = async (paymentId: string) => {
    if (!project) return;

    await new Promise(r => setTimeout(r, 1000)); // simulate payment gateway delay

    const updatedPayments = project.payments.map((p): Payment => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'pago',
          paidAt: new Date().toISOString(),
          invoiceUrl: '#',
        };
      }
      return p;
    });

    const updated = {
      ...project,
      payments: updatedPayments,
    };

    saveProjectState(updated);
  };

  return (
    <ProjectContext.Provider value={{ project, loading, uploadFile, addChangeRequest, simulatePayment }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within <ProjectProvider>');
  return ctx;
}
