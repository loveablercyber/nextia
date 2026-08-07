import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, ChevronDown, ShieldCheck, Wifi } from 'lucide-react';
import Button from '../ui/Button';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getWhatsAppLink } from '../../utils/whatsapp';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [redesDropdown, setRedesDropdown] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setRedesDropdown(false);
  }, [location]);

  const headerClass = clsx(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isHomePage && !scrolled
      ? 'bg-transparent'
      : 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
  );

  const textClass = clsx(
    'text-sm font-medium transition-colors duration-200 flex items-center gap-1',
    isHomePage && !scrolled
      ? 'text-white/90 hover:text-white'
      : 'text-gray-600 hover:text-[#5B4FE9]'
  );

  const logoTextClass = clsx(
    'text-xl font-black tracking-tight transition-colors duration-200',
    isHomePage && !scrolled ? 'text-white' : 'text-gray-900'
  );

  return (
    <>
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2086FF] to-[#7C5CFF] flex items-center justify-center shadow-md shadow-[#2086FF]/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className={logoTextClass}>Nextia</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-5">
              <Link to="/" className={clsx(textClass, location.pathname === '/' && '!text-[#2086FF] font-bold')}>
                Início
              </Link>
              <Link to="/sites-prontos" className={clsx(textClass, location.pathname === '/sites-prontos' && '!text-[#2086FF] font-bold')}>
                Sites
              </Link>
              <Link to="/automacao-ia" className={clsx(textClass, location.pathname === '/automacao-ia' && '!text-[#7C5CFF] font-bold')}>
                Automação & IA
              </Link>
              <Link to="/techcare" className={clsx(textClass, location.pathname === '/techcare' && '!text-[#FF9D2E] font-bold')}>
                TechCare
              </Link>

              {/* Redes & Câmeras Dropdown */}
              <div className="relative" onMouseEnter={() => setRedesDropdown(true)} onMouseLeave={() => setRedesDropdown(false)}>
                <button className={clsx(textClass, (location.pathname === '/redes-wifi' || location.pathname === '/cameras-seguranca') && '!text-[#21C77A] font-bold')}>
                  <span>Redes & Câmeras</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {redesDropdown && (
                  <div className="absolute top-full left-0 w-60 pt-2 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-1">
                      <Link to="/redes-wifi" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <Wifi className="w-4 h-4 text-[#21C77A]" />
                        <div>
                          <p className="font-semibold leading-tight">Redes & Wi-Fi</p>
                          <p className="text-xs text-gray-400">Infraestrutura estável</p>
                        </div>
                      </Link>
                      <Link to="/cameras-seguranca" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <ShieldCheck className="w-4 h-4 text-[#21C77A]" />
                        <div>
                          <p className="font-semibold leading-tight">Câmeras & Segurança</p>
                          <p className="text-xs text-gray-400">CFTV e monitoramento</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/planos" className={clsx(textClass, location.pathname === '/planos' && '!text-[#2086FF] font-bold')}>
                Planos
              </Link>
              <Link to="/solucoes" className={clsx(textClass, location.pathname === '/solucoes' && '!text-[#2086FF] font-bold')}>
                Soluções
              </Link>
              <Link to="/contato" className={clsx(textClass, location.pathname === '/contato' && '!text-[#2086FF] font-bold')}>
                Contato
              </Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <Link to="/painel">
                  <Button variant="gradient" size="md">
                    Painel do Cliente
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <button className={clsx(textClass, 'px-3 py-2 rounded-lg')}>
                      Entrar
                    </button>
                  </Link>
                  <a href={getWhatsAppLink('geral')} target="_blank" rel="noopener noreferrer">
                    <Button variant="gradient" size="md">
                      Solicitar Atendimento
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className={clsx('lg:hidden p-2 rounded-lg transition-colors', isHomePage && !scrolled ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100')}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2086FF] to-[#7C5CFF] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-gray-900">Nextia</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
              <Link to="/" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Início
              </Link>
              <Link to="/sites-prontos" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Sites Profissionais
              </Link>
              <Link to="/automacao-ia" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Automação & IA
              </Link>
              <Link to="/techcare" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                TechCare (Suporte TI)
              </Link>
              <div className="pl-4 border-l-2 border-emerald-400 my-1 space-y-1">
                <Link to="/redes-wifi" className="block px-3 py-2 text-xs font-medium text-gray-600 hover:text-emerald-600">
                  • Redes & Wi-Fi
                </Link>
                <Link to="/cameras-seguranca" className="block px-3 py-2 text-xs font-medium text-gray-600 hover:text-emerald-600">
                  • Câmeras & Segurança
                </Link>
              </div>
              <Link to="/planos" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Planos
              </Link>
              <Link to="/solucoes" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Soluções por Segmento
              </Link>
              <Link to="/contato" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Contato
              </Link>
            </nav>
            <div className="p-4 border-t flex flex-col gap-2">
              {user ? (
                <Link to="/painel">
                  <Button variant="gradient" fullWidth size="lg">Painel do Cliente</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" fullWidth size="lg">Entrar</Button>
                  </Link>
                  <a href={getWhatsAppLink('geral')} target="_blank" rel="noopener noreferrer">
                    <Button variant="gradient" fullWidth size="lg">Solicitar Atendimento</Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

