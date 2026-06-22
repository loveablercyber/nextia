export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  segment: string;
  text: string;
  avatar: string;
  rating: number;
  plan: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Carlos Mendes",
    company: "Restaurante Sabor & Arte",
    role: "Proprietário",
    segment: "Restaurante",
    text: "Em menos de 5 dias meu restaurante já tinha um site profissional e bonito. As reservas online aumentaram 40% no primeiro mês! Vale cada centavo da mensalidade.",
    avatar: "CM",
    rating: 5,
    plan: "Pro",
  },
  {
    id: "2",
    name: "Fernanda Oliveira",
    company: "Salão Beleza & Charme",
    role: "Proprietária",
    segment: "Salão de beleza",
    text: "Minha agenda de agendamentos está sempre cheia agora. O site ficou lindo, os clientes adoraram e o processo de criação foi muito fácil e rápido.",
    avatar: "FO",
    rating: 5,
    plan: "Business",
  },
  {
    id: "3",
    name: "Ricardo Alves",
    company: "RA Consultoria Contábil",
    role: "Contador",
    segment: "Contabilidade",
    text: "Profissionalismo que meus clientes notam imediatamente. O site passou credibilidade e já captei 3 novos clientes empresariais no primeiro mês após o lançamento.",
    avatar: "RA",
    rating: 5,
    plan: "Pro",
  },
  {
    id: "4",
    name: "Mariana Costa",
    company: "Studio MC - Estética Avançada",
    role: "Esteticista e proprietária",
    segment: "Clínica e estética",
    text: "Antes eu pagava caro por mês e o suporte era péssimo. Com a Nextia tenho mais recursos, melhor suporte e pago menos. Recomendo demais!",
    avatar: "MC",
    rating: 5,
    plan: "Business",
  },
  {
    id: "5",
    name: "João Pereira",
    company: "Auto Center JP",
    role: "Gerente",
    segment: "Oficina mecânica",
    text: "Site simples, direto e funcional. Meus clientes chegam já sabendo os serviços que ofereço. O WhatsApp integrado facilita muito o contato.",
    avatar: "JP",
    rating: 5,
    plan: "Start",
  },
  {
    id: "6",
    name: "Ana Rodrigues",
    company: "AR Imóveis",
    role: "Corretora de imóveis",
    segment: "Imobiliária",
    text: "O site de imóveis ficou exatamente como eu imaginava. Clientes chegam pelo Google e eu já fecho negócios pela plataforma. Excelente investimento!",
    avatar: "AR",
    rating: 5,
    plan: "Business",
  },
];

export const stats = [
  { value: "850+", label: "Sites ativos" },
  { value: "98%", label: "Clientes satisfeitos" },
  { value: "4 dias", label: "Tempo médio de entrega" },
  { value: "24/7", label: "Suporte disponível" },
];
