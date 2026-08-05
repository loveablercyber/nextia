import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'client' | 'admin' | 'partner';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" d="M13 2L4.5 12.5H12L11 22L19.5 11.5H12L13 2z" />
            </svg>
          </div>
          <div className="text-gray-400 text-sm">Verificando sessão...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user.role !== requireRole && user.role !== 'admin') {
    return <Navigate to={user.role === 'partner' ? '/parceiro' : '/painel'} replace />;
  }

  return <>{children}</>;
}
