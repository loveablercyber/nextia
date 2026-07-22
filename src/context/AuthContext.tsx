import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState, User } from '../types/auth';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseAuthResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erro de autenticação.');
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await parseAuthResponse(
          await fetch('/api/auth/me', { credentials: 'include' }),
        );
        setState({ user: data.user || null, loading: false, error: null });
      } catch {
        setState({ user: null, loading: false, error: null });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const data = await parseAuthResponse(
        await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }),
      );

      const user = data.user as User;
      setState({ user, loading: false, error: null });
      return { error: null, user };
    } catch (err: any) {
      const message = err.message || 'Ocorreu um erro ao fazer login.';
      setState((current) => ({ ...current, loading: false, error: message }));
      return { error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setState({ user: null, loading: false, error: null });
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setState((current) => {
      if (!current.user) return current;
      return { ...current, user: { ...current.user, ...data } };
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
