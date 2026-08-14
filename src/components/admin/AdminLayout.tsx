import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, CreditCard,
  Zap, Menu, ChevronRight, Bell, ExternalLink,
  FileText, Briefcase, HelpCircle, UserCog, Database, DollarSign, FolderOpen, BarChart3, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavGroup {
  title?: string;
  items: {
    to: string;
    icon: React.ElementType;
    label: string;
    exact?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Visão Geral', exact: true },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { to: '/admin/pedidos', icon: Briefcase, label: 'Pedidos e Assinaturas' },
      { to: '/admin/orcamentos', icon: FileText, label: 'Orçamentos (Quotes)' },
      { to: '/admin/catalogo', icon: FileText, label: 'Catálogo Comercial' },
      { to: '/admin/planos', icon: CreditCard, label: 'Planos Digitais' },
    ],
  },
  {
    title: 'Projetos & Clientes',
    items: [
      { to: '/admin/clientes', icon: Users, label: 'Gerenciar Clientes' },
      { to: '/admin/usuarios/novo', icon: UserCog, label: 'Cadastrar Usuário' },
      { to: '/admin/projetos', icon: Briefcase, label: 'Gerenciar Projetos' },
      { to: '/admin/solicitacoes', icon: MessageSquare, label: 'Solicitações' },
    ],
  },
  {
    title: 'Técnico',
    items: [
      { to: '/admin/servicos-tecnicos', icon: Briefcase, label: 'Serviços Técnicos' },
      { to: '/admin/tecnicos', icon: UserCog, label: 'Técnicos' },
      { to: '/admin/recursos-tecnicos', icon: FolderOpen, label: 'Recursos Técnicos' },
      { to: '/admin/indicadores-tecnicos', icon: BarChart3, label: 'Indicadores Técnicos' },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { to: '/admin/suporte', icon: HelpCircle, label: 'Suporte / Tickets' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/admin/pagamentos', icon: CreditCard, label: 'Financeiro / Faturas' },
    ],
  },
  {
    title: 'Parceiros',
    items: [
      { to: '/admin/parceiros', icon: Users, label: 'Parceiros', exact: true },
      { to: '/admin/parceiros/comissoes', icon: DollarSign, label: 'Comissões Parceiros' },
      { to: '/admin/parceiros/materiais', icon: FolderOpen, label: 'Materiais Parceiros' },
    ],
  },
  {
    title: 'Governança & Operações',
    items: [
      { to: '/admin/servicos-contratados', icon: Briefcase, label: 'Serviços Contratados' },
      { to: '/admin/dominios', icon: Database, label: 'Gestor de Domínios' },
      { to: '/admin/integridade-dados', icon: Database, label: 'Fila de Integridade' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/admin/backup', icon: Database, label: 'Backup & Restauração' },
    ],
  },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Track collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
  };

  const sidebar = (
    <aside className="flex flex-col h-full bg-[#111827] text-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-black text-white">Nextia</span>
        <span className="ml-auto text-[10px] font-bold text-white bg-pink-600 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatarInitials || 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{user?.name || 'Administrador'}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email || 'admin@nextia.com.br'}</div>
          </div>
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group, idx) => {
          const isCollapsed = group.title ? Boolean(collapsedGroups[group.title]) : false;
          return (
            <div key={group.title || idx} className="space-y-1">
              {group.title && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title!)}
                  className="flex items-center justify-between w-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <span>{group.title}</span>
                  <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', isCollapsed && '-rotate-90')} />
                </button>
              )}
              {!isCollapsed && (
                <div className="space-y-1">
                  {group.items.map(({ to, icon: Icon, label, exact }) => {
                    const active = isActive(to, exact);
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#db2777]/20 border-l-4 border-pink-500 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{label}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-pink-500" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Voltar ao Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <Zap className="w-4 h-4 rotate-180" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] flex text-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-800">
        {sidebar}
      </div>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-xs flex-1 z-10">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-800 bg-[#111827] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white truncate">{title || 'Painel de Administração'}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#161e2e] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Notificações</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-pink-400 hover:underline">
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-800">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-gray-400 text-center">Nenhuma notificação</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={clsx('p-3 text-xs flex justify-between gap-2', !n.read && 'bg-purple-950/20')}>
                          <div>
                            <div className="font-bold text-gray-200">{n.title}</div>
                            <div className="text-gray-400 mt-0.5">{n.message}</div>
                          </div>
                          <button onClick={() => deleteNotification(n.id)} className="text-gray-500 hover:text-gray-300">
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Modo Administrador
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
