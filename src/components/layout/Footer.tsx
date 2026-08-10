import { Link } from 'react-router-dom';
import { AtSign, Zap, Phone, MapPin } from 'lucide-react';
import { getWhatsAppLink } from '../../utils/whatsapp';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07162B] text-base text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2086FF] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#2086FF]/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Nextia</span>
            </Link>
            <p className="max-w-sm text-base leading-7 text-slate-300">
              Tecnologia completa para empresas e profissionais. Estrutura digital, automação, suporte de TI, redes e segurança em um só lugar.
            </p>
            <div className="space-y-3 pt-2 text-base">
              <p className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-[#2086FF] flex-shrink-0" />
                Atendimento em Bauru - SP e Região
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-[#FF9D2E] flex-shrink-0" />
                WhatsApp: (14) 99640-5496
              </p>
              <p className="text-gray-400">CNPJ: 57.285.901/0001-94</p>
            </div>
          </div>

          {/* Soluções */}
          <div>
            <h3 className="mb-4 text-base font-bold text-white">Soluções</h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/sites" className="hover:text-[#35B7FF] transition-colors">
                  Sites Profissionais
                </Link>
              </li>
              <li>
                <Link to="/automacao-ia" className="hover:text-[#7C5CFF] transition-colors">
                  Automação & IA
                </Link>
              </li>
              <li>
                <Link to="/techcare" className="hover:text-[#FF9D2E] transition-colors">
                  Nextia TechCare (Suporte TI)
                </Link>
              </li>
              <li>
                <Link to="/redes-wifi" className="hover:text-[#21C77A] transition-colors">
                  Redes & Wi-Fi
                </Link>
              </li>
              <li>
                <Link to="/cameras-seguranca" className="hover:text-[#21C77A] transition-colors">
                  Câmeras & Segurança
                </Link>
              </li>
              <li>
                <Link to="/solucoes" className="hover:text-white transition-colors">
                  Soluções por Segmento
                </Link>
              </li>
            </ul>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mb-4 text-base font-bold text-white">Empresa</h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/planos" className="hover:text-white transition-colors">
                  Planos Mensais
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/parceiros" className="hover:text-white transition-colors">
                  Programa de Parceiros
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociais e Atendimento */}
          <div>
            <h3 className="mb-4 text-base font-bold text-white">Atendimento</h3>
            <p className="mb-4 text-base leading-7 text-slate-300">
              Precisa de suporte urgente ou proposta rápida?
            </p>
            <a
              href={getWhatsAppLink('geral')}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#16A36A] px-4 text-base font-bold text-white transition-colors hover:bg-[#128457]"
            >
              <Phone className="w-4 h-4" />
              Chamar no WhatsApp
            </a>
            <div className="pt-2">
              <a
                href="https://www.instagram.com/nextia.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-base text-slate-300 transition-colors hover:text-white"
              >
                <AtSign className="h-5 w-5 text-pink-400" />
                @nextia.dev
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-base sm:flex-row">
          <p>© {new Date().getFullYear()} Nextia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
