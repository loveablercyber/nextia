// ─── Auth Types ────────────────────────────────────────────────────────────
// Designed to map 1:1 with Supabase auth in Phase 3

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  avatarInitials: string;
  avatarUrl?: string;
  role: 'client' | 'admin' | 'partner';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ─── Mock Users ────────────────────────────────────────────────────────────
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'usr-001',
    email: 'joao@restaurante.com.br',
    password: '123456',
    name: 'João Silva',
    company: 'Restaurante Sabor & Arte',
    phone: '(11) 99999-1111',
    avatarInitials: 'JS',
    role: 'client',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'usr-002',
    email: 'admin@nextia.com.br',
    password: 'admin123',
    name: 'Admin Nextia',
    company: 'Nextia',
    phone: '(11) 99999-0000',
    avatarInitials: 'AN',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z',
  },
];
