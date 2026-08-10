import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Entrar — Nextia';
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/painel';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      let targetPath = from;
      if (from === '/painel' && res.user?.role === 'admin') {
        targetPath = '/admin';
      } else if (from === '/painel' && res.user?.role === 'partner') {
        targetPath = '/parceiro';
      } else if (from === '/painel' && res.user?.role === 'technician') {
        targetPath = '/tecnico';
      }
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">Nextia</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-500 mb-8">
            Entre na sua conta para acompanhar seu projeto.
          </p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com.br"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <Link to="/recuperar-senha" className="text-xs text-[#5B4FE9] hover:underline">Esqueci minha senha</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading}>
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-[#5B4FE9] font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            Acompanhe seu projeto em tempo real
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            No painel do cliente você acompanha cada etapa, envia materiais, aprova o resultado e gerencia sua assinatura.
          </p>
          <div className="space-y-3 text-left">
            {[
              'Acompanhe o status do seu site',
              'Envie arquivos e materiais',
              'Aprove versões e etapas',
              'Abra solicitações de alteração',
              'Gerencie plano e pagamentos',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#5B4FE9] flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
