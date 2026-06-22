// SVG illustrations for each template category
interface IllustrationProps {
  category: string;
}

export function TemplateIllustration({ category }: IllustrationProps) {
  const illustrations: Record<string, JSX.Element> = {
    'restaurante': <RestauranteIllustration />,
    'salao-barbearia': <SalaoIllustration />,
    'prestador-servicos': <ServicosIllustration />,
    'loja-catalogo': <LojaIllustration />,
    'clinica-estetica': <ClinicaIllustration />,
    'contabilidade': <ContabilidadeIllustration />,
    'imobiliaria': <ImobiliariaIllustration />,
    'oficina-mecanica': <OficinaIllustration />,
  };

  return illustrations[category] || <DefaultIllustration />;
}

function RestauranteIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-rest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0a00" />
          <stop offset="100%" stopColor="#3d1a00" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-rest)" />
      {/* Navigation bar */}
      <rect x="0" y="0" width="400" height="36" fill="rgba(0,0,0,0.4)" />
      <text x="20" y="23" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">🍽️ Sabor & Arte</text>
      <text x="200" y="23" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Inter, sans-serif">Cardápio</text>
      <text x="250" y="23" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Inter, sans-serif">Reservas</text>
      <text x="300" y="23" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Inter, sans-serif">Galeria</text>
      <rect x="345" y="10" width="40" height="16" rx="8" fill="#e85d04" />
      <text x="356" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif">Reservar</text>
      {/* Hero */}
      <rect x="0" y="36" width="400" height="110" fill="rgba(0,0,0,0.5)" />
      <text x="200" y="85" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Sabor em cada prato</text>
      <text x="200" y="104" fill="rgba(255,220,150,0.9)" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle">Experiência gastronômica única no coração da cidade</text>
      <rect x="130" y="118" width="60" height="20" rx="10" fill="#e85d04" />
      <text x="160" y="132" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Ver cardápio</text>
      <rect x="200" y="118" width="70" height="20" rx="10" fill="transparent" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <text x="235" y="132" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Fazer reserva</text>
      {/* Sections */}
      <rect x="20" y="158" width="100" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="70" y="183" fill="#e85d04" fontSize="18" textAnchor="middle">🥩</text>
      <text x="70" y="200" fill="white" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Pratos Principais</text>
      <text x="70" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">12 opções</text>
      <rect x="150" y="158" width="100" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="200" y="183" fill="#e85d04" fontSize="18" textAnchor="middle">🍷</text>
      <text x="200" y="200" fill="white" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Bebidas</text>
      <text x="200" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Carta especial</text>
      <rect x="280" y="158" width="100" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="330" y="183" fill="#e85d04" fontSize="18" textAnchor="middle">🍮</text>
      <text x="330" y="200" fill="white" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Sobremesas</text>
      <text x="330" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Chef exclusivo</text>
      {/* WhatsApp button */}
      <circle cx="375" cy="230" r="14" fill="#25D366" />
      <text x="375" y="235" fill="white" fontSize="14" textAnchor="middle">💬</text>
    </svg>
  );
}

function SalaoIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-salao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0033" />
          <stop offset="100%" stopColor="#330033" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-salao)" />
      <rect x="0" y="0" width="400" height="36" fill="rgba(255,255,255,0.05)" />
      <text x="20" y="23" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">✂️ Salão Elegance</text>
      <text x="180" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Serviços</text>
      <text x="225" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Portfólio</text>
      <text x="270" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Equipe</text>
      <rect x="340" y="10" width="50" height="16" rx="8" fill="#d946ef" />
      <text x="365" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Agendar</text>
      {/* Hero */}
      <text x="200" y="85" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Beleza que transforma</text>
      <text x="200" y="104" fill="rgba(255,200,220,0.8)" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">Agende seu horário com os melhores profissionais</text>
      <rect x="145" y="115" width="110" height="22" rx="11" fill="#d946ef" />
      <text x="200" y="130" fill="white" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Agendar agora</text>
      {/* Service cards */}
      <rect x="20" y="155" width="85" height="78" rx="10" fill="rgba(217,70,239,0.15)" stroke="rgba(217,70,239,0.3)" strokeWidth="1" />
      <text x="62" y="180" fill="#d946ef" fontSize="20" textAnchor="middle">💇</text>
      <text x="62" y="200" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Corte</text>
      <text x="62" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">R$ 60+</text>
      <rect x="115" y="155" width="85" height="78" rx="10" fill="rgba(217,70,239,0.15)" stroke="rgba(217,70,239,0.3)" strokeWidth="1" />
      <text x="157" y="180" fill="#d946ef" fontSize="20" textAnchor="middle">💅</text>
      <text x="157" y="200" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Coloração</text>
      <text x="157" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">R$ 120+</text>
      <rect x="210" y="155" width="85" height="78" rx="10" fill="rgba(217,70,239,0.15)" stroke="rgba(217,70,239,0.3)" strokeWidth="1" />
      <text x="252" y="180" fill="#d946ef" fontSize="20" textAnchor="middle">✨</text>
      <text x="252" y="200" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Escova</text>
      <text x="252" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">R$ 80+</text>
      <rect x="305" y="155" width="75" height="78" rx="10" fill="rgba(217,70,239,0.15)" stroke="rgba(217,70,239,0.3)" strokeWidth="1" />
      <text x="342" y="180" fill="#d946ef" fontSize="20" textAnchor="middle">💆</text>
      <text x="342" y="200" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Hidratação</text>
      <text x="342" y="215" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">R$ 90+</text>
      <circle cx="375" cy="230" r="14" fill="#25D366" />
      <text x="375" y="235" fill="white" fontSize="14" textAnchor="middle">💬</text>
    </svg>
  );
}

function ServicosIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-serv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f0c29" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-serv)" />
      <rect x="0" y="0" width="400" height="36" fill="rgba(91,79,233,0.2)" />
      <text x="20" y="23" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">⚡ RA Consultoria</text>
      <text x="190" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Serviços</text>
      <text x="235" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Portfólio</text>
      <text x="280" y="23" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="Inter, sans-serif">Sobre</text>
      <rect x="335" y="10" width="55" height="16" rx="8" fill="#5B4FE9" />
      <text x="362" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Solicitar orçamento</text>
      {/* Hero */}
      <text x="200" y="75" fill="white" fontSize="20" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Soluções que</text>
      <text x="200" y="97" fill="white" fontSize="20" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">fazem crescer</text>
      <text x="200" y="116" fill="rgba(180,180,255,0.8)" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle">Consultoria especializada para o seu negócio</text>
      <rect x="150" y="124" width="100" height="20" rx="10" fill="#5B4FE9" />
      <text x="200" y="138" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Solicitar orçamento</text>
      {/* Stats */}
      <rect x="20" y="155" width="110" height="78" rx="10" fill="rgba(91,79,233,0.2)" stroke="rgba(91,79,233,0.3)" strokeWidth="1" />
      <text x="75" y="185" fill="#818cf8" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">150+</text>
      <text x="75" y="202" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Projetos entregues</text>
      <text x="75" y="218" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">em 8 anos</text>
      <rect x="145" y="155" width="110" height="78" rx="10" fill="rgba(91,79,233,0.2)" stroke="rgba(91,79,233,0.3)" strokeWidth="1" />
      <text x="200" y="185" fill="#818cf8" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">98%</text>
      <text x="200" y="202" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Satisfação dos</text>
      <text x="200" y="218" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">clientes</text>
      <rect x="270" y="155" width="110" height="78" rx="10" fill="rgba(91,79,233,0.2)" stroke="rgba(91,79,233,0.3)" strokeWidth="1" />
      <text x="325" y="185" fill="#818cf8" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">24h</text>
      <text x="325" y="202" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Resposta</text>
      <text x="325" y="218" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">garantida</text>
    </svg>
  );
}

function LojaIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="250" fill="#f8fafc" />
      <rect x="0" y="0" width="400" height="36" fill="white" />
      <text x="20" y="23" fill="#1e293b" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">🛍️ Loja Moderna</text>
      <rect x="330" y="10" width="55" height="16" rx="8" fill="#5B4FE9" />
      <text x="357" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Ver catálogo</text>
      <text x="200" y="70" fill="#1e293b" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Nossos produtos</text>
      {/* Product cards */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={20 + i*93} y="85" width="85" height="105" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
          <rect x={20 + i*93} y="85" width="85" height="60" rx="10" fill="#eef2ff" />
          <text x={62 + i*93} y="122" fill="#5B4FE9" fontSize="24" textAnchor="middle">{['👔','👗','👟','👜'][i]}</text>
          <text x={62 + i*93} y="163" fill="#1e293b" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">{['Camisa','Vestido','Tênis','Bolsa'][i]}</text>
          <text x={62 + i*93} y="176" fill="#5B4FE9" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">R$ {[89,149,219,179][i]}</text>
        </g>
      ))}
    </svg>
  );
}

function ClinicaIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-clinica" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-clinica)" />
      <rect x="0" y="0" width="400" height="36" fill="white" />
      <text x="20" y="23" fill="#166534" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">🏥 Clínica Saúde+</text>
      <rect x="335" y="10" width="50" height="16" rx="8" fill="#10b981" />
      <text x="360" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Agendar</text>
      <text x="200" y="75" fill="#166534" fontSize="19" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Sua saúde em boas mãos</text>
      <text x="200" y="92" fill="#4ade80" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle">Profissionais especializados e atendimento humanizado</text>
      <rect x="145" y="102" width="110" height="20" rx="10" fill="#10b981" />
      <text x="200" y="116" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Agendar consulta</text>
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={20 + i*127} y="135" width="115" height="98" rx="12" fill="white" stroke="#bbf7d0" strokeWidth="1.5" />
          <text x={77 + i*127} y="165" fill="#10b981" fontSize="24" textAnchor="middle">{['🦷','🧴','💆'][i]}</text>
          <text x={77 + i*127} y="185" fill="#166534" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{['Odontologia','Estética','Massoterapia'][i]}</text>
          <text x={77 + i*127} y="200" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">A partir de R$ {[80,120,100][i]}</text>
          <rect x={47 + i*127} y="210" width="60" height="15" rx="7" fill="#dcfce7" stroke="#10b981" strokeWidth="1" />
          <text x={77 + i*127} y="221" fill="#10b981" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Saiba mais</text>
        </g>
      ))}
    </svg>
  );
}

function ContabilidadeIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="250" fill="#f8fafc" />
      <rect x="0" y="0" width="400" height="36" fill="#1e293b" />
      <text x="20" y="23" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">📊 Contabilidade RC</text>
      <rect x="335" y="10" width="50" height="16" rx="8" fill="#5B4FE9" />
      <text x="360" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Orçamento</text>
      <text x="200" y="72" fill="#1e293b" fontSize="17" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Sua contabilidade em dia</text>
      <text x="200" y="88" fill="#64748b" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle">Soluções contábeis para empresas e autônomos</text>
      {/* Charts visual */}
      {[0,1,2,3,4].map(i => {
        const h = [40,65,50,80,55][i];
        return (
          <g key={i}>
            <rect x={55 + i*55} y={175 - h} width="35" height={h} rx="4" fill={i === 3 ? '#5B4FE9' : '#e0e7ff'} />
          </g>
        );
      })}
      <line x1="40" y1="175" x2="340" y2="175" stroke="#e2e8f0" strokeWidth="1" />
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={20 + i*92} y="190" width="85" height="48" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
          <text x={62 + i*92} y="208" fill="#5B4FE9" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{['MEI','Simples','Lucro Real','PJ'][i]}</text>
          <text x={62 + i*92} y="224" fill="#64748b" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">{['Autônomos','Pequenas','Médias','Todas'][i]}</text>
        </g>
      ))}
    </svg>
  );
}

function ImobiliariaIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="250" fill="#fffbeb" />
      <rect x="0" y="0" width="400" height="36" fill="white" />
      <text x="20" y="23" fill="#92400e" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">🏠 AR Imóveis</text>
      <rect x="330" y="10" width="55" height="16" rx="8" fill="#f59e0b" />
      <text x="357" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Buscar imóvel</text>
      {/* Search bar */}
      <rect x="50" y="45" width="300" height="30" rx="15" fill="white" stroke="#fde68a" strokeWidth="1.5" />
      <text x="75" y="64" fill="#9ca3af" fontSize="10" fontFamily="Inter, sans-serif">🔍 Busque por cidade, bairro ou tipo...</text>
      <rect x="320" y="48" width="25" height="24" rx="12" fill="#f59e0b" />
      {/* Property cards */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={20 + i*126} y="88" width="116" height="140" rx="12" fill="white" stroke="#fde68a" strokeWidth="1" />
          <rect x={20 + i*126} y="88" width="116" height="70" rx="12" fill="#fef3c7" />
          <text x={78 + i*126} y="128" fill="#f59e0b" fontSize="28" textAnchor="middle">🏡</text>
          <text x={78 + i*126} y="175" fill="#1e293b" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{['Casa 3 quartos','Apto 2 quartos','Casa 4 quartos'][i]}</text>
          <text x={78 + i*126} y="189" fill="#64748b" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">{['São Paulo, SP','Campinas, SP','Santo André'][i]}</text>
          <text x={78 + i*126} y="204" fill="#f59e0b" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="800">R$ {['450.000','320.000','580.000'][i]}</text>
          <rect x={48 + i*126} y="212" width="60" height="12" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x={78 + i*126} y="222" fill="#f59e0b" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Ver detalhes</text>
        </g>
      ))}
    </svg>
  );
}

function OficinaIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-oficina" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f1117" />
          <stop offset="100%" stopColor="#1c1c2e" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-oficina)" />
      <rect x="0" y="0" width="400" height="36" fill="rgba(255,255,255,0.05)" />
      <text x="20" y="23" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif">🔧 Auto Center JP</text>
      <rect x="330" y="10" width="55" height="16" rx="8" fill="#ef4444" />
      <text x="357" y="22" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">Orçamento</text>
      <text x="200" y="72" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Seu carro em boas mãos</text>
      <text x="200" y="88" fill="rgba(255,100,100,0.8)" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle">Serviços rápidos com qualidade garantida</text>
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={20 + i*95} y="105" width="85" height="120" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
          <text x={62 + i*95} y="135" fill="#ef4444" fontSize="24" textAnchor="middle">{['🛞','🔋','🛢️','🔧'][i]}</text>
          <text x={62 + i*95} y="155" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">{['Troca de Pneu','Bateria','Troca de óleo','Revisão'][i]}</text>
          <text x={62 + i*95} y="170" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">A partir de</text>
          <text x={62 + i*95} y="182" fill="#ef4444" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">R$ {[80,150,60,180][i]}</text>
          <rect x={32 + i*95} y="195" width="60" height="22" rx="11" fill="#ef4444" />
          <text x={62 + i*95} y="210" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Solicitar</text>
        </g>
      ))}
    </svg>
  );
}

function DefaultIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="250" fill="#eef2ff" />
      <text x="200" y="125" fill="#5B4FE9" fontSize="40" textAnchor="middle">🌐</text>
      <text x="200" y="155" fill="#5B4FE9" fontSize="14" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="600">Site Profissional</text>
    </svg>
  );
}
