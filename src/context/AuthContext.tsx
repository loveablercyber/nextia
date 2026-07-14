import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthState } from '../types/auth';
import { MOCK_USERS } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null, user?: User }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'nextia_session';

// Check if Supabase keys are provided (either in env or injected)
const isSupabaseEnabled = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Restore session
  useEffect(() => {
    if (isSupabaseEnabled) {
      // ── Supabase session restoration ──
      const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setState({
              user: {
                id: profile.id,
                email: session.user.email || '',
                name: profile.name || '',
                company: profile.company || '',
                phone: profile.phone || '',
                avatarInitials: profile.avatar_initials || 'JS',
                role: (profile.role as 'client' | 'admin') || 'client',
                createdAt: profile.created_at || new Date().toISOString(),
              },
              loading: false,
              error: null,
            });
            return;
          }
        }
        setState({ user: null, loading: false, error: null });
      };

      getInitialSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session && session.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setState({
              user: {
                id: profile.id,
                email: session.user.email || '',
                name: profile.name || '',
                company: profile.company || '',
                phone: profile.phone || '',
                avatarInitials: profile.avatar_initials || 'JS',
                role: (profile.role as 'client' | 'admin') || 'client',
                createdAt: profile.created_at || new Date().toISOString(),
              },
              loading: false,
              error: null,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, error: null });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // ── LocalStorage Mock ──
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const user: User = JSON.parse(stored);
          setState({ user, loading: false, error: null });
        } catch {
          localStorage.removeItem(SESSION_KEY);
          setState({ user: null, loading: false, error: null });
        }
      } else {
        setState({ user: null, loading: false, error: null });
      }
    }
  }, []);

  // ── login ──
  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null, user?: User }> => {
    setState(s => ({ ...s, loading: true, error: null }));

    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setState(s => ({ ...s, loading: false, error: error.message }));
          return { error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: profile.id,
              email: data.user.email || '',
              name: profile.name || '',
              company: profile.company || '',
              phone: profile.phone || '',
              avatarInitials: profile.avatar_initials || 'JS',
              role: (profile.role as 'client' | 'admin') || 'client',
              createdAt: profile.created_at || new Date().toISOString(),
            };
            setState({ user, loading: false, error: null });
            return { error: null, user };
          }
        }
        const noProfileErr = 'Perfil do usuário não encontrado.';
        setState(s => ({ ...s, loading: false, error: noProfileErr }));
        return { error: noProfileErr };
      } catch (err: any) {
        const errMsg = err.message || 'Ocorreu um erro ao fazer login.';
        setState(s => ({ ...s, loading: false, error: errMsg }));
        return { error: errMsg };
      }
    } else {
      await new Promise(r => setTimeout(r, 600)); // Network simulation
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
      return { error: null, user };
    }
  }, []);

  // ── logout ──
  const logout = useCallback(async () => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setState({ user: null, loading: false, error: null });
  }, []);

  // ── updateProfile ──
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!state.user) return;

    if (isSupabaseEnabled) {
      try {
        const dbData = {
          name: data.name,
          company: data.company,
          phone: data.phone,
          avatar_initials: data.avatarInitials,
          role: data.role,
        };
        await supabase.from('profiles').update(dbData).eq('id', state.user.id);
      } catch (err) {
        console.error('Error updating profile in Supabase:', err);
      }
    }

    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...data };
      if (!isSupabaseEnabled) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      }
      return { ...s, user: updated };
    });
  }, [state.user]);

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
