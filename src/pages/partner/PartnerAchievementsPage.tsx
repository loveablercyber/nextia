import { usePartner } from '../../context/PartnerContext';
import { PARTNER_LEVELS, PARTNER_GOALS } from '../../types/partner';
import type { PartnerLevel } from '../../types/partner';
import { Trophy, Target, Award, CheckCircle2, Lock } from 'lucide-react';

export default function PartnerAchievementsPage() {
  const { state } = usePartner();
  const { profile, achievements } = state;

  if (!profile) return null;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Conquistas e Metas</h2>
        <p className="text-gray-400">Acompanhe seu progresso e desbloqueie novas recompensas.</p>
      </div>

      {/* Níveis de Parceiro */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-[#D4A853] w-6 h-6" />
          <h3 className="text-xl font-bold text-white">Níveis de Parceiro</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(Object.entries(PARTNER_LEVELS) as [PartnerLevel, typeof PARTNER_LEVELS[PartnerLevel]][]).map(([levelKey, level]) => {
            const isCurrent = profile.level === levelKey;
            
            return (
              <div 
                key={levelKey}
                className={`relative p-6 rounded-2xl flex flex-col items-center text-center transition-all ${
                  isCurrent 
                    ? 'bg-gradient-to-b from-[#D4A853]/20 to-[#111118] border-2 border-[#D4A853] shadow-[0_0_15px_rgba(212,168,83,0.3)]' 
                    : 'bg-[#111118] border border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 px-3 py-1 bg-[#D4A853] text-[#0A0A0F] text-xs font-bold rounded-full">
                    Seu Nível
                  </div>
                )}
                <span className="text-4xl mb-3">{level.icon}</span>
                <h4 className="font-bold text-lg mb-1" style={{ color: level.color }}>{level.label}</h4>
                <p className="text-sm text-gray-400 mt-auto">
                  {level.max === Infinity ? `${level.min}+` : `${level.min} a ${level.max}`} Clientes
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metas e Bonificações */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-[#D4A853] w-6 h-6" />
          <h3 className="text-xl font-bold text-white">Metas de Bonificação</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNER_GOALS.map((goal, index) => {
            const progress = Math.min((profile.activeReferrals / goal.clients) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={index} className="bg-[#111118] border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-white">Atingir {goal.clients} Clientes</h4>
                    <p className="text-[#D4A853] font-semibold">Bônus: R$ {goal.bonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-gray-400">
                      {Math.floor(progress)}%
                    </div>
                  )}
                </div>
                
                <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4A853] to-[#A37E35] transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <p className="text-sm text-gray-400 mt-3">
                  Progresso: {profile.activeReferrals} / {goal.clients} clientes ativos
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conquistas */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="text-[#D4A853] w-6 h-6" />
          <h3 className="text-xl font-bold text-white">Suas Conquistas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-6 rounded-2xl border transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-[#111118] to-[#D4A853]/10 border-[#D4A853]/30 shadow-[0_4px_20px_rgba(212,168,83,0.1)]' 
                  : 'bg-[#111118] border-white/5 grayscale opacity-50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-2xl mb-4 relative">
                {achievement.icon}
                {!achievement.unlocked && (
                  <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1 border-2 border-[#111118]">
                    <Lock className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
              <h4 className="font-bold text-white mb-2">{achievement.title}</h4>
              <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
              
              {achievement.unlocked ? (
                <p className="text-xs text-[#D4A853] font-medium mt-auto">
                  Desbloqueado em {new Date(achievement.unlockedAt!).toLocaleDateString('pt-BR')}
                </p>
              ) : (
                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden mt-auto">
                  <div className="h-full bg-gray-600 w-1/3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
