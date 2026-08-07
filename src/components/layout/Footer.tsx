import { Link } from 'react-router-dom';
import { Zap, Phone, MapPin } from 'lucide-react';
import { getWhatsAppLink } from '../../utils/whatsapp';

export default function Footer() {
  return (
    <footer className="bg-[#07111F] text-gray-400 text-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2086FF] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#2086FF]/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Nextia</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Tecnologia completa para empresas e profissionais. Estrutura digital, automação, suporte de TI, redes e segurança em um só lugar.
            </p>
            <div className="space-y-2 pt-2 text-xs">
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
            <h3 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Soluções</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/sites-prontos" className="hover:text-[#2086FF] transition-colors">
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
            <h3 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Empresa</h3>
            <ul className="space-y-2.5 text-xs">
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
            <h3 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Atendimento</h3>
            <p className="text-xs text-gray-400 mb-4">
              Precisa de suporte urgente ou proposta rápida?
            </p>
            <a
              href={getWhatsAppLink('geral')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#21C77A] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1bb06b] transition-colors mb-4"
            >
              <Phone className="w-4 h-4" />
              Chamar no WhatsApp
            </a>
            <div className="pt-2">
              <a
                href="https://www.instagram.com/nextia.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs"
              >
                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                @nextia.dev
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
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
