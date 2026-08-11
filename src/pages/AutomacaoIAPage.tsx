import { Bot, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AutomacaoIAPage() {
  const features = [
    { title: 'Chatbots Inteligentes no WhatsApp', desc: 'Atenda clientes 24 horas por dia, responda dúvidas frequentes e realize agendamentos automaticamente.' },
    { title: 'Triagem & Qualificação de Leads', desc: 'Filtre clientes em potencial antes de encaminhar para sua equipe de vendas humana.' },
    { title: 'Sistemas Personalizados', desc: 'Desenvolvimento de painéis internos, gerenciadores de tarefas e fluxos sob medida.' },
    { title: 'Integração de APIs & Webhooks', desc: 'Conecte seu site ao WhatsApp, CRM, banco de dados ou sistemas de pagamento.' },
    { title: 'Formulários Inteligentes', desc: 'Captação automatizada de dados com disparo de notificações imediatas para a equipe.' },
    { title: 'Automação Administrativa', desc: 'Elimine tarefas manuais repetitivas e reduza erros operacionais na sua empresa.' }
  ];

  return (
    <div className="bg-[#07111F] text-white pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <span className="text-[#7C5CFF] font-bold text-xs uppercase tracking-widest block mb-2">
            Nextia Automação & IA
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Automação e Inteligência Artificial para sua empresa.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Economize tempo, automatize o atendimento no WhatsApp e elimine processos manuais com soluções inteligentes sob medida.
          </p>

          <Link
            to="/solicitar-servico?service=automacao-ia"
            className="inline-flex items-center gap-2 bg-[#7C5CFF] text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#6846f0] transition-colors"
          >
            <Zap className="w-4 h-4" />
            Quero automatizar minha empresa
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="bg-[#101C2C] border border-white/5 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5 text-[#7C5CFF]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
