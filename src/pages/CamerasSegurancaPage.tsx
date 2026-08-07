import { ShieldCheck, Video, AlertCircle } from 'lucide-react';
import { getWhatsAppLink, trackEvent } from '../utils/whatsapp';

export default function CamerasSegurancaPage() {
  return (
    <div className="bg-[#07111F] text-white pt-24 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <span className="text-[#21C77A] font-bold text-xs uppercase tracking-widest block mb-2">
            Nextia TechCare Security
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Câmeras e segurança para empresas e residências.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Instalação e manutenção de sistemas de câmeras (CFTV e IP) com monitoramento ao vivo no celular e gravação segura.
          </p>

          <a
            href={getWhatsAppLink('cameras')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('click_whatsapp', { origem: 'cameras_hero' })}
            className="inline-flex items-center gap-2 bg-[#21C77A] text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#1bb06b] transition-colors"
          >
            <Video className="w-4 h-4" />
            Solicitar orçamento de câmeras
          </a>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Câmeras IP e HD', desc: 'Imagens em alta definição com visão noturna infravermelha para áreas internas e externas.' },
            { title: 'Acesso Remoto no Celular', desc: 'Configuração do aplicativo no seu smartphone para visualizar em tempo real de qualquer lugar.' },
            { title: 'Manutenção de CFTV & DVR', desc: 'Troca de conectores, organização de fonte de alimentação e substituição de HDs de gravação.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#101C2C] border border-white/5 rounded-2xl p-6">
              <ShieldCheck className="w-6 h-6 text-[#21C77A] mb-4" />
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-6 flex items-start gap-4 text-xs text-gray-400">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p>
            <strong>Aviso de Orçamento:</strong> Os projetos de câmeras são fornecidos mediante orçamento personalizado, devido às variações de distâncias, quantidade de pontos e modelo de câmeras. Não realizamos compra prévia de materiais sem o sinal do orçamento aprovado.
          </p>
        </div>
      </section>
    </div>
  );
}
