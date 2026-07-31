import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Users, TrendingUp, DollarSign, Star, HelpCircle } from 'lucide-react';

export default function PartnerLandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-[#D4A853]/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4A853] to-[#A37E35] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">N</span>
            </div>
            <span className="font-bold text-xl tracking-wide">Nextia<span className="text-[#D4A853]">Partner</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
              Entrar
            </Link>
            <Link to="/parceiros/cadastro" className="bg-[#D4A853] text-[#0A0A0F] px-5 py-2.5 rounded-xl font-bold hover:bg-[#A37E35] transition-colors">
              Ser Parceiro
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4A853]/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Transforme Indicações em <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A853] to-[#F9D423]">
              Receita Recorrente
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se ao programa de parceiros da Nextia. Ganhe 25% de comissão recorrente por cada cliente indicado, todos os meses.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/parceiros/cadastro" className="w-full sm:w-auto bg-[#D4A853] text-[#0A0A0F] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#A37E35] transition-all hover:scale-105 flex items-center justify-center gap-2">
              Quero Ser Parceiro <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-black text-white mb-2">150+</div>
              <div className="text-gray-400 font-medium">Parceiros Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-black text-[#D4A853] mb-2">R$ 2.5M+</div>
              <div className="text-gray-400 font-medium">Em Comissões Pagas</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">25%</div>
              <div className="text-gray-400 font-medium">Comissão Recorrente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Um processo simples e transparente para você começar a faturar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#D4A853]/10 via-[#D4A853]/50 to-[#D4A853]/10" />
            
            <div className="relative z-10 bg-[#0A0A0F] border border-white/5 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4A853]/20 to-transparent border border-[#D4A853]/30 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Cadastre-se</h3>
              <p className="text-gray-400">Faça seu cadastro gratuito e receba acesso imediato ao seu painel exclusivo e materiais de divulgação.</p>
            </div>

            <div className="relative z-10 bg-[#0A0A0F] border border-white/5 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4A853]/20 to-transparent border border-[#D4A853]/30 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Compartilhe</h3>
              <p className="text-gray-400">Use seu link exclusivo para indicar clientes. Temos templates prontos para você usar nas redes sociais.</p>
            </div>

            <div className="relative z-10 bg-[#0A0A0F] border border-white/5 p-8 rounded-2xl text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4A853]/20 to-transparent border border-[#D4A853]/30 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Receba</h3>
              <p className="text-gray-400">Ganhe 25% de comissão todo mês enquanto o cliente estiver ativo. Saque direto para seu PIX.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela de Comissões */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simule Seus Ganhos</h2>
            <p className="text-gray-400">Você recebe 25% do valor da mensalidade de cada cliente.</p>
          </div>

          <div className="bg-[#111118] border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 font-bold text-lg">Plano do Cliente</th>
                  <th className="p-6 font-bold text-lg text-center">Mensalidade</th>
                  <th className="p-6 font-bold text-lg text-right text-[#D4A853]">Sua Comissão (Mês)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-medium">Plano Start</td>
                  <td className="p-6 text-center text-gray-400">R$ 59,90</td>
                  <td className="p-6 text-right font-bold text-[#D4A853]">R$ 14,97</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-medium">Plano Pro</td>
                  <td className="p-6 text-center text-gray-400">R$ 99,90</td>
                  <td className="p-6 text-right font-bold text-[#D4A853]">R$ 24,97</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-medium">Plano Business</td>
                  <td className="p-6 text-center text-gray-400">R$ 199,90</td>
                  <td className="p-6 text-right font-bold text-[#D4A853]">R$ 49,97</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Níveis e Bonificações */}
      <section className="py-20 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Níveis de Crescimento</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Alcance novos níveis e ganhe bônus extras em dinheiro ao bater metas de clientes ativos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0A0A0F] border border-[#CD7F32]/30 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🥉</div>
              <h3 className="text-xl font-bold text-[#CD7F32] mb-2">Bronze</h3>
              <p className="text-gray-400 text-sm mb-4">1 a 5 Clientes</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-[#CD7F32]" /> Painel Exclusivo</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-[#CD7F32]" /> Material de Apoio</li>
              </ul>
            </div>
            
            <div className="bg-[#0A0A0F] border border-[#C0C0C0]/30 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🥈</div>
              <h3 className="text-xl font-bold text-[#C0C0C0] mb-2">Prata</h3>
              <p className="text-gray-400 text-sm mb-4">6 a 15 Clientes</p>
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-400 mb-1">Bônus ao atingir 10 clientes:</p>
                <p className="font-bold text-[#C0C0C0]">R$ 100,00</p>
              </div>
            </div>

            <div className="bg-[#0A0A0F] border border-[#FFD700]/30 p-6 rounded-2xl relative overflow-hidden group transform lg:-translate-y-4 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🥇</div>
              <h3 className="text-xl font-bold text-[#FFD700] mb-2">Ouro</h3>
              <p className="text-gray-400 text-sm mb-4">16 a 30 Clientes</p>
              <div className="bg-[#FFD700]/10 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-400 mb-1">Bônus ao atingir 25 clientes:</p>
                <p className="font-bold text-[#FFD700]">R$ 300,00</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#111118] to-[#D4A853]/20 border border-[#D4A853]/50 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 text-5xl">👑</div>
              <h3 className="text-xl font-bold text-[#D4A853] mb-2">Elite</h3>
              <p className="text-gray-400 text-sm mb-4">51+ Clientes</p>
              <div className="bg-black/30 rounded-lg p-3 mb-6 border border-[#D4A853]/30">
                <p className="text-xs text-gray-400 mb-1">Bônus ao atingir 50/100 clientes:</p>
                <p className="font-bold text-[#D4A853]">Até R$ 3.000,00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O Que Dizem Nossos Parceiros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111118] border border-white/5 p-8 rounded-2xl">
              <div className="flex text-[#D4A853] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"Comecei indicando para amigos que precisavam de site. Hoje minha renda como parceiro Nextia já supera meu salário."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center font-bold">TM</div>
                <div>
                  <p className="font-bold">Thiago Martins</p>
                  <p className="text-sm text-[#D4A853]">Parceiro Elite</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111118] border border-white/5 p-8 rounded-2xl">
              <div className="flex text-[#D4A853] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"O sistema é muito transparente. Vejo na hora quando o cliente paga e já peço o saque pro meu PIX. Muito fácil."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center font-bold">JP</div>
                <div>
                  <p className="font-bold">Juliana Pereira</p>
                  <p className="text-sm text-[#D4A853]">Parceira Diamante</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111118] border border-white/5 p-8 rounded-2xl">
              <div className="flex text-[#D4A853] mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"Os materiais de marketing prontos me ajudam muito a prospectar no Instagram. É só copiar, colar e ganhar."</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center font-bold">LF</div>
                <div>
                  <p className="font-bold">Lucas Fernandes</p>
                  <p className="text-sm text-[#D4A853]">Parceiro Ouro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#111118]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Quanto custa para ser parceiro?', a: 'Nada! O cadastro é 100% gratuito e você não precisa pagar nenhuma taxa para se manter no programa.' },
              { q: 'Como recebo minhas comissões?', a: 'Você solicita o saque direto no painel e o valor é transferido para sua chave PIX cadastrada em até 48 horas úteis.' },
              { q: 'Qual o valor mínimo para saque?', a: 'O valor mínimo para solicitar um saque é de R$ 50,00.' },
              { q: 'A comissão é recorrente mesmo?', a: 'Sim! Enquanto o cliente que você indicou estiver pagando a mensalidade da Nextia, você receberá seus 25%.' },
              { q: 'Preciso emitir nota fiscal?', a: 'Pessoas físicas recebem via RPA (Recibo de Pagamento Autônomo) com as devidas retenções legais. Pessoas jurídicas emitem nota fiscal contra a Nextia.' }
            ].map((faq, i) => (
              <div key={i} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-6">
                <h3 className="font-bold flex items-center gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-[#D4A853]" />
                  {faq.q}
                </h3>
                <p className="text-gray-400 pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4A853]/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para começar a ganhar?</h2>
          <p className="text-xl text-gray-300 mb-10">Faça seu cadastro agora e ganhe acesso imediato ao seu link de indicação.</p>
          <Link to="/parceiros/cadastro" className="inline-block bg-[#D4A853] text-[#0A0A0F] px-10 py-5 rounded-xl font-bold text-xl hover:bg-[#A37E35] transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,168,83,0.3)]">
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#D4A853] to-[#A37E35] rounded md flex items-center justify-center">
              <span className="font-bold text-white text-xs">N</span>
            </div>
            <span className="font-bold tracking-wide">Nextia<span className="text-[#D4A853]">Partner</span></span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Nextia. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Site Oficial</Link>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
