import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, CreditCard,
  LogOut, Zap, Menu, ChevronRight, Bell, ExternalLink,
  FileText, Briefcase, HelpCircle, UserCog
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Visão Geral', exact: true },
  { to: '/admin/clientes', icon: Users, label: 'Gerenciar Clientes' },
  { to: '/admin/orcamentos', icon: FileText, label: 'Orçamentos (Quotes)' },
  { to: '/admin/projetos', icon: Briefcase, label: 'Gerenciar Projetos' },
  { to: '/admin/chamados', icon: MessageSquare, label: 'Solicitações' },
  { to: '/admin/suporte', icon: HelpCircle, label: 'Suporte / Tickets' },
  { to: '/admin/cobrancas', icon: CreditCard, label: 'Financeiro / Faturas' },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(to, exact)
                ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#db2777]/20 border-l-4 border-pink-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {isActive(to, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto text-pink-500" />}
          </Link>
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          to="/admin/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <UserCog className="w-4 h-4" />
          Meu Perfil
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Voltar ao Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair do Admin
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 flex-shrink-0 flex-col">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl z-10">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-4 px-4 sm:px-6 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            {title && (
              <h1 className="text-base font-bold text-gray-900">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={clsx(
                  "relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                  notifOpen ? "bg-pink-50 text-pink-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-sm">Notificações Admin</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-white bg-pink-500 px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                        >
                          Ler todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto px-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                          <p className="text-xs">Nenhuma notificação recebida.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={clsx(
                              "p-3 rounded-xl transition-all relative group flex gap-3",
                              notif.read ? "hover:bg-gray-50" : "bg-pink-50/20 hover:bg-pink-50/40"
                            )}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {notif.type === 'payment' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                              ) : notif.type === 'request' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                              ) : notif.type === 'project' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                              <h4 className={clsx("text-xs leading-snug truncate", notif.read ? "font-medium text-gray-700" : "font-bold text-gray-900")}>
                                {notif.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-gray-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notif.read && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  title="Marcar como lida"
                                  className="w-5 h-5 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:border-pink-100 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                title="Excluir"
                                className="w-5 h-5 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
