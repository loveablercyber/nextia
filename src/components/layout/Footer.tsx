import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  plataforma: [
    { label: 'Sites Prontos', href: '/sites-prontos' },
    { label: 'Planos e Preços', href: '/planos' },
    { label: 'Como Funciona', href: '/como-funciona' },
    { label: 'Projeto Personalizado', href: '/projeto-personalizado' },
  ],
  segmentos: [
    { label: 'Restaurantes', href: '/sites-prontos?categoria=restaurante' },
    { label: 'Salões e Barbearias', href: '/sites-prontos?categoria=salao-barbearia' },
    { label: 'Clínicas e Estética', href: '/sites-prontos?categoria=clinica-estetica' },
    { label: 'Prestadores de Serviço', href: '/sites-prontos?categoria=prestador-servicos' },
    { label: 'Contabilidade', href: '/sites-prontos?categoria=contabilidade' },
    { label: 'Imobiliárias', href: '/sites-prontos?categoria=imobiliaria' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/contato' },
    { label: 'Perguntas Frequentes', href: '/como-funciona#faq' },
    { label: 'Entrar em Contato', href: '/contato' },
    { label: 'Área do Cliente', href: '/login' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f0c29] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#7c3aed] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black">Nextia</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Plataforma brasileira de criação e manutenção de sites profissionais por assinatura. Seu negócio na internet com suporte contínuo.
            </p>
            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#818cf8]" />
                <span>ola@nextia.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#818cf8]" />
                <span>São Paulo, SP — Brasil</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                {
                  label: 'Instagram',
                  href: '#',
                  svg: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  )
                },
                {
                  label: 'Facebook',
                  href: '#',
                  svg: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  )
                },
                {
                  label: 'LinkedIn',
                  href: '#',
                  svg: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  )
                }
              ].map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#5B4FE9] flex items-center justify-center transition-colors duration-200 text-white"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Segmentos</h4>
            <ul className="space-y-2">
              {footerLinks.segmentos.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* WhatsApp CTA */}
            <div className="mt-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-gray-400 mb-2">Precisa de ajuda agora?</p>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 font-semibold text-sm hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp direto
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2025 Nextia. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Termos de uso</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
