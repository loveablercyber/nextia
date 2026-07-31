import React, { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { PARTNER_LEVELS } from '../../types/partner';
import { Save, User, Mail, Phone, FileText, CreditCard, Key, Copy, Check } from 'lucide-react';

export default function PartnerProfilePage() {
  const { state, updateProfile } = usePartner();
  const { profile } = state;
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    whatsapp: profile?.whatsapp || '',
    cpfCnpj: profile?.cpfCnpj || '',
    pixKey: profile?.pixKey || '',
  });

  if (!profile) return null;

  const levelInfo = PARTNER_LEVELS[profile.level];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    alert('Perfil atualizado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Meu Perfil</h2>
        <p className="text-gray-400">Gerencie suas informações pessoais e configurações de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Overview */}
        <div className="space-y-6">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4A853]/20 to-[#111118] border-4 border-[#D4A853] flex items-center justify-center text-5xl font-bold text-[#D4A853] mb-4 shadow-[0_0_20px_rgba(212,168,83,0.3)]">
              {profile.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
            
            <div className="flex items-center gap-2 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-sm text-gray-400">Nível Atual:</span>
              <span className="font-bold" style={{ color: levelInfo.color }}>{levelInfo.label}</span>
              <span>{levelInfo.icon}</span>
            </div>

            <div className="w-full text-left">
              <label className="block text-sm font-medium text-gray-400 mb-2">Seu Código de Indicação</label>
              <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-3">
                <code className="text-[#D4A853] flex-1 font-mono">{profile.referralCode}</code>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">CPF / CNPJ</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-6 pt-6 border-t border-white/5">Dados Bancários (Para Comissões)</h3>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">Chave PIX</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  name="pixKey"
                  value={formData.pixKey}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Esta chave será usada para o pagamento das suas comissões.</p>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#D4A853] text-[#0A0A0F] font-bold px-6 py-3 rounded-xl hover:bg-[#A37E35] transition-colors"
              >
                <Save size={20} />
                Salvar Alterações
              </button>
            </div>
          </form>

          <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Alterar Senha</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha Atual</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="password" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-white/10 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                Atualizar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
