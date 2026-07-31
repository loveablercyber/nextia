import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Wallet, 
  Trophy, 
  FolderOpen, 
  Award, 
  UserCircle, 
  ExternalLink, 
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { usePartner } from '../../context/PartnerContext';
import { PARTNER_LEVELS } from '../../types/partner';

export const PartnerLayout: React.FC = () => {
  const { state } = usePartner();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const partner = state.profile;
  const levelInfo = partner ? PARTNER_LEVELS[partner.level] : null;

  const navItems = [
    { to: '/partner', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/partner/referrals', icon: <Users size={20} />, label: 'Indicações' },
    { to: '/partner/commissions', icon: <DollarSign size={20} />, label: 'Comissões' },
    { to: '/partner/finance', icon: <Wallet size={20} />, label: 'Financeiro' },
    { to: '/partner/ranking', icon: <Trophy size={20} />, label: 'Ranking' },
    { to: '/partner/materials', icon: <FolderOpen size={20} />, label: 'Materiais' },
    { to: '/partner/achievements', icon: <Award size={20} />, label: 'Conquistas' },
    { to: '/partner/profile', icon: <UserCircle size={20} />, label: 'Perfil' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#111118] border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4A853] to-[#A37E35] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">N</span>
            </div>
            <span className="font-bold text-xl tracking-wide">Nextia<span className="text-[#D4A853]">Partner</span></span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={closeMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/partner'}
              onClick={closeMobileMenu}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-[#D4A853]/10 to-transparent text-[#D4A853] border-l-2 border-[#D4A853]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          <div className="my-6 border-t border-white/5 pt-6 space-y-1">
            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <ExternalLink size={20} />
              <span className="font-medium">Voltar ao Site</span>
            </a>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </nav>
        
        {/* User Mini Profile in Sidebar */}
        {partner && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 text-[#D4A853] flex items-center justify-center font-bold text-lg">
                {partner.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{partner.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: levelInfo?.color }}>{levelInfo?.icon} {levelInfo?.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#111118]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold hidden sm:block">Dashboard do Parceiro</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#111118] text-[9px] flex items-center justify-center font-bold">
                2
              </span>
            </button>
            
            {partner && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="text-sm text-gray-300">Nível:</span>
                <span className="text-sm font-bold" style={{ color: levelInfo?.color }}>
                  {levelInfo?.label}
                </span>
                <span className="text-base leading-none">{levelInfo?.icon}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
