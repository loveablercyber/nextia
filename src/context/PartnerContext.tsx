/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Partner,
  Referral,
  Commission,
  WithdrawalRequest,
  Achievement,
  MarketingMaterial,
} from '../types/partner';

interface PartnerState {
  profile: Partner | null;
  referrals: Referral[];
  commissions: Commission[];
  withdrawals: WithdrawalRequest[];
  achievements: Achievement[];
  ranking: Partner[];
  materials: MarketingMaterial[];
  loading: boolean;
  error: string | null;
}

interface PartnerContextType {
  state: PartnerState;
  requestWithdrawal: (amount: number, pixKey?: string) => Promise<void>;
  updateProfile: (updates: Partial<Partner>) => Promise<void>;
  refresh: () => Promise<void>;
}

const achievementDefinitions: Achievement[] = [
  {
    id: 'ach-001',
    title: 'Primeiro Cliente',
    description: 'Indicou seu primeiro cliente com sucesso.',
    icon: '🎯',
    requirement: 1,
    type: 'referrals',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach-005',
    title: 'Top 10 Nextia',
    description: 'Alcançou uma posição entre os 10 parceiros com maior comissão.',
    icon: '🏆',
    requirement: 10,
    type: 'ranking',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach-002',
    title: 'Dezena de Ouro',
    description: 'Atingiu 10 clientes ativos.',
    icon: '🌟',
    requirement: 10,
    type: 'referrals',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach-003',
    title: 'Empreendedor de Sucesso',
    description: 'Atingiu R$ 10.000 em comissões totais.',
    icon: '💰',
    requirement: 10000,
    type: 'commission',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach-004',
    title: 'Cinquentão',
    description: 'Atingiu 50 clientes ativos.',
    icon: '🔥',
    requirement: 50,
    type: 'referrals',
    unlocked: false,
    unlockedAt: null,
  },
];

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PartnerState>({
    profile: null,
    referrals: [],
    commissions: [],
    withdrawals: [],
    achievements: achievementDefinitions,
    ranking: [],
    materials: [],
    loading: true,
    error: null,
  });

  const fetchPartnerData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const res = await fetch('/api/partner/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Falha ao carregar dados do parceiro');
      
      const data = await res.json();

      const [rankRes, materialsRes] = await Promise.all([
        fetch('/api/partner/ranking', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/partner/materials', { credentials: 'include', cache: 'no-store' }),
      ]);
      const rankingData = rankRes.ok ? (await rankRes.json()).ranking || [] : [];
      const materialsData = materialsRes.ok ? (await materialsRes.json()).materials || [] : [];

      setState(prev => ({
        ...prev,
        profile: data.profile,
        referrals: data.referrals,
        commissions: data.commissions,
        withdrawals: data.withdrawals,
        ranking: rankingData,
        materials: materialsData,
        loading: false
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchPartnerData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchPartnerData]);

  const updateProfile = useCallback(async (updates: Partial<Partner>) => {
    try {
      const res = await fetch('/api/partner/update-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) throw new Error('Falha ao atualizar perfil');
      await fetchPartnerData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [fetchPartnerData]);

  const requestWithdrawal = useCallback(async (amount: number, pixKey?: string) => {
    try {
      const res = await fetch('/api/partner/request-withdrawal', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, pixKey })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao solicitar saque');
      }
      await fetchPartnerData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [fetchPartnerData]);

  return (
    <PartnerContext.Provider value={{ state, requestWithdrawal, updateProfile, refresh: fetchPartnerData }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};
