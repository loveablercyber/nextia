import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Trophy,
  Copy,
  MessageCircle, // Using as WhatsApp approx
  Share2
} from 'lucide-react';
import { usePartner } from '../../context/PartnerContext';
import { PARTNER_GOALS } from '../../types/partner';
import { useNavigate } from 'react-router-dom';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const { state } = usePartner();
  const { profile, commissions = [], withdrawals = [] } = state;

  if (!profile) return null;

  const referralLink = `${window.location.origin}/ref/${profile.referralCode}`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copiado para a área de transferência!');
  };

  const whatsappMessage = encodeURIComponent(`Conheça a Nextia, a melhor plataforma para o seu negócio! Use meu link para condições especiais: ${referralLink}`);
  
  // Find current goal
  const currentGoalIndex = PARTNER_GOALS.findIndex(g => g.clients > profile.activeReferrals);
  const nextGoal = currentGoalIndex !== -1 ? PARTNER_GOALS[currentGoalIndex] : PARTNER_GOALS[PARTNER_GOALS.length - 1];
  const progressPercent = Math.min(100, Math.max(0, (profile.activeReferrals / nextGoal.clients) * 100));

  const estimatedMonthlyCommission = commissions
    .filter(c => c.status === 'confirmado' || c.status === 'pendente')
    .reduce((sum, c) => sum + Number(c.commissionValue), 0);

  const activityHistory = [
    ...commissions.map(c => ({
      id: `c-${c.id}`,
      type: 'commission',
      date: c.createdAt,
      title: 'Nova Comissão',
      description: c.clientName,
      value: c.commissionValue,
      isPositive: true,
    })),
    ...withdrawals.map(w => ({
      id: `w-${w.id}`,
      type: 'withdrawal',
      date: w.requestedAt,
      title: 'Saque',
      description: 'Transferência PIX',
      value: w.amount,
      isPositive: false,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Olá, {profile.name.split(' ')[0]} 👋</h2>
        <p className="text-gray-400">Aqui está o resumo do seu desempenho como parceiro.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Clientes Indicados</p>
              <h3 className="text-3xl font-bold text-white">{profile.totalReferrals}</h3>
            </div>
            <div className="p-3 bg-white/5 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Clientes Ativos</p>
              <h3 className="text-3xl font-bold text-emerald-400">{profile.activeReferrals}</h3>
            </div>
            <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111118] border border-[#D4A853]/30 rounded-2xl p-6 hover:border-[#D4A853]/50 transition-colors group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-[#D4A853]/80 text-sm font-medium mb-1">Comissão Mensal (Est.)</p>
              <h3 className="text-3xl font-bold text-[#D4A853]">{formatCurrency(estimatedMonthlyCommission)}</h3>
            </div>
            <div className="p-3 bg-[#D4A853]/10 rounded-xl text-[#D4A853] group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Recebido</p>
              <h3 className="text-3xl font-bold text-[#D4A853]">{formatCurrency(profile.totalCommission)}</h3>
            </div>
            <div className="p-3 bg-[#D4A853]/10 rounded-xl text-[#D4A853] group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Saldo Disponível</p>
              <h3 className="text-3xl font-bold text-emerald-400">{formatCurrency(profile.availableBalance)}</h3>
            </div>
            <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Posição no Ranking</p>
              <h3 className="text-3xl font-bold text-[#D4A853]">#{profile.rankingPosition}</h3>
            </div>
            <div className="p-3 bg-[#D4A853]/10 rounded-xl text-[#D4A853] group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Link & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link Card */}
          <div className="bg-gradient-to-br from-[#111118] to-[#1a1a24] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A853]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <h3 className="text-xl font-bold text-white mb-2 relative">Seu Link Exclusivo</h3>
            <p className="text-gray-400 mb-6 relative">Compartilhe este link e ganhe 25% de comissão recorrente sobre as assinaturas.</p>
            
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2 pl-4 mb-6 relative">
              <span className="flex-1 text-gray-300 font-mono truncate">{referralLink}</span>
              <button 
                onClick={handleCopyLink}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <Copy size={18} />
                Copiar
              </button>
            </div>

            <div className="flex flex-wrap gap-3 relative">
              <a 
                href={`https://wa.me/?text=${whatsappMessage}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-4 py-2 rounded-xl transition-colors font-medium border border-[#25D366]/20"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
              <button 
                onClick={() => window.open('https://www.instagram.com/', '_blank')}
                className="flex items-center gap-2 bg-[#E1306C]/20 hover:bg-[#E1306C]/30 text-[#E1306C] px-4 py-2 rounded-xl transition-colors font-medium border border-[#E1306C]/20"
              >
                <Share2 size={18} />
                Instagram
              </button>
              <button 
                onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=nextia.dev.br', '_blank')}
                className="flex items-center gap-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#428cf4] px-4 py-2 rounded-xl transition-colors font-medium border border-[#1877F2]/20"
              >
                <Share2 size={18} />
                Facebook
              </button>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-[#111118] border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Próxima Meta</h3>
                <p className="text-gray-400">Atingir {nextGoal.clients} clientes ativos</p>
              </div>
              <div className="text-right">
                <p className="text-[#D4A853] font-bold text-xl">Bônus: {formatCurrency(nextGoal.bonus)}</p>
              </div>
            </div>

            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4A853]/60 to-[#D4A853] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>{profile.activeReferrals} ativos</span>
              <span>Faltam {nextGoal.clients - profile.activeReferrals} clientes</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="bg-[#111118] border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Atividade Recente</h3>
          
          {activityHistory.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
              {activityHistory.map((activity) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#111118] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${activity.type === 'commission' ? 'bg-[#D4A853]' : 'bg-blue-400'}`} />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 md:group-even:text-right md:group-odd:pl-4 md:group-even:pr-4 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between md:group-even:justify-end md:group-odd:justify-start gap-2 mb-1">
                      <span className="font-bold text-white">{activity.title}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {activity.description} - <span className={activity.type === 'commission' ? 'text-[#D4A853]' : 'text-white'}>
                        {formatCurrency(activity.value)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma atividade recente</p>
          )}
          
          <button 
            onClick={() => navigate('/parceiro/comissoes')}
            className="w-full mt-6 py-3 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Ver todo o histórico
          </button>
        </div>
      </div>
    </div>
  );
};
