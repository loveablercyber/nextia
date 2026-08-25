import { useEffect, useState } from 'react';
import { ChevronDown, Menu, X, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getWhatsAppLink } from '../../utils/whatsapp';

const groups = [
  { label: 'Digital', links: [['Sites profissionais', '/sites'], ['Sites prontos', '/sites-prontos'], ['Landing pages', '/landing-pages'], ['Lojas virtuais', '/lojas-virtuais'], ['Sistemas sob medida', '/sistemas']] },
  { label: 'Automação & IA', links: [['Automação e IA', '/automacao-ia'], ['Chatbots', '/chatbot'], ['Automação WhatsApp', '/automacao-whatsapp']] },
  { label: 'TechCare', links: [['Visão geral', '/techcare'], ['Suporte de TI', '/suporte-ti'], ['Suporte remoto', '/suporte-remoto'], ['Computadores', '/manutencao-computadores'], ['Notebooks', '/manutencao-notebooks']] },
  { label: 'Infraestrutura', links: [['Redes e Wi-Fi', '/redes-wifi'], ['Cabeamento', '/cabeamento'], ['Câmeras', '/cameras-seguranca'], ['Backup empresarial', '/backup']] },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const transparent = location.pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <>
    <header className={clsx('fixed inset-x-0 top-0 z-50 border-b transition-colors', transparent ? 'border-white/60 bg-white/75 text-[#10152B] backdrop-blur-xl' : 'border-slate-200 bg-white/95 text-[#10152B] backdrop-blur-md')}>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex min-h-11 items-center gap-2" aria-label="Nextia - início"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1677FF]"><Zap className="h-5 w-5 text-white" /></span><span className="text-2xl font-black">Nextia</span></Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
          {groups.map((group) => <div key={group.label} className="group relative">
            <button className="flex min-h-11 items-center gap-1 px-3 text-base font-semibold">{group.label}<ChevronDown className="h-4 w-4" /></button>
            <div className="invisible absolute left-0 top-full w-64 translate-y-1 border border-slate-200 bg-white p-2 text-[#07162B] opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {group.links.map(([label, to]) => <Link key={to} to={to} onClick={() => { setMobileOpen(false); setOpenGroup(null); }} className="block min-h-11 px-3 py-2.5 text-base font-semibold hover:bg-[#EAF3FF] hover:text-[#1677FF]">{label}</Link>)}
            </div>
          </div>)}
          <Link to="/solucoes" className="flex min-h-11 items-center px-3 text-base font-semibold">Soluções</Link>
          <Link to="/planos" className="flex min-h-11 items-center px-3 text-base font-semibold">Planos</Link>
          <Link to="/parceiros" className="flex min-h-11 items-center px-3 text-base font-semibold">Parceiros</Link>
          <Link to="/contato" className="flex min-h-11 items-center px-3 text-base font-semibold">Contato</Link>
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to={user ? '/painel' : '/login'} className="inline-flex min-h-11 items-center px-4 text-base font-bold">{user ? 'Meu painel' : 'Entrar'}</Link>
          <a href={getWhatsAppLink('geral')} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-gradient-to-r from-[#2563FF] to-[#753AFF] px-5 text-base font-bold text-white hover:opacity-90">Quero meu site</a>
        </div>
        <button onClick={() => setMobileOpen(true)} className="flex h-11 w-11 items-center justify-center xl:hidden" aria-label="Abrir menu"><Menu className="h-7 w-7" /></button>
      </div>
    </header>

    {mobileOpen && <div className="fixed inset-0 z-[60] xl:hidden">
      <button className="absolute inset-0 bg-[#07162B]/70" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white text-[#07162B] shadow-2xl">
        <div className="flex h-18 items-center justify-between border-b border-slate-200 px-5"><span className="text-2xl font-black">Nextia</span><button onClick={() => setMobileOpen(false)} className="flex h-11 w-11 items-center justify-center" aria-label="Fechar menu"><X className="h-7 w-7" /></button></div>
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Menu mobile">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center px-3 text-lg font-bold">Início</Link>
          {groups.map((group) => <div key={group.label} className="border-t border-slate-100">
            <button onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)} className="flex min-h-12 w-full items-center justify-between px-3 text-left text-lg font-bold" aria-expanded={openGroup === group.label}>{group.label}<ChevronDown className={clsx('h-5 w-5 transition-transform', openGroup === group.label && 'rotate-180')} /></button>
            {openGroup === group.label && <div className="mb-2 border-l-2 border-[#1677FF] pl-3">{group.links.map(([label, to]) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center px-3 text-lg text-slate-700">{label}</Link>)}</div>}
          </div>)}
          <Link to="/solucoes" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center border-t border-slate-100 px-3 text-lg font-bold">Soluções por Segmento</Link>
          <Link to="/planos" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center border-t border-slate-100 px-3 text-lg font-bold">Planos</Link>
          <Link to="/parceiros" className="flex min-h-12 items-center border-t border-slate-100 px-3 text-lg font-bold">Parceiros</Link>
          <Link to="/contato" className="flex min-h-12 items-center border-t border-slate-100 px-3 text-lg font-bold">Contato</Link>
        </nav>
        <div className="grid gap-3 border-t border-slate-200 p-5"><Link to={user ? '/painel' : '/login'} className="flex min-h-12 items-center justify-center rounded-lg border border-slate-300 text-lg font-bold">{user ? 'Meu painel' : 'Entrar'}</Link><a href={getWhatsAppLink('geral')} className="flex min-h-12 items-center justify-center rounded-lg bg-[#1677FF] text-lg font-bold text-white">Solicitar atendimento</a></div>
      </aside>
    </div>}
  </>;
}
