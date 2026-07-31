import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Partner,
  Referral,
  Commission,
  WithdrawalRequest,
  Achievement,
  MarketingMaterial,
  PartnerLevel,
} from '../types/partner';
import { PARTNER_LEVELS } from '../types/partner';

interface PartnerState {
  profile: Partner | null;
  referrals: Referral[];
  commissions: Commission[];
  withdrawals: WithdrawalRequest[];
  achievements: Achievement[];
  ranking: Partner[];
  materials: MarketingMaterial[];
}

interface PartnerContextType {
  state: PartnerState;
  requestWithdrawal: (amount: number) => void;
  updateProfile: (updates: Partial<Partner>) => void;
}

const defaultPartner: Partner = {
  id: 'partner-001',
  userId: 'usr-003',
  name: 'Lucas Fernandes',
  email: 'lucas@example.com',
  whatsapp: '(11) 98888-7777',
  cpfCnpj: '123.456.789-00',
  pixKey: 'lucas@example.com',
  referralCode: 'lucas-nextia',
  level: 'ouro',
  status: 'ativo',
  totalReferrals: 18,
  activeReferrals: 18, // Fixed to 18 to match ouro tier correctly (16-30)
  totalCommission: 12880,
  availableBalance: 2450,
  pendingBalance: 450,
  rankingPosition: 4,
  createdAt: '2025-05-10T10:00:00Z',
};

const mockReferrals: Referral[] = [
  {
    id: 'ref-001',
    partnerId: 'partner-001',
    clientName: 'Ana Costa',
    clientCompany: 'Restaurante Sabor',
    plan: 'Premium',
    monthlyFee: 299,
    status: 'ativo',
    commissionRate: 0.25,
    commissionGenerated: 74.75,
    startDate: '2026-06-15T14:30:00Z',
    lastPaymentDate: '2026-07-15T10:00:00Z',
  },
  {
    id: 'ref-002',
    partnerId: 'partner-001',
    clientName: 'Carlos Silva',
    clientCompany: 'Oficina do Carlão',
    plan: 'Basic',
    monthlyFee: 99,
    status: 'ativo',
    commissionRate: 0.25,
    commissionGenerated: 24.75,
    startDate: '2026-05-20T09:15:00Z',
    lastPaymentDate: '2026-07-20T09:00:00Z',
  },
  {
    id: 'ref-003',
    partnerId: 'partner-001',
    clientName: 'Mariana Oliveira',
    clientCompany: 'Estúdio Beauty',
    plan: 'Pro',
    monthlyFee: 199,
    status: 'pendente',
    commissionRate: 0.25,
    commissionGenerated: 0,
    startDate: '2026-07-28T16:45:00Z',
    lastPaymentDate: '',
  },
  {
    id: 'ref-004',
    partnerId: 'partner-001',
    clientName: 'Roberto Almeida',
    clientCompany: 'Almeida Consultoria',
    plan: 'Premium',
    monthlyFee: 299,
    status: 'inadimplente',
    commissionRate: 0.25,
    commissionGenerated: 74.75,
    startDate: '2026-03-10T11:20:00Z',
    lastPaymentDate: '2026-05-10T10:00:00Z',
  },
  {
    id: 'ref-005',
    partnerId: 'partner-001',
    clientName: 'Fernanda Lima',
    clientCompany: 'Doceria Doce Vida',
    plan: 'Pro',
    monthlyFee: 199,
    status: 'cancelado',
    commissionRate: 0.25,
    commissionGenerated: 149.25,
    startDate: '2025-11-05T13:00:00Z',
    lastPaymentDate: '2026-02-05T10:00:00Z',
  },
];

const mockCommissions: Commission[] = [
  {
    id: 'com-001',
    partnerId: 'partner-001',
    referralId: 'ref-001',
    clientName: 'Ana Costa',
    plan: 'Premium',
    monthlyFee: 299,
    commissionValue: 74.75,
    status: 'confirmado',
    period: '2026-07',
    createdAt: '2026-07-15T10:05:00Z',
  },
  {
    id: 'com-002',
    partnerId: 'partner-001',
    referralId: 'ref-002',
    clientName: 'Carlos Silva',
    plan: 'Basic',
    monthlyFee: 99,
    commissionValue: 24.75,
    status: 'pago',
    period: '2026-06',
    createdAt: '2026-06-20T09:05:00Z',
  },
  {
    id: 'com-003',
    partnerId: 'partner-001',
    referralId: 'ref-001',
    clientName: 'Ana Costa',
    plan: 'Premium',
    monthlyFee: 299,
    commissionValue: 74.75,
    status: 'pago',
    period: '2026-06',
    createdAt: '2026-06-15T10:05:00Z',
  },
];

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

const mockRanking: Partner[] = [
  { ...defaultPartner, id: 'rk-001', name: 'Thiago Martins', totalCommission: 35000, level: 'diamante', rankingPosition: 1, activeReferrals: 45 },
  { ...defaultPartner, id: 'rk-002', name: 'Juliana Pereira', totalCommission: 28000, level: 'diamante', rankingPosition: 2, activeReferrals: 38 },
  { ...defaultPartner, id: 'rk-003', name: 'Marcos Paulo', totalCommission: 19500, level: 'ouro', rankingPosition: 3, activeReferrals: 25 },
  defaultPartner, // Lucas is 4th
  { ...defaultPartner, id: 'rk-005', name: 'Camila Santos', totalCommission: 9800, level: 'prata', rankingPosition: 5, activeReferrals: 12 },
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

const STORAGE_KEY = 'nextia_partner_state';

const getInitialState = (): PartnerState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored partner state', e);
    }
  }
  return {
    profile: defaultPartner,
    referrals: mockReferrals,
    commissions: mockCommissions,
    withdrawals: [],
    achievements: mockAchievements,
    ranking: mockRanking,
    materials: mockMaterials,
  };
};

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PartnerState>(getInitialState);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateProfile = useCallback((updates: Partial<Partner>) => {
    setState(prev => {
      if (!prev.profile) return prev;
      
      const newProfile = { ...prev.profile, ...updates };
      
      // Recalculate level if activeReferrals changed
      if (updates.activeReferrals !== undefined) {
        let newLevel: PartnerLevel = 'bronze';
        for (const [level, reqs] of Object.entries(PARTNER_LEVELS)) {
          if (newProfile.activeReferrals >= reqs.min && newProfile.activeReferrals <= reqs.max) {
            newLevel = level as PartnerLevel;
            break;
          }
        }
        newProfile.level = newLevel;
      }
      
      return { ...prev, profile: newProfile };
    });
  }, []);

  const requestWithdrawal = useCallback((amount: number) => {
    setState(prev => {
      if (!prev.profile || prev.profile.availableBalance < amount) return prev;
      
      const newWithdrawal: WithdrawalRequest = {
        id: `wd-${Date.now()}`,
        partnerId: prev.profile.id,
        amount,
        pixKey: prev.profile.pixKey,
        status: 'pendente',
        requestedAt: new Date().toISOString(),
        processedAt: null,
      };

      return {
        ...prev,
        profile: {
          ...prev.profile,
          availableBalance: prev.profile.availableBalance - amount,
          pendingBalance: prev.profile.pendingBalance + amount,
        },
        withdrawals: [newWithdrawal, ...prev.withdrawals],
      };
    });
  }, []);

  return (
    <PartnerContext.Provider value={{ state, requestWithdrawal, updateProfile }}>
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
