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

// Keep static materials and achievements
const mockAchievements: Achievement[] = [
  {
    id: 'ach-001',
    title: 'Primeiro Cliente',
    description: 'Indicou seu primeiro cliente com sucesso.',
    icon: '🎯',
    requirement: 1,
    type: 'referrals',
    unlocked: true,
    unlockedAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 'ach-002',
    title: 'Dezena de Ouro',
    description: 'Atingiu 10 clientes ativos.',
    icon: '🌟',
    requirement: 10,
    type: 'referrals',
    unlocked: true,
    unlockedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'ach-003',
    title: 'Empreendedor de Sucesso',
    description: 'Atingiu R$ 10.000 em comissões totais.',
    icon: '💰',
    requirement: 10000,
    type: 'commission',
    unlocked: true,
    unlockedAt: '2026-05-10T10:00:00Z',
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

const mockMaterials: MarketingMaterial[] = [
  { id: 'mat-001', title: 'Post Instagram - Benefícios', category: 'instagram', thumbnail: 'https://via.placeholder.com/300', downloadUrl: '#', fileType: 'png', fileSize: '2MB' },
  { id: 'mat-002', title: 'Stories - Promoção Especial', category: 'stories', thumbnail: 'https://via.placeholder.com/300x500', downloadUrl: '#', fileType: 'mp4', fileSize: '15MB' },
  { id: 'mat-003', title: 'Apresentação Comercial', category: 'pdf', thumbnail: 'https://via.placeholder.com/300x200', downloadUrl: '#', fileType: 'pdf', fileSize: '5MB' },
  { id: 'mat-004', title: 'Banner Facebook', category: 'facebook', thumbnail: 'https://via.placeholder.com/400x200', downloadUrl: '#', fileType: 'jpg', fileSize: '1MB' },
  { id: 'mat-005', title: 'Vídeo Promocional 30s', category: 'video', thumbnail: 'https://via.placeholder.com/300x200', downloadUrl: '#', fileType: 'mp4', fileSize: '25MB' },
  { id: 'mat-006', title: 'Texto para WhatsApp 1', category: 'whatsapp', thumbnail: 'https://via.placeholder.com/300x100', downloadUrl: '#', fileType: 'txt', fileSize: '1KB' },
  { id: 'mat-007', title: 'Logo Nextia Alta Resolução', category: 'logo', thumbnail: 'https://via.placeholder.com/300', downloadUrl: '#', fileType: 'png', fileSize: '3MB' },
  { id: 'mat-008', title: 'Reels - Como Funciona', category: 'reels', thumbnail: 'https://via.placeholder.com/300x500', downloadUrl: '#', fileType: 'mp4', fileSize: '20MB' },
];

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PartnerState>({
    profile: null,
    referrals: [],
    commissions: [],
    withdrawals: [],
    achievements: mockAchievements,
    ranking: [],
    materials: mockMaterials,
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

      // Fetch ranking separately
      let rankingData: any[] = [];
      try {
        const rankRes = await fetch('/api/partner/ranking', { credentials: 'include', cache: 'no-store' });
        if (rankRes.ok) {
          const rd = await rankRes.json();
          rankingData = rd.ranking || [];
        }
      } catch {}

      setState(prev => ({
        ...prev,
        profile: data.profile,
        referrals: data.referrals,
        commissions: data.commissions,
        withdrawals: data.withdrawals,
        ranking: rankingData,
        loading: false
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }));
    }
  }, []);

  useEffect(() => {
    fetchPartnerData();
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
