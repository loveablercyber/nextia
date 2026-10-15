// ─── Auth Types ────────────────────────────────────────────────────────────
// Public authentication model returned by the local PostgreSQL API.

export type UserRole = 'client' | 'admin' | 'partner' | 'technician' | 'financial' | 'support';

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  avatarInitials: string;
  avatarUrl?: string;
  role: UserRole;
  permissions?: string[];
  createdAt: string;
  lastLogin?: string;
  mustChangePassword?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
