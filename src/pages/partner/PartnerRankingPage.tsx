import { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { Trophy, Users } from 'lucide-react';
import { PARTNER_LEVELS } from '../../types/partner';

export default function PartnerRankingPage() {
  const { state } = usePartner();
  const { ranking, profile } = state;
  const [activeTab, setActiveTab] = useState<'mensal' | 'anual' | 'geral'>('geral');

  if (!profile) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', style: 'currency', currency: 'BRL' }).format(value);
  };

  // Sort ranking (assuming already sorted, but just in case)
  const sortedRanking = [...ranking].sort((a, b) => b.totalCommission - a.totalCommission);
  const top3 = sortedRanking.slice(0, 3);
  const restOfRanking = sortedRanking.slice(3);

  const getPodiumStyle = (index: number) => {
    if (index === 0) return { h: 'h-64', border: 'border-[#FFD700]', bg: 'bg-[#FFD700]/10', badge: '🥇', label: '1º Lugar' };
    if (index === 1) return { h: 'h-52', border: 'border-[#C0C0C0]', bg: 'bg-[#C0C0C0]/10', badge: '🥈', label: '2º Lugar' };
    return { h: 'h-44', border: 'border-[#CD7F32]', bg: 'bg-[#CD7F32]/10', badge: '🥉', label: '3º Lugar' };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-[#D4A853]" size={32} /> Ranking de Parceiros
          </h2>
          <p className="text-gray-400">Os parceiros com melhor desempenho na plataforma.</p>
        </div>
        
        <div className="flex bg-[#111118] border border-white/10 rounded-xl p-1">
          {(['mensal', 'anual', 'geral'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="pt-12 pb-8 px-4 flex justify-center items-end gap-2 md:gap-6">
        {/* 2nd Place */}
        {top3[1] && (
          <div className={`w-1/3 max-w-[200px] flex flex-col items-center relative ${getPodiumStyle(1).h}`}>
            <div className={`w-16 h-16 rounded-full bg-[#111118] border-2 ${getPodiumStyle(1).border} flex items-center justify-center text-xl font-bold text-white shadow-lg z-10 -mb-8 bg-center bg-cover`}>
              {top3[1].name.substring(0, 2).toUpperCase()}
            </div>
            <div className={`w-full flex-1 rounded-t-2xl border-t border-l border-r ${getPodiumStyle(1).border} ${getPodiumStyle(1).bg} backdrop-blur-sm flex flex-col items-center pt-10 pb-4 px-2`}>
              <span className="text-2xl mb-1">{getPodiumStyle(1).badge}</span>
              <p className="font-bold text-white text-center text-sm md:text-base line-clamp-1">{top3[1].name}</p>
              <p className="text-gray-400 text-xs mt-1">{top3[1].activeReferrals} clientes</p>
              <p className="text-[#C0C0C0] font-bold mt-auto text-sm">{formatCurrency(top3[1].totalCommission)}</p>
            </div>
          </div>
        )}
        
        {/* 1st Place */}
        {top3[0] && (
          <div className={`w-1/3 max-w-[220px] flex flex-col items-center relative ${getPodiumStyle(0).h}`}>
            <div className="absolute -top-12 text-4xl animate-bounce">👑</div>
            <div className={`w-20 h-20 rounded-full bg-[#111118] border-4 ${getPodiumStyle(0).border} flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_30px_rgba(255,215,0,0.3)] z-10 -mb-10 bg-center bg-cover`}>
              {top3[0].name.substring(0, 2).toUpperCase()}
            </div>
            <div className={`w-full flex-1 rounded-t-2xl border-t border-l border-r ${getPodiumStyle(0).border} ${getPodiumStyle(0).bg} backdrop-blur-sm flex flex-col items-center pt-12 pb-4 px-2`}>
              <span className="text-3xl mb-1">{getPodiumStyle(0).badge}</span>
              <p className="font-bold text-white text-center text-base md:text-lg line-clamp-1">{top3[0].name}</p>
              <p className="text-gray-400 text-xs mt-1">{top3[0].activeReferrals} clientes</p>
              <p className="text-[#FFD700] font-bold mt-auto text-base">{formatCurrency(top3[0].totalCommission)}</p>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className={`w-1/3 max-w-[200px] flex flex-col items-center relative ${getPodiumStyle(2).h}`}>
            <div className={`w-16 h-16 rounded-full bg-[#111118] border-2 ${getPodiumStyle(2).border} flex items-center justify-center text-xl font-bold text-white shadow-lg z-10 -mb-8 bg-center bg-cover`}>
              {top3[2].name.substring(0, 2).toUpperCase()}
            </div>
            <div className={`w-full flex-1 rounded-t-2xl border-t border-l border-r ${getPodiumStyle(2).border} ${getPodiumStyle(2).bg} backdrop-blur-sm flex flex-col items-center pt-10 pb-4 px-2`}>
              <span className="text-2xl mb-1">{getPodiumStyle(2).badge}</span>
              <p className="font-bold text-white text-center text-sm md:text-base line-clamp-1">{top3[2].name}</p>
              <p className="text-gray-400 text-xs mt-1">{top3[2].activeReferrals} clientes</p>
              <p className="text-[#CD7F32] font-bold mt-auto text-sm">{formatCurrency(top3[2].totalCommission)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the List */}
      <div className="bg-[#111118] border border-white/10 rounded-3xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {restOfRanking.map((partner, index) => {
            const position = index + 4;
            const isMe = partner.id === profile.id;
            const levelInfo = PARTNER_LEVELS[partner.level];
            
            return (
              <div 
                key={partner.id} 
                className={`p-4 md:p-6 flex items-center gap-4 transition-colors ${
                  isMe ? 'bg-[#D4A853]/5 border-l-4 border-l-[#D4A853]' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 md:w-12 text-center font-bold text-gray-500 text-lg md:text-xl">
                  {position}º
                </div>
                
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-sm md:text-base font-bold text-white shrink-0">
                  {partner.name.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold truncate text-base md:text-lg ${isMe ? 'text-[#D4A853]' : 'text-white'}`}>
                      {partner.name} {isMe && '(Você)'}
                    </p>
                    <span 
                      className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={{ color: levelInfo.color, borderColor: `${levelInfo.color}30`, backgroundColor: `${levelInfo.color}10` }}
                    >
                      {levelInfo.icon} {levelInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs md:text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Users size={14} /> {partner.activeReferrals} clientes</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-white text-sm md:text-base">{formatCurrency(partner.totalCommission)}</p>
                  <p className="text-xs text-gray-500 hidden md:block">comissões totais</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
