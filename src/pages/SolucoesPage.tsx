import { Briefcase, Stethoscope, Utensils, ShoppingBag, ArrowRight } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';

export default function SolucoesPage() {
  const segmentos = [
    {
      title: 'Contabilidade & Escritórios',
      icon: Briefcase,
      color: '#2086FF',
      services: ['Site institucional de credibilidade', 'Suporte técnico para computadores & impressoras', 'Backup corporativo de XMLs e arquivos', 'Rede Wi-Fi estável e isolada para clientes']
    },
    {
      title: 'Clínicas & Consultórios',
      icon: Stethoscope,
      color: '#7C5CFF',
      services: ['Site profissional com agendamento', 'Automação de WhatsApp para confirmação de consultas', 'Câmeras de segurança em recepções', 'Suporte preventivo em computadores']
    },
    {
      title: 'Restaurantes & Alimentos',
      icon: Utensils,
      color: '#FF9D2E',
      services: ['Cardápio digital e site otimizado', 'Bot de atendimento e pedidos no WhatsApp', 'Wi-Fi de alta capacidade para clientes', 'Câmeras de monitoramento da cozinha']
    },
    {
      title: 'Lojas & Comércio',
      icon: ShoppingBag,
      color: '#21C77A',
      services: ['Catálogo virtual de produtos', 'Automação de recepção de pedidos', 'Organização de rede de caixas & impressoras', 'CFTV para proteção da loja']
    }
  ];

  return (
    <div className="bg-[#07111F] text-white pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <span className="text-[#2086FF] font-bold text-xs uppercase tracking-widest block mb-2">
            Soluções por Segmento
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Tecnologia sob medida para o seu mercado.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Conheça as soluções integradas da Nextia configuradas especificamente para atender as exigências operacionais do seu setor.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-6">
          {segmentos.map((seg, idx) => {
            const Icon = seg.icon;
            return (
              <div key={idx} className="bg-[#101C2C] border border-white/5 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" style={{ color: seg.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{seg.title}</h3>
                <ul className="space-y-2 text-xs text-gray-300 mb-6">
                  {seg.services.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span style={{ color: seg.color }}>•</span> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={getWhatsAppLink('geral', `Olá! Gostaria de consultar soluções Nextia para meu segmento: ${seg.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:underline"
                >
                  Consultar projeto para meu setor <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
