export interface NextiaBioPlan {
  id: 'start' | 'pro' | 'business';
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  activationFee: number;
  badge?: string;
  highlight?: boolean;
  limits: {
    links: string;
    products: string;
    sections: string;
    customDomain: boolean;
  };
  features: string[];
  ctaLabel: string;
}

export interface NextiaBioOptional {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  billingType: 'one_time' | 'monthly' | 'annual';
  billingLabel: string;
  compatiblePlans: Array<'start' | 'pro' | 'business'>;
  available: boolean;
  badge?: string;
}

export const NEXTIA_BIO_PLANS: NextiaBioPlan[] = [
  {
    id: 'start',
    name: 'Plano Start',
    displayName: 'Start',
    tagline: 'Para quem precisa começar sua presença digital.',
    description: 'Tudo o que você precisa para ter uma página profissional no ar com contato direto no WhatsApp.',
    monthlyPrice: 59,
    annualMonthlyPrice: 49,
    activationFee: 197,
    limits: {
      links: 'Até 10 links personalizados',
      products: 'Sem catálogo de produtos',
      sections: 'Perfil + Links + WhatsApp',
      customDomain: false,
    },
    features: [
      'Página profissional Nextia Bio',
      'Foto ou logotipo',
      'Descrição do negócio',
      'Botão de WhatsApp',
      'Links para redes sociais',
      'Links personalizados',
      'Layout responsivo',
      'QR Code de compartilhamento',
      'Endereço padrão Nextia Bio',
    ],
    ctaLabel: 'Contratar Start',
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    displayName: 'Pro',
    tagline: 'Para quem deseja apresentar melhor seus produtos e serviços.',
    description: 'Ideal para autônomos e empresas que querem divulgar ofertas, personalizar o visual e conectar domínio próprio.',
    monthlyPrice: 99,
    annualMonthlyPrice: 82,
    activationFee: 247,
    badge: 'Mais popular',
    highlight: true,
    limits: {
      links: 'Links ilimitados',
      products: 'Até 20 produtos ou serviços',
      sections: 'Seções adicionais de conteúdo',
      customDomain: true,
    },
    features: [
      'Tudo do Plano Start',
      'Catálogo de produtos e serviços',
      'Mais possibilidades de personalização visual',
      'Seções adicionais de conteúdo',
      'Links e botões de destaque',
      'Recursos adicionais de apresentação comercial',
      'Possibilidade de utilizar domínio próprio (opcional)',
    ],
    ctaLabel: 'Contratar Pro',
  },
  {
    id: 'business',
    name: 'Plano Premium',
    displayName: 'Premium',
    tagline: 'Para empresas e profissionais que desejam uma presença digital mais completa.',
    description: 'Capacidade ampliada, personalização avançada, integrações disponíveis na plataforma e prioridade no suporte.',
    monthlyPrice: 159,
    annualMonthlyPrice: 132,
    activationFee: 297,
    limits: {
      links: 'Links ilimitados',
      products: 'Catálogo expandido',
      sections: 'Seções comerciais completas',
      customDomain: true,
    },
    features: [
      'Tudo do Plano Pro',
      'Recursos avançados de personalização',
      'Maior capacidade de apresentação de produtos e serviços',
      'Seções comerciais adicionais',
      'Recursos avançados de divulgação',
      'Integrações adicionais disponíveis na plataforma',
      'Prioridade no suporte',
      'Possibilidade de utilizar domínio próprio (opcional)',
    ],
    ctaLabel: 'Contratar Premium',
  },
];

export const NEXTIA_BIO_OPTIONALS: NextiaBioOptional[] = [
  {
    id: 'domain-registration',
    code: 'domain-registration',
    name: 'Domínio personalizado',
    description: 'Substitua o endereço padrão por um domínio exclusivo para sua marca (ex: www.suaempresa.com.br), transmitindo mais profissionalismo e credibilidade.',
    price: 79,
    billingType: 'annual',
    billingLabel: 'pagamento anual',
    compatiblePlans: ['pro', 'business'],
    available: true,
    badge: 'Mais escolhido',
  },
  {
    id: 'bio-advanced-customization',
    code: 'bio-advanced-customization',
    name: 'Personalização avançada',
    description: 'Deixe seu Nextia Bio alinhado à identidade da sua marca, com ajustes visuais e apresentação profissional.',
    price: 149,
    billingType: 'one_time',
    billingLabel: 'pagamento único',
    compatiblePlans: ['start', 'pro', 'business'],
    available: true,
  },
  {
    id: 'bio-expanded-catalog',
    code: 'bio-expanded-catalog',
    name: 'Catálogo expandido',
    description: 'Amplie a apresentação de produtos e serviços com maior capacidade de itens e organização comercial.',
    price: 39,
    billingType: 'monthly',
    billingLabel: 'cobrança mensal',
    compatiblePlans: ['pro', 'business'],
    available: true,
  },
  {
    id: 'bio-assisted-setup',
    code: 'bio-assisted-setup',
    name: 'Configuração assistida',
    description: 'A equipe Nextia realiza o auxílio na configuração inicial da página, organização das informações, links e apresentação comercial.',
    price: 129,
    billingType: 'one_time',
    billingLabel: 'pagamento único',
    compatiblePlans: ['start', 'pro', 'business'],
    available: true,
  },
  {
    id: 'bio-ai-whatsapp',
    code: 'bio-ai-whatsapp',
    name: 'Automação de atendimento com IA',
    description: 'Serviço complementar da Nextia: automatize parte do atendimento pelo WhatsApp com inteligência artificial, facilitando respostas e o relacionamento com seus clientes.',
    price: 199,
    billingType: 'monthly',
    billingLabel: 'serviço complementar mensal',
    compatiblePlans: ['start', 'pro', 'business'],
    available: true,
    badge: 'Serviço complementar',
  },
];

export const NEXTIA_BIO_FEATURES = [
  {
    title: 'Perfil profissional',
    description: 'Apresente foto, logotipo, nome e descrição do seu negócio com visual limpo e confiável.',
    icon: 'UserCheck',
  },
  {
    title: 'Botão de WhatsApp',
    description: 'Receba contatos diretamente no seu WhatsApp com um clique, sem atritos para o cliente.',
    icon: 'MessageCircle',
  },
  {
    title: 'Redes sociais',
    description: 'Conecte Instagram, Facebook, TikTok e outras plataformas em um único endereço.',
    icon: 'Share2',
  },
  {
    title: 'Links personalizados',
    description: 'Adicione links importantes para agendamentos, cardápios, localização ou formulários.',
    icon: 'Link2',
  },
  {
    title: 'Catálogo de produtos e serviços',
    description: 'Apresente o que você vende com organização, fotos e chamadas para ação.',
    icon: 'ShoppingBag',
  },
  {
    title: 'Informações comerciais',
    description: 'Exiba endereço, horário de atendimento e formas de contato de maneira clara.',
    icon: 'MapPin',
  },
  {
    title: 'Personalização visual',
    description: 'Adapte cores, identidade e aparência da página para refletir a sua marca.',
    icon: 'Palette',
  },
  {
    title: 'QR Code',
    description: 'Gere e compartilhe o QR Code da sua página em cartões, balcões e materiais impressos.',
    icon: 'QrCode',
  },
  {
    title: 'Design responsivo',
    description: 'Funcionamento fluido em celulares, tablets e computadores com carregamento rápido.',
    icon: 'Smartphone',
  },
] as const;

export const NEXTIA_BIO_FAQ = [
  {
    question: 'O que é o Nextia Bio?',
    answer: 'O Nextia Bio é uma mini página profissional personalizada criada para apresentar seu negócio, organizar seus canais de atendimento, divulgar produtos e serviços e transformar visitantes em clientes.',
  },
  {
    question: 'Preciso ter conhecimento técnico?',
    answer: 'Não. A plataforma foi pensada para ser simples e rápida. Além disso, você pode contratar a Configuração assistida caso queira que a equipe Nextia faça a organização inicial com você.',
  },
  {
    question: 'Posso utilizar meu próprio domínio?',
    answer: 'Sim. Nos planos Pro e Premium você pode utilizar um domínio próprio (como www.suaempresa.com.br), contratando o registro na própria Nextia ou apontando um domínio que já pertence a você.',
  },
  {
    question: 'Posso alterar as informações da página depois?',
    answer: 'Sim. Você pode atualizar links, textos, contatos e informações comerciais sempre que precisar.',
  },
  {
    question: 'Posso adicionar produtos e serviços?',
    answer: 'Sim. A partir do Plano Pro você conta com catálogo de produtos e serviços, podendo ainda expandir a capacidade com o opcional de Catálogo expandido ou no Plano Premium.',
  },
  {
    question: 'Como funciona a assinatura?',
    answer: 'A assinatura possui taxa de ativação inicial e cobrança recorrente conforme o plano escolhido (mensal ou anual). Tudo é gerenciado pelo fluxo oficial de pedidos e pagamentos da Nextia.',
  },
  {
    question: 'Posso mudar de plano?',
    answer: 'Sim. Você pode solicitar upgrade ou alteração de plano conforme as regras comerciais da plataforma, acompanhando tudo pela sua área do cliente.',
  },
  {
    question: 'O domínio está incluído na assinatura?',
    answer: 'Não. O endereço padrão Nextia Bio já está incluído em todos os planos. O domínio personalizado (.com.br, .com, etc.) é um recurso opcional contratado à parte.',
  },
  {
    question: 'O atendimento com IA está incluído?',
    answer: 'Não. A Automação de atendimento com IA é um serviço complementar da Nextia contratado separadamente, respeitando as integrações e condições da plataforma.',
  },
  {
    question: 'Como funciona o cancelamento e a renovação?',
    answer: 'A renovação segue o ciclo contratado (mensal ou anual) e o cancelamento pode ser solicitado pela área do cliente ou suporte Nextia antes da próxima cobrança.',
  },
];
