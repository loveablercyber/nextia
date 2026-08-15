import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { requestJson } from '../lib/appData';

export interface ServiceEngagement {
  id: string;
  public_code: string;
  user_id: string;
  service_slug: string;
  service_name_snapshot: string;
  service_category: string;
  segment_slug?: string;
  segment_name_snapshot?: string;
  template_id?: string;
  template_slug_snapshot?: string;
  template_name_snapshot?: string;
  plan_id?: string;
  plan_name_snapshot?: string;
  workflow_key: string;
  execution_mode: string;
  status: string;
  activation_amount_cents: number;
  monthly_amount_cents: number;
  fqdn?: string;
  domain_mode?: 'register' | 'connect' | 'transfer';
  domain_status?: string;
  registration_fee_cents?: number;
  project_id?: string;
  project_name?: string;
  project_status?: string;
  progress_percent?: number;
  capabilities?: string[];
  created_at: string;
}

interface ServiceEngagementContextValue {
  engagements: ServiceEngagement[];
  selectedEngagement: ServiceEngagement | null;
  selectEngagement: (idOrCode: string | null) => void;
  loading: boolean;
  refreshEngagements: () => Promise<void>;
}

const ServiceEngagementContext = createContext<ServiceEngagementContextValue | null>(null);

export function ServiceEngagementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<ServiceEngagement[]>([]);
  const [selectedEngagement, setSelectedEngagementState] = useState<ServiceEngagement | null>(null);
  const [loading, setLoading] = useState(true);
  const routeEngagementId = location.pathname.match(/^\/painel\/servicos\/([^/]+)/)?.[1] || null;

  const refreshEngagements = useCallback(async () => {
    if (!user) {
      setEngagements([]);
      setSelectedEngagementState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await requestJson<{ engagements: ServiceEngagement[] }>('/api/app/engagements');
      const list = data.engagements || [];
      setEngagements(list);

      setSelectedEngagementState((prev) => {
        const persistedId = window.localStorage.getItem('nextia.activeEngagementId');
        const requestedId = routeEngagementId || prev?.id || persistedId;
        const match = requestedId ? list.find((e) => e.id === requestedId || e.public_code === requestedId) : null;
        if (match) return match;
        return list.length === 1 ? list[0] : null;
      });
    } catch (err) {
      console.error('[ServiceEngagementContext] Falha ao carregar engajamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [routeEngagementId, user]);

  useEffect(() => {
    refreshEngagements();
  }, [refreshEngagements]);

  const selectEngagement = (idOrCode: string | null) => {
    if (!idOrCode) {
      setSelectedEngagementState(null);
      window.localStorage.removeItem('nextia.activeEngagementId');
      return;
    }
    const found = engagements.find((e) => e.id === idOrCode || e.public_code === idOrCode);
    if (found) {
      setSelectedEngagementState(found);
      window.localStorage.setItem('nextia.activeEngagementId', found.id);
      const currentMatch = location.pathname.match(/^\/painel\/servicos\/[^/]+(\/.*)?$/);
      navigate(`/painel/servicos/${found.id}${currentMatch?.[1] || ''}`);
    }
  };

  return (
    <ServiceEngagementContext.Provider
      value={{
        engagements,
        selectedEngagement,
        selectEngagement,
        loading,
        refreshEngagements,
      }}
    >
      {children}
    </ServiceEngagementContext.Provider>
  );
}

export function useServiceEngagements() {
  const context = useContext(ServiceEngagementContext);
  if (!context) {
    throw new Error('useServiceEngagements deve ser usado dentro de um ServiceEngagementProvider');
  }
  return context;
}

export function useOptionalServiceEngagements() {
  return useContext(ServiceEngagementContext);
}
