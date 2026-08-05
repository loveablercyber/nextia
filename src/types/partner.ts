export type PartnerLevel = 'bronze' | 'prata' | 'ouro' | 'diamante' | 'elite';
export type ReferralStatus = 'ativo' | 'pendente' | 'cancelado' | 'inadimplente';
export type WithdrawalStatus = 'pendente' | 'aprovado' | 'pago' | 'rejeitado';
export type CommissionStatus = 'pendente' | 'confirmado' | 'pago';

export interface Partner {
  id: string;
  userId: string;
  name: string;
  email: string;
  whatsapp: string;
  cpfCnpj: string;
  pixKey: string;
  referralCode: string;
  level: PartnerLevel;
  status: 'pendente' | 'ativo' | 'suspenso' | 'recusado';
  decisionReason?: string;
  reviewedAt?: string | null;
  totalReferrals: number;
  activeReferrals: number;
  totalCommission: number;
  availableBalance: number;
  pendingBalance: number;
  rankingPosition: number;
  createdAt: string;
}

export interface Referral {
  id: string;
  partnerId: string;
  clientName: string;
  clientCompany: string;
  plan: string;
  monthlyFee: number;
  status: ReferralStatus;
  commissionRate: number; // 0.25 = 25%
  commissionGenerated: number;
  startDate: string;
  lastPaymentDate: string;
}

export interface Commission {
  id: string;
  partnerId: string;
  referralId: string;
  clientName: string;
  plan: string;
  monthlyFee: number;
  commissionValue: number;
  status: CommissionStatus;
  period: string; // '2026-07'
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  partnerId: string;
  amount: number;
  pixKey: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  requirement: number;
  type: 'referrals' | 'commission' | 'ranking';
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface MarketingMaterial {
  id: string;
  title: string;
  category: 'instagram' | 'facebook' | 'stories' | 'reels' | 'whatsapp' | 'video' | 'pdf' | 'logo';
  thumbnail: string;
  downloadUrl: string;
  fileType: string;
  fileSize: string;
}

export const PARTNER_LEVELS: Record<PartnerLevel, { min: number; max: number; label: string; color: string; icon: string }> = {
  bronze: { min: 1, max: 5, label: 'Bronze', color: '#CD7F32', icon: '🥉' },
  prata: { min: 6, max: 15, label: 'Prata', color: '#C0C0C0', icon: '🥈' },
  ouro: { min: 16, max: 30, label: 'Ouro', color: '#FFD700', icon: '🥇' },
  diamante: { min: 31, max: 50, label: 'Diamante', color: '#B9F2FF', icon: '💎' },
  elite: { min: 51, max: Infinity, label: 'Elite', color: '#D4A853', icon: '👑' },
};

export const PARTNER_GOALS = [
  { clients: 10, bonus: 100 },
  { clients: 25, bonus: 300 },
  { clients: 50, bonus: 1000 },
  { clients: 100, bonus: 3000 },
];

export const COMMISSION_RATE = 0.25; // 25%
export const MIN_WITHDRAWAL = 50; // R$ 50,00
