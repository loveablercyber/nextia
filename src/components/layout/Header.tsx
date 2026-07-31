import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import Button from '../ui/Button';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Sites Prontos', href: '/sites-prontos' },
  { label: 'Planos', href: '/planos' },
  { label: 'Como Funciona', href: '/como-funciona' },
  { label: 'Seja um Parceiro', href: '/parceiros' },
  { label: 'Projeto Personalizado', href: '/projeto-personalizado' },
  { label: 'Contato', href: '/contato' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  }, [location]);

  const headerClass = clsx(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    isHomePage && !scrolled
      ? 'bg-transparent'
      : 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
  );

  const textClass = clsx(
    'text-sm font-medium transition-colors duration-200',
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className={logoTextClass}>Nextia</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={clsx(
                    textClass,
                    location.pathname === link.href && '!text-[#5B4FE9] font-semibold'
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
                  <Link to="/cadastro">
                    <Button variant="gradient" size="md">
                      Contratar agora
                    </Button>
                  </Link>
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
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-gray-900">Nextia</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={clsx(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-[#eef2ff] text-[#5B4FE9]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {link.label}
                </Link>
              ))}
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
                  <Link to="/cadastro">
                    <Button variant="gradient" fullWidth size="lg">Contratar agora</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
