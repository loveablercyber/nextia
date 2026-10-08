export type PreviewService = { title: string; description: string };

export type PreviewContent = {
  eyebrow: string;
  headline: string;
  description: string;
  cta: string;
  aboutTitle: string;
  aboutText: string;
  servicesTitle: string;
  services: PreviewService[];
  bookingTitle: string;
  bookingText: string;
  bookingButton: string;
  phone: string;
  whatsapp: string;
  address: string;
};

export type SegmentPreset = {
  slug: string;
  name: string;
  description: string;
  templateSlug: string;
  image: string;
  accent: string;
  nav: string[];
  bookingLabel: string;
  content: PreviewContent;
};

export const segmentPresets: Record<string, SegmentPreset> = {
  contabilidade: {
    slug: 'contabilidade', name: 'Contabilidade', description: 'Confiança, documentos e atendimento', templateSlug: 'contabilidade', image: '/images/templates/contabilidade.webp', accent: '#0f766e', nav: ['Início', 'Soluções', 'Empresa', 'Contato'], bookingLabel: 'Agendar diagnóstico',
    content: { eyebrow: 'Contabilidade que impulsiona negócios', headline: 'Decisões mais seguras para sua empresa crescer', description: 'Rotinas contábeis, fiscais e estratégicas com atendimento próximo e informações claras.', cta: 'Falar com um especialista', aboutTitle: 'Mais clareza, menos burocracia', aboutText: 'Cuidamos da operação contábil para você ganhar tempo, reduzir riscos e tomar decisões com confiança.', servicesTitle: 'Soluções para cada fase do negócio', services: [{ title: 'Abertura de empresas', description: 'Enquadramento e formalização com orientação completa.' }, { title: 'Contabilidade mensal', description: 'Obrigações em dia e números organizados para sua gestão.' }, { title: 'Consultoria tributária', description: 'Análise responsável para melhorar eficiência e previsibilidade.' }], bookingTitle: 'Converse com um contador', bookingText: 'Escolha um horário para uma avaliação inicial do seu negócio.', bookingButton: 'Agendar conversa', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
  advocacia: {
    slug: 'advocacia', name: 'Advocacia', description: 'Autoridade e contato responsável', templateSlug: 'servicos-profissionais', image: '/images/templates/servicos-profissionais.webp', accent: '#7c2d12', nav: ['Início', 'Atuação', 'Escritório', 'Contato'], bookingLabel: 'Agendar consulta',
    content: { eyebrow: 'Atuação jurídica responsável', headline: 'Estratégia, transparência e atenção em cada caso', description: 'Atendimento jurídico personalizado para pessoas e empresas, com comunicação clara do início ao fim.', cta: 'Solicitar atendimento', aboutTitle: 'Experiência a serviço das suas decisões', aboutText: 'Analisamos cada contexto com cuidado técnico, ética e uma estratégia jurídica adequada aos seus objetivos.', servicesTitle: 'Áreas de atuação', services: [{ title: 'Direito empresarial', description: 'Prevenção de riscos e suporte jurídico para empresas.' }, { title: 'Contratos', description: 'Elaboração e revisão de instrumentos com segurança.' }, { title: 'Consultoria jurídica', description: 'Orientação estratégica para decisões importantes.' }], bookingTitle: 'Agende uma consulta inicial', bookingText: 'Informe a área e escolha o melhor horário para conversar com o escritório.', bookingButton: 'Escolher horário', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
  clinicas: {
    slug: 'clinicas', name: 'Clínicas', description: 'Serviços, equipe e agendamento', templateSlug: 'clinica-estetica', image: '/images/templates/clinica-estetica.webp', accent: '#0e7490', nav: ['Início', 'Tratamentos', 'Equipe', 'Agendar'], bookingLabel: 'Agendar consulta',
    content: { eyebrow: 'Cuidado próximo e profissional', headline: 'Sua saúde merece atenção em cada detalhe', description: 'Especialidades, equipe qualificada e agendamento simples em uma experiência acolhedora.', cta: 'Agendar atendimento', aboutTitle: 'Cuidado pensado para você', aboutText: 'Unimos atendimento humanizado, estrutura moderna e acompanhamento próximo para uma jornada mais tranquila.', servicesTitle: 'Especialidades e tratamentos', services: [{ title: 'Avaliação personalizada', description: 'Escuta cuidadosa e plano de atendimento individual.' }, { title: 'Equipe especializada', description: 'Profissionais preparados para diferentes necessidades.' }, { title: 'Acompanhamento', description: 'Orientação antes, durante e depois do atendimento.' }], bookingTitle: 'Reserve seu atendimento', bookingText: 'Selecione a especialidade, a data e o horário de sua preferência.', bookingButton: 'Ver horários', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
  restaurantes: {
    slug: 'restaurantes', name: 'Restaurantes', description: 'Cardápio, reservas e WhatsApp', templateSlug: 'restaurante-premium', image: '/images/templates/restaurante-premium.webp', accent: '#b45309', nav: ['Início', 'Cardápio', 'Reservas', 'Localização'], bookingLabel: 'Reservar mesa',
    content: { eyebrow: 'Sabores que criam memórias', headline: 'Uma experiência especial começa antes da primeira garfada', description: 'Conheça o cardápio, descubra nossos destaques e reserve sua mesa em poucos passos.', cta: 'Ver cardápio', aboutTitle: 'Ingredientes, cuidado e identidade', aboutText: 'Uma cozinha feita com ingredientes selecionados, ambiente acolhedor e atenção em todos os detalhes.', servicesTitle: 'Destaques da casa', services: [{ title: 'Menu autoral', description: 'Pratos preparados com ingredientes frescos e sazonais.' }, { title: 'Reservas online', description: 'Garanta sua mesa com confirmação rápida.' }, { title: 'Pedidos pelo WhatsApp', description: 'Peça para retirar ou receber com praticidade.' }], bookingTitle: 'Reserve sua mesa', bookingText: 'Escolha a data, o horário e a quantidade de pessoas.', bookingButton: 'Consultar mesas', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
  hoteis: {
    slug: 'hoteis', name: 'Hotéis e pousadas', description: 'Quartos, reservas e localização', templateSlug: 'hotel-pousada', image: '/images/templates/hotel-pousada.png', accent: '#166534', nav: ['Início', 'Acomodações', 'Experiências', 'Reservar'], bookingLabel: 'Reservar quarto',
    content: { eyebrow: 'Uma estadia para lembrar', headline: 'Conforto, natureza e hospitalidade em cada detalhe', description: 'Conheça as acomodações, explore experiências e consulte disponibilidade diretamente pelo site.', cta: 'Ver acomodações', aboutTitle: 'Seu descanso começa aqui', aboutText: 'Ambientes acolhedores, atendimento próximo e uma localização especial para transformar cada estadia em uma boa lembrança.', servicesTitle: 'Viva a experiência completa', services: [{ title: 'Acomodações confortáveis', description: 'Quartos equipados, fotos detalhadas e informações claras.' }, { title: 'Reserva online', description: 'Consulte datas, hóspedes e disponibilidade pelo site.' }, { title: 'Experiências locais', description: 'Descubra serviços, passeios e atrativos próximos.' }], bookingTitle: 'Consulte sua estadia', bookingText: 'Informe entrada, saída e número de hóspedes para consultar acomodações disponíveis.', bookingButton: 'Consultar disponibilidade', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Região turística, São Paulo - SP' },
  },
  'saloes-de-beleza': {
    slug: 'saloes-de-beleza', name: 'Beleza', description: 'Portfólio, serviços e agenda', templateSlug: 'salao-elegance', image: '/images/templates/salao-elegance.webp', accent: '#a21caf', nav: ['Início', 'Serviços', 'Resultados', 'Agenda'], bookingLabel: 'Agendar serviço',
    content: { eyebrow: 'Beleza, cuidado e confiança', headline: 'Um atendimento pensado para realçar sua melhor versão', description: 'Conheça nossos serviços, resultados e profissionais. Agende seu horário sem precisar ligar.', cta: 'Agendar agora', aboutTitle: 'Seu momento de cuidado', aboutText: 'Técnica, produtos de qualidade e atendimento personalizado em um espaço criado para você se sentir bem.', servicesTitle: 'Serviços em destaque', services: [{ title: 'Cabelo e tratamentos', description: 'Corte, cor e tratamentos escolhidos para você.' }, { title: 'Estética e bem-estar', description: 'Protocolos para valorizar sua beleza natural.' }, { title: 'Agenda online', description: 'Escolha serviço, profissional e horário pelo site.' }], bookingTitle: 'Escolha seu próximo horário', bookingText: 'Selecione o serviço, o profissional e a melhor data para você.', bookingButton: 'Abrir agenda', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
  'prestadores-de-servicos': {
    slug: 'prestadores-de-servicos', name: 'Serviços', description: 'Trabalhos, regiões e orçamento', templateSlug: 'servicos-profissionais', image: '/images/templates/servicos-profissionais.webp', accent: '#1d4ed8', nav: ['Início', 'Serviços', 'Projetos', 'Orçamento'], bookingLabel: 'Solicitar visita',
    content: { eyebrow: 'Serviço profissional do início ao fim', headline: 'Soluções confiáveis para o que você precisa', description: 'Atendimento ágil, orçamento transparente e serviços realizados com cuidado e garantia.', cta: 'Solicitar orçamento', aboutTitle: 'Compromisso com um bom resultado', aboutText: 'Entendemos sua necessidade, explicamos cada etapa e executamos o serviço com organização e responsabilidade.', servicesTitle: 'Como podemos ajudar', services: [{ title: 'Atendimento especializado', description: 'Diagnóstico claro e solução adequada à necessidade.' }, { title: 'Orçamento rápido', description: 'Escopo e valores apresentados de forma transparente.' }, { title: 'Suporte pós-serviço', description: 'Acompanhamento para você ficar tranquilo.' }], bookingTitle: 'Solicite uma visita', bookingText: 'Informe o serviço e escolha uma janela de atendimento.', bookingButton: 'Consultar agenda', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Bauru e região - SP' },
  },
  lojas: {
    slug: 'lojas', name: 'Comércio', description: 'Produtos, atendimento e localização', templateSlug: 'loja-catalogo', image: '/images/templates/loja-catalogo.webp', accent: '#be123c', nav: ['Início', 'Produtos', 'Novidades', 'Contato'], bookingLabel: 'Falar com a loja',
    content: { eyebrow: 'Novidades selecionadas para você', headline: 'Produtos que combinam qualidade, estilo e praticidade', description: 'Explore os destaques, consulte disponibilidade e compre com atendimento rápido pelo WhatsApp.', cta: 'Ver produtos', aboutTitle: 'Uma curadoria feita com cuidado', aboutText: 'Selecionamos produtos de qualidade e oferecemos atendimento próximo para facilitar cada escolha.', servicesTitle: 'O que você encontra', services: [{ title: 'Produtos em destaque', description: 'Uma seleção atualizada dos itens mais procurados.' }, { title: 'Compra assistida', description: 'Tire dúvidas e finalize pelo WhatsApp.' }, { title: 'Retirada e entrega', description: 'Escolha a opção mais conveniente para receber.' }], bookingTitle: 'Precisa de ajuda para escolher?', bookingText: 'Conte o que procura e nossa equipe prepara uma seleção para você.', bookingButton: 'Pedir atendimento', phone: '(14) 99999-0000', whatsapp: '5514999990000', address: 'Centro, Bauru - SP' },
  },
};

export const segmentOptions = Object.values(segmentPresets).map((preset) => [preset.slug, preset.name, preset.description] as const);

export function createPreviewContent(segment: string, businessName: string): PreviewContent {
  const preset = segmentPresets[segment] || segmentPresets['prestadores-de-servicos'];
  return { ...preset.content, services: preset.content.services.map((service) => ({ ...service })), headline: preset.content.headline.replace('Sua empresa', businessName) };
}
