// ─── Auth Types ────────────────────────────────────────────────────────────
// Public authentication model returned by the local PostgreSQL API.

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  avatarInitials: string;
  avatarUrl?: string;
  role: 'client' | 'admin' | 'partner' | 'technician';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
