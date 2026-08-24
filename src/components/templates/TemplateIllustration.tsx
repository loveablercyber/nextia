import React, { useState } from 'react';

interface IllustrationProps {
  category: string;
  slug?: string;
  coverImage?: string;
}

export function TemplateIllustration({ category, slug, coverImage }: IllustrationProps) {
  const [imageError, setImageError] = useState(false);

  if (coverImage && coverImage.trim() !== '' && !imageError) {
    return (
      <div className="h-full w-full overflow-hidden bg-slate-900">
        <img
          src={coverImage}
          alt={`Modelo ${slug || category}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  if (slug === 'imobiliaria-premium') {
    return <ImobiliariaPremiumIllustration />;
  }
  if (slug === 'restaurante-premium') {
    return <RestaurantePremiumIllustration />;
  }
  if (slug === 'salao-elegance' || slug === 'salao-barbearia') {
    return <SalaoPremiumIllustration />;
  }
  if (slug === 'servicos-profissionais' || category === 'prestador-servicos') {
    return <ServicosPremiumIllustration />;
  }
  if (slug === 'loja-catalogo' || category === 'loja-catalogo' || category === 'loja-virtual' || slug?.startsWith('loja-')) {
    return <LojaPremiumIllustration />;
  }
  if (slug === 'clinica-estetica' || category === 'clinica-estetica') {
    return <ClinicaPremiumIllustration />;
  }
  if (slug === 'contabilidade' || category === 'contabilidade') {
    return <ContabilidadePremiumIllustration />;
  }
  if (slug === 'oficina-mecanica' || category === 'oficina-mecanica') {
    return <OficinaPremiumIllustration />;
  }

  const illustrations: Record<string, React.ReactNode> = {
    'restaurante': <RestauranteIllustration />,
    'salao-barbearia': <SalaoIllustration />,
    'prestador-servicos': <ServicosIllustration />,
    'loja-catalogo': <LojaIllustration />,
    'loja-virtual': <LojaIllustration />,
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

function ImobiliariaPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-imob-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B0F19" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-imob-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(31,41,55,0.8)" />
      <text x="18" y="22" fill="#F59E0B" fontSize="12" fontWeight="800" fontFamily="Inter, sans-serif">🏰 IMOBILIÁRIA PREMIUM</text>
      <rect x="310" y="8" width="75" height="18" rx="9" fill="url(#gold-grad)" />
      <text x="347" y="20" fill="white" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">ALTO PADRÃO</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(17,24,39,0.9)" stroke="rgba(217,119,6,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Encontre o Imóvel Ideal para sua Família</text>
      <text x="200" y="75" fill="#D1D5DB" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Mansões suspensas, coberturas e casas em condomínios fechados</text>

      {/* Search Bar Pill */}
      <rect x="40" y="96" width="320" height="22" rx="11" fill="#0B0F19" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
      <text x="55" y="111" fill="#9CA3AF" fontSize="8" fontFamily="Inter, sans-serif">🔍 Tipo, Cidade, Bairro, m² ou Código (RE-1042)...</text>
      <rect x="300" y="99" width="55" height="16" rx="8" fill="url(#gold-grad)" />
      <text x="327" y="110" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Buscar</text>

      {/* Property cards */}
      {[
        { title: 'Mansão Jardins', price: 'R$ 8.5M', specs: '450m² · 4 Suítes', badge: 'EXCLUSIVO' },
        { title: 'Villa Alphaville', price: 'R$ 12.9M', specs: '680m² · Heliponto', badge: 'ALTO PADRÃO' },
        { title: 'Penthouse Barra', price: 'R$ 6.7M', specs: '380m² · Frente Mar', badge: 'TOUR 360°' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#111827" stroke="rgba(31,41,55,0.9)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#1F2937" />
          <text x={74 + i*126} y="152" fill="#F59E0B" fontSize="20" textAnchor="middle">🏙️</text>
          <rect x={20 + i*126} y="130" width="55" height="11" rx="5" fill="#D97706" />
          <text x={47 + i*126} y="138" fill="white" fontSize="6" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#9CA3AF" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#F59E0B" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#0B0F19" stroke="#D97706" strokeWidth="0.8" />
          <text x={74 + i*126} y="224" fill="#F59E0B" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Ver Detalhes</text>
        </g>
      ))}
    </svg>
  );
}

function RestaurantePremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-rest-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#120A05" />
          <stop offset="100%" stopColor="#241003" />
        </linearGradient>
        <linearGradient id="orange-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E85D04" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-rest-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#F97316" fontSize="12" fontWeight="800" fontFamily="Inter, sans-serif">🍽️ SABOR & ARTE · GASTRONOMIA</text>
      <rect x="300" y="8" width="85" height="18" rx="9" fill="url(#orange-grad)" />
      <text x="342" y="20" fill="white" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">RESERVA ONLINE</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(0,0,0,0.7)" stroke="rgba(232,93,4,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Experiência Gastronômica Inesquecível</text>
      <text x="200" y="75" fill="#FFC8A2" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Culinária autoral, ingredientes selecionados e carta de vinhos exclusiva</text>

      {/* Category Pills */}
      <g>
        <rect x="40" y="96" width="70" height="20" rx="10" fill="url(#orange-grad)" />
        <text x="75" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Pratos Principais</text>
        <rect x="120" y="96" width="60" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="150" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Entradas</text>
        <rect x="190" y="96" width="65" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="222" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Sobremesas</text>
        <rect x="265" y="96" width="60" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="295" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Vinhos</text>
      </g>

      {/* Dish cards */}
      {[
        { title: 'Ancho Wagyu Grelhado', price: 'R$ 148', specs: 'Maturado 45 dias · Trufas', badge: 'CHEF RECOMENDA' },
        { title: 'Risoto de Lagosta', price: 'R$ 165', specs: 'Frutos do Mar · Açafrão', badge: 'DESTAQUE' },
        { title: 'Petit Gâteau Belga', price: 'R$ 42', specs: 'Chocolate 70% · Sorvete', badge: 'MAIS PEDIDO' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#1C0E06" stroke="rgba(232,93,4,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#2E1609" />
          <text x={74 + i*126} y="152" fill="#F97316" fontSize="20" textAnchor="middle">🥩</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#E85D04" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#FFC8A2" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#F97316" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#E85D04" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Fazer Pedido</text>
        </g>
      ))}
    </svg>
  );
}

function SalaoPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-salao-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F051D" />
          <stop offset="100%" stopColor="#1D0B36" />
        </linearGradient>
        <linearGradient id="magenta-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-salao-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#D946EF" fontSize="12" fontWeight="800" fontFamily="Inter, sans-serif">✂️ SALÃO & BARBEARIA ELEGANCE</text>
      <rect x="290" y="8" width="95" height="18" rx="9" fill="url(#magenta-grad)" />
      <text x="337" y="20" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">AGENDA ONLINE 24/7</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(29,11,54,0.7)" stroke="rgba(217,70,239,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Estilo, Elegância & Visagismo Pessoal</text>
      <text x="200" y="75" fill="#F472B6" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Cortes de autor, barba ritualística, coloração e tratamentos Kérastase</text>

      {/* Category Pills */}
      <g>
        <rect x="30" y="96" width="80" height="20" rx="10" fill="url(#magenta-grad)" />
        <text x="70" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Cortes & Visagismo</text>
        <rect x="118" y="96" width="75" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="155" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Barba & Ritual</text>
        <rect x="200" y="96" width="60" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="230" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Coloração</text>
        <rect x="268" y="96" width="65" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="300" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Tratamentos</text>
      </g>

      {/* Service cards */}
      {[
        { title: 'Corte Visagista', price: 'R$ 80', specs: '45 min · Finalização', badge: 'MAIS PROCURADO' },
        { title: 'Barba Toalha Quente', price: 'R$ 60', specs: '30 min · Oleoterapia', badge: 'EXPERIÊNCIA V.I.P' },
        { title: 'Balayage & Nutrição', price: 'R$ 280', specs: '120 min · Kérastase', badge: 'DESTAQUE' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#17092C" stroke="rgba(217,70,239,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#2D1252" />
          <text x={74 + i*126} y="152" fill="#D946EF" fontSize="20" textAnchor="middle">✂️</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#D946EF" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#F472B6" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#D946EF" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#D946EF" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Agendar Agora</text>
        </g>
      ))}
    </svg>
  );
}

function ServicosPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-serv-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A1128" />
          <stop offset="100%" stopColor="#101F42" />
        </linearGradient>
        <linearGradient id="blue-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-serv-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#06B6D4" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">🏢 PRIME SERVIÇOS TÉCNICOS & ENGENHARIA</text>
      <rect x="290" y="8" width="95" height="18" rx="9" fill="url(#blue-grad)" />
      <text x="337" y="20" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">ISO 9001 · CREA</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(16,31,66,0.8)" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Soluções Técnicas & Gestão de Serviços</text>
      <text x="200" y="75" fill="#93C5FD" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Engenharia elétrica, climatização industrial, CFTV e laudos com ART</text>

      {/* Category Pills */}
      <g>
        <rect x="25" y="96" width="85" height="20" rx="10" fill="url(#blue-grad)" />
        <text x="67" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Engenharia Elétrica</text>
        <rect x="115" y="96" width="75" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="152" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Climatização VRF</text>
        <rect x="195" y="96" width="75" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="232" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">CFTV & Segurança</text>
        <rect x="275" y="96" width="60" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="305" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Laudos ART</text>
      </g>

      {/* Service cards */}
      {[
        { title: 'Manutenção Elétrica', price: 'SLA 2h', specs: 'NR-10 · Laudo ART', badge: 'ALTA PRIORIDADE' },
        { title: 'Climatização VRF', price: 'PMOC', specs: 'Preventiva & Contrato', badge: 'ISO GUARANTEE' },
        { title: 'CFTV IP & Biometria', price: '24/7', specs: 'Câmeras 4K · Acesso', badge: 'DESTAQUE' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#0D1938" stroke="rgba(6,182,212,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#172957" />
          <text x={74 + i*126} y="152" fill="#06B6D4" fontSize="20" textAnchor="middle">⚡</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#2563EB" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#93C5FD" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#06B6D4" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#2563EB" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Cotar Serviço</text>
        </g>
      ))}
    </svg>
  );
}

function LojaPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-loja-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F0D15" />
          <stop offset="100%" stopColor="#181524" />
        </linearGradient>
        <linearGradient id="pink-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-loja-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#EC4899" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">👗 BOUTIQUE ELEGANCE · MODA & CATÁLOGO</text>
      <rect x="280" y="8" width="105" height="18" rx="9" fill="url(#pink-grad)" />
      <text x="332" y="20" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">FRETE GRÁTIS R$ 299+</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(24,21,36,0.8)" stroke="rgba(236,72,153,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Nova Coleção Outono / Inverno 2026</text>
      <text x="200" y="75" fill="#F472B6" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Moda feminina, alfaiataria de luxo, calçados e bolsas exclusivas</text>

      {/* Category Pills */}
      <g>
        <rect x="30" y="96" width="75" height="20" rx="10" fill="url(#pink-grad)" />
        <text x="67" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Lançamentos</text>
        <rect x="113" y="96" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="153" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Moda Feminina</text>
        <rect x="200" y="96" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="240" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Calçados & Bolsas</text>
        <rect x="287" y="96" width="55" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="314" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Joias</text>
      </g>

      {/* Product cards */}
      {[
        { title: 'Vestido Seda Premium', price: 'R$ 289', specs: 'Em até 6x de R$ 48', badge: 'LANÇAMENTO' },
        { title: 'Blazer Alfaiataria', price: 'R$ 349', specs: '5% OFF no Pix', badge: 'MAIS VENDIDO' },
        { title: 'Bolsa Couro Legítimo', price: 'R$ 450', specs: 'Edição Limitada', badge: 'EXCLUSIVO' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#151121" stroke="rgba(236,72,153,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#251C3A" />
          <text x={74 + i*126} y="152" fill="#EC4899" fontSize="20" textAnchor="middle">👗</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#EC4899" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#F472B6" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#EC4899" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#10B981" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Comprar via Whats</text>
        </g>
      ))}
    </svg>
  );
}

function ClinicaPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-clinica-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#07191D" />
          <stop offset="100%" stopColor="#0E2E35" />
        </linearGradient>
        <linearGradient id="teal-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-clinica-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#2DD4BF" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">✨ CLÍNICA RENOVA · DERMATOLOGIA & ESTÉTICA</text>
      <rect x="285" y="8" width="100" height="18" rx="9" fill="url(#teal-grad)" />
      <text x="335" y="20" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">CRM/RQE · ANVISA</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(14,46,53,0.8)" stroke="rgba(20,184,166,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Medicina Estética & Dermatologia Avançada</text>
      <text x="200" y="75" fill="#99F6E4" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Harmonização facial natural, laser Ultraformer/Lavieen e toxina botulínica</text>

      {/* Category Pills */}
      <g>
        <rect x="25" y="96" width="95" height="20" rx="10" fill="url(#teal-grad)" />
        <text x="72" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Facial & Harmonização</text>
        <rect x="125" y="96" width="80" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="165" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Corporal & Laser</text>
        <rect x="210" y="96" width="65" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="242" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Terapia Capilar</text>
        <rect x="280" y="96" width="65" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="312" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Dermatologia</text>
      </g>

      {/* Treatment cards */}
      {[
        { title: 'Harmonização Facial', price: 'Duração 12m+', specs: 'Ácido Hialurônico / Botox', badge: 'MAIS SOLICITADO' },
        { title: 'Laser Lavieen & BB Laser', price: 'Efeito Glow', specs: 'Renovação & Manchas', badge: 'TECNOLOGIA TOP' },
        { title: 'Bioestimulador Colágeno', price: 'Radiesse', specs: 'Firmeza & Rejuvenescimento', badge: 'RECOMENDADO' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#0A2228" stroke="rgba(20,184,166,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#123B44" />
          <text x={74 + i*126} y="152" fill="#2DD4BF" fontSize="20" textAnchor="middle">💉</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#14B8A6" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#99F6E4" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#2DD4BF" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#14B8A6" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Agendar Avaliação</text>
        </g>
      ))}
    </svg>
  );
}

function ContabilidadePremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-conta-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#090D16" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-conta-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#EAB308" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">💼 APEX CONTABILIDADE · GESTÃO TRIBUTÁRIA & BPO</text>
      <rect x="275" y="8" width="110" height="18" rx="9" fill="url(#gold-grad)" />
      <text x="330" y="20" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">CRC REGISTRADO · ISO 9001</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(17,24,39,0.8)" stroke="rgba(234,179,8,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Contabilidade Consultiva & Planejamento Tributário</text>
      <text x="200" y="75" fill="#FDE047" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Redução legal de impostos, BPO financeiro e migração gratuita sem burocracia</text>

      {/* Category Pills */}
      <g>
        <rect x="25" y="96" width="85" height="20" rx="10" fill="url(#gold-grad)" />
        <text x="67" y="109" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" textAnchor="middle">Gestão Contábil</text>
        <rect x="115" y="96" width="75" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="152" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">BPO Financeiro</text>
        <rect x="195" y="96" width="85" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="237" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Plano Tributário</text>
        <rect x="285" y="96" width="60" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="315" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Migração</text>
      </g>

      {/* Service cards */}
      {[
        { title: 'Gestão Contábil', price: 'Economia Legal', specs: 'DRE Mensal & Suporte CRC', badge: 'MAIS PROCURADO' },
        { title: 'BPO Financeiro PME', price: 'Gestão 100%', specs: 'Contas a Pagar & Conciliação', badge: 'EFICIÊNCIA MAXIMUM' },
        { title: 'Abertura & Migração', price: 'Taxa Zero', specs: 'Migração Gratuita & Rápida', badge: 'FACILITADO' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#0F172A" stroke="rgba(234,179,8,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#1E293B" />
          <text x={74 + i*126} y="152" fill="#EAB308" fontSize="20" textAnchor="middle">📊</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#CA8A04" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#FDE047" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#EAB308" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#10B981" />
          <text x={74 + i*126} y="224" fill="white" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">Solicitar Proposta</text>
        </g>
      ))}
    </svg>
  );
}

function OficinaPremiumIllustration() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-oficina-premium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D0F14" />
          <stop offset="100%" stopColor="#161A22" />
        </linearGradient>
        <linearGradient id="amber-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg-oficina-premium)" />
      
      {/* Top Bar */}
      <rect x="0" y="0" width="400" height="34" fill="rgba(0,0,0,0.6)" />
      <text x="18" y="22" fill="#F59E0B" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">🔧 AUTO PERFORMANCE · CENTRO AUTOMOTIVO 3D</text>
      <rect x="270" y="8" width="115" height="18" rx="9" fill="url(#amber-grad)" />
      <text x="327" y="20" fill="#0D0F14" fontSize="7.5" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BOSCH SERVICE · ASE</text>

      {/* Hero Banner */}
      <rect x="15" y="40" width="370" height="50" rx="10" fill="rgba(22,26,34,0.8)" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
      <text x="200" y="60" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Mecânica de Precisão & Diagnóstico 3D</text>
      <text x="200" y="75" fill="#FDE68A" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Revisão preventiva, injeção eletrônica, freios, câmbio automático e peças originais</text>

      {/* Category Pills */}
      <g>
        <rect x="20" y="96" width="95" height="20" rx="10" fill="url(#amber-grad)" />
        <text x="67" y="109" fill="#0D0F14" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Revisão Preventiva</text>
        <rect x="120" y="96" width="85" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="162" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Injeção Eletrônica</text>
        <rect x="210" y="96" width="85" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="252" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Freios & Suspensão</text>
        <rect x="300" y="96" width="75" height="20" rx="10" fill="rgba(255,255,255,0.08)" />
        <text x="337" y="109" fill="white" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Câmbio Auto</text>
      </g>

      {/* Service cards */}
      {[
        { title: 'Diagnóstico Scanner 3D', price: 'Rastreio 100%', specs: 'Leitura de Injeção & ABS', badge: 'TECNOLOGIA' },
        { title: 'Revisão Preventiva', price: 'Garantia 1 Ano', specs: 'Troca de Óleo & 50 Itens', badge: 'MAIS PROCURADO' },
        { title: 'Troca de Óleo Câmbio', price: 'Flushing 100%', specs: 'Óleo Sintético Original', badge: 'ESPECIALIZADO' }
      ].map((p, i) => (
        <g key={i}>
          <rect x={15 + i*126} y="126" width="118" height="110" rx="10" fill="#121620" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
          <rect x={15 + i*126} y="126" width="118" height="42" rx="10" fill="#1C2230" />
          <text x={74 + i*126} y="152" fill="#F59E0B" fontSize="20" textAnchor="middle">🚘</text>
          <rect x={20 + i*126} y="130" width="65" height="11" rx="5" fill="#D97706" />
          <text x={52 + i*126} y="138" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">{p.badge}</text>
          
          <text x={74 + i*126} y="180" fill="white" fontSize="8.5" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="700">{p.title}</text>
          <text x={74 + i*126} y="192" fill="#FDE68A" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle">{p.specs}</text>
          <text x={74 + i*126} y="206" fill="#F59E0B" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">{p.price}</text>
          <rect x={39 + i*126} y="214" width="70" height="14" rx="7" fill="#F59E0B" />
          <text x={74 + i*126} y="224" fill="#0D0F14" fontSize="7" fontFamily="Inter, sans-serif" textAnchor="middle" fontWeight="900">Agendar Revisão</text>
        </g>
      ))}
    </svg>
  );
}
