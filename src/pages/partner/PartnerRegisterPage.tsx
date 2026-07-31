import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PartnerRegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 selection:bg-[#D4A853]/30">
        <div className="max-w-md w-full bg-[#111118] border border-white/10 rounded-3xl p-10 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Cadastro Enviado!</h2>
          <p className="text-gray-400 mb-8">
            Sua conta está em análise. Você receberá um email quando for aprovado e já poderá começar a indicar clientes.
          </p>
          <Link to="/parceiros" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors">
            Voltar para Parceiros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col selection:bg-[#D4A853]/30">
      <header className="p-6">
        <Link to="/parceiros" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4A853] to-[#A37E35] rounded-xl flex items-center justify-center">
                <span className="font-bold text-white text-xl">N</span>
              </div>
              <span className="font-bold text-2xl tracking-wide">Nextia<span className="text-[#D4A853]">Partner</span></span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Crie sua Conta</h1>
            <p className="text-gray-400">Preencha os dados abaixo para se tornar um parceiro.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#111118] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input required type="text" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors" placeholder="João da Silva" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input required type="email" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors" placeholder="joao@exemplo.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input required type="text" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">CPF ou CNPJ</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input required type="text" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors" placeholder="000.000.000-00" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Como conheceu a Nextia?</label>
                <select required className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors appearance-none text-gray-300">
                  <option value="">Selecione...</option>
                  <option value="google">Google</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicacao">Indicação de amigo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Experiência com vendas (Opcional)</label>
                <textarea 
                  rows={3} 
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-colors resize-none" 
                  placeholder="Conte-nos um pouco sobre sua experiência com vendas ou marketing..."
                ></textarea>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input required type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded bg-[#0A0A0F] border-white/20 text-[#D4A853] focus:ring-[#D4A853] focus:ring-offset-[#111118]" />
                <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                  Concordo com os <a href="#" className="text-[#D4A853] hover:underline">Termos e Condições</a> e a <a href="#" className="text-[#D4A853] hover:underline">Política de Privacidade</a> do programa de parceiros da Nextia.
                </label>
              </div>

              <button type="submit" className="w-full bg-[#D4A853] text-[#0A0A0F] font-bold py-4 rounded-xl hover:bg-[#A37E35] transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] mt-4">
                Criar Minha Conta de Parceiro
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Já é parceiro? <Link to="/login" className="text-[#D4A853] hover:underline font-medium">Faça login</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
