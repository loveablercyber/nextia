import { AlertTriangle, Phone } from 'lucide-react';
import { getWhatsAppLink, trackEvent } from '../utils/whatsapp';

export default function TechCarePage() {
  const avulsos = [
    { title: 'Suporte Remoto', price: 'A partir de R$ 100', desc: 'Atendimento via TeamViewer/AnyDesk para problemas de software, remoção de vírus e configurações rápidas.' },
    { title: 'Visita Técnica / Diagnóstico (Bauru)', price: 'R$ 100', desc: 'Deslocamento e diagnóstico técnico presencial no seu endereço comercial ou residencial em Bauru.' },
    { title: 'Atendimento Presencial com Execução', price: 'A partir de R$ 180', desc: 'Visita presencial técnica incluindo até 90 minutos de execução de serviço.' },
    { title: 'Hora Técnica Adicional', price: 'R$ 100 / hora', desc: 'Valor da hora técnica adicional excedente aos 90 minutos iniciais em atendimentos presenciais.' },
    { title: 'Migração para SSD + Instalação de SO', price: 'A partir de R$ 250', desc: 'Clonagem ou instalação do Windows no SSD + otimização (peças não incluídas).' },
    { title: 'Formatação + Instalação Básica', price: 'A partir de R$ 180', desc: 'Formatação limpa do sistema, instalação de drivers e programas essenciais de trabalho.' },
    { title: 'Limpeza & Otimização de Sistema', price: 'A partir de R$ 120', desc: 'Limpeza física de componentes, troca de pasta térmica ou otimização de inicialização.' },
    { title: 'Configuração de Impressoras / Periféricos', price: 'A partir de R$ 100', desc: 'Instalação de impressoras em rede, scanners, leitores e periféricos diversos.' },
    { title: 'Configuração de Roteador / Wi-Fi', price: 'A partir de R$ 150', desc: 'Configuração de rede local, senha segura, rede de convidados e portas do roteador.' },
    { title: 'Diagnóstico em Bancada', price: 'R$ 80', desc: 'Avaliação técnica em laboratório (valor abatido caso o serviço seja aprovado).' },
    { title: 'Taxa de Urgência (Mesmo Dia)', price: '+30%', desc: 'Acréscimo aplicado para chamados prioritários com necessidade de atendimento no mesmo dia.' }
  ];

  return (
    <div className="bg-[#07111F] text-white pt-24 pb-20">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <span className="text-[#FF9D2E] font-bold text-xs uppercase tracking-widest block mb-2">
            Nextia TechCare — Suporte de TI
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            Suporte de TI para sua empresa não parar.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Atendimento técnico remoto e presencial em Bauru-SP, manutenção preventiva, computadores, notebooks, redes e backup empresarial.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={getWhatsAppLink('suporte')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('click_whatsapp', { origem: 'techcare_hero' })}
              className="inline-flex items-center gap-2 bg-[#FF9D2E] text-slate-950 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#e08924] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Solicitar Suporte Técnico
            </a>
          </div>
        </div>
      </section>

      {/* SERVIÇOS AVULSOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Serviços Técnicos Avulsos</h2>
          <p className="text-xs text-gray-400">
            Valores de referência para atendimentos pontuais em Bauru e região.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avulsos.map((item, idx) => (
            <div key={idx} className="bg-[#101C2C] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <span className="text-xs font-bold text-[#FF9D2E] bg-[#FF9D2E]/10 px-2 py-1 rounded">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>
              <a
                href={getWhatsAppLink('suporte', `Olá! Gostaria de orçamento para o serviço: ${item.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#FF9D2E] hover:underline"
              >
                Solicitar este serviço →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS MENSAIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Planos Mensais Empresariais</h2>
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            Ideal para empresas que precisam de estabilidade, preventiva e atendimento prioritário com orçamento fixo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">TechCare Essencial</h3>
            <div className="text-2xl font-black text-[#FF9D2E] mb-4">R$ 590 /mês</div>
            <ul className="space-y-2 text-xs text-gray-300 mb-6">
              <li>✓ Até 3 equipamentos cobertos</li>
              <li>✓ Até 3 horas de suporte remoto/mês</li>
              <li>✓ Verificação de backups</li>
              <li>✓ Atendimento em horário comercial</li>
            </ul>
            <a
              href={getWhatsAppLink('planoMensal', 'Olá! Tenho interesse no plano TechCare Essencial.')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-white/20"
            >
              Quero contratar
            </a>
          </div>

          <div className="bg-[#101C2C] border-2 border-[#FF9D2E] rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF9D2E] text-slate-950 font-bold text-[10px] px-3 py-0.5 rounded-full uppercase">
              Recomendado
            </span>
            <h3 className="text-lg font-bold text-white mb-1">TechCare Profissional</h3>
            <div className="text-3xl font-black text-[#FF9D2E] mb-4">R$ 850 /mês</div>
            <ul className="space-y-2 text-xs text-gray-300 mb-6">
              <li>✓ Até 5 equipamentos cobertos</li>
              <li>✓ Até 5 horas de suporte/mês</li>
              <li>✓ Suporte remoto & presencial</li>
              <li>✓ Manutenção preventiva & Wi-Fi</li>
              <li>✓ Atendimento prioritário</li>
            </ul>
            <a
              href={getWhatsAppLink('planoMensal', 'Olá! Tenho interesse no plano TechCare Profissional.')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-[#FF9D2E] text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:bg-[#e08924]"
            >
              Quero contratar
            </a>
          </div>

          <div className="bg-[#101C2C] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">TechCare Empresa</h3>
            <div className="text-2xl font-black text-[#FF9D2E] mb-4">R$ 1.200 /mês</div>
            <ul className="space-y-2 text-xs text-gray-300 mb-6">
              <li>✓ Até 10 equipamentos cobertos</li>
              <li>✓ Até 10 horas de suporte/mês</li>
              <li>✓ Suporte presencial & remoto</li>
              <li>✓ Inventário de ativos</li>
              <li>✓ SLA diferenciado</li>
            </ul>
            <a
              href={getWhatsAppLink('planoMensal', 'Olá! Gostaria de contratar o plano TechCare Empresa.')}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-white/20"
            >
              Falar com especialista
            </a>
          </div>
        </div>
      </section>

      {/* REGRAS CONTRATUAIS */}
      <section className="max-w-4xl mx-auto px-4 py-10 bg-[#101C2C] border border-white/10 rounded-2xl text-xs text-gray-400 space-y-3">
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Regras e Condições Importantes</span>
        </div>
        <p>• <strong>Sem suporte ilimitado irreal:</strong> Todos os nossos planos especificam limites de horas e equipamentos para garantir qualidade no atendimento.</p>
        <p>• <strong>Itens não incluídos:</strong> Peças de reposição, licenças de software de terceiros, equipamentos de rede adicionais ou deslocamentos fora da área de cobertura conveniada.</p>
        <p>• <strong>Área de Atendimento:</strong> Atendimento presencial regular em Bauru-SP. Cidades vizinhas mediante consulta e taxa de deslocamento.</p>
      </section>
    </div>
  );
}
