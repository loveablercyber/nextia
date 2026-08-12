import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState, User } from '../types/auth';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  register: (bodyData: any) => Promise<{ error: string | null; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null; user?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
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

  const register = useCallback(async (bodyData: any) => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const data = await parseAuthResponse(
        await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        }),
      );

      const user = data.user as User;
      if (user) {
        setState({ user, loading: false, error: null });
      } else {
        setState((current) => ({ ...current, loading: false }));
      }
      return { error: null, user };
    } catch (err: any) {
      const message = err.message || 'Ocorreu um erro ao criar sua conta.';
      setState((current) => ({ ...current, loading: false, error: message }));
      return { error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setState({ user: null, loading: false, error: null });
    window.location.replace('/login');
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await parseAuthResponse(response);
      const updatedUser = resData.user as User;

      setState((current) => ({
        ...current,
        user: updatedUser || (current.user ? { ...current.user, ...data } : null),
      }));

      return { error: null, user: updatedUser };
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar perfil.';
      setState((current) => {
        if (!current.user) return current;
        return { ...current, user: { ...current.user, ...data } };
      });
      return { error: message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await parseAuthResponse(
        await fetch('/api/auth/change-password', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        }),
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao alterar senha.' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
