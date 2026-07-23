import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import Button from '../components/ui/Button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Redefinir Senha — Nextia';
  }, []);

  const [tokenChecking, setTokenChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenChecking(false);
        setTokenValid(false);
        setTokenError('Link de redefinição inválido ou incompleto.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'Este link de redefinição é inválido ou já expirou.');
        }
      } catch {
        setTokenValid(false);
        setTokenError('Erro ao validar o link de redefinição.');
      } finally {
        setTokenChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A nova senha deve conter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">Nextia</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Redefinir senha</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Crie uma nova senha de acesso para sua conta.
          </p>

          {tokenChecking ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-[#5B4FE9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-gray-500 font-medium">Validando link de recuperação...</p>
            </div>
          ) : !tokenValid ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Link Expirado ou Inválido</h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                {tokenError || 'Não foi possível validar este link de redefinição de senha.'}
              </p>
              <Link to="/recuperar-senha">
                <Button variant="gradient" size="md" fullWidth>
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          ) : success ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Senha alterada com sucesso!</h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em instantes.
              </p>
              <Link to="/login">
                <Button variant="gradient" size="md" fullWidth>
                  Ir para o login agora
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-semibold animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nova senha
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
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

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            Sua conta protegida
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Após salvar a nova senha, você poderá acessar o painel com as novas credenciais.
          </p>
        </div>
      </div>
    </div>
  );
}
