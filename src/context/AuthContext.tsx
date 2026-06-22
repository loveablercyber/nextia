import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthState } from '../types/auth';
import { MOCK_USERS } from '../types/auth';

// ─── Auth Context ──────────────────────────────────────────────────────────
// Designed for Supabase migration in Phase 3.
// Replace the mock implementations with real Supabase calls.

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'nextia_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Restore session from localStorage (simulates Supabase session persistence)
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        setState({ user, loading: false, error: null });
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setState(s => ({ ...s, loading: false }));
      }
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // ── login ──────────────────────────────────────────────────────────────
  // Phase 3: replace with `supabase.auth.signInWithPassword({ email, password })`
  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(s => ({ ...s, loading: true, error: null }));
    await new Promise(r => setTimeout(r, 900)); // simulate network

    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      const err = 'E-mail ou senha incorretos.';
      setState(s => ({ ...s, loading: false, error: err }));
      return { error: err };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...user } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setState({ user, loading: false, error: null });
    return { error: null };
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────
  // Phase 3: replace with `supabase.auth.signOut()`
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ user: null, loading: false, error: null });
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────
  // Phase 3: replace with `supabase.from('profiles').update(data)`
  const updateProfile = useCallback((data: Partial<User>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...data };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return { ...s, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
