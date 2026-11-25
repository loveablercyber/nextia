import { getWhatsAppLink } from '../utils/whatsapp';

export interface BioDemoItem {
  id: string;
  title: string;
  price: number;
  planId?: 'start' | 'pro' | 'business';
}

export interface BioDemoGalleryPhoto {
  src: string;
  alt: string;
  caption: string;
}

export interface BioDemoLink {
  label: string;
  to: string;
  external?: boolean;
}

export interface BioDemoProfile {
  slug: string;
  segment?: string;
  logoUrl: string;
  brand: string;
  subtitle: string;
  bioPath: string;
  bioUrl: string;
  gradient: string;
  whatsappHref: string;
  ctaLabel: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  hours: string;
  socials: Array<{ label: string; href: string }>;
  gallery: BioDemoGalleryPhoto[];
  items: BioDemoItem[];
  links: BioDemoLink[];
  chatbotGreeting: string;
  chatbotReplies: string[];
  isOfficialNextia?: boolean;
}

const makeLogoSvg = (initials: string, bg: string, fg = '#FFFFFF') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="20" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="${fg}">${initials}</text></svg>`
  )}`;

export const HERO_NEXTIA_DEMO: BioDemoProfile = {
  slug: 'nextia',
  logoUrl: '/favicon.svg',
  brand: 'Nextia Tecnologia',
  subtitle: 'Sites, Lojas Virtuais, Nextia Bio, Automação com IA & Suporte TI',
  bioPath: '/bio/nextia',
  bioUrl: 'https://nextia.dev.br/bio/nextia',
  gradient: 'from-[#0F2A56] to-[#1677FF]',
  whatsappHref: getWhatsAppLink('geral'),
  ctaLabel: 'Falar com a Nextia no WhatsApp',
  phone: '(14) 99640-5496',
  phoneHref: 'tel:+5514996405496',
  email: 'ola@nextia.dev.br',
  address: 'Bauru - SP e Região · Atendimento em todo o Brasil',
  hours: 'Seg–Sex · 08h às 18h',
  socials: [
    { label: 'Site Oficial', href: 'https://nextia.dev.br' },
    { label: 'WhatsApp', href: getWhatsAppLink('geral') },
    { label: 'Contato', href: '/contato' },
  ],
  gallery: [
    {
      src: '/images/templates/servicos-profissionais.webp',
      alt: 'Sites profissionais Nextia',
      caption: 'Sites institucionais e presença digital',
    },
    {
      src: '/images/templates/loja-tech-store.webp',
      alt: 'Lojas virtuais Nextia',
      caption: 'Lojas virtuais com checkout integrado',
    },
    {
      src: '/images/templates/clinica-estetica.webp',
      alt: 'Modelos prontos por segmento',
      caption: 'Modelos prontos para diversos segmentos',
    },
  ],
  items: [
    { id: 'start', title: 'Nextia Bio Start', price: 59, planId: 'start' },
    { id: 'pro', title: 'Nextia Bio Pro', price: 99, planId: 'pro' },
  ],
  links: [
    { label: 'Conhecer Nextia Bio', to: '/nextia-bio' },
    { label: 'Ver modelos de sites', to: '/modelos' },
    { label: 'Solicitar orçamento', to: '/orcamento' },
  ],
  chatbotGreeting: 'Olá! Sou o assistente da Nextia. Como posso ajudar sua empresa hoje?',
  chatbotReplies: [
    'Quero conhecer o Nextia Bio',
    'Ver planos e preços',
    'Falar com um especialista',
  ],
  isOfficialNextia: true,
};

export const SEGMENT_DEMOS: BioDemoProfile[] = [
  {
    slug: 'studiobellaforma',
    segment: 'Estética & Beleza',
    logoUrl: makeLogoSvg('SB', '#1677FF'),
    brand: 'Studio Bella Forma',
    subtitle: 'Estética & Bem-estar · Atendimento com hora marcada',
    bioPath: '/bio/studiobellaforma',
    bioUrl: 'https://nextia.dev.br/bio/studiobellaforma',
    gradient: 'from-[#0F2A56] to-[#1677FF]',
    whatsappHref: getWhatsAppLink('geral', 'Olá! Gostaria de agendar um horário no Studio Bella Forma.'),
    ctaLabel: 'Agendar pelo WhatsApp',
    phone: '(14) 99640-5496',
    phoneHref: 'tel:+5514996405496',
    email: 'ola@nextia.dev.br',
    address: 'Bauru - SP · Atendimento com hora marcada',
    hours: 'Seg–Sáb · 09h às 19h',
    socials: [
      { label: 'Instagram', href: '/modelos' },
      { label: 'WhatsApp', href: getWhatsAppLink('geral') },
    ],
    gallery: [
      {
        src: '/images/templates/clinica-estetica.webp',
        alt: 'Ambiente Studio Bella Forma',
        caption: 'Cabines de estética facial e corporal',
      },
      {
        src: '/images/templates/salao-elegance.webp',
        alt: 'Atendimento personalizado',
        caption: 'Protocolos exclusivos de bem-estar',
      },
      {
        src: '/images/templates/loja-moda-premium.webp',
        alt: 'Produtos de skincare',
        caption: 'Linha selecionada de cuidados diários',
      },
    ],
    items: [
      { id: 'limpeza', title: 'Limpeza de Pele', price: 140 },
      { id: 'spa', title: 'Combo Spa', price: 220 },
    ],
    links: [
      { label: 'Agendar horário online', to: '/orcamento' },
      { label: 'Ver galeria de resultados', to: '/bio/studiobellaforma/galeria' },
    ],
    chatbotGreeting: 'Olá! Quer verificar os horários disponíveis para hoje no Studio?',
    chatbotReplies: ['Horários de hoje', 'Valores dos combos', 'Endereço do Studio'],
  },
  {
    slug: 'bistrodapraca',
    segment: 'Gastronomia & Delivery',
    logoUrl: makeLogoSvg('BP', '#D97706'),
    brand: 'Bistrô da Praça',
    subtitle: 'Cardápio artesanal · Delivery e reservas',
    bioPath: '/bio/bistrodapraca',
    bioUrl: 'https://nextia.dev.br/bio/bistrodapraca',
    gradient: 'from-slate-900 to-amber-600',
    whatsappHref: getWhatsAppLink('geral', 'Olá! Gostaria de fazer um pedido no Bistrô da Praça.'),
    ctaLabel: 'Pedir no WhatsApp',
    phone: '(14) 99640-5496',
    phoneHref: 'tel:+5514996405496',
    email: 'ola@nextia.dev.br',
    address: 'Centro · Bauru - SP',
    hours: 'Ter–Dom · 11h às 23h',
    socials: [
      { label: 'Instagram', href: '/modelos' },
      { label: 'WhatsApp', href: getWhatsAppLink('geral') },
    ],
    gallery: [
      {
        src: '/images/templates/restaurante-premium.webp',
        alt: 'Salão do Bistrô da Praça',
        caption: 'Ambiente acolhedor para almoço e jantar',
      },
      {
        src: '/images/templates/loja-gourmet.webp',
        alt: 'Pratos artesanais',
        caption: 'Ingredientes frescos e cardápio sazonal',
      },
      {
        src: '/images/templates/hotel-pousada.png',
        alt: 'Eventos e reservas',
        caption: 'Espaço reservado para confraternizações',
      },
    ],
    items: [
      { id: 'executivo', title: 'Prato Executivo', price: 38.9 },
      { id: 'familia', title: 'Combo Família', price: 89 },
    ],
    links: [
      { label: 'Ver galeria de pratos', to: '/bio/bistrodapraca/galeria' },
      { label: 'Reservar mesa', to: '/contato' },
    ],
    chatbotGreeting: 'Bem-vindo ao Bistrô! Deseja fazer um pedido para entrega ou reservar mesa?',
    chatbotReplies: ['Cardápio do dia', 'Tempo de entrega', 'Reservar mesa'],
  },
  {
    slug: 'clinicavidaplena',
    segment: 'Saúde & Serviços',
    logoUrl: makeLogoSvg('CV', '#0D9488'),
    brand: 'Clínica Vida Plena',
    subtitle: 'Fisioterapia & Pilates · Avaliação personalizada',
    bioPath: '/bio/clinicavidaplena',
    bioUrl: 'https://nextia.dev.br/bio/clinicavidaplena',
    gradient: 'from-emerald-900 to-teal-600',
    whatsappHref: getWhatsAppLink('geral', 'Olá! Gostaria de agendar uma avaliação na Clínica Vida Plena.'),
    ctaLabel: 'Falar com a recepção',
    phone: '(14) 99640-5496',
    phoneHref: 'tel:+5514996405496',
    email: 'ola@nextia.dev.br',
    address: 'Bauru - SP · Estacionamento no local',
    hours: 'Seg–Sex · 07h às 20h',
    socials: [
      { label: 'Instagram', href: '/modelos' },
      { label: 'WhatsApp', href: getWhatsAppLink('geral') },
    ],
    gallery: [
      {
        src: '/images/templates/clinica-estetica.webp',
        alt: 'Consultórios da Clínica Vida Plena',
        caption: 'Salas equipadas para fisioterapia',
      },
      {
        src: '/images/templates/servicos-profissionais.webp',
        alt: 'Equipe especializada',
        caption: 'Atendimento individualizado e humanizado',
      },
      {
        src: '/images/templates/contabilidade.webp',
        alt: 'Recepção da clínica',
        caption: 'Recepção confortável e acessível',
      },
    ],
    items: [
      { id: 'avaliacao', title: 'Avaliação Postural', price: 120 },
      { id: 'pilates', title: 'Plano Mensal Pilates', price: 290 },
    ],
    links: [
      { label: 'Ver galeria da clínica', to: '/bio/clinicavidaplena/galeria' },
      { label: 'Solicitar agendamento', to: '/contato' },
    ],
    chatbotGreeting: 'Olá! Posso ajudar a agendar sua avaliação ou tirar dúvidas sobre convênios?',
    chatbotReplies: ['Agendar avaliação', 'Horários de Pilates', 'Convênios aceitos'],
  },
];

export const ALL_BIO_DEMOS: BioDemoProfile[] = [HERO_NEXTIA_DEMO, ...SEGMENT_DEMOS];

export function findBioDemoBySlug(slug?: string): BioDemoProfile {
  const normalized = String(slug || 'nextia').toLowerCase().trim();
  return ALL_BIO_DEMOS.find((item) => item.slug === normalized) ?? HERO_NEXTIA_DEMO;
}
