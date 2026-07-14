import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, MessageSquare, CreditCard,
  Upload, Settings, LogOut, Zap, Menu, ChevronRight,
  Bell, ExternalLink, HelpCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { to: '/painel', icon: LayoutDashboard, label: 'Visão geral', exact: true },
  { to: '/painel/projeto', icon: FolderOpen, label: 'Meu projeto' },
  { to: '/painel/arquivos', icon: Upload, label: 'Arquivos' },
  { to: '/painel/alteracoes', icon: MessageSquare, label: 'Solicitações' },
  { to: '/painel/suporte', icon: HelpCircle, label: 'Suporte / Tickets' },
  { to: '/painel/pagamentos', icon: CreditCard, label: 'Pagamentos' },
  { to: '/painel/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
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
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-black text-gray-900">Nextia</span>
        <span className="ml-auto text-[10px] font-bold text-[#5B4FE9] bg-[#eef2ff] px-2 py-0.5 rounded-full">
          Cliente
        </span>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.company}</div>
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
                ? 'bg-[#eef2ff] text-[#5B4FE9]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {isActive(to, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-4 border-t border-gray-50 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Site da Nextia
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 flex-shrink-0 bg-white border-r border-gray-100 flex-col">
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
        <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-4 sm:px-6 flex-shrink-0">
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={clsx(
                  "relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                  notifOpen ? "bg-[#eef2ff] text-[#5B4FE9]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-sm">Notificações</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-white bg-[#5B4FE9] px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-[#5B4FE9] hover:text-[#4338CA] font-semibold transition-colors"
                        >
                          Ler todas
                        </button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto px-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                          <p className="text-xs">Nenhuma notificação por aqui.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={clsx(
                              "p-3 rounded-xl transition-all relative group flex gap-3",
                              notif.read ? "hover:bg-gray-50" : "bg-[#f8faff] hover:bg-[#f0f4ff]"
                            )}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {notif.type === 'payment' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                              ) : notif.type === 'request' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                              ) : notif.type === 'project' ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#5B4FE9] inline-block" />
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
                                  className="w-5 h-5 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#5B4FE9] hover:border-blue-100 transition-colors"
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
            <a
              href="https://wa.me/5514996405496"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Suporte
            </a>
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
