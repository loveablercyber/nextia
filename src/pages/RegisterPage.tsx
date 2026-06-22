import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { templates } from '../data/templates';

export default function RegisterPage() {
  useEffect(() => {
    document.title = 'Criar conta — Nextia';
  }, []);

  const [searchParams] = useSearchParams();
  const templateSlug = searchParams.get('template');
  const selectedTemplate = templates.find(t => t.slug === templateSlug);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', password: '', confirmPassword: '',
    terms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated register — Fase 3 integra Supabase
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-96 bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] items-center justify-center p-12 flex-shrink-0">
        <div className="max-w-xs text-center">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">Nextia</span>
          </Link>
          <h2 className="text-2xl font-black text-white mb-4">
            Seu site profissional começa aqui
          </h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Crie sua conta e tenha sua presença digital profissional com suporte contínuo.
          </p>
          {[
            'Site profissional em até 5 dias',
            'Suporte dedicado incluído',
            'Hospedagem + SSL gratuitos',
            'Painel completo de gestão',
          ].map(item => (
            <div key={item} className="flex items-center gap-3 mb-2 text-left">
              <CheckCircle className="w-4 h-4 text-[#5B4FE9] flex-shrink-0" />
              <span className="text-gray-300 text-sm">{item}</span>
            </div>
          ))}

          {selectedTemplate && (
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Modelo selecionado</div>
              <div className="text-white font-bold">{selectedTemplate.name}</div>
              <div className="text-[#818cf8] text-sm">R$ {selectedTemplate.price}/mês</div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">Nextia</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-500 mb-8">
            Preencha seus dados para começar.
          </p>

          {selectedTemplate && (
            <div className="mb-6 p-3 bg-[#eef2ff] border border-[#c7d2fe] rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5B4FE9] flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Modelo selecionado</div>
                <div className="text-[#5B4FE9] font-bold text-sm">{selectedTemplate.name}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome completo *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="João Silva"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  WhatsApp *
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-company" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nome do negócio / Empresa
              </label>
              <input
                id="reg-company"
                type="text"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="Restaurante Sabor & Arte"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                E-mail *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com.br"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Mín. 8 caracteres"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmar senha *
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                required
                checked={form.terms}
                onChange={e => setForm({ ...form, terms: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#5B4FE9] focus:ring-[#5B4FE9]"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                Concordo com os{' '}
                <a href="#" className="text-[#5B4FE9] hover:underline">Termos de uso</a>{' '}
                e a{' '}
                <a href="#" className="text-[#5B4FE9] hover:underline">Política de privacidade</a> da Nextia.
              </label>
            </div>

            <Button type="submit" variant="gradient" size="lg" fullWidth loading={loading}>
              {loading ? 'Criando conta...' : 'Criar minha conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#5B4FE9] font-semibold hover:underline">
              Entrar
            </Link>
          </p>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              ⚠️ Cadastro simulado — integração com Supabase na Fase 3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
