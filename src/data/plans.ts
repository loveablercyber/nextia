export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  activationFee: number;
  color: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  notIncluded: string[];
  requestsPerMonth: number;
  ctaLabel: string;
}

export const plans: Plan[] = [
  {
    id: "start",
    name: "Nextia Start",
    subtitle: "Para negócios que precisam de presença digital básica",
    price: 59,
    activationFee: 197,
    color: "slate",
    highlight: false,
    features: [
      "Site profissional completo",
      "Até 5 seções",
      "Hospedagem incluída",
      "SSL gratuito",
      "Formulário de contato",
      "Botão de WhatsApp",
      "Design responsivo (mobile)",
      "Suporte por e-mail",
      "1 solicitação simples/mês",
      "Domínio opcional",
    ],
    notIncluded: [
      "SEO avançado",
      "Agendamento online",
      "Integração com redes sociais",
      "Relatórios de acesso",
    ],
    requestsPerMonth: 1,
    ctaLabel: "Assinar Start",
  },
  {
    id: "pro",
    name: "Nextia Pro",
    subtitle: "Para empresas que precisam de mais estrutura e visibilidade",
    price: 99,
    activationFee: 247,
    color: "primary",
    highlight: true,
    badge: "Mais popular",
    features: [
      "Tudo do plano Start",
      "Mais páginas e seções",
      "SEO básico configurado",
      "Integração com redes sociais",
      "Google Analytics integrado",
      "2 solicitações mensais",
      "Relatório básico mensal",
      "Suporte prioritário",
      "Backup automático",
      "Domínio gratuito no 1º ano",
    ],
    notIncluded: [
      "Agendamento online",
      "Catálogo avançado",
      "Automação de leads",
    ],
    requestsPerMonth: 2,
    ctaLabel: "Assinar Pro",
  },
  {
    id: "business",
    name: "Nextia Business",
    subtitle: "Para negócios que precisam vender ou receber agendamentos",
    price: 159,
    activationFee: 297,
    color: "secondary",
    highlight: false,
    features: [
      "Tudo do plano Pro",
      "Agendamento online",
      "Cardápio ou catálogo digital",
      "Formulário avançado",
      "Integrações extras",
      "4 solicitações mensais",
      "Relatório avançado mensal",
      "Suporte prioritário",
      "Automação básica de leads",
      "Domínio gratuito no 1º ano",
      "Consultoria de lançamento",
    ],
    notIncluded: [],
    requestsPerMonth: 4,
    ctaLabel: "Assinar Business",
  },
  {
    id: "custom",
    name: "Projeto Personalizado",
    subtitle: "Para sites exclusivos, sistemas e integrações sob medida",
    price: 0,
    activationFee: 0,
    color: "gradient",
    highlight: false,
    features: [
      "Orçamento sob medida",
      "Escopo totalmente personalizado",
      "Cronograma próprio",
      "Design exclusivo",
      "Funcionalidades customizadas",
      "Integrações específicas",
      "Manutenção mensal opcional",
      "Suporte dedicado",
    ],
    notIncluded: [],
    requestsPerMonth: 0,
    ctaLabel: "Solicitar orçamento",
  },
];

export const planComparison = [
  { feature: "Site profissional", start: true, pro: true, business: true },
  { feature: "Hospedagem e SSL", start: true, pro: true, business: true },
  { feature: "Design responsivo", start: true, pro: true, business: true },
  { feature: "WhatsApp integrado", start: true, pro: true, business: true },
  { feature: "Formulário de contato", start: true, pro: true, business: true },
  { feature: "Mais páginas", start: false, pro: true, business: true },
  { feature: "SEO básico", start: false, pro: true, business: true },
  { feature: "Redes sociais", start: false, pro: true, business: true },
  { feature: "Google Analytics", start: false, pro: true, business: true },
  { feature: "Agendamento online", start: false, pro: false, business: true },
  { feature: "Catálogo / Cardápio", start: false, pro: false, business: true },
  { feature: "Automação de leads", start: false, pro: false, business: true },
  { feature: "Solicitações/mês", start: "1", pro: "2", business: "4" },
  { feature: "Suporte", start: "E-mail", pro: "Prioritário", business: "Prioritário" },
  { feature: "Domínio grátis", start: false, pro: "1º ano", business: "1º ano" },
];
