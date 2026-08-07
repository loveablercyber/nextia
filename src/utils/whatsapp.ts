const WA_NUMBER = '5514996405496';

export const whatsappMessages = {
  geral: 'Olá! Acessei o site da Nextia e gostaria de solicitar mais informações sobre suas soluções em tecnologia.',
  sites: 'Olá! Acessei o site da Nextia e gostaria de solicitar um orçamento para criação de site / presença digital.',
  suporte: 'Olá! Acessei o site da Nextia e preciso de suporte técnico de TI para minha empresa / equipamento.',
  redes: 'Olá! Gostaria de solicitar uma avaliação técnica para a rede Wi-Fi / cabeamento da minha empresa.',
  cameras: 'Olá! Gostaria de solicitar um orçamento para instalação ou manutenção de câmeras de segurança.',
  automacao: 'Olá! Gostaria de entender como a Nextia pode automatizar processos da minha empresa com Chatbots e IA.',
  planoMensal: 'Olá! Gostaria de conhecer melhor os planos mensais do Nextia TechCare para minha empresa.',
  orcamento: 'Olá! Gostaria de agendar uma reunião / solicitar uma proposta comercial personalizada com a equipe da Nextia.'
};

export function getWhatsAppLink(type: keyof typeof whatsappMessages = 'geral', customMessage?: string): string {
  const message = customMessage || whatsappMessages[type] || whatsappMessages.geral;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WA_NUMBER}?text=${encoded}`;
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...params
    });
  }
}
