export type ServiceCategory = 'digital' | 'automation' | 'techcare' | 'infrastructure' | 'security';

export interface ServiceOffer {
  slug: string;
  name: string;
  eyebrow: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  price?: number;
  priceLabel?: string;
  recurring?: boolean;
  accent: string;
  soft: string;
  benefits: string[];
  deliverables: string[];
  faq: Array<{ question: string; answer: string }>;
}

const commonFaq = (name: string): ServiceOffer['faq'] => [
  { question: 'Como começa a contratação?', answer: `Após o pedido, a equipe Nextia confirma o escopo de ${name}, os acessos necessários e o prazo antes de iniciar.` },
  { question: 'O valor pode mudar?', answer: 'O preço informado cobre o escopo padrão. Necessidades adicionais são apresentadas e aprovadas antes de qualquer cobrança.' },
  { question: 'Existe suporte após a entrega?', answer: 'Sim. A entrega inclui validação e orientação. Planos contínuos podem ser adicionados quando houver necessidade recorrente.' },
];

export const serviceCatalog: ServiceOffer[] = [
  {
    slug: 'sites', name: 'Sites profissionais', eyebrow: 'Presença digital', category: 'digital',
    summary: 'Sites rápidos, responsivos e preparados para transformar visitas em contatos.',
    description: 'Estratégia, design, desenvolvimento e publicação em um fluxo acompanhado do início ao fim.',
    price: 197, priceLabel: 'ativação a partir de', accent: '#1677FF', soft: '#EAF3FF',
    benefits: ['Design responsivo', 'SEO técnico essencial', 'Hospedagem e SSL', 'Integração com WhatsApp'],
    deliverables: ['Briefing orientado', 'Layout alinhado à marca', 'Publicação e domínio', 'Painel do cliente para acompanhar o projeto'], faq: commonFaq('um site profissional'),
  },
  {
    slug: 'landing-pages', name: 'Landing pages', eyebrow: 'Conversão', category: 'digital',
    summary: 'Páginas focadas em campanhas, captação de leads e lançamento de ofertas.',
    description: 'Uma experiência objetiva com mensagem, prova, oferta e chamada para ação mensurável.',
    price: 497, priceLabel: 'projeto a partir de', accent: '#35B7FF', soft: '#EAF9FF',
    benefits: ['Copy orientada à conversão', 'Formulário integrado', 'Analytics', 'Alta performance'],
    deliverables: ['Planejamento da oferta', 'Página responsiva', 'Configuração de métricas', 'Publicação'], faq: commonFaq('uma landing page'),
  },
  {
    slug: 'lojas-virtuais', name: 'Lojas virtuais', eyebrow: 'Comércio digital', category: 'digital',
    summary: 'Operação de vendas online com catálogo, pagamento e gestão de pedidos.',
    description: 'Estrutura comercial segura para apresentar produtos e receber pedidos em qualquer dispositivo.',
    price: 1490, priceLabel: 'projeto a partir de', accent: '#1677FF', soft: '#EAF3FF',
    benefits: ['Catálogo gerenciável', 'Checkout integrado', 'Gestão de pedidos', 'Treinamento de operação'],
    deliverables: ['Configuração da loja', 'Meios de pagamento', 'Frete e políticas', 'Publicação assistida'], faq: commonFaq('uma loja virtual'),
  },
  {
    slug: 'sistemas', name: 'Sistemas sob medida', eyebrow: 'Software', category: 'digital',
    summary: 'Aplicações web para organizar processos, dados e rotinas específicas da empresa.',
    description: 'Mapeamos a operação e construímos módulos priorizados com segurança e capacidade de evolução.',
    priceLabel: 'sob orçamento', accent: '#1677FF', soft: '#EAF3FF',
    benefits: ['Arquitetura escalável', 'Acessos por perfil', 'Dados centralizados', 'Evolução por etapas'],
    deliverables: ['Descoberta técnica', 'Protótipo funcional', 'Desenvolvimento', 'Implantação e documentação'], faq: commonFaq('um sistema sob medida'),
  },
  {
    slug: 'automacao-ia', name: 'Automação e IA', eyebrow: 'Eficiência operacional', category: 'automation',
    summary: 'Automatize tarefas repetitivas e use inteligência artificial com objetivos claros.',
    description: 'Integrações, agentes e fluxos desenhados para reduzir trabalho manual sem perder controle.',
    price: 790, priceLabel: 'implantação a partir de', accent: '#7C5CFF', soft: '#F1EFFF',
    benefits: ['Mapeamento do processo', 'Integrações confiáveis', 'Monitoramento', 'Documentação do fluxo'],
    deliverables: ['Diagnóstico', 'Automação implementada', 'Testes de exceção', 'Treinamento'], faq: commonFaq('uma automação'),
  },
  {
    slug: 'chatbot', name: 'Chatbots inteligentes', eyebrow: 'Atendimento', category: 'automation',
    summary: 'Atendimento inicial consistente, triagem de demandas e captura de oportunidades.',
    description: 'Um assistente alinhado ao negócio, com transferência para atendimento humano quando necessário.',
    price: 490, priceLabel: 'implantação a partir de', accent: '#7C5CFF', soft: '#F1EFFF',
    benefits: ['Base de conhecimento', 'Triagem automática', 'Captura de contatos', 'Escalonamento humano'],
    deliverables: ['Roteiro de atendimento', 'Configuração', 'Testes', 'Painel de acompanhamento'], faq: commonFaq('um chatbot'),
  },
  {
    slug: 'automacao-whatsapp', name: 'Automação para WhatsApp', eyebrow: 'Relacionamento', category: 'automation',
    summary: 'Organize respostas, qualificação e encaminhamento de contatos no WhatsApp.',
    description: 'Fluxos comerciais e de suporte conectados ao processo real da sua equipe.',
    price: 590, priceLabel: 'implantação a partir de', accent: '#7C5CFF', soft: '#F1EFFF',
    benefits: ['Respostas padronizadas', 'Distribuição de contatos', 'Integração com sistemas', 'Histórico organizado'],
    deliverables: ['Desenho do fluxo', 'Configuração dos canais', 'Homologação', 'Treinamento'], faq: commonFaq('uma automação de WhatsApp'),
  },
  {
    slug: 'techcare', name: 'TechCare', eyebrow: 'Tecnologia funcionando', category: 'techcare',
    summary: 'Suporte técnico para resolver incidentes e manter a operação produtiva.',
    description: 'Atendimento remoto ou presencial, com registro, diagnóstico e histórico do serviço.',
    price: 59, priceLabel: 'atendimento a partir de', accent: '#FF8A2A', soft: '#FFF2E8',
    benefits: ['Diagnóstico claro', 'Atendimento rastreável', 'Técnicos qualificados', 'Planos recorrentes'],
    deliverables: ['Abertura do chamado', 'Diagnóstico', 'Execução autorizada', 'Relatório do atendimento'], faq: commonFaq('um atendimento TechCare'),
  },
  {
    slug: 'suporte-ti', name: 'Suporte de TI', eyebrow: 'Operação assistida', category: 'techcare',
    summary: 'Suporte contínuo para computadores, usuários e recursos essenciais da empresa.',
    description: 'Uma rotina organizada de chamados, prioridades e acompanhamento para reduzir indisponibilidade.',
    price: 199, priceLabel: 'plano mensal a partir de', recurring: true, accent: '#FF8A2A', soft: '#FFF2E8',
    benefits: ['Fila de atendimento', 'SLA por prioridade', 'Histórico por equipamento', 'Relatórios gerenciais'],
    deliverables: ['Onboarding técnico', 'Inventário inicial', 'Canal de chamados', 'Acompanhamento mensal'], faq: commonFaq('suporte de TI'),
  },
  {
    slug: 'suporte-remoto', name: 'Suporte remoto', eyebrow: 'Atendimento ágil', category: 'techcare',
    summary: 'Diagnóstico e correção à distância para falhas de software e configuração.',
    description: 'Sessão autorizada e segura, conduzida por técnico e registrada no seu histórico.',
    price: 59, priceLabel: 'por atendimento a partir de', accent: '#FF8A2A', soft: '#FFF2E8',
    benefits: ['Agendamento rápido', 'Acesso autorizado', 'Registro da solução', 'Sem deslocamento'],
    deliverables: ['Triagem', 'Sessão remota', 'Correção possível no escopo', 'Resumo técnico'], faq: commonFaq('suporte remoto'),
  },
  {
    slug: 'manutencao-computadores', name: 'Manutenção de computadores', eyebrow: 'Desempenho', category: 'techcare',
    summary: 'Diagnóstico, limpeza, reparo e atualização para desktops profissionais e pessoais.',
    description: 'Avaliação técnica transparente antes do reparo, com orçamento para peças quando necessário.',
    price: 89, priceLabel: 'serviço a partir de', accent: '#FF8A2A', soft: '#FFF2E8',
    benefits: ['Diagnóstico documentado', 'Limpeza preventiva', 'Otimização', 'Teste de estabilidade'],
    deliverables: ['Checklist de entrada', 'Diagnóstico', 'Serviço aprovado', 'Checklist de entrega'], faq: commonFaq('manutenção de computador'),
  },
  {
    slug: 'manutencao-notebooks', name: 'Manutenção de notebooks', eyebrow: 'Mobilidade', category: 'techcare',
    summary: 'Cuidados especializados para desempenho, refrigeração e componentes de notebooks.',
    description: 'Processo seguro de recebimento, diagnóstico e validação final do equipamento.',
    price: 99, priceLabel: 'serviço a partir de', accent: '#FF8A2A', soft: '#FFF2E8',
    benefits: ['Limpeza interna', 'Avaliação térmica', 'Upgrade orientado', 'Teste de bateria e portas'],
    deliverables: ['Checklist de entrada', 'Laudo técnico', 'Execução aprovada', 'Teste final'], faq: commonFaq('manutenção de notebook'),
  },
  {
    slug: 'redes-wifi', name: 'Redes e Wi-Fi', eyebrow: 'Conectividade', category: 'infrastructure',
    summary: 'Cobertura, estabilidade e segurança para a rede da sua casa ou empresa.',
    description: 'Projeto baseado no espaço, número de usuários e aplicações críticas da operação.',
    price: 290, priceLabel: 'instalação a partir de', accent: '#16A36A', soft: '#E9F8F1',
    benefits: ['Análise de cobertura', 'Segmentação segura', 'Equipamentos adequados', 'Documentação da rede'],
    deliverables: ['Vistoria', 'Projeto', 'Instalação e configuração', 'Teste de cobertura'], faq: commonFaq('uma rede Wi-Fi'),
  },
  {
    slug: 'cabeamento', name: 'Cabeamento estruturado', eyebrow: 'Infraestrutura', category: 'infrastructure',
    summary: 'Infraestrutura organizada e certificada para dados, voz e equipamentos de rede.',
    description: 'Projeto e instalação com identificação dos pontos e documentação para manutenção futura.',
    priceLabel: 'sob vistoria', accent: '#16A36A', soft: '#E9F8F1',
    benefits: ['Pontos identificados', 'Rack organizado', 'Materiais adequados', 'Testes de conectividade'],
    deliverables: ['Vistoria técnica', 'Projeto e orçamento', 'Instalação', 'Mapa dos pontos'], faq: commonFaq('cabeamento estruturado'),
  },
  {
    slug: 'cameras-seguranca', name: 'Câmeras e segurança', eyebrow: 'Monitoramento', category: 'security',
    summary: 'Monitoramento com projeto de posicionamento, gravação e acesso controlado.',
    description: 'Soluções dimensionadas para o ambiente, com configuração segura e orientação de uso.',
    priceLabel: 'sob vistoria', accent: '#D6A84B', soft: '#FFF8E8',
    benefits: ['Projeto de cobertura', 'Acesso remoto seguro', 'Gravação dimensionada', 'Orientação de uso'],
    deliverables: ['Vistoria', 'Projeto e orçamento', 'Instalação', 'Configuração e treinamento'], faq: commonFaq('câmeras de segurança'),
  },
  {
    slug: 'backup', name: 'Backup empresarial', eyebrow: 'Continuidade', category: 'security',
    summary: 'Proteção automatizada para dados importantes, com retenção e restauração verificável.',
    description: 'Políticas de cópia adequadas ao risco, monitoramento das execuções e testes de recuperação.',
    price: 149, priceLabel: 'plano mensal a partir de', recurring: true, accent: '#D6A84B', soft: '#FFF8E8',
    benefits: ['Rotina automatizada', 'Criptografia', 'Retenção definida', 'Teste de restauração'],
    deliverables: ['Mapeamento dos dados', 'Política de backup', 'Implantação', 'Monitoramento recorrente'], faq: commonFaq('backup empresarial'),
  },
];

export const getService = (slug: string) => serviceCatalog.find((service) => service.slug === slug);
