import { Wifi, CheckCircle } from 'lucide-react';
import { getWhatsAppLink, trackEvent } from '../utils/whatsapp';

export default function RedesWifiPage() {
  return (
    <div className="bg-[#07111F] text-white pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <span className="text-[#21C77A] font-bold text-xs uppercase tracking-widest block mb-2">
            Nextia TechCare Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Wi-Fi e redes profissionais para empresas.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Elimine zonas mortas, quedas de conexão e lentidão na sua empresa com redes estruturadas, roteadores de alta capacidade e Wi-Fi corporativo.
          </p>

          <a
            href={getWhatsAppLink('redes')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('click_whatsapp', { origem: 'redes_hero' })}
            className="inline-flex items-center gap-2 bg-[#21C77A] text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#1bb06b] transition-colors"
          >
            <Wifi className="w-4 h-4" />
            Solicitar avaliação de rede
          </a>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Wi-Fi Corporativo', desc: 'Redes estáveis com roaming transparente para funcionários e convidados.' },
            { title: 'Cabeamento Estruturado', desc: 'Passagem de cabos de rede Cat6, identificação de pontos e testes de velocidade.' },
            { title: 'Organização de Racks', desc: 'Organização de patch panels, cabos, switches e roteadores.' },
            { title: 'Diagnóstico de Redes', desc: 'Identificação de gargalos, conflitos de IP e perda de pacotes.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#101C2C] border border-white/5 rounded-2xl p-6">
              <CheckCircle className="w-6 h-6 text-[#21C77A] mb-4" />
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
