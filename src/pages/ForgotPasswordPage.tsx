import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  useEffect(() => {
    document.title = 'Recuperar Senha — Nextia';
  }, []);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar recuperação de senha.');
      }

      setSuccess(true);
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
          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#5B4FE9] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">Nextia</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Recuperar senha</h1>
          <p className="text-gray-500 mb-8 text-sm">
            Informe o e-mail cadastrado em sua conta para receber o link de redefinição de senha.
          </p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Instruções enviadas!</h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Se o e-mail <strong>{email}</strong> estiver cadastrado em nossa plataforma, você receberá um e-mail com as instruções para redefinir sua senha.
              </p>
              <Link to="/login">
                <Button variant="gradient" size="md" fullWidth>
                  Ir para a página de login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com.br"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading}>
                {loading ? 'Enviando...' : 'Enviar instruções'}
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
            Segurança da sua conta
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            O link de redefinição de senha possui validade de 1 hora por motivos de segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
